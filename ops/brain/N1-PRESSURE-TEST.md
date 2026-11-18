# N1 pressure test · "J8NIX as the engine, N1 as its first product" (18 Nov 2026)

> Independent investment committee + red team, run of 2026-11-18. Tests concept N1 from `MOONSHOT-SCAN.md` (14 Nov). Facts come from pages opened in this run (Sources at the end); a few figures are carried over from `MOONSHOT-SCAN.md`, which sourced them, and are marked **(MS)**. Lines marked **[Inference]** are our reasoning, not sourced facts. No 3S prices, no private names, no personal contact details (public repo). Nobody was contacted.

## TL;DR (plain words)

1. **The need is real.** About 392,000 older Israelis get the nursing benefit. Yearly spend went from ₪7bn to ₪21.1bn. Families struggle with forms.
2. **But the forms are not the hard part.** The level depends on the parent's real condition. Good paperwork helps; it cannot invent a level. We have no proof yet that our help changes the result.
3. **There is a lot of free help.** NII hotline *9696, social workers, health-fund nurses, Kol Zchut, care agencies. A family will ask: "why pay you?"
4. **Legal: better than feared, still not clear.** The NII fee-cap law lists 9 benefits, and nursing is not one of them. But the Bar law limits who may write legal papers for others. Health data is "sensitive" data under Amendment 13.
5. **"J8NIX as the engine" is the wrong frame.** J8NIX is Dave's internal task and approval app. It is not a claims engine. Keep it as the control room only. Never put parents' medical files in the same database.
6. **A real money comp exists:** Turnout (USA) raised $21M seed, then $35M at a $400M valuation 9 months later. It uses AI plus *licensed human advocates*. No winner is pure AI.
7. **Israel alone can't reach $2B.** At 21× revenue (top AI multiple) $2B needs ~$95M ARR. That means about $240 a year from the family of *every* eligible senior in Israel (100% market share). Not possible.
8. **A $2B path exists only with the USA or Germany next**, a paying partner (insurers, employers, health plans) and licensed humans in the loop. That is a 7–10 year, $250M+ venture story, not a solo zero-budget one.
9. **Investors are cold on solo founders:** over 75% of Israeli pre-seed VCs made no solo-founder deals in 2025. Median pre-seed is $1M.
10. **Verdict: PIVOT, don't kill.** Run N1 as a small, paid Israeli test product for 30 days. Measure whether families pay. Drop the "$2B / J8NIX engine" story until the numbers exist.
11. **Three things must be true:** families pay; a lawyer says the model is legal; our packet saves real time or changes results.
12. **Day-30 gate:** at least 300 checker finishes, 40 packet requests, 8 paying families, and a written legal opinion. Miss two of these and stop.

---

## 1. Kill test · the 5 strongest reasons N1 dies (each with a cheap 2-week test)

