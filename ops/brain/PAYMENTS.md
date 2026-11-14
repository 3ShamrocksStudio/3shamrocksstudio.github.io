# PAYMENTS · how each 3S product gets paid (12 Nov 2026)

Owner seat: CFO. No secrets, no account numbers, no personal financial data in this file (public repo).
Prices below are only the ones Dave already decided (BRAIN.md §−1, brain.json `decisions`). Anything else says **Dave decides**.
Prices never go in a first message (BRAIN.md §2.8). Revenue booked so far: **₪0 / $0**.

## Rails (checked 12 Nov 2026, sources at the bottom)

| Rail | Use it for | Monthly fee | Per payment | Payout |
|---|---|---|---|---|
| **Morning (Green Invoice) + Grow digital payments** | Israeli B2B: studio deposits, Brand OS monthly, SH✡MER pilots, invoices | none on the Best plan (the studio is on Best, annual, since 29 Oct per Morning's own receipt in Gmail) | ₪1.2 + 1.4% (+0.3% Bit) ex VAT; card, Bit, Google Pay, Apple Pay; payment links and standing orders (הוראת קבע) on Best | to the bank on the 10th for the previous month [1][2] |
| **Morning bank-transfer invoice** | Any invoice when Grow isn't connected yet | none | ₪0 | client pays the bank directly |
| **Lemon Squeezy (merchant of record)** | Consumer digital/SaaS sold worldwide (LickPick Pro) | none | 5% + 50¢, +1.5% outside the US, +0.5% subscriptions, +1.5% PayPal; it handles global sales tax/VAT | Israel is on the bank-payout list; 1% per payout to non-US banks; payouts 1st and 15th, $50 minimum [3][4][5] |
| **Paddle (merchant of record)** | Software subscriptions sold worldwide; **recommended primary for LickPick** | none | 5% + 50¢ (bespoke pricing on request for products under $10); handles global sales tax/VAT | Israel is not on Paddle's unsupported-countries list [6][7] |
| **Gumroad (merchant of record since 1 Jan 2025)** | Fastest zero-spend fallback for digital products and memberships | none | 10% + 50¢ plus card processing (~2.9% + 30¢; PayPal 3.49% + 49¢); handles sales tax/VAT | weekly, $10 minimum; outside the US via PayPal [8] |

**Lemon Squeezy risk (added 12 Nov, coordinator research, re-checked):** Lemon Squeezy (owned by Stripe) is moving its users to Stripe Managed Payments, which supports merchants in "35+ countries" [9]. Stripe's payment services are still not available in Israel (Globes, Oct 2026: Stripe is only recruiting an Israel country manager) [10][11]. So an Israeli seller may not be able to follow Lemon Squeezy into Managed Payments. Lemon Squeezy stays as the **backup** for LickPick (its checkout is already wired and its review is pending); Paddle becomes the primary path.

Correction to the 8 Nov CFO note ("card links need Best plan + clearing add-on"): the studio already has Best, and on Best there is no extra monthly fee for Grow; only the one-time Grow connection (Dave's documents) is missing.

## Per product

### 1. Studio services · AI-Ready Brand Sprint + Brand OS (cash mode, fastest money)
- **Model:** fixed-price sprint, 50% upfront, 50% on delivery; then optional monthly retainer (recurring, Dave's preference).
- **Price (decided):** set by Dave; amounts are kept in the private J8NIX project notes, not in this public file. VAT wording still open (loose end `svc-vat-sprint`).
- **Provider:** Morning. Deposit = Morning payment link; Brand OS = Morning standing order (monthly card charge, invoice auto-issued).
- **Status (real):** no deposit link exists yet. Grow digital payments: Dave reports the connection done (14 Nov 2026, J8NIX message); activation usually within ~24 h, no Grow email in the readable Gmail yet. Inquiry path staged.
- **Claude did:** staged `sprint/` (noindex, not linked from the site): Brand Sprint inquiry flow (visitor's own email to dave@3shamrocks.com, nothing stored), "Pick a time" and "Pay the deposit" hooks behind `window.S3_SPRINT` that stay hidden until a real https link is set; deposit shows only on `sprint/#deposit` (the link Dave sends after a call). No price on the page. **NEEDS YOUR EYES** before it is linked anywhere.
- **Dave only:** Morning → סליקה ותוספים → תשלומים דיגיטליים → חיבור → יצירת חשבון חדש (Grow), fill details and upload the documents it asks for (~10 min; active within ~24 h). Then Claude creates the deposit link + Brand OS standing-order template in a Chrome shift and pastes the link into `S3_SPRINT.depositUrl`.

### 2. VIBRANT · IFU edits (delivered 8 Nov)
- **Model:** one-off freelance invoice. **Price:** agreed with the client (kept private).
- **Provider:** Morning invoice (bank transfer now; card link once Grow is connected).
- **Status:** not invoiced; waiting on the client side's OK. Left untouched by this run on purpose.
- **Dave only:** the existing to-do item (`cash12-vibrant`). Nothing new.

### 3. SH✡MER · councils and communities (B2B / B2B2C)
- **Model:** 90-day paid pilot credited toward an annual council licence (recurring yearly). Residents use the app free.
- **Price (decided 8 Nov, + VAT):** pilot tiers by population; the pilot is credited toward the annual licence. Amounts are kept private (J8NIX), not in this public file.
- **Provider:** Morning invoice (councils pay by bank transfer against a tax invoice; a card link is rarely usable for a council). Communities/donors: Morning payment link once Grow is connected.
- **Status:** no pilot signed; pilot pages already route to a 15-minute call (mailto). No checkout belongs in the app.
- **Claude did:** nothing in code (correct: a council buys by invoice after a call).
- **Dave only:** same Morning Grow connection as above (covers community/donor payments too).

### 4. LickPick · Pro subscription (consumer, worldwide)
- **Model:** subscription. **Price (published on the landing page):** $2.99/month or $14.99/year.
- **Provider:** **Paddle as primary** (same 5% + 50¢ as Lemon Squeezy, no Stripe dependency, Israel not excluded; ask Paddle for its under-$10 rate). **Lemon Squeezy as backup** (store 3sstudio, products already in test mode). Gumroad only if both fail: on a $2.99 sale its ~10% + 50¢ + processing takes roughly 40%.
- **Status (real):** the Lemon Squeezy checkout is wired in `lickpick/app/index.html` (`window.LP_PAY`, `mode: "test"`, live links empty), so the Pro sheet shows "Checkout opens soon" unless `?paytest=1`. Dave finished the Lemon Squeezy identity step on 4 Nov. The studio Gmail holds **no Lemon Squeezy email at all** since the 17 Oct sign-in: no approval, no rejection. No Paddle account exists. LickPick is frozen in cash mode, so no code was changed today.
- **Claude did:** GO-LIVE patch dry-run PASS for Lemon Squeezy (`ops/brain/lp-golive-dryrun.md`); today re-checked the hook is still behind the flag; Paddle wiring plan: `LP_PAY.provider = "paddle"` with Paddle.js overlay checkout + Paddle price ids, Pro unlocked by the existing licence-key flow fed from Paddle's webhook (needs a small serverless endpoint; zero-spend option to be picked when the account exists).
- **Dave only (account/KYC/bank):** sign up at paddle.com → "Get started" with dave@3shamrocks.com as 3Shamrocks Studio, complete business + identity verification and the payout bank (~20 min). Then write "Paddle in" and Claude does the product, prices, domain review and wiring. Lemon Squeezy: if its "store activated" email arrives first, app.lemonsqueezy.com → Settings → Payouts → add the business bank (5 min).

### 5. Chore Royale (frozen in cash mode)
- **Model:** family subscription (proposal only). **Price:** Dave decides.
- **Provider when it's time:** Paddle (same rail as LickPick) or Google Play billing if it ships as an Android app.
- **Status:** no paid tier in the code; the plan says a 10-family "would you pay?" test comes before any payment build. **Nothing wired on purpose.**

### 6. Trashure Hunters, Milo, FaiRent, R&K, EZRA, WH33LZ, J8NIX
- Parked or frozen. No paid tier, no prices decided: **Dave decides** when each is revived. No payment code added.

## Sources
1. Morning digital payments (fees, plans, payment links, standing orders, payout day, activation path): https://www.greeninvoice.co.il/digital-payments/
2. Morning plans (Best includes online card/Bit/Google Pay/Apple Pay): https://www.greeninvoice.co.il/pricing/
3. Lemon Squeezy fees: https://docs.lemonsqueezy.com/help/getting-started/fees
4. Lemon Squeezy supported countries (Israel in the bank-payout list): https://docs.lemonsqueezy.com/help/getting-started/supported-countries
5. Lemon Squeezy payouts (schedule, $50 minimum, bank or PayPal): https://docs.lemonsqueezy.com/help/getting-started/getting-paid
6. Paddle pricing (5% + 50¢, no monthly fee, under-$10 bespoke): https://www.paddle.com/pricing
7. Paddle supported seller countries: https://www.paddle.com/help/start/account-verification/which-countries-are-supported-by-paddle
8. Gumroad fees, MoR since 1 Jan 2025, payouts (third-party summary, updated June 2026; verify on gumroad.com before relying): https://checkoutpage.com/blog/gumroad-fees
9. Lemon Squeezy 2026 update (move to Stripe Managed Payments, 35+ countries): https://www.lemonsqueezy.com/blog/2026-update
10. Globes: Stripe struggling to get an Israeli clearing licence: https://en.globes.co.il/en/article-1001381078
11. Placera/Globes, Oct 2026: Stripe recruiting an Israel country manager; services not yet available in Israel: https://www.placera.se/telegram/stripe-planerar-expansion-i-israel-soker-landschef-20261020
