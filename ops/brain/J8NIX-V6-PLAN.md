# J8NIX v6.0.0 — "lead me" upgrade · PLAN (14 Nov 2026)

Dave, 14 Nov 17:23: when many things wait, J8NIX must lead him through them in the right order. If many things wait on one
thing, that thing comes first. Clear hierarchy (unit → project → task) with instructions and links. Mentor him; better colours,
speed and QA, proven with real workflow numbers.

Scope rule: keep the v5.2.0 luminous look, the four screens (Chat · Next · List · Stats) and the PCOL product colours.
Change only what the request needs. Nothing is sent to anyone. Zero spend.

---------------------------------------------------------------------------------------------------------------------
## 1. Data model (Supabase project otkvebgrdiayjnqrytrn) — additive only

Hierarchy (light): `j8_orgs` → `j8_units` (department, code CRO/CFO/Grants/CPO/CDO/CMO/CTO/COO) → `j8_projects` → `j8_tasks` (new).
Drafts (`j8_approvals`) hang under a project by `product`.

| change | how | why |
|---|---|---|
| `j8_projects.blocked_by text[] not null default '{}'` | ADD COLUMN IF NOT EXISTS | a project's next stage can wait on an item |
| `j8_approvals.blocked_by text[] not null default '{}'` | ADD COLUMN IF NOT EXISTS | a draft can wait on an item (e.g. a sign-in) |
| new `j8_tasks` | CREATE TABLE IF NOT EXISTS | Dave's and the team's concrete steps |
| `j8private.ts(text)` | safe text→timestamptz (null on junk) | `created`/`decided_at` are text in mixed formats |
| `j8private.task_stamp()` trigger | BEFORE INSERT/UPDATE on j8_tasks | sets `done_at`, `unlocked_on_done` when a task is done; clears them on untick |
| `public.j8_items(org)` | SQL fn, SECURITY INVOKER | one row per item (task/approval/project) with open flag, blocked_by, timestamps |
| `public.j8_unlocks(org)` | SQL fn, SECURITY INVOKER, recursive + cycle-safe | per open item: transitive dependents (`unlocks`, `unlock_ids`) and open blockers |
| `public.j8_rank(org)` | SQL fn, SECURITY INVOKER | the ranked list (formula §2) for the arms |
| realtime | `alter publication supabase_realtime add table j8_tasks` | live app updates |

`j8_tasks` columns: `org_id uuid` (FK j8_orgs, cascade), `id text` (`t-…`), `project_id text`, `unit_id uuid` (FK j8_units),
`parent_id text` (optional step under a task), `title text` (one short phrase), `action text` (exact "do this"), `why text`,
`link text`, `link_text text`, `minutes int`, `owner text` ('dave' or a unit code), `status text` open|done|dropped,
`sev text` r|o|g, `due text`, `blocked_by text[]`, `created_at timestamptz default now()`, `done_at timestamptz`,
`done_by uuid`, `unlocked_on_done int`, `source text`, `by text`, `extra jsonb`, `version int`, `updated_at timestamptz`.
PK (org_id, id). Triggers: `j8private.bump()` (same as every j8 table) + `task_stamp`.

RLS on `j8_tasks` (same helpers as the other tables): read = `has_role(org_id,'viewer')`; insert = member; update = member.
No delete policy (tasks are never deleted; `status='dropped'`). Functions are SECURITY INVOKER, so a caller sees only
the rows RLS lets them see: no data can cross orgs through them.

Item ids share one namespace (`t-…` tasks, `p-…` projects, free-form approval ids; checked 14 Nov: no approval id starts
with `p-` or `t-`). `blocked_by` may name any of them.

Open = task `status='open'` · approval `status in (pending, approved, edited, queued)` · project not hidden and status not
in (done, killed). A done/killed/sent/dropped blocker stops blocking automatically: nobody has to clear `blocked_by`, and
keeping it is the history behind "blockers removed".

Push: no trigger is added or changed. `j8_messages_ack`, `j8_messages_push`, `j8_approvals_push`, `j8_runs_push`
(`j8private.push_on_change`) stay exactly as they are.

---------------------------------------------------------------------------------------------------------------------
## 2. Ranking formula (one definition: SQL `j8_rank` for the arms, `rankKey()` in app.js)

unlocks(X) = number of distinct OPEN items reachable from X along "X blocks Y" edges (transitive), X itself excluded.
Cycle-safe: the walk carries its path and never revisits a node; depth capped at 50.

