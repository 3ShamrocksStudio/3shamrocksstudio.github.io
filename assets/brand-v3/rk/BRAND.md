# R&K (Rookie & King) · Brand v7

**Source:** Dave's own logo, `~/Desktop/3S Projects/R&K/R&Klogo.ai` (8 Nov 2026). Every logo, mark, wordmark, game piece and the Connect icon is one of his vectors, extracted from the file with PyMuPDF and never redrawn. v6 (puzzle-seam pawn/amber king, Inter Tight) is archived in `assets/brand-proposals/rk-archive-2026-11-08/`.

**Idea:** a gamified business-connections platform. A rookie and a king, one piece. Professional value first, game energy second. Status: concept, not built yet.

Brand board: `board.html` (everything below, rendered).

## What was in his file
The artboard (navy, Layer 2) held four overlapping drafts. Layer 1 (switched off) was only a placed screenshot of the old v6 board and was ignored.
1. **Split piece:** a blue pawn half and a white king half, split by one thin line.
2. **Rook + king:** one blue silhouette with a highlight facet and a draft seam.
3. **Display wordmark:** ROOKIE (blue) / & KING (white), with an infinity OO, a rook as the I in ROOKIE and a king as the I in KING.
4. **Wordmark:** the same type with the infinity OO and plain I's.

## The system (and why)
| Role | Element | Why |
|---|---|---|
| **Mark / app icon** | Split piece (1) | Two people, one piece: connection and business, not "versus". Its blue/white split is the wordmark's blue/white split. Reads down to 16 px. |
| **Wordmark** | Infinity wordmark (4) | The OO loop is the network that keeps going after the game. Clean at every size, so it carries the primary lockup. |
| **Primary lockup** | Mark + wordmark, horizontal | Mark height = 1.25 × wordmark height, base on the KING baseline, gap ½X. |
| **Stacked lockup** | Mark over wordmark | Split line centred on the wordmark. For splash screens, square posts, phone screens. |
| **Display wordmark** | Rook-I / king-I (3) | The richest version, but its cut-in pieces get thin when small. Heroes, posters, splash screens only, 320 px wide and up. |
| **Alternate mark** | Rook + king (2) | It still carries a draft seam and heavier shading, so it's a large illustration only, never the logo. |
| **Game pieces** | Halves of (1), each mirrored on its own axis | A full Rookie (blue) and a full King (white), so the board speaks the logo's language. |

## Files
| File | Use |
|---|---|
| `logo.svg/.png` | Primary lockup on dark (transparent) |
| `logo-on-light.svg/.png` | Primary lockup on light (KING in Navy, the King half in Navy) |
| `logo-stacked(-on-light).svg/.png` | Stacked lockup |
| `wordmark(-on-light).svg/.png` | Wordmark only |
| `wordmark-display(-on-light).svg/.png` | Display wordmark (rook-I, king-I) |
| `mark.svg`, `logo-mark.png` (1024, transparent) | Mark with his shading |
| `mark-flat.svg/.png` | Flat mark, under 48 px |
| `mark-on-light.svg/.png`, `mark-mono-white.svg`, `mark-mono-navy.svg` | Light and one-colour versions |
| `mark-alt.svg/.png` | Alternate rook + king |
| `app-icon.svg/.png` (1024), `app-icon-180.png` | App icon, full bleed (platforms add the mask) |
| `favicon.svg`, `favicon-32.png`, `favicon-180.png` | Favicon / touch icon |
| `pieces.svg` (`#rk-p-rookie`, `#rk-p-king`), `piece-*.svg/.png` | Game pieces |
| `icons.svg`, `icons.png` | Icon sprite |
| `palette.json`, `tokens.css` | Colour tokens |
| `brand-card.png`, `hero.png` | Brand summary and key visual |

## Clear space and minimum size
- **X = cap height of one wordmark line.** Keep ½X clear on every side. It's already built into every file.
- Minimum sizes: primary lockup 120 px / 30 mm · stacked 80 px / 20 mm · wordmark 96 px / 24 mm · display wordmark 320 px / 60 mm · shaded mark 48 px tall · flat mark 16 px tall.
- **Never:** recolour or swap the halves, put amber in the logo, stretch, outline, add effects, box the mark on a page (app icons are the only tile), retype the wordmark in a font, or bring back the overlapping drafts.

