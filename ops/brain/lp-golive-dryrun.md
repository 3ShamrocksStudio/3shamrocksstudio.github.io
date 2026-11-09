# GO-LIVE patch dry-run (scratch copy only, repo untouched)

Source of truth: the comment block at app/index.html:1863-1866 and brain.json "GO-LIVE patch dry-run". The patch is NOT LP_PRO_URL/LP_SELL.
LP_PRO_URL and LP_SELL are the legacy manual-sale path (email request, pay owner, signed key) and stay "" on purpose. The payments switch is window.LP_PAY.
weekend/GO-LIVE.md, which the comments cite, does not exist in the repo.

## Exact lines to change (placeholders used: .../checkout/buy/PLACEHOLDER-YEARLY and -MONTHLY, version lp-2026-11-09a)
| file:line | before | after |
|---|---|---|
| lickpick/app/index.html:1867 | `mode: "test"` | `mode: "live"` |
| lickpick/app/index.html:1869 | `live: { yearly: "", monthly: "" }` | `live: { yearly: "<LIVE yearly URL>", monthly: "<LIVE monthly URL>" }` |
| lickpick/app/index.html:1870 | `LP_VER = "lp-2026-11-04c"` | `"lp-2026-11-09a"` |
| lickpick/app/sw.js:2 | `CACHE = "lp-2026-11-04c"` | `"lp-2026-11-09a"` (so installed PWAs pick up the change) |
| lickpick/download/LickPick.html:1867, 1869, 1870 | same as app (its LP_VER is the older lp-2026-10-31a) | same edits; the file's own comment says to change it there too |
| lickpick/index.html:354 | `var u = "", live = ...` | `var u = "app/#pro", live = ...` |

Not needed: LP_PRO_URL, LP_SELL, landing static HTML (line 310 "Checkout opens soon" is overwritten by the JS once u is set).

## Syntax check
17 inline scripts extracted (app 8, download 9) plus landing 1, plus sw.js: all pass `node --check` (files in js/). No leftover `LP_PRO_URL = ""` problem (intentionally still empty), no TODO, no PLACEHOLDER outside the two live URLs, no corruption.

## Browser (Playwright chromium, local http.server)
- app/#pro: 0 console errors, 0 failed requests. LP_VER = lp-2026-11-09a, LP_PAY.mode = live.
- Pro sheet shows an enabled link (was a disabled "Checkout opens soon" button) "Get Pro · $14.99 a year" -> href .../PLACEHOLDER-YEARLY, target=_blank. Switching to monthly: "Get Pro · $2.99 a month" -> .../PLACEHOLDER-MONTHLY. Hint line: "Secure checkout by Lemon Squeezy: card, Apple Pay, Google Pay or PayPal...".
- Works without ?paytest=1 (live mode ignores that flag).
- download/LickPick.html#pro: 0 errors, same yearly checkout link.
- Landing index.html: 0 errors, CTA becomes "Get Pro · from $1.25 a month" -> app/#pro; footer text switches to the Lemon Squeezy tax/cancel wording (billing portal link).

## Result: PASS
Caveats for the real run: replace both PLACEHOLDER URLs with live-mode links (the existing test links are on 3sstudio.lemonsqueezy.com, not lickpick.lemonsqueezy.com); the "$1.25 a month" landing copy is hard-coded; after the store is active run the $0-coupon checkout test from brain.json. Nothing here is approved to go public: patch needs Dave's green light (NEEDS YOUR EYES).
