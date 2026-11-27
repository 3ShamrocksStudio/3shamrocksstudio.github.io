-- b-1127-01 (28 Nov 2026): show the real state of every scheduled worker.
-- j8_schedule mirrors the account's scheduled tasks. A session that can call list_triggers passes the whole list to
-- j8private.schedule_sync(org, jsonb). Live tasks (enabled, or held by the platform: suspension_reason set) get one row
-- each; every other trig_ row of the org is hidden. want_enabled follows enabled only when no switch request is pending,
-- so a sync never creates a request for the Inbox watcher. The stall alarm names "Mac away" when the sender is held.
-- Rollback: drop function j8private.schedule_sync(uuid, jsonb); drop function j8private.sched_held(uuid, text);
--           alter table public.j8_schedule drop column suspension_reason, drop column synced_at;
--           restore j8private.stall_tick from j8_stall_alarm.sql.

alter table public.j8_schedule add column if not exists suspension_reason text, add column if not exists synced_at timestamptz;
grant select (suspension_reason, synced_at) on public.j8_schedule to authenticated; /* the app reads j8_schedule with select('*') */

create or replace function j8private.schedule_sync(p_org uuid, p_tasks jsonb)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare t jsonb; live text[] := '{}'; ins int := 0; upd int := 0; hid int := 0; en boolean; sus text; st text; rid text; rname text; rsch text; rwhat text; had boolean; mx int;
begin
  if p_org is null or jsonb_typeof(p_tasks) <> 'array' or jsonb_array_length(p_tasks) = 0 then raise exception 'schedule_sync: need org and a non-empty task list'; end if;
  select coalesce(max(sort), 0) into mx from public.j8_schedule where org_id = p_org;
  for t in select * from jsonb_array_elements(p_tasks) loop
    if coalesce(t->>'id', '') !~ '^trig_[A-Za-z0-9]+$' then continue; end if;
    en := coalesce((t->>'enabled')::boolean, false);
    sus := nullif(btrim(coalesce(t->>'suspension_reason', '')), '');
    if not en and sus is null then continue; end if; /* user-paused or finished: not live */
    live := live || (t->>'id');
    st := case when t->>'last_run_status' ilike 'SUCCEEDED%' then 'ok' when t->>'last_run_status' ilike 'FAILED%' then 'failed'
               when t->>'last_run_status' ilike 'PENDING%' or t->>'last_run_status' ilike 'RUNNING%' then 'running' else null end;
    rid := null; rname := null; rsch := null; rwhat := null;
    select x.id, x.name, x.schedule, x.what into rid, rname, rsch, rwhat from public.j8_routines x where x.org_id = p_org and x.trigger_id = t->>'id' limit 1;
    had := exists (select 1 from public.j8_schedule where org_id = p_org and id = t->>'id');
    if not had then
      mx := mx + 1;
      insert into public.j8_schedule (org_id, id, name, when_text, cron, enabled, want_enabled, next_run_at, last_run_at, last_status, locked, note, sort, hidden, by, suspension_reason, synced_at, extra, version)
      values (p_org, t->>'id', coalesce(rname, t->>'name'), coalesce(rsch, nullif(t->>'cron_expression', ''), t->>'run_once_at'), nullif(t->>'cron_expression', ''), en, en,
              coalesce(t->>'next_run_at', t->>'run_once_at'), coalesce(t->>'last_run_fired_at', t->>'last_fired_at'), st, false, rwhat, mx, false, 'schedule sync', sus, now(),
              jsonb_build_object('routine_id', rid, 'task_name', t->>'name'), 1);
      ins := ins + 1;
    else
      update public.j8_schedule s set
        enabled = en,
        want_enabled = case when s.want_enabled is not distinct from s.enabled then en else s.want_enabled end, /* keep a pending request */
        cron = coalesce(nullif(t->>'cron_expression', ''), s.cron),
        next_run_at = coalesce(t->>'next_run_at', t->>'run_once_at', s.next_run_at),
        last_run_at = coalesce(t->>'last_run_fired_at', t->>'last_fired_at', s.last_run_at),
        last_status = coalesce(st, s.last_status),
        hidden = false, suspension_reason = sus, synced_at = now(),
        extra = coalesce(s.extra, '{}'::jsonb) || jsonb_build_object('routine_id', rid, 'task_name', t->>'name')
      where s.org_id = p_org and s.id = t->>'id';
      upd := upd + 1;
    end if;
  end loop;
  if cardinality(live) = 0 then raise exception 'schedule_sync: no live task in the list'; end if;
  /* everything else is not a live task: hide it; mirror the real enabled when the snapshot has it */
  for t in select * from jsonb_array_elements(p_tasks) loop
    if not (t->>'id' = any(live)) then
      update public.j8_schedule s set hidden = true, suspension_reason = null, synced_at = now(),
        enabled = coalesce((t->>'enabled')::boolean, s.enabled),
        want_enabled = case when s.want_enabled is not distinct from s.enabled then coalesce((t->>'enabled')::boolean, s.enabled) else s.want_enabled end
      where s.org_id = p_org and s.id = t->>'id' and not (s.hidden is true and s.suspension_reason is null and s.enabled is not distinct from coalesce((t->>'enabled')::boolean, s.enabled));
    end if;
  end loop;
  update public.j8_schedule s set hidden = true, suspension_reason = null, synced_at = now()
   where s.org_id = p_org and s.id like 'trig\_%' and not (s.id = any(live)) and s.hidden is not true;
  select count(*) into hid from public.j8_schedule where org_id = p_org and hidden;
  return jsonb_build_object('live', cardinality(live), 'inserted', ins, 'updated', upd, 'hidden_total', hid);
