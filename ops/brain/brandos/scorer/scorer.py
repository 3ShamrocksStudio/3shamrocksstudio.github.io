#!/usr/bin/env python3
"""3S Brand OS - Brand QA scorer v0.1 (static analysis, stdlib only).

Usage: python3 scorer.py ASSET [--genome genome-3s.json] [--out report.json]
ASSET is .html/.htm/.svg/.txt/.md. Prints a JSON report. Exit 0 = at/above
threshold with no violations that force a send-back, 1 = goes back.
"""
import argparse, json, math, os, re, sys
from html.parser import HTMLParser

HERE = os.path.dirname(os.path.abspath(__file__))
NAMED = {"white": "#ffffff", "black": "#000000", "red": "#ff0000", "blue": "#0000ff",
         "green": "#008000", "yellow": "#ffff00", "orange": "#ffa500", "pink": "#ffc0cb",
         "purple": "#800080", "gray": "#808080", "grey": "#808080", "navy": "#000080",
         "lime": "#00ff00", "teal": "#008080", "maroon": "#800000", "cyan": "#00ffff",
         "magenta": "#ff00ff", "brown": "#a52a2a", "gold": "#ffd700"}
IGNORE_COLOURS = {"transparent", "currentcolor", "inherit", "initial", "none", "unset", "auto"}
BLOCK = {"p", "li", "h1", "h2", "h3", "h4", "h5", "h6", "div", "td", "th", "blockquote",
         "section", "article", "header", "footer", "figcaption", "dd", "dt", "button", "a"}
VOID = {"img", "br", "hr", "meta", "link", "input", "source", "area", "base", "col", "wbr", "path", "rect", "circle", "line", "stop", "image", "ellipse", "polygon", "polyline", "use"}

# ---------------------------------------------------------------- colour maths
def parse_colour(s):
    s = s.strip().lower()
    if s in IGNORE_COLOURS:
        return None
    if s in NAMED:
        s = NAMED[s]
    m = re.fullmatch(r"#([0-9a-f]{3,8})", s)
    if m:
        h = m.group(1)
        if len(h) in (3, 4):
            h = "".join(c * 2 for c in h[:3])
        elif len(h) in (6, 8):
            h = h[:6]
        else:
            return None
        return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
    m = re.fullmatch(r"rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)[^)]*\)", s)
    if m:
        return tuple(min(255, int(float(x))) for x in m.groups())
    return None

def hex_of(rgb):
    return "#%02x%02x%02x" % rgb

def rgb_to_lab(rgb):
    def lin(c):
        c /= 255.0
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (lin(c) for c in rgb)
    x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047
    y = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b
    z = (0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / 1.08883
    f = lambda t: t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    fx, fy, fz = f(x), f(y), f(z)
    return 116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)

def de2000(l1, l2):
    L1, a1, b1 = l1; L2, a2, b2 = l2
    C1, C2 = math.hypot(a1, b1), math.hypot(a2, b2)
    Cb = (C1 + C2) / 2
    G = 0.5 * (1 - math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)))
    a1p, a2p = (1 + G) * a1, (1 + G) * a2
    C1p, C2p = math.hypot(a1p, b1), math.hypot(a2p, b2)
    h = lambda b, a: 0 if (a == 0 and b == 0) else math.degrees(math.atan2(b, a)) % 360
    h1p, h2p = h(b1, a1p), h(b2, a2p)
    dLp, dCp = L2 - L1, C2p - C1p
    if C1p * C2p == 0: dhp = 0
    else:
        dhp = h2p - h1p
        if dhp > 180: dhp -= 360
        elif dhp < -180: dhp += 360
    dHp = 2 * math.sqrt(C1p * C2p) * math.sin(math.radians(dhp / 2))
    Lbp, Cbp = (L1 + L2) / 2, (C1p + C2p) / 2
    if C1p * C2p == 0: hbp = h1p + h2p
    elif abs(h1p - h2p) <= 180: hbp = (h1p + h2p) / 2
    elif h1p + h2p < 360: hbp = (h1p + h2p + 360) / 2
    else: hbp = (h1p + h2p - 360) / 2
    T = (1 - 0.17 * math.cos(math.radians(hbp - 30)) + 0.24 * math.cos(math.radians(2 * hbp))
         + 0.32 * math.cos(math.radians(3 * hbp + 6)) - 0.20 * math.cos(math.radians(4 * hbp - 63)))
    dth = 30 * math.exp(-(((hbp - 275) / 25) ** 2))
    Rc = 2 * math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7))
    Sl = 1 + 0.015 * (Lbp - 50) ** 2 / math.sqrt(20 + (Lbp - 50) ** 2)
    Sc, Sh = 1 + 0.045 * Cbp, 1 + 0.015 * Cbp * T
    Rt = -math.sin(math.radians(2 * dth)) * Rc
    return math.sqrt((dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh))

