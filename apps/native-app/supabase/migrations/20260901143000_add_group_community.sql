create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups(id) on delete cascade,
  channel text not null check (channel in ('chat', 'tips')),
  author_id uuid not null references auth.users(id) on delete cascade,
  author_nickname text not null check (char_length(author_nickname) between 1 and 24),
  title text not null check (char_length(title) between 1 and 80),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  group_id uuid not null references public.study_groups(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_nickname text not null check (char_length(author_nickname) between 1 and 24),
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists idx_community_posts_group_channel on public.community_posts(group_id, channel, created_at desc);
create index if not exists idx_community_comments_post on public.community_comments(post_id, created_at);

alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;

create policy "members read community posts"
on public.community_posts for select to authenticated
using ((select private.is_group_member(group_id)));

create policy "members create own community posts"
on public.community_posts for insert to authenticated
with check (author_id = (select auth.uid()) and (select private.is_group_member(group_id)));

create policy "authors delete own community posts"
on public.community_posts for delete to authenticated
using (author_id = (select auth.uid()));

create policy "members read community comments"
on public.community_comments for select to authenticated
using ((select private.is_group_member(group_id)));

create policy "members create own community comments"
on public.community_comments for insert to authenticated
with check (
  author_id = (select auth.uid())
  and (select private.is_group_member(group_id))
  and exists (
    select 1 from public.community_posts post
    where post.id = community_comments.post_id and post.group_id = community_comments.group_id
  )
);

create policy "authors delete own community comments"
on public.community_comments for delete to authenticated
using (author_id = (select auth.uid()));
