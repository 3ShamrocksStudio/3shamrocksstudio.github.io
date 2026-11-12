# LEADGEN: funded-founder engine (v1, 12 Nov 2026)

Our own replacement for "done-for-you" lead-gen agencies. Built 12 Nov after a cold pitch promising "90+ pre-qualified funded founders in 30 days, don't pay if we don't deliver" (sender domain redirects to a paid-ads appointment-setting funnel for coaches and consultants; see "Why not buy" below).
Public repo: **no prospect names, emails or profile links here, ever.** People live only in J8NIX `approvals` (private). This file holds the method and the counts.

## 1. What it feeds (Dave's ladder)
AI-Ready Brand Sprint (BRAIN §−1.3) → Brand OS monthly upkeep → fractional head of design.
Target buyer: founder or CEO (or the co-founder who owns product) of a startup that raised **seed to Series A in the last 45 days**.

## 2. Weekly quota and cadence
- **20 new founders a week**, one batch, id `founders-MMDD`, label "Funded founders · week NN".
- Run it Sunday or Monday morning (Israel) so notes reach US founders on a weekday.
- LinkedIn caps still apply (BRAIN §−3: 15 connects a day). 20 a week fits inside them.

## 3. Sources (free only)
| Source | What to read | Notes |
|---|---|---|
| CTech "Full list of Israeli high-tech funding rounds in 2026" + calcalistech.com/tags/Funding | Israeli rounds by date | Best single Israeli list; updated daily |
| ynetnews.com/business | Israeli rounds, founder names | Use the article's JSON-LD `datePublished` to check the date |
| thesaasnews.com/news (pages 1–3) | Global seed / Series A, founders in "About" paragraph | ~20 rounds a day |
| techcrunch.com/category/fundraising | Global rounds, founder quotes | Founder name + role usually in the body |
| Fortune Term Sheet, storagenewsletter, company press pages | Confirm a round or a founder role | |
| Geektime, IVC, accelerator demo-day pages | Israeli early stage | Geektime renders by JS: use search results, not the page |
| Company site `/about`, `/company`, `/team` | Founder LinkedIn URL + title, product line for the note | Most reliable place for a LinkedIn URL |
Paid data tools (Vibe Prospecting / Explorium and similar) only if their own cost estimate shows **zero**. Otherwise skip. Spend stays 0.

## 4. Filters (all must pass)
1. Round is seed, pre-Series A or Series A, announced ≤45 days ago (≤7 days preferred), with a source link.
2. Product has a user-facing surface (app, dashboard, marketplace, consumer device, or a brand that is still thin: no site, one-line site, a named product family).
3. A named founder with a confirmed current role (company site, the funding article, or the company's own announcement) checked the same day.
4. Not already contacted: check J8NIX `approvals` (all statuses) and the private lead files for the company AND the founder name. Any hit = skip.
5. Skip: defence/weapons, deep research with no product surface, companies that already list a design lead or CPO who ran design (they don't need us), growth rounds and later.
6. Past clients, friends, family: never through this engine (per-item, BRAIN §−3).

## 5. Drafts
- **Every founder: a LinkedIn connect note from template T2** (Hebrew for Israeli founders, English otherwise), ≤300 characters. `{news_line}` = one true line about their product, ≤50 characters, from their own site or the funding article, checked that day. No congratulations on the round, no price, no link in the note.
- Dave's facts allowed: TIME credit belongs to the **VIBRANT capsule** (TIME Best Inventions 2023); "68% vs 34%" = refill reorders with vs without the app, ACG 2024, an association, not proof. Nothing else unless it is on 3shamrocks.com or the CV.
- First person singular. Warm and short. No fake scarcity.
- **Email only** for a non-Israeli company that publishes both a business email and a postal address, and only in the US/UK (skip EU recipients: consent rules). Footer with sender identity and opt-out. Held while `control/main.email_from_ok` is false (`result: "Waiting: dave@3shamrocks.com sending not connected"`). One channel per person: the LinkedIn doc and the email doc point to each other.
- Israeli companies: no cold email (Communications Law §30A, BRAIN §2.10). LinkedIn only.
- Tracked link for the after-accept message (not in the note): `https://3shamrocks.com/?utm_source=linkedin&utm_campaign=founders-MMDD&utm_content=fNN` (email: `utm_source=email`). Never a name in a URL.

## 6. J8NIX doc shape
`approvals/li-MMDD-fNN-<company-slug>`: kind `linkedin`, label `Send by hand`, template_id `T2`, status `pending`, rank 80+, batch / batch_label, link = profile URL (or a LinkedIn people search when the URL is not confirmed, with a warn saying so), context = round + date + source, role + where checked, why 3S fits, tracked link.
`approvals/email-MMDD-fNN-<slug>`: kind `email`, status `pending`, result "Waiting: …", warn "HELD".
LinkedIn is never sent by an arm (BRAIN §−3). Dave copies and sends by hand.
Known constraint (12 Nov): the free LinkedIn account's monthly personalised-note allowance can run out. Then: connect without a note and send the text as the first message after accept.

## 7. Measure and kill rule
- Touch = a note or email Dave actually sent. Reply = any answer.
- Track per batch in `brain.json → funnel.tracks[services]` (counts only) and per person in J8NIX.
- **Kill rule: after 3 weeks, if replies < 2 per 40 touches (5%), change the offer** (not the volume): new opening line, a different entry offer (e.g. a free 20-minute teardown of their onboarding or site), or a different segment. Log the change in `brain.json → decisions` with a check date.
- Follow-ups only through T3/T4 (BRAIN §−3), never a third.

## 8. Why not buy the agency
- The 12 Nov pitch came from a domain registered Oct 2025 that redirects to a different brand's "Conversion Accelerator System": paid ads + booked sales calls for coaches, consultants and service providers, with a VSL / bonus-stack / guarantee funnel and a London virtual-office address. Mass-template signals: generic "I saw you turn rough ideas into finished apps" opener that doesn't match Dave's work.
- Pay-per-appointment market price: about $150–$600 per scheduled B2B meeting, $2–4k/month retainers in hybrid deals; common disputes over what counts as "qualified" and no-shows (Cleverly, 2026, a vendor source).
- Our engine costs ₪0, sends in Dave's own voice, and keeps the brand risk with us.

## 9. Log
| Batch | Date | Founders | By country | By round | Emails held |
|---|---|---|---|---|---|
| founders-1112 | 12 Nov 2026 | 20 | US 13 (one US/France), Israel 2, UK 2, Italy/US 1, India 1, Colombia 1 | Seed 10, Series A 6, Seed+A 2, pre-A 1, undisclosed 1 | 4 (US) |
