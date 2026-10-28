-- GamerRP notifications migration (safe to run more than once).
-- Run in Supabase Dashboard > SQL Editor > New query.
-- Does not delete posts, profiles, likes, comments or follows.

create table if not exists public.gamer_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('like', 'comment', 'follow')),
  post_id uuid null references public.gamer_posts(id) on delete set null,
  message text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz null
);
create index if not exists gamer_notifications_recipient_created_idx on public.gamer_notifications(recipient_id, created_at desc);
create index if not exists gamer_notifications_unread_idx on public.gamer_notifications(recipient_id) where read_at is null;

alter table public.gamer_notifications enable row level security;
drop policy if exists "Users can read their own notifications" on public.gamer_notifications;
create policy "Users can read their own notifications" on public.gamer_notifications
  for select to authenticated using (auth.uid() = recipient_id);
drop policy if exists "Users can mark their own notifications read" on public.gamer_notifications;
create policy "Users can mark their own notifications read" on public.gamer_notifications
  for update to authenticated using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);
-- No client INSERT policy: rows are created by trusted trigger functions only.

create or replace function public.gamerrp_notify_post_like()
returns trigger language plpgsql security definer set search_path = public as $$
declare post_owner uuid;
begin
  select user_id into post_owner from public.gamer_posts where id = new.post_id;
  if post_owner is not null and post_owner <> new.user_id then
    insert into public.gamer_notifications(recipient_id, actor_id, type, post_id, message)
    values (post_owner, new.user_id, 'like', new.post_id, 'liked your post');
  end if;
  return new;
end; $$;

drop trigger if exists gamer_post_like_notification on public.gamer_post_likes;
create trigger gamer_post_like_notification after insert on public.gamer_post_likes
for each row execute function public.gamerrp_notify_post_like();

create or replace function public.gamerrp_notify_post_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare post_owner uuid;
begin
  select user_id into post_owner from public.gamer_posts where id = new.post_id;
  if post_owner is not null and post_owner <> new.user_id then
    insert into public.gamer_notifications(recipient_id, actor_id, type, post_id, message)
    values (post_owner, new.user_id, 'comment', new.post_id, 'commented on your post');
  end if;
  return new;
end; $$;

drop trigger if exists gamer_post_comment_notification on public.gamer_post_comments;
create trigger gamer_post_comment_notification after insert on public.gamer_post_comments
for each row execute function public.gamerrp_notify_post_comment();

create or replace function public.gamerrp_notify_follow()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.follower_id <> new.following_id then
    insert into public.gamer_notifications(recipient_id, actor_id, type, post_id, message)
    values (new.following_id, new.follower_id, 'follow', null, 'started following you');
  end if;
  return new;
end; $$;

drop trigger if exists gamer_follow_notification on public.gamer_follows;
create trigger gamer_follow_notification after insert on public.gamer_follows
for each row execute function public.gamerrp_notify_follow();

revoke all on function public.gamerrp_notify_post_like() from public, anon, authenticated;
revoke all on function public.gamerrp_notify_post_comment() from public, anon, authenticated;
revoke all on function public.gamerrp_notify_follow() from public, anon, authenticated;
