-- Run schema.sql first, then apply this migration through the Supabase CLI or SQL Editor.
-- This migration intentionally moves every user-writable action behind RLS or a scoped RPC.

create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 24),
  avatar_seed text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.study_groups
  add column if not exists goal_penalty_text text not null default '아메리카노 사기',
  add column if not exists away_penalty_text text not null default '편의점 간식 사기',
  add column if not exists recording_retention_days integer not null default 7
    check (recording_retention_days between 1 and 30);

alter table public.study_sessions
  add column if not exists created_by uuid;

update public.study_sessions ss
set created_by = sg.owner_id
from public.study_groups sg
where ss.group_id = sg.id
  and ss.created_by is null;

alter table public.study_sessions
  alter column created_by set not null;

alter table public.recording_clips
  add column if not exists visibility text not null default 'private'
    check (visibility in ('private', 'group'));

create index if not exists idx_group_members_user_id on public.group_members(user_id);
create index if not exists idx_sessions_created_by on public.study_sessions(created_by);
create index if not exists idx_participants_user_id on public.session_participants(user_id);
create index if not exists idx_penalties_user_id on public.penalty_assignments(user_id);
create unique index if not exists idx_penalties_one_reason_per_session
  on public.penalty_assignments(session_id, user_id, reason)
  where session_id is not null;

create or replace function private.is_group_member(target_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = target_group_id
      and gm.user_id = (select auth.uid())
  );
$$;

create or replace function private.is_group_owner(target_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = target_group_id
      and gm.user_id = (select auth.uid())
      and gm.role = 'owner'
  );
$$;

revoke all on schema private from public;
grant usage on schema private to authenticated;
revoke all on function private.is_group_member(uuid) from public;
revoke all on function private.is_group_owner(uuid) from public;
grant execute on function private.is_group_member(uuid), private.is_group_owner(uuid) to authenticated;

alter table public.profiles enable row level security;

drop policy if exists "members can read groups" on public.study_groups;
drop policy if exists "members can read group_members" on public.group_members;
drop policy if exists "members can manage sessions" on public.study_sessions;
drop policy if exists "members can manage participants" on public.session_participants;
drop policy if exists "members can read penalties" on public.penalty_assignments;
drop policy if exists "members can insert penalties" on public.penalty_assignments;
drop policy if exists "owners can update penalties" on public.penalty_assignments;
drop policy if exists "users can manage their clips" on public.recording_clips;

create policy "profiles are visible to signed-in users"
on public.profiles for select to authenticated using (true);

create policy "users update only their profile"
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "members read their groups"
on public.study_groups for select to authenticated
using ((select private.is_group_member(id)));

create policy "owners update their groups"
on public.study_groups for update to authenticated
using ((select private.is_group_owner(id)))
with check ((select private.is_group_owner(id)));

create policy "members read a group roster"
on public.group_members for select to authenticated
using ((select private.is_group_member(group_id)));

create policy "members read sessions"
on public.study_sessions for select to authenticated
using ((select private.is_group_member(group_id)));

create policy "members create sessions for themselves"
on public.study_sessions for insert to authenticated
with check (
  created_by = (select auth.uid())
  and (select private.is_group_member(group_id))
);

create policy "creator ends own sessions"
on public.study_sessions for update to authenticated
using (created_by = (select auth.uid()))
with check (created_by = (select auth.uid()));

create policy "members read session participants"
on public.session_participants for select to authenticated
using (
  exists (
    select 1 from public.study_sessions ss
    where ss.id = session_participants.session_id
      and (select private.is_group_member(ss.group_id))
  )
);

create policy "users create own participant records"
on public.session_participants for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.study_sessions ss
    where ss.id = session_participants.session_id
      and ss.status = 'live'
      and (select private.is_group_member(ss.group_id))
  )
);

create policy "users update own participant records"
on public.session_participants for update to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.study_sessions ss
    where ss.id = session_participants.session_id
      and (select private.is_group_member(ss.group_id))
  )
)
with check (user_id = (select auth.uid()));

create policy "members read group penalties"
on public.penalty_assignments for select to authenticated
using ((select private.is_group_member(group_id)));

create policy "assigned user acknowledges own penalties"
on public.penalty_assignments for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "users read own recording metadata"
on public.recording_clips for select to authenticated
using (user_id = (select auth.uid()));

create policy "users create own recording metadata"
on public.recording_clips for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.study_sessions ss
    where ss.id = recording_clips.session_id
      and (select private.is_group_member(ss.group_id))
  )
);

create policy "users update own recording metadata"
on public.recording_clips for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

insert into storage.buckets (id, name, public)
values ('study-clips', 'study-clips', false)
on conflict (id) do nothing;

drop policy if exists "studybet users upload own clips" on storage.objects;
drop policy if exists "studybet users read own clips" on storage.objects;
drop policy if exists "studybet users delete own clips" on storage.objects;

