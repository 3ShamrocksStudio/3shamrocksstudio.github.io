# J8NIX MVP bar: "ready for testing" (backlog m-1125-00, 25 Nov 2026)

J8NIX is ready for outside testers when all 10 bars below are cleared at the same time.
Each bar is counted live from the database by `public.j8_mvp_gates(p_org)` and shown in J8NIX → Score → **Ready for testing**.
Nothing here is a sample or an estimate: when there is too little data to judge, the bar shows **Not enough data** and counts as not cleared.

NEEDS YOUR EYES: the thresholds are the studio's choice, set against the sources below. Change one by editing the function (one number per gate).

## The 10 bars

| # | Bar (as shown) | Counted from | Window | Clears when | Min. data |
|---|---|---|---|---|---|
| 1 | Agent runs work | `j8_runs`: runs whose status is not `failed` ÷ all runs | 28 days | ≥ 97% | 20 runs |
| 2 | Nothing approved waits over a day | `j8_approvals` approved/edited, not sent, decided over 24 h ago, no hold still running | now | 0 | – |
| 3 | Drafts good enough to send as is | decisions made by a signed-in person (`decided_by` set) that were Go with no edited body ÷ all such decisions | 30 days | ≥ 30% | 10 decisions |
| 4 | Few drafts stopped | the same decisions that were Stop (`killed`) ÷ all such decisions | 30 days | ≤ 20% | 10 decisions |
| 5 | People answer | reach-outs sent (email, outreach, LinkedIn, message, application) with a reply in `j8_outcomes` ÷ reach-outs sent | 30 days | ≥ 2% | 20 sent |
| 6 | Every send is tracked | reach-outs sent that have a `j8_outcomes` row linked to a lead ÷ reach-outs sent | 30 days | 100% | 1 sent |
| 7 | No one gets the same pitch twice | leads that got 2+ first pitches (email/outreach/LinkedIn/message without `extra.followup_of`) | 30 days | 0 | – |
| 8 | Opt-outs respected | sends to a contact on `j8_optout` (email or @domain) after the opt-out time | 30 days | 0 | – |
| 9 | Each business sees only its own data | public `j8_*` tables with row level security on ÷ all public `j8_*` tables | now | 100% | – |
| 10 | You use it most days | days (Israel time) on which a signed-in person decided at least one item | last 14 days | ≥ 10 of 14 | – |

Templates, design choices and posts are left out of 2–8 (posts are not reach-outs). Decisions made by agents (no `decided_by`) are left out of 3–4, so the bars measure what *you* thought of the drafts.

## First reading (25 Nov 2026, 20:30 UTC): 6 of 10 cleared

| Bar | Now | Result |
|---|---|---|
| Agent runs work | 369 of 379 (97.4%) | Cleared |
| Nothing approved waits over a day | 16 waiting | Not yet |
| Drafts good enough to send as is | 12 of 97 (12%) | Not yet |
| Few drafts stopped | 78 of 97 (80%) | Not yet |
| People answer | 12 of 70 (17%) | Cleared |
| Every send is tracked | 70 of 70 | Cleared |
| No one gets the same pitch twice | 0 | Cleared |
| Opt-outs respected | 0 (list is empty) | Cleared |
| Each business sees only its own data | 24 of 24 tables | Cleared |
| You use it most days | 7 of 14 days | Not yet |

What moves the 4 open bars: send-or-release approved items within a day (b-1125-24 time engine, r-1125-01 stall alarm, b-1125-21 API sending); better drafts and kill reasons (r-1125-02, b-1125-10 learn from edits).

## Why these thresholds (sources)

1. **Agent runs ≥ 97% over 4 weeks.** Google SRE Workbook, *Implementing SLOs*: use a 4-week rolling window; the worked example sets 97%. https://sre.google/workbook/implementing-slos/ · Missed-run detection with a grace period: Cronitor docs, https://cronitor.io/docs/cron-job-monitoring
2. **0 stuck approvals.** No published norm for approval latency was found; 24 h is the studio's own bar (an approved item that never goes out is a broken promise to the user). Response-time background: Nielsen Norman Group, https://www.nngroup.com/articles/response-times-3-important-limits/
3. **Go without edit ≥ 30%.** Acceptance rate is the best usage predictor of perceived productivity for AI suggestions (Ziegler et al., CACM, *Measuring GitHub Copilot's Impact on Productivity*, https://cacm.acm.org/research/measuring-github-copilots-impact-on-productivity); ZoomInfo's Copilot rollout saw 33% acceptance (https://arxiv.org/html/2501.13282). Microsoft HAX guidelines: support efficient dismissal and correction, learn from behaviour (https://www.microsoft.com/en-us/research/blog/guidelines-for-human-ai-interaction-design/).
4. **Stop ≤ 20%.** Same sources as 3: a high stop rate means drafts are aimed at the wrong things; 20% is the studio's ceiling.
5. **Replies ≥ 2% of sent.** Cold email averages about 5–9% replies, 10–15% is excellent (Instantly, https://instantly.ai/blog/cold-email-reply-rate-benchmarks); a 7.5 M-email study measured 0.45% (Belkins, https://belkins.io/blog/cold-email-response-rates). The two differ because they count differently; J8NIX counts replies ÷ reach-outs sent, and 2% is the floor.
6. **100% tracked.** Without an outcome row on every send, Score and money cannot be trusted (HEART: task success needs a measurable signal, https://research.google/pubs/pub36299/).
7. **0 duplicate first pitches / 8. 0 sends after opt-out.** FTC CAN-SPAM guide: honour opt-outs within 10 business days, no B2B exemption (https://www.ftc.gov/business-guidance/resources/CAN-SPAM-act-compliance-guide-business). UK GDPR right to object to direct marketing is absolute (ICO, https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-to-object). Israel, Communications Law Amendment 40 (anti-spam): prior consent, a refusal option in every message, up to NIS 1,000 per message (https://www.law.co.il/en/news/2008/05/27/knesset-approves-israeli-anti-spam-law/). NEEDS YOUR EYES: legal review; later amendments exist.
9. **RLS on 100% of tables.** Supabase: enable RLS on every table in an exposed schema (https://supabase.com/docs/guides/database/postgres/row-level-security).
10. **Used on ≥ 10 of 14 days.** Dogfood first: Superhuman's PMF engine only trusts signal from people who really use the product (First Round Review, https://review.firstround.com/how-superhuman-built-an-engine-to-find-product-market-fit). The 40% "very disappointed" survey becomes a later bar once there are about 40 testers.

## How it works

- `public.j8_mvp_gates(p_org uuid)`: plpgsql, `stable`, `security invoker` (RLS applies), `search_path ''`. Raises 42501 unless the caller is a viewer or above in that org (`j8private.has_role`). Execute granted to `authenticated` only.
- Returns one row per bar: `sort, id, ok (true/false/null = not enough data), n, d, target, op (ge_pct, le_pct, eq0, ge), min_d`.
- App: `J8.gates()` in j8-data.js (60 s cache), drawn by `vGates()` in j20.js under Score; not-cleared bars come first; each row = glyph + word + colour, one short phrase, tap for Now / Bar / Why. EN + HE.
- Rollback: `git revert` the 15.7.0 commit; `drop function public.j8_mvp_gates(uuid);`
