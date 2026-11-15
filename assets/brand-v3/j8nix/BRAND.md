# J8NIX · Brand v6

Updated 15 Nov 2026 (v6 with J8NIX 9.0.0). Source: Dave's `3S Projects/J8NIX/Brand/J8NIX.ai` (three lockups, main and supporting swatches). Tokens: `palette.json` (v5). Live in the app from J8NIX 8.1.0 (`j8/app.css`).

**The logo drawing is Dave's and never changes** (the letterforms and the hourglass 8). Only colourways and grounds follow the palette.

## Colour (v6, 15 Nov 2026: one role table, colours from Dave's file only)

Base: **Midnight `#060833`**, **Royal `#2A44C6`**, **Sky `#2AB9FF`**. This table replaces every earlier colour table (BRAND v5 and the v9 IA.md).

| Role | Colour | Hex (light / dark) | Allowed on | Never |
|---|---|---|---|---|
| Structure / ink | Midnight | `#060833` / ink `#EEF1FF`, page `#060833` | rail, text, primary button (light) | — |
| Action / selection | Royal | `#2A44C6` / `#9FB0FF` | links, selected nav (Royal fill on the rail), focus fill, the stage bar | big fills behind long text |
| J8 voice | Indigo + Sky | `#202663` band, Sky `#2AB9FF` accents (6.2:1 on Indigo) | J8 card, J8 button, the J8 dot | Sky text on white (2.2:1) |
| You (act now) | Orange | `#FF9700` rail, ink `#9A5200` on `#FFF1DC` | the top-3 rail, the due-today badge | more than 3 per screen; text on white |
| Alarm | Red | `#DD0E3F`, ink `#B80A33` | overdue, money at risk, Kill | decoration, counts |
| Done / paying | Green | `#32CC00`, ink `#237A00` | done check, Paying stage, money booked | progress that isn't done |
| Quiet | Haze / Slate | `#838EB7` / `#586475` | parked, team, meta text (Slate only for text) | Haze as text on white (3.2:1) |
| Surface | Mist-blue | page `#F2F5FC`, card `#FFFFFF`, line `#E4E8F3` | backgrounds, the "you are here" tint | — |

**Retired in v6:** Teal `#00C2A8`, Fuchsia `#E23FD0` and Ice `#DCE4FF` (none is in Dave's file), and Violet as a stage colour.

### Project stages

One blue. A 6-segment bar in Royal with the stage word next to it (Idea · Build · Beta · Validate · Launch · Paying). Segment 6 is Green. Colour never works alone: the word is always there.

## Themes

- **Light:** page `#F2F5FC`, cards `#FFFFFF`, lines `#C9D0E4` / `#E4E8F3` (Mist tinted blue), text Midnight `#060833` (17.7:1 on the page), secondary `#3A4266` (9.0:1), muted Slate (5.5:1).
- **Dark (the midnight lockup):** page Midnight `#060833`, canvas `#0C1046`, cards `#12175A`, lines `#2E3577`, text `#EEF1FF` (14.4:1 on cards), secondary `#B8BFE0` (8.9:1), muted `#9AA3CC` (6.6:1). Fills keep their hue. Inks lift (full list in `palette.json`).
- Every text pair above is WCAG AA or better. All are measured and listed in `palette.json → contrast_pairs_measured`.

## Type

**Heebo** for Hebrew and Latin (Google Fonts, 400 / 500 / 600 / 700). Display and headings 500–600, body 400, emphasis 700. Sentence case everywhere. No all-caps labels and no wide letter-spacing. Numbers are tabular.

## Logo

| Lockup | File | Use |
|---|---|---|
| Royal tile: deep-navy letters `#081C33`, white 8, on Royal | `logo-royal.svg`, `logo-royal-1024.png` (`logo-on-light.png`) | Light surfaces, studio pages, store art |
| Midnight: letters in the Royal → Sky → navy gradient with the Sky highlight line, white 8 | `logo-midnight.svg`, `logo-midnight-1024.png` (`logo.png`) | Dark surfaces, OG / share images |
| Wordmark (midnight colourway, no tile) | `wordmark-midnight.svg`, `wordmark.png`, app `j8/icons/wm-midnight.svg` | Share images and large dark art only |
| Rail wordmark (Sky letters, white 8) | app `j8/icons/wm-sky.svg` | The app rail at 184 px wide. Letters 8.7:1 on Midnight (the gradient measures about 2.4:1). NEEDS YOUR EYES: Dave to confirm this colourway |
| Mark: the white 8 on a Royal tile | `mark.svg`, `mark-1024.png` (`logo-mark.png`), app icons | App icon, favicon, J8NIX badge |
| The 8 alone | `mark-white-1024.png`, `mark-midnight-1024.png`, `glyph.svg` | Watermarks, notification badge |
| Legacy (peach on slate) | `glyph-peach.png`, `icons.png`, old lockup in the .ai | Do not use |

Rules:
1. Never redraw, stretch, rotate, outline or add effects. The 8 stays white on every coloured ground.
2. Royal-tile lockup on light, midnight lockup or wordmark on dark. Never the gradient wordmark on a light surface.
3. Clear space is at least the height of the 8's top bowl on all sides. Below 24 px tall, use the mark.
4. Only these colourways. A new ground must come from the palette and keep the white 8 at 4.5:1 or better.

## Shape (3SDS layer 1 for J8NIX, v6)

- **Radius 6 px** on cards, buttons, chips and tiles. It echoes the soft logo tile and the round terminals of Dave's letters.
- **The J8 notch:** one 14 px 45° cut on the top-start corner (mirrored in Hebrew), on the J8 card only. It is the only notch in the product.
- Hairlines in Mist-blue. No drop shadows on light. No glows.
- Orange is never a big fill: a 4 px rail on the top 3 items and the due-today badge only.

## Where it lives

App: `j8/app.css` tokens, `j8/app.js` (stage spectrum, PCOL `p-j8nix`), `j8/icons/*`, `j8/manifest.webmanifest` (theme and background `#060833`). Badge `j8/brand/j8nix.png`. Studio copy `assets/studio/logos/j8nix.png`. Share image `assets/og/og-j8nix.jpg`. Board: `brand-card.png`.
