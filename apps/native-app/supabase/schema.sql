create extension if not exists pgcrypto;

create table if not exists public.study_groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  name text not null,
  invite_code text not null unique,
  daily_goal_minutes integer not null default 180,
  away_limit_minutes integer not null default 15,
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups(id) on delete cascade,
  user_id uuid not null,
  nickname text not null,
  role text not null check (role in ('owner', 'member')),
  streak_days integer not null default 0,
  penalty_count integer not null default 0,
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  status text not null default 'live' check (status in ('scheduled', 'live', 'ended'))
);

create table if not exists public.session_participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.study_sessions(id) on delete cascade,
  user_id uuid not null,
  focus_seconds integer not null default 0,
  away_seconds integer not null default 0,
  camera_on_rate numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, user_id)
);

create table if not exists public.penalty_assignments (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups(id) on delete cascade,
  session_id uuid references public.study_sessions(id) on delete set null,
  user_id uuid not null,
  nickname text not null,
  reason text not null,
  penalty_text text not null,
  assigned_at timestamptz not null default now(),
  status text not null default 'assigned' check (status in ('assigned', 'accepted', 'completed'))
);

create table if not exists public.recording_clips (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.study_sessions(id) on delete cascade,
  user_id uuid not null,
  recorded_date date not null,
  title text not null,
  storage_path text,
  duration_seconds integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_group_members_group_id on public.group_members(group_id);
create index if not exists idx_sessions_group_id on public.study_sessions(group_id);
create index if not exists idx_session_participants_session_id on public.session_participants(session_id);
create index if not exists idx_penalty_assignments_group_id on public.penalty_assignments(group_id);
create index if not exists idx_recording_clips_user_date on public.recording_clips(user_id, recorded_date desc);

alter table public.study_groups enable row level security;
alter table public.group_members enable row level security;
alter table public.study_sessions enable row level security;
alter table public.session_participants enable row level security;
alter table public.penalty_assignments enable row level security;
alter table public.recording_clips enable row level security;

create policy "members can read groups"
on public.study_groups
for select
using (
  exists (
    select 1
    from public.group_members gm
    where gm.group_id = study_groups.id
      and gm.user_id = auth.uid()
  )
);

create policy "members can read group_members"
on public.group_members
for select
using (
  exists (
    select 1
    from public.group_members gm
    where gm.group_id = group_members.group_id
      and gm.user_id = auth.uid()
  )
);

create policy "members can manage sessions"
on public.study_sessions
for all
using (
  exists (
    select 1
    from public.group_members gm
    where gm.group_id = study_sessions.group_id
      and gm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.group_members gm
    where gm.group_id = study_sessions.group_id
      and gm.user_id = auth.uid()
  )
);

create policy "members can manage participants"
on public.session_participants
for all
using (
  exists (
    select 1
    from public.study_sessions ss
    join public.group_members gm on gm.group_id = ss.group_id
    where ss.id = session_participants.session_id
      and gm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.study_sessions ss
    join public.group_members gm on gm.group_id = ss.group_id
    where ss.id = session_participants.session_id
      and gm.user_id = auth.uid()
  )
);

create policy "members can read penalties"
on public.penalty_assignments
for select
using (
  exists (
    select 1
    from public.group_members gm
    where gm.group_id = penalty_assignments.group_id
      and gm.user_id = auth.uid()
  )
);

create policy "members can insert penalties"
on public.penalty_assignments
for insert
with check (
  exists (
    select 1
    from public.group_members gm
    where gm.group_id = penalty_assignments.group_id
      and gm.user_id = auth.uid()
  )
);

create policy "owners can update penalties"
on public.penalty_assignments
for update
using (
  exists (
    select 1
    from public.group_members gm
    where gm.group_id = penalty_assignments.group_id
      and gm.user_id = auth.uid()
      and gm.role = 'owner'
  )
);

create policy "users can manage their clips"
on public.recording_clips
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());
