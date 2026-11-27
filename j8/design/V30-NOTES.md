# J8NIX 3.0 — plan (27 Nov 2026)

## Information architecture
Before (2.0): 9 index-card tabs in one row — Status · Timeline · Today · Outbox · Income · Results · Chat · Workers · Settings (+ Your requests from Status).
After (3.0): **5 destinations**.

| # | Destination | Holds (2.0 screens) | Why |
|---|---|---|---|
| 1 | **Home** | money goal + warm leads + the one decision (old Today deck) + follow-ups due + "your steps" from projects + today at a glance | Opens on "what needs me now", ranked money-first (Monzo/Things/6.1 "Do this first") |
| 2 | **Plan** | Projects (old Status) ⇄ Timeline | Where every project stands, as list or picture |
| 3 | **Outbox** | old Outbox (waiting, going out, did they answer) | Daily job, needs its own place |
| 4 | **Results** | Overall (old Results) ⇄ By income line (old Income) | One place for "is it working" |
| 5 | **More** | Chat · Workers · Your requests · Settings · Classic view | Less frequent; each row shows its own one-phrase status |
Chat is also one tap from the top bar on every screen (speech-bubble button).

Keys: 1–5 destinations; G/H/X/E on the Home decision (same as 2.0).

## Home: one stream, top to bottom
1. One sentence: "N things need you" (or "Nothing needs you") + date.
2. Money bar: ₪ collected of ₪100,000 (straight bar, % and ₪ to go). Real `J8.money.summary()` only.
3. Warm leads (deal room, unchanged logic).
4. **Do this first**: the single top decision as the only raised slab (Go · Hold · Stop · Change, Undo).
5. "Also waiting · N" (next 4, tap → Outbox).
6. Follow-ups due (unchanged logic).
7. Your steps: projects whose "You:" line is set (max 3, tap → Plan with that project open).
8. Today at a glance: sent / replies 7 days, stall line, 24 h worker pulse.
Desktop ≥ 960: two columns — stream left, money + your steps + glance right.

## Navigation
- Phone/tablet < 960 px: fixed bottom bar, 5 items, icon + one-word label, 56 px tall + safe area; the active item has a filled icon, bold label and the J8 gradient marker. Compact top bar: screen title, Chat button, live/paused dot.
- Desktop ≥ 960 px: one header row — J8NIX lockup, the 5 destinations as horizontal items, Chat + status at the end. No sidebar.
- Sub-screens (Chat, Workers, Requests, Settings) get a Back button in the top bar.

## Visual system ("one line through the day")
- Identity from the J8NIX mark: navy ink #0C1030 + the mark's sky→indigo gradient (#5BB6F9 → #4075D8 → #3249C2). Gradient is used in only three places: the money bar, the Home stream spine, the active nav marker.
- Colour meanings kept from 2.0 (Dave already learned them): amber = waits for you, blue = moving/links, red = stop/risk, navy fill = your decision, grey = quiet.
- Surfaces: cool paper page, hairline rows, sentence-case headings (no caps eyebrows, no mono labels), 3/6 px radii (3SDS). One raised slab only for the one decision. Not a card grid.
- Type: Bricolage Grotesque (display) + Instrument Sans (body), Heebo for Hebrew (3SDS fonts). Scale 13/15/16/20/28/40.
- Light (default) and Dark (deep indigo-navy, never green), chosen in Settings → Look (Light / Dark / Match phone).
- Motion: 160–240 ms ease; decision cards lift/slide/drop as in 2.0; everything off under prefers-reduced-motion.
- Targets ≥ 44 px, focus ring 3 px blue, AA contrast checked per token.

## Function parity (all through window.J8 / window.j8x, unchanged)
Approve / Hold / Stop / Change / Go all / design choice / outcomes / Copy & open / Mark sent / follow-up actions / deal room edits / task Done with Undo / requests Done · Open again · Not needed / chat send / workers on-off / pause sending / autopilot per template / language / sound / guide + tour / sign-out / retry. 3.0 is a fork of the 2.0 view logic (j20.js → j30.js) with a new shell, IA, Home and stylesheet, so every action keeps the same code path.

## Rollout
`?ui=3` or localStorage `j8:ui`='3' loads j30; 2.0 stays default until checks pass. Then 3.0 becomes default; `?ui=2` (Settings → Classic view) opens 2.0.

