-- J8NIX backlog r-1125-02 slice 1 (27 Nov 2026): kill reasons + lane stats.
-- NOT APPLIED YET (27 Nov run: Supabase asked for a confirmation nobody answered). Apply as migration r1125_02_kill_reasons_lanes.
-- 1) A kill always says why. extra.kill_reason is a short code from the app (who, where, words, when, dup, gone, worth, other)
--    or free text from a team run. Automated sessions (no auth.uid) cannot kill without a reason; Dave's app kill can add it
--    right after (one tap in the toast). A kill stamps extra.killed_at; leaving killed (Undo) clears the kill_* keys.
-- 2) public.j8_kill_reason(org, id, reason): sets the reason on a killed row in one atomic jsonb merge (security invoker, RLS).
-- 3) public.j8_lanes (security_invoker): per lane (template, or "(kind)" when none) and engine.
-- Rollback:
--   drop trigger if exists j8_approvals_kill_reason on public.j8_approvals;
--   drop function if exists j8private.kill_reason_stamp();
--   drop function if exists public.j8_kill_reason(uuid, text, text);
--   drop view if exists public.j8_lanes;

create or replace function j8private.kill_reason_stamp()
returns trigger language plpgsql set search_path to 'public', 'pg_temp' as $$
declare uid uuid := auth.uid(); r text; was boolean;
begin
  was := TG_OP = 'UPDATE' and old.status = 'killed';
  if new.status = 'killed' then
    r := nullif(btrim(coalesce(new.extra->>'kill_reason', '')), '');
    if r is not null and length(r) > 500 then raise exception 'kill_reason is too long (500 characters at most)'; end if;
    if not was then
      if r is null and uid is null then
        raise exception 'Say why it is killed: set extra.kill_reason (who, where, words, when, dup, gone, worth, other, or a short sentence)';
      end if;
      new.extra := coalesce(new.extra, '{}'::jsonb) || jsonb_build_object('killed_at', now()::text);
    end if;
    if r is not null and (not was or (old.extra->>'kill_reason') is distinct from (new.extra->>'kill_reason')) then
      new.extra := coalesce(new.extra, '{}'::jsonb) || jsonb_build_object('kill_reason_by', case when uid is null then 'team' else 'app' end);
    end if;
  elsif was then
    new.extra := coalesce(new.extra, '{}'::jsonb) - 'kill_reason' - 'kill_note' - 'killed_at' - 'kill_reason_by';
  end if;
  return new;
end $$;
revoke all on function j8private.kill_reason_stamp() from public, anon, authenticated;

drop trigger if exists j8_approvals_kill_reason on public.j8_approvals;
create trigger j8_approvals_kill_reason before insert or update on public.j8_approvals
  for each row execute function j8private.kill_reason_stamp();

create or replace function public.j8_kill_reason(p_org uuid, p_id text, p_reason text)
returns boolean language plpgsql security invoker set search_path to 'public', 'pg_temp' as $$
declare n int;
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  if coalesce(p_reason, '') not in ('who', 'where', 'words', 'when', 'dup', 'gone', 'worth', 'other') then raise exception 'unknown reason'; end if;
  update public.j8_approvals set extra = coalesce(extra, '{}'::jsonb) || jsonb_build_object('kill_reason', p_reason)
   where org_id = p_org and id = p_id and status = 'killed';
  get diagnostics n = row_count;
  return n = 1;
end $$;
revoke all on function public.j8_kill_reason(uuid, text, text) from public, anon;
grant execute on function public.j8_kill_reason(uuid, text, text) to authenticated;

