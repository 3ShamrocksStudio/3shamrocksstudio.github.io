-- J8NIX 15.9.0 · backlog r-1125-01 "Stall alarm for stuck sends" (26 Nov 2026)
-- An item Dave approved that has not gone out 6 h after approval (or after its hold ends) is "stuck".
-- Every 15 min (pg_cron j8_stall_tick) each newly stuck item gets one alert row (j8private.stall_alerts) and each org gets
-- ONE grouped push (j8private.push_outbox): count + oldest age only, never a name, address or link.
-- Same base as the MVP gate no_stuck: status approved/edited, not template/design, no sent_at.
-- Quiet hours (23-07 Israel) and Shabbat: nothing is raised; it fires on the first tick after. A paused org is skipped.
-- No new data about end users; j8_approvals is only read.
-- Rollback: select cron.unschedule('j8_stall_tick'); drop function j8private.stall_tick(timestamptz);
--           drop function j8private.stall_items(timestamptz); drop table j8private.stall_alerts;

create table j8private.stall_alerts (
  org_id uuid not null,
  approval_id text not null,
  approved_at timestamptz not null,
  alerted_at timestamptz not null default now(),
  primary key (org_id, approval_id, approved_at)
);
alter table j8private.stall_alerts enable row level security;
revoke all on j8private.stall_alerts from public, anon, authenticated;

create or replace function j8private.stall_items(p_now timestamptz default now())
returns table (org_id uuid, approval_id text, approved_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select a.org_id, a.id,
         greatest(j8private.ts(a.decided_at), coalesce(j8private.ts(a.hold_until), '-infinity'::timestamptz))
    from public.j8_approvals a
   where a.status in ('approved', 'edited')
     and coalesce(a.kind, '') not in ('template', 'design') and coalesce(a.label, '') <> 'Template'
     and j8private.ts(a.sent_at) is null and j8private.ts(a.decided_at) is not null
     and greatest(j8private.ts(a.decided_at), coalesce(j8private.ts(a.hold_until), '-infinity'::timestamptz)) < p_now - interval '6 hours'
     and not exists (select 1 from public.j8_control c where c.org_id = a.org_id and c.id = 'main' and c.paused)
$$;

create or replace function j8private.stall_tick(p_now timestamptz default now())
returns integer
language plpgsql security definer set search_path = '' as $$
declare il timestamp := p_now at time zone 'Asia/Jerusalem'; d int := extract(dow from il); h int := extract(hour from il);
  n int := 0; k int; tot int; old timestamptz; sec numeric; ag text; o uuid;
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
      insert into j8private.push_outbox (org_id, kind, title, body, url, tag)
        values (o, 'stall', '🟠 Approved, not sent yet',
                case when tot = 1 then '1 approved item has not gone out' else tot || ' approved items have not gone out' end
                  || '. Oldest: ' || ag || '. Check the sender, or send it by hand.',
                './', 'stall');
      n := n + k;
    end if;
  end loop;
  if n > 0 and coalesce(current_setting('j8.no_push', true), '') <> 'on' then perform j8private.push_kick(); end if;
  return n;
end $$;

revoke all on function j8private.stall_items(timestamptz) from public, anon, authenticated;
revoke all on function j8private.stall_tick(timestamptz) from public, anon, authenticated;

select cron.schedule('j8_stall_tick', '4,19,34,49 * * * *', 'select j8private.stall_tick()');
