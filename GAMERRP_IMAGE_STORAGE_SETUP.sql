-- Safe additive setup for GamerRP photo posts. Does not delete existing posts.

-- Add a public image URL to posts (existing text posts remain unchanged).
alter table public.gamer_posts
  add column if not exists image_url text;

-- Allow either a caption, an image, or both. Existing text posts remain valid.
alter table public.gamer_posts
  drop constraint if exists gamer_posts_body_check;

alter table public.gamer_posts
  add constraint gamer_posts_body_check
  check (
    char_length(trim(body)) between 0 and 2000
    and (char_length(trim(body)) > 0 or image_url is not null)
  );

-- Public bucket is intentional: photos attached to public feed posts are viewable by feed visitors.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gamer-post-images',
  'gamer-post-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Signed-in gamers can upload only into a folder named with their own auth user ID.
drop policy if exists "GamerRP users upload their own post images" on storage.objects;
create policy "GamerRP users upload their own post images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'gamer-post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can replace or remove only their own stored files.
drop policy if exists "GamerRP users update their own post images" on storage.objects;
create policy "GamerRP users update their own post images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'gamer-post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'gamer-post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "GamerRP users delete their own post images" on storage.objects;
create policy "GamerRP users delete their own post images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'gamer-post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