def luminance(rgb):
    def lin(c):
        c /= 255.0
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (lin(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def contrast(a, b):
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)

# --------------------------------------------------------------------- parsing
class Doc(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []          # (tag, attrs, blockid)
        self.styles = []         # css text from <style>
        self.style_attrs = []    # (tag, style string)
        self.attr_colours = []   # (attr, value) svg presentation attrs
        self.font_attrs = []     # font-family attribute values
        self.imgs = []           # (tag, attrs)
        self.links = []          # stylesheet hrefs
        self.texts = []          # (blockid, text, sourced)
        self.blocktext = {}
        self._bid = 0
        self._in = []            # raw-text containers

    def handle_starttag(self, tag, attrs):
        a = {k: (v if v is not None else "") for k, v in attrs}
        if tag in ("img", "image"):
            self.imgs.append((tag, a))
        if tag == "link" and a.get("href"):
            self.links.append(a["href"])
        if "style" in a:
            self.style_attrs.append((tag, a["style"]))
        for k in ("fill", "stroke", "stop-color", "color", "flood-color"):
            if k in a:
                self.attr_colours.append((k, a[k]))
        if "font-family" in a:
            self.font_attrs.append(a["font-family"])
        if tag in VOID:
            return
        bid = self.stack[-1][2] if self.stack else 0
        if tag in BLOCK:
            self._bid += 1
            bid = self._bid
        self.stack.append((tag, a, bid))
        if tag in ("style", "script"):
            self._in.append(tag)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID and self.stack and self.stack[-1][0] == tag:
            self.stack.pop()

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break
        if self._in and self._in[-1] == tag:
            self._in.pop()

    def handle_data(self, data):
        if self._in:
            if self._in[-1] == "style":
                self.styles.append(data)
            return
        if not data.strip():
            return
        bid = self.stack[-1][2] if self.stack else 0
        sourced = any("data-source" in a for _, a, _ in self.stack)
        self.texts.append((bid, data, sourced))
        self.blocktext.setdefault(bid, []).append(data)

# ---------------------------------------------------------------------- checks
def css_decls(css):
    """Yield (prop, value) pairs from css text (ignores selectors)."""
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    css = re.sub(r"url\([^)]*\)", "url()", css)
    for m in re.finditer(r"([\w-]+)\s*:\s*([^;{}]+)", css):
        yield m.group(1).strip().lower(), m.group(2).strip()

COLOUR_TOK = re.compile(r"#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\b(?:%s)\b" % "|".join(NAMED), re.I)

def colour_tokens(value):
    value = re.sub(r"var\([^)]*\)", "", value)
    return [m.group(0) for m in COLOUR_TOK.finditer(value)]

def snippet(text, m, w=40):
    s = max(0, m.start() - w); e = min(len(text), m.end() + w)
    return re.sub(r"\s+", " ", text[s:e]).strip()

def run(path, genome):
    ext = os.path.splitext(path)[1].lower()
    raw = open(path, encoding="utf-8", errors="replace").read()
    is_markup = ext in (".html", ".htm", ".svg")
    doc = Doc()
    if is_markup:
        doc.feed(raw)
        paras = {}
        for bid, t, src in doc.texts:
            paras[bid] = paras.get(bid, "")
        blocks = [(bid, t, src) for bid, t, src in doc.texts]
        blocktext = {b: " ".join(v) for b, v in doc.blocktext.items()}
    else:
        blocks, blocktext = [], {}
        for i, para in enumerate(re.split(r"\n\s*\n", raw), 1):
            blocks.append((i, para, False)); blocktext[i] = para

    V = []  # violations
    def add(check, rule, found, reason, fix):
        V.append({"check": check, "rule": rule, "found": found, "reason": reason, "fix": fix})

    # ---- colour
    pal = [(p["name"], p["hex"], rgb_to_lab(parse_colour(p["hex"]))) for p in genome["palette"]]
    pal += [("neutral", n["hex"], rgb_to_lab(parse_colour(n["hex"]))) for n in genome.get("neutral_allowances", [])]
    tol = genome["color_tolerance"]["max_delta_e"]
    seen = {}
    def consider(tok):
        rgb = parse_colour(tok)
        if rgb is None or rgb in seen:
            return
        lab = rgb_to_lab(rgb)
        best = min(((de2000(lab, pl), n, h) for n, h, pl in pal), key=lambda x: x[0])
        seen[rgb] = best
    if is_markup:
        css_values = []
        for css in doc.styles:
            css_values += [v for _, v in css_decls(css)]
        for _, s in doc.style_attrs:
            css_values += [v for _, v in css_decls(s)]
        css_values += [v for _, v in doc.attr_colours]
        for v in css_values:
            for tok in colour_tokens(v):
                consider(tok)
    else:
        for m in re.finditer(r"#[0-9a-fA-F]{6}\b", raw):
            consider(m.group(0))
    for rgb, (d, n, h) in seen.items():
        if d > tol:
            add("colour", "off-palette", hex_of(rgb),
                "%s is dE2000 %.1f from the nearest palette colour (%s %s); limit is %.1f." % (hex_of(rgb), d, n, h, tol),
                "Replace with %s (%s) or another palette token." % (h, n))

    # ---- fonts
    allowed = {f.lower() for f in genome["fonts"]["allowed"]}
    generic = {g.lower() for g in genome["fonts"]["generic_allowed"]}
    fam_values = []
    if is_markup:
        for css in doc.styles:
            fam_values += [v for p, v in css_decls(css) if p == "font-family"]
        for _, s in doc.style_attrs:
            fam_values += [v for p, v in css_decls(s) if p == "font-family"]
        fam_values += doc.font_attrs
        for href in doc.links:
            for fam in re.findall(r"family=([^&:]+)", href):
                allowed_hit = fam.replace("+", " ")
                if allowed_hit.lower() not in allowed:
                    add("font", "non-brand-font", allowed_hit, "Font '%s' is loaded but is not in the brand font set." % allowed_hit,
                        "Use one of: " + ", ".join(genome["fonts"]["allowed"]) + ".")
    else:
        for m in re.finditer(r"font-family\s*:\s*([^;\n]+)", raw, re.I):
            fam_values.append(m.group(1))
    badfonts = set()
    for v in fam_values:
        if v.lower().startswith("var("):
            continue
        for fam in re.split(r",", re.sub(r"!important", "", v, flags=re.I)):
            fam = fam.strip().strip("'\"").strip()
            if not fam or fam.lower() in generic or fam.lower().startswith("var("):
                continue
            if fam.lower() not in allowed:
                badfonts.add(fam)
    for f in sorted(badfonts):
        add("font", "non-brand-font", f, "Font '%s' is not in the brand font set." % f,
            "Use one of: " + ", ".join(genome["fonts"]["allowed"]) + ".")

    # ---- contrast (inline styles and single rules with both colours)
    cmin, cl, lpx = genome["contrast"]["min_ratio_body"], genome["contrast"]["min_ratio_large"], genome["contrast"]["large_text_px"]
    pairs = []
    if is_markup:
        for _, s in doc.style_attrs:
            pairs.append(("inline style", s))
        for css in doc.styles:
            c2 = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
            for m in re.finditer(r"([^{}]+)\{([^{}]*)\}", c2):
                pairs.append((m.group(1).strip()[:50], m.group(2)))
    for where, s in pairs:
        d = dict(css_decls(s))
        fg = parse_colour(d.get("color", "")) if d.get("color") else None
        bgv = d.get("background-color") or d.get("background") or ""
        bgt = colour_tokens(bgv)
        bg = parse_colour(bgt[0]) if len(bgt) == 1 and "gradient" not in bgv else None
        if fg and bg:
            ratio = contrast(fg, bg)
            fs = re.match(r"([\d.]+)px", d.get("font-size", ""))
            need = cl if (fs and float(fs.group(1)) >= lpx) else cmin
            if ratio < need:
                add("contrast", "wcag-aa", "%s on %s" % (hex_of(fg), hex_of(bg)),
                    "Contrast %.2f:1 in %s is below the %.1f:1 minimum." % (ratio, where, need),
                    "Use ink %s on dark surfaces, or darken the background." % "#f6f4ff")

    # ---- voice
    v = genome["voice"]
    pron = re.compile(r"\b(%s)\b" % "|".join(re.escape(p).replace("\\'", "['’]") for p in v["banned_pronouns"]), re.I)
    banned = re.compile(r"\b(%s)\b" % "|".join(re.escape(w).replace("\\-", "[- ]?") for w in v["banned_words"]), re.I)
    urg = re.compile("|".join(v["fake_urgency_patterns"]), re.I)
    for bid, text, _ in blocks:
        for m in pron.finditer(text):
            if m.group(0) == "US":
                continue
            add("voice", "first-person-plural", m.group(0), "Plural voice '%s': %s" % (m.group(0), snippet(text, m)),
                "Rewrite in first person singular ('I').")
        for m in banned.finditer(text):
            add("voice", "banned-word", m.group(0), "Banned hype word '%s': %s" % (m.group(0), snippet(text, m)),
                "Delete it and state the concrete fact instead.")
        for m in urg.finditer(text):
            add("voice", "fake-urgency", m.group(0), "Fake urgency '%s': %s" % (m.group(0), snippet(text, m)),
                "Remove it; state the real deadline with its date or say nothing.")

    # ---- claims
    claim_res = [
        (re.compile(r"\d[\d,.]*\s*%"), "percentage"),
        (re.compile(r"\b\d+(\.\d+)?\s*[x×](?![\w])(?!\s*\d)", re.I), "multiplier"),
        (re.compile(r"(?<!\w)#\s?1\b|\bno\.?\s?1\b", re.I), "ranking"),
        (re.compile(r"\bTIME\b"), "award/press"),
        (re.compile(r"\b(doubled|tripled|quadrupled|halved)\b", re.I), "change claim"),
        (re.compile(r"\b(award-winning|market[- ]leading|industry[- ]leading)\b", re.I), "superlative"),
        (re.compile(r"\b\d[\d,]*\+?\s+(customers|users|clients|companies|startups|brands|downloads)\b", re.I), "count"),
    ]
    marker = re.compile(r"\[source:\s*\S", re.I)
    for bid, text, sourced in blocks:
        if sourced or marker.search(blocktext.get(bid, text)):
            continue
        for rx, kind in claim_res:
            for m in rx.finditer(text):
                add("claims", "unsourced-claim", m.group(0).strip(), "Unsourced %s claim '%s': %s" % (kind, m.group(0).strip(), snippet(text, m)),
                    "Add a data-source attribute or a [source: ...] tag in the same block, or remove the claim.")

    # ---- logo
    lg = genome["logo"]
    approved_f = [a.lower() for a in lg["approved_files"]]
    approved_d = [a.lower() for a in lg["approved_dirs"]]
    for tag, a in doc.imgs:
        src = a.get("src") or a.get("href") or a.get("xlink:href") or ""
        alt = a.get("alt")
        if not (re.search(r"logo|3shamrocks|/marks/|wordmark", src, re.I) or (alt and re.search(r"logo|3shamrocks", alt, re.I))):
            continue
        norm = re.sub(r"^(\.\./|\./|/)+", "", src.split("?")[0]).lower()
        ok = any(norm.endswith(f) for f in approved_f) or any(d in norm for d in approved_d)
        if not ok:
            add("logo", "unapproved-logo-file", src, "Logo file '%s' is not an approved logo." % src,
                "Use " + " or ".join(lg["approved_files"]) + ".")
        if lg.get("alt_required") and not (alt and alt.strip()):
            add("logo", "logo-missing-alt", src, "Logo image '%s' has no alt text." % src,
                "Add alt=\"3Shamrocks Studio\".")
    return V

# --------------------------------------------------------------------- scoring
CHECKS = ["colour", "font", "contrast", "voice", "claims", "logo"]

def score(asset, genome_path):
    genome = json.load(open(genome_path))
    V = run(asset, genome)
    sc = genome["scoring"]
    total, checks = 0, {}
    for c in CHECKS:
        n = sum(1 for v in V if v["check"] == c)
        cfg = sc["checks"][c]
        pen = min(cfg["cap"], n * cfg["penalty_per_violation"])
        total += pen
        checks[c] = {"status": "pass" if n == 0 else "fail", "violations": n, "penalty": pen}
    s = max(0, 100 - total)
    th = sc["pass_threshold"]
    return {"asset": asset, "genome": genome["brand"], "score": s, "threshold": th,
            "verdict": "PASS" if s >= th else "SEND BACK", "checks": checks, "violations": V}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("asset")
    ap.add_argument("--genome", default=os.path.join(HERE, "genome-3s.json"))
    ap.add_argument("--out")
    a = ap.parse_args()
    rep = score(a.asset, a.genome)
    out = json.dumps(rep, indent=2, ensure_ascii=False)
    if a.out:
        open(a.out, "w").write(out + "\n")
    print(out)
    sys.exit(0 if rep["verdict"] == "PASS" else 1)

if __name__ == "__main__":
    main()
