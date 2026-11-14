# 3S Brand OS · P1 Definition + identity (drafted Sat 14 Nov 2026, due Mon 16 Nov)

> CPO / CDO / CMO / CLO seat, weekend shift. Built only on `RESEARCH.md` (P0) plus the checks run in this shift (listed with URLs in §1). Lines marked **[Inference]** are my reading, not sourced facts. No prices in this file: prices are private and set by Dave.
> Internal codename stays **3S Brand OS**. Public working name: **Brandplumb** (pending clearance, see §1).

---

## 1. Name check

Checked 14 Nov 2026, ~19:30 Israel time. Method: RDAP registry lookups (Verisign for .com, Identity Digital for .ai, which is the server the IANA bootstrap file names for .ai), a DNS lookup for .co.il (no RDAP exists for .il: the IANA bootstrap file `data.iana.org/rdap/dns.json` has no entry for `il`, and port-43 WHOIS at whois.isoc.org.il refused the connection from this sandbox), web search, the iTunes Search API, a Google Play search page, and US trademark mirror sites (markinton.com, trademarks.justia.com, trademarkdir.com). USPTO, EUIPO/TMview and the ILPO register were **not** queried directly.

"Unregistered" below means the registry returned 404 on that date. A .co.il NXDOMAIN only means no DNS delegation exists, which is a strong signal but not proof the name is free; ISOC-IL is the source of truth.

### 1a. Brandplumb (recommended)

