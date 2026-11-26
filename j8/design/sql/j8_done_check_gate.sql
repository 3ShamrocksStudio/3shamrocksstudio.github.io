-- J8NIX done-check gate (u-1126-02, 26 Nov 2026). NOT APPLIED YET: migration j8_tasks_done_check_gate waits for approval.
-- Every j8_tasks row carries extra.done_check: one SELECT that returns true only when the result really exists.
-- A move to status 'done' runs the check in a read-only subtransaction; false or an error refuses the update.
-- Agents (no sign-in) cannot add, change or remove a done_check once a task exists; the app may only use the default.
-- The check gets $1 = task id, $2 = org id, $3 = the new row as jsonb (so a result/evidence written in the same update counts).
-- j8private.guard_human_only() is untouched; this is a separate trigger.
-- Rollback: drop trigger j8_tasks_done_gate on public.j8_tasks; drop function j8private.task_done_gate();
--           drop function j8private.done_check_default(); update public.j8_tasks set extra = extra - 'done_check' - 'done_check_kind';

create or replace function j8private.done_check_default() returns text
language sql immutable set search_path = '' as
$f$ select 'select auth.uid() is not null and j8private.has_role($2, ''member'')'::text $f$;

create or replace function j8private.task_done_gate() returns trigger
language plpgsql
set search_path = ''
as $f$
declare
  uid uuid := auth.uid();
  def text := j8private.done_check_default();
  chk text;
  ok boolean;
  why text;
begin
  -- 1. Who may set or change the check
  if tg_op = 'INSERT' then
    if coalesce(new.extra, '{}'::jsonb) ? 'done_check' then
      if uid is not null and new.extra->>'done_check' is distinct from def then
        raise exception 'A task made in the app uses the standard done-check (a member ticks it)' using errcode = '42501';
      end if;
    else
      new.extra := coalesce(new.extra, '{}'::jsonb)
        || jsonb_build_object('done_check', def, 'done_check_kind', 'person');
    end if;
  else
    if (new.extra->'done_check') is distinct from (old.extra->'done_check')
       or (new.extra->'done_check_kind') is distinct from (old.extra->'done_check_kind') then
      raise exception 'A task''s done-check cannot be changed after the task exists' using errcode = '42501';
    end if;
  end if;

  chk := coalesce(new.extra->>'done_check', def);

  -- 2. Shape of a custom check: one SELECT (or WITH ... SELECT), no statement separator
  if chk is distinct from def and (chk !~* '^\s*(select|with)\s' or position(';' in chk) > 0) then
    raise exception 'A done-check must be one SELECT statement' using errcode = '22023';
  end if;

  -- 3. Decide whether the check must run now
  if tg_op = 'INSERT' and coalesce(new.status, 'open') = 'open' and chk is distinct from def then
    null; -- a new open task with a custom check: it must be FALSE now (else it proves nothing)
  elsif new.status = 'done' and (tg_op = 'INSERT' or old.status is distinct from 'done') then
    null; -- moving to done: it must be TRUE
  else
    return new;
  end if;

  -- 4. Run the check read-only in a subtransaction; the GUC change is undone when the subtransaction ends
  begin
    perform set_config('transaction_read_only', 'on', true);
    begin
      execute 'select (' || chk || ')::boolean' into ok using new.id, new.org_id, to_jsonb(new);
    exception when others then
      ok := null; why := sqlerrm;
    end;
    raise exception using errcode = 'J8DC0', message = coalesce(ok::text, 'null');
  exception when sqlstate 'J8DC0' then
    null;
  end;

  if tg_op = 'INSERT' and coalesce(new.status, 'open') = 'open' then
    if ok is true then
      raise exception 'This done-check is already true for a new open task, so it proves nothing' using errcode = '23514';
    end if;
    return new;
  end if;

  if ok is not true then
    raise exception 'Not done yet: the done-check for % is not true', new.id
      using errcode = '23514',
            detail = coalesce(new.extra->>'done_check_kind', 'person') || coalesce(' · check failed: ' || why, ''),
            hint = 'Do the work, then record the proof the check reads (see extra.done_check).';
  end if;
  return new;
