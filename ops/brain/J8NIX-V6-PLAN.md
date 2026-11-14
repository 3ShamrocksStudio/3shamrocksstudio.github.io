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
sed -i 's/app\.css?v=6\.0\.0/app-5.3.0.css/;s/app\.js?v=6\.0\.0/app-5.3.0.js/' j8/index.html && sed -i "s/j8nix-v6\.0\.0'/j8nix-v6.0.0-revert'/" j8/sw.js
```
(j8-data.js and shell.js stay backward compatible with the 5.3.0 and 5.2.0 screens: they only add the tasks collection,
load sent/killed drafts without bodies — templates always in full — and paint from the saved copy.)

## 9. QA

Playwright (preinstalled Chromium) at 390×844 and 1280×800, QA org data (`j8qa-org`) served to the real app files, plus
SQL fixtures in the QA org: chain A→B→C, cycle D↔E, done blocker F. Checks: axe-core 0 violations, no horizontal scroll,
no JS errors, Hebrew RTL, ranking parity SQL = JS. RLS: impersonated QA viewer sees 0 rows of the studio org through the
tables and the functions. Then one independent verifier agent.
