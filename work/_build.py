# Builds the short 3S-branded case pages in /work and redirect stubs for old URLs.
# Run from repo root: python3 work/_build.py
import html, os

E = html.escape
EMAIL = "dave@3shamrocks.com"

P = [
 dict(slug="shomer", name="SH✡MER", cat="Community safety", status="Closed beta · Israel",
  line="One tap sends an SOS with your live location to the people you trust and to users nearby.",
  did="Brand, product design and the working app, end to end. Plus SH✡MER Command, a dashboard for communities.",
  cards=[("The problem","In the first minutes of an emergency, the people closest to you can often get there first. There was no simple way to call them."),
         ("What I built","The brand, the Android and web app with real-time SOS and maps, and a community dashboard built privacy-first."),
         ("Where it is","In closed beta with first testers. Site: shomer-app.co.il.")],
  shots=["../assets/studio/shomer-app-map-clean.webp","../assets/studio/shomer-app-circles.webp","../assets/studio/shomer-app-guide.webp"],
  out=("Visit SH✡MER","https://www.shomer-app.co.il/")),
 dict(slug="lickpick", name="LickPick", cat="Music app", status="Free beta",
  line="Drop in your jams. LickPick cuts the flubs and hands you the take worth posting.",
  did="Brand, app design and the working app: it finds your best phrase, on the bar, ready for Reels, TikTok or Shorts.",
  cards=[("The problem","Players record every jam, then never dig the good take out of the camera roll."),
         ("What I built","The brand, the interface and a web app that runs on the phone, even offline. Clips never leave the device."),
         ("Where it is","Free beta on Android and Chrome.")],
  shots=["../assets/studio/screens/lickpick-cut.webp","../assets/studio/screens/lickpick-style.webp"],
  out=("Visit LickPick","../lickpick/")),
 dict(slug="trashure-hunters", name="Trashure-Hunters", cat="Kids' eco game", status="In development",
  line="Kids pick up real litter in their neighbourhood, and every cleanup heals a magical world.",
  did="Game world and characters, brand, app design and a working test build with camera, map and rewards.",
  cards=[("The problem","Kids see litter every day and learn to walk past it."),
         ("What I built","Six realms and their Elemonsters, the brand, the interface, and a test build where a photo of real litter earns progress."),
         ("Where it is","Private test build. Not yet available to download.")],
  shots=["../assets/opt/th-splash.webp","../assets/opt/th-map.webp"],
  out=("Visit Trashure-Hunters","../th-site/")),
 dict(slug="shomer-nature", name="SH✡MER Nature", cat="Safety in nature", status="Free beta · Israel",
  line="See an injured animal, a small fire or litter in a reserve? Report it in one tap, and the shomers nearby know right away.",
  did="Brand, product design and the working app: one-tap reports, SOS and trip check-in, and first-aid guides in plain Hebrew.",
  cards=[("The problem","In nature, the person closest to an injured animal, a fire or a hiker in trouble is often the only one who can help in time."),
         ("What I built","One-tap reports with photo and location, SOS and a trip check-in that alerts the shomers you chose, and step-by-step first-aid guides."),
         ("Where it is","Free beta for Android, and in the browser on iPhone and desktop.")],
  shots=["../assets/studio/screens/nature-map.webp","../assets/studio/screens/nature-guide.webp","../assets/studio/screens/nature-report.webp"],
  out=("Visit SH✡MER Nature","https://www.shomer-app.co.il/nature")),
 # chore-wars.html and fairent.html are hand-built pages (2 Nov 2026): custom=True keeps them in "More work" links only.
 dict(slug="chore-wars", custom=True, name="Chore Wars", cat="Family game", status="Free web app",
  line="Grab chores, steal, swap and win the weekly crown. A parent referees with a photo check.",
  did="Brand, game loop and a working web app that runs on any phone. No app store, no sign-up.",
  cards=[("The problem","“In a minute” means never. Chores turn into a nightly negotiation."),
         ("What I built","A multiplayer chore game: every player on their own phone, power cards, duels, photo proof and a weekly crown."),
         ("Where it is","Staging build on the web. Not released.")],
  shots=["../assets/real/scr-chore.png"],
  out=("Open Chore Wars","https://3shamrocksstudio.github.io/chore-wars/app/")),
]

