# J8NIX v15 — design direction "Dispatch"

> **NEEDS YOUR EYES** · Dave · draft direction for J8NIX 15 · 25 Nov 2026 · not linked from the app · nothing public.
> Preview: `j8/design/preview.html` (noindex, static). Backlog item `d-1125-01`.

## 0. The idea in one line

**J8NIX is your dispatch desk: your agents work, you clear the board.** One navy desk band on top tells you how many things wait for you; below it, one plain row per thing. Tap a row to see the detail. Nothing else competes.

Why "Dispatch": the job J8NIX does for an owner is the job a dispatcher does — many runners out, one person who says go / hold / stop. It gives every screen the same verbs (**Go**, **Hold**, **Stop**), the same layout (desk band + board), and a name for the look.

## 1. What the research says (sources opened 25 Nov 2026)

Four research passes ran in parallel: operator tools, AI-agent products, owner/mobile UX, and an audit of the live app.

**Operator tools**
- One "needs me" list is the default; everything else lives elsewhere. Linear made a Priority inbox the default tab "so a review blocking a release never gets buried" — https://linear.app/changelog/2026-09-03-priority-inbox
- "Not now" must not mean "lost": snooze brings an item back at a set time — https://linear.app/docs/inbox
- "Don't compete for attention you haven't earned"; "structure should be felt not seen" (fewer, softer dividers, no coloured icon tiles) — https://linear.app/now/behind-the-latest-design-refresh
- Build colour from a few inputs (base, accent, contrast) instead of dozens of variables; two type roles only — https://linear.app/now/how-we-redesigned-the-linear-ui
- Speed is design: ≤100 ms per action, preload the next item — https://blog.superhuman.com/superhuman-is-built-for-speed/
- After you act on one item, show the next; one thing at a time — https://a16z.com/game-design-not-gamification-for-great-products
- An empty board is a reward, not a grey "No items" — https://blog.superhuman.com/how-superhuman-chooses-inbox-zero-images/
- Group time as Today / Upcoming / Someday, mostly white space with "thoughtful splashes of colour" — https://www.macstories.net/reviews/things-3-beauty-and-delight-in-a-task-manager/
- A fixed action bar holds the context actions; search/commands are the front door on desktop — https://raycast.com/blog/a-fresh-look-and-feel
- Mobile is for "away from keyboard" jobs: stay informed, unblock, approve — https://linear.app/changelog/2024-09-19-introducing-linear-mobile

**AI-agent products**
- Per-action autonomy: No access / Ask each time / Always allow; money and sending always confirm — https://support.gusto.com/article/178034282147072/getting-started-with-gusto-cofounder
- "While you were away" digest of what the agent did and tried — same Gusto source
- One plain status per run: Needs action / In progress / Failed / Done; a fixable failure is "Needs action", not "Error" — https://help.zapier.com/hc/en-us/articles/36818600959501
- "What it did and why" sits behind an expand, not in the way; edits are plain requests ("make it shorter") — https://knowledge.hubspot.com/ai/review-agent-output?app=wp
- Approve / Reject / Give guidance, with the agent's reason shown — https://relevanceai.com/docs/build/workforces/workforce-features/approvals-and-escalations
- Gate what goes out (messages, money, deletes); don't gate reads; loosen as trust grows; global off switch — https://zapier.com/blog/safe-trustworthy-ai-agents
- Explain why, support quick correction, provide global controls (Microsoft HAX) — https://www.microsoft.com/en-us/research/blog/guidelines-for-human-ai-interaction-design/
- Confidence as words that say what to do, not percentages (Google PAIR) — https://pair.withgoogle.com/chapter/explainability-trust/
- Pitfall: if the owner must review everything, the agent isn't worth it — https://www.nngroup.com/articles/definition-ai-agent/

**Owner / mobile UX**
- Core view fits one screen; highlight one or two numbers — https://www.uxmatters.com/mt/archives/2007/04/book-review-information-dashboard-design.php
- Colour flags only, always with a word or icon; bars, not gauges — https://www.nngroup.com/articles/dashboards-preattentive/
- Put Approve / Hold in the lower-middle of the screen; people tap the centre most accurately — https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php
- Tap targets 44×44 pt (Apple) / 48 dp (Material), 8 dp apart; WCAG 2.2 floor 24 px — https://developer.apple.com/design/tips · https://support.google.com/accessibility/android/answer/7101858 · https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
- Swipe is only a shortcut; buttons stay visible — https://www.nngroup.com/articles/contextual-swipe/
- Routine approvals use Undo, not "Are you sure?"; confirm only money or delete, with outcome-named buttons — https://www.nngroup.com/articles/confirmation-dialog/
- Progressive disclosure: two levels max, label what's behind the expand — https://www.nngroup.com/alertbox/progressive-disclosure.html
- Sentences ≤25 words, aim 14 — https://insidegovuk.blog.gov.uk/2014/08/04/sentence-length-why-25-words-is-our-limit/ · one word per concept — https://digital.gov/guides/plain-language/principles/short-simple
- Text 4.5:1, large text 3:1, UI edges/icons/state 3:1 — https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html · https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html
- Loading: nothing <1 s, skeleton of the real layout for page loads — https://www.nngroup.com/articles/skeleton-screens/ · Empty: say why + one next step — https://www.nngroup.com/articles/empty-state-interface-design/ · Errors: next to the cause, how to fix, keep input — https://www.nngroup.com/articles/error-message-guidelines/

