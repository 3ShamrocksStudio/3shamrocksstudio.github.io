# J8NIX 2.0 — "Card file" (15.0.0, 25 Nov 2026)

> Backlog `d-1125-02`, slice 1. Dave, 25 Nov: "a completely different new product … do not create another Claude design product … only adhere to top-line best practices." Internal tool at /j8/ (signed-in only). The old app stays at /j8/classic/.

## What changed for you

- **A card file, not a dashboard.** Each space is a coloured index card with a tab on top: Today (sky), Queue (coral), Talk (lilac), Settings (fog). The open card is the folder you work in, so you always know where you are. Keys 1–4 switch spaces. There is no tab bar and no sidebar.
- **One decision at a time.** Today opens with a big ticket number (how many wait for you), one line (sent and replies in the last 7 days) and a 24-hour pulse of agent runs (a red tick = a failed run). Then comes the **deck**: the top ticket is the next thing that needs you, money first, with the others peeking out underneath. Each ticket has a stub number (1/7) and a tear line, and the decision sits below the tear.
- **Same verbs on every card:** **Go** (approve) · **Hold** (move it to the back for now) · **Stop** (not now: it won't be sent). There is also **Change** (edit the text, then it goes) and **Go all** (same message to many people, with 3 previews first). Replies get Call / Proposal / Won / Lost, your steps get **Done**, and by-hand messages get **Copy & open** / **Mark sent**. Every Go, Stop and Done shows a one-line **Undo** for 6 seconds in the top bar. A held ticket waits in Queue, and the clear deck offers "Bring back held".
- **Lockup:** a white "8" on a navy tile, then J8NIX with a small 2.0.
- **Motion:** a card you send lifts away, a card you hold slides aside, and a card you stop drops down. **Sound:** a soft short tone on decisions only, which you can turn off in Settings.
- **Hebrew:** Settings → עברית turns the whole app right-to-left with Hebrew labels.
- **Desktop:** the same folder, with "Up next" beside the deck. Keys: G = Go · H = Hold · X = Stop · E = Change. Enter only ever presses the focused button.

## Not in 2.0 yet (next slices, already in the backlog)

- Engines + Scorecard (per engine, one number + its funnel).
- Agents / Receipts (every run, routine on/off).
- A new sign-in screen and a full Hebrew pass.

Until those ship, Settings → "Old J8NIX (14.1)" opens Plan, Proof, Missions and every older screen.

## Research that shaped it (opened 25 Nov 2026)

- Each context gets its own colour or theme, and you can switch by tap, swipe or shortcut (Arc Spaces): https://allthings.how/how-to-use-spaces-in-arc-browser/
- Stacked cards show just their header, keeping the front uncluttered (Apple Wallet HIG): https://developer.apple.com/design/human-interface-guidelines/wallet.md
- Glanceable summary: latest value per favourite, then highlights (Apple Health): https://www.macstories.net/?p=60534
- Triage with one question per item, a key per answer, few splits (Superhuman): https://help.superhuman.com/article/582-achieving-inbox-zero · https://help.superhuman.com/article/581-split-inbox-basics
- One-at-a-time yes/no gets shallow, so the full text is shown on the card, not hidden: https://builtin.com/articles/tinder-swipe-design
- Swipe only as a shortcut, with visible buttons and Undo. Here it is left = Hold only, so nothing can be sent by accident: https://www.nngroup.com/articles/contextual-swipe/
- Undo instead of confirm for routine actions; a second tap only for Stop, Kill and Done: https://www.nngroup.com/articles/confirmation-dialog/
- Confirm only significant actions; feedback through more than one channel (colour, text, sound, haptic): https://developer.apple.com/design/human-interface-guidelines/feedback.md
- Sound: when in doubt, none; keep it short and quiet; never the only signal; let people turn it off: https://learn.microsoft.com/en-us/windows/win32/uxguide/vis-sound · https://design.google/library/ux-sound-haptic-material-design · https://developer.apple.com/design/human-interface-guidelines/playing-audio.md
- Motion: enter 225 ms with a decelerating curve, leave 195 ms with an accelerating one; fades only under reduced motion: https://m1.material.io/motion/duration-easing.html · https://w3.org/WAI/WCAG21/Understanding/animation-from-interactions
- RTL: logical CSS properties, `dir="auto"` on all data, mirror only directional icons, never numbers: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties/Margins_borders_padding · https://w3.org/International/articles/inline-bidi-markup/index.en.html · https://m1.material.io/usability/bidirectionality.html
- Operator-tool lessons: a priority view by default, and "not now" never means lost (https://linear.app/docs/inbox); speed under 100 ms (https://blog.superhuman.com/superhuman-is-built-for-speed/); an empty state as a reward (https://blog.superhuman.com/how-superhuman-chooses-inbox-zero-images/).
- Owner / mobile: buttons at least 44–48 px in the lower-middle of the screen (https://developer.apple.com/design/tips · https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php); colour always paired with a word (https://www.nngroup.com/articles/dashboards-preattentive/).

## Tokens

| Role | Value | Contrast |
|---|---|---|
| desk (page) | `#EEF0F5` | — |
| ink | `#0C1030` | ≥ 14.18:1 on every space colour |
| ink-2 | `#384064` | ≥ 7.70:1 |
| ink-3 | `#565E80` | ≥ 4.85:1 |
| space: Today / Queue / Talk / Settings | `#D6E6FF` / `#FFDCD5` / `#E3DDFF` / `#E4E8EF` | — |
| card | `#FFFFFF`, 1 px line, 6 px radius, soft deep shadow | — |
| Go | ink fill, white text | 18.54:1 |
| Stop | `#A3162A` on white | 7.76:1 |
| links | `#1D4ED8` | ≥ 5.30:1 |
| control edge | `#7E86A6` | 3.59:1 on white |

Type: Bricolage Grotesque 800 for titles and numbers, Instrument Sans for text (3SDS), Heebo first in Hebrew. Radius 3 px for controls and 6 px for cards, per 3SDS: never 10–14 px.

## How it's built

- `j8/j20.js` and `j8/j20w.css` (inside the app's own shadow root) plus `j8/j20.css` (decides which app is in front).
- Every read and write goes through `window.J8`, the same data engine as 14.1. The 14.1 logic is reused through `window.j8x` (money-first desk order, batches, going out, outcomes, sender line, templates), so 2.0 and classic always agree on what waits.
- Revert: `git revert` of the 15.0 commit, which brings back index.html and sw.js 14.1.
