alter table public.community_posts
  add column if not exists image_path text,
  add column if not exists challenge_goal_minutes integer check (challenge_goal_minutes between 1 and 1440),
  add column if not exists challenge_focus_minutes integer check (challenge_focus_minutes between 0 and 1440);

alter table public.community_posts drop constraint if exists community_posts_channel_check;
alter table public.community_posts
  add constraint community_posts_channel_check check (channel in ('chat', 'tips', 'challenge'));

create policy "authors update own community posts"
on public.community_posts for update to authenticated
using (author_id = (select auth.uid()))
with check (author_id = (select auth.uid()) and (select private.is_group_member(group_id)));

create policy "authors update own community comments"
on public.community_comments for update to authenticated
using (author_id = (select auth.uid()))
with check (author_id = (select auth.uid()));

insert into storage.buckets (id, name, public)
values ('challenge-images', 'challenge-images', false)
on conflict (id) do nothing;

create policy "members read challenge images"
on storage.objects for select to authenticated
using (
  bucket_id = 'challenge-images'
  and (select private.is_group_member(((storage.foldername(name))[1])::uuid))
);

create policy "members upload own challenge images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'challenge-images'
  and (storage.foldername(name))[2] = (select auth.uid()::text)
);

create policy "users delete own challenge images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'challenge-images'
  and (storage.foldername(name))[2] = (select auth.uid()::text)
);
