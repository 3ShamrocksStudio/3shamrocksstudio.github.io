# EZRA · Brand v3

**Idea:** help that does it for you. Big type, big buttons, plain words, for older adults.

## The real palette, and the browns removed
The real EZRA palette comes from the official logo (`Ezra Logo.svg`: `#005CFF` + `#041933`) and the EZRA concept screens (`--blue #005CFF`, `--blue-d #0046CC`, `--navy #041933`, `--ink2 #5B6B85`, `--line #E4EBF8`, `--bg #F4F7FE`). **EZRA has no brown.**

There is no brown anywhere in this folder. The browns were in these legacy files (not edited here; another team integrates):
- `assets/products/ezra.jpg` and `assets/studio/pf/ezra-mark.png`: the olive-gold and khaki "hand with star" mark. **Retire it** and use `brand-v3/ezra/logo-mark.png` or `app-icon.png` instead.
- `assets/art/new/ezra.jpg` and `assets/art/p-ezra.jpg`: warm brown and beige interior photos. Replace them with `brand-v3/ezra/brand-card.png` or a cool-toned image.
- In the EZRA app (`Ezra senior helper/index.html`), these tokens are brown or beige: `--warm-text #7A4A00`, `--warm-deep #3A2E10`, `--warm #1E1A0E`, `--warn #9A5B00`, `--warn-line #5A4A22`, `--warn-soft #2E2410`, `--line #DDD8CE`, `--bg #F5F3EE`. Suggested swaps: bg → `#F4F7FE`, line → `#E4EBF8`, warm surfaces → `#EBF0FF`, warn text → `#041933` on a `#FFF6D6` fill with a `#E8A200` icon.

## Direction and rationale
- The mark is the real EZRA mark: a helping arm reaching under a column of dots. v3 keeps its exact geometry and sets the top dot in Sky (`#5C92FF` on light, `#A9C6FF` on dark) as an "Ezra is ready" signal.
- **Heebo 900** sets both scripts, so the Latin `EZRA` and Hebrew `עֶזְרָא` sit together as one bilingual lockup. Heebo is already the app's display face.
- Accessibility is part of the brand: navy on mist is 16.4:1, white on Blue Deep is 7.6:1, white on Ezra Blue is 5.3:1 (WCAG AA for all text sizes).

## Palette
| Name | Hex | Use |
|---|---|---|
| Ezra Blue | `#005CFF` | Primary, mark, CTAs |
| Blue Deep | `#0046CC` | Pressed state, gradient end |
| Navy | `#041933` | Ink, wordmark |
| Slate | `#5B6B85` | Secondary text |
| Sky | `#A9C6FF` | Attention dot, soft fills, text on dark |
| Mist | `#F4F7FE` | Canvas |

## Type
- Display: **Heebo 900** (Latin and Hebrew). Body: **Assistant 400–700**. Body text is 22 px or larger in the app.

## Files
- `logo.png`: bilingual lockup for light backgrounds (primary). `logo-on-dark.png`: for dark backgrounds.
- `logo-mark.png`, `mark-blue.svg`, `mark-white.svg`: the mark.
- `app-icon.png`: white mark on a blue gradient tile.
- `brand-card.png`: 1200×1200 portfolio card.

## Do
- Use blue, navy and white. Use Sky only for the top dot and soft fills.
- Keep buttons at least 56 px tall and labels in plain words.

## Don't
- **Never** use brown, tan, beige, khaki, olive or gold, including in photos, illustrations or warning states.
- Don't use the legacy hand-and-star mark.
- Don't set body text in Slate on Sky (contrast is too low).