CSS = """
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#08080f;--bg2:#0d0d1a;--card:#111120;--ink:#f4f4fc;--mut:rgba(200,200,225,.62);--line:rgba(130,57,234,.2);
--purple:#8239ea;--purple2:#9b59f7;--green:#3dcc6e;--green2:#52e87d;
--head:'Syne',sans-serif;--body:'Inter',sans-serif;--mono:'Space Grotesk',sans-serif;--lab:#b07cff;color-scheme:dark}
@media(prefers-color-scheme:light){:root:not([data-theme="dark"]){--lab:#6a2bc9;--bg:#f4f4fc;--bg2:#eaeaf6;--card:#ffffff;--ink:#0d0d1a;--mut:rgba(40,40,80,.68);--line:rgba(130,57,234,.16);color-scheme:light}}
:root[data-theme="light"]{--lab:#6a2bc9;--bg:#f4f4fc;--bg2:#eaeaf6;--card:#ffffff;--ink:#0d0d1a;--mut:rgba(40,40,80,.68);--line:rgba(130,57,234,.16);color-scheme:light}
html{scroll-behavior:smooth;overflow-x:clip}
body{background:var(--bg);color:var(--ink);font-family:var(--body);-webkit-font-smoothing:antialiased;line-height:1.6;overflow-x:hidden}
a{color:inherit;text-decoration:none}
img{display:block;max-width:100%}
.wrap{max-width:1120px;margin:0 auto;padding:0 max(24px,env(safe-area-inset-left,0px))}
nav{position:sticky;top:0;z-index:10;background:color-mix(in srgb,var(--bg) 86%,transparent);backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}
nav .wrap{display:flex;align-items:center;justify-content:space-between;height:64px}
.logo img{height:30px;width:auto}
.nl{display:flex;gap:22px;align-items:center;font:500 13px var(--mono)}
.nl a{color:var(--mut)} .nl a:hover{color:var(--ink)}
.cta-s{background:var(--purple);color:#fff!important;padding:9px 20px;border-radius:100px;font-weight:600}
.hero{padding:64px 0 40px;display:grid;grid-template-columns:1.1fr .9fr;gap:48px;align-items:center;position:relative}
.hero::before{content:"";position:absolute;inset:-80px 0 auto auto;width:520px;height:520px;background:radial-gradient(circle,rgba(130,57,234,.22),transparent 65%);z-index:-1}
h1{font:800 clamp(40px,6vw,76px)/1.02 var(--head);letter-spacing:-.035em;margin-bottom:18px}
.line{font-size:clamp(18px,2vw,22px);line-height:1.5;margin-bottom:16px;max-width:30ch}
.did{color:var(--mut);font-size:16px;max-width:52ch;margin-bottom:28px}
.btns{display:flex;flex-wrap:wrap;gap:12px}
.bp{display:inline-flex;align-items:center;gap:8px;background:var(--purple);color:#fff;padding:14px 28px;border-radius:100px;font:600 14px var(--mono)}
.bp:hover{background:var(--purple2)}
.bg{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line);color:var(--ink);padding:14px 28px;border-radius:100px;font:500 14px var(--mono)}
.bg:hover{border-color:var(--purple)}
.shots{display:flex;gap:16px;justify-content:center;align-items:flex-end}
.shot{border-radius:26px;overflow:hidden;border:1px solid var(--line);box-shadow:0 30px 60px -30px rgba(40,10,90,.55);background:var(--card)}
.shots .shot{flex:0 1 240px}
.shots.n3 .shot{flex-basis:190px}
.shots.n3 .shot:nth-child(2){transform:translateY(-24px)}
.shots.n1 .shot{flex-basis:420px;border-radius:20px}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:24px 0 72px}
.card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:24px}
.card p{font-size:16px}
.band{background:linear-gradient(135deg,var(--purple),#5a1fc0);color:#fff;border-radius:24px;padding:44px;display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap}
.band h2{font:800 clamp(24px,3vw,34px)/1.1 var(--head);letter-spacing:-.02em;max-width:22ch}
.band p{opacity:.9;margin-top:8px}
.band a{background:#fff;color:#2a0f63;padding:14px 28px;border-radius:100px;font:600 14px var(--mono);white-space:nowrap}
.more{padding:56px 0 24px}
.more h2{font:800 clamp(22px,2.6vw,28px)/1.1 var(--head);letter-spacing:-.02em;margin-bottom:16px}
.more .l{display:flex;flex-wrap:wrap;gap:10px}
.more a{border:1px solid var(--line);border-radius:100px;padding:10px 18px;font:500 14px var(--mono)}
.more a:hover{border-color:var(--purple)}
footer{margin-top:32px;padding:32px 0 40px;border-top:1px solid var(--line);color:var(--mut);font:500 13px var(--mono);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:18px}
footer a:hover{color:var(--ink)}
.f-logo{display:block}
.f-logo img{height:34px;width:auto;margin-bottom:10px}
.social{display:flex;gap:12px}
.social a{width:44px;height:44px;display:flex;align-items:center;justify-content:center;border-radius:50%;color:var(--lab);transition:color .2s,transform .2s}
.social a:hover{color:var(--green);transform:translateY(-2px)}
.social svg{width:44px;height:44px}
@media(max-width:860px){.hero{grid-template-columns:1fr;padding-top:40px;gap:36px}.cards{grid-template-columns:1fr}.band{padding:32px}.shots.n3 .shot:nth-child(2){transform:none}}
@media(max-width:480px){.shots.n3 .shot:nth-child(3){display:none}.nl .hm{display:none}}
"""

