# Funding opportunities, 30-day window (fetched 2 Nov 2026)

Scope: SH✡MER (civil emergency/SOS + council dashboard) and Trashure-Hunters (TH, kids recycling game). Tnufa is excluded. Verified by an independent pass on 2 Nov 2026 (amounts and deadline wording re-checked on each URL).
Rule: only entries with an official URL and a deadline confirmed on that page, or marked rolling or unverified. **NEEDS YOUR EYES**: the honest finding is that no Israeli-government or foundation **cash** call with a 3 Nov to 10 Dec 2026 deadline was found that fits either product. What is open and realistic is mostly cloud credits plus one long-shot EU grant.

## Table (sorted by deadline)

| Program | Funder | For | Amount | Deadline (quoted) | Eligibility fit (honest) | Effort | URL |
|---|---|---|---|---|---|---|---|
| Earthshot Prize 2027 (nomination) | The Earthshot Prize, via Official Nominators (e.g. BVRio) | TH | £1M each to 5 winners | "The nomination period for the 2027 prize is open until December 2026" (no day given) | Very weak. You cannot apply directly; an Official Nominator has to pick you, and winners are proven at scale. Pre-traction TH is not competitive. | S (an email pitch to a nominator) | https://bvrio.org/?p=11129 |
| EIC Accelerator, short proposal | European Commission / EIC (Israel is associated to Horizon Europe) | SH✡MER | "Lump sum contribution below € 2.5 million" | "Short proposals may be submitted at any time." The next full-proposal cut-off on the page is 04/11/2026 (too soon). No 2027 cut-offs are listed yet. | Weak to medium. EIC wants breakthrough or deep-tech innovation with scale-up ambition. An SOS app plus a dashboard reads as incremental unless there is novel tech (e.g. offline mesh or AI triage). A short proposal costs nothing and gets feedback. | M (short proposal); L if you go on to a full proposal | https://eic.ec.europa.eu/eic-funding-opportunities/eic-accelerator_en |
| Google for Startups Cloud Program, Start tier | Google Cloud | Both (shared Firebase/GCP billing) | "$2,000 in Google Cloud credits", valid 12 months | Rolling (no deadline stated). Decisions in "a few business days" per FAQ (https://cloud.google.com/startup/faq) | Good, but you need a working MVP, a company website with a matching business-email domain, the company "founded within the last 24 months" (**check Winplant/3S incorporation date**), and "plans to seek venture funding soon". | S | https://cloud.google.com/startup/pre-seed |
| Microsoft for Startups, Azure startup credit (no investor) | Microsoft | Both | $1,000 (90 days), then $4,000 more after business verification (180 days) | Rolling (no deadline stated) | Eligible as a private for-profit software startup. Useful only if you run something on Azure; the current stack is Firebase. | S | https://learn.microsoft.com/en-us/startups/application |
| AWS Activate Founders | Amazon Web Services | Both | "$1,000 USD AWS Activate Credits" | Rolling (no deadline stated) | Eligible: "Early-stage, self-funded startup", pre-Series B, online presence, founded within 10 years. Needs an AWS account on the Paid Tier. Low value unless you use AWS. | S | https://aws.amazon.com/aws-startups-1/startups/credits/ |

Only 5 entries are listed. I did not pad the table with near-misses.

## Checked and rejected (real, but closed or no fit)

- **Horizon Europe CL3 "Disaster-Resilient Society" (HORIZON-CL3-2026-01-DRS)**, €32.5M call: "Submit your proposal by 5 November 2026." That is 3 days away and needs an EU consortium. Not feasible. **Watch the 2027 CL3 call**; it is the best EU thematic fit for SH✡MER. https://rea.ec.europa.eu/funding-and-grants/horizon-europe-cluster-3-civil-security-society/disaster-resilient-society-europe_en
- **National Insurance (Bituach Leumi) Funds call: tech solutions for local authorities, seniors and people with disabilities.** One of its impact areas is safety (בטיחות); the per-authority amount and the full impact-area wording are in the linked call PDF, not verified on the page itself. Deadline "07/07/2026 בשעה 13:00", so it is closed. Authorities pick from a vendor "סל המענים הטכנולוגי" (technology basket), and vendors joined through an earlier call. **This is a strong future channel for the SH✡MER council dashboard. Watch for the next vendor-basket call.** https://www.btl.gov.il/About/news/Pages/kol-kore-nioiFunds.aspx
- **IIA International R&D & Pilot Collaborations 2026**: deadline July 21, 2026 (closed). Its rules also bar a pending application for the same programme, which conflicts with Tnufa.
- **IIA/MoEP Environmental & ClimaTech Pilots**: the last call I found closed 23/09/2024. TH would fit if it reopens.
- **Google for Startups Accelerator: Europe & Israel**: "Applications are now closed" (it was an AI/energy track anyway).
- **Startup Award Israel 2026 (The Ventures)**: no cash prize and closed.
- **Coller Startup Competition**: the 2026 cycle is over, and two of its tracks need a Tel Aviv University founder.
- **8200 Impact accelerator**: the registration page shows an old 2024 date. Next cohort dates are unverified.
- **ClimateLaunchpad**: Israel is not a participating country in 2026.
- **MoD DDR&D RFIs (deadline 15 Dec 2026)**: they cover drones and UAVs. No fit.
- **US Embassy Jerusalem PD grants**: nonprofits only, closed 6 Aug 2026.

## Not verified (sites blocked automated fetch). Dave or the next pass should check by hand

- Israel Innovation Authority open-calls page (innovationisrael.org.il "פתוחים להגשה") returned 403 / client error on every fetch. I could not see any IIA call open in Nov 2026.
- Government support-tests portal tmichot.mof.gov.il (blocked by robots). Environmental Protection, Negev-Galilee-Resilience and Social Equality calls are listed there. The calls I found were all addressed to local authorities or NGOs, not companies.
- Ministry of Education Gefen catalogue (חינוך, for TH as a school program). The planning doc says new digital content selection will be "open all year round", but I could not confirm a supplier-onboarding deadline.

## Top 2 to pursue

Score = amount × probability ÷ days-to-cash. I added a usability factor for credits, meaning the share of the credit you would actually burn on your current stack. The stack is Firebase/GCP per the repo CLAUDE.md.

| Candidate | Amount (USD) | P(win) | Usability | Days to benefit | Score/day |
|---|---|---|---|---|---|
| Google Cloud Start tier | 2,000 | 0.6 | 1.0 (Firebase/GCP) | 14 | **86** |
| EIC Accelerator (short, then full) | ~2,700,000 | 0.01 | 1.0 | ~365 | **74** |
| Microsoft Azure credits | 5,000 | 0.7 | 0.3 | 30 | 35 |
| AWS Activate Founders | 1,000 | 0.8 | 0.3 | 14 | 17 |
| Earthshot (TH) | ~1,300,000 | 0.001 | 1.0 | ~400 | 3 |

1. **Google for Startups Cloud Program, Start tier (score ≈ 86).** It takes under an hour, the benefit arrives in about 2 weeks, and it directly offsets Firebase/GCP bills for SH✡MER, TH and LickPick. The risks are the "founded within the last 24 months" rule and the requirement that the website and email domains match.
2. **EIC Accelerator short proposal for SH✡MER (score ≈ 74).** It costs nothing, can be submitted any time, and the upside is large. The realistic probability is about 1% unless the pitch centres on a genuinely novel technical core. It is worth one 2 to 3 day effort mainly for the evaluator feedback and as reusable material for Tnufa and the 2027 CL3 call. Do not start a full proposal until a short one is accepted.

Honest bottom line: no realistic non-dilutive **cash** is reachable for either product before 10 Dec 2026. The serious cash routes for SH✡MER are Tnufa (already in progress), the next Bituach Leumi vendor-basket call, and Horizon CL3 2027. For TH they are a reopened IIA/MoEP environmental pilots call and direct CSR approaches to the packaging-recycling corporations (Tamir, ELA). Those are leads, not calls, so they are not in the table.
