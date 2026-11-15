# J8NIX · Brand v5

Updated 15 Nov 2026. Source: Dave's `3S Projects/J8NIX/Brand/J8NIX.ai` (three lockups, main and supporting swatches). Tokens: `palette.json` (v5). Live in the app from J8NIX 8.1.0 (`j8/app.css`).

**The logo drawing is Dave's and never changes** (the letterforms and the hourglass 8). Only colourways and grounds follow the palette.

## Colour

Base: **Midnight `#060833`**, **Royal `#2A44C6`**, **Sky `#2AB9FF`**.

### One meaning per hue

| Meaning | Colour | Text on it | Ink on white / wash |
|---|---|---|---|
| **You** (your move, needs you: a rail, a tag, the Do button; never a big fill) | Orange `#FF9700` | Midnight 8.9:1 | `#9A5200` on `#FFF1DC` 5.3:1 |
| **J8** (the AI's voice, J8's band) | Indigo `#202663` + the white 8 | White 13.8:1 | Ice `#DCE4FF` accents 10.9:1 |
| **Alarm** (only: due today, days running out, zero results, Kill) | Red `#DD0E3F` | White 5.0:1 | `#B80A33` on `#FFE4EA` 5.6:1 |
| **Done / paying** | Green `#32CC00` | Midnight 9.0:1 | `#237A00` on `#E4F8DA` 4.9:1 |

Chrome is monochrome: Midnight rail, Midnight primary buttons (Ice on dark), an Ice `#DCE4FF` block for "you are here". Neutrals: Slate `#586475` (muted text), Haze `#838EB7` (quiet, parked), Mist `#D8D8D8` ("no stage").

### Project stages

Each stage has its own hue, always shown with its number and word (colour never works alone).

| # | Stage | Fill | Text on fill | Ink / wash | Dark fill |
|---|---|---|---|---|---|
| 1 | Idea | Violet `#9500FF` | White 5.6:1 | `#7A00D6` / `#F2E6FF` 6.3:1 | `#9500FF` |
| 2 | Build | Royal `#2A44C6` | White 7.7:1 | `#2A44C6` / `#E6EAFF` 6.4:1 | `#3D5AFE` (white 5.1:1) |
| 3 | Beta | Teal `#00C2A8` | Midnight 8.5:1 | `#00766A` / `#DCF7F2` 4.9:1 | `#00C2A8` |
| 4 | Validate | Fuchsia `#E23FD0` | Midnight 5.4:1 | `#A3168F` / `#FBE4F8` 5.7:1 | `#E23FD0` |
| 5 | Launch | Sky `#2AB9FF` | Midnight 8.7:1 | `#00679F` / `#DDF2FF` 5.3:1 | `#2AB9FF` |
| 6 | Paying | Green `#32CC00` | Midnight 9.0:1 | `#237A00` / `#E4F8DA` 4.9:1 | `#3FD80A` |

The spectrum runs cool, from Violet through the brand blues to Green, so it sits with Midnight, Royal and Sky. Warm hues are kept for You (Orange) and Alarm (Red) only.

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
| Wordmark (midnight colourway, no tile) | `wordmark-midnight.svg`, `wordmark.png`, app `j8/icons/wm-midnight.svg` | On Midnight or Indigo only (the app rail) |
| Mark: the white 8 on a Royal tile | `mark.svg`, `mark-1024.png` (`logo-mark.png`), app icons | App icon, favicon, J8NIX badge |
| The 8 alone | `mark-white-1024.png`, `mark-midnight-1024.png`, `glyph.svg` | Watermarks, notification badge |
| Legacy (peach on slate) | `glyph-peach.png`, `icons.png`, old lockup in the .ai | Do not use |

Rules:
1. Never redraw, stretch, rotate, outline or add effects. The 8 stays white on every coloured ground.
2. Royal-tile lockup on light, midnight lockup or wordmark on dark. Never the gradient wordmark on a light surface.
3. Clear space is at least the height of the 8's top bowl on all sides. Below 24 px tall, use the mark.
4. Only these colourways. A new ground must come from the palette and keep the white 8 at 4.5:1 or better.

## Shape (3SDS layer 1 for J8NIX)

3SDS gives each product its own corners. J8NIX's own:
- **Radius unit 0.** Blocks, bands, buttons, chips and tags are square. Rounded corners appear only on the logo tile and the app icons, which are Dave's drawing.
- **Sections:** a 3 px Midnight rule and a Midnight index chip (01, 02…).
- **Full-bleed bands** for what matters: the Midnight hero (Indigo in dark) with a 6 px Orange "you" rail, the Indigo J8 band, and the stage lanes. Orange is never a big fill: only a rail, a small tag or the Do button.
- **The J8 notch:** a 45° cut on the top-start corner (12–18 px), mirrored in Hebrew, on the hero, the J8 band and primary buttons. It comes from the diagonal of the hourglass 8.
- Hairlines in Mist-blue. No drop shadows on light. No glows.

## Where it lives

App: `j8/app.css` tokens, `j8/app.js` (stage spectrum, PCOL `p-j8nix`), `j8/icons/*`, `j8/manifest.webmanifest` (theme and background `#060833`). Badge `j8/brand/j8nix.png`. Studio copy `assets/studio/logos/j8nix.png`. Share image `assets/og/og-j8nix.jpg`. Board: `brand-card.png`.
