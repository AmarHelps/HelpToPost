-- HelpToPost accounts, connected platforms, posts and the media bucket.
-- Run once in the Supabase SQL editor after 0001_waitlist.sql. Only the server (secret key) reads or writes these.

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  password_hash text,
  google_sub text unique,
  created_at timestamptz not null default now()
);

-- One row per connected YouTube channel or Instagram account. Tokens are encrypted by the app (AES-256-GCM)
-- before they are stored, so the database never holds a usable token.
create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  platform text not null check (platform in ('youtube', 'instagram')),
  external_id text not null,
  display_name text,
  avatar_url text,
  access_token_enc text not null,
  refresh_token_enc text,
  expires_at timestamptz,
  scopes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, platform)
);

-- One row per platform per post. Posts made together share batch_id and the same uploaded media.
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  batch_id uuid not null,
  platform text not null check (platform in ('youtube', 'instagram')),
  status text not null default 'queued' check (status in ('queued', 'uploading', 'processing', 'publishing', 'published', 'failed')),
  media jsonb not null default '[]',
  caption text not null default '',
  title text,
  privacy text,
  made_for_kids boolean not null default false,
  container_id text,
  external_id text,
  external_url text,
  error text,
  media_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists posts_user_created on public.posts (user_id, created_at desc);
create index if not exists posts_batch on public.posts (batch_id);

alter table public.app_users enable row level security;
alter table public.connections enable row level security;
alter table public.posts enable row level security;
-- No policies on purpose: the anon and authenticated roles get no access.

grant select, insert, update, delete on public.app_users, public.connections, public.posts to service_role;

-- Instagram (Meta Unified Login): the client's business portfolio and the Meta user id, used by Meta's
-- deauthorize and data deletion callbacks. Safe to run again if this file was already run once.
alter table public.connections add column if not exists meta_business_id text;
alter table public.connections add column if not exists meta_user_id text;

-- Private bucket for media on its way to YouTube and Instagram. The app hands out short-lived signed links only.
insert into storage.buckets (id, name, public, allowed_mime_types)
values ('media', 'media', false, array['image/jpeg', 'video/*'])
on conflict (id) do nothing;
