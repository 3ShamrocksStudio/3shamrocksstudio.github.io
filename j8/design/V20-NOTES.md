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

## 15.1.0: Engines and Score (slice 2, backlog d-1125-02b)

- **Engines** (butter card, key 3): one row per active engine. Each row has its name and one short phrase on the left, and on the right one number: replies. The status word comes first in the phrase: **N wait for you** (amber), **Moving** (sent something in the last 7 days, blue) or **Quiet** (grey). The word is always written out, never shown by colour alone. Tap a row to see Now, Next and that engine's own draft-to-paid steps, plus "See what waits". If J8 has never drafted for an engine, it shows "Not counted yet" instead of a 0. Parked or hidden engines fold under **Resting**.
- **Score** (sky card, key 4): one line on top, e.g. "9 replies from 83 sent · 1 call". It counts **drafts made in the last 30 (or 7) days, and where they are now**. The step list runs Drafted → Approved → Sent → Replied → Call → Proposal → Paid. Each step shows "X of N" of the step before; a percent shows only when the step before has 20 or more and the step itself has 5 or more. Below that come the engines that sent something (the others are folded) and money booked against the goal. The 7 d / 30 d choice is shared by both spaces and remembered on this device.
- Data: `public.j8_funnel` (built in b-1125-01, security_invoker, viewer read), read through the new read-only `J8.funnel()` in j8-data.js; j8_projects, j8_approvals, j8_money. No new tables.
- Six tabs on a phone: the six share the row evenly (57 px each at 375 px), with nothing hidden and no scrolling strip.

Research for 15.1 (opened 25 Nov 2026):
- Small counts: "X of N" beats a percent; with a small base the percent looks more certain than it is: https://stephanieevergreen.com/visualizing-small-datasets · https://hsph.harvard.edu/research/health-communication/resources/tips-for-using-numbers · https://evanmiller.org/how-not-to-sort-by-average-rating.html
- A list of numbers instead of a tapered funnel, with a one-line takeaway on top: https://developer.apple.com/design/human-interface-guidelines/charting-data.md
- Name the window and what it counts (cohort vs activity): https://linear.app/docs/insights.md · https://support.pipedrive.com/en/article/insights-reports-deal-conversion · https://amplitude.com/docs/analytics/charts/funnel-analysis/funnel-analysis-interpret
- Status words with colour, never colour alone: https://www.w3.org/WAI/WCAG21/Understanding/Use-of-Color.html · https://www.nngroup.com/articles/dashboards-preattentive/
- "Not measured yet" is its own state, not a 0: https://linear.app/docs/initiative-and-project-updates · https://nngroup.com/articles/empty-state-interface-design
- Rows collapsed by default, inactive items folded away: https://www.nngroup.com/articles/mobile-accordions/ · https://culturedcode.com/things/support/articles/4001304/
- Tabs: no more than about 5–6, never hidden, never two rows, targets ≥ 44 px: https://developer.apple.com/design/human-interface-guidelines/segmented-controls.md · https://www.nngroup.com/articles/tabs-used-right/ · https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html

## Not in 2.0 yet (next slices, already in the backlog)

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

