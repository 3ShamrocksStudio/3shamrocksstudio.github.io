# J8NIX · Brand v3

**Idea:** the studio's operations OS. Time, tasks and projects in one command view.

## Derived from the real platform
Every value comes from the J8NIX platform we built (`3S Projects/J8NIX/index.html` `:root` tokens, `icon.svg`, and the dashboard wireframe):
- Canvas `--bg #0D1C2B`, header `--header-bg #0A1622`, panels on dark `--bg-2 #11283C`, cards `--panel-bg #FFFFFF`.
- Accent `--accent #F2C194` and `--accent-deep #E0A878` (the peach-gold of the original J8NIX wordmark).
- Status colours: Live `#2F9E63`, In progress `#2F74C0`, Waiting `#D4892A`, Backlog `#76859A`.
- Type in the platform: **Plus Jakarta Sans** for UI and **JetBrains Mono** for data.

## Direction and rationale
- **The 8 is an hourglass.** The platform's icon already drew the 8 as a thin hourglass line. v3 redraws it as a bold, round-capped stroke with a sand fill in the lower bulb (time spent, the day's progress), so it holds up from a 32 px favicon to a laptop dock.
- **Logo system:** app tile (peach hourglass on navy), the glyph alone in peach, white and navy, a wordmark where the hourglass replaces the 8 in `J8NIX` at cap height, and a full lockup with the `SMART OPERATIONS OS` mono tagline.
- **Desktop first:** the card shows the brand on a laptop-width dashboard frame, the way people will meet it.
- **Icon set** (`icons.svg`): 8 platform icons (tasks, projects, progress, status, chat, voice, reminder, audit) on a 24 px grid, 2 px round strokes in `currentColor`, with one filled accent (class `a`). They match the platform's actual panels and buttons.

## Palette
| Name | Hex | Platform token |
|---|---|---|
| Command Navy | `#0D1C2B` | `--bg` |
| Header Navy | `#0A1622` | `--header-bg` |
| Deck Navy | `#11283C` | `--bg-2` |
| Peach Gold | `#F2C194` | `--accent` |
| Peach Deep | `#E0A878` | `--accent-deep` |
| Slate | `#586475` | `--neutral` |
| Panel | `#FFFFFF` | `--panel-bg` |
| Ink | `#102A43` | `--text` |
| Live / In progress / Waiting / Backlog | `#2F9E63` / `#2F74C0` / `#D4892A` / `#76859A` | `--st-*` |

## Type
- Wordmark and UI: **Plus Jakarta Sans 800 / 400–700**. Data, labels and tagline: **JetBrains Mono 500–700**, caps, tracking 0.2em.

## Files
- `logo.png`: lockup for dark backgrounds (primary). `logo-on-light.png`: for light backgrounds. `wordmark.png`: wordmark and tagline, no tile.
- `logo-mark.png` / `mark.svg`: app tile, 1024 px.
- `glyph-peach.png`, `glyph-white.png`, `glyph-navy.png`, `glyph.svg`, `glyph-wordmark.svg`: the hourglass glyph.
- `icons.svg` (sprite), `icons.png` (sheet).
- `brand-card.png`: 1200×1200 portfolio card.

## Do
- Keep peach for the brand and for the active state. Use the status colours only for status.
- Use the mono face for numbers, dates and labels.

## Don't
- Don't use status colours as decoration.
- Don't swap the hourglass for a plain 8 in the wordmark.
- Don't show sample numbers as real figures in brand or marketing material.
