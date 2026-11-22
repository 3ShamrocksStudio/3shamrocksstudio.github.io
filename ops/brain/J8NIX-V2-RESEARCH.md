# J8NIX v2 research: e2e missions, references, 3 directions (22 Nov 2026)

> Research team run, 22 Nov 2026. Read-only except this file. Follows `DESIGN-RULES.md` (research first, no Claude-default look, originality, ask Dave when unsure).
> Inputs: `DESIGN-RULES.md`, `J8NIX-AUDIT-1119.md`, `J8NIX-PRODUCT.md`, `assets/brand-v3/j8nix/BRAND.md`, `brandos/3SDS-LIVE.md`, the live app in `/j8/` (PWA 11.8.0), and the web pages listed under Sources (all opened in this run).
> Dave's order (22 Nov): J8NIX must run operations and automations by itself, end to end, like the Trashure Hunters session. Dave supervises from phone or desktop. It must lead, mentor, assign and stay goal-driven.

## TL;DR (plain words)

1. Today J8NIX is a to-do app with an AI attached. v2 must be the reverse: **an AI crew that runs missions, with a small control screen for Dave.**
2. The unit of work becomes a **Mission**: one goal, a number, a date. J8 writes the plan, runs it, checks it, and stops only at gates Dave agreed to up front.
3. The TH session is the model: goal → plan → run everything → find the problem → fix → **prove it with evidence** → push → "here is what's done, here is the one thing left for you".
4. The best agent products all share 5 habits: show the plan before acting, show live state, attach proof (logs, tests, links), allow stop and undo, and ask only at real decision points.
5. **Proof is the product.** Codex cites terminal logs and test output. Manus lets you replay every step. J8NIX must attach evidence to every "done", and count "did nothing" as a failure.
6. **Ask less, ask better.** Approving 99% good items makes people rubber-stamp. Gates come only for money, new public claims, sends outside approved templates, keys and LinkedIn by hand.
7. **Mentor = one move.** Each morning J8 gives one next move, why it matters in ₪, and a button that starts it (WHOOP's Daily Outlook model). A short wrap-up at night.
8. **Goal-driven = a pace line.** Home shows cash this month against the ₪100,000 focus target, and whether we are ahead or behind pace. That number drives which mission runs next.
9. **5 screens, phone first:** Now, Missions (with drill-in), Gates, Proof, Talk. Everything else goes.
10. **Delete:** the 31-project board, the $1M scoreboard, C-level pods, the canned reply, empty tables, the stale schedule, Stats, Processes and the old versioned files.
11. **3 brand directions**, each drawn from a real safety system where colour already *means* something: Magenta Line (flight deck), Lit Keys (instrument console), Pit Wall (race engineer). None uses Claude's cream, coral and serif, or SaaS purple gradients and round cards.
12. **NEEDS YOUR EYES:** Dave picks 1 of the 3 directions (or mixes them). Then we build one Home mock in that direction to review, before any code.

---

## A. Product and operating model

### A1. How the best agent products handle "mission → plan → execution → evidence → human gates"

| Product | What it does well | What J8NIX takes |
|---|---|---|
| **OpenAI Codex** (cloud) | Each task runs in its own isolated workspace. It gives "verifiable evidence of its actions through citations of terminal logs and test outputs", and it says plainly when tests fail or it is unsure. A repo file (AGENTS.md) tells it which tests to run. Tasks keep running when the computer sleeps, and you can pick them up on mobile. | Every step J8 reports as "done" carries its evidence: a link, a test count, a sent count, a screenshot. Each mission has one short "how to check" note, like AGENTS.md. |
| **Manus** | A side panel ("Manus's computer") shows each step it takes. **Replay** rolls back the timeline. It works in the cloud in the background and notifies you when done. | The Proof screen is a timeline you can replay. A push alert only when a mission ends or hits a gate. |
| **ChatGPT agent** | It "requests permission before taking actions of consequence". You can interrupt, take over or stop at any point. Watch Mode is for critical steps like email. On-screen narration. Pause, get a progress summary, or stop and keep the partial results. | Three controls on every mission: **Pause**, **Steer** (a message mid-run), **Stop and keep what's done**. A plain one-line narration of what J8 is doing now. |
| **Claude Code** | Checkpoints before every change, with rewind of code, conversation or both. Hooks run tests automatically. Subagents work in parallel. The limit it states plainly: outside side effects are not undone. | Two kinds of step: **reversible** (code, files, data: auto, with undo) and **irreversible** (sends, posts, payments: always behind a gate or an approved template). The app says which kind each step is. |
| **Claude Cowork** (scheduled tasks + Dispatch) | Each scheduled run is its own session, listed under "Scheduled". Dispatch is one thread across phone and desktop: assign from the phone, get the result back in the same thread. Tasks that need local files run only when the computer is on. | Matches our setup (hourly scheduled runs, Mac arm, on-demand from the main chat). Talk is **one thread**. Missions needing the Mac show "waits for Mac" instead of failing silently. |
| **GitHub Copilot agent: "mission control"** | One view to assign, steer and track tasks. You can steer mid-run and it adapts "as soon as its current tool call completes". Logs sit beside the Overview and Files-changed tabs. Works from GitHub Mobile. | Mission detail = Overview, Proof and Changes side by side. A steer message is picked up at the next run. |
| **Cursor (web and mobile agents)** | Launch agents from any browser or as a PWA. Run several in parallel. Review diffs and open pull requests from the web. Slack ping when done. | J8NIX stays a PWA. Several missions run in parallel. Dave reviews results, not process. |
| **Devin** (Session Insights) | After each session: a timeline of issues rated high, medium or low impact, an "Improved Prompt", and suggested setup changes. | After each mission: **"What slowed us down"** (max 3 lines) and one rule change J8 will apply next time. That is how J8 keeps learning. |
| **Replit Agent 3** | Tests its own app in a real browser and fixes what fails. Runs up to 200 minutes. Max Autonomy is a setting you switch on. Builds other agents and scheduled automations. | A **verify step is built into every plan**: an independent check pass, as CLAUDE.md already requires. A mission cannot reach "done" without it. |
| **Lindy** | Asks before "actions that affect something outside your workspace". Drafts follow-ups "for your approval". Recurring tasks ask before changing anything. | The gate rule is simple: inside the studio = act. Outside the studio, in Dave's name = gate or approved template. |
| **Factory "Missions"** [not opened: search results only] | Factory already uses "Missions" as a product name for long multi-agent runs. A Factory review we did open says "Autonomy is only as trustworthy as the verification it runs against" and advises earning autonomy one task type at a time. | Using "Mission" as an internal word is fine. Check before using it as a public product name. Autonomy is earned per mission type. |

### A2. What makes supervision feel safe and effortless

From Knight First Amendment Institute "Levels of autonomy for AI agents", Smashing Magazine (Feb 2026) "agentic UX patterns", Linear's Agent Interaction Guidelines and Apple's Live Activities guidance:

1. **Show the plan before acting (Intent Preview).** Plain steps, with three choices: proceed, edit, take over. For J8: the plan auto-starts after a short hold window unless Dave edits it, so he is never the bottleneck.
2. **An autonomy dial per kind of work, not one global switch.** The Knight levels map cleanly to Dave's rules:

   | Kind of work | Level (Knight) | J8NIX behaviour |
   |---|---|---|
   | Code, QA, research, data fixes, docs | Observer / Approver | Runs alone, reports with proof; full log; stop switch |
   | Messages that fit an approved template (from 12 Nov rule) | Approver | Sends within daily caps and hold window; Dave can kill any |
   | First replies to live prospects, past clients, friends, family; prices, quotes, invoices; new public claims | Consultant → gate | J8 drafts; Dave taps Go or No-go |
   | Spending, keys, credentials | Operator | Never alone; Dave does or approves each one |
   | LinkedIn | Gate, by hand | J8 drafts and hands over Copy + Open + Sent; never automated |

3. **Transparent state, always.** Linear's guidelines: show whether an agent is "thinking, waiting, executing, or finished", give "instant feedback" when invoked, and step back right away when asked. For J8: replace the canned "Got it" line (149 of 155 replies, audit) with a real state chip, e.g. "Seen · next run 14:00".
4. **Confidence and rationale.** Say *why* J8 chose this step, based on Dave's own goals and data, and how sure it is. Low confidence → ask, don't guess (Escalation Pathway).
5. **Audit + undo, with honest limits.** One timeline of actions; undo where possible; clearly mark what cannot be undone (Claude Code is explicit that outside side effects are not reversed).
6. **Humans stay accountable.** Linear: "the final responsibility should always remain with a human." The gate list is Dave's, written once, editable, and shown on each gate card.
7. **Alert only when it matters.** Apple: "Alert people only for essential updates that require their attention"; update only when content changes; one Live Activity that rotates many events beats many. For J8: phone alerts only for gates and finished missions; a single "live" strip for everything running.
8. **Beat approval fatigue.** The product doc (TechTarget) already found reviewers rubber-stamp when ~99% is fine. So: fewer, bigger gates; templates approved once; each gate shows the evidence and a recommended default.

### A3. Leadership and mentorship patterns

- **WHOOP**: a **Daily Outlook** each morning (when to push, when to rest), check-ins that "stay quiet when no action is needed", and a **Day in Review** at night. Guidance is grounded in the member's own data.
- **Devin Session Insights**: after-action feedback with concrete fixes.
- **NASA flight control**: one Flight Director, each console owns one system, and a **go/no-go poll** before every major event. The back room handles detail and the front room fits it into the plan. Any controller can call an abort.

**J8NIX mentor model:**
- **Morning: "The one move."** One action for Dave, its value (₪ × chance ÷ days, the FOCUS formula), time needed (e.g. "4 min"), and one button that starts it. Then at most 2 more, folded.
- **During the day: silence** unless a gate opens.
- **Night: "Day in review", 3 lines** (the FOCUS report: what went out / what came back / the one thing Dave must do), plus the pace line.
- **Weekly: "Board brief"**, with research first per Dave's rule for board meetings.
- **Leadership = J8 assigns itself.** When a mission stalls, J8 re-plans it or proposes killing it ("No progress in 3 runs: kill, or change the plan?"). It never just waits.

### A4. The TH e2e session as the template for every mission

| TH session step | Mission stage | What the app shows |
|---|---|---|
| Took the repo, ran the backend locally | **Plan + set up** | Plan with steps and gates; "kind: reversible" |
| 430 unit + 12 E2E + 122 security tests | **Run** | Live strip: "Running tests · 312/564" |
| Found and reproduced a critical exploit | **Finding** | A finding card with its proof (repro steps, log link) |
| Wrote the fix and regression tests | **Run** | Changes list |
| Verified, pushed | **Verify** (independent pass) | Green check + evidence links (commit, test output) |
| Reported done / left for Dave | **Report** | 3 lines + "Left for you: 1" |

### A5. Constraints this must respect (honest version)

- **Runs are hourly at best**, plus the Mac arm and on-demand runs from the main chat. "Live" in the app means "last run 23 min ago · next 14:00". **Run now** in the app queues a request. It runs at the next scheduled run, or right away if Dave fires it from the main chat. The app must say which.
- **Check before running** (audit change 5): a run that finds nothing to do exits at zero cost and is not logged as a run.
- **Mac arm**: missions that need it show "waits for Mac" and never count as failed.
- **LinkedIn is manual, always**: it lives in Gates as Copy · Open · Sent.
- **Data in Supabase**: additive only. A `j8_missions` table (goal, metric, target, due, autonomy, status), a `mission_id` on `j8_tasks` and `j8_approvals`, and a `j8_evidence` table (step, kind, link, summary). Reuse `j8_runs`, `j8_rank` and `j8_control` (stop switch).
- **Zero spend.** No paid tools, no paid fonts (all fonts below are free on Google Fonts or open source).
- **Token budget**: the run card stays under 15 KB (audit change 7). Each run reads only the missions due.

---

## B. UX and layout references for a supervisor cockpit (15)

| # | Reference | What to take | What to avoid |
|---|---|---|---|
| 1 | **NASA flight control** (flight director, consoles, go/no-go polls) | Dave = Flight Director. Each mission = a console with one owner. Gates are **polls**: Go / No-go, never long forms. | Room-sized density on a phone. |
| 2 | **FAA flight-deck alerting colours** (14 CFR 25.1322) | Colour has one fixed meaning: red = warning only, amber = caution, green = normal. Use red, amber and yellow for anything else only with a real need. Never colour alone: also shape, position, word. | Using red or amber for decoration or counts. |
| 3 | **B612 typeface** (Airbus with ENAC, Univ. Toulouse III and Intactile DESIGN) | A font family "designed and tested to be used on aircraft cockpit screens" for legibility under stress. Open licence. | It has no Hebrew; needs a Hebrew pair. |
| 4 | **Bloomberg Terminal** | "We're hiding complexity." Evolve in small steps and keep habits. Run old and new side by side so users opt in. | Shipping a big-bang redesign onto Dave's daily tool. Ship v2 next to v11 with a switch. |
| 5 | **Stephen Few, dashboards** | One screen, read at a glance: overview → exceptions → detail. No decoration. The only colour on a grey screen is the problem. Always show targets (bullet graphs, sparklines). | Gauges, glows, chart wallpaper. |
| 6 | **Apple Live Activities** | Focus on what is needed at a glance. Update only when content changes. One activity that rotates events. Tap opens the exact place. Limit it to one control. Heavy, large type. | Multiple alerts for the same update. |
| 7 | **Linear** (Method + Priority inbox + Agent guidelines) | "Prioritize enablers and blockers", "Scope projects down", "Generate momentum". Priority inbox "separates what needs your attention from what can wait". Agents show their state. | Linear's own look (it is the most copied SaaS look). |
| 8 | **Things 3** | Today with a calm "This Evening" split on one screen. Headings group work. Lots of space, restrained colour, haptics as reward. Deadlines kept apart from start dates. | Its soft rounded cards (3SDS forbids 10–14px cards). |
| 9 | **Superhuman** | Speed is the brand (50–100 ms). Optimistic UI with undo instead of spinners. Split streams. Focus moves to the next item after an action. | Keyboard-only thinking on a phone. |
| 10 | **Raycast** | Enter = primary action. One secondary action panel. Every row shows its shortcut. Show the interface at once and load in the background. Small HUD confirmations ("Copied"). | A command bar as the only way in for a non-technical user. |
| 11 | **GitHub Copilot mission control** | One view: assign, steer, track; logs next to overview and changes. Works on mobile. | Developer jargon (PRs, diffs) on Dave's screens. |
| 12 | **incident.io timeline curation** | Auto-built timeline; pin key moments; hide noise; add notes. Comments stay out of the report. | Showing every run (110 of 137 watcher runs did nothing, audit). |
| 13 | **The Browser Company (Dia)** | "Every product has a novelty budget." Keep basics familiar; spend novelty on one place. "A single obvious way to accomplish any task." | Being novel everywhere (Arc's lesson). |
| 14 | **Waymo rider experience** | "A fine line between providing the user with just the right amount of information versus being intrusive." Ambient info to glance at, and you interrupt only when needed. Replace the human cues that are missing. | Over-explaining every move. |
| 15 | **Ableton Push 2** | State shown as **light**: a lit button is live, a faded one is inactive, and colour ties a control to its track. One overview screen of the whole mix. | Hardware nostalgia for its own sake. |

**Proven patterns that cut scrolling and make the one next action obvious:**
- **One primary button per screen** (already a 3SDS rule: "One per view"). On Now it belongs to The One Move.
- **Exceptions only.** Running and healthy missions shrink to one line each. Only gates and blocked missions get space.
- **Top 3 hard cap** for anything that asks Dave to act. The rest is folded, with a count.
- **Bottom thumb bar on phone** (5 items max). **Two panes on desktop**: list left, detail right, no page changes.
- **Optimistic actions with undo** (Superhuman): tap Go and it is done; a 5-second undo HUD.
- **Drill-in, not scroll-down**: one line per item, tap to expand. This is Dave's stated dashboard preference.

---

## C. Brand and identity: 3 directions

**Ground rules for all three:**
- **Logo**: Dave's J8NIX drawing and the hourglass 8 **never change** (BRAND.md). Directions change only colourway, type, motion and layout.
- **Name**: keep **J8NIX** for v2. It is Dave's internal command centre. The product doc already found the name unsuitable for a public product. If v2 ever goes to market, naming restarts there, with a trademark search.
- **3SDS**: radius 3–6px, no 10–14px cards, one primary button per view, tap targets ≥44px, Heebo stays the studio Hebrew fallback.
- **Explicitly not:** Claude's cream or off-white ground, the terracotta/coral accent (`#da7756`), serif reading text, a warm "scholarly" feel. Not generic SaaS: no Inter, no purple-to-blue gradients, no glassy round cards, no sparkle icon for "AI". Not a dark green theme (Dave dislikes it).
- **State language is shared**, so whichever direction wins, data and rules don't change: **Running · Needs you · Blocked · Done**, plus **Paused**. Each state always has a word and a shape, not only a colour (FAA rule).

### Direction 1: "Magenta Line" (flight deck)

- **Concept:** J8 flies; Dave is the Flight Director. On real flight decks, **magenta** is the planned route the autopilot follows. Here it is the planned route from today to the goal. Gates are go/no-go polls.
- **Mood:** Calm daylight cockpit. Precise, quiet, nothing extra. Confidence through restraint.
- **Colour system (light, "runway concrete"):**
  | Role | Colour | Meaning |
  |---|---|---|
  | Ground | `#E8EAEC` cool concrete, panels `#F6F7F8` | Not cream: cool, neutral |
  | Ink | `#0B0F14` | Text, structure |
  | Route / plan | Magenta `#C2188B` | The planned path to the goal; J8's intent |
  | Running | Cyan `#0090B0` + a moving tick | J8 working (advisory, never red or green) |
  | Needs you | Amber `#E89A00` + a diamond shape | Caution: a gate waits |
  | Blocked | Red `#D6232A` + a square shape | Warning; the only red on screen |
  | Done | Green `#1F8F3A` + a check | Normal, closed |
  | Dark mode | Ground `#0E1216` (neutral graphite, no green tint) | Same hues, lifted inks |
- **Type:** **B612** for headings and labels (cockpit-tested legibility) + **B612 Mono** for numbers and times. Hebrew: **IBM Plex Sans Hebrew**, with Heebo as fallback.
- **Motion:** Almost none. State changes snap (120 ms). One "master caution" amber blink when a gate opens, then still. A press = a firm 80 ms press-down. Nothing loops except the running tick.
- **Signature element:** **The magenta line**: one horizontal route across the top of Now, from today to the goal date. A small aircraft glyph (the hourglass 8 on its side) marks where we are. A ghost marks where we should be. The gap between them is the pace.
- **Home (one screen):** At the top, the magenta line with "₪X of ₪100,000 · 6 days behind pace". Under it, **"Your call"**: one go/no-go poll card (the One Move or the top gate) with its evidence in 2 lines and two big buttons, Go and No-go. Then **"Consoles"**: up to 5 missions, one line each, with the state shape and a short status ("Tests 312/564", "Waits for Mac"). Foot: "Next run 14:00 · Stop all" (the stop switch, always visible).

### Direction 2: "Lit Keys" (instrument console)

- **Concept:** J8NIX is an instrument Dave *plays* rarely and *hears* always. Like Push 2, state is light: **a key is lit when it is Dave's to press**, faded when it isn't. Missions are channels on a mixer, and J8 runs them.
- **Mood:** Studio hardware at night: tactile, focused, a little warm. Feels like a tool made for him, not an app.
- **Colour system (dark graphite, neutral, no green tint):**
  | Role | Colour | Meaning |
  |---|---|---|
  | Body | Graphite `#141517`, keys `#1E2023`, lines `#2C2F33` | The instrument |
  | Ink | `#F2F2EF` | Text |
  | Running | Lit white `#FFFFFF` key glow, slow breathing | J8 playing this channel |
  | Needs you | Lit amber `#FFB020` key | Press me |
  | Blocked | Red `#FF3B30` key, steady, with a "!" | Stopped |
  | Done | Key goes **dark**, plus a small engraved check | Finished, filed away, quiet |
  | Money booked | 3S shamrock green `#8BE36A`, small dot only | The one green: cash in (studio dot) |
  | Light mode | Aluminium `#D9DADC` body, same lit-key logic | For daylight |
- **Type:** **Archivo** (width axis: condensed for key labels, normal for text) + **Martian Mono** for counters. Hebrew: **Rubik**, with Heebo as fallback.
- **Motion:** Light, not movement. Keys fade in and out (200 ms). Running channels "breathe" (4 s cycle, very low contrast). Gates light up with a soft rise. Haptic tick on press. Everything off under reduced motion.
- **Signature element:** **The hourglass key**: the 8 drawn as a key whose lower bulb fills with light as the mission progresses. On Now, the top-left hourglass shows the month: how much of the ₪ target has "poured" through.
- **Home (one screen):** At the top, the large hourglass key with "₪X / ₪100,000 · behind by ₪Y". Below, a **row of up to 3 lit amber keys**: Dave's decisions, each with a 3-word label and the minutes needed. One tap opens the gate card. Then a **mixer strip** of up to 5 missions: thin vertical faders that fill with progress, white breathing when running, dark when done. Foot: one long **Stop** key, red outline.

### Direction 3: "Pit Wall" (race engineer)

- **Concept:** J8 is the race engineer on the pit wall; Dave drives. The engineer watches all the telemetry and gives **one short radio call** at the right time: "Box now", "Push", "Hold position". Goal-driven by nature: a race is all about **delta**, ahead of or behind target pace. Colours follow the race flags drivers already know.
- **Mood:** Fast, decisive, competitive, high contrast. Energy without noise. It suits "beat every goal".
- **Colour system (light, "paddock white"):**
  | Role | Colour | Meaning (from the race flags) |
  |---|---|---|
  | Ground | White `#FFFFFF`, track grey `#EEEFF1` | Clean timing screen |
  | Ink | Carbon `#111111` | Text |
  | Running | Green-flag `#00A651`, flag stripe only (never a big fill) | Track clear, J8 racing |
  | Needs you | Yellow-flag `#FFD400` on carbon text | Danger ahead: slow down, decide |
  | Blocked | Red-flag `#E10600` | Session stopped |
  | Done | **Chequered** pattern (black and white) | Finished |
  | Let it pass | Blue-flag `#0067C6` | Low-value item J8 suggests skipping or killing |
  | Delta ahead / behind | Carbon on lime `#C6F000` / carbon on orange `#FF6A00` | Pace vs target |
- **Type:** **Big Shoulders Display** (a condensed signage face, used for calls and numbers) + **Red Hat Mono** for timing figures. Hebrew: **Secular One** for display, Heebo for text.
- **Motion:** Quick and directional. New info slides in from the right (160 ms, like a timing tower). The radio call types in once. A flag change wipes across. A short chequered sweep when a mission ends.
- **Signature element:** **The delta and the radio line**: a big signed number (e.g. **−₪18,400**) showing how far behind pace we are, and under it one radio call from J8 in quotes: "Send the 6 council follow-ups now: ₪ at stake, 5 min."
- **Home (one screen):** Top: the **delta** (huge), with "₪X of ₪100,000 · day 9 of 30" in small mono. Under it, the **radio line** with one button ("Do it"). Then a **timing tower**: up to 5 missions, ranked by value, each a row with its flag stripe, name, last lap ("sent 6 · 1 reply") and gap. Gates show as yellow rows at the top of the tower. Foot: "Red flag" (stop all).

> Note on Direction 3: the green-flag colour is used only as a thin stripe, never as a theme ground (Dave dislikes green-toned themes).

### How the three compare

| | Magenta Line | Lit Keys | Pit Wall |
|---|---|---|---|
| Feels | calm, precise, safe | tactile, personal, focused | fast, competitive, driven |
| Ground | light concrete | dark graphite (light option) | white |
| Best at | trust and supervision | "only what's yours is lit" | goal pressure and pace |
| Risk | can feel cold | dark UI on a sunny phone; music-gear cliché | can feel loud; flags need learning for non-fans |
| Novelty spent on | the route line | the hourglass key | the delta and radio line |

---

## D. Synthesis: the J8NIX v2 concept

### D1. The core loop: Missions

```
SET  →  PLAN  →  RUN  →  VERIFY  →  GATE?  →  REPORT  →  LEARN
 ^                                                          |
 └──────────────── next mission chosen by pace ─────────────┘
```

1. **Set.** Dave (in Talk, one sentence or voice) **or J8 itself** (when the pace line is behind) creates a mission: *goal · number · date · why*. Example: "First paid council pilot · 1 signed · 31 Dec".
2. **Plan.** J8 writes 3–7 steps. Each step is marked reversible or irreversible and lists its gates in advance. The plan shows as an Intent Preview and **auto-starts after the hold window** unless Dave edits it.
3. **Run.** Scheduled runs (hourly at most), the Mac arm and on-demand runs pick the **next step of the highest-value mission** (`j8_rank`: ₪ × chance ÷ days). A run that finds nothing exits at zero cost.
4. **Verify.** Every step ends with an independent check (the CLAUDE.md verifier gate) and **evidence**: link, count, test output or screenshot. No evidence = not done. "Did nothing" = failed, and is shown as such.
5. **Gate (only if needed).** J8 stops only at gates on the list in A2. A gate card shows: what, why, evidence, J8's recommendation, and Go / No-go / Edit. LinkedIn = Copy · Open · Sent.
6. **Report.** A mission ends with the TH-style report: what was done (with proof), what came back, **the one thing left for Dave**. The night "Day in review" rolls up all missions in 3 lines.
7. **Learn.** "What slowed us down" (max 3) and one rule change J8 applies from now on. It is stored in the short run card, not in a long rule pack.

**Mentorship layer:** The One Move each morning, silence by day, Day in review at night, pace line always. When a mission stalls for 3 runs, J8 proposes a re-plan or a kill.

### D2. The 5 screens (phone first; desktop = same screens in two panes)

| # | Screen | What's on it | Replaces today's |
|---|---|---|---|
| 1 | **Now** | Pace line · The One Move (one primary button) · up to 3 gates · live strip of running missions · Stop all | Home, money home, "Your 10 minutes", Stats |
| 2 | **Missions** | Active missions, one line each (FOCUS: only the 2 engines + internal ops). Tap → **Mission detail**: plan, live step, evidence timeline, gates, autonomy dial, Pause · Steer · Stop and keep | Projects board, Dept, Project page, Processes |
| 3 | **Gates** | Every decision waiting, oldest money first: go/no-go cards, approved-template sends to kill within the hold window, LinkedIn Copy · Open · Sent, "Did they reply?" Won/Lost | Inbox/Draft, "People to message", By-hand list, Replies |
| 4 | **Proof** | Curated timeline of evidence across missions (what shipped, sent, replied, fixed). Filters by mission. Undo where possible; "can't undo" marked. Replay per mission | Runs log, schedule view, activity |
| 5 | **Talk** | One thread with J8 (Dispatch-style). Create a mission, steer, ask. Real answers with a state chip, never a canned line. Settings, voice and connections live behind the avatar here | Chat / J8 panel, Me, Control, Later |

Phone: bottom bar Now · Missions · Gates · Proof · Talk, with a badge only on Gates. Desktop: left rail plus list and detail panes. The Stop switch is reachable from every screen.

### D3. What to delete from today's app

| Delete | Why |
|---|---|
| 31-project board, stage XP lines, project pages | Missions replace them; projects become a tag on a mission |
| $1M scoreboard | Replaced by the ₪100,000 focus pace line (audit: goal 1,200× cash) |
| C-level units and pods (CRO, CMO, CTO…) as owners | One owner: J8; 3 of 9 pods failed, no sends (audit) |
| Canned "Got it" reply | 149 of 155 replies; replaced by a real state chip |
| Calendar, files, day, later, todo tables and views | Empty or overlapping (audit) |
| Stale schedule screen | Last updated 14 Nov; Proof shows real runs |
| Separate By-hand list, Replies block, "Your 10 minutes" | Merged into Gates and The One Move |
| Stats screen, Processes view, interview onboarding | Folded into Now (pace) and Talk (create a mission) |
| 74 old versioned files and 5 script layers (app, j11, v11, shell, alerts) | One clean v2 bundle; keep v11 live next to it until Dave switches (Bloomberg rule) |
| Instagram drafting debris | Frozen under FOCUS MODE |

**Keep:** `j8_approvals` (as gates), `j8_tasks` (as steps), `j8_runs`, `j8_rank`, `j8_control` (stop switch), `j8_messages`, reply tracking (`j8_hand_sent`, `j8_reply_mark`), the Mac sender arm, quiet hours and the Shabbat rules for alerts.

### D4. The 3 directions for Dave: Home on one screen

- **Magenta Line:** a magenta route from today to the goal with a "we are here" marker and pace gap. One go/no-go card below it, then up to 5 one-line mission "consoles", with Stop all in the footer. Calm, cool, precise.
- **Lit Keys:** a large hourglass that fills as cash comes in. Up to 3 lit amber keys for Dave's decisions. A mixer strip of mission faders that breathe white while running and go dark when done, with a red Stop key. Tactile, dark, personal.
- **Pit Wall:** a huge pace delta (e.g. −₪18,400), J8's one radio call with a "Do it" button, then a timing tower of missions with flag stripes, with Red flag in the footer. Fast, bold, competitive.

### D5. Next steps

1. **NEEDS YOUR EYES:** Dave picks one direction (or "the line from 1 + the delta from 3", etc.).
2. Design team builds **one Home mock** in that direction from real Supabase numbers (no demo data), phone and desktop, then reviews it against `DESIGN-RULES.md`.
3. Data team adds `j8_missions` and `j8_evidence` (additive) and turns the 2 FOCUS engines into the first 2 missions.
4. Build v2 next to v11 behind a switch. Ship only after the QA gate and Dave's OK.

---

## Sources (pages opened in this run)

**Agent products and patterns**
- OpenAI, Introducing Codex: https://openai.com/index/introducing-codex/
- OpenAI Help, Using Codex cloud: https://help.openai.com/en/articles/20001545-using-codex-cloud
- OpenAI, Introducing ChatGPT agent: https://openai.com/index/introducing-chatgpt-agent/
- WorkOS, Introducing Manus: https://workos.com/blog/introducing-manus-the-general-ai-agent
- Claude Code docs, Checkpointing: https://code.claude.com/docs/en/checkpointing
- Anthropic, Enabling Claude Code to work more autonomously: https://www.anthropic.com/news/enabling-claude-code-to-work-more-autonomously
- Claude Help, Schedule recurring tasks in Cowork: https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-claude-cowork.md
- Claude, Dispatch in Claude Cowork: https://claude.com/resources/tutorials/dispatch-in-claude-cowork
- GitHub changelog, Mission control for Copilot coding agent: https://github.blog/changelog/2025-10-28-a-mission-control-to-assign-steer-and-track-copilot-coding-agent-tasks/
- Cursor, Agents on web and mobile: https://cursor.com/blog/agent-web
- Devin docs, Session Insights: https://docs.devin.ai/product-guides/session-insights
- Replit, Introducing Agent 3: https://replit.com/blog/introducing-agent-3-our-most-autonomous-agent-yet
- Lindy, Human-in-the-loop automation: https://www.lindy.ai/blog/human-in-the-loop-automation
- DEV, Factory AI Droids review (2026): https://dev.to/pickuma/factory-ai-droids-review-how-far-autonomous-coding-agents-have-come-in-2026-4m00
- Knight First Amendment Institute, Levels of Autonomy for AI Agents: https://knightcolumbia.org/content/levels-of-autonomy-for-ai-agents-1
- Smashing Magazine, Designing for agentic AI (Feb 2026): https://smashingmagazine.com/2026/02/designing-agentic-ai-practical-ux-patterns/
- Linear, Agent Interaction Guidelines: https://linear.app/developers/aig.md
- WHOOP, Behind the development of WHOOP Coach: https://www.whoop.com/us/en/thelocker/behind-the-development-of-whoop-coach/
- WHOOP, New AI guidance: https://www.whoop.com/us/en/thelocker/new-ai-guidance-from-whoop/

**UX and layout**
- Wikipedia, Flight controller: https://en.wikipedia.org/wiki/Flight_controller
- US DOT HFCC, FAA general guidance (alerting colours): https://hfcc.dot.gov/publications/docs/GeneralGuidance/zz_FAA_GeneralGuidanceDoc_Chapter_04_Section_01.html
- B612 font (GitHub): https://github.com/greebl3/b612
- Bloomberg, How Terminal UX designers conceal complexity: https://www.bloomberg.com/company/stories/how-bloomberg-terminal-ux-designers-conceal-complexity
- Stephen Few, Why most dashboards fail (PDF): https://blogs.ischool.berkeley.edu/i247s13/files/2013/02/WhyMostDashboardsFail.pdf
- Apple HIG, Live Activities: https://developer.apple.com/design/human-interface-guidelines/live-activities.md
- Linear, The Linear Method: https://linear.app/method
- Linear changelog, Priority inbox (Sep 2026): https://linear.app/changelog/2026-09-03-priority-inbox
- MacStories, Things 3 review: https://www.macstories.net/reviews/things-3-beauty-and-delight-in-a-task-manager/
- Blake Crosley, Superhuman design guide: https://blakecrosley.com/guides/design/superhuman
- Blake Crosley, Raycast design guide: https://blakecrosley.com/guides/design/raycast
- incident.io, Timeline curation: https://incident.io/blog/timeline-curation
- The Browser Company, The strategy behind Dia's design: https://browsercompany.substack.com/p/the-strategy-behind-dias-design
- Google Design, Waymo design (Ryan Powell): https://design.google/library/waymo-design-self-driving-car-ui-ryan-powell
- CDM, Ableton Push 2 hands-on: https://cdm.link/ableton-push-2-hands-on-test/

**Brand**
- rar.design, Claude interface design analysis (what to avoid): https://rar.design/posts/claude-interface-design-philosophy
- Formula 1, Beginner's guide to F1 flags: https://formula1.com/en/latest/article/the-beginners-guide-to-formula-1-flags.T5DqOqbWI6S4Va8Y5yMld

**Internal**
- `ops/brain/DESIGN-RULES.md`, `ops/brain/J8NIX-AUDIT-1119.md`, `ops/brain/J8NIX-PRODUCT.md`, `ops/brain/brandos/3SDS-LIVE.md`, `assets/brand-v3/j8nix/BRAND.md`, `/j8/index.html` (PWA 11.8.0 notes)
