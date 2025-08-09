-- Create table to store Web Push subscriptions
-- Execute in Supabase SQL editor

create table if not exists push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

create index if not exists idx_push_subscriptions_user on push_subscriptions(user_id);