**Live J8NIX audit (14.1.0, 25 Nov, 375 px + 1280 px)** — what v15 fixes
1. The main job ("Do this now") starts ~700 px down on a phone; brief, date, scoreboard and goal come first.
2. Same number twice (₪ total in scoreboard and goal bar); "For you" repeats the "Do this now" title.
3. Counts disagree: Today "Waiting for your OK · 5" vs Needs you badge 3.
4. Five stacked uppercase eyebrows; only one has the brand dots.
5. 11–13 px labels at 56 % alpha; "What happened" tab label wraps to two lines.
6. Three button patterns on one screen (chips, "See 3, then approve", Yes/Not now).
7. Two vocabularies for one status ("NEEDS YOU" vs "Yellow · needs you", "Chequered · done").
8. Unlabelled pause glyph "II".
9. Raw 🟢/🔴 emoji leak into the timeline next to coloured dots.
10. Sign-in screen is a different look (light pill button, 1200 px-wide input on desktop).
11. Bottom tab bar is used on desktop too; no rail, wasted width.

## 2. Brand: J8NIX as a product

- **Name:** always `J8NIX` in caps in UI and copy. Say "J8" only as the agent's voice ("J8 drafted this"). Never "J8N.IX", "j8nix", "Jenix".
- **Lockup:** the existing wordmark (`j8/brand/j8nix-wordmark-2026-11-17.svg`) on light surfaces, unchanged. On the navy desk band use the **mark alone** (the gradient "8", `j8nix-mark-8-2026-11-17.svg`) at 24 px height plus the word "J8NIX" set in Bricolage 800 white — no CSS-invert of the wordmark (the audit found it is inverted with a filter today). Clear space = the width of the "8" on every side. Minimum: mark 16 px, wordmark 72 px wide.
- **Endorsement:** "by 3Shamrocks" with the three studio dots (green · teal · grape, 8 px, 5 px gap) appears once — in Settings and the sign-in footer. Nowhere else.
- **Colour source:** the logo itself. Navy `#060833` and sky `#5BB6F9` are lifted from the wordmark's gradient stops. That is what makes the look J8NIX's own and not the studio's black/violet.
- **Voice:** a calm dispatcher. Short, present tense, verbs first. "3 wait for you." "J8 sent 12. 2 replied." "Stopped: Gmail sign-in expired. Reconnect." Never hype, never emoji in UI, never "Oops".
- **Verbs (one word per concept, everywhere):** **Go** (approve / send), **Hold** (snooze; comes back at a time), **Stop** (kill), **Fix** (a failed thing you can repair). Status words: **Waiting for you · Running · Held · Stopped · Done**, plus **Quiet** for an engine with nothing open.

## 3. Tokens

Light canvas, navy desk band. Not cream/serif/terracotta, not black + acid accent, no green-toned theme. Fonts and radius follow 3SDS (`ops/brain/brandos/3SDS-LIVE.md`): Bricolage Grotesque + Instrument Sans, 3 px controls, 6 px containers, never 10–14 px rounded cards.

### Colour roles