## Review against Dave's rules
- Not Claude-default: no cream/serif/terracotta, no near-black+acid, no identical rounded card grid, no caps eyebrows, no mono labels, no sidebar dashboard. ✔
- Plain words: Home, Plan, Outbox, Results, More; "Do this first", "Also waiting", "Your steps". ✔
- One short phrase per item, tap to expand (existing details rows). ✔
- Visual status: money bar, timeline, notches, pulse. ✔
- Revised after review: dropped a progress ring idea (NN/g + Apple rings rule) for a straight bar; dropped a floating action button (no single create action exists in J8NIX) — the one primary action lives on the decision slab.


---

# J8NIX 3.0 — mobile UX research notes (27 Nov 2026)

Question: how do the best apps turn complex work into a simple phone experience, for a non-technical founder who must "open it and instantly understand"?

## Navigation
- **Material 3 / Android layout guide**: a navigation bar holds **3 to 5** destinations of the same level; on large screens switch to a rail or horizontal items; "avoid using the same bottom navigation bar across sizes". Drawers hold more than 5 but are "not as ideal… users must reach for the top bar". Window classes: compact < 600, medium 600–839, expanded ≥ 840 dp.
  https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-and-nav-patterns
- **Apple HIG, Tab bars** (updated Jun 2026): tab bar is for navigation, not actions; keep it visible across sections; fewer tabs are easier; **avoid overflow ("More") tabs where possible**; never hide/disable a tab, explain empty sections instead; single-word labels; badges only for critical info; iPad turns tabs into a top bar or sidebar; default to five or fewer.
  https://developer.apple.com/design/human-interface-guidelines/tab-bars
- **Linear mobile redesign** (Oct 2025): rebuilt navigation as a bottom toolbar for "quick access to core workflows" + one create action at the top of every screen. https://linear.app/changelog/2025-10-16-mobile-app-redesign ; nav customisation https://linear.app/changelog/2026-01-22-customize-your-navigation-in-linear-mobile
- Touch: 44 pt minimum target (Apple), 48 dp (Material); keep primary actions in the lower/middle thumb zone; respect safe areas (env(safe-area-inset-*)).

## Home = one ordered stream, not a dashboard of widgets
- **Monzo new Home** (blog): "Simplicity isn't the absence of things, it's bringing order to complexity." Home keeps the core jobs one tap away; discovery was the problem in the old app; they added snooze instead of interrupting mid-task.
  https://www.monzo.com/blog/how-we-built-the-new-home-screen
- **Things 3** (MacStories review): Today = one list, with "This Evening" kept in the same screen; tapping a task pops it into a card "while the rest of the list fades"; headings group without boxes; whitespace + bold type + small splashes of colour; Upcoming shows 7 days then groups by week/month.
  https://www.macstories.net/reviews/things-3-beauty-and-delight-in-a-task-manager/
- **Superhuman Split Inbox**: important items first in their own split; Done items leave the list; focus = fewer things on screen at once. https://help.superhuman.com/article/441-splits
- **Linear changelog, "Priority inbox"** (Sep 2026, title only, not read in full): https://linear.app/changelog/2026-09-03-priority-inbox

## Showing status to non-experts
- **NN/g, Dashboards: preattentive attributes**: show only critical info on one screen; **length and 2-D position** read fastest; colour is for highlighting, not magnitude, and never the only cue; prefer **linear bullet bars over radial gauges/donuts**; group with proximity and shape.
  https://www.nngroup.com/articles/dashboards-preattentive/
- **Apple Activity rings HIG**: rings are reserved for Move/Exercise/Stand — don't imitate them for other data (another reason for a straight progress bar). https://developer.apple.com/design/human-interface-guidelines/activity-rings
- **Duolingo core tabs redesign**: tabs worked alone but "didn't feel like part of the same family"; fix = standard header sizes by purpose, a minimal type scale, whitespace instead of containers. Result: higher engagement across tabs. https://blog.duolingo.com/core-tabs-redesign
- Duolingo streak/progress psychology (goal-gradient: visible progress toward a near goal motivates): https://blog.duolingo.com/how-duolingo-streak-builds-habit

## What this means for J8NIX 3.0
1. Nine tabs → **five destinations** (bar on phone, horizontal top nav on desktop — no sidebar, no overflow tab bar).
2. **Home is one ranked stream**: money first, then the single next decision, then the rest — the "Do this first" idea Dave liked in 6.1.
3. **One primary action per item**, decisions in thumb reach, Undo on every change (keep 2.0 behaviour).
4. **Progress as a straight bar** (bullet style), numbers with words, colour never alone.
5. **Hairline lists, not boxed cards**; one raised slab only for the one decision.
6. Sub-views sit inside a destination as a 2-way switch (Plan: Projects | Timeline; Results: Overall | By income line).
7. Empty and error states say why and what happens next; nothing invented.