## Colour
Sampled from his file. His palette leads.
| Name | Hex | Source / role |
|---|---|---|
| **Navy** | `#06133F` | His artboard. Canvas |
| **Electric Blue** | `#1F5BFF` | His blue. Rookie half, ROOKIE, primary actions (white text 5.25:1) |
| **White** | `#FFFFFF` | King half, & KING, text (17.9:1 on Navy) |
| Ice | `#B3C7FF` | His rook highlight. Focus, glints |
| Deep Blue | `#0F2D7E` | His pawn shadow. Pressed states |
| Graphite | `#6F6F6F` | His king shadow. Piece shading only, never text |
| Night | `#030A24` | Deepest navy, board frame |
| Surface / Raised | `#0B1D55` / `#12286B` | Cards / raised |
| Sky | `#5A86FF` | Links, move hints (5.4:1 on Navy) |
| Steel / Mist | `#8B9AB8` / `#A9B6D6` | Cold, waiting, labels / secondary text |
| **Win Amber** | `#F59E0B` | The win only (8.3:1 on Navy) |
| Amber Deep | `#B45309` | Amber on light (5.0:1 on white) |
| Paper | `#F4F6FB` | Light background |

**Amber check:** Win Amber is the complement of his Electric Blue, so a little of it glows against Navy without fighting the logo. **Kept**, under strict rules: only for the handshake, the connection and the level-up, under 5% of any screen, never in the logo, never as a card fill. Cool tones (Steel, Mist) carry the cold message, waiting and status.

Full scales (blue 50–950, navy 400–950, steel, amber) and semantic tokens are in `palette.json` / `tokens.css`. Electric Blue as text on Navy is 3.4:1, so it's for large type and UI only. Links use Sky.

## Typography
- **Display: Poppins 800 / 900** (Google Fonts). This is the closest match to his wordmark, chosen by pixel overlap against his letterforms plus visual review: round geometric O, wide G, closed ampersand. Use it for headlines, numbers and buttons. Sentence case, −0.02em.
- **Text: Inter 400 / 500 / 600.** Use it for body, UI and clocks (tabular numerals). Labels are Inter 600 caps at 0.16em.
- The logo is always the vector file, never typed.

## Iconography
Solid silhouettes, like the mark: 24 grid, 2 px knockouts, 2.5 corner radius, one colour (`currentColor`). **Rookie, King and Connect are his own vectors** (the mirrored pieces and the infinity OO). Set: Board, Rookie (`rk-pawn`), King, Clock, Connect (`rk-handshake` / `rk-connect`), Scan to play (`rk-join`), Leaderboard (`rk-podium`), Invite, XP, Rank, Your move, Intro, Win. Amber is used on icons only for Connect/Win in the win state.

## Voice and language
**Taglines:** *Play the game. Build the network.* (primary) · Every king was a rookie. · One game. One real connection. · Skip the cold message. Play. · Make your move.

**Tone rules**
- Professional first, game second. Sound like a sharp operator who plays chess, not a gamer.
- Keep lines short and declarative. Lead with verbs.
- Use one chess word per line at most.
- Respect rank, then remove it. Never mock rookies, never flatter kings.
- Real results only. No invented members, stats or reviews.
- Cold words stay cool; warm words are for the win.
- No cartoon voice, no exclamation stacks, no emoji in the UI. No cartoon characters anywhere.

**Microcopy:** Send challenge · Challenge sent. Your move is waiting. · Your move. · Good game. Shake hands? · Connected. Say hello. · No reply in 3 days. Nudge or let it go. · No games yet. Open the board. · That move isn't legal. Try another square.

## Game design system
- **Board:** light squares `#1C3A8C`, dark `#0A1A4E`, frame Night `#030A24` with an Ice hairline; coordinates Inter 600 in Steel.
- **Pieces:** his Rookie (blue, his pawn gradient) and King (white, his king shading), soft ground shadow, lift 5 px on hover.
- **Moves:** the hint is a Sky ring and dot; the last move is Electric Blue at 22%; the trail runs from Electric Blue to Ice, with nodes on the squares passed.
- **Connection:** when the Rookie reaches the King, the trail turns Win Amber and the infinity loop appears. That is the only amber moment.
- **Cards:** Surface, radius 16, 1 px Ice line at 14%. The kicker label is Steel caps with the split chip (blue | white). The win card gets an amber border and glow, never an amber fill.
- **Buttons:** primary is Electric Blue with white Poppins 700; the win button is Amber with Navy text and appears only for "Shake hands"; secondary is an outline; cold/exit is Steel text.
- **XP:** a Raised track with an Electric Blue → Sky fill; level-up turns Amber.
- **Ranks (proposed, concept):** Rookie 0 · Contender 250 · Strategist 750 · Grandmaster 2000 · King 5000 XP, using the rank shield in Steel → Sky → Blue → White, and the King icon in Amber.

## NEEDS YOUR EYES (Dave)
1. The primary wordmark is the infinity version; the rook-I/king-I version is display-only. Swap them if you want the piece I's as primary.
2. Win Amber is kept as the win-only accent next to your blue. Say if you want it removed (the system works blue-only).
3. The rook + king draft is kept as an illustration only, because of its draft seam.
