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

Correction to the 8 Nov CFO note ("card links need Best plan + clearing add-on"): the studio already has Best, and on Best there is no extra monthly fee for Grow; only the one-time Grow connection (Dave's documents) is missing.

## Per product

### 1. Studio services · AI-Ready Brand Sprint + Brand OS (cash mode, fastest money)
- **Model:** fixed-price sprint, 50% upfront, 50% on delivery; then optional monthly retainer (recurring, Dave's preference).
- **Price (decided):** Brand Sprint ₪9,800 (VAT wording still open: loose end `svc-vat-sprint`); Brand OS ₪3,900/month. Other packages (8 Nov): Package 1 ₪13,000/mo, Package 2 ₪24,000/mo, Package 3 ₪35,000 for 12 days, two-week redesign ₪32,000, all + VAT.
- **Provider:** Morning. Deposit = Morning payment link; Brand OS = Morning standing order (monthly card charge, invoice auto-issued).
- **Status (real):** no deposit link exists yet; Grow digital payments not connected (no Grow/clearing email in Gmail). Inquiry path staged.
- **Claude did:** staged `sprint/` (noindex, not linked from the site): Brand Sprint inquiry flow (visitor's own email to dave@3shamrocks.com, nothing stored), "Pick a time" and "Pay the deposit" hooks behind `window.S3_SPRINT` that stay hidden until a real https link is set; deposit shows only on `sprint/#deposit` (the link Dave sends after a call). No price on the page. **NEEDS YOUR EYES** before it is linked anywhere.
- **Dave only:** Morning → סליקה ותוספים → תשלומים דיגיטליים → חיבור → יצירת חשבון חדש (Grow), fill details and upload the documents it asks for (~10 min; active within ~24 h). Then Claude creates the deposit link + Brand OS standing-order template in a Chrome shift and pastes the link into `S3_SPRINT.depositUrl`.

### 2. VIBRANT · IFU edits (delivered 8 Nov)
- **Model:** one-off freelance invoice. **Price:** ₪800 (₪700 older note still unconfirmed).
- **Provider:** Morning invoice (bank transfer now; card link once Grow is connected).
- **Status:** not invoiced; waiting on the client side's OK. Left untouched by this run on purpose.
- **Dave only:** the existing to-do item (`cash12-vibrant`). Nothing new.

### 3. SH✡MER · councils and communities (B2B / B2B2C)
- **Model:** 90-day paid pilot credited toward an annual council licence (recurring yearly). Residents use the app free.
- **Price (decided 8 Nov, + VAT):** pilot Person ₪24,000 (50–100k residents); Nature ₪9,000; Combined ₪28,500 (₪19,500 for 20–50k). The pilot is 25% of the annual licence and is credited toward it; the ₪144k no-tender cap is still a CFO proposal waiting for Dave.
- **Provider:** Morning invoice (councils pay by bank transfer against a tax invoice; a card link is rarely usable for a council). Communities/donors: Morning payment link once Grow is connected.
- **Status:** no pilot signed; pilot pages already route to a 15-minute call (mailto). No checkout belongs in the app.
- **Claude did:** nothing in code (correct: a council buys by invoice after a call).
- **Dave only:** same Morning Grow connection as above (covers community/donor payments too).

### 4. LickPick · Pro subscription (consumer, worldwide)
- **Model:** subscription. **Price (published on the landing page):** $2.99/month or $14.99/year.
- **Provider:** Lemon Squeezy (store 3sstudio, products already created in test mode).
- **Status (real):** checkout is wired in `lickpick/app/index.html` (`window.LP_PAY`, `mode: "test"`, live links empty), so the Pro sheet shows "Checkout opens soon" unless `?paytest=1`. Dave finished the identity step on 4 Nov. Gmail (markodave@gmail.com) holds **no Lemon Squeezy email at all** since the 17 Oct sign-in, so no approval and no rejection yet. Frozen in cash mode except this check.
- **Claude did:** GO-LIVE patch dry-run PASS (`ops/brain/lp-golive-dryrun.md`); today re-checked the hook is still behind the flag.
- **Dave only:** when Lemon Squeezy's "store activated" email arrives: app.lemonsqueezy.com → Settings → Payouts → add the business bank account (5 min; Israel is supported). Then Claude applies the 6-line patch and runs the $0-coupon test.

### 5. Chore Royale (frozen in cash mode)
- **Model:** family subscription (proposal only). **Price:** Dave decides (₪19.90/mo · ₪149/yr was a proposal, never approved).
- **Provider when it's time:** Lemon Squeezy (consumer, worldwide) or Google Play billing if it ships as an Android app.
- **Status:** no paid tier in the code; the plan says a 10-family "would you pay?" test comes before any payment build. **Nothing wired on purpose.**

### 6. Trashure Hunters, Milo, FaiRent, R&K, EZRA, WH33LZ, J8NIX
- Parked or frozen. No paid tier, no prices decided: **Dave decides** when each is revived. No payment code added.

## Sources
1. Morning digital payments (fees, plans, payment links, standing orders, payout day, activation path): https://www.greeninvoice.co.il/digital-payments/
2. Morning plans (Best includes online card/Bit/Google Pay/Apple Pay): https://www.greeninvoice.co.il/pricing/
3. Lemon Squeezy fees: https://docs.lemonsqueezy.com/help/getting-started/fees
4. Lemon Squeezy supported countries (Israel in the bank-payout list): https://docs.lemonsqueezy.com/help/getting-started/supported-countries
5. Lemon Squeezy payouts (schedule, $50 minimum, bank or PayPal): https://docs.lemonsqueezy.com/help/getting-started/getting-paid
