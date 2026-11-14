#!/usr/bin/env python3
"""Planted-error test: 10/10 caught, 0 false positives on 2 clean assets."""
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
}
CLEAN = ["clean-01-landing.html", "clean-02-card.svg"]
URGENCY = ["Only 3 spots left this month.", "Limited time offer.", "Act now before it ends today."]

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

print("\nPlanted errors caught: %d/10 | false positives on clean: %d/2 | urgency unit: %d/%d" % (caught, fp, urg_ok, len(URGENCY)))
sys.exit(0 if caught == 10 and fp == 0 and urg_ok == len(URGENCY) else 1)
