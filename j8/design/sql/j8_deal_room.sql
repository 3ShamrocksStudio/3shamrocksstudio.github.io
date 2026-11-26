-- J8NIX 15.8.0 · backlog b-1125-25 "Deal room for warm replies" (26 Nov 2026)
-- A positive reply in j8_outcomes creates exactly one deal card (one per lead). Each card: stage, next step + due time,
-- offered slots, a prep brief (who, org, what they asked, what we sent) and a proof-pack checklist.
-- An overdue next step raises one alert (j8private.push_outbox) per due time, via pg_cron every 15 min.
-- No new data about end users: it reuses j8_leads / j8_outcomes / j8_approvals fields only.
-- Rollback: select cron.unschedule('j8_deal_tick'); drop trigger j8_outcomes_deal on public.j8_outcomes;
--           drop function j8private.deal_from_outcome(), j8private.deal_tick(timestamptz), j8private.workday_plus(timestamptz, int);
--           drop table public.j8_deals;

create table public.j8_deals (
  org_id uuid not null references public.j8_orgs(id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  lead_id text not null,
  approval_id text,
  product text,
  stage text not null default 'reply' check (stage in ('reply','demo_booked','demo_done','proposal','procurement','paid','lost')),
  next_step text check (next_step is null or length(next_step) <= 200),
  next_due_at timestamptz,
  slots jsonb not null default '[]'::jsonb check (jsonb_typeof(slots) = 'array'),
  brief jsonb not null default '{}'::jsonb check (jsonb_typeof(brief) = 'object'),
  proof jsonb not null default '[{"key":"data_flow","done":false,"link":null},{"key":"privacy","done":false,"link":null},{"key":"security","done":false,"link":null},{"key":"accessibility","done":false,"link":null}]'::jsonb check (jsonb_typeof(proof) = 'array'),
  alerted_due timestamptz,
  extra jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (org_id, id),
  unique (org_id, lead_id),
  foreign key (org_id, lead_id) references public.j8_leads(org_id, id) on delete cascade
);
comment on table public.j8_deals is 'J8NIX deal room (15.8.0): one card per lead with a positive reply. Created by trigger j8_outcomes_deal; edited by members in the app.';

alter table public.j8_deals enable row level security;
create policy j8_deals_read on public.j8_deals for select to authenticated using (j8private.has_role(org_id, 'viewer'));
create policy j8_deals_upd on public.j8_deals for update to authenticated using (j8private.has_role(org_id, 'member')) with check (j8private.has_role(org_id, 'member'));
revoke all on public.j8_deals from anon, authenticated;
grant select on public.j8_deals to authenticated;
grant update (stage, next_step, next_due_at, slots, proof) on public.j8_deals to authenticated;

create trigger j8_deals_bump before insert or update on public.j8_deals for each row execute function j8private.bump();
alter publication supabase_realtime add table public.j8_deals;

-- ts + n days at the same Israel clock time; a Friday or Saturday moves to Sunday
create or replace function j8private.workday_plus(p_ts timestamptz, p_days int)
returns timestamptz language sql immutable set search_path to '' as $$
  select case extract(dow from ((p_ts + make_interval(days => p_days)) at time zone 'Asia/Jerusalem'))
           when 5 then p_ts + make_interval(days => p_days + 2)
           when 6 then p_ts + make_interval(days => p_days + 1)
           else p_ts + make_interval(days => p_days) end
$$;

create or replace function j8private.deal_from_outcome()
returns trigger language plpgsql security definer set search_path to '' as $$
declare k text := lower(coalesce(new.reply_kind, '')); l record; subj text;
begin
  begin
    if new.lead_id is null then return null; end if;
    if k in ('reply','interview','call','proposal','meeting','demo','won') then
      select person, company, product into l from public.j8_leads where org_id = new.org_id and id = new.lead_id;
      select subject into subj from public.j8_approvals where org_id = new.org_id and id = new.approval_id;
      insert into public.j8_deals (org_id, lead_id, approval_id, product, stage, next_step, next_due_at, brief, extra)
      values (new.org_id, new.lead_id, new.approval_id, l.product,
              case when new.paid_at is not null then 'paid'
                   when k in ('proposal','won') or new.proposal_at is not null then 'proposal'
                   when k in ('call','interview','meeting','demo') or new.call_at is not null then 'demo_booked'
                   else 'reply' end,
              case when k in ('call','interview','meeting','demo') or new.call_at is not null then 'Prepare the demo'
                   when k in ('proposal','won') then 'Follow up on the proposal'
                   else 'Reply and book a demo' end,
              j8private.workday_plus(coalesce(new.replied_at, now()), 1),
              jsonb_strip_nulls(jsonb_build_object('who', nullif(l.person, ''), 'org', nullif(l.company, ''),
                                                   'asked', nullif(left(new.reply_snippet, 400), ''), 'sent', nullif(left(subj, 200), ''))),
              jsonb_build_object('from', 'outcome', 'reply_kind', k))
      on conflict (org_id, lead_id) do nothing;
    elsif k in ('rejection','lost','no','unsubscribe') then
      update public.j8_deals set stage = 'lost'
       where org_id = new.org_id and lead_id = new.lead_id and stage not in ('paid','lost');
    end if;
  exception when others then
    raise warning 'j8 deal_from_outcome skipped for %: %', new.approval_id, sqlerrm;
  end;
  return null;
end $$;

create trigger j8_outcomes_deal after insert or update of reply_kind on public.j8_outcomes
  for each row execute function j8private.deal_from_outcome();

-- one alert per due time for an open deal whose next step is late; waits out quiet hours (23:00–07:00) and Shabbat (Fri 16:00 – Sat 19:00)
create or replace function j8private.deal_tick(p_now timestamptz default now())
returns integer language plpgsql security definer set search_path to '' as $$
declare il timestamp := p_now at time zone 'Asia/Jerusalem'; d int := extract(dow from il); h int := extract(hour from il); n int := 0; r record;
begin
  if h >= 23 or h < 7 or (d = 5 and h >= 16) or (d = 6 and h < 19) then return 0; end if;
  for r in select * from public.j8_deals
            where stage not in ('paid','lost') and next_due_at is not null and next_due_at < p_now
              and alerted_due is distinct from next_due_at
            for update skip locked loop
    insert into j8private.push_outbox(org_id, kind, title, body, url, tag)
      values (r.org_id, 'deal-late', '🟠 Deal step is late',
              left(coalesce(nullif(r.brief->>'org', ''), 'A warm lead') || ': ' || coalesce(nullif(r.next_step, ''), 'next step'), 140),
              './#today', 'deal-' || r.id);
    update public.j8_deals set alerted_due = r.next_due_at where org_id = r.org_id and id = r.id;
    n := n + 1;
  end loop;
  if n > 0 and coalesce(current_setting('j8.no_push', true), '') <> 'on' then perform j8private.push_kick(); end if;
  return n;
end $$;
revoke all on function j8private.deal_tick(timestamptz) from public;
revoke all on function j8private.deal_from_outcome() from public;

-- backfill: every positive outcome already recorded gets its one card (fires the same trigger code path)
insert into public.j8_deals (org_id, lead_id, approval_id, product, stage, next_step, next_due_at, brief, extra)
select o.org_id, o.lead_id, o.approval_id, l.product,
       case when o.paid_at is not null then 'paid' when lower(o.reply_kind) in ('proposal','won') or o.proposal_at is not null then 'proposal'
            when lower(o.reply_kind) in ('call','interview','meeting','demo') or o.call_at is not null then 'demo_booked' else 'reply' end,
       'Reply and book a demo', j8private.workday_plus(coalesce(o.replied_at, now()), 1),
       jsonb_strip_nulls(jsonb_build_object('who', nullif(l.person, ''), 'org', nullif(l.company, ''), 'asked', nullif(left(o.reply_snippet, 400), ''), 'sent', nullif(left(a.subject, 200), ''))),
       jsonb_build_object('from', 'backfill', 'reply_kind', lower(o.reply_kind))
  from public.j8_outcomes o join public.j8_leads l on l.org_id = o.org_id and l.id = o.lead_id
  left join public.j8_approvals a on a.org_id = o.org_id and a.id = o.approval_id
 where lower(coalesce(o.reply_kind, '')) in ('reply','interview','call','proposal','meeting','demo','won')
on conflict (org_id, lead_id) do nothing;

select cron.schedule('j8_deal_tick', '*/15 * * * *', 'select j8private.deal_tick()');

-- Follow-up migration j8_deal_tick_no_email_in_push (same run): deal_tick strips email addresses and links from the push body
-- (a lead made by outcome_sync can carry an address as its company); body falls back to "A warm lead".
