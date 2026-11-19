# J8NIX audit, 19 Nov 2026: kill-fail and facelift spec

Read-only audit. Data: Supabase J8NIX tables (live, 19 Nov), repo `/j8/` and `ops/brain/`. Counts only.

## TL;DR (10 lines)
1. J8NIX writes a lot and ships little: 277 drafts so far, 37 sent (13%). 155 approved drafts sit unsent, 92 of them for over 3 days.
2. The one pipe that works is job applications: 44 drafts, 22 sent by the Mac sender, 11 queued. It runs without Dave.
3. LinkedIn by hand is the big leak: 119 drafts, 4 sent (3%), 91 approved and waiting (avg 3.9 days).
4. Email is dead until the studio address sending is connected: 25 drafts, 0 sent, 18 waiting (avg 6 days).
5. Instagram is frozen but its debris stays: 34 drafts, 0 sent, 18 still "approved". Kill them.
6. Nobody tracks replies. There is no "replied" status anywhere, so J8NIX cannot tell which sends turn into money.
7. Half the runs do nothing: 220 runs in 7 days, 116 "nothing", 6 failed. The hourly Inbox watcher is 137 of them (110 "nothing").
8. Every run must read ~109 KB of rules (BRAIN 47 KB + J8NIX-DATA 37 KB + ARMS-CONTRACT 24 KB), about 27k tokens, before it does anything.
9. The app shows 31 projects, a $1M goal and many screens; FOCUS MODE needs 2 engines and one number: cash this month.
10. Fix: one home screen = cash + "send these now" + replies + Dave's top 3; merge runs from ~31/day to ~8/day; cut the rule pack to under 15 KB.

## Evidence

### Drafts funnel (all time, by channel group)
| Channel | Drafts | Waiting for Dave (approved, not sent) | Waiting >3 days | Queued | Sent | Killed |
|---|---|---|---|---|---|---|
| LinkedIn notes/messages (by hand) | 119 | 91 | 40 | 0 | 4 | 22 |
| Job forms (Mac sender) | 44 | 9 | 3 | 11 | 22 | 0 |
| LinkedIn posts/comments/page edits | 42 | 16 | 15 | 4 | 9 | 11 |
| Instagram (frozen) | 34 | 18 | 14 | 0 | 0 | 16 |
| Email (sender not connected) | 25 | 18 | 17 | 0 | 0 | 5 |
| WhatsApp / other | 13 | 3 | 3 | 0 | 2 | 6 |
| **Total** | **277** | **155** | **92** | **15** | **37** | **60** |

Last 7 days: 196 drafts made, 165 approved, 37 sent. The `channel` field is free text (100+ different spellings), so the app cannot group or count by channel.

### Runs, last 14 days (top arms)
| Arm | Runs | "Nothing" | Failed |
|---|---|---|---|
| Inbox watcher (hourly) | 138 | 112 | 0 |
| Sender (Mac) | 17 | 5 | 1 |
| Night shift (all variants) | 16 | 10 | 1 |
| Brain shift | 8 | 5 | 0 |
| Income hunter | 6 | 1 | 0 |
| Morning plan | 6 | 0 | 0 |
| 24 other arms (pods, QA, board, one-offs) | 30 | ~9 | 4 |

30 different arm names in 14 days. The `j8_schedule` table was last updated 14 Nov, so the schedule screen shows a 5-day-old picture.

### Dave's messages to J8NIX (last 7 days)
- 155 messages. 149 get the same instant canned line ("Got it, the team picks this up").
- The real answer comes a median 35 min later (90% within 58 min), because the watcher runs once an hour.

### Tasks
- Dave: 13 open, avg age 0.6 days, 1 without a link. This part works.
- Team/C-level owners: 21 open, 3 with no link and no action.

### Other tables
- `j8_money`: ₪826 booked, goal shown as $1M by Apr 2027. No monthly cash target.
- `j8_projects`: 31 visible, 10 not touched in 3+ days.
- Empty: `j8_day`, `j8_calendar`, `j8_files`, `j8_optout`.
- Repo `/j8/`: 74 old versioned app files (7.2 MB) next to the live ones; 5 script layers (app, j11, v11, shell, alerts).

## 5 biggest friction points for Dave
| # | Friction | Evidence |
|---|---|---|
| 1 | Approving is not sending. LinkedIn drafts pile up after approval. | 91 approved LinkedIn items waiting, 4 sent (3%) |
| 2 | Drafts made for channels that cannot send. | Email 0/25 sent; Instagram 0/34 sent; 36 still "approved" |
| 3 | No reply loop. Sent items vanish; no one sees who answered. | 0 rows with a reply status; 37 sends, no follow-up data |
| 4 | Too much on screen. 31 projects, $1M goal, many tabs vs 2 engines. | 31 visible projects, 10 stale; goal 1,200x today's cash |
| 5 | Slow, generic answers to his messages. | 149/155 canned acks; real answer median 35 min |

## Kill-fail verdicts
Test: does it help produce income this month, or save Dave time?