## 15.2 · Agents space (backlog d-1125-02c, 25 Nov 2026)
Research: 3 parallel agents. What we took:
- One status per run, from a small fixed set (Zapier run statuses https://help.zapier.com/hc/en-us/articles/20505304170637 ; Make history https://help.make.com/scenario-history ; Sentry Crons ok/failed/missed https://docs.sentry.io/product/crons/job-monitoring). J8NIX: OK / Nothing to do / Failed / Running, plus Quiet (no run for over a day), No run, Off.
- "Late" is not a failure (Healthchecks grace time https://healthchecks.io/docs/configuring_checks/): Quiet is a neutral clock, never red.
- The newest run decides; failures go first and are named in one line at the top (Copilot Studio activity https://learn.microsoft.com/microsoft-copilot-studio/authoring-review-activity ; Claude Code routines https://code.claude.com/docs/en/routines ; NN/g indicators https://www.nngroup.com/articles/indicators-validations-notifications/).
- Honest signal, no confidence theatre (Google PAIR https://pair.withgoogle.com/chapter/explainability-trust/): the tick shows only when every active agent ran in the last ~26 h and none failed.
- Switch acts at once, Undo instead of a confirm (NN/g toggles https://www.nngroup.com/articles/toggle-switch-guidelines/); role=switch + aria-checked + fixed label (WAI-ARIA APG https://www.w3.org/WAI/ARIA/apg/patterns/switch/); knob mirrors in RTL (Wikimedia Codex https://doc.wikimedia.org/codex/main/style-guide/bidirectionality.html).
- Status never by colour alone: a different glyph shape per status + a word (WCAG 1.4.1, 1.4.11). Targets ≥44 px (Apple HIG).
- Relative times; Hebrew written by hand because ICU prints "שעתיים (2)" (MDN Intl.RelativeTimeFormat).
- Run history by day, Problems only filter (Sentry daily rollup; Make "hide runs with no data").

## 15.4 · Guide (backlog d-1125-05, 25 Nov 2026)
What you see:
- **First open: a guided start.** It asks 3 short questions on one ticket each: Who you are (name + what you do), Your goal (one tap, plus your own words if you want), Your channels (pick any). Each step shows "Step N of 3" with its name, and has Back and **Skip this**. **Skip setup** skips the rest.
- **Channels are honest.** Email shows its real sender state (Connected · sending works / sending stopped / no send yet). Every other channel says "Picked · not set up yet". One link writes the ask to the team in Talk, and you press Send yourself.
- **"You are set."** shows your answers, then **Show me around · 4 stops** or **Start working**. The tour never starts by itself.
- **The tour has 4 stops:** Today · Queue · Engines and Score · Talk, Agents and Settings. It runs on the real screen, the space's tab lifts with an ink bar, and a slip says one line. You get Next, Back and End tour, plus Escape. "Stop N of 4" is read aloud through a polite live region.
- **Every space has a help line.** It is one phrase with a "?" tile and **How it works**, which opens What / How (≤3 steps) / When. **Hide** removes it for good. Once you have used a space, the line folds to a small "?".
- **The guide learns from what you do.** These signals count: opening the same help twice, Undo right after a decision, Back in the tour, 3 fast taps on one button, and over 20 s idle on a setup step. Each one is written once to j8_memory (kind fact, tags onboarding), and that space's help line comes back with a **Tip**. The tip opens by itself at most once a session and 3 times per space, and never after Hide.
- **Score shows your goal** against its real count, e.g. "Your goal: Book calls · Call: 2 in 30 days".
- **Settings → Guide:** Set up again (your answers stay), Show me around, Help lines on screens on/off, Show hints again.
- Data: progress is saved in `j8_members.prefs.guide` through `j8_prefs_set` (own row only), with a local copy. Answers, skips and struggles go to `j8_memory`. There is no schema change.

Research (3 parallel agents, 25 Nov):
- Tours: 3–4 steps complete at 72–74%, while 7+ steps complete at 16%. Tours the user launches complete at 67%, against 31% for timed ones. Progress indicators add 12%: https://www.chameleon.io/blog/mastering-product-tours · https://www.chameleon.io/blog/product-tour-benchmarks-highlights
- Prefer pull help over push help. Skippable, findable again, one concept per card: https://www.nngroup.com/articles/onboarding-tutorials/ · https://www.nngroup.com/articles/mobile-tutorials/ · https://www.nngroup.com/articles/help-and-documentation/
- Onboarding should be fast, fun and optional. If it was skipped, don't re-show it, and keep it in Settings. Tips are 1–2 sentences, and none for a feature already used: https://developer.apple.com/design/human-interface-guidelines/onboarding · https://developer.apple.com/design/human-interface-guidelines/offering-help
- Ask few questions, one tap each, and say why you ask: https://userpilot.com/blog/welcome-survey/ · https://goodux.appcues.com/blog/duolingo-user-onboarding
- Status must be real. Steps outside the app are named, not faked: https://www.nngroup.com/articles/smart-device-onboarding/ · https://shopify.dev/docs/api/app-home/latest/patterns/compositions/setup-guide.md
- Wizards: say how many steps there are, name each one, and give an explicit Back: https://www.nngroup.com/articles/wizards/
- The tour step is a non-modal dialog, not a tooltip. Escape works and focus is moved: https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/ · https://www.w3.org/WAI/ARIA/apg/patterns/tooltip
- Struggle signals: Undo/erase reveals over 80% of severe problems (https://research.google/pubs/undo-and-erase-events-as-indicators-of-usability-problems/). Rage taps are 3 within 1–2 s (https://docs.sentry.io/platforms/javascript/session-replay/issue-types).
- Caps: 1 tip a session, a tip stops once the feature is used, dismiss = never again (https://chromium.googlesource.com/chromium/src/+/798e59c5275d4131797e8ea2e96e6c6000256b58/components/feature_engagement/README.md). Remember and adapt cautiously (https://www.microsoft.com/en-us/research/blog/guidelines-for-human-ai-interaction-design).
