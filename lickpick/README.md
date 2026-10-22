# LickPick: payments and Pro keys (dev notes)

## Payments: one file switches checkout on

`lickpick/app/pay.js` is the only place to edit. The app, the landing page (`lickpick/index.html`) and the activation page (`lickpick/thanks.html`) all read it. The service worker fetches it network-first, so changing it does not need an `LP_VER` bump.

While both `checkout` links are empty (as now), every "Go Pro" button shows the honest **Checkout opens soon** state: get notified, or paste a key. Nothing can be bought.

Pro is a **subscription**: $3.99/month or $29.99/year. In Polar, create two subscription products, **LickPick Pro Monthly** ($3.99, monthly) and **LickPick Pro Yearly** ($29.99, yearly), and attach the same **License key** benefit to both. Then:

| `pay.js` field | What to paste | Where to find it in Polar |
|---|---|---|
| `provider` | `"polar"` (already set) | |
| `checkout.monthly` | checkout link of the Monthly product, e.g. `https://buy.polar.sh/polar_cl_…` | Products → LickPick Pro Monthly → Checkout links → Copy |
| `checkout.yearly` | checkout link of the Yearly product | Products → LickPick Pro Yearly → Checkout links → Copy |
| `org` | the organization id (UUID). **Required**: without it the app stays in "opens soon" | Settings → General → Organization ID |
| `benefits` | `["<benefit id>"]`, the shared license-key benefit id (UUID). Optional: empty means any key from this org | Benefits → the license-key benefit → its id |
| `portal` | the customer portal link, e.g. `https://polar.sh/<org-slug>/portal`. Shown as "Manage subscription" and "Find my key" | Settings → Customer portal |
| `plans` | the prices shown everywhere; must match Polar | |

In Polar, set each checkout link's **Success URL** to
`https://3shamrocksstudio.github.io/lickpick/thanks.html?checkout_id={CHECKOUT_ID}`
so buyers land on the activation page. The license-key benefit may limit activations (for example 3 phones); the app activates one per phone.

How a key is checked: the app calls Polar's public customer-portal endpoints (`/v1/customer-portal/license-keys/activate`, then `/validate`) with the org id and the key. No secret is involved and the endpoints allow CORS from any origin (verified 2026-10-22: unknown keys return 404). Polar revokes the benefit (key status not `granted`) when a subscription ends, so:

- the app re-validates once a day when online (`SUB_CHECK`) and on every return to the app;
- offline, Pro keeps working for 7 days after the last good check (`SUB_GRACE`), then falls back to the free features (projects and saves stay) until it can check again;
- an ended subscription turns Pro off with a toast; the key stays stored, and **Restore my subscription** in the Pro sheet re-checks it after a renewal; pasting the key again also restores.

The landing's structured data marks the Pro offers `PreOrder` until the links are set, then `InStock` (done by the page script). The UI never names the provider. `provider: "lemonsqueezy"` (with `store` and `products: { pro: [variantIds] }`) still works if ever needed.

## Signed keys (offline, no store)

Keys starting `LP1.` are ECDSA P-256 signed and checked on the phone:

- `LIC_PUB` in `app/index.html`: the founder's signing key (owner and invite keys). Its private half is not in this repo or sandbox.
- `TEST_PUB`: a separate key that signs **only** dated `TESTER-nn` keys (`t: "tester"`, an expiry `x` is required). The private half lives outside the repo. A tester key shows as "Tester Pro" in the app and is not a subscription (no daily check; it ends on its date).
- To turn off a leaked key: add its id (e.g. `"TESTER-03"`) to `revoked` in `pay.js`.

Deep links: `app/#key=<key>` activates a key (signed or store), `app/#pro` opens the Pro sheet, `app/#signin` opens Google sign-in.
