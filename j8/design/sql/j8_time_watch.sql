-- J8NIX 15.12.0 · backlog b-1125-24 "Time engine", slice 2 (26 Nov 2026): missed-run report + follow-up due alert.
-- j8_routines.extra.cron holds each routine's schedule (5-field cron, optional "CRON_TZ=<zone> " prefix), copied read-only from
-- the live scheduled tasks; extra.logs = 'always' marks routines that write a j8_runs row on every fire (only those can be
-- checked honestly: others stop silently when there is no work). extra.watch_from = when watching began (no alerts for older fires).
-- Every 15 min (pg_cron j8_time_tick):
--   * a fire 4-48 h ago with no j8_runs row of that arm from 60 min before to 4 h after it is "missed": the routine's
--     extra.missed lists it (the app shows it in Agents) and each missed fire raises one alert, grouped into one push per org;
--   * Sun-Thu from 09:00 Israel time, once a day, one push per org with the COUNT of follow-ups due (same rule as the app's
--     Today list: sent, extra.followup_after <= today, not 'none', no replied_at, no outcome). Never a name, address or link.
-- Quiet hours (23-07 Israel) and Shabbat (Fri 16:00 - Sat 19:00): no alerts (they fire on the first tick after). Paused org: skipped.
-- No new data about end users: j8_approvals and j8_runs are only read; j8_routines.extra.missed is written.
-- Rollback: select cron.unschedule('j8_time_tick'); drop function j8private.time_tick(timestamptz);
--   drop function j8private.missed_fires(uuid, timestamptz); drop function j8private.cron_ok(text, timestamptz);
--   drop function j8private.cron_part_ok(text, int, int, int); drop table j8private.time_alerts;

create table if not exists j8private.time_alerts (
  org_id uuid not null,
  kind text not null,
  key text not null,
  alerted_at timestamptz not null default now(),
  primary key (org_id, kind, key)
);
alter table j8private.time_alerts enable row level security;
revoke all on j8private.time_alerts from public, anon, authenticated;

-- one cron field: '*', 'n', 'a-b', '*/s', 'a-b/s', 'n/s', comma lists
create or replace function j8private.cron_part_ok(p_field text, p_v int, p_lo int, p_hi int)
returns boolean language plpgsql immutable set search_path = '' as $$
declare part text; base text; st int; a int; b int;
begin
  foreach part in array string_to_array(coalesce(p_field, ''), ',') loop
    st := 1; base := part;
    if position('/' in part) > 0 then base := split_part(part, '/', 1); st := greatest(1, split_part(part, '/', 2)::int); end if;
    if base = '*' then a := p_lo; b := p_hi;
    elsif position('-' in base) > 0 then a := split_part(base, '-', 1)::int; b := split_part(base, '-', 2)::int;
    else a := base::int; b := case when position('/' in part) > 0 then p_hi else a end; end if;
    if p_v between a and b and (p_v - a) % st = 0 then return true; end if;
  end loop;
  return false;
exception when others then return false;
end $$;

-- does this cron fire at this minute? (standard rule: if both day-of-month and day-of-week are set, either may match)
create or replace function j8private.cron_ok(p_cron text, p_at timestamptz)
returns boolean language plpgsql stable set search_path = '' as $$
declare c text := btrim(coalesce(p_cron, '')); tz text := 'UTC'; f text[]; l timestamp; dm boolean; dw boolean; dow int;
begin
  if c ~ '^CRON_TZ=\S+\s' then tz := substring(c from '^CRON_TZ=(\S+)'); c := btrim(regexp_replace(c, '^CRON_TZ=\S+\s+', '')); end if;
  f := regexp_split_to_array(c, '\s+');
  if array_length(f, 1) <> 5 then return false; end if;
  l := p_at at time zone tz;
  if not j8private.cron_part_ok(f[1], extract(minute from l)::int, 0, 59) then return false; end if;
  if not j8private.cron_part_ok(f[2], extract(hour from l)::int, 0, 23) then return false; end if;
  if not j8private.cron_part_ok(f[4], extract(month from l)::int, 1, 12) then return false; end if;
  dow := extract(dow from l)::int;
  dm := j8private.cron_part_ok(f[3], extract(day from l)::int, 1, 31);
  dw := j8private.cron_part_ok(f[5], dow, 0, 7) or (dow = 0 and j8private.cron_part_ok(f[5], 7, 0, 7));
  if f[3] <> '*' and f[5] <> '*' then return dm or dw; end if;
  return dm and dw;
