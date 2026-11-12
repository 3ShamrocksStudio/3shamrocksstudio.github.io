# J8NIX v3 · Arms contract (database read/write rules)

J8NIX is the one point every scheduled task ("arm") reads and writes.

- Artifact: https://claude.ai/artifact/K6JrRs66KSQseksQgEMbyh (slug `9282376f-d9cf-4721-8b12-a2f7fdcae5b0`)
- Capabilities: `db`, `user`, `sample`. Default db rules apply: signed-in viewers read, editors write.
- Tools: `ArtifactData` (get/list/query/set/update/batch) or `mcp__claude-artifacts__db_*`. Every write to an existing doc must pass the doc's `version` (`if_version`). Re-read and retry on a version conflict. Never overwrite blindly.
- Timestamps are ISO 8601 strings. Project ids are the `projects` doc ids (`p-…`).
- **Never delete or rename the `todo` or `comments` collections, and never change their doc shapes.**

## Who writes what

| Collection | Dave (page) writes | Arms write | Arms must never |
|---|---|---|---|
| `todo` | `done`, `back`, `note`, `at` | nothing (read only) | write ticks for Dave |
| `comments` | new docs `{p,text,at,status:'new',reply:''}` | `status`, `reply` | edit `text`, delete docs |
| `approvals` | `status` (approved/edited/killed/pending), `edited_body`, `decided_at` | new docs (status `pending`); after sending: `status:'sent'`, `sent_at`, `result` | send anything whose status is not `approved` or `edited`; change `body` after Dave decided |
| `projects` | nothing | every field (merge with `update`) | delete a project (set `hidden:true` instead) |
| `runs` | nothing | one new doc per run | rewrite old runs |
| `money` | nothing | `summary` fields | write a number that isn't real; write a guess |

## 1. `todo` (unchanged from v2)

Doc id = to-do item id from `var T` in the page. Shape: `{done: bool, back?: bool, note?: string, at: ISO}`.
- `done:true` means Dave ticked it. `done:false, back:true` means he unticked it: restore the full item next shift.
- `note` is Dave's note on that item. Read it every shift.
- To-do **items** themselves still live in the page source: the first `<script>` holds the single line `var T=[...]` (same format as v2). Arms that add items keep editing that line with `edit_version` exactly as before. Ticked items stay visible under Done; never remove an item Dave ticked.

## 2. `comments` = the inbox (unchanged from v2)

Doc id: `<projectId>-<epochMs>` (page-created). Shape:
```
{ p: "p-shomer" | "p-general" | any project id,
  text: "Dave's message",
  at: ISO,
  status: "new" | "routed" | "done",
  reply: "multi-line; the page shows only the LAST non-empty line" }
```
Arm duty every pass: query `status == "new"`, act, set `status:"routed"` with a first reply line, then `status:"done"` with the final line when finished. Append new reply lines with a time prefix (`"15:11 — …"`); the last line is what Dave sees.

## 3. `approvals` = everything that goes out in Dave's name

Doc id: `<kind-prefix>-<mmdd>-<slug>` (e.g. `app-1112-helfy`, `warm-1112-ben-feldman`, `igq-<old id>`). Shape:
```
{ kind: "email"|"linkedin"|"application"|"post"|"invoice"|"other",
  label?: "IG Comment" | "DM" | "Page edit" ...      // chip text override
  to: "Who / what, one line",                          // row title
  channel: "how it goes out, e.g. Email from dave@3shamrocks.com to x@y",
  subject: "" | "email subject",
  body: "the exact text drafted",
  link: "" | "https://… (apply page, profile, post)",  link_text?: "Open apply page",
  product: "p-…",                                      // project id
  created: ISO,
  status: "pending"|"approved"|"edited"|"killed"|"sent",
  edited_body?: "Dave's edited text",
  decided_at?: ISO|null, sent_at?: ISO, result?: "what happened / failure reason",
  warn?: "one short warning line shown in amber",
  context?: "why / fit / source facts (small grey line)",
  attach?: "file to attach",
  rank: number,                                        // lower = higher on the list (money first)
  batch: "revenue-1112", batch_label: "Revenue sprint · 12 Nov",   // section on the Approve tab
  source?: "where the draft came from" }
```
Rules:
- Create drafts with `status:"pending"` only. Dave's tap is the approval of that exact text.
- **Text to send** = `status == "edited" ? edited_body : body`. Subject = `subject`.
- Send only docs with `status` in `approved | edited`. After sending: `update {status:"sent", sent_at, result}` (result = URL of the sent message/post or confirmation id).
- If sending fails: leave `status` as is and write `result: "Failed: <reason> (<time>)"`. Retry next shift at most once, then ask Dave in `comments`.
- `killed` = never send, never re-draft the same text.
- Dave can Undo (`status` back to `pending`) until `sent`. Re-check status right before sending.
- New batch: give it a new `batch` + `batch_label`; the first pending batch (lowest rank) opens by default.

