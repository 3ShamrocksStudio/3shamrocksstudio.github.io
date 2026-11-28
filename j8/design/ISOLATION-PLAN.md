# J8NIX isolation plan

> r-1125-03 · 28 Nov 2026 · NEEDS YOUR EYES (Dave) before a second paying customer is added.
> Every fact below was read from the live database (project otkvebgrdiayjnqrytrn) on 28 Nov 2026.

## How one team's data is kept apart today

- **One key per row.** 24 of the 27 `public.j8_*` tables carry `org_id`. The three without it are `j8_orgs` (the team itself), `j8_push_subs` (keyed by the signed-in user) and `j8_files` (closed to everyone but the service key, see gap 4).
- **Row-level security on every table.** RLS is on for all 27 `j8_*` tables. The two views (`j8_funnel`, `j8_draft_lint`) run as the caller (`security_invoker=true`), so they obey the same rules.
- **One check, used everywhere.** Read, insert, update and delete policies call `j8private.has_role(org_id, role)`, which looks up the caller's own row in `j8_members` (`auth.uid()`), ranked viewer < member < admin < owner. The only other rule is on `j8_push_subs`, where each person sees only their own rows (`user_id = auth.uid()`).
- **Nothing for strangers.** Signed out (`anon` role), every `j8_*` table and view returns 0 rows or is refused (all 29 tested, rolled back, 28 Nov). Since migration `j8_vapid_public_signed_in_only`, no `public.j8_*` security-definer function can be called signed out.
- **Humans approve, machines do not.** `j8private.guard_human_only()` refuses approvals, templates and other human-only changes when there is no signed-in user, so a worker key cannot approve its own drafts.
- **Opt-outs are per team.** Trigger `j8_approvals_dedupe` (`dedupe_guard`) refuses a new draft whose `channel` holds an email address (or whose domain is) in that team's `j8_optout`. Limits in gap 6.
- **The page itself.** Since 16.6.0, `/j8/` has a Content-Security-Policy: scripts only from this site (plus 3 inline scripts by hash), data only to this project, no plugins, no frames.

## Gaps found

| # | Gap | Risk | Fix |
|---|-----|------|-----|
| 1 | J8NIX shares one database with other studio products (62 tables; prefixes `cw_`, `a11y_`, `trashure_`, `lp_`, `site_` and more). | A mistake in another product's grants or a leaked service key touches J8NIX data too. | Move J8NIX to its own Supabase project before customer #2 (step 3). |
| 2 | Workers (scheduled tasks) write with the service key, which skips RLS. | A worker bug could write into the wrong team. | Every worker call passes `org_id` explicitly; add a check trigger that the row's `org_id` matches the worker's assigned team (step 2). |
| 3 | Some policies are granted to `public` (anon + authenticated) instead of `authenticated` (`j8_tasks`, `j8_plans`, `j8_routines`, `j8_memory`). They are safe today because `has_role` returns false without a user. | A future policy edit could forget the role check. | Re-grant those policies to `authenticated` only (step 1). |
| 4 | `j8_files` has RLS on and no policy (nobody but the service key can read it). | Safe, but files cannot be shown per team yet. | Add `org_id` + `has_role` policy when files ship in the app. |
| 5 | Leaked-password protection is off in Supabase Auth. The J8NIX app signs in by email code, but all 3 member accounts also have a password set (`auth.users`), and `j8_invites.keep_password` exists. | A reused, leaked password could open a J8NIX account. | Dashboard toggle (Auth → Passwords, needs the Pro plan) or remove passwords from J8NIX accounts. Needs Dave. |
| 6 | The opt-out check runs on INSERT only, skips label 'Template', only checks drafts whose `channel` holds an email address (so many LinkedIn/message drafts are not checked), and lets a draft through if contact parsing throws. Replies add only the email address to `j8_optout`; domains are added by hand. | A changed `to`, a non-email draft or an odd address could reach someone who said stop. | Run the trigger on UPDATE OF "to" too, match LinkedIn/profile links as well as emails, and refuse (not allow) when parsing fails for an outreach kind. |

## Steps, in order

1. **Tighten roles (DB only, no app change).** Re-create the `public`-role policies on the four tables above for `authenticated`. Test: rolled-back DO block, anon sees 0 rows, member still reads.
2. **Worker guard.** Trigger on worker-written tables (`j8_approvals`, `j8_runs`, `j8_tasks`, `j8_outcomes`): when `auth.uid()` is null, `org_id` must be in a small allow-list table `j8private.worker_orgs`. Test with a wrong `org_id` → refused.
3. **Own project for J8NIX.** New Supabase project in the same region (ap-southeast-1), copy `j8_*` + `j8private` schema with migrations, move data with `pg_dump --table 'j8_*'`, switch `SB_URL`/`SB_KEY` in `j8/j8-data.js`, keep the old tables read-only for 14 days, then drop. Needs Dave's OK (it is a new project; cost may change).
4. **Per-customer check.** Before each new team: run the anon test and a cross-team test (user of team A reads team B → 0 rows) and keep the result in `j8_runs`.

## How to check it any time

```sql
-- no J8NIX function callable signed out (expect true)
select not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname like 'j8\_%' and p.prosecdef
    and has_function_privilege('anon', p.oid, 'execute'));
-- signed out sees nothing (expect 0; tables anon has no grant on raise "permission denied", which is also a pass)
begin; set local role anon;
select (select count(*) from j8_memory), (select count(*) from j8_plans), (select count(*) from j8_routines), (select count(*) from j8_calendar), (select count(*) from j8_requests);
rollback;
```
