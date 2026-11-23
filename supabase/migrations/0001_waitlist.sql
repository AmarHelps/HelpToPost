-- Waitlist signups from amarhelps.com. Only the server (service role key) can read or write.
create table if not exists public.waitlist (
  id bigint generated always as identity primary key,
  email text not null unique,
  trade text,
  platforms text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;
-- No policies on purpose: the anon and authenticated roles get no access.
