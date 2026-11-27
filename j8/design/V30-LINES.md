# J8NIX Lines (3.0.3 preview, 27 Nov 2026)

> Dave, 27 Nov: "still overly complex … organisation is difficult to make sense of … navigate between projects at ease, and control each project process and workflow in its own timeline progress." Answers to the 2 questions in that chat: **preview first**, and the **home screen is all projects at a glance**.
> Preview: `3shamrocks.com/j8/v3/` (noindex, not linked from the live app, same sign-in and data as /j8/). The live app at /j8/ is unchanged. **NEEDS YOUR EYES** before anything replaces /j8/.

## The one idea

**Every project is a line. The AI workers move each line forward. Your decisions are the gates where a line waits.**

Today J8NIX has about 10 spaces: Today, Outbox, Income, Results, Chat, Workers, Settings, Timeline, Status and Your requests. Each one cuts across every project in its own way, so to understand one project you have to visit all of them. Lines turns this around. There are **two levels**, both organised by project:

1. **Home is the map.** Each active project is one coloured line on one time scale: 2 weeks back and 1 week ahead on a phone, 3 weeks back and 1 week ahead on a computer, with a black Today line. On each line:
   - a ring = items sent that day (bigger ring = more items);
   - a dot above = a reply (hollow = "no thanks");
   - a diamond = a step (filled = done, hollow = coming up);
   - a red triangle below the line = a late step;
   - a dotted line = what is planned ahead;
   - a **black square with a number at Today = the gate**, meaning things wait for you.

   Lines with a gate sort to the top, then late lines. The headline says it in one sentence: "24 things wait for you in 5 projects". Parked and finished projects fold under "Resting lines".
2. **Tap a line to get that project's own space.** It holds:
   - its status (glyph + word);
   - Now and Next;
   - **How this line runs:** the project's process as six stations on its line: Drafted → Your turn (drafts and steps waiting for you) → Going out → Sent → Replied → Deal, each with a real count. Tap a station to see what is in it.
   - **At the gate:** every item waiting for you, one line each. Tap to read, then Go / Change / Stop (Stop needs 2 taps), with Undo on every action. Your steps get Done (2 taps).
   - **This line over time:** a vertical line in the project's colour, with the plan ahead, Today, then the earlier days. A run of 3 or more days with nothing in them collapses into "Quiet 5 days". Worker runs are listed only when one failed.
   - **Workers on this line:** what each agent did for this project in the last 7 days.

Moving between projects: the ‹ › arrows (always on screen), a swipe on a phone, ← → on a keyboard (mirrored in Hebrew), and **Projects** (or `/` or ⌘K), which opens a jump list you filter by typing.

## What makes it different (and why)

- **Organised by project, not by function.** Overview first, then zoom, then details on demand (Shneiderman). Basecamp's Lineup puts every project on one timeline with a Today line; Linear gives each project its own overview page. Sources below.
- **The gate is a real mark on the line.** It shows exactly where an agent stopped for you and how many items wait, and you clear it there. None of the tools studied draws the human decision as a point on the project's own timeline. This is the "Waiting on Dave" marker from research track 1.
- **Each project's process is visible as stations.** It is easy to see where a line jams: many items at Your OK means you are the bottleneck; many Sent with no Replied means the messaging is not landing.
- **Status never relies on colour.** Colour means which project. Status is a glyph plus a word, in ink: ■ Waits for you, ▶ Moving, ○ Quiet, ○ Waiting on others, ▲ Late (in red), ✓ Done, ‖ Parked or Hidden. This follows Apple's colour guidance, Things' mostly neutral interface and Google Calendar's one colour per calendar.
- **Speed.** It draws the saved copy first, then refreshes in the background. There is no loader when a saved copy exists (NN/g response-time limits). Long lists use `content-visibility`.

## Design system