create policy "studybet users upload own clips"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'study-clips'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "studybet users read own clips"
on storage.objects for select to authenticated
using (
  bucket_id = 'study-clips'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "studybet users delete own clips"
on storage.objects for delete to authenticated
using (
  bucket_id = 'study-clips'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create or replace function public.create_study_group(
  group_name text,
  daily_goal integer default 180,
  away_limit integer default 15,
  owner_nickname text default null
)
returns public.study_groups
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_group public.study_groups;
  generated_code text;
  resolved_nickname text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if char_length(trim(group_name)) not between 2 and 40 then
    raise exception 'Group name must be between 2 and 40 characters';
  end if;
  if daily_goal not between 10 and 1440 or away_limit not between 1 and 180 then
    raise exception 'Invalid study rule';
  end if;

  loop
    generated_code := 'STB-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 8));
    exit when not exists (select 1 from public.study_groups where invite_code = generated_code);
  end loop;

  resolved_nickname := left(coalesce(nullif(trim(owner_nickname), ''), auth.jwt() -> 'user_metadata' ->> 'nickname', '스터디러'), 24);
  insert into public.study_groups (owner_id, name, invite_code, daily_goal_minutes, away_limit_minutes)
  values (auth.uid(), trim(group_name), generated_code, daily_goal, away_limit)
  returning * into new_group;

  insert into public.group_members (group_id, user_id, nickname, role)
  values (new_group.id, auth.uid(), resolved_nickname, 'owner');

  insert into public.profiles (id, nickname)
  values (auth.uid(), resolved_nickname)
  on conflict (id) do nothing;

  return new_group;
end;
$$;

create or replace function public.join_study_group(invite_code_input text, nickname_input text default null)
returns public.group_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_group public.study_groups;
  new_member public.group_members;
  resolved_nickname text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  select * into target_group
  from public.study_groups
  where invite_code = upper(trim(invite_code_input));
  if target_group.id is null then
    raise exception 'Invalid invite code';
  end if;

  resolved_nickname := left(coalesce(nullif(trim(nickname_input), ''), auth.jwt() -> 'user_metadata' ->> 'nickname', '스터디러'), 24);
  insert into public.group_members (group_id, user_id, nickname, role)
  values (target_group.id, auth.uid(), resolved_nickname, 'member')
  on conflict (group_id, user_id) do update set nickname = excluded.nickname
  returning * into new_member;

  insert into public.profiles (id, nickname)
  values (auth.uid(), resolved_nickname)
  on conflict (id) do nothing;

  return new_member;
end;
$$;

create or replace function public.finish_my_session(
  target_session_id uuid,
  focus_total_seconds integer,
  away_total_seconds integer,
  camera_rate numeric default 0
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_session public.study_sessions;
  target_group public.study_groups;
  member_row public.group_members;
  assigned_count integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if focus_total_seconds < 0 or away_total_seconds < 0 or camera_rate not between 0 and 100 then
    raise exception 'Invalid session totals';
  end if;

  select * into target_session
  from public.study_sessions
  where id = target_session_id
    and created_by = auth.uid()
    and status = 'live';
  if target_session.id is null then
    raise exception 'Live session not found';
  end if;

  select * into target_group
  from public.study_groups
  where id = target_session.group_id;

  select * into member_row
  from public.group_members
  where group_id = target_session.group_id and user_id = auth.uid();
  if member_row.id is null then
    raise exception 'Group membership required';
  end if;

  insert into public.session_participants (session_id, user_id, focus_seconds, away_seconds, camera_on_rate)
  values (target_session.id, auth.uid(), focus_total_seconds, away_total_seconds, camera_rate)
  on conflict (session_id, user_id) do update
  set focus_seconds = excluded.focus_seconds,
      away_seconds = excluded.away_seconds,
      camera_on_rate = excluded.camera_on_rate,
      updated_at = now();

  if focus_total_seconds < target_group.daily_goal_minutes * 60 then
    insert into public.penalty_assignments (group_id, session_id, user_id, nickname, reason, penalty_text)
    values (target_session.group_id, target_session.id, auth.uid(), member_row.nickname, '목표 미달', target_group.goal_penalty_text);
    assigned_count := assigned_count + 1;
  end if;
  if away_total_seconds > target_group.away_limit_minutes * 60 then
    insert into public.penalty_assignments (group_id, session_id, user_id, nickname, reason, penalty_text)
    values (target_session.group_id, target_session.id, auth.uid(), member_row.nickname, '이탈 초과', target_group.away_penalty_text);
    assigned_count := assigned_count + 1;
  end if;

  update public.group_members
  set penalty_count = penalty_count + assigned_count
  where id = member_row.id;
  update public.study_sessions set status = 'ended', ended_at = now() where id = target_session.id;

  return jsonb_build_object('session_id', target_session.id, 'penalty_count', assigned_count);
end;
$$;

revoke all on function public.create_study_group(text, integer, integer, text) from public;
revoke all on function public.join_study_group(text, text) from public;
revoke all on function public.finish_my_session(uuid, integer, integer, numeric) from public;
grant execute on function public.create_study_group(text, integer, integer, text) to authenticated;
grant execute on function public.join_study_group(text, text) to authenticated;
grant execute on function public.finish_my_session(uuid, integer, integer, numeric) to authenticated;
