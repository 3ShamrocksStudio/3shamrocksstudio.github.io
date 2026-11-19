#!/usr/bin/env python3
"""Planted-error test: 16/16 caught (6 Hebrew), 0 false positives on 5 clean assets (3 Hebrew)."""
import os, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, ROOT)
import scorer

G = os.path.join(ROOT, "genome-3s.json")
FX = os.path.join(HERE, "fixtures")
PLANTED = {  # fixture -> (expected check, expected rule)
    "planted-01-colour-orange.html": ("colour", "off-palette"),
    "planted-02-colour-svg-red.svg": ("colour", "off-palette"),
    "planted-03-font-comic.html": ("font", "non-brand-font"),
    "planted-04-contrast-low.html": ("contrast", "wcag-aa"),
    "planted-05-voice-we.md": ("voice", "first-person-plural"),
    "planted-06-voice-banned.txt": ("voice", "banned-word"),
    "planted-07-claim-percent.html": ("claims", "unsourced-claim"),
    "planted-08-claim-doubled.md": ("claims", "unsourced-claim"),
    "planted-09-logo-no-alt.html": ("logo", "logo-missing-alt"),
    "planted-10-logo-unapproved.html": ("logo", "unapproved-logo-file"),
    "planted-11-voice-we-he.md": ("voice", "first-person-plural"),      # v0.4 Hebrew voice
    "planted-12-voice-banned-he.txt": ("voice", "banned-word"),
    "planted-13-claim-superlative-he.md": ("claims", "unsourced-claim"),  # v0.5 Hebrew claims
    "planted-14-claim-ranking-he.txt": ("claims", "unsourced-claim"),
    "planted-15-claim-riskfree-he.html": ("claims", "unsourced-claim"),
    "planted-16-claim-count-he.md": ("claims", "unsourced-claim"),
}
CLEAN = ["clean-01-landing.html", "clean-02-card.svg", "clean-03-he.md", "clean-04-claims-he.md", "clean-05-claim-sourced-he.html"]
URGENCY = ["Only 3 spots left this month.", "Limited time offer.", "Act now before it ends today.",
           "נותרו רק 3 מקומות החודש.", "מבצע לזמן מוגבל.", "אל תפספסו, ההרשמה נסגרת הלילה."]
HE_PREFIX = ["והצוות שלנו בודק כל נכס.", "כתבו אלינו מחר.", "ההצעה המהפכנית הזאת."]

caught = fp = 0
print("%-34s %-9s %-6s %s" % ("FIXTURE", "EXPECTED", "SCORE", "RESULT"))
for name, (chk, rule) in PLANTED.items():
    r = scorer.score(os.path.join(FX, name), G)
    hit = [v for v in r["violations"] if v["check"] == chk and v["rule"] == rule]
    others = [v for v in r["violations"] if v["check"] != chk]
    ok = bool(hit) and r["score"] < r["threshold"] and r["verdict"] == "SEND BACK" and not others
    caught += ok
    print("%-34s %-9s %-6s %s%s" % (name, chk, r["score"], "CAUGHT" if ok else "MISSED",
          "" if not others else "  (unexpected extra: %s)" % [v["check"] for v in others]))
print()
for name in CLEAN:
    r = scorer.score(os.path.join(FX, name), G)
    ok = r["score"] >= r["threshold"] and not r["violations"]
    fp += (not ok)
    print("%-34s %-9s %-6s %s" % (name, "clean", r["score"], "CLEAN" if ok else "FALSE POSITIVE %s" % r["violations"]))

# extra unit cases: fake urgency, and sourced claims must NOT be flagged
print()
urg_ok = 0
for s in URGENCY:
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as f:
        f.write(s)
    r = scorer.score(f.name, G); os.unlink(f.name)
    good = any(v["rule"] == "fake-urgency" for v in r["violations"]) and r["verdict"] == "SEND BACK"
    urg_ok += good
    print("urgency unit  %-34r %s" % (s, "CAUGHT" if good else "MISSED"))

# v0.3 product-brand scope: a tile in its own product brand is not judged by the studio genome,
# but studio chrome next to it still is, and data-brand="studio" is not scoped out.
print()
scope_ok = 0
r = scorer.score(os.path.join(FX, "scope-01-portfolio-tile.html"), G)
good = not r["violations"] and r["verdict"] == "PASS" and r.get("scoped_out", {}).get("images") == 1 \
    and r["scoped_out"].get("css_rules") == 2 and r["scoped_out"].get("font_links") == 1