| Token | Value | Role | Contrast (computed) |
|---|---|---|---|
| `--night` | `#060833` | desk band, primary button fill, nav active | white on it 19.26:1 |
| `--night-ink-2` | `#A9B4E8` | secondary text on the band | 9.52:1 on night |
| `--sky` | `#5BB6F9` | the one accent on the band (numbers' underline, focus on dark) | 8.72:1 on night |
| `--canvas` | `#F4F6FA` | page background | — |
| `--surface` | `#FFFFFF` | rows, sheets | — |
| `--ink` | `#0E1230` | primary text | 18.29:1 white · 16.91:1 canvas |
| `--ink-2` | `#3A4163` | secondary text | 9.92:1 white · 9.17:1 canvas |
| `--ink-3` | `#596082` | meta, captions, inactive nav | 6.14:1 white · 5.67:1 canvas |
| `--signal` | `#2448C8` | links, "Running" bar, focus ring on light | 7.40:1 white · 6.84:1 canvas |
| `--wait` | `#B06E00` | "Waiting for you" bar + icon | 4.14:1 white (UI ≥3:1) |
| `--wait-ink` / `--wait-bg` | `#7A4A00` / `#FFF1D6` | wait chip text / fill | 6.70:1 |
| `--stop` | `#D23A4A` | "Stopped / failed" bar + icon | 4.73:1 white |
| `--stop-ink` / `--stop-bg` | `#A3162A` / `#FDE7EA` | stop chip | 6.58:1 |
| `--done` | `#8A91AE` | "Done" bar (done is quiet grey, never green) | 3.11:1 white |
| `--line` | `#DDE2EE` | hairlines (felt, not seen) | decorative |
| `--edge` | `#8A91AE` | input / control borders | 3.11:1 white |

Rule: **one colour = one status, always with its word and icon.** Colour never shows size.

### Type
- Display: **Bricolage Grotesque** 800 for the desk numbers and screen titles; 700 for row titles in expanded state.
- Body: **Instrument Sans** 400/500/600, `font-variant-numeric: tabular-nums` on every number.
- Scale (px): 13 meta · 15 body-s · 16 body/row · 20 section · 28 screen title · 44 desk number (mobile) / 56 (desktop). Minimum UI text 13 px at `--ink-3` or darker; no alpha-dimmed text.
- No uppercase eyebrows except one per screen max; section labels are sentence case 15 px 600.
- Hebrew: Heebo swaps both roles (as 3SDS); layout mirrors with logical properties.

### Space, shape, motion
- 4 px grid: 4 · 8 · 12 · 16 · 24 · 32 · 48. Side gutter 16 px (mobile), 32 px (desktop). Rows min-height 56 px.
- Radius: 3 px controls/chips, 6 px rows/sheets/band. Nothing rounder (pills only for count badges).
- Status bar: 4 px wide on the row's start edge — the signature "ticket notch".
- Elevation: none on rows (hairline only); sheets get `0 12px 32px -12px rgba(6,8,51,.28)`.
- Motion: 140 ms ease-out `cubic-bezier(.2,.8,.2,1)` (3SDS ease) for expand and row exit; the row you clear slides out and the next one moves up. Undo toast 6 s. All off under `prefers-reduced-motion`.
- Targets ≥48 px tall, 8 px apart. Focus ring 2 px `--signal` offset 2 px (on navy: `--sky`).

## 4. Information architecture

Five places. Mobile: bottom bar, 5 items, single-line labels. Desktop ≥1024 px: left rail 232 px, board max 760 px, detail opens in a right pane instead of a sheet.

| Place | Its job in one line |
|---|---|
| **Today** | Tell me in 5 seconds what waits for me and that the machine is running. |
| **Approvals** | Let me Go / Hold / Stop everything that would leave the building, fastest first. |
| **Engines** | Show each business line's one number and whether it is moving. |
| **Agents** | Show who ran, what they did, what failed, and let me switch any of them off. |
| **Settings** | Rules (what may go out without me), connections, voice, language, size, sign out. |

Talk (chat with J8) is not a tab: it is the "Ask J8" field pinned at the top of Today and inside every row's detail, so questions start from context.

### Screens
- **Today** — desk band: one sentence ("3 wait for you") + three numbers: *Waiting for you · Agents ran (24 h) · Replies (7 d)*. Board: "Do this first" (one row, top of the fold), then "Waiting for you" (max 3 rows + "All approvals"), then "While you were away" (one line per agent with a problem, folded otherwise). Goal/money lives in Engines, shown once.
- **Approvals** — one list, grouped by engine, most money first. Row: notch + who/what in one phrase + channel. Tap → detail with the exact text going out, why J8 drafted it, Go / Hold / Stop, "Change it…" (plain-words edit request). Same-template drafts collapse into one row "12 follow-ups · same template" with **Go all** after a preview of 3. Every Go shows "Sent · Undo" for 6 s (send is held 6 s).
- **Engines** — one row per engine: name, one number (its KPI), a 7-day bar, a status word. Tap → that engine's plan, its waiting approvals, its agents.
- **Agents** — one row per agent: name, last run, status word; failures first. Tap → last 10 runs, what it did, switch On/Off. Global "Stop all" in the band (labelled, not a glyph).
- **Settings** — Rules: per action Ask each time / Always / Never; money and first-contact always ask.

### States
- **Loading:** nothing for the first 1 s, then a skeleton of the real board (band + 3 grey rows). Never "No items" while loading.
- **Empty:** Approvals: "Board clear. J8 will ping you when something needs you." + one quiet link "See what went out". Today with nothing waiting: the band says "Nothing waits for you" in sky and the board shows the next scheduled run.
- **Error:** inline on the row that failed, in plain words with the fix: "Didn't send: Gmail sign-in expired. **Fix**". Network: a slim bar under the band "Offline. Showing 08:41 data." Never a blank screen; typed text is kept.
- **Signed out:** same desk band (mark + J8NIX), one email field, one navy button "Email me a sign-in link", the 3Shamrocks endorsement under it. Max width 420 px on desktop.
- **Paused:** the band turns to `--wait-bg` stripe "Paused — nothing goes out. **Resume**".

## 5. Real data rule

Every number shown is read from Supabase at build or run time with its "as of" time. Anything illustrative carries a visible **Sample** chip. The preview bakes a read-only snapshot (aggregate counts only — no names, no message text, no money figures, nothing personal) taken 25 Nov 2026 07:47 UTC.

## 6. Rollout (proposal, for Dave's OK)

1. v15.0: tokens + desk band + Today board on the existing j13 data (no new tables).
2. v15.1: Approvals list with Go/Hold/Stop + Undo, batch row.
3. v15.2: Engines + Agents; desktop rail and right pane.
4. v15.3: sign-in and Settings → Rules.
Each step keeps `index-14.1.0` revert files, per the app's existing practice.