end $f$;

revoke all on function j8private.task_done_gate() from public, anon, authenticated;

-- Backfill every open task (all businesses) before the trigger exists
with k as (
  select t.org_id, t.id,
    case
      when t.id in ('u-1126-02','u-1126-07','b-1125-07','b-1125-08','r-1125-03','b-1125-22','r-1125-01') then 'database'
      when t.owner = 'dave' or t.id = 't-testers-lanes-blocked' then 'person'
      when t.source = 'backlog-1125'
        or t.id in ('t-shomer-gender-onmyway','t-shomer-nearby-claim','t-sec-public-gmail','geo-1126-01','geo-1126-02',
                    't-pb-gumroad-launch','t-pb-sprint-page') then 'shipped'
      else 'proof-link'
    end as kind
  from public.j8_tasks t
  where t.status = 'open' and not (coalesce(t.extra, '{}'::jsonb) ? 'done_check')
),
c as (
  select k.org_id, k.id, k.kind,
    case k.kind
      when 'person' then j8private.done_check_default()
      when 'shipped' then $c$select (auth.uid() is not null and j8private.has_role($2, 'member')) or (coalesce($3->'extra'->>'result', '') ~ '\m(?=[0-9a-f]*[0-9])[0-9a-f]{7,40}\M' and coalesce($3->'extra'->>'result', '') ~ 'PASS')$c$
      when 'proof-link' then $c$select (auth.uid() is not null and j8private.has_role($2, 'member')) or coalesce($3->'extra'->>'evidence', '') ~ '^https://\S+$'$c$
      else case k.id
        when 'u-1126-02' then $c$select not exists (select 1 from public.j8_tasks t where t.status = 'open' and not (coalesce(t.extra, '{}'::jsonb) ? 'done_check')) and exists (select 1 from pg_catalog.pg_trigger g where g.tgrelid = 'public.j8_tasks'::regclass and g.tgname = 'j8_tasks_done_gate' and g.tgenabled <> 'D') and coalesce($3->'extra'->>'result', '') ~ 'PASS'$c$
        when 'u-1126-07' then $c$select (select count(*) from public.j8_evals) >= 20 and coalesce($3->'extra'->>'result', '') ~ 'PASS'$c$
        when 'b-1125-07' then $c$select (select count(*) from information_schema.columns c where c.table_schema = 'public' and c.table_name = 'j8_runs' and c.column_name in ('duration_s','moved','items_sent','failure_reason')) = 4 and coalesce($3->'extra'->>'result', '') ~ 'PASS'$c$
        when 'b-1125-08' then $c$select not exists (select 1 from pg_catalog.pg_tables p where p.schemaname = 'public' and not p.rowsecurity) and coalesce($3->'extra'->>'result', '') ~ 'PASS'$c$
        when 'r-1125-03' then $c$select not exists (select 1 from pg_catalog.pg_proc p join pg_catalog.pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname like 'j8\_%' and p.prosecdef and has_function_privilege('anon', p.oid, 'execute')) and coalesce($3->'extra'->>'result', '') ~ 'PASS'$c$
        when 'b-1125-22' then $c$select to_regclass('public.j8_receipts') is not null and coalesce($3->'extra'->>'result', '') ~ 'PASS'$c$
        when 'r-1125-01' then $c$select not exists (select 1 from public.j8_approvals a where a.org_id = $2 and a.status in ('approved','edited') and a.sent_at is null and a.decided_at ~ '^\d{4}-\d{2}-\d{2}' and a.decided_at::timestamptz between now() - interval '7 days' and now() - interval '24 hours') and coalesce($3->'extra'->>'result', '') ~ 'PASS'$c$
      end
    end as chk
  from k
)
update public.j8_tasks t
   set extra = coalesce(t.extra, '{}'::jsonb) || jsonb_build_object('done_check', c.chk, 'done_check_kind', c.kind)
  from c
 where t.org_id = c.org_id and t.id = c.id;

drop trigger if exists j8_tasks_done_gate on public.j8_tasks;
create trigger j8_tasks_done_gate before insert or update on public.j8_tasks
  for each row execute function j8private.task_done_gate();
