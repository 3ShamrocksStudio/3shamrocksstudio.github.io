# Chore Royale · Brand v3

**Idea:** the family is a royal court. Spin the wheel, earn Crowns, take the throne.
**Name:** always **Chore Royale**.

## Direction and rationale
- The game's current concept is the Royal Court: kids are Royals, the parent is the Regent, chores earn **Crowns** (to spend) and **XP** (to rank up), **pass cards** dodge a chore, and the weekly winner becomes **Monarch** and holds the **Spoon-Sceptre**.
- The old crest (a knight with a giant spoon) and the "Chore Wars" spray-bottle mark told two different stories. v3 tells one.
- **Mark:** a gold crown on a grape roundel, set on the app's starburst (kept from the current app so players recognise it), with the Spoon-Sceptre crossing behind the crown. The joke and the meaning are both there: chores are the work of the realm, so the sceptre is a spoon.
- **Wordmark:** Bungee in Crown Gold with a thick Royal Ink outline and drop, the same build as the app's current lockup, so it sits naturally in the existing UI.
- **Icon set** (`icons.svg`, 10 icons): Crowns, XP, Pass Card, Monarch, Sceptre, Wheel, Treasury, Feast, Decree, Regent. They follow the app's icon rules exactly (48 px grid, 3 px Royal Ink outline, flat brand fills, rounded joins), so they can be dropped into `app/icons.js` next to the existing chore icons.
- Palette, fonts and outline weight are unchanged from the app (`app/styles.css`). The upgrade is in the craft, not a new colour scheme.

## Palette (from `app/styles.css`)
| Name | Hex | Token |
|---|---|---|
| Royal Ink | `#1A0E5C` | `--ink` |
| Grape | `#4B23D9` | `--grape` |
| Grape Bright | `#6A3BFF` | `--grape2` |
| Crown Gold | `#FFD12E` | `--zap` |
| Splash | `#22D3EE` | `--splash` |
| Rival | `#FF3B7F` | `--rival` |
| Lilac | `#E9E3FF` | `--lilac` |
| Suds | `#F5F2FF` | `--suds` |

## Type
- Display and wordmark: **Bungee**. UI: **Nunito 700–900**. Keep words few; the icons carry meaning for kids.

## Files
- `logo.png`: horizontal lockup. `logo-stacked.png`: stacked lockup. `wordmark.png`: wordmark only.
- `logo-mark.png` / `mark.svg`: crown mark, 1024 px.
- `app-icon.png`: mark on a grape tile.
- `icons.svg` (sprite, ids `cr-*`), `icons.png` (sheet).
- `brand-card.png`: 1200×1200 portfolio card.

## Do
- Use Crown Gold for Crowns and the wordmark, Splash for XP, and Rival for the starburst and gems.
- Keep the 3 px ink outline on every icon and illustration.

## Don't
- Don't use the "Chore Wars" name or the spray-bottle mark in new material.
- Don't use war or attack imagery. It's a court, not a battle.
- Don't use emoji in place of these icons.