create or replace view public.j8_lanes with (security_invoker = true) as
with base as (
  select a.org_id,
    coalesce(nullif(a.product, ''), '(none)') as engine,
    coalesce(nullif(a.template_id, ''), '(' || coalesce(nullif(a.kind, ''), 'other') || ')') as lane,
    a.status,
    coalesce(j8private.ts(a.created), a.updated_at) as drafted_at,
    coalesce(j8private.ts(a.extra->>'killed_at'), j8private.ts(a.decided_at), case when a.status = 'killed' then a.updated_at end) as killed_at,
    coalesce(j8private.ts(a.sent_at), j8private.ts(a.decided_at)) as decided_at,
    nullif(btrim(coalesce(a.extra->>'kill_reason', '')), '') as reason,
    (a.status = 'sent' or o.sent_at is not null) as is_sent,
    (o.replied_at is not null or o.call_at is not null or o.proposal_at is not null or o.won_at is not null or o.paid_at is not null) as is_replied,
    ((o.replied_at is not null and coalesce(o.reply_kind, '') <> 'rejection') or o.call_at is not null or o.proposal_at is not null or o.won_at is not null or o.paid_at is not null) as is_positive
  from public.j8_approvals a
  left join public.j8_outcomes o on o.org_id = a.org_id and o.approval_id = a.id
  where coalesce(a.kind, '') <> 'template' and coalesce(a.label, '') <> 'Template'
), coded as (
  select b.*,
    case when b.status <> 'killed' then null
         when b.reason is null then 'none'
         when b.reason in ('who', 'where', 'words', 'when', 'dup', 'gone', 'worth', 'other') then b.reason
         when b.reason ~* '(closed|404|no longer|deadline|not found|expired)' then 'gone'
         when b.reason ~* '(already|duplicate|twice)' then 'dup'
         else 'other' end as code
  from base b
), d30 as (
  select * from coded where drafted_at >= now() - interval '30 days'
), rs as (
  select org_id, engine, lane, jsonb_object_agg(code, n) as reasons
  from (select org_id, engine, lane, code, count(*)::int as n from d30 where code is not null group by 1, 2, 3, 4) x
  group by 1, 2, 3
), tr as (
  select org_id, engine, lane,
    count(*) filter (where status = 'killed' and killed_at >= now() - interval '14 days')::int as killed_14,
    count(*) filter (where (status = 'killed' and killed_at >= now() - interval '14 days') or (status <> 'killed' and status <> 'pending' and decided_at >= now() - interval '14 days'))::int as decided_14,
    count(*) filter (where status = 'killed' and killed_at >= now() - interval '28 days' and killed_at < now() - interval '14 days')::int as killed_prev,
    count(*) filter (where (status = 'killed' and killed_at >= now() - interval '28 days' and killed_at < now() - interval '14 days') or (status <> 'killed' and status <> 'pending' and decided_at >= now() - interval '28 days' and decided_at < now() - interval '14 days'))::int as decided_prev
  from coded group by 1, 2, 3
), agg as (
  select org_id, engine, lane,
    count(*)::int as drafted,
    count(*) filter (where status <> 'pending' and status is not null)::int as decided,
    count(*) filter (where status = 'killed')::int as killed,
    count(*) filter (where status = 'killed' and code = 'none')::int as no_reason,
    count(*) filter (where is_sent)::int as sent,
    count(*) filter (where is_replied)::int as replied,
    count(*) filter (where is_positive)::int as positive
  from d30 group by 1, 2, 3
)
select g.org_id, g.engine, g.lane, g.drafted, g.decided, g.killed, g.no_reason, g.sent, g.replied, g.positive,
  coalesce(rs.reasons, '{}'::jsonb) as reasons,
  coalesce(tr.killed_14, 0) as killed_14, coalesce(tr.decided_14, 0) as decided_14,
  coalesce(tr.killed_prev, 0) as killed_prev, coalesce(tr.decided_prev, 0) as decided_prev,
  (g.decided >= 10 and g.killed * 10 >= g.decided * 6) as losing
from agg g
left join rs on rs.org_id = g.org_id and rs.engine = g.engine and rs.lane = g.lane
left join tr on tr.org_id = g.org_id and tr.engine = g.engine and tr.lane = g.lane;

revoke all on public.j8_lanes from public, anon;
grant select on public.j8_lanes to authenticated;