exception when others then return false;
end $$;

create or replace function j8private.missed_fires(p_org uuid, p_now timestamptz default now())
returns table (routine_id text, name text, fire timestamptz)
language sql stable security definer set search_path = '' as $$
  select r.id, coalesce(nullif(r.name, ''), r.id), g.fire
    from public.j8_routines r
    cross join lateral (
      select gs as fire
        from generate_series(date_trunc('minute', p_now - interval '48 hours'), p_now - interval '4 hours', interval '1 minute') gs
       where j8private.cron_ok(r.extra->>'cron', gs)) g
   where r.org_id = p_org and r.enabled and r.extra->>'logs' = 'always' and coalesce(r.extra->>'cron', '') <> ''
     and g.fire >= coalesce(j8private.ts(r.extra->>'watch_from'), '-infinity'::timestamptz)
     and not exists (
       select 1 from public.j8_runs x
        where x.org_id = r.org_id
          and lower(regexp_replace(coalesce(x.arm, ''), '[^a-zA-Z0-9]+', '', 'g'))
              in (lower(regexp_replace(coalesce(r.arm, ''), '[^a-zA-Z0-9]+', '', 'g')), lower(regexp_replace(r.id, '[^a-zA-Z0-9]+', '', 'g')))
          and (j8private.ts(x.started) between g.fire - interval '60 minutes' and g.fire + interval '4 hours'
               or x.updated_at between g.fire - interval '60 minutes' and g.fire + interval '4 hours'))
$$;

create or replace function j8private.time_tick(p_now timestamptz default now())
returns integer
language plpgsql security definer set search_path = '' as $$
declare il timestamp := p_now at time zone 'Asia/Jerusalem'; d int := extract(dow from il); h int := extract(hour from il);
  quiet boolean := h >= 23 or h < 7 or (d = 5 and h >= 16) or (d = 6 and h < 19);
  today text := to_char(il, 'YYYY-MM-DD'); o uuid; rr record; arr jsonb; k int; n int := 0; due int; nm text; first_fire timestamptz;
