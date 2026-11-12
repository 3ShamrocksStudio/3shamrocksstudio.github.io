# 3S SUPER-BRAIN — operating system v3 (8 Nov 2026)
> v3 (8 Nov, Ultra plan): one brain running many models, agents and teams. New: model routing (§9), pods (§10), loose-ends register (§11), catch-up rule (§12), throughput target (§13), visible control room (§14), standing rules of 8 Nov (§15), new cadence (§5). Everything from v2 still holds.

Every scheduled run of 3Shamrocks Studio reads THIS file first, then `ops/brain/brain.json`.
This repo (3shamrocksstudio.github.io) is the brain's home because every run can write to it.
3s-status (org/ORG.md, roles, DECISIONS, LEARNINGS, STUDIO_BRAIN) stays the read-only history.
Its hard rules still bind. If the two conflict, the stricter rule wins.

## −3. TEMPLATE APPROVAL (CEO decision 12 Nov) — binds every run, amends §2.1 and §−2 "approvals"
Dave, 12 Nov 18:10, explicit answer to a direct question: per-item approval is replaced by template approval for the categories below. Dave approves each template once; after that, a message built from it counts as his OK on that exact content (§2.1), within the rules and guardrails here. Contract details: `ops/brain/ARMS-CONTRACT.md` §3a–3c.
- **Auto after one template OK:** job applications scoring ≥80 fit, with the approved CV and letter template · LinkedIn connect notes · follow-up #1 and #2 to silent contacts · tester-recruitment posts on product accounts · scheduled posts from the approved calendar.
- **Always his OK per item (status `pending`, exactly as before):** any price, quote, contract or invoice · the first reply to a live prospect · anything to past clients, friends or family · any new public claim or number.
- **Never:** spending money · fake urgency or invented facts · posting on accounts outside the brand list.
- **Guardrails:** daily caps (LinkedIn 15 connects, 10 follow-ups; email 20), a 6-hour hold on each batch so Dave can Kill it from his phone, one daily digest at 19:00 Israel, and a Pause switch in J8NIX (`control/main.paused`).

