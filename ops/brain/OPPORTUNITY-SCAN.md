# 3S Opportunity Scan · where real revenue can come from (14 Nov 2026)

> Strategy/research team, run of 2026-11-14. Facts come from pages opened during this run (Sources at the end). Lines marked **[Inference]** are our own reasoning, not sourced claims. Revenue figures are scenario math built on *market* price benchmarks, not 3S prices. No prospect names, no personal contact details (public repo). Product states come from `ops/brain/brain.json` as of 14 Nov.

## Verdict (10 lines)

1. **Hard filter applied (Dave, 14 Nov):** recommend only AI products that run end to end on their own (sales, delivery, support, billing) and are disruptive. Autonomy below 7 → not recommended. Eligible, ranked (/90): **D** self-serve Hebrew AI receptionist on WhatsApp (61) · **G** AI privacy-compliance kit (53) · **H** AI accessibility audit + monitor (51) · **E** J8NIX SaaS (36). Filtered out despite scores: B SH✡MER Command (54, autonomy 3: councils buy through meetings and contracts), C patient retention (45), A Brand OS (41), F claim-prep (41), J Arabic intake (33).
2. **Our own funnel proves the filter right:** human-sold services = 72 sent → 25 accepted → 3 replies → 0 calls → $0 (brain.json, 14 Nov).
3. **30-day recommendation (fastest cash): D, rebuilt as a product, not a service.** A business owner opens a Hebrew page, chats with an onboarding agent for ~10 minutes (it reads their website/Google profile, asks hours, prices, FAQs), connects their WhatsApp number, starts a free trial, pays by card monthly; the agent then answers customers, takes booking requests, sends reminders and hands off to the owner. Support is the same AI. No human per sale.
4. **What it disrupts:** today an Israeli SMB pays a builder from $1,000 setup + monthly fees and waits days (Achiya Automation), or wrestles English DIY flow builders ($79–$279/mo, respond.io). D makes that a ~10-minute, no-setup-fee, Hebrew-native subscription and replaces the part-time receptionist on WhatsApp. [Inference: 10× faster and ~10× cheaper to start.] Why incumbents struggle: local builders' business is billable setup hours; global platforms are flow builders in English that sell to ops teams, not to a Hebrew-speaking therapist on her phone; Hebrew + Arabic, Israeli privacy law (Amendment 13) and §30A-safe defaults are built in. Honest caveat: the moat is speed and localisation, not tech; plan to compound it with per-vertical data.
5. **12-month big bet: D scaled into a vertical platform:** Hebrew + Arabic (Arabs ~21% of the population, a language moat), vertical packs (clinics/therapists first, then salons, real-estate, councils' resident hotlines), payments and deposits inside the chat, and G (privacy kit) bundled as a paid add-on. Every customer chat carries a small "built with" link → each customer advertises the product (product-led growth, zero ad spend). SH✡MER Command stays a separate, human-sold track only if Dave relaxes the filter.
6. **Step 1 (Claude, days 1–5):** build the Hebrew onboarding agent + agent runtime on the official WhatsApp Cloud API, test number, clinics/therapists template (FAQ, booking request, reminder, handoff, opt-out), privacy notice auto-generated per business.
7. **Step 2 (Dave, one time, ~30 min):** the Meta business verification / app setup that needs his identity, and one OK on the public price and terms. [Inference: Meta requires a verified business and app review for third parties to onboard other businesses' numbers; check exact Tech Provider steps before building.]
8. **Step 3 (Claude, days 5–10):** self-serve checkout + subscription (Lemon Squeezy or Grow), free trial, auto-cancel/refund rules, AI support inside the same WhatsApp line.
9. **Step 4 (Claude, days 10–30):** zero-spend inbound only: a free "how fast does your business answer WhatsApp?" checker page, Hebrew SEO pages per vertical, organic posts on Dave's existing accounts; no cold messages (avoids §30A and Dave's send rules).
10. **Step 5 (weekly):** kill/scale metric: by day 30 ≥ 3 businesses through onboarding without help and ≥ 1 paying; by day 60 ≥ 10 paying, else pivot vertical or stop.

## Portfolio verdict (every existing product)

| Product | Verdict | One-line why | Next step |
|---|---|---|---|
| SH✡MER app (closed beta) | **Keep** | It is the proof and data source behind Command; B2C safety apps rarely pay, so it is the funnel, not the till | Finish the 14-day closed test; no new B2C features |
| SH✡MER Command | **Keep, don't expand under the autonomy filter** | Strongest asset with a real buyer (exemption-cap path, fresh Comptroller recommendation), but councils buy through people, meetings and contracts (autonomy 3) | Keep the existing council drafts running; if Dave relaxes the filter, it is the #2 bet. Self-serve variant for community security squads is untested [Inference] |
| SH✡MER Nature | **Merge / park** | Already a layer inside SH✡MER; no buyer identified; zero score in the 4 Nov review | Stay "coming soon" until Command has one paying council |
| SH✡MER iOS | **Park** | Matters for diaspora B2C, not for councils (dashboard is web) | Revisit after the first council pilot |
| J8NIX | **Keep internal; merge into D** | Productising it means fighting monday.com, Notion, ClickUp with AI built in; its real value is running 3S, and its chat-first console is the natural owner dashboard for D | No outside marketing for 12 months; reuse its chat + stats screens as D's owner app |
| LickPick | **Park after kill-test** | Consumer music niche, $0 sales, 0 Play testers; kill rule already set (0 sales 30 days after live) | Let Lemon Squeezy go live, run the 30-day rule, no new work |
| Trashure Hunters | **Park (spin-out candidate)** | Kids' eco AR game needs sponsors/CSR money and big content spend; no buyer in hand | Keep APK + site; revisit only if a sponsor or grant shows up |
| Chore Royale | **Park → kill on 21 Dec** | Crowded consumer chores-app space [Inference: OurHome, Sweepy-type apps; not opened this run]; no family test run | Kill on 21 Dec unless the 10-family test has run |
| Milo | **Park** | Kids' emotional-support is regulated, needs clinicians and crisis protocols; high risk, long road | Only with a clinical partner; no build |
| R&K (Rookie & King) | **Kill** | Concept only; networking/gamified-connections space has no paying signal here | Mark retired (code kept) |
| WH33LZ | **Park (not under 3S revenue plan)** | Hobby-sized niche against free navigation giants [Inference]; last attempt rated 1/10 by Dave | Revisit only as a personal project |
| FaiRent | **Park → kill on 21 Dec** | Renters' app with no buyer or channel identified; brand still mid-rename | Kill on 21 Dec unless a partner (landlord body/municipality) asks |
| EZRA | **Kill unless Dave names a buyer** | Offline concept; nothing in brain.json beyond "parked to 21 Dec" | One-line Dave call on 21 Dec |
| 4 IG media accounts (meetinq.ai, getfetch.ai, dealxscout.ai, echoxreels) | **Park, outside 3S** | Dave wants them 3S-free; logged out, 0 followers' revenue; audience-media income takes many months | Keep handles; stop production until D and B produce cash |

**Belongs under 3S:** SH✡MER (+ Command, Nature), J8NIX, the new D line, studio services. **Outside 3S or spin-out:** IG media accounts, WH33LZ, Trashure Hunters (if ever funded), LickPick (if it survives its kill rule).

## Scoring table

Scale 1–10 (autonomy and disruptiveness 0–10), **higher is always better** (Competition 10 = little competition; Effort 10 = little build effort; Risk 10 = low risk; Days 10 = cash within ~2 weeks; Autonomy 10 = no human in sales, delivery, support or billing). All scores are team judgement [Inference] on the sourced facts below.

| Option | Days to first ₪ | 12-mo revenue | Recurring | Dave's edge | Build effort | Competition | Risk | **Autonomy** | **Disruptive** | **Total /90** | Recommend? |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **D** Self-serve Hebrew AI receptionist (WhatsApp) | 8 | 6 | 9 | 6 | 7 | 5 | 6 | 7 | 7 | **61** | **Yes (30 days + 12 months)** |
| **B** SH✡MER Command (councils) | 3 | 6 | 8 | 9 | 7 | 6 | 6 | 3 | 6 | 54 | No (human B2G sale) |
| **G** AI privacy-compliance kit (Amendment 13) | 6 | 4 | 6 | 4 | 7 | 5 | 8 | 8 | 5 | 53 | Yes, as D add-on |
| **H** AI accessibility audit + monitor (IS 5568) | 7 | 5 | 5 | 7 | 6 | 3 | 8 | 7 | 3 | 51 | Eligible, low disruption |
| **C** Patient-retention design-as-outcome | 4 | 6 | 5 | 10 | 6 | 4 | 4 | 2 | 4 | 45 | No (human service) |
| **A** 3S Brand OS (funded startups) | 3 | 5 | 7 | 6 | 5 | 2 | 5 | 4 | 4 | 41 | No (human CD gate, crowded) |
| **F** War-compensation claim-prep for CPAs | 4 | 4 | 4 | 3 | 5 | 6 | 6 | 5 | 4 | 41 | No |
| **E** J8NIX as SMB SaaS | 2 | 2 | 9 | 4 | 3 | 1 | 4 | 8 | 3 | 36 | Eligible, not competitive |
| **J** Arabic mental-health intake | 2 | 3 | 7 | 2 | 4 | 2 | 2 | 5 | 6 | 33 | No (clinical risk) |

Why D's autonomy is 7, not 10 [Inference]: Meta business verification and WhatsApp number connection can stall a non-technical owner; refunds/disputes and legal complaints still need an owner of last resort. Target 9 by month 3 with guided embedded sign-up and AI-handled billing support.

## A. 3S Brand OS for funded Israeli startups

- **Who pays:** Seed–Series B founders/marketing leads. Market bands: design subscriptions ~$449–$4,995/mo, Superside from $15,000/mo; AI-visibility tools $95–$495/mo; startup identity projects $5k–$50k (see `ops/brain/brandos/RESEARCH.md`, written in parallel, sourced).
- **Crowding:** brand-governed AI is shipping everywhere: Adobe GenStudio "Brand Intelligence" (Apr 2026), brand.ai ("Brand OS" name already taken), Typeface, Jasper, Frontify Brand Check, Canva brand intelligence, Claude Design locked design systems. GEO trackers from $20–$29/mo entry (Rankscale, Otterly) to $295–$399 (AthenaHQ, Goodie) (rework.com).
- **Our evidence:** 72 founder messages → 3 replies → 0 calls (brain.json funnel). Seed money is thinner (RESEARCH.md: seed/early $719M in Q2 2026).
- **12-month math [Inference]:** 2 retainers from month 4 at a mid-band ~$2,000/mo + 3 sprints at ~$4,000 = ~$16k + ~$12k ≈ **$28k**. Upside $60k if conversion improves.
- **Why lower:** most crowded option, slow cold channel, platforms commoditising the output.

## B. SH✡MER Command for regional/local councils (B2G)

- **Who pays:** council security departments (קב"ט) and emergency managers.
- **Procurement:** below the exemption cap a council can contract without a tender: about ₪143,000 (councils >20k residents) and ₪71,000 (<20k), excluding VAT, as of June 2021; ~50% of audited councils' new engagements in 2018–20 were tender-exempt (State Comptroller, local-authority tender exemptions report). Regulation 3(8) exempts special-expertise work. [Inference: caps are indexed; check the current Ministry of Interior figure before quoting.] Internal note (brain.json, 4 Nov): a per-resident price stays under the cap for all councils ≤20k residents.
- **Why now:** the State Comptroller's 2026 evacuation reports found councils ran alone without a coordinating body, volunteer registration was not uniform (10 of 14 did not run sex-offence checks), resident data sat in Excel, the national "Noah's Ark" system was only partly fed (~9,000 evacuees in 10 days); it **recommends a user-friendly emergency app for residents and a unified, privacy-safe database**, plus a trained volunteer pool. One regional council built its own app (Comptroller 2026). Israel's IIA runs GovTech calls for public-sector innovation.
- **Competitors:** big-city apps (Tel Aviv 106+, Jerusalem municipality app), national alert apps (Home Front Command, Red Alert/Tzofar), Carbyne (next-gen 911, Tel Aviv), emergency population-management vendors (e.g. Orhitec), GIS vendors for communities. [Inference: none is a citizen-guardian + volunteer-squad + council dashboard aimed at small/regional councils.]
- **Sales cycle:** government tech purchases averaged **22 months** to close (Gartner 2022 via Starbridge, US data). [Inference: an under-cap Israeli pilot can be 2–6 months because it skips the tender.]
- **12-month math [Inference]:** 3 councils × ~₪45k/yr pilot = **₪135k (~$37k)**; month-12 run-rate if 6 councils: ~₪270k/yr. Tnufa (answer ~end Jan 2027) would fund product, not sales.
- **Risks:** long cycles, elections/budget freezes, data-privacy duties (Amendment 13 applies to public bodies with DPO duty), reliance on one or two champions.

## C. Patient-retention / engagement design-as-outcome (digital health)

- **Who pays:** digital-health product/marketing leads. Israel has 1,600+ health-tech companies; digital health raised $545M in 2024 (Start-Up Nation Central). Typical health-tech UX engagement $15k–$50k; sprints ~$5k; full redesign $150k+ (925Studios, self-published, treat as directional).
- **Pain:** health apps keep ~20–30% of users on day 1 and ~3–4% at day 30 (fitness); a scoping review found a median 70% quit within 100 days (Sahha, citing a peer-reviewed review).
- **Dave's edge:** the strongest of all options: VIBRANT companion app, clinical study 2× retention (68% vs 34%), TIME Best Inventions 2023.
- **Competitors:** healthtech UX agencies (Cieden, ANML, Guidea, Clay etc.), engagement platforms. 
- **12-month math [Inference]:** 2 projects × $25k + 1 retainer $3k × 6 = **~$68k**; but needs calls we are not getting (0 from 72 sends). Outcome-based pricing (bonus on retention lift) is the differentiator.

## D. Hebrew AI agents for Israeli SMBs (WhatsApp reply / booking / follow-up), redesigned as a self-serve autonomous product

- **Autonomous design [Inference]:** sales = inbound pages + free checker + in-chat "built with" link (no cold outreach); delivery = onboarding agent builds the bot from the owner's answers and website; support = the same AI on WhatsApp with escalation only for refunds/legal; billing = card subscription with trial and dunning (Lemon Squeezy / Grow). Dave's role: one-time Meta verification, price approval, monthly review.
- **Disruption:** removes the setup project (days + $1,000–2,000) and the English flow-builder learning curve; first answer live the same day. Makes the "WhatsApp bot builder" freelancer model and the part-time phone receptionist obsolete for small appointment businesses.

- **Who pays:** owner-run service businesses: clinics, therapists, salons, real-estate agents. Israel had ~610,000 small businesses in 2022, ~97% of all businesses; 21% are professional/technical services (State Comptroller 2025). [Inference: tens of thousands of appointment-based businesses.]
- **Market prices (comparables):** Israeli builder: from $1,000 setup (basic bot) / $2,000 (with CRM), plus ₪100–300/mo managed infrastructure, ₪500/mo optional support (Achiya Automation). Global platforms: respond.io $79/$159/$279 per month (AI agents from the $159 Growth plan) (eesel). [Inference: local Hebrew builders win on setup + language + handholding; platforms win on price for DIY owners.]
- **WhatsApp rules and costs:** per-message pricing since 1 Jul 2025; service replies inside a 24h customer-started window are free, utility templates inside the window are free (Meta). Israel rates (Oct 2026): marketing $0.0353, utility $0.0053, authentication $0.0053 per message (Mumble, from Meta's rate card). From 15 Jan 2026 Meta bars *general-purpose* AI assistants on the Business API; a business's own customer-service bot is still allowed (TechCrunch).
- **Legal:** Amendment 13 in force since 14 Aug 2025: data mapping, minimisation, security, notice; civil compensation up to ₪10,000 without proof of harm (Chamber of Commerce). Health/therapy data is sensitive → design for minimal storage. Anti-spam §30A: marketing messages need prior consent; ~₪1,000 per message without proof of harm (see RESEARCH.md source). Reminders and replies to the customer's own request are service messages [Inference: keep templates in "utility" category].
- **Build effort [Inference]:** ~2–4 weeks for Claude agents to ship onboarding agent, runtime, billing and support on the official Cloud API; per-customer setup effort ≈ 0 after that.
- **Churn risk [Inference]:** micro-businesses churn when the bot annoys customers or the owner stops updating answers; mitigate with a weekly AI "answers refresh" prompt to the owner and a monthly value report (questions answered, bookings, no-shows avoided).
- **12-month math [Inference]:** self-serve subscription, no setup fee, at a monthly price inside the market band (₪100–300 infra comparables + the value of a receptionist) — assume ~₪250/mo average. Ramp: 3 paying by month 1, +8/month net from month 3 (inbound + "built with" loop) → ~90 paying at month 12, average ~45 over the year → 45 × ₪250 × 12 ≈ **₪135k (~$37k) in year 1**, exit run-rate ~₪270k/yr, ~100% recurring. Upside case (Arabic + 3 verticals, 300 paying by month 12): ~₪900k/yr run-rate. Downside: <10 paying by day 60 → stop.
- **Variable cost per customer [Inference]:** service replies free in the 24h window; utility reminders ~$0.0053 each (≈100/month ≈ $0.53); LLM cost per conversation small at SMB volumes; hosting shared.

## E. J8NIX as a Hebrew-first AI operations app for SMBs/managers

- **Competition:** monday.com already ships AI agents, Sidekick and credits-based AI pricing tied to seats (monday.com support, Q1 2026 results coverage); Notion, ClickUp, Asana bundle AI too. monday.com is Israeli and Hebrew-capable.
- **State:** built as Dave's internal hub; not multi-tenant, no onboarding, no buyers.
- **12-month math [Inference]:** best case 20 paying seats × ~$20/mo × 6 months = **~$2.4k**. Not a revenue path in 12 months; strong internal tool and a future client console for D.

## F (new). War-compensation claim-prep tool for CPA offices

- **Why now:** ~525,000 indirect-damage claims filed by Oct 2024; ₪16.9bn paid by May 2025 against ~₪23bn claimed; new advance-payment tracks for frontier businesses after the 2026 operation (gov.il service pages). Businesses waited ~57 days on average before rules even allowed filing; red-route claims need detailed proof (inventory, contracts, invoices) (State Comptroller 2026).
- **Who pays [Inference]:** CPA and tax-advisor offices (they represent clients; representation is a licensed activity), as a document-intake + checklist + calculation-draft tool.
- **Why lower:** irregular demand (per conflict), regulated work, Dave has no edge with accountants; fee levels for claim filing were not found published.

## G (new). Amendment 13 privacy kit for micro-clinics and therapists

- **Why now:** in force since Aug 2025; regulator can levy administrative fines, civil claims up to ₪10,000 without proof of harm (Chamber of Commerce); first enforcement fine already reported (Shibolet update). A bank (Mizrahi-Tefahot) now offers an outsourced DPO service to business clients, a demand signal.
- **Who pays [Inference]:** clinics/therapists who hold sensitive records but have no lawyer on retainer; packaged data map + policy + intake-form fixes, reviewed by a partner lawyer.
- **Best use:** as the differentiator inside D ("a WhatsApp agent built privacy-first"), not a stand-alone business (Dave is not a lawyer; law firms dominate).

## H (new). Website accessibility (IS 5568) fix-and-monitor for SMBs

- **Why now:** businesses must meet IS 5568 (WCAG 2.0 AA); apps on two major OSes (Bar Law). Damages up to ₪50,000 without proof of harm; full exemption only under ₪100k turnover, automatic renewable exemptions up to ₪300k, partial up to ₪1M (Kol Zchut). Class-action enforcement has risen sharply (Bar Law).
- **Who pays:** SMBs over ~₪1M turnover with public websites/apps; health providers are a frequent target (Level Access, US).
- **Competition:** accessibility plugins and consultants (Equalweb, UserWay etc.) and many local experts → price pressure.
- **Edge:** Dave's UX skill + AI agents for audits; this is legal-compliance work, not branding. Mostly one-off with a monitoring tail.

## J (new). Arabic-language mental-health intake/triage

- **Why now:** Arabs are ~21% of the population but 1.9% of psychiatrists and 1.4% of clinical psychologists (Myers-JDC-Brookdale); war-driven demand rising and a ₪1.4bn/yr national mental-health program (Bank of Israel 2026).
- **Why last:** clinical-safety and regulatory risk, needs a clinical partner and health-fund procurement; no Dave edge in Arabic clinical services.

## Autonomy and disruption notes for the other eligible options [Inference]

- **G (autonomy 8, disruption 5):** an AI that interviews a micro-business, maps its data, and outputs the privacy notice, intake-form wording and security checklist; replaces hours of lawyer time for a few-hundred-shekel product. Law firms and DPO outsourcers sell hours, so they won't price this low. Risk: it must not be presented as legal advice; a lawyer-reviewed template base is needed once. Best sold inside D.
- **H (autonomy 7, disruption 3):** automated crawl + WCAG/IS 5568 report + monthly monitoring is autonomous, but fixing sites needs site access, and overlay plugins (Equalweb, UserWay) already occupy the cheap end. Incremental, not disruptive.
- **E (autonomy 8, disruption 3):** self-serve SaaS is autonomous, but monday.com and peers already ship AI agents; no reason for a buyer to switch.
- **B (autonomy 3):** product delivery is software, but council sales, contracts and invoicing need people; the Comptroller-backed opportunity is real, it just fails Dave's filter.

## Other money already on the table (not a strategy, just cash)

- VIBRANT delivery awaiting approval/payment (brain.json).
- Contract/senior design roles queued by the CRO desk (brain.json decisions 13 Nov): fastest personal cash, but they are design work and time-bound.

## Sources

- Meta, WhatsApp Business Platform pricing: https://developers.facebook.com/docs/whatsapp/pricing
- Mumble, WhatsApp message prices for Israel (Oct 2026): https://mumble.co.il/messages-pricing-calculator/
- TechCrunch, WhatsApp bars general-purpose chatbots (effective 15 Jan 2026): https://techcrunch.com/2025/10/18/whatssapp-changes-its-terms-to-bar-general-purpose-chatbots-from-its-platform/
- Achiya Automation, Israeli WhatsApp bot pricing: https://achiya-automation.com/en/pricing/
- Achiya Automation on dev.to, lessons from the Israeli market: https://dev.to/achiya-automation/building-whatsapp-automation-for-small-businesses-lessons-from-the-israeli-market-2b4a
- eesel, respond.io pricing 2026: https://www.eesel.ai/blog/respond-io-pricing
- State Comptroller 2025, small businesses (Swords of Iron): https://library.mevaker.gov.il/sites/DigitalLibrary/Documents/2025/Swords-of-Iron-3/2025.6-Small-Businesses-Taktzir-EN.pdf
- Chamber of Commerce, Amendment 13 summary: https://www.chamber.org.il/serviceslobby/legal/74023/164240/
- Shibolet, first enforcement under Amendment 13: https://www.shibolet.com/?p=26776
- Mizrahi-Tefahot, DPO service for businesses: https://www.mizrahi-tefahot.co.il/info-for-our-customers/businesses-from-south/businesses-dpo-service/
- State Comptroller, local-authority tender exemptions (Shilton 104): https://library.mevaker.gov.il/sites/DigitalLibrary/Documents/2022/Shilton/EN/Shilton-104-Ptor-Michraz-Taktzir-EN.pdf
- State Comptroller 2026, evacuation / local-authority emergency report: https://library.mevaker.gov.il/sites/DigitalLibrary/Documents/2026/Evacuation/2026-Evacuation-207-Taktzir.pdf
- State Comptroller 2026, war compensation (Tax Authority): https://library.mevaker.gov.il/sites/DigitalLibrary/Documents/2026/Emergency/2026-Emergency-101-Tax.pdf
- gov.il, advances for frontier business owners (2026 operation): https://www.gov.il/he/service/pay-advances-to-business-owners-in-frontier-roaring-lion
- Starbridge, government sales cycle (Gartner 2022, 22 months): https://starbridge.ai/blog/how-to-shorten-government-sales-cycle
- GovInsider, Israel challenge tenders: https://govinsider.asia/intl-en/article/exclusive-israel-issues-challenge-tenders-to-buy-from-startups
- Israel Innovation Authority, GovTech call: https://innovationisrael.org.il/en/?p=1039
- Carbyne approved by Tel Aviv (Calcalist): https://calcalistech.com/ctech/articles/0,7340,L-3838352,00.html
- Orhitec, emergency population management: https://www.orhitec.com/wp-content/uploads/2026/02/emergency-population-management.pdf
- Tel Aviv municipal mobile apps: https://www.tel-aviv.gov.il/Transparency/Pages/MobileTLV.aspx
- Start-Up Nation Central, Israeli health-tech landscape: https://www.prnewswire.com/il/news-releases/startup-nation-central-launches-the-israeli-health-tech-top-100-of-2024-landscape-map-302358543.html
- 925Studios, healthtech UX agencies and price ranges: https://www.925studios.co/blog/best-ux-agencies-healthtech-2026
- Sahha, health-app retention benchmarks: https://sahha.ai/blog/health-app-churn-retention/
- Rework, AEO/AI-visibility tool prices: https://resources.rework.com/tools/aeo-ai-visibility/best-aeo-tools-2026
- Adobe, Brand Intelligence in GenStudio: https://news.adobe.com/news/2026/04/adobe-introduces-brand-intelligence
- monday.com, AI pricing model: https://support.monday.com/hc/en-us/articles/35277848309394-The-pricing-model-for-monday-AI-portfolio
- Kol Zchut, website accessibility exemptions and ₪50,000 compensation: https://www.kolzchut.org.il/he/פטור_מחובת_הנגשה_לאתרי_אינטרנט_ואפליקציות
- Bar Law, accessibility class actions in Israel: https://barlaw.co.il/?p=22706
- Level Access, health-care accessibility suits: https://www.levelaccess.com/blog/the-prognosis-is-bleak-more-health-care-companies-are-being-sued-for-lack-of-digital-accessibility/
- Jewish Agency, reservist-spouse business grants (₪60M): https://www.jewishagency.org/supporting-reservist-business-owners/
- Myers-JDC-Brookdale, shortage of Arab mental-health professionals: https://brookdale.jdc.org.il/en/publication/shortage-arab-professionals-mental-health-services-causes-solutions/
- Bank of Israel 2026, mental-health system box: https://boi.org.il/media/c3wpnb3g/2026-3-box-on-mental-health-system-pr.pdf
- Internal: `ops/brain/brain.json` (products, funnel, decisions, 14 Nov 2026); `ops/brain/brandos/RESEARCH.md` (Brand OS market research, 14 Nov 2026)
