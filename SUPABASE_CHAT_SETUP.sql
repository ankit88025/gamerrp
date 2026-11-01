-- GamerRP direct-message schema
-- Run once in Supabase Dashboard > SQL Editor. This is separate from SUPABASE_SETUP.sql and SUPABASE_BILLING_SETUP.sql.

create table if not exists public.gamer_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  constraint gamer_messages_no_self_dm check (sender_id <> recipient_id)
);

create index if not exists gamer_messages_sender_recipient_created_idx
  on public.gamer_messages (sender_id, recipient_id, created_at desc);
create index if not exists gamer_messages_recipient_sender_created_idx
  on public.gamer_messages (recipient_id, sender_id, created_at desc);

alter table public.gamer_messages enable row level security;
revoke all on public.gamer_messages from anon;
grant select, insert on public.gamer_messages to authenticated;
revoke update, delete on public.gamer_messages from authenticated;

drop policy if exists "Participants can read their GamerRP messages" on public.gamer_messages;
create policy "Participants can read their GamerRP messages"
  on public.gamer_messages for select to authenticated
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists "Senders can send their own GamerRP messages" on public.gamer_messages;
create policy "Senders can send their own GamerRP messages"
  on public.gamer_messages for insert to authenticated
  with check (auth.uid() = sender_id and sender_id <> recipient_id);

-- Enable Realtime for live chat refresh if the standard Supabase publication exists.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'gamer_messages'
     ) then
    execute 'alter publication supabase_realtime add table public.gamer_messages';
  end if;
end $$;