Seeded 12 Nov: 13 pending in `revenue-1112` (8 applications from GIGS.md top 8, ranks 1–8; 5 warm messages from warm-reach.json, ranks 9–13, with "במשרה מלאה" removed and the check note as `warn`). 31 docs in `ig-queue` copied from the IG Engagement Queue (30 pending, 1 approved: `igq-li-3s-comment-01`, approved by Dave 8 Nov, not yet sent).

## 4. `projects`

Doc id = project id (same ids the inbox `p` field uses). Shape:
```
{ name, color: "#hex", stage: 1..6 | null,           // 1 Concept · 2 Build · 3 Staged · 4 Validate · 5 Monetize · 6 Paying
  now: "one line", next: "next stage, one line",
  you: "Dave's move, one line", you_link?: "#approve | https://…", you_link_text?,
  link?: "latest link", link_text?, links?: [{t,u}],
  owner?: "CRO|CMO|CPO|CDO|CTO|COO|Grants", status?: "active|parked|waiting",
  kill_rule?, revisit?: "YYYY-MM-DD", order: number (money rank, 1 = fastest cash),
  brain_id?: "id in ops/brain/brain.json", hidden?: bool, updated: ISO, by: "arm name" }
```
Arm duty: after any real progress, `update` `now`, `next`, `you`, `link`, `updated`, `by` (never invent progress). Re-rank `order` when the money path changes. Seeded ids: p-jobs, p-services, p-vibrant, p-vicky, p-tnufa, p-command, p-shomer, p-site, p-lickpick, p-linkedin, p-ig, p-csr, p-healthtech, p-th, p-nature, p-ios, p-chore, p-milo, p-j8nix, p-fairent, p-rk, p-wh33lz (+ `p-general` exists only as an inbox target).

## 5. `runs` = heartbeat

One doc per arm run. Doc id: `<arm-slug>-<YYYYMMDD-HHMM>`. Shape:
```
{ arm: "Stand-up 08:30" (stable display name), started: ISO, ended?: ISO,
  status: "ok" | "failed" | "nothing", summary: "1–3 lines, what changed",
  link?: "evidence URL", project?: "p-…", projects?: ["p-…"] }
```
Write it at the end of every run, including failures (`status:"failed"`, summary = the error) and empty runs (`"nothing"`). The page shows each arm's latest run: green ok, amber nothing or older than 48 h, red failed.

## 6. `money`

Single doc `money/summary`:
```
{ booked_usd: number,  booked_ils: number,        // total booked (USD is the M1 meter)
  m1_usd: 25000, m1_date: "2026-11-21",
  goal_usd: 1000000, goal_date: "2027-04-21",
  pipeline?: number, pipeline_note?: "e.g. 3 replies, 0 calls",
  spend_usd: 0, spend_ils: 0,                     // must stay 0 without Dave's consent; >0 turns the tile red
  updated: ISO, by: "arm" }
```
Only real, verifiable numbers (Morning invoices paid, signed contracts). Unknown = leave the field out (the page shows "—"). Seeded 12 Nov: booked 0/0, spend 0/0, M1 and goal as above, pipeline absent.

## Page data API (for any UI)

The page exposes `window.J8` (script `#j8-data-api`, source also in `j8nix-data-api.js`): `connect, on, status, raw, todo.{get,isDone,tick,untick,note}, inbox.{send,list,forProject,lastReply}, approvals.{list,pending,decided,textOf,approve,edit,kill,undo}, projects.{STAGES,list,get}, runs.{list,lastByArm,forProject,health}, money.{summary,daysTo}, askAvailable, ask, context`. It writes exactly the shapes above.

## Rewiring checklist (coordinator)

1. Every arm: read `comments` (status new) + `approvals` (approved/edited) at start; write one `runs` doc at end.
2. IG engagement arm: stop reading the old IG Engagement Queue `queue`; draft into `approvals` (`kind:"other"`, `label:"IG Comment"`, `batch:"ig-<mmdd>"`) and send only approved/edited ones. The old queue still holds its docs (not modified); treat it as frozen to avoid double posting `li-3s-comment-01`.
3. Revenue/stand-up arms: update `money/summary` and the `projects` they touched; new outreach drafts go to `approvals`, not into the to-do `copy` fields.
4. ops/brain/brain.json stays the arms' long-form memory; J8NIX `projects` is the short live view Dave reads.
