-- J8NIX 15.10 follow-up timer (backlog b-1125-24). Applied 26 Nov 2026 (main chat, reviewed).
-- Rule: council 5 days, application 7, referral 5, other outreach 5; posts, templates, designs: none.
-- Dates are Israel days (Asia/Jerusalem); Friday and Saturday move to Sunday.
--
-- ROLLBACK (extra keys left on rows are harmless):
--   drop trigger if exists j8_approvals_followup on public.j8_approvals;
--   drop function if exists public.j8_followup_mark(uuid, text, text);
--   drop function if exists j8private.followup_stamp();
--   drop function if exists j8private.followup_date(timestamptz, int);
--   drop function if exists j8private.followup_rule(text, text, text, text, text);

create or replace function j8private.followup_rule(p_kind text, p_id text, p_label text, p_template text, p_product text)
returns jsonb language sql immutable set search_path to '' as $$
  select case
    when coalesce(p_kind,'') in ('template','post','design') then null
    when coalesce(p_id,'') like 'li-ref-%' or coalesce(p_label,'') ~* 'referral' then '{"rule":"referral","days":5}'::jsonb
    when coalesce(p_template,'') = 'T-muni' or coalesce(p_id,'') like 'muni-%' or coalesce(p_product,'') = 'p-shomer' then '{"rule":"council","days":5}'::jsonb
    when coalesce(p_kind,'') = 'application' then '{"rule":"application","days":7}'::jsonb
    when coalesce(p_kind,'') in ('email','linkedin','message','outreach') then '{"rule":"outreach","days":5}'::jsonb
    else null end $$;
create or replace function j8private.followup_date(p_from timestamptz, p_days int)
returns text language sql stable set search_path to '' as $$
  select to_char(d + case extract(dow from d)::int when 5 then 2 when 6 then 1 else 0 end, 'YYYY-MM-DD')
  from (select ((coalesce(p_from, now()) at time zone 'Asia/Jerusalem')::date + coalesce(p_days,0)) as d) x $$;
create or replace function j8private.followup_stamp()
returns trigger language plpgsql set search_path to '' as $$
declare r jsonb; ts timestamptz;
begin
  if new.status = 'sent' and not (coalesce(new.extra,'{}'::jsonb) ? 'followup_after')
     and coalesce(new.extra->>'followup','') <> 'none' and not (coalesce(new.extra,'{}'::jsonb) ? 'replied_at') then
    r := j8private.followup_rule(new.kind, new.id, new.label, new.template_id, new.product);
    if r is not null then
      begin ts := nullif(new.sent_at,'')::timestamptz; exception when others then ts := null; end;
      new.extra := coalesce(new.extra,'{}'::jsonb) || jsonb_build_object(
        'followup_after', j8private.followup_date(coalesce(ts, now()), (r->>'days')::int), 'followup_rule', r->>'rule');
    end if;
  end if;
  return new;
end $$;
drop trigger if exists j8_approvals_followup on public.j8_approvals;
create trigger j8_approvals_followup before insert or update of status, sent_at, extra
  on public.j8_approvals for each row execute function j8private.followup_stamp();
update public.j8_approvals set extra = coalesce(extra,'{}'::jsonb)
 where status = 'sent' and not (coalesce(extra,'{}'::jsonb) ? 'followup_after')
   and j8private.followup_rule(kind, id, label, template_id, product) is not null;
update public.j8_approvals set extra = extra || jsonb_build_object('followup_rule', j8private.followup_rule(kind, id, label, template_id, product)->>'rule')
 where status = 'sent' and extra ? 'followup_after' and not (extra ? 'followup_rule')
   and j8private.followup_rule(kind, id, label, template_id, product) is not null;
create or replace function public.j8_followup_mark(p_org uuid, p_id text, p_what text)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare a public.j8_approvals; e jsonb; prev jsonb;
begin
  if (select auth.uid()) is null or not j8private.has_role(p_org, 'member') then raise exception 'not allowed'; end if;
  if p_what not in ('done','snooze','none','undo') then raise exception 'bad action'; end if;
  select * into a from public.j8_approvals where org_id = p_org and id = p_id for update;
  if not found or a.status <> 'sent' then raise exception 'not a sent item'; end if;
  e := coalesce(a.extra,'{}'::jsonb);
  prev := jsonb_build_object('followup_after', e->'followup_after', 'followup', e->'followup');
  if p_what = 'done' then
    e := (e - 'followup') || jsonb_build_object('followup_prev', prev, 'followup_after', j8private.followup_date(now(), 7),
         'followup_done_at', now()::text, 'followup_count', coalesce((e->>'followup_count')::int,0) + 1);
  elsif p_what = 'snooze' then
    e := (e - 'followup') || jsonb_build_object('followup_prev', prev, 'followup_after', j8private.followup_date(now(), 2));
  elsif p_what = 'none' then
    e := (e - 'followup_after') || jsonb_build_object('followup_prev', prev, 'followup', 'none');
  else
    if not (e ? 'followup_prev') then raise exception 'nothing to undo'; end if;
    prev := e->'followup_prev';
    e := e - 'followup_prev' - 'followup' - 'followup_after';
    if jsonb_typeof(prev->'followup_after') = 'string' then e := e || jsonb_build_object('followup_after', prev->'followup_after'); end if;
    if jsonb_typeof(prev->'followup') = 'string' then e := e || jsonb_build_object('followup', prev->'followup'); end if;
  end if;
  update public.j8_approvals set extra = e where org_id = p_org and id = p_id;
  return jsonb_build_object('id', p_id, 'followup_after', e->'followup_after', 'followup', e->'followup');
end $$;
revoke all on function public.j8_followup_mark(uuid, text, text) from public, anon;
grant execute on function public.j8_followup_mark(uuid, text, text) to authenticated;
revoke all on function j8private.followup_rule(text,text,text,text,text) from public, anon;
revoke all on function j8private.followup_date(timestamptz,int) from public, anon;
revoke all on function j8private.followup_stamp() from public, anon;
