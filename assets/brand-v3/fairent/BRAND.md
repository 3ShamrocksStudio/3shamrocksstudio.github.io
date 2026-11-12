# FaiRent · Brand v5 · "The renter's red pen"

12 Nov 2026. Replaces v4 (the indigo and green RR mark), which is archived in `assets/brand-proposals/fairent-v4-archive-2026-11-12/`.
Live board: `board.html` (this folder). Case study: `work/fairent.html`.

**What FaiRent is (concept changed by Dave, 12 Nov 2026):** a community app, renters for renters, in development (not launched). Renters share what they really pay and their experiences, see what is fair for a given place, and act together, so rents become more transparent and pressure moves prices down. Israel first, built to go global. Hebrew first.

The fair line starts from official data: CBS Table 4.9, paid rent, Q2 2025, by city and room band (district fallback where CBS suppresses a cell), plus 5.3% for a new lease (CBS CPI, Sept 2026). Shared rents would sharpen it. A shared benchmark, not an appraisal. The first prototype (`/fairent/`) covers the rent check only; sharing stays off until shared storage and privacy rules are ready.

**Name:** always **FaiRent** (capital F, capital R).

## Strategy
Rent arrives as a number on paper. FaiRent hands every renter the red pen, and renters pass it on: **strike** the overcharge, **highlight** the fair number, share it so the next renter knows. Calm, on the renter's side, never angry at landlords. Every number names its source.

Brand line (from the hand-lettered original): *Stop paying more for less.*

## Logo system
- **Mark** (`mark.svg`, `mark-mono.svg`, `mark-on-dark.svg`, `logo-mark.png`): an F outlined from Rubik 800, its top bar cut at 21°. The off-cut, in Red Pen, is the money the renter keeps.
- **Wordmark / horizontal logo** (`logo.svg` / `.png`, `logo-on-dark.svg` / `.png`): "FaiRent" in Ledger Ink, the i dotted with the same red chip.
- **Stacked** (`logo-stacked*.svg` / `.png`): splash, store art, page transitions. `logo-on-green.webp` keeps its legacy file name (the homepage card and the brand transition load it) but is now the stacked v5 logo, shown on Highlighter yellow.
- **App icons:** `app-icon.svg` / `.png` (Highlighter, default), `app-icon-dark.svg`, `app-icon-light.svg`, `app-icon-ios-1024.png` (full bleed), `favicon.svg`, `favicon-32.png`, `favicon-180.png`.
- Clear space: 2x the height of the i's chip. Minimum: logo 96 px wide, mark 20 px; below that use `favicon.svg`.

## Colour
| Name | Hex | Use |
|---|---|---|
| Ledger Ink | `#1A1633` | Text, the mark, dark canvas |
| Receipt Paper | `#F7F3EA` | Light canvas |
| Red Pen | `#FF4A2B` | The overcharge: strikes, chips, stamps. Shapes and type 24 px and up |
| Highlighter | `#FFE53D` | The fair number, app icon, splash. Background only, never text on paper |
| Red Ink | `#C8331A` | Red text under 24 px (4.8:1 on Paper) |
| Pencil | `#5E5974` | Secondary text (6.0:1 on Paper) |
| Rule | `#E3DCCB` | Hairlines, receipt rules |

Red only ever means "too much". Yellow only ever means "fair". Tokens: `tokens.css`, `palette.json`.

## Type
- Display, Latin and Hebrew: **Rubik 800–900**, tracking −3.5%.
- Body, both scripts: **IBM Plex Sans Hebrew 400–600**.
- Figures: **IBM Plex Mono 500–600** (receipt numbers). Set the ₪ sign in Rubik.
- Margin notes: **Caveat 700**, red, Latin only, short lines.

## Icons
`icons.svg` (sprite, 12 symbols, explicit colours), `icons-current.svg` (same, currentColor), `icons.png`. 48 grid, 4 px round strokes in Ledger Ink, one accent each: a red cut for "too much", a highlighter block for "fair".

## Motion: four moves, one angle (21°)
- **The cut:** the off-cut chip drops (logo intro, success).
- **The strike:** Red Pen through an asking rent above the fair band, 450 ms ease-in.
- **The swipe:** Highlighter behind the fair number, left to right.
- **The stamp:** the verdict lands at −7° with a snap; red when over, ink when fair.
- Page transition: two Highlighter halves meet on a red seam.
- Easing: `--fr-snap cubic-bezier(.3,1.5,.5,1)`, `--fr-drop cubic-bezier(.5,0,.9,.5)`. Everything stops under reduced motion.

## Rasters
`hero.png` (case-study hero with the live receipt), `brand-card.png`, `icons.png` are v5 renders.

## Not yet done
The staging app (`/fairent/`) still runs the v4 look; its screens in `assets/work/fairent/` (also used on the homepage) are real v4 captures.
