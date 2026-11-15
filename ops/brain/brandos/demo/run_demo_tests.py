#!/usr/bin/env python3
"""Demo planted-error test on the FICTIONAL Plinkettle Health genome.
Fictional demo brand, not a real company.

Asserts: each planted fixture fails with exactly its expected check (and is
sent back), each clean fixture scores 100 with no violations, every demo
'before' asset is sent back, every 'after' asset passes, every file carries
the fictional-brand notice, and every claim marker points at an approved
ledger ID in the genome.
"""
import glob, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(HERE), "scorer"))
import scorer, json

G = os.path.join(HERE, "genome-plinkettle.json")
FX = os.path.join(HERE, "fixtures")
AS = os.path.join(HERE, "assets")
NOTICE = "Fictional demo brand, not a real company"
PLANTED = {  # fixture -> (expected check, expected rule)
    "planted-01-colour-pink.html": ("colour", "off-palette"),
    "planted-02-colour-svg-grey.svg": ("colour", "off-palette"),
    "planted-03-font-roboto.html": ("font", "non-brand-font"),
    "planted-04-contrast-sun.html": ("contrast", "wcag-aa"),
    "planted-05-voice-we.md": ("voice", "first-person-plural"),
    "planted-06-voice-banned.txt": ("voice", "banned-word"),
    "planted-07-claim-percent.html": ("claims", "unsourced-claim"),
    "planted-08-claim-count.md": ("claims", "unsourced-claim"),
    "planted-09-logo-no-alt.html": ("logo", "logo-missing-alt"),
    "planted-10-logo-unapproved.html": ("logo", "unapproved-logo-file"),
}
CLEAN = ["clean-01-hero.html", "clean-02-post.md"]
fails = []

print("%-34s %-9s %-6s %s" % ("FIXTURE", "EXPECTED", "SCORE", "RESULT"))
caught = 0
for name, (chk, rule) in PLANTED.items():
    r = scorer.score(os.path.join(FX, name), G)
    hit = [v for v in r["violations"] if v["check"] == chk and v["rule"] == rule]
    others = [v for v in r["violations"] if v["check"] != chk]
    ok = bool(hit) and r["verdict"] == "SEND BACK" and not others
    caught += ok
    if not ok: fails.append(name)
    print("%-34s %-9s %-6s %s%s" % (name, chk, r["score"], "CAUGHT" if ok else "MISSED",
          "" if not others else "  (unexpected extra: %s)" % [v["check"] for v in others]))
print()
fp = 0
for name in CLEAN:
    r = scorer.score(os.path.join(FX, name), G)
    ok = r["score"] == 100 and not r["violations"] and r["verdict"] == "PASS"
    fp += (not ok)
    if not ok: fails.append(name)
    print("%-34s %-9s %-6s %s" % (name, "clean", r["score"], "CLEAN" if ok else "FALSE POSITIVE %s" % r["violations"]))

print()
ba = 0
assets = sorted(glob.glob(os.path.join(AS, "0*-*.*")))
for p in assets:
    r = scorer.score(p, G)
    want = "SEND BACK" if "-before." in p else "PASS"
    ok = r["verdict"] == want and (want == "SEND BACK" or not r["violations"])
    ba += ok
    if not ok: fails.append(os.path.basename(p))
    print("%-34s %-9s %-6s %s" % (os.path.basename(p), want, r["score"], "OK" if ok else "WRONG (%s)" % r["verdict"]))

print()
genome = json.load(open(G))
ids = {c["id"] for c in genome["claims"]["approved"]}
files = assets + sorted(glob.glob(os.path.join(FX, "*")))
no_notice = [os.path.basename(p) for p in files if NOTICE not in open(p, encoding="utf-8").read()]
bad_refs = []
for p in files:
    for cid in re.findall(r"claims-ledger\.md#(C\d+)", open(p, encoding="utf-8").read()):
        if cid not in ids: bad_refs.append("%s -> %s" % (os.path.basename(p), cid))
if NOTICE not in genome.get("notice", ""): no_notice.append("genome-plinkettle.json")
print("Fictional notice missing in: %s" % (no_notice or "none"))
print("Claim markers pointing at unknown ledger IDs: %s" % (bad_refs or "none"))
fails += no_notice + bad_refs

print("\nPlanted errors caught: %d/10 | false positives on clean: %d/2 | before/after verdicts right: %d/%d"
      % (caught, fp, ba, len(assets)))
print("RESULT: %s" % ("PASS" if not fails else "FAIL " + ", ".join(fails)))
sys.exit(0 if not fails else 1)
