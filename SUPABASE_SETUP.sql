-- GamerRP social features setup
-- Run this entire file in Supabase Dashboard > SQL Editor > New query.
-- This does not delete or reset existing gamer_profiles data.

create extension if not exists pgcrypto;

-- Make gamer profiles discoverable to signed-in GamerRP users.
alter table public.gamer_profiles enable row level security;
drop policy if exists "GamerRP profiles visible to authenticated users" on public.gamer_profiles;
create policy "GamerRP profiles visible to authenticated users"
  on public.gamer_profiles for select to authenticated using (true);

create table if not exists public.gamer_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists gamer_posts_created_at_idx on public.gamer_posts(created_at desc);
create index if not exists gamer_posts_user_id_idx on public.gamer_posts(user_id);
alter table public.gamer_posts enable row level security;
drop policy if exists "Signed-in users can read posts" on public.gamer_posts;
drop policy if exists "Users can create their own posts" on public.gamer_posts;
drop policy if exists "Users can delete their own posts" on public.gamer_posts;
create policy "Signed-in users can read posts" on public.gamer_posts for select to authenticated using (true);
create policy "Users can create their own posts" on public.gamer_posts for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can delete their own posts" on public.gamer_posts for delete to authenticated using (auth.uid() = user_id);

create table if not exists public.gamer_post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.gamer_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);
create index if not exists gamer_post_likes_post_id_idx on public.gamer_post_likes(post_id);
alter table public.gamer_post_likes enable row level security;
drop policy if exists "Signed-in users can read likes" on public.gamer_post_likes;
drop policy if exists "Users can like posts as themselves" on public.gamer_post_likes;
drop policy if exists "Users can remove their own likes" on public.gamer_post_likes;
create policy "Signed-in users can read likes" on public.gamer_post_likes for select to authenticated using (true);
create policy "Users can like posts as themselves" on public.gamer_post_likes for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can remove their own likes" on public.gamer_post_likes for delete to authenticated using (auth.uid() = user_id);

create table if not exists public.gamer_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.gamer_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists gamer_post_comments_post_id_idx on public.gamer_post_comments(post_id, created_at);
alter table public.gamer_post_comments enable row level security;
drop policy if exists "Signed-in users can read comments" on public.gamer_post_comments;
drop policy if exists "Users can create comments as themselves" on public.gamer_post_comments;
drop policy if exists "Users can delete their own comments" on public.gamer_post_comments;
create policy "Signed-in users can read comments" on public.gamer_post_comments for select to authenticated using (true);
create policy "Users can create comments as themselves" on public.gamer_post_comments for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can delete their own comments" on public.gamer_post_comments for delete to authenticated using (auth.uid() = user_id);

create table if not exists public.gamer_follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id),
  check (follower_id <> following_id)
);
create index if not exists gamer_follows_follower_idx on public.gamer_follows(follower_id);
create index if not exists gamer_follows_following_idx on public.gamer_follows(following_id);
alter table public.gamer_follows enable row level security;
drop policy if exists "Signed-in users can see follows" on public.gamer_follows;
drop policy if exists "Users can follow from their own account" on public.gamer_follows;
drop policy if exists "Users can unfollow from their own account" on public.gamer_follows;
create policy "Signed-in users can see follows" on public.gamer_follows for select to authenticated using (true);
create policy "Users can follow from their own account" on public.gamer_follows for insert to authenticated with check (auth.uid() = follower_id);
create policy "Users can unfollow from their own account" on public.gamer_follows for delete to authenticated using (auth.uid() = follower_id);

create table if not exists public.gamer_opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 100),
  kind text not null default 'Looking for teammates',
  game text not null check (char_length(trim(game)) between 1 and 80),
  description text not null check (char_length(trim(description)) between 1 and 1500),
  location text,
  created_at timestamptz not null default now()
);
create index if not exists gamer_opportunities_created_at_idx on public.gamer_opportunities(created_at desc);
create index if not exists gamer_opportunities_user_id_idx on public.gamer_opportunities(user_id);
alter table public.gamer_opportunities enable row level security;
drop policy if exists "Signed-in users can read opportunities" on public.gamer_opportunities;
drop policy if exists "Users can create their own opportunities" on public.gamer_opportunities;
drop policy if exists "Users can update their own opportunities" on public.gamer_opportunities;
drop policy if exists "Users can delete their own opportunities" on public.gamer_opportunities;
create policy "Signed-in users can read opportunities" on public.gamer_opportunities for select to authenticated using (true);
create policy "Users can create their own opportunities" on public.gamer_opportunities for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update their own opportunities" on public.gamer_opportunities for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own opportunities" on public.gamer_opportunities for delete to authenticated using (auth.uid() = user_id);

-- Realtime is optional. Core feed features work with refresh-based loading.
