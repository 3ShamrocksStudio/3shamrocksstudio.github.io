// LickPick Pro checkout: THE one place that switches payments on (app, website and thanks page all read it).
// Pro is a subscription: monthly or yearly. Empty checkout links = the honest "Checkout opens soon" state everywhere.
// How to fill it: lickpick/README.md → Payments.
window.LP_PAY = {
  provider: "polar",   // "polar" (primary). "lemonsqueezy" still works if ever needed (then set store, not org).
  checkout: {
    monthly: "",       // Polar checkout link of "LickPick Pro Monthly" ($3.99 a month), e.g. https://buy.polar.sh/polar_cl_...
    yearly: ""         // Polar checkout link of "LickPick Pro Yearly" ($29.99 a year)
  },
  org: "",             // the Polar organization id (a UUID): license keys are checked against it
  benefits: [],        // the license-key benefit id(s) (UUIDs) attached to both products. Empty = any LickPick key from this org
  portal: "",          // the Polar customer portal link (manage or cancel the subscription, find the key), e.g. https://polar.sh/<org-slug>/portal
  plans: {             // shown everywhere; must match the Polar prices
    monthly: { price: "$3.99", per: "month" },
    yearly: { price: "$29.99", per: "year", note: "Best value · save 37%" }
  },
  revoked: []          // ids of signed (LP1) keys to turn off, e.g. "TESTER-03"
};