scope_ok += good
print("scope unit    %-34s %s" % ("tile scoped out, studio judged", "OK" if good else "WRONG %s %s" % (r["violations"], r.get("scoped_out"))))
r = scorer.score(os.path.join(FX, "scope-02-leak-outside.html"), G)
hit = [v for v in r["violations"] if v["check"] == "colour" and v["found"] == "#ff7a00"]
good = len(r["violations"]) == 1 and len(hit) == 1 and r["verdict"] == "SEND BACK"
scope_ok += good
print("scope unit    %-34s %s" % ("leak outside the tile caught", "OK" if good else "WRONG %s" % r["violations"]))
r = scorer.score(os.path.join(FX, "scope-01-portfolio-tile.html"), G, ["#nothing-matches"])
r2 = scorer.score(os.path.join(FX, "planted-01-colour-orange.html"), G, ["div"])
good = r2.get("scoped_out") is not None and r2["verdict"] == "PASS" and not r["violations"]
scope_ok += good
print("scope unit    %-34s %s" % ("--product-region selector", "OK" if good else "WRONG %s" % r2))

# v0.4 Hebrew: pronouns and hype words with glued prefixes (ו ש ה ...) are caught
print()
he_ok = 0
for s in HE_PREFIX:
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
        f.write(s)
    r = scorer.score(f.name, G); os.unlink(f.name)
    good = len(r["violations"]) == 1 and r["violations"][0]["check"] == "voice" and r["verdict"] == "SEND BACK"
    he_ok += good
    print("hebrew unit   %-34s %s" % (s, "CAUGHT" if good else "WRONG %s" % r["violations"]))

# v0.5 Hebrew claims: each phrase caught, near-misses and sourced claims not flagged, ledger banned claims with negation
print()
HC_HIT = ["התוצאה הכי טובה בשוק.", "אני מספר 1 בתחום.", "אני מספר אחת.", "השירות ללא סיכון.", "החברה מובילה בתחום העיצוב.",
          "זוכת פרסים בינלאומיים.", "אני נותן ערבות להצלחה.", "המכירות שילשו את עצמן."]
HC_MISS = ["מספר 10 בשורה.", "אני מוביל סדנה ביום ראשון.", "הכי קרוב לתחנה.", "הסיכון נבדק מראש.", "פיתוח פי הגדרה."]
hc_ok = 0
for s in HC_HIT + HC_MISS:
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
        f.write(s)
    r = scorer.score(f.name, G); os.unlink(f.name)
    n = sum(1 for v in r["violations"] if v["rule"] == "unsourced-claim")
    good = (n >= 1) if s in HC_HIT else (n == 0)
    hc_ok += good
    print("hebrew claim  %-34s %s" % (s, ("CAUGHT" if s in HC_HIT else "CLEAN") if good else "WRONG %s" % r["violations"]))
import json, shutil
with tempfile.TemporaryDirectory() as td:
    g = json.load(open(G, encoding="utf-8"))
    g["claims"]["ledger"] = "claims-ledger.md"
    open(os.path.join(td, "g.json"), "w", encoding="utf-8").write(json.dumps(g, ensure_ascii=False))
    shutil.copy(os.path.join(ROOT, "..", "demo", "claims-ledger.md"), td)
    for s, want in [("המוצר מרפא חרדה.", 1), ("המוצר לא מרפא ולא מאבחן.", 0)]:
        p = os.path.join(td, "a.txt"); open(p, "w", encoding="utf-8").write(s)
        r = scorer.score(p, os.path.join(td, "g.json"))
        n = sum(1 for v in r["violations"] if v["rule"] == "banned-claim")
        good = n == want
        hc_ok += good
        print("hebrew ledger %-34s %s" % (s, "OK" if good else "WRONG %s" % r["violations"]))
HC_N = len(HC_HIT) + len(HC_MISS) + 2

print("\nPlanted errors caught: %d/%d | false positives on clean: %d/%d | urgency unit: %d/%d | scope unit: %d/3 | hebrew unit: %d/%d | hebrew claims unit: %d/%d"
      % (caught, len(PLANTED), fp, len(CLEAN), urg_ok, len(URGENCY), scope_ok, he_ok, len(HE_PREFIX), hc_ok, HC_N))
sys.exit(0 if caught == len(PLANTED) and fp == 0 and urg_ok == len(URGENCY) and scope_ok == 3 and he_ok == len(HE_PREFIX) and hc_ok == HC_N else 1)
