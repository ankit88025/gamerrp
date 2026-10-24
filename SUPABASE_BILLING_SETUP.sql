-- Run this once in Supabase Dashboard > SQL Editor.
-- It stores only provider-confirmed subscription state. Client users can read their own row,
-- but they cannot grant themselves Pro; the server webhook uses SUPABASE_SERVICE_ROLE_KEY.

create table if not exists public.gamer_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  status text not null default 'inactive' check (status in ('inactive', 'active', 'past_due', 'paused', 'canceled', 'trialing')),
  paddle_customer_id text,
  paddle_subscription_id text unique,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.gamer_subscriptions enable row level security;

grant select on public.gamer_subscriptions to authenticated;
revoke insert, update, delete on public.gamer_subscriptions from anon, authenticated;

drop policy if exists "Users can read their own GamerRP subscription" on public.gamer_subscriptions;
create policy "Users can read their own GamerRP subscription"
  on public.gamer_subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Explicitly prevent public/anonymous reads.
revoke all on public.gamer_subscriptions from anon;