Dave's queue = every open thing only Dave can do: his open tasks, draft batches waiting for his Send, his project moves
(`you` line), team questions to him, held sends that need him (a held group disappears when a Dave task already blocks
all of its drafts — the task is the one action).

Sort key, in order:
1. **actionable** — a task or project with an open blocker sinks below everything actionable (Dave can't do it yet).
   A pending draft is never demoted: deciding it is not blocked, only its sending.
2. **unlocks**, high first (for a batch or group: distinct open items blocked by any of its members, members excluded).
3. **money** — on the revenue path: its project is at stage ≥ 4 (Validate, Monetize, Paying) or sits in Revenue (CRO)
   or Finance (CFO); money requests always count.
4. **deadline**, soonest first — 🔴 = now, a real due date from the data, 🟠 = end of today; none = last.
5. **age**, oldest first.

WHY line (mentor, one line, first that applies): "18 wait on this: 17 emails · SH✡MER Command" → "Closest to money: moves
<project> to <next stage>" → "Due <date>" → "Waiting <N> days".

---------------------------------------------------------------------------------------------------------------------
## 3. Screens (390 px wireframes)

### Chat (main screen) — top panel
```
┌ gold band: 8 · J8NIX · your business manager · Sending on ───────────┐
│ Since you last looked: 3 runs done · 2 new drafts.                     │
│ ┌ DO THIS FIRST ─────────────────────── ◆ unlocks 18 · ~10 min ┐      │
│ │ Connect studio email sending                                  │      │
│ │ 18 wait on this: 17 emails · SH✡MER Command                   │      │
│ │ [ Open connectors ↗ ]                 [Done]  [Later]          │      │
│ └───────────────────────────────────────────────────────────────┘      │
│ Then                                                                   │
│ 2 ● Sign in to Meta Business Suite          ◆16 ›                     │
│ 3 ● Decide 17 founder notes                      ›                     │
│ 4 ● Allow CV access on the Mac              ◆6  ›                     │
│ All 21 in order →                                                      │
├────────────────────────────────────────────────────────────────────────┤
│ (chat history, drafts as cards, composer — unchanged)                  │
```
### Next — the full lead
```
 Do this first      (large card: action steps, link, minutes, unlocks N + names, Done · Later)
 Then               3 rows, tap = open with action + link + Done
 Everything else (N) — collapsed by unit
  ▸ Revenue · 6 wait on you
      ▸ 3S design services · Validate → Monetize     (tap → its items)
  ▸ Marketing · 3
```
### List — hierarchy (new default) + the old board
```
 [ By unit | By type ]
 Revenue                                    6 wait on you
 ┌ ● 3S design services        Validate → Monetize   DM ┐
 │ ███████░░░░░ 9 of 31 done                            │
 └──────────────────────────────────────────────────────┘
   tap → Next stage: Monetize: first paid project …
         Open:  ☐ Decide 17 founder notes        (Dave)
                ☐ Fix landing hero copy          (Design team)  waits on: …
         Drafts: 17 wait for your Send →
         Links:  Brand Sprint page ↗
         Done (2) ☑ … (tap to untick)
         [ Comment to the team…           ➤ ]
```
"By type" = the v5.2 board (Money · Approve · Projects · Team · Later), unchanged.

### Stats — new top strip "How the flow improved" (this week vs last week)
```
 Cleared by you   12  (last week 3)     Median wait  9 h (last week 31 h)     Blockers removed  1 (collecting data)
```
Real timestamps only: drafts `created`→`decided_at`; tasks `created_at`→`done_at`. Blockers removed = distinct items named in
some `blocked_by` that were done in the window. No data → "collecting data", never a made-up number.

---------------------------------------------------------------------------------------------------------------------
## 4. Colour system (keeps the v5.2.0 identity)

| meaning | token | use |
|---|---|---|
| 🔴 needs you now | `--r #E0243A` / text `--r-t #B3122A` on `--r-w` | ONLY severity r (chips, dots, the red edge) |
| 🟠 needs you today / waiting on you | `--o #F06400` / text `--o-t #A64400` on `--o-w` | waiting pills, 🟠 chips |
| team at work | `--blue #1F5BFF` (in progress), violet `--vi #5B3FD0` on `--vi-w #EFEBFF` (team blocked/stuck) | was red; now calm |
| done | `--ok #12A26A` / `--ok-t` | ONLY done/sent |
| the one thing to do | J8 gold glow `--gold` ring + ink-on-gold "◆ unlocks N" badge | Do-this-first card |
| products | PCOL markers | identity, unchanged |

Red is removed from: paused sending, failed runs, error text, the last quick-reply chip, team-stuck pills (→ amber text or
violet). Every text pair ≥ 4.5:1 (measured in QA). Light, high-contrast surfaces for sunlight. No dark or green themes.

---------------------------------------------------------------------------------------------------------------------
## 5. Performance

- Repeat visits paint from the phone's cached copy at once (session + cache present → app shows immediately, then refreshes).
- Approvals: open drafts load in full; sent/killed load only the light columns the app reads (no bodies) — the largest table.
- Google Fonts stylesheet no longer blocks the first paint.
- Service worker cache `j8nix-v6.0.0`, every asset `?v=6.0.0`.
- Measured in QA: time to the Do-this-first card, before (5.2.0) and after, with CPU ×4 and a slow-network delay.

---------------------------------------------------------------------------------------------------------------------
## 6. Arms keep it live (ops/brain/J8NIX-DATA.md + BRAIN.md §−6.L)

SQL for: create a Dave/team task · set `blocked_by` (append, no duplicates) · clear a wrong dependency (`array_remove`) ·
mark a task done/undone · read `j8_rank(:org)`. Rule: never clear `blocked_by` because a blocker is done.

---------------------------------------------------------------------------------------------------------------------
## 7. Seeds (real org, only true dependencies; sources cited in the report)

Dave tasks: connect studio email sending · sign in to Meta Business Suite · create the SH✡MER testers Google Group ·
read the SH✡MER join page · allow CV access on the Mac. Edges only where the row itself states the block.
Anything unsure is left out and listed.

---------------------------------------------------------------------------------------------------------------------
## 8. Migration, rollback, revert

Migration `j8_v6_dependencies` — ADD COLUMN IF NOT EXISTS / CREATE … IF NOT EXISTS / CREATE OR REPLACE only, no DROP.
DB rollback = nothing to drop: v5.2.0 ignores the new column/table/functions. To undo the seeds only:
`update j8_approvals set blocked_by='{}' where org_id=:org; update j8_projects set blocked_by='{}' where org_id=:org;
update j8_tasks set status='dropped' where org_id=:org and source='v6-seed';`

App revert (one line, from the repo root). While 6.0 was built another session shipped 5.3.0 (Control in the settings sheet)
on top of 5.2.0; 6.0.0 is merged on top of 5.3.0. Kept copies: `j8/app-5.3.0.js` + `j8/app-5.3.0.css` (what was live right
before 6.0, recommended revert) and `j8/app-5.2.0.js` + `j8/app-5.2.0.css` (as asked; reverting to them also drops Control).
```
sed -i 's/app\.css?v=6\.0\.1b/app-5.3.0.css/;s/app\.js?v=6\.0\.1b/app-5.3.0.js/' j8/index.html && sed -i "s/j8nix-v6\.0\.1b'/j8nix-v6.0.1b-revert'/" j8/sw.js
```
(j8-data.js and shell.js stay backward compatible with the 5.3.0 and 5.2.0 screens: they only add the tasks collection,
load sent/killed drafts without bodies — templates always in full — and paint from the saved copy.)

## 9. QA

Playwright (preinstalled Chromium) at 390×844 and 1280×800, QA org data (`j8qa-org`) served to the real app files, plus
SQL fixtures in the QA org: chain A→B→C, cycle D↔E, done blocker F. Checks: axe-core 0 violations, no horizontal scroll,
no JS errors, Hebrew RTL, ranking parity SQL = JS. RLS: impersonated QA viewer sees 0 rows of the studio org through the
tables and the functions. Then one independent verifier agent.

## 10. 6.0.1 (fix round 1 after the independent verifier, 14 Nov)
- "Turn on studio email sending" now matches the decided path (ops/brain/EMAIL-SENDER.md §7): check Chrome's Gmail shows
  dave@3shamrocks.com, then Settings → Control → Email sending → On. The task closes itself when email_from_ok turns on
  (trigger j8_control_done_tasks; tasks carry extra.done_when).
- CV access: one instruction (System Settings path, Apple guide link) in the task and in the 4 drafts it blocks; Sensi.AI and
  Taboola go by hand on LinkedIn, so their edges were removed (unlocks 4).
- The Meta sign-in task was dropped: its 16 posts were killed by Dave; the Instagram project's own line asks for the logins.
- j8_rank now treats a project with a real "you" ask as Dave's, like the app. Team questions and held sends stay app-only.
- 16 decisions recorded by an arm got decided_at (from "Rejected by Dave 14 Nov 18:01"), so Stats counts them.
- App: one clock per ranking pass (stable 🔴 order); team-ask rows show only the "Do: …" phrase; the Done toast counts only
  items with no other open blocker; violet dot for blocked team tasks; red removed from failed-run dots and Control errors;
  phone Chat panel compacted (card + one "Then" line); version label 6.0.1.
- Task comments (Dave 14 Nov 18:17): every task has a "Comment on this task" box (Do this first on Next, the next 3, the tree's
  team tasks and Done items, the By-type board). The message carries task_id; a database trigger routes it to the task's project
  and unit and rejects a task id from another business. The existing "Got it" ack still answers; Dave's own messages still never
  push. Under the box only the team's latest reply shows (one line, tap for all). Cache string 6.0.1b (6.0.1 was already cached).
- Round 2 fixes (14 Nov evening): the 13 approved emails whose own notes need a postal address now wait on the postal-address
  task (it unlocks 16); a draft with any open blocker is never sent (hard rule in ARMS-CONTRACT.md §3b and J8NIX-DATA.md);
  the task-comment route trigger gives a non-member no hint whether a task id exists; the postal task opens the chat.

---------------------------------------------------------------------------------------------------------------------
# 6.1 · Comment on drafts + the Flow screen (Dave, 14 Nov 18:48) · PLAN

## 6.1-A Approval comments
- Every draft card gets **Comment** beside Send / Edit / Kill. A note never changes the draft's status.
  The note box also offers **Approve + note** ("approved, but shorten line 2") and **Kill + note**.
- Data: `j8_messages.approval_id text` (ADD COLUMN IF NOT EXISTS, insert grant on that column only). The route trigger
  (`j8private.message_task_route`, CREATE OR REPLACE) handles it like task_id: a non-member gets no hint; for a member the
  draft must exist in that business, `p` = the draft's project, `unit_id` = that project's unit.
- Under the box: the team's latest reply on that draft, one line, tap for all. Dave's own notes are never listed back.
- Arms (J8NIX-DATA.md): the inbox watcher reads approval_id, edits the draft when the note asks (pending → stays pending
  with the new text; Approve + note → applies exactly the asked change as edited_body, status 'edited'; unclear → back to
  pending + 🟠 question), replies with one 🔴/🟠/🟢 line and marks the message done. **Sender hard rule:** a draft with a note
  not yet marked done is never sent.
```
┌ Waiting · LinkedIn note · 3S design services ───────┐
│ Josh Rosenthal · Index Industries                    │
│ Hi Josh, saw the round…                              │
│ [ Send ] [ Edit ] [ Kill ] [ Comment ]               │
│ ┌ Note to the team (the draft stays as it is) ────┐  │
│ │ change line 2 to…                         ➤     │  │
│ └──────────────────────────────────────────────────┘  │
│ [ Approve + note ]  [ Kill + note ]                   │
│ 🟢 Done: line 2 shortened; it waits for your Send.  › │
└──────────────────────────────────────────────────────┘
```

## 6.1-B Flow (replaces the Stats tab; the old Stats lives on as "Numbers")
Tab label **Flow**, same place in the dock (hash #stats still works). Five views, one segmented bar:
**Map · Timeline · Insights · Teams · Numbers**. Filters under the bar (Map, Timeline, Insights):
unit (select) · owner (All / Me / Team / Outside) · Only blocked.

```
 Flow                                        $0 of $25k · 7 days to M1
 [Map][Timeline][Insights][Teams][Numbers]
 [All units ▾]  (All)(Me)(Team)(Outside)  [ ] Only blocked
 REVENUE
 ● 3S design services   ▮▮▮▮▯▯ Validate      DM
   next: 17 founder notes by hand · Sun 15 Nov
 ● Accessibility checker ▮▮▮▮▮▯ Launch       DM
   next: LinkedIn post · Mon 16 Nov 13:30
 PRODUCT
 ● LickPick              ▮▮▮▯▯▯ Beta         CMO
   next: 30 Keepers ep 9–10 · Sun 15 Nov
```
Stages, Dave's words over the 6 data stages: Idea (Concept) · Build · Beta (Staged) · Validate · Launch (Monetize) · Paying.
Lit = current; filled = passed. Holder chip: DM = Dave, a unit code = the team, Ext = outside (client, platform review).

```
 Timeline — next 4 weeks (Israel days), today ringed, scrolls sideways inside its strip only
 ┌Sa┐┌Su┐┌Mo┐┌Tu┐ …
 │14││15││16││17│
 │ ●││●●││●●││● │   ● gold milestone · ● amber yours · ● blue team · small "9 runs"
 └──┘└──┘└──┘└──┘
 Sun 15 Nov
  10:00  Prep page read (Tnufa)                 You    ›
  12:30  LinkedIn post · studio                 You    ›
  08:22  Weekly board (team run)                Team   ›
 Overdue: 9 drafts whose slot passed           ›
```
```
 Insights (one sentence each, tap through; "collecting data" when a number has no source yet)
  Waiting on you: 21 · first frees 16 (postal address)        ›
  Oldest wait: "Decide 25 posts" · 10 days                    ›
  No movement 7 days: R&K, WH33LZ, FaiRent                    ›
  This week: you cleared 19 (last week: collecting data)      ›
  Closest to first $: Accessibility checker (Launch) · next…  ›
```
```
 Teams
  Inbox watcher    every hour · last ok 17:26 · next 19:26
    now: "Done: council demo links checked…"
  Brain shift      12:13 / 18:13 · last ok · next 12:13 Sun
  Pods (run inside the shifts): CRO pod · last 09:30 ok — "17 founder notes ready…"
```
Sources (all real): projects (stage, next, milestone), tasks (due), drafts (due_at), j8_schedule (crons, next runs, last
status), j8_runs (latest per team), money summary, j8_rank (via the same rules in the app). Missing → "collecting data".

## 6.1-C Data model additions (additive)
- `j8_projects`: `milestone text`, `milestone_at text` (ISO date or datetime), `milestone_by text` (dave | team | external),
  `milestone_src text` (where the date came from).
- `j8_approvals`: `due_at text` — the slot the draft is meant to go out, parsed only from its own warn/context text; the
  weekday in the text must match the date or it is left empty.
- `j8_messages`: `approval_id text` (6.1-A).
Seeds only from real dates in rows or ops/brain/brain.json; everything else is listed as "couldn't date" in the report.

## 6.1-D Revert
App: same one-line sed as above with `?v=6.1.0` (`app-6.0.1.js` / `app-6.0.1.css` kept as the 6.0.1 copy).
```
sed -i 's/app\.css?v=6\.1\.0/app-6.0.1.css/;s/app\.js?v=6\.1\.0/app-6.0.1.js/' j8/index.html && sed -i "s/j8nix-v6\.1\.0'/j8nix-v6.1.0-revert'/" j8/sw.js
```
DB: nothing to drop; 6.0.1 ignores the new columns.

## 6.1-E Brand pass (Dave 14 Nov 18:57: "brighter, deeper brand identity, product brands everywhere")
- **J8NIX identity** from assets/brand-v3/j8nix/BRAND.md (built from Dave's logo files): Peach Gold #F2C194 band (light
  gradient #FCE8D5 → #F2C194), J8 Slate #586475 for the avatar tile, the toast and Dave's chip, Signal Blue #1563FF for
  actions and selected controls (replaces the near-black "on" state), airy base #F7F9FD, white cards. No near-black surfaces.
- **Optional dark mode** (Settings → Theme: Light · Dark · Auto; default Light): J8NIX platform navy #11283C / #16314A, never black.
- **Products**: colour (PCOL) and a real PNG badge (j8/brand/, resized from the repo's logo files, never redrawn; SH✡MER and
  Nature from their transparent originals, never boxed) on: Flow lanes (edge + tint + badge), project headers in the List tree
  (edge + tint + badge), draft cards (left stripe), every row marker (badge where one exists).
- **Urgency stays semantic and separate**: small badges/dots only (🔴 red = needs you now, 🟠 amber = today, violet = team,
  green = done). Brand colours never carry text and never sit in the urgency badge.
- Brand colour contrast (non-text use; text always uses the theme's ink):
| Brand colour | Hex | on light card #FFFFFF | on light base #F7F9FD | on dark card #16314A | Used as |
|---|---|---|---|---|---|
| SH✡MER gold | `#E0A828` | 2.14 | 2.03 | 6.23 | stripe / marker / lane edge only (never text) |
| SH✡MER navy | `#0C1B3A` | 17.02 | 16.15 | 1.27 | stripe / marker / lane edge only (never text) |
| SH✡MER Command orange | `#FC9918` | 2.16 | 2.05 | 6.17 | stripe / marker / lane edge only (never text) |
| Nature leaf | `#2F8540` | 4.62 | 4.38 | 2.89 | stripe / marker / lane edge only (never text) |
| LickPick volt | `#FFE600` | 1.27 | 1.20 | 10.54 | stripe / marker / lane edge only (never text) |
| LickPick hot | `#FF2E88` | 3.50 | 3.32 | 3.81 | stripe / marker / lane edge only (never text) |
| Studio purple | `#8239EA` | 5.64 | 5.35 | 2.37 | stripe / marker / lane edge only (never text) |
| Studio green | `#3DCC6E` | 2.09 | 1.98 | 6.40 | stripe / marker / lane edge only (never text) |
| Accessibility violet-2 | `#B07CFF` | 2.93 | 2.78 | 4.56 | stripe / marker / lane edge only (never text) |
| Trashure orange | `#FF6C00` | 2.84 | 2.69 | 4.70 | stripe / marker / lane edge only (never text) |
| Chore purple | `#6A21C4` | 7.99 | 7.58 | 1.67 | stripe / marker / lane edge only (never text) |
| Chore gold | `#F59E0B` | 2.15 | 2.04 | 6.22 | stripe / marker / lane edge only (never text) |
| FaiRent violet | `#6550FF` | 5.07 | 4.81 | 2.64 | stripe / marker / lane edge only (never text) |
| J8NIX peach | `#F2C194` | 1.64 | 1.55 | 8.16 | stripe / marker / lane edge only (never text) |
| J8NIX slate | `#586475` | 6.01 | 5.70 | 2.22 | stripe / marker / lane edge only (never text) |
- Projects without a brand file (left without a colour; they fall back to the colour stored on the project, or none):
  Instagram network (4 accounts, each with its own brand; badge = the Media Network logo), Director roles (jobs), VIBRANT
  (client), Vicky Zaguri (client), Milo (logo file only, no colour tokens), R&K, WH33LZ, J8NIX-hosted HealthTech page uses the
  studio brand. Chore Royale's badge comes from assets/studio/logos/chore-royale.png (the studio's transparent copy).

## 6.1.1 Round 3 fixes (14 Nov evening)
- Teams: next run worked out from the schedule (cron, Israel time) when the stored next run has passed; shown as date + time
  (e.g. "Sun 15 Nov 09:41"). Settings → schedule uses the same rule.
- Done projects (status done, e.g. Vicky) leave the Map lanes and every Insights line; the Map shows them in a folded "Done" group.
- Approve + note toast: "Approved. Held until the team applies your note." (Kill + note: "Killed. Nothing goes out; the team reads your note.")
- Teams cards compact on phones; the summary line drops raw links (open the row for an "open link"). Root cause of the tall
  cards: the summary used class .tl, which the Numbers milestone track also uses (height 92px); renamed .tsum.
- DB `j8_v6_1_1_note_one_target`: a message with both task_id and approval_id is rejected (23514). Tested in j8qa-org, rolled back.
- Scheduled tasks: all 8 J8NIX prompts now say J8NIX-DATA.md + ARMS-CONTRACT.md bind every run and their SQL replaces any SQL
  in the prompt (copied SQL removed from revenue desk and sender arm). BRAIN.md startup says the same.

### 6.1.1 Revert (to 6.1.0; `app-6.1.0.js` / `app-6.1.0.css` kept as the 6.1.0 copy)
```
sed -i 's/app\.css?v=6\.1\.1/app-6.1.0.css/;s/app\.js?v=6\.1\.1/app-6.1.0.js/' j8/index.html && sed -i "s/j8nix-v6\.1\.1'/j8nix-v6.1.1-revert'/" j8/sw.js
```
DB: the note check only refuses a row the app never writes; nothing to undo.


## 6.1.2 Hotfix (Dave 14 Nov 20:09: "approve section only has send, edit and kill, no comment")
- Why he didn't see Comment: the installed app was still running an older version. A phone app resumed from the
  background never reloads, and nothing told it a new version existed. Comment has been on every draft card since 6.1.0.
- Self-updating app: shell.js checks for a new version each time the app comes to the front (and every 30 min); when the
  new version takes over it reloads once, or, if Dave is typing, shows "New version of J8NIX · Tap to update".
  sw.js fetches the page itself with no-cache so the update is not held back by the browser cache.
- Draft actions on phones (≤420 px): Send · Edit / Kill · Comment as a 2×2 grid, 48 px targets, icon + label.
- Templates (Control): Comment next to Approve/Kill; the note carries approval_id = the template; team's latest reply under it.
- Control schedule rows: "Last run" read from the run log (j8_runs), same as Teams; the schedule snapshot only as fallback.
- Held / queued drafts show as a list of names (no actions), and Next points to the cards, so no 3-button surface is left.

### 6.1.2 Revert (to 6.1.1; `app-6.1.1.js` / `app-6.1.1.css` kept)
```
sed -i 's/app\.css?v=6\.1\.2/app-6.1.1.css/;s/app\.js?v=6\.1\.2/app-6.1.1.js/' j8/index.html && sed -i "s/j8nix-v6\.1\.2'/j8nix-v6.1.2-revert'/" j8/sw.js
```

---------------------------------------------------------------------------------------------------------------------
# 7.1 · The v7.1 design on live data (Dave 14 Nov 21:02: "Good") · PLAN

Source of truth: /mnt/user-data/outputs/j8nix-v7/DESIGN-v71.md (+ DESIGN.md, RESEARCH.md, AUDIT.md, prototype-v71/).
Decisions taken for Dave (delegated): amber = every "you do this" button · Talk = light orchid · Flow = one scroll led by
"What is stuck" · tabs Today / Studio / Flow / Talk · Kill stays on drafts · Dave's own comments fold to one line · light theme
is the default, dark stays in Settings with v7.1 hues · "Later" (with a when-sheet) and "Not needed".
Scope: presentation and words change; the data logic stays (rows(), graph/unlocks, needs()/rankCmp, mentor, markDone,
decide, task/draft notes with routing, Approve/Kill + note, Done untick, Control, push, auto-update). Real data only:
none of the prototype's sample content ships. Product brands stay on their logo tiles (PNG, j8/brand/).

## 7.1-A Screens → code → data
| Prototype screen | Code (j8/app.js 7.1.0) | Data |
|---|---|---|
| Shell: top bar (place tile + name, Back, Settings), 3 px place line, nav (4 tabs, hue icons, counts) | `index.html` `#top`, `#nav`; `renderTop()`, `renderNav()` | Today count = `needs().length`; Talk count = open team questions (`isAsk`) |
| 4-question brief (every screen) | `brief({crumbs,title,what,need,gain,prog})` | per screen, below |
| 01 Today, 02 row open, 03 after Done | `vToday()`, `goldCard()`, `rowItem()`, `abar()`, `doneBlock()` | `needs()` (ranked queue, unchanged) · minutes `minsOf` · unlocks `i.ul` · why `mentor(i)` · Done today = tasks `done_at` today + drafts `decided_at` today + `j8_later` done/not-needed rows today |
| Gold card facts Where / How / After | `facts(i)` | task `link_text`/link host, `action`, `extra.done_when`; project `you`, `you_link`; batch = "Here, in J8NIX" |
| Then 3 · Planned for later · Everything else by department · Done today | `vToday()` | `needs()[1..3]`; `j8_later` status later and `come_back_at` > now; rest grouped by `unitOf(project)`; Done as above, each with Undo |
| 12 Later sheet | `laterSheet(key)` → `deferItem(key,'later',when)` | NEW `j8_later` row (status later, `come_back_at`); the item leaves Today and comes back by itself at that time |
| Not needed | `notNeeded(key)` | task → `status='dropped'` (existing status = not needed) + `j8_later` row status not_needed (shown under Done, Undo reopens); draft batch → confirm, then Kill each draft; project move / team question / held send → `j8_later` row + a "Not needed: …" message to that project's team (routed by the existing trigger) |
| Mark done (outside link) / Not yet | `S.doing[key]`, `markDone(key)` (unchanged rules) | task → `status='done'`; others → `j8_later` status done for 24 h + "Done: …" message (as 6.0) |
| 04 Studio | `vStudio()` | `j8_units` departments with projects; "for you" = items of `needs()` in that unit; furthest stage = max `stage` |
| 05 Department | `vDept(unit)` | projects of the unit, sorted by need then stage; holder = `holderOf()` (6.1) |
| 06 Project | `vProj(pid)` | stage track (`stage`), next stage from `next`; "Your next step" = first `needs()` item of the project; team = open non-Dave tasks; drafts = pending batches; Done here = done tasks (Undo = untick) + decided drafts; project comment box (`inbox.send(p)`) |
| 07 / 08 Draft, all decided | `vDraft(batchId)` | pending drafts of the batch (fixed list at entry); Send = `approvals.approve`, Edit = `approvals.edit`, Kill = `approvals.kill`, Undo = `approvals.undo`; email-sending-off note from `j8_control.email_from_ok`; open blockers named |
| 09 Flow (one scroll) | `vFlow()` | What is stuck = `needs()[0]` when it frees ≥ 1; Money = `j8_money` summary; This week = `weekCounts()` / `flowWin()` (6.1); Every project = lanes (stage, holder); Coming up = `events()` (milestones, task due, draft `due_at`, M1) + "Slot passed, still open"; The team right now = `j8_schedule` + `j8_runs` (status word: Working / Waiting / Off / Problem); folded "Numbers and milestones" = the 6.1 Numbers view |
| 10 Talk | `vTalk()` + `J8C` | team questions = `isAsk(message)` (hero + answer box); Answers to your comments = messages with task_id / approval_id / project that carry a team line; Updates = the chat log (Dave's own text folded to one line); composer = `inbox.send('p-general')` |
| 11 Comment thread | `threadSheet(target)` | messages for that task_id / approval_id / project; Dave's notes folded; team lines in full; status "Sent to <team>, HH:MM" → "Answered by <team>, HH:MM"; drafts keep Approve + note / Kill + note |
| 13 All clear · 14 error · loading | `stateBox()` | empty `needs()`; `J8.status().error==='offline'` shows the saved copy at full contrast with its time |
| 15 Hebrew, Large text | Settings → Language (`j8-lang`, html `lang`/`dir`), Text size (`j8-size`, 1 / 1.125 / 1.25) | shell words translated; content keeps `dir=auto` + `<bdi>` |
| Settings | the existing sheet + Text size, Language, Help ("Show the tip again"), Theme (Light default, Dark, Auto) | Control, push, business switch, sign-out unchanged |

## 7.1-B Data model (additive only, migration `j8_v7_1_later`)
- NEW `public.j8_later` (org_id, id = the Today item key, item_ids text[], kind, title, fp, status later|not_needed|done|open,
  come_back_at timestamptz, at, by default auth.uid(), version, updated_at). PK (org_id, id). Triggers: `j8private.bump()`.
  RLS: read = viewer; insert/update = member (by must be the caller). No delete policy. Column grants: insert
  (org_id,id,item_ids,kind,title,fp,status,come_back_at), update (item_ids,kind,title,fp,status,come_back_at). Realtime on.
- `fp` = the text the decision was about (a project's "you" line): when the team writes a new line the old Later/Not needed
  no longer hides it.
- Tasks: Not needed uses the existing `status='dropped'` (DESIGN.md §10 b); the app also shows it under Done via j8_later.
- CREATE TABLE IF NOT EXISTS / CREATE POLICY guarded / no DROP. 6.1.2 ignores the table.

## 7.1-C Revert (to 6.1.2; `app-6.1.2.js` / `app-6.1.2.css` / `index-6.1.2.html` kept)
```
cp j8/index-6.1.2.html j8/index.html && sed -i "s/j8nix-v7\.1\.0'/j8nix-v7.1.0-revert'/" j8/sw.js
```
(6.1.2's index.html loads `app.css?v=6.1.2`/`app.js?v=6.1.2`; the revert copy points those at `app-6.1.2.css` /
`app-6.1.2.js` so the 7.1 files can stay.) DB: nothing to drop; 6.1.2 never reads j8_later.

## 7.1-D QA (14 Nov, harness /mnt/user-data/outputs/j8nix-v6/harness/qa.js; 6.1.2 harness kept as qa-6.1.2.js)
- Regression + v7.1 behaviour: 103 / 103 local and 103 / 103 against the deployed files (QA-org fixture data only).
  This covers the ranking parity with SQL, chain, cycle and done blocker, plus:
  - task, draft and template notes with routing (task_id / approval_id / unit)
  - Approve + note and Kill + note
  - Mark done → Done today → Undo; untick from the project
  - Later → Planned → Now; Not needed for a task, a project line and a whole batch
  - Draft Send / Undo / Edit / Kill → all decided
  - Talk answer and composer
  - Flow sections, the 6.1.1 Teams cron and the done project folded away
  - Control, Text size, Hebrew RTL, the light default and dark navy
- Matrix: 14 screens × 360 / 390 / 1280 × light / dark × EN / HE = 168 runs. Results: axe (WCAG 2.2 AA) 0, JS errors 0, sideways scroll 0, text under 16 px 0, targets under 44 px 0.
- First paint, median of 3 (CPU ×4, 150 ms API delay). 6.1.2: 1195 ms first visit and 346 ms repeat. 7.1.0: 1254 ms first visit and 317 ms repeat.
- RLS on j8_later (impersonated QA user, rolled back):
  - A viewer sees 0 studio rows and cannot insert.
  - A member can insert and update their own org only.
  - Writes to another org, a spoofed "by" and deletes are all refused.