def page(p):
    n = len(p["shots"])
    shots = "".join(f'<div class="shot"><img src="{s}" alt="{E(p["name"])} screen {i+1}" loading="{"eager" if i==0 else "lazy"}"></div>' for i, s in enumerate(p["shots"]))
    cards = "".join(f'<div class="card"><p>{E(t)}</p></div>' for h, t in p["cards"])
    out = f'<a class="bg" href="{E(p["out"][1])}" target="_blank" rel="noopener">{E(p["out"][0])} &#8599;</a>' if p["out"] else ""
    more = "".join(f'<a href="{q["slug"]}.html">{E(q["name"])}</a>' for q in P if q is not p)
    mail = f"mailto:{EMAIL}?subject=" + "New%20project"
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{E(p["name"])} · 3Shamrocks Studio</title>
<meta name="description" content="{E(p["line"])}">
<meta name="robots" content="noindex">
<link rel="icon" href="../favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap"></noscript>
<style>{CSS}</style>
</head>
<body>
<nav><div class="wrap">
 <a class="logo" href="../"><picture><source srcset="../assets/studio/3shamrocks_black.png" media="(prefers-color-scheme: light)"><img src="../assets/studio/3shamrocks.png" alt="3Shamrocks Studio"></picture></a>
 <div class="nl"><a class="hm" href="../#work">All work</a><a class="cta-s" href="{mail}">Let's talk</a></div>
</div></nav>
<main class="wrap">
 <section class="hero">
  <div>
   <h1>{E(p["name"])}</h1>
   <p class="line">{E(p["line"])}</p>
   <p class="did">{E(p["did"])}</p>
   <div class="btns"><a class="bp" href="{mail}">Start a project</a>{out}</div>
  </div>
  <div class="shots n{n}">{shots}</div>
 </section>
 <section class="cards">{cards}</section>
 <section class="band">
  <div><h2>Want your product to look and work like this?</h2><p>Brand, interface and working product, from one senior designer.</p></div>
  <a href="{mail}">Start a project</a>
 </section>
 <section class="more"><h2>More work</h2><div class="l">{more}<a href="../#experience">Client work</a></div></section>
 <footer><div><a class="f-logo" href="../" aria-label="3Shamrocks Studio, home"><picture><source srcset="../assets/studio/3shamrocks_black.png" media="(prefers-color-scheme: light)"><img src="../assets/studio/3shamrocks.png" alt="3Shamrocks Studio" width="905" height="133" loading="lazy"></picture></a><span>&copy; 2026 3Shamrocks Studio. All rights reserved.</span></div>
  <div class="social">
   <a href="https://www.linkedin.com/in/davemarkovich/" target="_blank" rel="noopener" aria-label="Dave Markovich on LinkedIn"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="21"/><path d="M16 21v11M16 16.5v.01M22 32V21M22 26c0-3 2-5 4.5-5S31 23 31 26v6"/></svg></a>
   <a href="https://www.instagram.com/3shamrocks.studio/" target="_blank" rel="noopener" aria-label="3Shamrocks Studio on Instagram, @3shamrocks.studio"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="21"/><rect x="14" y="14" width="20" height="20" rx="6"/><circle cx="24" cy="24" r="4.6"/><path d="M29.5 18.5v.01"/></svg></a>
   <a href="mailto:{EMAIL}" aria-label="Email {EMAIL}"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="21"/><rect x="13" y="16" width="22" height="16" rx="3"/><path d="M14 18l10 7 10-7"/></svg></a>
  </div></footer>
</main>
</body>
</html>
"""

def stub(target):
    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Moved · 3Shamrocks Studio</title>
<meta name="robots" content="noindex"><link rel="canonical" href="{target}">
<meta http-equiv="refresh" content="0; url={target}">
<script>location.replace({target!r})</script></head>
<body><p><a href="{target}">This page moved. Continue</a></p></body></html>
"""

if __name__ == "__main__":
    os.makedirs("work", exist_ok=True)
    for p in P:
        if p.get("custom"): continue
        open(f"work/{p['slug']}.html", "w", encoding="utf-8").write(page(p))
    R = "https://3shamrocksstudio.github.io/"
    redirects = {
      "shomer-case.html": "work/shomer.html", "lickpick-case.html": "work/lickpick.html",
      "chorewars-case.html": "work/chore-wars.html", "work/chore-royale.html": "work/chore-wars.html", "th.html": "work/trashure-hunters.html",
      "products/th.html": "work/trashure-hunters.html", "products/lickpick.html": "work/lickpick.html",
      "products/chore-royale.html": "work/chore-wars.html", "studio/th.html": "work/trashure-hunters.html",
      "studio/index.html": "", "shomernature-case.html": "work/shomer-nature.html",
      # parked: back to the studio home
      "j8nix-case.html": "", "products/j8nix.html": "", "ezra-case.html": "", "products/ezra.html": "",
      "milo-case.html": "", "products/milo.html": "", "fairent-case.html": "work/fairent.html", "products/fairent.html": "work/fairent.html",
      "products/rookie-king.html": "", "products/media-network.html": "",
    }
    for f, t in redirects.items():
        os.makedirs(os.path.dirname(f) or ".", exist_ok=True)
        open(f, "w", encoding="utf-8").write(stub(R + t))
    print("built", len(P), "pages,", len(redirects), "redirects")