| Check | Result | Evidence |
|---|---|---|
| brandplumb.com | **Unregistered** | `https://rdap.verisign.com/com/v1/domain/brandplumb.com` returned HTTP 404 (empty body). Control: google.com returned 200 |
| brandplumb.ai | **Unregistered** | `https://rdap.identitydigital.services/rdap/domain/brandplumb.ai` returned 404, `errorCode 404, "Object not found"`. Control: brand.ai returned 200 (after a 429 rate-limit retry) |
| brandplumb.co.il | **No DNS delegation (likely free, not registry-checked)** | `https://dns.google/resolve?name=brandplumb.co.il&type=NS` returned `Status 3` (NXDOMAIN). Control: ynet.co.il returned Status 0 with NS records |
| Web: products or companies named Brandplumb | **None found** | WebSearch `"Brandplumb"`: only plumbing tools/shops and Wikipedia "Plumb (tools)" |
| Google Play | **No app found** | `play.google.com/store/search?q=brandplumb&c=apps` returned zero app IDs |
| Apple App Store | **No app with this name** | `itunes.apple.com/search?term=brandplumb&entity=software` returned 4 unrelated brand apps (BRANDZ, TYB, Collabstr, Pitch'em) |
| Trademark signals (US mirrors) | **Two near marks to review** | (1) **BRANDPLUG**, US Reg. 5084944 (serial 86773644), **live**, class 35, "marketing services": `https://markinton.com/trademark/brandplug-86773644`. Close in sound and spelling, same class as the service side. (2) **PLUMB** marks owned by PLUMB, LLC, 2 registered per `https://trademarkdir.com/owner/plumb-llc`, filings across classes 9, 25, 40, 42 (which goods per mark is not shown). One PLUMB filing (serial 88036736, classes 25/40) is dead: `https://markinton.com/trademark/plumb-88036736`. (3) BRAND PLUME, serial 88747900, class 35 branding services, **dead** (abandoned Oct 2020): `https://markinton.com/trademark/brand-plume-88747900` |
| EUIPO / ILPO | **Not checked** | Not reachable from this run |

**Verdict: Brandplumb stays the working name and is the strongest of the candidates, but it is NOT cleared.** It is free on .com and .ai, shows no product, app or company using it, and no identical mark was found. The risk to put in front of counsel is **BRANDPLUG** (live US mark, class 35, marketing services). [Inference] "Brandplumb" and "Brandplug" share their first 8 letters (B-R-A-N-D-P-L-U) and differ only in the last sound, so a likelihood-of-confusion opinion is needed before filing in class 35. A second note: search results for "plumb" are full of plumbing businesses, so SEO will need the full word "Brandplumb". In Hebrew it would be written ברנדפלאם (the b is silent); worth a quick ear test with 3 Israeli founders.

**NEEDS YOUR EYES / lawyer:** formal clearance (ILPO + USPTO + EUIPO/TMview, Nice classes 9, 35, 42) by counsel before any public use, filing or domain purchase. Domain purchase is spend and waits for Dave's OK.

### 1b. Backup names (proposed this shift)

| Name | Idea | .com | .ai | .co.il (DNS) | Web / apps / TM signals | Verdict |
|---|---|---|---|---|---|---|
| **Brandlign** | brand + align | **Registered** 13 May 2026, locked (`rdap.verisign.com/com/v1/domain/brandlign.com`: registration 2026-05-13, status client delete/renew/transfer/update prohibited) | Unregistered (404) | NXDOMAIN | WebSearch `"Brandlign"`: no product. Nearby: "Brand Line" agency on Clutch, "BrandLines" Gumroad style-guide kits. Play/App Store: no app of that name | Backup 1. Clean on product search, but .com would have to be bought and it reads as "brand line" |
| **Genoplumb** | Brand Genome + plumb | **Unregistered** (404) | **Unregistered** (404) | NXDOMAIN | WebSearch `"Genoplumb"`: nothing (genoPlotR, Genoplan only). Play: no app. App Store search returns genetics apps (23andMe, GenoPalate, Genomapp) | Backup 2. All three domains free, but [Inference] "geno-" reads as genetics, which is a confusion risk in a HealthTech-first niche (same issue P0 found with Genomark) |

Rejected this shift, with evidence:
- **Brandwarden** (P0 fallback): an advertising-services company **"Brand Wardens"** (brandwardens.com, founded 2019, social/SEO/influencer marketing) exists: `https://village.ai/company/brandwardens`. Same service space. brandwarden.com registered since 2016-01-26.
- **Brandsightline**: both domains free (404/404), but SIGHTLINE has many US filings (e.g. serials 97185105, 98039790, 98119899, 99433466; SIGHTLINE SYSTEMS 86125353), per WebSearch on markinton.com / trademarkregistration.app. Too crowded.

Other RDAP results logged for the record (.com / .ai): brandkeel 200/200, brandtrueline 404/rate-limited, plumbbrand 200/404, brandgauge 200/404, brandtrue 200/404, trueplumb 200/404, plumbstudio 200/404, onplumb 200/404, plumbwise 200/200, brandrule 200/200, brandaxis 200/200, brandcompass 200/200.

---

## 2. Positioning

### Who, pain, proof (from RESEARCH.md)
- **Who:** funded Israeli startups, Seed to Series B. HealthTech first, AI/cyber B2B second ring (RESEARCH Verdict 1).
- **Pain:** 25% of marketers knowingly publish off-brand AI content under deadline; 76% spend 3+ hours a week fixing AI output (Optimizely/Savanta, n=2,003). 77% rely on manual spot checks (Markup.ai, n=135). 51% of B2B software buyers start research with an AI chatbot more often than Google (G2, n=1,076). HealthTech marketing claims draw regulator action (FDA letters to SeniorLife and Whoop; Israeli MoH advertising rules).
- **Gap:** scored brand QA exists only in enterprise suites; design subscriptions publish no quality metric; visibility tools measure but don't produce; nobody found combines visibility with sourced-claims QA for HealthTech (RESEARCH §1, Verdict 3 to 5).

### Positioning statement (EN) [Inference, built on the facts above]
For funded Israeli startups from Seed to Series B, starting with HealthTech, that need more brand material than their team can check, **Brandplumb is a brand department run by AI agents and a senior creative director**. Every asset is scored against the startup's own brand rules and approved claims before anyone sees it, nothing unsourced passes, and each month the founder sees how ChatGPT, Claude, Gemini and Perplexity describe the company. Unlike enterprise brand-governance suites, it is built and priced for startups and does the work, not just the checking. Unlike design subscriptions, every asset carries a visible Brand Consistency Score and a human sign-off.

### הצהרת מיצוב (HE)
לסטארטאפים ישראליים אחרי גיוס, מ-Seed ועד Series B, ובראשם HealthTech, שצריכים יותר חומרי מותג ממה שהצוות מספיק לבדוק: **Brandplumb היא מחלקת מותג שמופעלת על ידי סוכני AI ומנהל קריאייטיב בכיר.** כל פריט מקבל ציון מול חוקי המותג והטענות המאושרות של החברה עוד לפני שמישהו רואה אותו, שום טענה בלי מקור לא עוברת, ופעם בחודש הפאונדר רואה איך ChatGPT, Claude, Gemini ו-Perplexity מתארים את החברה. בניגוד לכלי ניהול מותג לארגונים גדולים, היא בנויה לסטארטאפים ועושה את העבודה עצמה, לא רק בודקת אותה. בניגוד למנויי עיצוב, לכל פריט יש ציון עקביות מותג גלוי וחתימה של אדם.

### One-liner
- **EN:** Your brand department, already trained on your brand: AI makes it, a scorer checks it against your rules, I sign it off, and you see how ChatGPT describes you.
- **HE:** מחלקת מותג שכבר מכירה את המותג שלכם: ה-AI מייצר, מערכת בדיקה מודדת כל פריט מול החוקים שלכם, אני חותם, ואתם רואים איך ChatGPT מתאר אתכם.

---

## 3. One-page product spec: Brandplumb MVP

**Promise:** on-brand, claim-safe brand assets with a visible score, under human command. The AI never publishes on its own.

| # | Module | What the client sees | Inputs | Outputs |
|---|---|---|---|---|
| 1 | **Brand Genome** | A readable brand rulebook plus a "genome" file their tools can use | Logo files, current site, deck, product screens, existing guidelines (if any), a 30-min founder call, approved claims with sources | Machine-readable rules (colour, type, logo use, layout, voice, words to use/avoid, approved claims + source links), tokens for Figma and code, Claude/Figma skills. Format proven on 3S itself: `scorer/genome-3s.json` |
| 2 | **Production agents** | Drafts of the assets they asked for | A request (e.g. "LinkedIn post on our new pilot", "investor deck section"), the genome | Social posts, ad sets, deck pages, landing sections, emails, product-screen comps |
| 3 | **Precision QA gate + Brand Consistency Score** | A 0-100 score per asset, each failed check with its reason and fix | Each produced asset, the genome | Score, pass/fail per check (colour distance, font, contrast, logo, voice, unsourced claims). Below threshold → back to production automatically, never shown as final. v0.1 exists: `scorer/scorer.py`, threshold 85 |
| 4 | **Command view** | One screen: priorities ("what's next"), approve / edit / kill, history, stats (score, output, turnaround) | Client decisions | Approved files ready to publish by the client; a log of who approved what |
| 5 | **AI Visibility** | A monthly report: what AI assistants say about them and their category, and the fixes | A fixed prompt set agreed at kickoff, run on ChatGPT, Claude, Gemini, Perplexity | Mentions, accuracy against the genome's approved claims, competitors named, and fix assets (site copy, structured data, source suggestions) that pass the same QA gate |

**The human gate (non-negotiable):** asset → scorer → (fail: back to production) → Dave's taste gate as creative director → client approval in Command → the client publishes. Health claims additionally need the client's own legal/medical OK before the asset is marked approved. No auto-posting to any channel in the MVP.

**Offer ladder (no prices here):**
1. **Free "How AI sees your brand" audit**: a short report on how the main AI assistants describe the company and what to fix first. Entry point: `/audit/`.
2. **AI-Ready Brand Sprint, 7 working days**: module 1 built, the first launch assets produced through modules 2 and 3, and a first AI Visibility baseline. Existing page: `/sprint/`.
3. **Monthly subscription**: modules 2 to 5 running, monthly visibility report, Command access. Two tiers, defined by Dave.

**NOT in the MVP:**
- Auto-publishing or scheduling to social/ad accounts.
- Video, motion, 3D, packaging, print production.
- Paid media buying or campaign management.
- Rendered-pixel QA (v0.1 checks source, not screenshots), logo clear-space measurement, Hebrew voice checks beyond numbers (see `scorer/README.md` limits).
- Legal or regulatory sign-off on health claims (the ledger tracks sources; the client's counsel approves).
- Self-serve sign-up, client accounts at scale, integrations beyond Figma/Claude exports.
- Real client brands in demos (3S itself or a clearly fictional startup only).

**NEEDS YOUR EYES:** the current `/audit/` page is the *Founder Brand Audit* workbook (a DIY PDF with 40 checks), not a "How AI sees your brand" audit. Either the CTA label changes to match the workbook, or P3 builds the AI-visibility audit at that URL. Decision for Dave; P3 executes.

---

## 4. Offer page copy (EN + HE)

Rules applied: first person singular, no invented numbers, no testimonials, no price, no urgency. Proof uses only Dave's stated record. One wording fix for accuracy: TIME's 2023 list honoured **Vibrant's capsule treatment** (GlobeNewswire, 28 Nov 2023: "TIME Honors Vibrant's Chronic Constipation Treatment Among 2023's Best Inventions", `https://www.globenewswire.com/news-release/2023/11/28/2787227/0/en/TIME-Honors-Vibrant-s-Chronic-Constipation-Treatment-Among-2023-s-Best-Inventions.html`). The release does not mention the app, so the copy says Dave designed the companion app *for* the honoured therapy, not that the app itself was listed. When this copy goes into HTML, the TIME line needs a `data-source` attribute with that URL or the scorer will fail it (by design).

### EN

**Hero**
- Kicker: Brandplumb · for funded startups, starting with HealthTech
- H1: Your brand department, already trained on your brand.
- Sub: AI makes the assets. A scorer checks every one against your own brand rules and approved claims. I sign it off. And each month you see how ChatGPT, Claude, Gemini and Perplexity describe you.
- CTA: See how AI sees your brand (free audit)

**Three benefits**
1. **Every asset comes with a score.** Posts, decks, ads and landing sections are checked against your brand rules: colour, type, logo, voice and claims. Anything under the bar goes back for fixing before you ever see it.
2. **Every claim has a source.** In HealthTech one careless sentence is a real risk. A claim with no source fails the check automatically, and health claims wait for your own legal OK.
3. **You see what AI says about you.** Every month I check how the main AI assistants describe your company and your category, then I make the fixes: site copy, structured data, and the sources they should be reading.

**How it works**
1. **Free audit.** I show you how AI assistants describe your brand today and the three things to fix first.
2. **AI-Ready Brand Sprint, 7 working days.** I turn your brand into a Brand Genome, a rulebook both people and AI can follow, and deliver your first assets through the quality gate.
3. **Monthly.** Ongoing production, a score on every asset and a monthly AI visibility report. You approve, edit or kill anything from one screen.

**The human-gate promise**
The AI never publishes anything on its own. Nothing below the score reaches you, nothing leaves without my sign-off, and nothing goes public without yours.

**Proof**
I have spent 20 years building brands and designing products. I led the design of the therapy companion app for VIBRANT, whose treatment was named to TIME's Best Inventions of 2023, and I did brand work for VIBRANT and AposHealth.

**Closing CTA**
- Line: Start with the free audit. You keep the findings either way.
- Button: Get my free audit

### HE

**Hero**
- כותרת משנה עליונה: Brandplumb · לסטארטאפים אחרי גיוס, ובראשם HealthTech
- H1: מחלקת מותג שכבר מכירה את המותג שלכם.
- משנה: ה-AI מייצר את החומרים. מערכת בדיקה מודדת כל פריט מול חוקי המותג והטענות המאושרות שלכם. אני חותם. ופעם בחודש אתם רואים איך ChatGPT, Claude, Gemini ו-Perplexity מתארים אתכם.
- CTA: לבדוק איך ה-AI רואה אתכם (חינם)

**שלושה יתרונות**
1. **לכל פריט יש ציון.** פוסטים, מצגות, מודעות ועמודי נחיתה נבדקים מול חוקי המותג שלכם: צבע, פונט, לוגו, טון וטענות. מה שלא עומד ברף חוזר לתיקון עוד לפני שתראו אותו.
2. **לכל טענה יש מקור.** ב-HealthTech משפט אחד לא זהיר הוא סיכון אמיתי. טענה בלי מקור נופלת בבדיקה אוטומטית, וטענות בריאות מחכות לאישור המשפטי שלכם.
3. **אתם רואים מה ה-AI אומר עליכם.** פעם בחודש אני בודק איך עוזרי ה-AI המובילים מתארים את החברה ואת התחום שלכם, ומכין את התיקונים: טקסטים לאתר, נתונים מובנים והמקורות שהם צריכים לקרוא.

**איך זה עובד**
1. **בדיקה חינם.** אני מראה לכם איך עוזרי AI מתארים את המותג שלכם היום, ומה שלושת הדברים לתקן קודם.
2. **ספרינט מותג מוכן ל-AI, 7 ימי עבודה.** אני הופך את המותג שלכם ל-Brand Genome, ספר חוקים שגם אנשים וגם AI יודעים לעבוד לפיו, ומוסר את החומרים הראשונים אחרי שעברו את שער הבדיקה.
3. **כל חודש.** הפקה שוטפת, ציון לכל פריט ודוח נראות חודשי ב-AI. אתם מאשרים, עורכים או פוסלים כל דבר ממסך אחד.

**ההבטחה: אדם מאשר**
ה-AI לא מפרסם שום דבר לבד. שום דבר מתחת לרף לא מגיע אליכם, שום דבר לא יוצא בלי החתימה שלי, ושום דבר לא עולה לאוויר בלי שלכם.

**הוכחה**
אני בונה מותגים ומעצב מוצרים כבר 20 שנה. הובלתי את העיצוב של אפליקציית הליווי לטיפול של VIBRANT, שהטיפול שלה נבחר לרשימת ההמצאות הטובות של TIME ל-2023, ועבדתי על המותג של VIBRANT ושל AposHealth.

**CTA סוגר**
- שורה: מתחילים בבדיקה החינמית. הממצאים נשארים אצלכם בכל מקרה.
- כפתור: לבדיקה החינמית שלי

**NEEDS YOUR EYES:** all copy above (voice, the VIBRANT/TIME wording, and the "I sign it off" promise, which commits Dave's time on every client asset).

---

## 5. Legal lines (short)

- **HealthTech claims:** every claim in a client asset needs a linked source in the genome's claims ledger and the client's own legal/medical OK. No implied FDA or MoH endorsement, no diagnostic or efficacy claims without clearance (FDA letters to SeniorLife and Whoop; Israeli MoH advertising rules, RESEARCH §3). The scorer fails unsourced claims; it does not judge whether a sourced claim is lawful. Same rule for 3S's own proof lines.
- **Israeli email law (Communications Law §30A):** ads by email/SMS/WhatsApp need prior consent, "פרסומת" in the subject, sender details and an opt-out. Cold exception: one single consent-request offer to a business. Outreach is personal 1:1 notes, not templated ads. Lawyer to confirm whether a person's work email counts as a "business" recipient (RESEARCH §5).
- **LinkedIn:** manual only. No automation, scraping or bulk messaging tools.
- **EU AI Act Art. 50 (in force since 2 Aug 2026):** generators must machine-mark AI output; deployers must disclose deepfakes and AI text on public-interest matters unless a human reviewed it under editorial responsibility. [Inference] The contract names the client as publisher; the human gate gives the editorial-control posture; C2PA/marking from upstream tools is never stripped. Counsel to confirm.
- **Name:** no ® or "TM" claims, no filings, no domain buys until counsel clears the name and Dave approves the spend. In Israel ® may be used only on registered marks.
- **NEEDS YOUR EYES / lawyer:** trademark clearance, client contract terms (publisher, claims responsibility, AI disclosure), and the §30A work-email question.

---

## 6. P1 "Done when" checklist

| Item (from PROGRAM-BRAND-OS §6) | Status | Note |
|---|---|---|
| Positioning (EN + HE) | **Done (draft)** | §2. NEEDS YOUR EYES |
| Product name check: domains | **Done** | .com and .ai via RDAP; .co.il by DNS only (no .il RDAP) |
| Product name check: app stores | **Done** | Play + App Store, no collision |
| Product name check: trademark | **Partial** | US mirror sites only; BRANDPLUG (live, class 35) flagged. Formal ILPO/USPTO/EUIPO clearance: **NEEDS YOUR EYES / lawyer** |
| Name cleared | **Not done** | Blocked on counsel. Brandplumb is a working name only |
| Offer copy HE/EN | **Done (draft)** | §4. NEEDS YOUR EYES |
| One-page product spec | **Done** | §3 |
| Identity board on 3SDS | **Not started** | Not in this shift's brief. Next step 3 below |
| Legal lines | **Done (short)** | §5 |

### Next 3 steps for P2 (MVP, due Fri 20 Nov)
1. **Fictional demo startup genome + end-to-end run:** write a genome for one clearly fictional HealthTech startup, produce 5 assets through the production skills, score them with `scorer.py`, and show the before/after in a first Command view on staging.
2. **Scorer v0.2 toward the "10/10 planted errors" gate on the fictional brand:** add a claims ledger (approved claims matched from the genome, not regex) and Hebrew voice checks, keep the 10 planted-error fixtures passing.
3. **Identity board + AI Visibility prototype:** a Brandplumb identity board on 3SDS (staging only, name marked "working name, not cleared"), and a fixed prompt set run on 3S's own brand as the template for the free "How AI sees your brand" audit, so `/audit/` can match its CTA in P3.
