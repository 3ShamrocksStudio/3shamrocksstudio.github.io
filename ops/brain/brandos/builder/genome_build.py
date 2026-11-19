#!/usr/bin/env python3
"""Brand OS genome builder (P2 MVP). Stdlib only, no network.

Reads local HTML/CSS files and writes a DRAFT brand genome JSON in the schema
scorer/scorer.py accepts. Extraction is deterministic. Anything that cannot be
read from code (voice, claims, approved logo list, contrast policy, ...) stays
empty or default and is listed in `needs_review`. Nothing is invented.

  python3 genome_build.py FILE [FILE...] --brand "Name" --out draft.json
"""
import argparse, collections, colorsys, json, os, re, sys, urllib.parse

GENERIC = ["system-ui", "sans-serif", "serif", "monospace", "inherit", "initial"]
GENERIC_ALL = set(GENERIC) | {"cursive", "fantasy", "ui-sans-serif", "ui-serif", "ui-monospace",
                              "ui-rounded", "-apple-system", "blinkmacsystemfont", "unset", "revert", "math", "emoji"}
HEX_RE = re.compile(r"(?<![\w&])#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![\w-])")
RGB_RE = re.compile(r"rgba?\(\s*([\d.]+%?)[\s,]+([\d.]+%?)[\s,]+([\d.]+%?)(?:\s*[,/]\s*([\d.]+%?))?\s*\)", re.I)
HSL_RE = re.compile(r"hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%(?:\s*[,/]\s*([\d.]+%?))?\s*\)", re.I)
DECL_RE = re.compile(r"(--[\w-]+|[a-zA-Z-]+)\s*:\s*([^;{}]+)")
STYLE_RE = re.compile(r"<style\b[^>]*>(.*?)</style>", re.S | re.I)


def find_root(path):
    d = os.path.dirname(os.path.abspath(path))
    while True:
        if os.path.exists(os.path.join(d, ".git")):
            return d
        p = os.path.dirname(d)
        if p == d:
            return os.getcwd()
        d = p


def rel(path):
    return os.path.relpath(os.path.abspath(path), find_root(path)).replace(os.sep, "/")


def line_of(text, pos):
    return text.count("\n", 0, pos) + 1


def to_hex(r, g, b):
    return "#%02x%02x%02x" % tuple(max(0, min(255, int(round(v)))) for v in (r, g, b))


def parse_colours(value):
    """Yield (match_start, hex6, alpha) for each literal colour in a CSS value."""
    out = []
    for m in HEX_RE.finditer(value):
        h = m.group(1).lower()
        a = 1.0
        if len(h) in (3, 4):
            h = "".join(c * 2 for c in h)
        if len(h) == 8:
            a = int(h[6:], 16) / 255.0
            h = h[:6]
        out.append((m.start(), "#" + h, a))
    for m in RGB_RE.finditer(value):
        def ch(s):
            return float(s[:-1]) * 2.55 if s.endswith("%") else float(s)
        a = m.group(4)
        a = 1.0 if a is None else (float(a[:-1]) / 100 if a.endswith("%") else float(a))
        out.append((m.start(), to_hex(ch(m.group(1)), ch(m.group(2)), ch(m.group(3))), a))
    for m in HSL_RE.finditer(value):
        h, s, l = float(m.group(1)) / 360 % 1, float(m.group(2)) / 100, float(m.group(3)) / 100
        r, g, b = colorsys.hls_to_rgb(h, l, s)
        a = m.group(4)
        a = 1.0 if a is None else (float(a[:-1]) / 100 if a.endswith("%") else float(a))
        out.append((m.start(), to_hex(r * 255, g * 255, b * 255), a))
    return out


def css_regions(text, is_css):
    """(offset, css text) pieces: whole file for .css, <style> blocks for html."""
    if is_css:
        return [(0, text)]
    return [(m.start(1), m.group(1)) for m in STYLE_RE.finditer(text)]


def split_stack(value):
    fams = []
    for part in re.split(r",", value):
        p = re.sub(r"!\s*important\s*$", "", part.strip()).strip()
        if not p or p.startswith("var(") or p.startswith("env("):
            continue
        p = p.strip("'\"").strip()
        if p:
            fams.append(p)
    return fams