end $$;
revoke all on function j8private.schedule_sync(uuid, jsonb) from public, anon, authenticated;

/* the platform hold on the worker linked to a routine id, only when synced in the last 48 h (stale data never alarms) */
create or replace function j8private.sched_held(p_org uuid, p_routine text)
returns text language sql stable security definer set search_path to '' as $$
  select s.suspension_reason from public.j8_schedule s join public.j8_routines r on r.org_id = s.org_id and r.trigger_id = s.id
   where s.org_id = p_org and r.id = p_routine and not coalesce(s.hidden, false) and s.suspension_reason is not null
     and s.synced_at > now() - interval '48 hours'
   limit 1
$$;
revoke all on function j8private.sched_held(uuid, text) from public, anon, authenticated;

create or replace function j8private.stall_tick(p_now timestamptz default now())
returns integer language plpgsql security definer set search_path to '' as $function$
declare il timestamp := p_now at time zone 'Asia/Jerusalem'; d int := extract(dow from il); h int := extract(hour from il);
  n int := 0; k int; tot int; old timestamptz; sec numeric; ag text; o uuid; held text;
begin
  if h >= 23 or h < 7 or (d = 5 and h >= 16) or (d = 6 and h < 19) then return 0; end if;
  for o in select distinct s.org_id from j8private.stall_items(p_now) s loop
    insert into j8private.stall_alerts (org_id, approval_id, approved_at, alerted_at)
      select s.org_id, s.approval_id, s.approved_at, p_now from j8private.stall_items(p_now) s where s.org_id = o
      on conflict do nothing;
    get diagnostics k = row_count;
    if k > 0 then
      select count(*), min(s.approved_at) into tot, old from j8private.stall_items(p_now) s where s.org_id = o;
      sec := extract(epoch from (p_now - old));
      ag := case when sec < 172800 then floor(sec / 3600)::int || ' h' else floor(sec / 86400)::int || ' days' end;
      held := j8private.sched_held(o, 'sender');
      insert into j8private.push_outbox (org_id, kind, title, body, url, tag)
        values (o, 'stall', case when held = 'device_absent' then '🟠 Not sent yet · Mac away' else '🟠 Approved, not sent yet' end,
                case when tot = 1 then '1 approved item has not gone out' else tot || ' approved items have not gone out' end
                  || '. Oldest: ' || ag || '. '
                  || case when held = 'device_absent' then 'Mac away: the sender runs on your Mac and it is not reachable. Open the Claude app on the Mac, or send it by hand.'
                          when held is not null then 'The sender is on hold (' || held || '). Send it by hand for now.'
                          else 'Check the sender, or send it by hand.' end,
                './', 'stall');
      n := n + k;
    end if;
  end loop;
  if n > 0 and coalesce(current_setting('j8.no_push', true), '') <> 'on' then perform j8private.push_kick(); end if;
  return n;
end $function$;
revoke all on function j8private.stall_tick(timestamptz) from public, anon, authenticated;