- **Paper map:** page `#F5F6F9`, sheet `#FFFFFF`, ink `#0C1030`. No dark theme, no cream, no green theme, no capitals for labels, no monospace.
- **9 line colours,** one per active project (the 10th wraps); resting projects are grey, all checked for at least 3:1 against white as graphics: `#2357D9 #C05600 #7C3AED #0B7FA8 #A86F00 #C42C78 #56627A #138A72 #8A5A2E`. Each project name also sits next to its colour chip, so colour is never the only cue.
- **3SDS:** Bricolage Grotesque 800 for names and numbers, Instrument Sans for text, Heebo first in Hebrew. Radius 3 px for controls and 6 px for panels. Tap targets are at least 44 px.
- **Hebrew:** the time axis is mirrored (the past is on the right). **NEEDS YOUR EYES:** sources disagree on mirroring a time axis (Apple: mirror anything that shows order; Wikimedia: don't mirror time bars). Check that it reads naturally to you.

## Not in this preview yet (next slices)

- Outcomes on sent items (Replied / Call / Won), Pause sending, routine switches, Chat and Settings. Until then the live app does these; the preview banner links to it.
- **Learning that you can see:** "What I learned this week" rules, each with the edits or kills it came from, which you approve or switch off. Graduated autonomy per line ("12 approved with no edits: let it send alone?"). These need the kill-reason data in `design/sql/r1125_02_kill_reasons_lanes.sql`, which is not applied yet. Following the trust research, nothing will be labelled "learned" until it is real.
- **Scale:** an IndexedDB cache with delta sync by `updated_at`, and pre-aggregated per-line numbers in Postgres (research track 4), instead of loading whole tables.

## Research (27 Nov 2026, 4 parallel tracks; every link was opened)

- Portfolio overview and per-project timelines:
  - https://basecamp.com/features/lineup
  - https://updates.37signals.com/post/new-in-basecamp-time-travel-in-the-lineup-24-hour-clock-and-more
  - https://basecamp.com/shapeup/3.4-chapter-12
  - https://linear.app/docs/initiative-and-project-updates
  - https://linear.app/changelog/2024-05-02-the-next-generation-of-linear-projects
  - https://help.asana.com/hc/en-us/articles/14246229345947-Project-status-updates-and-reporting
  - https://culturedcode.com/things/features/
  - https://webspace.science.uu.nl/~telea001/uploads/VACourse/Shneiderman96.pdf
  - https://www.nngroup.com/articles/mobile-tables/
  - https://www.nngroup.com/articles/horizontal-scrolling/
- Agent control and visible learning:
  - https://zapier.com/blog/how-much-should-ai-decide-without-asking/
  - https://smashingmagazine.com/2026/02/designing-agentic-ai-practical-ux-patterns/
  - https://developer.apple.com/design/human-interface-guidelines/machine-learning.md
  - https://www.microsoft.com/en-us/research/wp-content/uploads/2019/01/Guidelines-for-Human-AI-Interaction-camera-ready.pdf
  - https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-review-activity
  - https://docs.devin.ai/product-guides/knowledge
  - https://www.anthropic.com/research/measuring-agent-autonomy
  - https://pair.withgoogle.com/chapter/feedback-controls/
  - https://nngroup.com/articles/explainable-ai/
- Colour, wayfinding, RTL:
  - https://data.europa.eu/apps/data-visualisation-guide/colour-for-categories
  - https://thenode.biologists.com/data-visualization-with-flying-colors/research/
  - https://carbondesignsystem.com/data-visualization/color-palettes/
  - https://developer.apple.com/design/human-interface-guidelines/color.md
  - https://resources.arc.net/hc/en-us/articles/19228064149143
  - https://developer.apple.com/design/human-interface-guidelines/wallet.md
  - https://learn.microsoft.com/en-ca/windows/apps/design/controls/semantic-zoom
  - https://developer.apple.com/design/human-interface-guidelines/right-to-left.md
  - https://doc.wikimedia.org/codex/main/style-guide/bidirectionality.html
- Scale and speed:
  - https://github.com/Aslam97/reverse-linear-sync-engine
  - https://supabase.com/docs/guides/realtime/benchmarks
  - https://supabase.com/docs/guides/database/postgres/row-level-security-performance
  - https://use-the-index-luke.com/no-offset
  - https://web.dev/articles/content-visibility
  - https://web.dev/articles/optimize-long-tasks
  - https://www.nngroup.com/articles/response-times-3-important-limits/

## Guards kept from /j8/

- A draft the checker flags as hard needs 2 taps on Go, and the flag is shown.
- A design choice cannot be approved here; it links to J8NIX to pick an option.
- Stop and Done always need 2 taps; every action has Undo.

## Build

- **Files:** `j8/v3/index.html`, `lines.js`, `lines.css`. Data and writes go through `window.J8` (`../j8-data.js`), so the sign-in, row-level security and database guards are the same as /j8/.
- **Revert:** delete `j8/v3/` and this note. Nothing in /j8/ loads from them.