| Item | Type | Verdict | Why |
|---|---|---|---|
| Now / home | screen | Simplify | Becomes the money cockpit (see change 1) |
| Inbox / Draft (approve) | screen | Keep | Approvals are needed; add "send now" flow |
| "By hand" copy list | feature | Simplify | Merge into home "Send these now" with Copy + Open + Sent |
| Money | screen | Simplify | Show cash this month vs monthly target, not $1M |
| Projects / Dept / Project page | screen | Simplify | Show only the 2 FOCUS engines; hide the other 29 |
| Calendar | screen | Kill | 0 rows |
| Chat / J8 panel | screen | Keep | Dave's way to talk; make answers real (change 5) |
| Me / Control / Pause sending | screen | Keep | Safety switch, needed |
| Later | screen | Simplify | 4 open; fold into tasks |
| Team/C-level task owners (CTO, CMO...) | feature | Simplify | One owner "team"; 3 tasks with no action |
| `j8_approvals` | table | Keep | Add `channel_kind` + `replied` status |
| `j8_runs` | table | Keep | Log only runs that did something |
| `j8_messages` | table | Keep | Drop the canned ack |
| `j8_tasks` | table | Keep | Works for Dave |
| `j8_money` | table | Simplify | Add month target and month cash |
| `j8_projects` | table | Simplify | `hidden=true` for frozen ones |
| `j8_schedule` | table | Simplify | Stale since 14 Nov; refresh or stop showing |
| `j8_day`, `j8_calendar`, `j8_files` | tables | Kill | Empty |
| `j8_todo`, `j8_later` | tables | Simplify | Overlap with `j8_tasks` |
| `j8_memory`, `j8_units`, `j8_control` | tables | Keep | Small, used |
| Old versioned files in `/j8/` | repo | Kill | 74 files, 7.2 MB, no use |
| Inbox watcher (hourly) | arm | Simplify | 81% nothing; see change 5 |
| Sender (Mac) | arm | Keep | Only arm that ships (22 job forms) |
| Jobs and client leads / Income hunter | arm | Keep | Feeds the working pipe |
| Morning plan | arm | Keep | Merge with Revenue desk |
| Revenue desk | arm | Merge | Into Morning plan |
| Brain shift (2/day) | arm | Merge | 5 of 8 "nothing"; one midday run |
| Night shift (2/day + variants) | arm | Merge | 10 of 16 "nothing"; one night run |
| Weekend shift (6/week) | arm | Simplify | 2 of 3 "nothing"; 1 run per day |
| Weekly board | arm | Keep | Once a week, cheap |
| Pods (CRO, CMO, QA, Product, Media, Content, Strategy) | arms | Kill | One-offs, 3 of 9 failed, no sends |
| Instagram content / engagement | arms | Kill | Already off; FOCUS MODE freezes it |

## Facelift spec (7 changes, no code here)
| # | What | Why (evidence) | Effort | Expected effect |
|---|---|---|---|---|
| 1 | **One home screen, 4 blocks:** (a) cash this month vs target, (b) "Send these now": approved by-hand items, newest first, each row = one line + Copy + Open profile + Sent, max 10 shown, (c) replies waiting, (d) Dave's top 3 steps. Nothing else above the fold. | 91 LinkedIn items approved but unsent; Dave's tasks already work | M | By-hand sends from 4 to 10+/day; approved backlog cleared in a week |
| 2 | **Stop drafting for dead channels.** Email drafts only after sending from the studio address is connected; no Instagram drafts in FOCUS MODE. Mark the 36 stale email/IG drafts "killed". | Email 0/25 sent, IG 0/34 sent | S | ~25% fewer wasted drafts; cleaner list |
| 3 | **Reply loop.** Add statuses `replied` and `won`/`lost` on sent items. A "Did they reply?" tap on each sent row after 3 days, plus a follow-up draft when yes. | 0 reply data on 37 sends | S | Every reply seen within a day; first booked calls become visible |
| 4 | **FOCUS filter.** Show only the 2 engines (Dave's services/fractional/jobs, SH✡MER Command for councils). Other 29 projects hidden, not deleted. Money goal = this month, not $1M. | 31 projects, 10 stale; goal 1,200x cash | S | Less reading for Dave; arms stop working frozen products |
| 5 | **Faster, real answers.** Remove the canned ack line; app shows "seen" itself. Inbox watcher runs only when there is an unanswered message (check first, exit at zero cost), or every 2 h in work hours. | 149/155 canned acks; 110/137 runs "nothing"; median 35 min | M | Same or faster answers with ~60% fewer runs |
| 6 | **Merge and cut scheduled runs.** Keep: Sender (2/day), Morning plan + Revenue desk merged (1/day), one Brain shift (midday), one Night shift, Jobs and leads (2/week), Weekly board, Weekend (1/day). Kill pods and one-off arms. | 220 runs/week, 116 nothing, 30 arm names | S | ~31 runs/day to ~8/day; roughly 70% less usage |
| 7 | **Shrink the rule pack.** One "RUN-CARD" under 15 KB that every run reads (goals, focus, hard rules, send rules, SQL). BRAIN, DATA and ARMS stay as reference, read only by grep when needed. Fix `channel` to a short fixed list (`linkedin_hand`, `job_form`, `email`, `post`, `whatsapp`). | ~109 KB (~27k tokens) read per run; 100+ channel spellings | M | ~20k fewer tokens per run; with change 6, a rough ~4M tokens/week saved |

Usage numbers are estimates from file sizes and run counts, not metered data.

## Order to do it
1. Changes 2, 4, 6 (all S): same day, no UI work.
2. Change 1 + 3: the cockpit, this week.
3. Changes 5 + 7: next, to cut usage.

What Dave must do next: send the approved LinkedIn items from the "by hand" list (10 a day), and give the one-time OK when the team asks to connect sending from the studio address (18 email drafts wait on it).
