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

-- Projects created with "Grant API access to new tables automatically" off
-- give the Data API roles nothing on new tables, so grant the server role explicitly.
grant select, insert on public.waitlist to service_role;