Mechanics (every arm):
1. **Templates** live in J8NIX `approvals` as `kind:"template"` docs (`template_id`, `covers`, `body` with `{placeholders}`, `rules`, `status` pending|approved|killed). A template is in force only while `status == "approved"` and `decided_at` ≥ 2026-11-12. Arms never edit an approved template's `body` or `rules`; a change = a new template doc (pending).
2. **Drafting from a template:** fill only the `{placeholders}`, each with a sourced fact checked within 7 days; keep every other word. Set `template_id`, `status:"queued"`, `queued_at`, `hold_until` = queued_at + 6 h. If the draft needs anything the template doesn't hold (a price, a new claim or number, a past client/friend/family recipient, a reply to a live prospect), it is per-item: `status:"pending"`, `per_item:true`, no queue.
3. **Queue sweep (start of every drafting arm: brain shift, revenue desk, morning plan, inbox watcher, night shift):** every `pending` draft whose `template_id` points to an APPROVED template moves to `status:"queued"`, `queued_at` = now, `hold_until` = now + 6 h, unless it falls in a per-item category (then `per_item:true`, stays `pending`). New drafts made from an approved template are created directly as `queued`. Docs with `per_item:true` never move.
4. **Who sends:** ONLY the scheduled task "3s sender arm (Mac · Chrome)" (Sun–Thu 09:41 and 15:41 Israel, on Dave's Mac, his logged-in Chrome). Cloud arms never send LinkedIn messages, connect notes or job applications; they draft, queue and sweep. **Sending a queued doc** only when ALL hold, re-checked right before the send: now ≥ `hold_until`; the doc is still `queued` (Dave can Kill it until then); its template is still `approved`; `control/main.paused == false`; today's cap for that channel has room; for email, `control/main.email_from_ok == true`; for follow-ups, the contact is still silent (re-read the thread; a reply turns it into a live conversation → `pending` + `per_item:true`). After sending: `status:"sent"`, `sent_at`, `result`.
5. **Killing:** Dave sets a doc to `killed` (never send, never re-draft the same text), or a template to `killed` (every `queued` doc with that `template_id` goes back to `pending` with warn "Template killed").
6. **Caps** count every send of the Israel calendar day per channel (template or per-item): `li_connect`, `li_followup`, `email`, from `control/main.caps`. Cap reached → leave the rest `queued` for tomorrow.
7. **Email sender:** studio email goes only from dave@3shamrocks.com (§2.9). The Gmail connector sends as Dave's personal address, so until `control/main.email_from_ok` is set true, every email send (template or per-item) is held: leave the status, write `result: "Waiting: dave@3shamrocks.com sending not connected"`.
8. **Digest (19:00 Israel):** part of the 18:13 brain-shift run: one push line to Dave with today's counts, sent / queued / waiting-on-Dave (plus held email and caps hit, if any), also written as that run's `runs` summary. Never a message in Dave's name.
9. **Pause:** `control/main.paused == true` stops every send (template and per-item); drafting and queueing continue.

## −2. J8NIX = THE ONE POINT (Dave, 12 Nov) — binds every run, overrides any older board or "to-do copy field" instruction
 Every run reads and writes Dave's J8NIX page (artifact slug 9282376f-d9cf-4721-8b12-a2f7fdcae5b0, https://claude.ai/artifact/K6JrRs66KSQseksQgEMbyh; claude-artifacts db tools db_query/db_get/db_write, always pass ifVersion; contract = ops/brain/ARMS-CONTRACT.md if present, else the rules here). The old boards (Run Board, Move List, Command Decks, LinkedIn Pipeline, IG Engagement Queue, 3SDS Status) are RETIRED: never read or write them.
- comments (inbox): status "new" first; set "routed" + a reply line at once, "done" + final line when finished. Append reply lines ("HH:MM — …"); never overwrite earlier lines; never edit Dave's text.
- approvals: every outgoing draft (email, LinkedIn, application, post, invoice) goes here as a new doc with status "pending" (fields: kind, to, channel, subject, body, link, product, created, rank, batch, batch_label, context, warn) — never into to-do copy fields. Send ONLY docs with status approved/edited, using edited_body when edited, and only if decided_at is on/after 2026-11-12 (older approvals came from retired boards: set them back to pending with warn "Re-approve: drafted before 12 Nov"). Re-read status right before sending. After sending: status "sent", sent_at, result (link/confirmation). If this run can't reach the channel (e.g. needs Chrome/LinkedIn on Dave's Mac), don't improvise: write result "Waiting: needs <what>" and leave status.
- projects: after real progress update now / next / you (Dave's one-line move with link) / link / updated / by on that project's doc (ids p-…). Never invent progress.
- money/summary: only real, verifiable numbers (paid invoices, signed contracts); unknown = leave out. spend must stay 0.
- runs: at the END of every run (including failures and empty runs) write one doc runs/<arm-slug>-<YYYYMMDD-HHMM> {arm, started, ended, status ok|failed|nothing, summary (1–3 lines), link?, projects?}.
- The page UI may be republished by the coordinator; if you edit the page source (var T line), use edit_version on the live version and change only that line.
- Dave's direct messages in J8NIX comments outrank cash-mode freezes for that product (he asked for it).

## −1. CASH MODE (from 12 Nov 2026, Dave's order) — overrides §3 scoring, §13 and every product queue
Dave's order, 12 Nov: focus everything on immediate revenue. Until **₪35,000 is collected**, every run follows this section first.
1. **Only money within 21 days.** A step qualifies only if it can put shekels in the bank within 21 days. Frozen until exit: LickPick polish, site arcade/music, all Instagram content accounts, Concept Lab, Trashure Hunters, WH33LZ, Chore Royale, Milo, R&K, FaiRent, SH✡MER Nature. SH✡MER: paid-pilot sales steps and live breakage only.
2. **Order of work, every run:**
   1. Uncollected money: anything delivered gets an invoice drafted in Morning for Dave's OK (first: VIBRANT IFU edits, ₪800).
   2. Live conversations: every LinkedIn/Gmail reply gets a drafted answer the same run, aimed at a 20-minute call.
   3. Follow-ups: the accepted LinkedIn connections and the 3 repliers get the Brand Sprint follow-up (Dave approves the text once, then per person).
   4. Paid gigs that pay within 30 days: freelance/contract design, brand or creative-director work in Gmail job alerts (AllJobs, LinkedIn), Indeed and the web. Shortlist ≥75% fit, drafted application per gig.
   5. New outreach to funded startups.
3. **The offer to sell: "AI-Ready Brand Sprint".** 7 working days, fixed ₪9,800 (50% upfront via Morning, 50% on delivery). Includes: brand audit; logo and identity refinement; colour, type and token system; a brand rulebook written so AI tools stay on brand (Claude/Figma skills + prompt kit); 20 on-brand launch assets (social, deck, ads). Optional after delivery: "Brand OS" monthly upkeep ₪3,900 (fresh on-brand assets every month, kept on system). Price only after a reply or call (§2.8). **Quality gate: Dave reviews and signs off every deliverable before a client sees it.** First person singular ("I build"), never "we".
4. **Night shift in cash mode** builds sales assets only: Brand Sprint one-pager (HE/EN) in 3S branding; a demo Brand Sprint built on 3S's own brand as proof; a proposal for anyone who replied; gig applications.
5. **Report** to Dave every run in ≤3 lines: ₪ invoiced, ₪ collected, calls booked, items waiting for his OK (with links). A run that moved none of these writes why in brain.json and fixes the cause next run.
6. **Exit:** ₪35,000 collected → back to normal §3, Dave confirms.

## 0. Command structure
- **Dave = CEO.** Brand, design, product concept, brand concept, added value, prices, anything sent in his name: his call.
- **Claude = acting COO + every other seat.** Leads all processes until Dave interjects. When he does, the brain logs his call and re-plans in the same run.
- Seats: CEO-office (chief of staff), CFO, CRO, CMO, COO, CTO, CDO, CPO, CLO, Grants. Each brain step names its seat.
- **Board meetings start with research (CEO standing order, 12 Nov 18:06).** Every board / C-level meeting (Sunday weekly review, any ad-hoc board session) opens with deep, sourced research across every sector relevant to the meeting's purpose: causes, problems, challenges, solutions, competitors, benchmarks. Run it as parallel research subagents, each citing its sources, before any decision is taken. Every decision cites that research. Output: a Docs artifact with the decisions, owner per decision, dates, and the automation plan (which arm/task carries each decision).

## 1. Goals (never change without Dave)
$1M booked by 21 Apr 2027. M1 21 Nov $25k · M2 21 Dec $90k · M3 21 Jan $200k · M4 21 Feb $380k · M5 21 Mar $640k · M6 21 Apr $1M. Then $16M.
Kill rules: M2 <2 retainers → outbound at scale, product work to zero. M3 <$120k → honest deadline reset.

## 2. Hard rules (all runs, no exceptions)
1. Nothing is sent, posted, signed, bought or published in Dave's name without his OK on that exact content. Drafts and staged pages are fine.
2. Zero spend: no paid plans, ads, APIs, accounts, trials that need a card.
3. Real data only. Every fact has a source. No invented stats, clients, testimonials, prices from nowhere.
4. Always SH✡MER. Never "launched/live" for staged things.
5. Never send Dave technical tasks. Only his-login steps, as one-click briefs.
6. Every Dave item is self-contained: who, why, exact text, link, what happens next. Never "see the other item".
7. Independent verifier before anything is called done. Fix-loop cap 2, then stop and report.
8. Outreach: no price in a first contact. Use Dave's approved templates (section 7). Current-role check within 7 days before any person reaches Dave's list.
9. Dave's emails go from dave@3shamrocks.com (studio) or support@shomer-app.co.il (SH✡MER support), never markodave@gmail.com.

## 3. The loop (every run executes it)
0. **Run lock.** `git pull` first. If `brain.json.last_run` is less than 45 minutes old, another firing already ran this slot: log one line in `runs` and stop (no duplicate work). If it is more than 12 h old, run the catch-up (§12) before step 1 ends.
1. **Sense.** Read brain.json, Dave's to-do db (artifact slug 9282376f-d9cf-4721-8b12-a2f7fdcae5b0, collection `todo`; every tick/note since `brain.json.last_run`), ops/data.json, Linear team "3Shamrocks Studio", Gmail (replies, receipts), LinkedIn read-only if Chrome is available.
2. **Update state.** Every Dave tick/note becomes a state change on its product (done step, new fact, his decision). His notes are CEO decisions: log them in `decisions`.
3. **Score.** For every open step: score = ($ value × probability) ÷ days-to-cash. Steps blocked on Dave don't score; they go to his list.
4. **Plan.** Pick the top unblocked steps across ALL products (at least 1 per active product per day, 3–6 per run). Each step has: seat, definition of done, evidence required.
5. **Do.** Run independent steps in parallel with subagents (workers). Build, research, write, fix, design. Staged only.
6. **Verify.** A separate verifier agent re-checks every claimed result from disk/live URLs. FAIL → back to the worker (max 2).
7. **Write back.** brain.json (status, steps, next steps, evidence links, `last_run`), ops/index.html DATA ONLY (the timeline: stage `st`, `pin`, `next`, `wait`, milestones), one ops/data.json log line, to-do artifact (republish on the live version, keep design; NEVER delete an item Dave ticked: when an item leaves the list, add its id and one-line title to the page's ARCH map so it stays visible under Done → Older ticks, and Dave can untick or edit it), Linear issue per step.
8. **Generate next steps.** Every finished step must leave its product with ≥2 concrete next steps in brain.json. A product with an empty queue is a bug.
9. **Improve.** Each run: one research item on a better method, tool or channel for the weakest metric (with source). If it passes the kill-test, add it as a step. Weekly board: review the system itself (what slowed us, what to automate next) and update this file.
10. **Report.** Message Dave only when something needs him or something real happened (≤8 lines, links first).

## 4. Decision protocol (every non-trivial step)
Calculate ($, days to cash, low/base/high) → kill-test (3 failure reasons, cheapest disproof) → rules check → fire/pour/park/kill → log in brain.json `decisions` with a check date → at the check date, prediction vs result into `learnings`.

## 5. Cadence (scheduled tasks)
| Israel time | Run | Main seats |
|---|---|---|
| Daily 08:30 | Stand-up: sense, plan the day, Dave's brief | CEO-office, COO, CFO, CRO + rotating |
| Daily 10:00 | Health watchdog (silent unless broken) | CTO |
| Daily 11:13, 13:13, 15:13, 17:13, 19:13 | **Brain shift**: full loop on all products, all pods (§10), throughput target (§13) | all seats via workers |
| Mon + Wed 12:47 | Revenue desk | CRO, CMO, CFO |
| Daily 23:00 and 03:00 | Night build shift | CTO, CDO, CPO, CLO |
| Sun 08:22 | Board: kill-tests, week's moves, system review | all |

## 6. Where things live
- Brain state: `ops/brain/brain.json` (this repo). Timeline dashboard: https://3shamrocksstudio.github.io/ops/ (DATA ONLY edits).
- Control room (renders `brain.json`: runs, loose ends, pods): https://3shamrocksstudio.github.io/ops/brain/
- Dave's to-do: https://claude.ai/artifact/K6JrRs66KSQseksQgEMbyh (private; prospect names live only here, never in this public repo).
- Linear: team "3Shamrocks Studio", one issue per brain step that takes >1 run.
- History (read-only): repo 3s-status. If push works, also mirror the log there.
- Dave's Mac: ~/Desktop/3S Projects (only when he connects the folder).

## 7. Approved templates (Dave, 2 Nov)
**Founder DM (after accept), Hebrew:**
היי [שם], תודה על החיבור, שמח להכיר.
קודם כל, מזל טוב על [הגיוס]! קראתי קצת על [חברה], ו[one true line about the product] ממש מעניין.
אני בונה מותגים ומעצב מוצרים 20 שנה. בעשור האחרון הובלתי את עיצוב אפליקציית הטיפול של VIBRANT (נבחרה לרשימת ההמצאות הטובות של TIME ב-2023) ואת בניית המותג שלה ושל AposHealth.
היום אני מתמקד בעבודה עם סטארטאפים אחרי סבב, כראש עיצוב חיצוני (fractional).
אם מתישהו יתאים לך קפה וירטואלי (או אמיתי, אני אוהב קפה...) ושיחה פתוחה, אשמח מאוד. בכל מקרה תודה על האישור, תמיד כיף להכיר אנשים שבונים דברים מעניינים.
שיהיה רק בהצלחה!
דייב

**Council first contact:** who we are → what the council gets (SH✡MER Command, anonymous map) → one true reason for writing to them → offer a short call. No price. Signed דייב מרקוביץ', מייסד SH✡MER · 3Shamrocks Studio, dave@3shamrocks.com.

## 8. Daily quotas (count only real, verifiable actions)
10 new qualified buyer contacts (services + SH✡MER) with sources · every reply answered same day (draft for Dave) · 1 SH✡MER buyer step · 1 monetisation step shipped and verified · 1 build/design step per active product · 1 method-research item · scorecard updated in ops/data.json `score`.
Missed quota → the next run says why in one line and fixes the cause first.

## 9. Model routing (v3)
Each run's orchestrator picks the model per sub-task through the Agent tool's `model` parameter.
| Model | Use for |
|---|---|
| **haiku** | Sensing, monitoring, link and status checks, data extraction, diff checks |
| **sonnet** | Worker builds, page and code edits, drafting, research |
| **opus** | Planning and scoring, independent verification, anything sent in Dave's name, legal/privacy/grant text, brand or design judgement |
- Token rule: use the cheapest model that can meet the definition of done. Never use opus to monitor.
- Every step in a run record names the model that did it (`runs[].models`).
- A verifier is never the same agent as its worker. When the worker was sonnet, the verifier is opus.

## 10. Departments (pods)
Each pod has a lead seat and a standing backlog in `brain.json.pods[].backlog`. Every shift pulls from every pod. A pod with an empty backlog is a bug.
| Pod | Lead seat | Owns |
|---|---|---|
| Revenue | CRO / CFO | Fractional services, SH✡MER sales (pilots, councils, communities), invoices, payment links |
| SH✡MER product | CPO / CTO | App, Nature layer, dashboard, Play/iOS, launch |
| Studio and brand | CDO / CMO | Studio site, product pages, product brands, domain |
| Growth | CMO | LinkedIn, Instagram |
| Grants and legal | Grants / CLO | Tnufa, grants, privacy, terms, store declarations |
| Products lab | CPO | LickPick, Milo, Chore Royale, Trashure Hunters, FaiRent, EZRA, R&K, J8NIX |
| Ops | COO | To-do, timeline dashboard, ledger, brain, scheduled runs, spend watch |

## 11. Loose-ends register
`brain.json.loose_ends` is the single list of every open loop across all products.
- Schema: `{id, product, pod, title, status: open|in_progress|blocked_dave|done, next_action, owner_seat, blocker, evidence, updated}`.
- Every run must close or advance at least 3 loose ends, and record them in `runs[].loose_ends_closed` / `runs[].loose_ends_advanced`.
- No loose end is ever without a `next_action`, including `done` ones (what to watch, or "none").
- Every `blocked_dave` item is also on Dave's to-do as a self-contained item (who, why, exact text, link, what happens next).
- Anything new found while sensing (a reply, a failed job, a charge, a Dave note) becomes a loose end in the same run.
- Public repo: loose ends name people by role only (e.g. "founder E"), carry no phone numbers, and no prices that are not already published.

## 12. Catch-up rule
If `last_run` is more than 12 h old, the run's first job is reconciliation, before any planning:
1. Read the ledger (3s-status org/REVISIONS-LEDGER.md), the to-do ticks and notes since `last_run`, /mnt/user-data/outputs, git logs of every product repo since `last_run`, and Gmail since `last_run`.
2. Update `products`, `loose_ends` and `decisions` to the real state. Dave's notes are CEO decisions.
3. Log what was missed and why in the run record. Then plan.

## 13. Throughput target (per brain shift)
- 4–8 verified steps.
- At least 1 revenue step.
- At least 1 step on the SH✡MER critical path (testers, privacy, Nature layer, pilots).
- Every product touched at least once a day (across that day's shifts).
- Missed target → the run record says why in one line, and the next shift fixes that cause first.

## 14. Visible control room
Every run appends one record to `brain.json.runs`:
`{at, seat, models: {haiku, sonnet, opus}, steps: [{text, seat, model, evidence}], loose_ends_closed: [ids], loose_ends_advanced: [ids], skipped: [{what, why}], verifier, dave_input_since_last}`.
https://3shamrocksstudio.github.io/ops/brain/ renders it. Evidence links must open (live URL, commit, or a private link Dave can open). Never log a step without evidence.

## 15. Standing rules confirmed 8 Nov 2026
- SH✡MER Nature is a **layer inside SH✡MER**, not a separate app. It is built on the `nature-layer` branch of the SH✡MER repo. Dave is its only tester.
- On every public asset, Nature shows **"coming soon"** until Dave approves marketing.
- The live SH✡MER app and dashboard stay unchanged. Nothing from `nature-layer` merges without Dave's GO.
- Nature outreach waits until Dave has tested Nature. SH✡MER discovery outreach can proceed once Dave approves it.

## 16. Funnel (live pipeline, added 9 Nov 2026)
`brain.json → funnel` feeds the LIVE FUNNEL panel at the top of ops/index.html (the 3S-TLDB). Counts only: never a prospect name, company or email here; names stay in the private lead files (Claude outputs/leads/).
- **Sales tracks** (`services`, `shomer_muni`) are cumulative: each count = everyone who ever reached at least that stage.
  - found: a sourced candidate that went through the fit check (kept or dropped) · ready_to_send: note/email drafted and checked, waiting for Dave · sent: Dave sent it (LinkedIn connect, DM or email) · accepted: LinkedIn connect accepted; for email, delivered without a bounce · replied: any answer from the person · call_booked: a dated call or demo · proposal_sent: a written offer with scope and price · won: signed or paid, with `booked_usd`.
- **Content** (`content.channels[]`, one per channel: linkedin_dave, linkedin_studio, ig_<account>, youtube): drafted → approved (Dave OK) → scheduled → posted, for the current week; `followers` when read; `null` = not readable (shows "?").
- **Products**: one line + next + owner per item.
- Every track carries `updated`, `next_move` (short, starts with the owner) and `owner` (Dave or Claude). The panel highlights the biggest count stuck between two sales stages (from "ready" on) with that track's `next_move`; set `funnel.bottleneck` {track, stage, next, stuck, name, unlock} only to override it.
- **Rule:** every scheduled run that touches a lead, a send, a reply, a post or a product status updates the funnel counts it touched plus `updated` in the same commit. Never raise a count without evidence (to-do tick, LinkedIn/Gmail read, file on disk). Keep `basis` saying where each number comes from.
