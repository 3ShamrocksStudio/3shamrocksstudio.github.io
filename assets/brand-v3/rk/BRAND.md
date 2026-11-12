# R&K (Rookie & King) · Brand v7.1

> **Update, 12 Nov 2026:** the logo files were replaced from Dave's new `R&Klogo.svg` (one logo: split rook/king piece, ROOKIE in #1F5BFF, &KING in white on navy #06133F, navy on light). The current file list is on `board.html`. The stacked, display-wordmark, alternate, flat and one-colour variants described below belong to the earlier v7 file; the alternate and one-colour files were removed.

**Source:** Dave's own logo, `~/Desktop/3S Projects/R&K/R&Klogo.ai` (8 Nov 2026). Every logo, mark, wordmark, game piece and the Connect icon is one of his vectors, extracted from the file with PyMuPDF and never redrawn. v6 is archived in `assets/brand-proposals/rk-archive-2026-11-08/`.

**v7.1 (Dave's corrections, 8 Nov):**
1. The mark is now his **rook + king** piece. The pawn + king draft becomes the alternate.
2. Logo backgrounds are **Night `#020617`**, a near-black navy.
3. The board and pieces are redesigned (premium glass board, lacquer and pearl pieces).

**Idea:** a gamified business-connections platform. A rookie and a king, one piece. Professional value first, game energy second. Status: concept, not built yet.

Brand board: `board.html` (everything below, rendered).

## What was in his file
Layer 2 of the artboard held four overlapping drafts. Layer 1 (switched off) was only a placed screenshot of the old v6 board.
- **(a) Rook + king:** a blue half-rook and half-king cut from one silhouette, with his gradient and a highlight facet on the rook.
- **(b) Split pawn + king:** a blue pawn half and a white king half.
- **(c) Display wordmark:** infinity OO, a rook as the I in ROOKIE and a king as the I in KING.
- **(d) Wordmark:** the infinity OO with plain I's.

## The system
| Role | Element | Why |
|---|---|---|
| **Mark / app icon** | Rook + king (a) | ROOKIE starts with a rook, so the Rookie and the King are one piece, split by one line: connection and business, not "versus". |
| **Wordmark** | Infinity wordmark (d) | The OO loop is the network that keeps going after the game. Clean at every size. |
| **Primary lockup** | Mark + wordmark, horizontal | Mark height = 1.25 × wordmark height, base on the KING baseline, gap ½X. |
| **Stacked lockup** | Mark over wordmark | Split line centred. For splash screens, square posts and phones. |
| **Display wordmark** | Rook-I / king-I (c) | Echoes the mark. Heroes, posters and splash screens only, 320 px wide and up. |
| **Alternate** | Pawn + king (b) | Illustration only. Its pawn half is the game's pawn. |
| **Game pieces** | Halves of (a), each mirrored on its own axis, plus the pawn half of (b) | One family: rook, king, pawn. |

### Clean-up of the mark (his paths only, nothing redrawn)
- **Seam:** in the draft, the gap between rook and king tapered to a point halfway down. It is now one constant-width split line at his own gap width (x 268.75–274.85), cut through the full height, the same as on the split-piece draft.
- **Base slit:** a hairline crescent cut into the king's base (an overlap artifact, path segments 53–55) is closed by joining its two outer points along the edge.
- **Shading:** his radial gradient and the rook's highlight facet are kept. The ramp's darkest stop is lifted from black to his own Deep Blue `#0F2D7E` (from his pawn shading), so the base never sinks into the Night background.

## Files
| File | Use |
|---|---|
| `logo.svg/.png` | Primary lockup on dark (transparent; shown on Night) |
| `logo-on-light.svg/.png` | Primary lockup on light (KING in Navy) |
| `logo-stacked(-on-light).svg/.png` | Stacked lockup |
| `wordmark(-on-light).svg/.png`, `wordmark-display(-on-light).svg/.png` | Wordmarks |
| `mark.svg`, `logo-mark.png` (1024, transparent) | Rook + king mark with his shading |
| `mark-flat.svg/.png`, `mark-on-light.svg/.png` | Same mark (the flat version is now the shaded mark) |
| `app-icon.svg/.png` (1024), `app-icon-180.png`, `favicon-180.png` | App icon, full bleed on Night (platforms add the mask) |
| `icon-small.svg`, `icon-64/48/40.png`, `favicon.svg`, `favicon-32.png`, `favicon-16.png` | **Small-size variant**, 64 px and under |
| `pieces.svg` (`#rk-p-rook`, `#rk-p-king`, `#rk-p-pawn`, plus `-w` / `-b` colour swaps), `piece-rookie/king/pawn.svg/.png` | Game pieces |
| `icons.svg`, `icons.png` | Icon sprite |
| `palette.json`, `tokens.css` | Colour tokens |
| `brand-card.png`, `hero.png` | Brand summary and key visual |

## Clear space, minimum size, small sizes
- **X = cap height of one wordmark line.** Keep ½X clear on every side; it's built into every file.
- Minimum sizes: primary lockup 120 px / 30 mm · stacked 80 px / 20 mm · wordmark 96 px / 24 mm · display wordmark 320 px / 60 mm · shaded mark 48 px tall.
- **Small-size variant (64 px and under):** his same paths in flat Electric Blue (his gradient muddies below 64 px), a tighter crop (mark 90% of the tile height instead of 74%), hairline details thickened by a same-colour stroke, and the split line kept open at about 1 px. No shape is redrawn. Use it for favicons and every icon size up to 64 px. Above 64 px, use the full `app-icon.png`.
- **Never:** recolour the mark, put amber in the logo, stretch it, outline it, add effects, box the mark on a page (app icons are the only tile), retype the wordmark, or bring back the overlapping drafts.

## Colour
His palette leads: **Night/Navy, Electric Blue, White.**
| Name | Hex | Role |
|---|---|---|
| **Night** | `#020617` | Logo backgrounds, app icon, board frame, page canvas. Near-black navy: White 20.2:1, Electric Blue 3.8:1 (large/UI) |
| **Navy** | `#06133F` | His artboard. Raised canvas |
| **Electric Blue** | `#1F5BFF` | His blue. The mark, ROOKIE, primary actions (white text 5.25:1) |
| **White** | `#FFFFFF` | & KING, text, the King piece (pearl) |
| Ice | `#B3C7FF` | His rook highlight. Focus, glints, the grid |
| Deep Blue | `#0F2D7E` | His pawn shadow. Gradient floor, pressed states |
| Surface / Raised | `#0B1D55` / `#12286B` | Cards / raised |
| Sky | `#5A86FF` | Links, move hints (6.0:1 on Night) |
| Steel / Mist | `#8B9AB8` / `#A9B6D6` | Cold, waiting, labels (7.1:1) / secondary text (9.9:1) |
| **Win Amber** | `#F59E0B` | The win only (9.4:1 on Night) |
| Amber Deep | `#B45309` | Amber on light (5.0:1 on white) |
| Paper | `#F4F6FB` | Light background |

**Amber:** the complement of his blue, so a little of it glows against Night. It is kept only for the win: the connection, the handshake that has happened, the level-up. Never in the logo, never as a button or card fill.

## Typography
- **Display: Poppins 800 / 900**, the closest Google font to his wordmark (round geometric O, wide G, closed ampersand). Use it for headlines, numbers, buttons and board coordinates. Sentence case, −0.02em.
- **Text: Inter 400 / 500 / 600.** Use it for body, UI and clocks (tabular numerals). Labels: Inter 600 caps at 0.16em.

## Iconography
Solid silhouettes, like the mark: 24 grid, 2 px knockouts, 2.5 corner radius, `currentColor`. **Rookie (the rook), King and Connect are his vectors** (the mirrored halves of the mark and the infinity OO). Set: Board, Rookie (`rk-pawn`), King, Clock, Connect (`rk-handshake` / `rk-connect`), Scan to play (`rk-join`), Leaderboard (`rk-podium`), Invite, XP, Rank, Your move, Intro, Win.

## Voice and language
**Taglines:** *Play the game. Build the network.* (primary) · Every king was a rookie. · One game. One real connection. · Skip the cold message. Play. · Make your move.

**Tone rules**
- Professional first, game second.
- Short, verb-first lines.
- At most one chess word per line.
- Respect rank, then remove it.
- Real results only.
- Cold words stay cool; warm words are for the win.
- No cartoon voice, no exclamation stacks, no emoji in the UI.

**Microcopy:** Send challenge · Challenge sent. Your move is waiting. · Your move. · Good game. Shake hands? · Connected. Say hello. · No reply in 3 days. Nudge or let it go. · No games yet. Open the board. · That move isn't legal. Try another square.

## Game design system (v7.1 redesign)
- **Board:** brushed slate under dark glass (Night to `#0A1440`), radius 24, and an electric-blue edge light brightest at the top-left and bottom-right corners, with a soft blue outer glow. Squares are light `#14245A` and dark `#060C28` (a dark well so the pieces stand out), separated by a 1 px Ice grid at 7%, with a glass sheen from the top left and an inner shadow. Coordinates are Poppins 600 in Ice at 50%.
- **Pieces:** his rook (the Rookie, blue lacquer `#C2D3FF` to `#1C49D6`) and king (pearl `#FFFFFF` to `#A3AFCC`), plus a pawn in the same family. Each has a smooth inner bevel (light top-left edge, shaded bottom-right edge), a bright 2.2 px rim light, a dark contact halo, a vertical sheen, a soft contact shadow, and a faint blue reflection under the Rookie. Pieces lift 6 px on hover.
- **Moves:** each move is a glowing connection path: a blurred Electric Blue glow under a Sky-to-Ice core line, with lit nodes on every square passed. The hint is a glowing Ice dot in a blue ring; the last move is Electric Blue at 16%.
- **Win:** the path, nodes and edge light turn amber, and the connection segment draws to the King. This is the only amber on the board.
- **Cards:** Surface, radius 16, 1 px Ice line at 14%. The kicker label is Steel caps with the split chip.
- **Buttons:** primary Electric Blue; the handshake offer is an outline; cold/exit is Steel text.
- **XP:** a Raised track with an Electric Blue → Sky fill; level-up turns amber.
- **Ranks (proposed, concept):** Rookie 0 · Contender 250 · Strategist 750 · Grandmaster 2000 · King 5000 XP.

## NEEDS YOUR EYES (Dave)
1. The seam fix: the tapering gap is now a straight, constant-width split line. Say if you want the rook and king fused with no split instead.
2. The gradient floor is lifted to Deep Blue so the base shows on Night. Say if you want your exact black-ending ramp.
