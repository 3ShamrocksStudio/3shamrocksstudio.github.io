# Milo brand v2 (proposal, not live)

**Status:** staging proposal. NEEDS YOUR EYES. Nothing here replaces `assets/brand-v3/`.
**Open:** `board.html` shows everything on one page.

## What changed
- **Shades dropped** (Dave, 5 Nov). The reference art (`assets/studio/milo/milo-concept.jpg`) was edited by hand, not regenerated. The shades were removed, the fur was repainted in the same pixel style, and new warm eyes were added (ink, a 2×2 white highlight and an ice glint). Same bear, same pose.
- **3 moods**, made by editing only the eyes and mouth: calm/happy (the default), breathing (eyes softly closed, small smile) and proud (happy-squint eyes, blush, open grin).
- **Chain: Dave picks.** A keeps the chain (`milo-*.png`); B drops it (`milo-*-nochain.png`). Recommendation: **B**, because a chain reads as bling, not calm, and parents are the buyers. The popsicle stays in both: it means "cool down".

## Files
| Folder | Files |
|---|---|
| `character/` | `milo-calm`, `milo-breathe`, `milo-proud` (+ `-nochain`), 768 px · `avatar-*` (head crops, no chain) · `moods`, `moods-nochain`, `chain-compare`, `before-after` · `eye-area-2x`, `chain-area-2x` (nearest-neighbour 2× proofs) |
| `logo/` | `wordmark-pink` (on dark), `wordmark-pink-deep` (on light) · `app-icon-1024` (master, nearest-neighbour) · `app-icon-180` · `app-icon-check` (180/120/60/40) · `lockup-horizontal-on-dark`, `lockup-horizontal-on-light` · `brand-card` |
| `system/` | `palette.json` (hex, source, use, contrast ratios) |
| `src/` | The Python/PIL edit scripts used to make the art (for reproducibility) |

Every image is under 400 KB.

## Wordmark and type
- **Wordmark:** Fredoka SemiBold, "Milo". The i-dot is a pixel ice cube in Ice Blue.
- **UI type:** Rubik (400 body, 500 labels, 700 headings). Both fonts are free on Google Fonts and support Hebrew.
- Pink on dark: #FF4FA3 (6.2:1 on Night). Pink on light: #C2186F (5.3:1 on Frost). Both are tuned from the art's #F42A92.

## Palette
Calm is cool, wins are warm.
- **Core:** Night #1A023B · Ink #0E0820 · Fur #F4EFEB · Fur Shade #B5AEC8 · Frost #F6F3FF
- **Calm (check-in, breathe, grown-up help):** Calm Indigo #4B3A9E · Lilac #784EB2 · Ice Blue #5CC8FF · Ice Deep #1B9BDC · Frost Blue #CDEFFF
- **Wins ("I did it", growth):** Milo Pink #FF4FA3 · Pink Deep #C2186F · Coral #FF7A66 · Popsicle #EB2AC7 (illustration only)
- Never use warm colours on crisis or grown-up help screens.

## Character rules
1. No sunglasses, ever. The eyes carry the mood.
2. Edit the eyes and mouth only. Never redraw or regenerate the bear.
3. Keep the 2×2 eye highlight in every open-eye state.
4. The popsicle stays.
5. Milo lives on Night. On light pages he sits in his Night tile; never cut him out onto white.
6. Scale with nearest-neighbour at whole steps (2×, 3×). Never blur the pixels.
7. Never put a phone, money, weapons or a screen in his paws.

## Mood usage
| Mood | Where | Colour |
|---|---|---|
| Calm/happy | Home, "How are you?", Grown-up help, crisis card | Indigo, Night |
| Breathing | Breathe together (in 4 · hold 2 · out 6), for the whole exercise | Ice, Frost Blue |
| Proud | "I did it", stage growth. Never on "maybe later" | Pink, Coral |

The crisis path always uses Calm.

## Icon style
Pixel icons on a 12 × 12 grid with square pixels and no anti-aliasing. Each icon uses one colour (Fur on dark, Ink on light) and sits in a rounded tile with a 22% radius. No outline icons, gradients or emoji.

## Open decisions for Dave
1. Chain: A (keep) or B (drop, recommended).
2. Approve the wordmark with the ice-cube i-dot, or ask for a plain dot.
3. A lawyer check on "Milo: Breathe & Be Brave" before anything public (see the 5 Nov memo).