| # | Why it dies | Evidence | Cheapest test, 14 days, ₪0 | Gate (pass / fail) |
|---|---|---|---|---|
| K1 | **Free help is good enough. Families won't pay.** | The claim form is online, with photo uploads. Family members may file. NII *9696 helps fill the form. Health-fund nurses and welfare social workers add a support form. Hotlines *8840, 118, *6050 also exist (Kol Zchut, filing page). Care agencies have a reason to file for free **[Inference]**. | Public, Hebrew "Is mum getting the right level?" checker page. Posted only as public posts (Dave's accounts, public caregiver groups) — no direct sends. Last screen: "Get your full claim pack" with a real "reserve" button. No charge until Dave approves a price. | Pass: ≥ 10% of finishers click "reserve" and leave a phone number. Fail: < 3%. |
| K2 | **Paperwork doesn't change the outcome.** The level comes from an ADL test of the real condition. | NII sets the level from documents first and visits only if needed (Kol Zchut, fast track). Approval: 57.8% new claims, 43.0% upgrades **(MS)**. NII may not lower or remove the benefit at a re-check (Kol Zchut, re-check), so asking costs little — but the score depends on function, not prose. | Score 10 anonymised, public, worked examples (Kol Zchut cases, forum posts) with the agent. Ask 2 social workers / ex-assessors (Dave's own network; Dave asks, not us) one question: "How often is a wrong level caused by missing or poor documents?" | Pass: experts say "often" (≥ 1 in 4 cases). Fail: "rarely; it's the condition." Then the product is a convenience, not a money-maker. |
| K3 | **Legal: it counts as unlicensed legal work, or a new fee cap lands.** | The fee-cap law covers: general disability, work injury, special services, mobility, disabled child, volunteers, rehab, ringworm, polio. Nursing is **not** listed (NII fees page). Paid helpers must sign a written agreement, with a 7-working-day cancel right, and the client may get free legal aid instead (Kol Zchut, agreement). The Bar sued an accountant under Section 20 for preparing legal-type papers for others (Srugim). | Send one written question to a university law clinic or a pro-bono desk (Dave's OK needed; free). Ask three things: (a) is a self-filed, AI-prepared NII nursing claim "legal work"? (b) may we charge a success fee on nursing and health-fund LTC claims? (c) what goes in the consent form? | Pass: written "yes, with these conditions." Fail: "only a lawyer may do this" → turn into a free tool, or partner with a law firm. |
| K4 | **No trust, no reach.** A stressed daughter won't upload her father's medical file to an unknown solo startup. Our cold funnel is already proven dead. | 3S outreach: 72 sent → 0 calls (OPPORTUNITY-SCAN). Amendment 13 allows court damages up to ₪100,000 without proof of harm (MineOS). | Same checker page. Measure who reaches the "upload the health-fund printout" step. | Pass: ≥ 30% of reservers upload a document within 48 h. Fail: < 10%. |
| K5 | **The $2B frame and solo setup kill the raise, even if the product works.** | Over 75% of Israeli pre-seed VCs made no solo-founder investment in 2025; median pre-seed $1M at a $6.8M cap (VC Cafe). Israel alone is too small (section 7). Families leave when the parent dies or reaches level 6 **[Inference]**. | Write a 1-page "N1 investor memo" with the honest Israel ceiling (section 7). Dave shows it to 3 people he already knows who invest in health or consumer startups (Dave's choice; we send nothing). | Pass: ≥ 1 asks for a follow-up or names a cofounder / clinical partner. Fail: all say "too small" or "come back with US traction." |

## 2. Fail test · pre-mortem (it's November 2027 and N1 failed)

We built a nice Hebrew chat in three weeks. It reads health-fund printouts and fills the NII claim. The landing page got a few hundred visits from Dave's posts and two caregiver groups. About 40 families started. Most stopped at "upload the medical printout and three months of pay slips." The daughter didn't have them, or her brother had them. The 11 who finished liked the packet. Then they asked the health-fund nurse to check it, and the nurse said "you could have called *9696 for free." Three paid. Two of them got level 2, which the parent would likely have got anyway, so they questioned the fee.

The success fee became a fight. NII decisions took weeks. Then the family had to tell us the result and pay. Most didn't. The health-fund insurance claims (the bigger money) went to the insurers' own claim teams, investigators and functional tests. Clalit's plan was changing hands from Harel to Ayalon in January 2027, and Ayalon was the only bidder (Maariv). Every new insurer form broke our templates.

A lawyer friend said the insurance appeals were legal work. The team had to stop at "here is your file, now find a lawyer." The privacy work for medical data (consent, a privacy officer question, a pen test, a separate database) took two months of agent time and pulled us off growth. The monitoring subscription had no clear value between events, so churn was high. Meanwhile, the J8NIX "engine" story ate attention: we built multi-tenant tables for a claims platform that had 3 paying users. With $0 revenue and a solo founder, no investor took a meeting past the first call. N1 was parked in month 9. **[Inference: the whole story is a forecast, built on the sourced facts above.]**

**Most likely single cause:** we built for scale before proving that a family pays for something it can get free.

## 3. Red team

**As a competitor.**
- *Rights-recovery firms and lawyers.* They already have the trust, the free first call and the medical-opinion network **[Inference]**. They can add an AI intake in a month and keep the human close. We have no edge they can't copy, except price.
- *Care agencies (foreign-caregiver companies).* They gain when a family gets more hours **[Inference]**. They will keep filing for free as lead generation. We can't beat "free, and they come to your home."
- *Kol Zchut / NII / Ministry.* Free, trusted, Hebrew + Arabic + Russian content. A free official AI helper is the long-run threat. Germany shows the pattern: consumer centres give a **free** care-level calculator plus an objection-letter generator (Verbraucherzentrale NRW, Aug 2025). The AOK Bayern insurer gives a **free** AI care-level assistant, built by Nui Care (AOK). When the payer or the state does it for free, the consumer price goes to zero.
- *Global players.* Turnout ($35M Series A at $400M, June 2026; AI agent "Jake" plus licensed advocates; disability and veterans first) (Pulse 2.0). Hera ($27M Series A; AI "Juno" plus nurse/social-worker "Heroes"; >1,000 families, 95% retention; no out-of-pocket cost to the family) (Pulse 2.0). Baba ($40M Series A, Oct 2026; >10,000 families; 100,000 on waitlist; CVS Health Ventures) (Pulse 2.0). Waterlily ($7M seed; long-term-care planning sold to advisors at $250/seat/month) (TechCrunch). None is in Israel. But each one shows that the winners use licensed humans and **someone other than the family pays**.

**As Bituach Leumi (NII).** The Comptroller says the 2018 reform was done without actuarial review; spending tripled to ₪21.1bn; the reserve fund runs out by 2035 (JNS on Comptroller 2026). NII's goal is accurate (often lower) spending, not more approvals. It already found it rated need higher than the health funds in 75% of paired cases, and it is reviewing document-based decisions in favour of in-person, video and AI checks **(MS)**. A startup that "raises levels" will be watched closely. AI-written claims that look the same will be flagged **[Inference]**. NII can also simply build a simpler online flow and kill our reason to exist.

**As a health fund / LTC insurer.** Group LTC pays for 5 years and is losing money. More claims and longer care eroded the plan; private LTC insurance "has nearly disappeared"; Ayalon was the only bidder for Clalit's 2.7M members (Maariv). Insurers check through the health funds, NII, hospitals and sometimes private investigators. They reject for "not dependent enough" or "non-disclosure," and sometimes offer short partial payments hoping the family gives up (Mako). They will treat an AI claims helper as a cost driver. They may demand a lawyer's power of attorney before talking to us.

**As a regulator.**
- *Fee caps.* Nursing is not in the NII fee-cap list today (NII fees page), so a success fee is not capped by that law. But any paid helper must use a written agreement, a 7-day cancel right and a notice that free legal aid exists (Kol Zchut). A visible AI firm taking a cut of elderly people's benefits invites a new cap **[Inference]**.
- *Unauthorised legal practice.* Section 20 of the Bar law: the Bar sues non-lawyers who prepare legal-type documents for others (Srugim). Appeals to the NII appeals committee and the labour court are the riskiest part.
- *Privacy, Amendment 13 (in force 14 Aug 2025).* Fines can reach millions of shekels, up to 5% of turnover. A privacy officer (DPO) is required for large-scale or highly sensitive data. Big sensitive databases need risk assessments and pen tests every 18 months. Court damages up to ₪100,000 without proof of harm. Claims can be brought for 7 years (MineOS; Pearl Cohen). An AI that reads parents' medical files *is* sensitive processing. Running it from an AI-agent stack with broad tool access is a security story regulators won't like **[Inference]**.
- *Consumer protection.* "AI does it all" claims are risky. The FTC made DoNotPay pay $193K for its "robot lawyer" claims **(MS)**.

**As a skeptical adult child (50, working, two siblings).** "Who are you? Why does an app need mum's medical file and my dad's pay slips? The nurse at the clinic said she'd help for free. If you take a percentage of mum's benefit, that's money from mum. And if it goes wrong, who do I call? A bot?" Also: siblings disagree; the one with the documents is not the one on the app.

**As the elderly parent (82).** "I don't want to be written up as helpless. I'm not signing a medical-secrecy waiver for a company. My daughter is making a fuss." Dignity matters. Many will refuse the home assessment, or play down their needs on the day. The product must coach honesty, not drama. Russian- and Arabic-speaking parents need the explanation in their own language **[Inference]**.

## 4. Steelman · the strongest honest case it becomes huge

- **The money pool is big and growing.** Israel: 65+ population ~1.29M (13%) at end 2024, heading to ~2M by 2050. Nursing-benefit recipients went from 180,000 to 392,000 after the 2018 reform. LTC spending went from ₪7bn to ₪21.1bn a year (JNS on Comptroller 2026). Per family the stakes are large: ₪1,708–₪7,452 a month from NII, plus up to ₪5,000 a month at home (₪10,000 in an institution) for 5 years from group LTC **(MS)**. LTC insurance can be claimed up to 3 years back (Mako). The US home-care market alone is ~$50bn (TechCrunch, Honor).
- **The process is broken.** 43% of upgrade requests are approved **(MS)**. Insurers use delay and partial offers (Mako). Rules change (the health-fund LTC criteria tightened to 4 of 6 daily activities in 2025 **(MS)**; Clalit's insurer is changing in 2027). Fast-moving rules punish families and reward a system that keeps a live rulebook.
- **Investors are paying for exactly this pattern now.** Turnout: seed $21M (Sep 2025) → $35M Series A at $400M (June 2026), with 5× client growth (Pulse 2.0). Hera $27M A, Baba $40M A in 2026. Exits and unicorns in the wider care space: Honor >$1.25B (2021, $325M equity raised plus $300M debt) (TechCrunch); Papa $1.4B, Cera $1B (Failory); Accolade, a care-navigation company, was bought for $621M (Pulse 2.0). Wellthy (care concierge, 2M covered lives) raised $25.5M more in 2023 (Pulse 2.0).
- **What the winners did that we'd need to copy:**
  1. **A payer other than the family.** Health plans, employers, Medicare/Medicaid programs (Hera: no cost to the family; Baba: health plans and a CMS model; Wellthy: employers and health plans; Papa: insurers — and it lost Humana, Aetna and Molina after a safety scandal (ClearHealthCosts)).
  2. **Licensed humans in the loop** (Turnout's advocates, Hera's nurses, Baba's clinicians).
  3. **One big market** (the USA) with a standard process across millions of cases.
  4. **A team** with domain and go-to-market people.
- **Where Dave's edge is real.** Designing a calm, simple companion for stressed, older users over a long medical process is what these companies need. It is a design-and-retention edge, not a regulatory or distribution moat. *Note: investors will check exactly what Dave did on past products; state each role precisely.*
- **Honest steelman version:** Israel is the *lab* (small, digital, one national insurer, four health funds). Win a measurable result here in 12–18 months. Then enter Germany (care grades assessed by the MD; free tools already exist, so the play is B2B with insurers) or the US (Medicaid LTC and long-term-care insurance claims, B2B2C with employers and insurers). Raise on that result.

## 5. UX audit · the stressed 50-year-old daughter of an 82-year-old parent

**The journey as the concept implies it (and where it hurts):**

| Step | What she sees | Problem | Fix |
|---|---|---|---|
| 1 | Landing page "AI runs your parent's long-term-care money" | Vague and scary ("AI runs" + "money" + "parent"). | Say one concrete outcome: "Find out in 3 minutes if Mum's nursing benefit level is right." |
| 2 | Sign up / create account | Wall before value. | No account until she wants to save something. Phone number only. |
| 3 | Long AI chat interview | 30+ questions at 23:00 on a phone. Words like ADL, level, upgrade (החמרה), income test. | 6 tap-answer questions in daily words ("Can Mum shower alone?"). |
| 4 | "Upload medical documents" | She doesn't have them, or doesn't know what "medical printout" means. | Show a picture of the exact health-fund printout + where to get it (app / clinic). Accept a phone photo. Ask later, not now. |
| 5 | Income documents for parent and spouse, 3 of last 4 months | Feels invasive; often held by a sibling. | Explain why in one line ("full or half benefit"). Allow "send this link to my brother." |
| 6 | Consent forms (privacy, medical-secrecy waiver, fee agreement, 7-day cancel) | Legal wall. | One plain-language consent screen + a short "what we keep, for how long" box. Fee agreement only at payment. |
| 7 | Claim pack ready → "Now file on the NII website" | Hand-off to another site, its login, its upload. Most drop here **[Inference]**. | Step-by-step screens with matching screenshots; offer the printed-form route; show *9696 as a backup. |
| 8 | Home assessment prep | She may not be there; parent downplays needs. | 5-line "what to say honestly, what to show" card, also in Russian/Arabic for the parent. |
| 9 | Waiting weeks → decision letter by post | Silence. | One reminder, and "send us a photo of the letter when it comes." |
| 10 | Health-fund LTC claim (different insurer, forms, investigator) | Second full process, more jargon. | Only offer it if the checker says the parent is likely eligible (4 of 6 activities). |
| 11 | Monthly subscription for "monitoring" | No visible value between events. | Charge per result or per packet; make monitoring a free monthly 2-question check-in. |

**Simplest flow (target: first value in under 10 minutes):**
1. **Minute 0–3:** 6 tap questions, no sign-up, in Hebrew / Russian / Arabic / English.
2. **Minute 3:** result in plain words: "Mum may qualify for a higher level. She may also have health-fund long-term-care insurance. Here's why."
3. **Minute 3–8:** a personal checklist: the 3 documents to get, where to get each, a photo example. Option: "send this list to my brother."
4. **Minute 8–10:** one free action she can do *tonight*: the pre-filled form text to copy, or *9696 with what to say.
5. **Later, paid:** "Send us the photos → we prepare the full pack and the assessment card within 24 h." Pay only when the pack is ready.

Rules: no jargon on screen; one question per screen; big text; works on WhatsApp-style chat or a plain web page; never ask for income or medical files before showing value.

## 6. System audit · is "J8NIX as the engine" the right base?

**What J8NIX actually is (from the repo):** the 3Shamrocks command center. It's a Supabase app (`j8_tasks`, `j8_approvals`, `j8_messages`, `j8_projects`, `j8_runs`) with an Android client (`/j8`, `/j8-android`). It ranks Dave's to-dos, holds drafts for his OK, and gives push alerts (`J8NIX-V6-PLAN.md`, `J8NIX-DATA.md`, `J8NIX-COMMS.md`). It's an internal ops and approval console.

**Verdict: a distraction as the "engine"; useful as the control room.**
- What carries over: the approval gate (nothing goes out without OK), task dependencies and reminders, row-level security patterns, the phone alert standard.
- What N1 needs that J8NIX doesn't have: document reading of Hebrew medical printouts, a rules engine for NII + four health-fund policies, a case timeline per family, consent records, audit logs, encryption, data retention, and a family-facing UI.
- **Hard rule:** parents' medical data must never live in the J8NIX/studio Supabase project. It needs its own project, its own keys, minimum data, auto-delete, and no broad agent access. Amendment 13 fines and ₪100K no-proof damages make a shared database a company-ending risk **[Inference, on MineOS facts]**.
- "J8NIX as engine" is an investor story with no customer under it. Pitch N1 alone.

**Autonomy score per stage (0 = all human, 10 = no 3S human):**

| Stage | Score | What still needs a human | Liability / risk |
|---|---|---|---|
| Acquisition | 4 | Trust is built through people: social workers, caregiver groups, Dave's face. Public posts can be automated; cold messages can't (Dave's rules + funnel data). | False or inflated claims in ads (consumer law). |
| Onboarding | 8 | Edge cases: dementia, guardianship, sibling conflict. | Wrong person consenting for the parent. |
| Document intake | 7 | Bad photos, handwriting, missing pages; a human spot-check in the first 100 cases. | Misreading a diagnosis. |
| Claim prep | 7 | Clinical judgment on function; a nurse or social worker should review early packets. | **Inflating need = fraud risk.** Rule: accurate only. |
| Filing | 9 (family files) / 2 (we file) | Family must submit themselves; we should not log in as them. | Filing on someone's behalf without a mandate. |
| Follow-up | 8 | Reading posted decision letters. | Missed deadlines (insurance limitation 3 years; appeal windows). |
| Appeals | 2 | NII appeals committee and labour court; insurance disputes usually need a lawyer (Mako). | Section 20 (unauthorised legal work). |
| Billing | 6 | Success fees need proof of the result and chasing; refunds and disputes. | Taking a cut of an elderly person's benefit = reputation risk. |
| Support | 6 | Crisis moments (death, hospital, abuse signs) need a human. | Emotional harm; elder-abuse signs must be escalated. |

Average ~6. N1 fails a strict "autonomy ≥ 7" filter if appeals and acquisition count.

**Data security minimum before the first real file:** separate database and storage; encryption at rest; logging of every access; no medical data sent to tools that don't need it; written consent per family; a retention limit (e.g. delete files after the case closes); a privacy-officer decision; a pen test before scale (MineOS).

## 7. The $2B path · honest math

**What $2B means in revenue (2026 multiples):** SaaSRise lists a private VC median of ~21× revenue for AI-native companies (50–100%+ growth), ~8.5× for AI-enabled, ~5.5× for plain SaaS; M&A deals are lower, ~11.5× / 7× / 3.8×. Treat these as soft: it's a marketing source.
- At 21× → **~$95M ARR**, still growing 50%+ a year.
- At 10× → **~$200M ARR**.
- At 5.5× → **~$365M ARR**.
- Real anchor: Turnout got $400M on undisclosed revenue *with* US scale and licensed advocates. $2B is ~5× that.

**Can Israel alone get there? No.**
- ~392,000 nursing-benefit seniors in all (JNS). ~293,000 NII filings a year (new + upgrade) and ~20,700 approved group-LTC claims a year **(MS)**.
- To reach $95M ARR from Israel alone, every eligible senior's family would have to pay ~$240 a year, at 100% share. At a realistic 5% share (~19,600 families) each would have to pay ~$4,800 a year. That's far more than a self-filing service can charge. **[Inference: Israel-only ceiling ≈ $5–25M ARR → a $25–250M company at best.]**
- **Next markets:** the USA (Medicaid long-term care, LTC insurance claims, veterans' aid and attendance; biggest, but crowded with funded players), then Germany (care grades, MD assessments; free tools already exist, so a B2B route via insurers), then the UK and the Netherlands **[Inference]**.

**Funding path (Israel 2025–26 numbers, sourced; requirements partly inference):**

| Stage | Typical size | Valuation | What investors will want to see |
|---|---|---|---|
| Pre-seed | median $1M; most $1.1–1.75M | median cap $6.8M; top 10% $13.5M (VC Cafe 2025) | 58% of VCs want at least a pilot; 33% want paying customers. **Solo founder: >75% of VCs said no in 2025.** → needs a cofounder (ideally a CTO or a clinical/legal person) **[Inference]** |
| Seed | median $8–10M (H1 2026: $10.1M; middle half $7–12M) (VC Cafe H2 2026) | not given | A convincing Series A story: e.g. ~$0.5–1M ARR, strong retention, proven outcomes, a B2B partner **[Inference]** |
| Series A | median $24.5M (H1 2026) | not given | "More traction before that check" (VC Cafe). Likely $2–5M ARR, ~3× yearly growth, first foreign market live **[Inference]** |
| Series B+ | $50–100M+ **[Inference]** | — | $15–30M ARR, two or more countries, B2B contracts |
| To reach $280M raised | A + B + C + D (+ debt) | $2B at C/D | $60–100M ARR, 50%+ growth **[Inference]** |

Even on the fast Turnout path, $2B is a 6–9 year goal. It needs a team of dozens, licensed humans in each country, and a payer beyond families. Zero budget and a solo founder are fine for the first 90 days only.

## 8. Verdict

**PIVOT.** Don't kill the need; kill the framing.
- Drop "J8NIX as the engine" and the $2B pitch for now.
- Run **N1-lite**: a free Hebrew checker plus a paid, done-for-you claim pack for the NII nursing benefit and the health-fund LTC claim. The family files; we never file for them; we never handle appeals (refer to a lawyer).
- Price per packet or per result (set privately by Dave), with a free monthly check-in. Not a subscription first.
- Only after the gates pass: find a cofounder, a nurse/social-worker advisor and a law-firm partner. Then decide on the US or Germany.

**Three must-be-true conditions:**
1. **Families pay** for what they can partly get free (K1, K4).
2. **It's legal** as designed: a written opinion on Section 20, success fees on nursing/LTC, and the consent form (K3).
3. **It works:** packets save hours *and* change some results. Expert view says documents cause ≥ 1 in 4 wrong levels, and our first cases show it (K2).

**30-day validation plan (zero spend, no direct sends, Dave approves anything public or priced):**

| Days | What | Who | Numeric gate |
|---|---|---|---|
| 1–3 | Hebrew checker page (6 questions, result, checklist, "reserve" button), no medical data stored. Russian + Arabic versions of the result screen. | Claude | Page live on staging, QA passed |
| 1–3 | Legal question sent to a free law clinic/pro-bono desk | Dave approves; Dave sends | Sent by day 3 |
| 4 | Dave approves the public post and the packet price | Dave (10 min) | Approved |
| 4–14 | Public posts only (Dave's accounts; public caregiver/olim groups where posting is allowed) | Claude drafts, Dave OKs | ≥ 800 visits, ≥ 300 checker finishes |
| 10–14 | 2 expert calls (social worker / ex-assessor) from Dave's own network | Dave | Answer on K2 |
| 14 | **Mid gate** | — | ≥ 10% of finishers reserve; ≥ 30% of reservers upload a document. Otherwise stop. |
| 15–28 | Deliver packets by hand-checked AI (separate secure store, delete after case) | Claude + human check | ≥ 40 packet requests, ≥ 8 paid, 0 data incidents, packet ready in ≤ 24 h |
| 30 | **Final gate** | Dave decides | Pass = 8+ paying, legal opinion OK, ≥ 70% of paid families would recommend. Two misses = stop and fold the checker into content. |

---

## Sources (pages opened in this run)

- NII, fee-cap law page (benefits covered; nursing not listed): https://www.btl.gov.il/Laws/fees/Pages/default.aspx
- Kol Zchut, agreement for paid help in NII claims (written agreement, 7-day cancel, free legal aid): https://www.kolzchut.org.il/he/הסכם_לסיוע_או_ייצוג_בתביעה_לגמלה_מהמוסד_לביטוח_לאומי
- Kol Zchut, fast track without ADL test (90+, documents first): https://www.kolzchut.org.il/he/מסלול_מהיר_ללא_בדיקת_תלות_(ADL)_בתביעה_לגמלת_סיעוד
- Kol Zchut, re-check after deterioration (no reduction, 7-day start): https://www.kolzchut.org.il/he/%D7%91%D7%93%D7%99%D7%A7%D7%94_%D7%9E%D7%97%D7%93%D7%A9_%D7%A9%D7%9C_%D7%96%D7%9B%D7%90%D7%99_%D7%9C%D7%92%D7%9E%D7%9C%D7%AA_%D7%A1%D7%99%D7%A2%D7%95%D7%93_%D7%A2%D7%A7%D7%91_%D7%94%D7%97%D7%9E%D7%A8%D7%94
- Kol Zchut, filing a nursing-benefit claim (online form, documents, free hotlines, appeals): https://www.kolzchut.org.il/he/הגשת_תביעה_לגמלת_סיעוד
- JNS (State Comptroller 2026, ageing; 392,000 recipients; ₪21.1bn; reserve 2035): https://www.jns.org/news/israel-news/israel-unprepared-for-aging-population-surge-state-comptroller-warns
- Maariv (Aug 2026), Clalit LTC moves from Harel to Ayalon, sole bidder: https://www.maariv.co.il/economy/israel/article-1356576
- Mako (2021), LTC insurance claims: rejections, 3-year retroactive, limitation: https://www.mako.co.il/news-law_guide/2021_q4/Article-9c4ddcd947ebd71026.htm
- Srugim, Israel Bar sues accountant under Section 20: https://www.srugim.co.il/409374-לשכת-עורכי-הדין-הגישה-תביעה-נגד-רואה-חש
- MineOS, Amendment 13 (fines, DPO, pen tests, ₪100K damages): https://www.mineos.ai/articles/israels-amendment-13-a-new-era-for-privacy
- Pearl Cohen, Amendment 13 taking effect 14 Aug 2025: https://www.pearlcohen.com/major-amendment-to-israeli-privacy-law-set-to-take-effect/
- Ynetnews (Aug 2025), Israeli startups vs bureaucracy (no NII/elder-care player named): https://www.ynetnews.com/tech-and-digital/article/sy8ityktex
- Pulse 2.0, Turnout $35M Series A at $400M (June 2026): https://pulse2.com/turnout-raises-35-million-series-a-at-400-million-valuation-to-expand-ai-powered-consumer-advocacy-platform/
- Pulse 2.0, Hera $27M Series A (June 2026): https://pulse2.com/hera-raises-27-million-series-a-led-by-bain-capital-ventures/
- Pulse 2.0, Baba $40M Series A (Oct 2026): https://pulse2.com/baba-raises-40-million-series-a-to-expand-ai-powered-medicare-and-medicaid-care-platform/
- TechCrunch (Jan 2025), Waterlily LTC planning AI: https://techcrunch.com/2025/01/29/this-bay-area-startup-is-using-ai-to-help-families-navigate-long-term-care
- Pulse 2.0, Wellthy $25.5M (2023): https://pulse2.com/wellthy-25-5-million-in-funding/
- TechCrunch (Oct 2021), Honor $370M, unicorn: https://techcrunch.com/2021/10/05/senior-care-startup-honor-secures-370m-in-debt-and-equity-reaches-unicorn-status
- Failory, elder-care unicorns (Papa, Cera, Honor…): https://www.failory.com/startups/elder-care-unicorns
- ClearHealthCosts (2023), Papa loses insurer contracts: https://clearhealthcosts.com/blog/2023/09/eldercare-startup-papa-loses-contracts-with-major-health-insurers/
- Pulse 2.0, Transcarent to buy Accolade for $621M (Jan 2025): https://pulse2.com/transcarent-to-buy-accolade-in-621-million-deal/amp/
- AOK Bayern, free Nui AI care-grade assistant: https://www.aok.de/pk/bayern/nui-ki-pflegegradassistent/
- Verbraucherzentrale NRW (Aug 2025), free care-grade objection generator: https://www.verbraucherzentrale.nrw/pressemitteilungen/neuer-widerspruchsgenerator-fuer-die-richtige-pflegeeinstufung-109939
- VC Cafe, Israeli pre-seed 2025 (round sizes, caps, solo founders): https://www.vccafe.com/the-state-of-israeli-pre-seed-in-2025-what-the-data-says-and-how-it-compares-to-the-us/
- VC Cafe, raising in H2 2026 (seed and Series A medians): https://www.vccafe.com/what-israeli-founders-need-to-know-about-raising-in-h2-2026/
- SaaSRise, AI software valuation report 2026 (multiples; marketing source, treat as soft): https://saasrise.com/blog/the-ai-software-valuation-report-2026
- Internal: `ops/brain/MOONSHOT-SCAN.md` (figures marked **(MS)**, sourced there), `ops/brain/OPPORTUNITY-SCAN.md` (3S funnel), `ops/brain/J8NIX-V6-PLAN.md`, `J8NIX-DATA.md`, `J8NIX-COMMS.md` (what J8NIX is).
