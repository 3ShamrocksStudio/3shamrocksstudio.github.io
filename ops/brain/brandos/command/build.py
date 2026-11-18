#!/usr/bin/env python3
"""Brand OS Command view (P2, CDO step) - builds ops/brandos/index.html.

Scores every demo asset fresh with the real scorer (no stored numbers), then
writes one static page: before/after per asset, the six checks, and every
finding with its fix. Run from anywhere:
    python3 ops/brain/brandos/command/build.py
"""
import html, json, os, sys, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
BOS = os.path.dirname(HERE)
SITE = os.path.abspath(os.path.join(BOS, "..", "..", ".."))
sys.path.insert(0, os.path.join(BOS, "scorer"))
import scorer  # noqa: E402

DEMO = os.path.join(BOS, "demo")
GENOME = os.path.join(DEMO, "genome-plinkettle.json")
OUT = os.path.join(SITE, "ops", "brandos", "index.html")
ASSETS = [  # (slug, label, kind)
    ("01-linkedin", "LinkedIn post", "md"),
    ("02-adcard", "Ad card", "svg"),
    ("03-hero", "Landing hero", "html"),
    ("04-email", "Email", "txt"),
    ("05-deck", "Deck page", "html"),
]
CHECKS = scorer.CHECKS  # colour, font, contrast, voice, claims, logo
NAMES = {"colour": "Colour", "font": "Type", "contrast": "Contrast", "voice": "Voice", "claims": "Claims", "logo": "Logo"}
e = html.escape


def find(slug, side, kind):
    p = os.path.join(DEMO, "assets", "%s-%s.%s" % (slug, side, kind))
    assert os.path.exists(p), p
    return p


rows, total_before, total_after, errors = [], 0, 0, 0
for slug, label, kind in ASSETS:
    b = scorer.score(find(slug, "before", kind), GENOME)
    a = scorer.score(find(slug, "after", kind), GENOME)
    rows.append((slug, label, kind, b, a))
    total_before += b["score"]; total_after += a["score"]; errors += len(b["violations"])
    assert not a["violations"], (slug, a["violations"])  # the demo promise: every after asset is clean
n = len(rows)
genome = json.load(open(GENOME))
threshold = rows[0][3]["threshold"]
built = datetime.datetime.now(datetime.timezone.utc).strftime("%d %b %Y")


def bar(score, ok):
    return ('<span class="bar %s" style="--w:%d%%"><b>%d</b></span>' % ("ok" if ok else "no", max(score, 2), score))


def cells(rep):
    out = []
    for c in CHECKS:
        k = rep["checks"][c]["violations"]
        out.append('<td class="c %s" data-k="%s">%s</td>' % ("ok" if k == 0 else "no", NAMES[c], "&#10003;" if k == 0 else k))
    return "".join(out)


body_rows, details = [], []
for slug, label, kind, b, a in rows:
    body_rows.append(
        '<tr><th scope="row"><a href="#%s">%s</a><small>.%s</small></th>'
        '<td class="s">%s</td><td class="s">%s</td>%s</tr>'
        % (slug, e(label), kind, bar(b["score"], b["verdict"] == "PASS"), bar(a["score"], a["verdict"] == "PASS"), cells(b)))
    items = "".join(
        '<li><span class="k">%s</span><span class="f">%s</span><span class="x">%s</span></li>'
        % (NAMES[v["check"]], e(v["reason"]), e(v["fix"])) for v in b["violations"])
    details.append(
        '<details class="asset" id="%s"><summary><h3>%s</h3><p><span class="v no">Before %d &middot; send back</span>'
        '<span class="arrow" aria-hidden="true">&rarr;</span><span class="v ok">After %d &middot; pass</span>'
        '<span class="n">%d fixes</span></p></summary>'
        '<ol>%s</ol></details>' % (slug, e(label), b["score"], a["score"], len(b["violations"]), items))

page = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Brand OS Command</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Instrument+Sans:wght@400;600&display=swap" rel="stylesheet">
<style>
:root{--bg:#000000;--s1:#0d0a17;--s2:#151024;--ink:#f6f4ff;--vi:#8239ea;--vi2:#b07cff;--vi3:#d9c4ff;--teal:#2fb7c9;--green:#8be36a}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 "Instrument Sans",system-ui,sans-serif}
a{color:var(--vi3)}
.top{display:flex;align-items:center;gap:14px;padding:12px 16px;border-bottom:1px solid var(--s2)}
.top img{height:24px;width:auto}
.top h1{margin:0;font:700 18px/1 "Bricolage Grotesque",system-ui,sans-serif;letter-spacing:.01em}
.top .tag{margin-left:auto;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--teal)}
main{max-width:1180px;margin:0 auto;padding:0 16px 48px}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid var(--s2)}
.kpis div{padding:18px 16px 16px 0}
.kpis b{display:block;font:700 clamp(30px,5vw,46px)/1 "Bricolage Grotesque",system-ui,sans-serif}
.kpis span{font-size:13px;color:var(--vi3)}
.kpis .up b{color:var(--green)}
.lede{margin:18px 0 8px;max-width:760px;color:var(--ink)}
table{width:100%%;border-collapse:collapse;margin:14px 0 6px}
caption{text-align:left;font:700 13px/1 "Instrument Sans",system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--vi3);padding:0 0 10px}
th,td{padding:10px 8px;border-bottom:1px solid var(--s2);text-align:left;vertical-align:middle}
thead th{font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--vi3)}
tbody th{font-weight:600;white-space:nowrap}
tbody th a{color:var(--ink);text-decoration:none;border-bottom:1px solid var(--vi)}
tbody th small{margin-left:6px;color:var(--vi3);font-weight:400}
td.s{width:22%%}
.bar{display:block;position:relative;height:24px;background:var(--s1)}
.bar::before{content:"";position:absolute;inset:0 auto 0 0;width:var(--w)}
.bar.ok::before{background:var(--green)}
.bar.no::before{background:var(--vi)}
.bar b{position:relative;display:block;padding:0 8px;font:700 14px/24px "Instrument Sans",system-ui,sans-serif;color:var(--ink)}
.bar.ok b{color:var(--bg)}
td.c{text-align:center;font-weight:700;width:7%%}
td.c.ok{color:var(--green)}
td.c.no{background:var(--s2);color:var(--vi3)}
.key{display:flex;flex-wrap:wrap;gap:18px;font-size:13px;color:var(--vi3);margin:8px 0 26px}
.key i{display:inline-block;width:12px;height:12px;margin-right:6px;vertical-align:-1px}
.key .g{background:var(--green)} .key .v{background:var(--vi)}
h2{font:700 clamp(22px,3vw,30px)/1.1 "Bricolage Grotesque",system-ui,sans-serif;margin:34px 0 4px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:0;border-top:1px solid var(--s2)}
.asset{padding:16px 16px 18px 0;border-bottom:1px solid var(--s2)}
.asset summary{cursor:pointer;list-style:none}
.asset summary::-webkit-details-marker{display:none}
.asset summary h3::after{content:" +";color:var(--vi2)}
.asset[open] summary h3::after{content:" \\2212"}
.n{margin-left:10px;color:var(--vi3)}
.asset summary h3{margin:0 0 4px;font:700 18px/1.2 "Bricolage Grotesque",system-ui,sans-serif}
.asset summary p{margin:0 0 10px;font-size:13px}
.v{font-weight:600}.v.no{color:var(--vi2)}.v.ok{color:var(--green)}
.arrow{margin:0 8px;color:var(--vi3)}
ol{margin:0;padding:0;list-style:none}
li{display:grid;grid-template-columns:72px 1fr;gap:2px 10px;padding:7px 0;border-top:1px solid var(--s1);font-size:13.5px}
li .k{grid-row:span 2;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--teal);padding-top:2px}
li .x{color:var(--vi3)}
.how{display:grid;grid-template-columns:repeat(3,1fr);margin-top:12px;border-top:1px solid var(--s2)}
.how div{padding:14px 16px 14px 0;font-size:14px}
.how b{display:block;font:700 15px/1.2 "Bricolage Grotesque",system-ui,sans-serif;margin-bottom:4px;color:var(--vi3)}
footer{margin-top:28px;font-size:12.5px;color:var(--vi3);max-width:760px}
@media (max-width:760px){
  .kpis{grid-template-columns:repeat(2,1fr)}
  thead th.c-h{display:none}
  td.c{display:none}
  td.s{width:34%%}
  .how{grid-template-columns:1fr}
  .grid{grid-template-columns:1fr}
  .top{flex-wrap:wrap}
  .top .tag{margin-left:0;flex-basis:100%%}
  .key .m{display:none}
}
</style>
</head>
<body>
<div class="top"><img src="../../assets/studio/3shamrocks.png" alt="3Shamrocks Studio"><h1>Brand OS &middot; Command</h1><span class="tag">Demo &middot; fictional brand</span></div>
<main>
<div class="kpis">
<div><b>%(n)d</b><span>assets checked</span></div>
<div><b>%(errors)d</b><span>brand errors found before</span></div>
<div><b>%(avg_b)d</b><span>average score before</span></div>
<div class="up"><b>%(avg_a)d</b><span>average score after</span></div>
</div>
<p class="lede">%(brand)s is a made-up brand used to show the system working. Each asset is checked against its brand rulebook in six ways. An asset passes at %(th)d or more, so one error sends it back.</p>
<table>
<caption>Before &rarr; after, and what failed before</caption>
<thead><tr><th>Asset</th><th>Before</th><th>After</th>%(heads)s</tr></thead>
<tbody>%(rows)s</tbody>
</table>
<div class="key"><span><i class="g"></i>on brand</span><span><i class="v"></i>sent back</span><span class="m">number in a check = errors found before the fix</span></div>
<h2>Every finding, with its fix</h2><p class="lede">Tap an asset to see what was wrong and how it was fixed.</p>
<div class="grid">%(details)s</div>
<h2>How it works</h2>
<div class="how">
<div><b>1 &middot; Rulebook</b>Colours, type, contrast, voice, approved claims and logo files, each with its source.</div>
<div><b>2 &middot; Check</b>Every asset is read against the rulebook before anyone sees it.</div>
<div><b>3 &middot; Fix or pass</b>Each error comes back with the rule it broke and the fix. Nothing ships until it passes.</div>
</div>
<footer>Built %(built)s from the live checker, not typed by hand. %(brand)s, its colours, claims and sources are fictional, not a real company. Internal preview, not linked from the site.</footer>
</main>
<script>
function openHash(){var d=location.hash&&document.getElementById(location.hash.slice(1));if(d&&d.tagName==="DETAILS"){d.open=true;}}
addEventListener("hashchange",openHash);openHash();
</script>
</body>
</html>
""" % {
    "n": n, "errors": errors, "avg_b": round(total_before / n), "avg_a": round(total_after / n),
    "brand": e(genome["brand"]), "th": threshold, "built": built,
    "heads": "".join('<th class="c-h">%s</th>' % NAMES[c] for c in CHECKS),
    "rows": "".join(body_rows), "details": "".join(details),
}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, "w", encoding="utf-8").write(page)
print("wrote", OUT, "| assets", n, "| errors", errors, "| avg", round(total_before / n), "->", round(total_after / n))