begin
  for o in select g.id from public.j8_orgs g
            where not exists (select 1 from public.j8_control c where c.org_id = g.id and c.id = 'main' and c.paused) loop
    -- 1. missed runs: keep each watched routine's extra.missed true (written only when it changes)
    for rr in select r.id, r.extra from public.j8_routines r where r.org_id = o and r.extra ? 'cron' loop
      select coalesce(jsonb_agg(to_char(m.fire at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') order by m.fire), '[]'::jsonb) into arr
        from j8private.missed_fires(o, p_now) m where m.routine_id = rr.id;
      if arr = '[]'::jsonb and rr.extra ? 'missed' then
        update public.j8_routines set extra = extra - 'missed' where org_id = o and id = rr.id;
      elsif arr <> '[]'::jsonb and (rr.extra->'missed') is distinct from arr then
        update public.j8_routines set extra = extra || jsonb_build_object('missed', arr) where org_id = o and id = rr.id;
      end if;
    end loop;
    if not quiet then
      insert into j8private.time_alerts (org_id, kind, key, alerted_at)
        select o, 'missed', m.routine_id || '@' || to_char(m.fire at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI"Z"'), p_now
          from j8private.missed_fires(o, p_now) m
        on conflict do nothing;
      get diagnostics k = row_count;
      if k > 0 then
        select string_agg(distinct m.name, ', '), min(m.fire) into nm, first_fire from j8private.missed_fires(o, p_now) m
         where exists (select 1 from j8private.time_alerts t where t.org_id = o and t.kind = 'missed' and t.alerted_at = p_now
                         and t.key = m.routine_id || '@' || to_char(m.fire at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI"Z"'));
        insert into j8private.push_outbox (org_id, kind, title, body, url, tag)
          values (o, 'missed', case when k = 1 then '🔴 A routine missed its run' else '🔴 ' || k || ' routine runs missed' end,
                  left(coalesce(nm, 'A routine'), 80) || case when k = 1 then ' did not run at ' || to_char(first_fire at time zone 'Asia/Jerusalem', 'HH24:MI') else ' did not run on time' end
                    || '. See Agents in J8NIX.', './', 'missed');
        n := n + k;
      end if;
      -- 2. follow-ups due: once a day, Sun-Thu, from 09:00 Israel time
      if d between 0 and 4 and h >= 9 then
        select count(*) into due from public.j8_approvals a
         where a.org_id = o and a.status = 'sent'
           and coalesce(a.extra->>'followup_after', '') ~ '^\d{4}-\d{2}-\d{2}$' and a.extra->>'followup_after' <= today
           and coalesce(a.extra->>'followup', '') <> 'none'
           and coalesce(a.extra->>'replied_at', '') = '' and coalesce(a.extra->>'outcome', '') = '';
        if due > 0 then
          insert into j8private.time_alerts (org_id, kind, key, alerted_at) values (o, 'followup', today, p_now) on conflict do nothing;
          get diagnostics k = row_count;
          if k > 0 then
            insert into j8private.push_outbox (org_id, kind, title, body, url, tag)
              values (o, 'followup', '🟠 Follow-ups due today',
                      case when due = 1 then '1 sent item is' else due || ' sent items are' end
                        || ' due a follow-up. Open Today to follow up, hold or close them.', './', 'followup');
            n := n + 1;
          end if;
        end if;
      end if;
    end if;
  end loop;
  if n > 0 and coalesce(current_setting('j8.no_push', true), '') <> 'on' then perform j8private.push_kick(); end if;
  return n;
end $$;

revoke all on function j8private.cron_part_ok(text, int, int, int) from public, anon, authenticated;
revoke all on function j8private.cron_ok(text, timestamptz) from public, anon, authenticated;
revoke all on function j8private.missed_fires(uuid, timestamptz) from public, anon, authenticated;
revoke all on function j8private.time_tick(timestamptz) from public, anon, authenticated;

-- APPLIED 27 Nov 2026 06:3x UTC (migration j8_time_tick_schedule) after rolled-back tests T1-T26 passed
-- (cron parse incl. CRON_TZ/steps/lists/dow 7, missed vs logged run, watch_from, disabled + when_work skipped,
--  one push per tick, dedupe, Friday-evening quiet, missed clears when covered, no follow-up push on Saturday, no client-role execute):
select cron.schedule('j8_time_tick', '9,24,39,54 * * * *', 'select j8private.time_tick()');
-- Rollback: select cron.unschedule('j8_time_tick');

-- Data (3shamrocks org, applied 27 Nov 2026 with execute_sql): cron copied read-only from the live scheduled tasks;
--   logs 'always' = focus, income-hunter, learn-study (write a run row every fire); 'when_work' = builder, sender, client-hunter, inbox-keeper
--   (only display, never alarmed); health + inbox have no matching scheduled task found, so no cron. watch_from = apply time (no backfill alarms).
-- update public.j8_routines set extra = extra || jsonb_build_object('cron', <cron>, 'logs', <'always'|'when_work'|'never'>, 'watch_from', now()::text) where org_id = <org> and id = <id>;
