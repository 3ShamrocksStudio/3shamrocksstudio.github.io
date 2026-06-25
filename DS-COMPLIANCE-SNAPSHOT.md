# DS COMPLIANCE CHECKLIST — the one-page gate

**Every 3Shamrocks product passes this before it is "done."** No exceptions, no
"we'll fix it later" colours. This is the single page a reviewer (or the author)
runs down before a product ships or merges.

**Version 3.0 · binding · © 2026 3Shamrocks Studio. All rights reserved.**
Pairs with [RULES.md](RULES.md) (the hard rules), [INTEGRATION.md](INTEGRATION.md)
(how to wire it up) and the automated [`tools/ds-audit.py`](tools/ds-audit.py).

> **Run the machine check first:** `python3 tools/ds-audit.py path/to/product.html`
> A product must score **≥ 90 (A/B)** to ship, **≥ 70** to merge to a working
> branch. The checklist below is the human review the score can't fully see.

---

## 1 · Tokens — no ad-hoc values

- [ ] **Colour comes only from semantic tokens** (`--bg --surface --text* --accent* --border* --success/safe --warning/caution --danger --info`). No raw hex/`rgba()` in component code. *(audit: ≥ 66% tokenised)*
- [ ] **Type** uses the shared size scale (`--text-xs … --text-7xl`) and weight/leading/tracking tokens — not magic px.
- [ ] **Spacing** uses the 4px ramp (`--space-1 … --space-10`) — not arbitrary px.
- [ ] **Radii** come from `--radius-*` (driven by the brand's one `--radius-unit`).
- [ ] **Elevation** comes from `--shadow-*`; **motion** from `--dur-*` + `--ease*`.
- [ ] The product sets **exactly one Layer-1 brand block** and changes **nothing** in `tokens.css` / `components.css`.

## 2 · Components — shared, not bespoke

- [ ] UI is built from the shared component classes (`.btn .card .field .badge .chip .toast .list .modal .sheet .navbar .tab …`) or faithful re-implementations that consume **only** Layer 0 + 2 tokens.
- [ ] No one-off component duplicates a shared one with hard-coded styling.
- [ ] Status is shown by **colour + icon/dot + text label** — never colour alone.

## 3 · Theming — the system, themed

- [ ] App root carries **`data-brand="<product>"`** (+ `data-mode="light|dark"`).
- [ ] The brand = the product's **own palette mapped onto the semantic roles** + its **own logo** + its type/corner/motion knobs. (It is *not* the house look.)
- [ ] Switching `data-mode` flips light/dark cleanly with no broken contrast.

## 4 · Accessibility — WCAG AA, measured

- [ ] **Contrast measured, not assumed:** body text ≥ 4.5:1, large text & UI ≥ 3:1, in **both** modes. (Re-run the contrast check on the brand ramp.)
- [ ] Every interactive element shows a visible **`--focus-ring`** (never `outline:none` with no replacement).
- [ ] Controls are **≥ 44×44px**.
- [ ] **`prefers-reduced-motion`** collapses motion; **`prefers-contrast: high`** is respected where relevant.
- [ ] Real semantic elements (`button`, `label`, `nav`, `main`) + appropriate `aria-*`.

## 5 · Logo & legal — the studio rule

- [ ] **Real studio logo only** — `3shamrocks.png` (light wordmark, for dark surfaces) / `3shamrocks_black.png` (dark wordmark, for light surfaces). **Never fabricated, never AI-generated, never recoloured.**
- [ ] On a **product**, the studio credit is the **quiet Shomer-standard footer**: ~13–15px logo, low opacity, one centred line — least focus on the page. (The *product's own* logo is the hero.)
- [ ] Exact line: **`© 2026 3Shamrocks Studio. All rights reserved.`** Product names take ™ on prominent use.

## 6 · Hebrew / RTL — where it ships Hebrew

- [ ] `dir="rtl"` + `lang="he"` on the root; Hebrew font token (Heebo/Assistant) wired.
- [ ] Layout uses **logical properties** (`margin-inline`, `inset-inline-*`, `padding-inline`) so it mirrors correctly.
- [ ] Latin-only chrome (logos, language bar) pinned LTR as needed; nothing clips or overlaps in RTL.

## 7 · Delivery — the workflow gates

- [ ] **Mockup-first:** for a pivot or major feature, a Grok-level concept mockup was approved **before** the rebuild ([RULES.md §Workflow](RULES.md)).
- [ ] Delivered as a **public GitHub Pages URL**, not localhost.
- [ ] Honesty: deployed-vs-pending, verified-vs-assumed, real-data-vs-placeholder all stated plainly.

---

### Verdict

| Score (ds-audit) | Meaning |
|---|---|
| **90–100 (A/B)** | Ship-ready. |
| **70–89 (C)** | Merge OK; close listed gaps before launch. |
| **< 70 (D/F)** | Not compliant — fix before merge. |

> A product is **DS-compliant** when every box above is checked **and** `ds-audit.py`
> reports ≥ 90. File the score + this checklist with the launch.

*Living gate — grows when a correction is agreed (see [RULES.md](RULES.md) correction log).*
