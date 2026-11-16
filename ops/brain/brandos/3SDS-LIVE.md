# 3SDS live token sheet (v4.1-live, 16 Nov 2026)

**What this is.** The studio look as it ships today on 3shamrocks.com, read from the page code. Every page, report, doc, deck or J8NIX surface built for Dave or a client in the studio brand uses these values (BRAIN.md §−6.L, 15 Nov 08:32: "the live site wins until the spec is updated").

**Source (read 16 Nov 2026, night shift):** `sprint/index.html` lines 12–154 (`:root` at line 25). Cross-checked against `index.html` `:root` (homepage): same colours, fonts, radius and easing; the homepage adds `--violet-3` and `--panel` (listed below).

**Supersedes for studio pages:** 3s-status `design-systems/3shamrocks-studio/DESIGN-SYSTEM.md` v4.0 §2 colours, fonts (Syne / Inter / Space Grotesk) and radius (14px). That file is read-only history; its architecture (one brand block per product, shared components) still holds. Product brands (SH✡MER, LickPick, J8NIX…) keep their own brand files: this sheet is the **studio** brand only.

## 1. Colour

| Token | Value | Role on the live site | Contrast (WCAG, computed 16 Nov) |
|---|---|---|---|
| `--bg` | `#000` | page background | — |
| `--surface` | `#0d0a17` | forms, panels, output boxes | — |
| `--surface-2` | `#151024` | raised surface (sprint page) | — |
| `--panel` | `rgba(255,255,255,.045)` | homepage panels | — |
| `--ink` | `#f6f4ff` | headings, body on dark | 19.30:1 on `#000` · 17.99:1 on surface |
| `--ink-2` | `rgba(236,232,255,.76)` | lede, secondary text | 9.91:1 on `#000` · 9.56:1 on surface |
| `--ink-3` | `rgba(236,232,255,.56)` | eyebrows, muted labels | 5.57:1 on `#000` · 5.55:1 on surface |
| `--violet` | `#8239ea` | brand accent, hero glow `rgba(130,57,234,.30)` | 3.72:1 on `#000` → large text / UI only; white on it 5.64:1 |
| `--violet-2` | `#b07cff` | accent text on dark (h1 line 2), focus ring, button glow | 7.17:1 on `#000` |
| `--violet-3` | `#d9c4ff` | homepage only, light accent | — |
| `--grape` | `#9b59f7` | third brand dot | 5.17:1 on `#000` |
| `--teal` | `#2fb7c9` | second brand dot | 8.74:1 on `#000` |
| `--green` | `#8be36a` | first brand dot, progress bars (the shamrock) | 13.29:1 on `#000` |
| `--line` | `rgba(255,255,255,.12)` | every hairline and border | — |

Signature: the three dots `green · teal · grape` (8px circles, 5px gap) before every eyebrow. Hero: `radial-gradient(70% 90% at 92% 0%, rgba(130,57,234,.30), transparent 70%)`, mirrored to 8% in RTL.

## 2. Type

| Use | Font | Weights loaded | Rules |
|---|---|---|---|
| Display `--font-d` | **Bricolage Grotesque** | 500–800 (opsz 12–96) | h1–h3 weight 800, letter-spacing −.04em (h1 −.045em), line-height 1.02 (h1 .95), `text-wrap:balance` |
| Body `--font-b` | **Instrument Sans** | 400 · 500 · 600 · 700 | 16px, line-height 1.6; lede 18px / 1.65, max 60ch |
| Hebrew (both roles) | **Heebo** | 400 · 500 · 700 · 800 | `html[lang="he"]` swaps both stacks to Heebo first; headings letter-spacing −.015em, line-height 1.1 |

Sizes: h1 `clamp(42px,8.4vw,92px)` (HE `clamp(40px,7.6vw,82px)`) · h2 `clamp(30px,4.6vw,52px)` · sub `clamp(17px,2vw,20px)` · eyebrow 600 13px, tracking .12em, uppercase (HE 15px, .02em) · labels/chips 600 14px.

## 3. Shape, space, motion

- Radius `--rad: 3px` (buttons, inputs, chips, language switch). Larger containers: 4px (day tiles, code boxes), 6px (forms, panels, grids). Pills `999px` only for the tag chip; circles for dots and avatars. **Never 10–14px rounded cards** (Dave: "claude-like rectangles", 12 Nov).
- Layout: `.wrap` max 1120px, side padding 24px (16px at ≤600px). Sections `clamp(64px,8vw,104px)` top/bottom with a `--line` rule between them.
- Easing `--ease: cubic-bezier(.2,.8,.2,1)`; hover lift `translateY(-2px)`; all motion off under `prefers-reduced-motion`.

## 4. Components

- **Primary button:** white fill `#fff`, text `#14102a` (18.46:1), 700 16px, min-height 52px, padding 14px 28px, radius 3px, glow `0 10px 30px -12px rgba(176,124,255,.55)`; hover fill `#e6ffe0`. One per view.
- **Ghost button:** 2px border `rgba(255,255,255,.34)`, ink text; hover border `#fff`.
- **Fact chip:** 600 14px, `--ink-2`, 1px `--line`, radius 3px, fill `rgba(255,255,255,.03)`.
- **Input:** 500 16px, `--bg` fill, 1px `--line`, radius 3px, min-height 48px.
- **Focus:** 2px solid `--violet-2`, offset 3px.
- Tap targets ≥44px (language buttons 44×36 min).

## 5. How builders use this

1. Copy the `:root` block from `sprint/index.html` (or the table above) verbatim; never retype colours from memory.
2. Load fonts with the exact Google Fonts URL on `sprint/index.html` line 14.
3. Cite this file in the page or doc's build note ("tokens: ops/brain/brandos/3SDS-LIVE.md").
4. If the live site changes, update this sheet in the same commit (brand-sync rule, BRAND-SYNC.md).

Brand OS scorer note: the 3S genome the scorer reads (`ops/brain/brandos/scorer/`) should take its colour, font and radius rules from this sheet; any mismatch is a scorer bug to fix, not a reason to change the site.