class Extract:
    def __init__(self):
        self.tokens = []          # (name, value, hex, alpha, src)
        self.lits = collections.OrderedDict()   # hex -> {count, alpha_only, sources}
        self.var_refs = collections.Counter()
        self.fonts = collections.OrderedDict()  # family -> {count, sources, via}
        self.font_tokens = {}     # token -> first family
        self.generics = set()
        self.radii = collections.OrderedDict()
        self.logos = []
        self.langs = collections.OrderedDict()
        self.dirs = collections.OrderedDict()
        self.brands = collections.OrderedDict()
        self.files = []

    def add_lit(self, hexv, alpha, src, as_token=False):
        d = self.lits.setdefault(hexv, {"count": 0, "opaque": 0, "sources": []})
        d["count"] += 1
        if alpha >= 0.999:
            d["opaque"] += 1
        if src not in d["sources"]:
            d["sources"].append(src)

    def add_font(self, fam, src, via):
        low = fam.lower()
        if low in GENERIC_ALL:
            self.generics.add(low)
            return
        d = self.fonts.setdefault(fam, {"count": 0, "sources": [], "via": []})
        d["count"] += 1
        if src not in d["sources"]:
            d["sources"].append(src)
        if via not in d["via"]:
            d["via"].append(via)

    def file(self, path):
        name = rel(path)
        self.files.append(name)
        with open(path, encoding="utf-8", errors="replace") as fh:
            text = fh.read()
        is_css = path.lower().endswith(".css")
        for off, css in css_regions(text, is_css):
            self.css(css, off, text, name)
        if not is_css:
            self.markup(text, name)

    def css(self, css, off, full, name):
        css = re.sub(r"/\*.*?\*/", lambda m: re.sub(r"[^\n]", " ", m.group(0)), css, flags=re.S)
        for m in DECL_RE.finditer(css):
            prop, val = m.group(1), m.group(2)
            src = "%s:%d" % (name, line_of(full, off + m.start()))
            for tok in re.findall(r"var\(\s*(--[\w-]+)", val):
                self.var_refs[tok] += 1
            if prop.startswith("--"):
                cols = parse_colours(val)
                if cols and not re.search(r"font|radius|rad\b", prop):
                    _, hx, a = cols[0]
                    self.tokens.append((prop, val.strip(), hx, a, src, len(cols)))
                if re.search(r"font", prop):
                    fams = split_stack(val)
                    for f in fams:
                        self.add_font(f, src, prop)
                    real = [f for f in fams if f.lower() not in GENERIC_ALL]
                    if real and prop not in self.font_tokens:
                        self.font_tokens[prop] = real[0]
                if re.search(r"rad", prop):
                    self.radii.setdefault(val.strip(), {"count": 0, "sources": []})
                    self.radii[val.strip()]["count"] += 1
                    self.radii[val.strip()]["sources"].append(src)
            for _, hx, a in parse_colours(val):
                self.add_lit(hx, a, src)
            if prop == "font-family":
                for f in split_stack(val):
                    self.add_font(f, src, "font-family")
            elif prop == "font":
                for f in re.findall(r"""['"]([^'"]+)['"]""", val):
                    self.add_font(f, src, "font")
            elif prop.startswith("border") and prop.endswith("radius"):
                v = val.strip()
                if not v.startswith("var("):
                    self.radii.setdefault(v, {"count": 0, "sources": []})
                    self.radii[v]["count"] += 1
                    self.radii[v]["sources"].append(src)
                else:
                    self.radii.setdefault(v, {"count": 0, "sources": []})
                    self.radii[v]["count"] += 1
                    self.radii[v]["sources"].append(src)

    def markup(self, text, name):
        L = lambda pos: "%s:%d" % (name, line_of(text, pos))
        for m in re.finditer(r"""\bstyle\s*=\s*("([^"]*)"|'([^']*)')""", text):
            body = m.group(2) if m.group(2) is not None else m.group(3)
            self.css(body.replace("&quot;", '"'), m.start(1), text, name)
        for m in re.finditer(r"""\b(?:fill|stroke|stop-color|color)\s*=\s*["']([^"']+)["']""", text):
            for _, hx, a in parse_colours(m.group(1)):
                self.add_lit(hx, a, L(m.start(1)))
        for m in re.finditer(r"<link\b[^>]*>", text, re.I):
            hm = re.search(r"""href\s*=\s*["']([^"']+)["']""", m.group(0), re.I)
            if hm and "fonts.googleapis.com/css" in hm.group(1):
                q = urllib.parse.urlsplit(hm.group(1).replace("&amp;", "&")).query
                for k, v in urllib.parse.parse_qsl(q, keep_blank_values=True):
                    if k == "family":
                        self.add_font(v.split(":")[0].replace("+", " "), L(m.start()), "google-fonts")
        for m in re.finditer(r"<html\b[^>]*>", text, re.I):
            for k, store in (("lang", self.langs), ("dir", self.dirs)):
                am = re.search(r"""\b%s\s*=\s*["']([^"']*)["']""" % k, m.group(0), re.I)
                if am:
                    store.setdefault(am.group(1), []).append(L(m.start()))
        for m in re.finditer(r"""\bdata-brand\s*=\s*["']([^"']*)["']""", text):
            self.brands.setdefault(m.group(1), []).append(L(m.start()))
        for m in re.finditer(r"<img\b[^>]*>|<image\b[^>]*>|<svg\b[^>]*>", text, re.I):
            tag = m.group(0)
            attrs = dict((k.lower(), v if v is not None else "") for k, v in
                         re.findall(r"""([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')""", tag) and
                         [(a, b or c) for a, b, c in re.findall(r"""([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')""", tag)])
            src = attrs.get("src") or attrs.get("href") or attrs.get("xlink:href") or ""
            alt = attrs.get("alt")
            ctx = text[max(0, m.start() - 160):m.start()]
            in_logo = bool(re.search(r"""class\s*=\s*["'][^"']*logo[^"']*["'][^<]*$""", ctx, re.I | re.S)) or \
                bool(re.search(r"logo|wordmark|brand", src + " " + (alt or "") + " " + attrs.get("class", "") + " " + attrs.get("id", ""), re.I))
            if tag.lower().startswith("<svg"):
                if re.search(r"logo|wordmark", tag, re.I) or in_logo:
                    self.logos.append({"kind": "svg", "src": "", "alt": attrs.get("aria-label") or attrs.get("title"), "source": L(m.start())})
            elif in_logo and src:
                self.logos.append({"kind": "img", "src": src, "alt": alt, "source": L(m.start())})


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def build(files, brand):
    ex = Extract()
    for f in files:
        ex.file(f)
    review = []

    # palette: opaque colours declared as custom properties (the brand's own tokens)
    palette, seen, alpha_tokens = [], {}, []
    for name, val, hx, a, src, ncols in ex.tokens:
        n = name[2:]
        if a < 0.999:
            alpha_tokens.append({"token": name, "value": val, "hex": hx, "alpha": round(a, 3), "sources": [src]})
            continue
        if hx in seen:
            e = seen[hx]
            if src not in e["sources"]:
                e["sources"].append(src)
            e.setdefault("aliases", []).append(n)
            continue
        e = {"name": n, "hex": hx, "role": "UNSET: declared as %s, role needs a human" % name,
             "usage_count": 0, "sources": [src]}
        seen[hx] = e
        palette.append(e)
    for e in palette:
        e["usage_count"] = ex.lits[e["hex"]]["count"] + sum(ex.var_refs[("--" + n)] for n in [e["name"]] + e.get("aliases", []))
    cands = []
    for hx, d in ex.lits.items():
        if hx not in seen:
            cands.append({"hex": hx, "count": d["count"], "opaque_count": d["opaque"], "sources": d["sources"][:6]})
    cands.sort(key=lambda c: -c["count"])

    # fonts
    fam = sorted(ex.fonts.items(), key=lambda kv: -kv[1]["count"])
    allowed = [f for f, _ in fam]
    src_all = []
    for f, d in fam:
        for s in d["sources"]:
            if s not in src_all:
                src_all.append(s)
    roles = {}
    for tok, f in ex.font_tokens.items():
        if re.search(r"(^--font-d|display|head|title)", tok):
            roles.setdefault("display", f)
        elif re.search(r"(^--font-b|body|text|sans)", tok):
            roles.setdefault("body", f)

    # logo
    logos = ex.logos
    approved = []
    for l in logos:
        if l["src"]:
            n = re.sub(r"^(\.\./|\./|/)+", "", l["src"].split("?")[0])
            if n not in approved:
                approved.append(n)
    alt = next((l["alt"] for l in logos if l["alt"]), None)

    genome = {
        "draft": True,
        "brand": brand,
        "version": "0.0.1-draft",
        "derived": "Draft built by genome_build.py from: " + ", ".join(ex.files) + ". Deterministic extraction only; a human must review every item in needs_review before use.",
        "palette": palette,
        "palette_candidates": cands,
        "palette_alpha_tokens": alpha_tokens,
        "neutral_allowances": [],
        "color_tolerance": {"metric": "CIEDE2000", "max_delta_e": 6.0,
                            "note": "Scorer default, not extracted from the brand files."},
        "fonts": {
            "allowed": allowed,
            "generic_allowed": sorted(set(GENERIC) | ex.generics),
            "roles": roles,
            "usage": {f: d["count"] for f, d in fam},
            "sources": src_all,
        },
        "radii": [{"value": v, "count": d["count"], "sources": d["sources"][:4]} for v, d in
                  sorted(ex.radii.items(), key=lambda kv: -kv[1]["count"])],
        "locale": {"lang": {k: v for k, v in ex.langs.items()}, "dir": {k: v for k, v in ex.dirs.items()}},
        "contrast": {"min_ratio_body": 4.5, "min_ratio_large": 3.0, "large_text_px": 24,
                     "fix_hint": "", "sources": ["WCAG 2.x AA defaults, not extracted from the brand files"]},
        "voice": {"person": "", "banned_pronouns": [], "banned_words": [], "fake_urgency_patterns": [],
                  "sources": []},
        "claims": {"rule": "", "source_markers": [], "sources": []},
        "logo": {"approved_files": approved, "approved_dirs": [], "alt_required": True,
                 "alt_text": alt or "", "detect_src": "logo|wordmark", "detect_alt": "logo",
                 "detected": logos, "sources": [l["source"] for l in logos]},
        "scope": {"product_attr": "data-brand", "own_brand_ids": [], "product_regions": [],
                  "seen_data_brand": {k: v for k, v in ex.brands.items()}, "sources": []},
        "scoring": {"pass_threshold": 85, "checks": {
            "colour": {"penalty_per_violation": 16, "cap": 32},
            "font": {"penalty_per_violation": 18, "cap": 30},
            "contrast": {"penalty_per_violation": 16, "cap": 32},
            "voice": {"penalty_per_violation": 16, "cap": 30},
            "claims": {"penalty_per_violation": 16, "cap": 30},
            "logo": {"penalty_per_violation": 18, "cap": 30}}},
    }
    review.append("voice: person, banned pronouns, banned words and fake-urgency patterns cannot be read from code. Left empty. A human writes them.")
    review.append("claims: claim rules and any approved-claims ledger cannot be read from code. Left empty. Never invented.")
    review.append("palette roles: names come from token names; roles are UNSET and need a human.")
    if cands:
        review.append("palette_candidates: %d literal colours used in the files but not declared as an opaque token; a human decides which belong in the palette or neutral_allowances." % len(cands))
    if alpha_tokens:
        review.append("palette_alpha_tokens: %d tokens carry alpha (e.g. %s); scorer ignores alpha, so decide whether their RGB belongs in the palette." % (len(alpha_tokens), alpha_tokens[0]["token"]))
    review.append("neutral_allowances: empty; confirm whether pure white/black fills are allowed.")
    review.append("fonts.allowed: every non-generic family seen in the files; confirm each is an approved brand font and fix roles (hebrew/display/body) .")
    review.append("fonts.roles: only inferred from font custom-property names (%s); verify." % (", ".join(sorted(ex.font_tokens)) or "none found"))
    review.append("contrast: WCAG AA defaults; fix_hint empty.")
    review.append("color_tolerance and scoring: scorer defaults, not brand data.")
    if not logos:
        review.append("logo: no logo image/svg detected in the files.")
    else:
        review.append("logo: approved_files lists only the %d logo source(s) found in the files; real approved list, clear-space and recolour rules need a human." % len(approved))
    review.append("scope.own_brand_ids empty%s; list this brand's ids so its own data-brand markup is judged." %
                  ("; data-brand values seen: " + ", ".join(ex.brands) if ex.brands else ""))
    genome["needs_review"] = review
    return genome


def main(argv=None):
    ap = argparse.ArgumentParser(description="Build a DRAFT brand genome from local HTML/CSS files.")
    ap.add_argument("files", nargs="+")
    ap.add_argument("--brand", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args(argv)
    g = build(a.files, a.brand)
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    with open(a.out, "w", encoding="utf-8") as f:
        json.dump(g, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print("wrote %s: %d palette, %d candidates, %d fonts, %d logo(s)" %
          (a.out, len(g["palette"]), len(g["palette_candidates"]), len(g["fonts"]["allowed"]), len(g["logo"]["detected"])))
    return 0


if __name__ == "__main__":
    sys.exit(main())
