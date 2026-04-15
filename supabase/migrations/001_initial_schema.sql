-- =============================================================
-- Logbook — Initial Schema
-- =============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =============================================================
-- PROFILES
-- =============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  moniker text not null unique,
  display_name text,
  bio text,
  avatar_url text,
  location text,
  website text,
  primary_vehicle_id uuid,
  follower_count integer not null default 0,
  following_count integer not null default 0,
  post_count integer not null default 0,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint moniker_format check (moniker ~ '^[a-z0-9_]{2,30}$')
);

create index idx_profiles_moniker on public.profiles(moniker);

-- =============================================================
-- VEHICLES
-- =============================================================
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  registration text not null,
  make text,
  model text,
  year integer,
  colour text,
  fuel_type text,
  engine_size text,
  mot_expiry date,
  tax_due date,
  dvla_data jsonb,
  nickname text,
  description text,
  cover_image_url text,
  is_primary boolean not null default false,
  for_sale boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint registration_upper check (registration = upper(regexp_replace(registration, '\s', '', 'g')))
);

create index idx_vehicles_owner on public.vehicles(owner_id);
create index idx_vehicles_registration on public.vehicles(registration);
create unique index idx_vehicles_reg_owner on public.vehicles(registration, owner_id);

-- Add FK for primary_vehicle_id after vehicles table exists
alter table public.profiles
  add constraint profiles_primary_vehicle_fk
  foreign key (primary_vehicle_id) references public.vehicles(id) on delete set null;

-- =============================================================
-- PLATE LOCKS
-- =============================================================
create table public.plate_locks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  registration text not null,
  stripe_payment_intent_id text,
  stripe_session_id text,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'expired', 'cancelled')),
  locked_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_plate_locks_registration on public.plate_locks(registration) where status = 'active';
create index idx_plate_locks_user on public.plate_locks(user_id);

-- =============================================================
-- POSTS
-- =============================================================
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  image_urls text[],
  vehicle_id uuid references public.vehicles(id) on delete set null,
  reply_to_id uuid references public.posts(id) on delete set null,
  repost_of_id uuid references public.posts(id) on delete set null,
  like_count integer not null default 0,
  reply_count integer not null default 0,
  repost_count integer not null default 0,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_length check (char_length(content) <= 500)
);

create index idx_posts_author on public.posts(author_id);
create index idx_posts_vehicle on public.posts(vehicle_id);
create index idx_posts_reply_to on public.posts(reply_to_id);
create index idx_posts_created on public.posts(created_at desc);

-- =============================================================
-- POST LIKES
-- =============================================================
create table public.post_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, post_id)
);

create index idx_post_likes_post on public.post_likes(post_id);
create index idx_post_likes_user on public.post_likes(user_id);

-- =============================================================
-- REPOSTS
-- =============================================================
create table public.reposts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, post_id)
);

-- =============================================================
-- FOLLOWS (user → user)
-- =============================================================
create table public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(follower_id, following_id),
  constraint no_self_follow check (follower_id != following_id)
);

create index idx_follows_follower on public.follows(follower_id);
create index idx_follows_following on public.follows(following_id);

-- =============================================================
-- PLATE FOLLOWS (user → plate)
-- =============================================================
create table public.plate_follows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  registration text not null,
  created_at timestamptz not null default now(),
  unique(user_id, registration)
);

-- =============================================================
-- CONVERSATIONS + MESSAGES
-- =============================================================
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_ids uuid[] not null,
  last_message_at timestamptz,
  last_message_preview text,
  created_at timestamptz not null default now()
);

create index idx_conversations_participants on public.conversations using gin(participant_ids);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  read_by uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  constraint message_length check (char_length(content) <= 2000)
);

create index idx_messages_conversation on public.messages(conversation_id, created_at desc);

-- =============================================================
-- GROUPS
-- =============================================================
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  cover_image_url text,
  member_count integer not null default 0,
  is_private boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_groups_slug on public.groups(slug);

create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member'
    check (role in ('owner', 'moderator', 'member')),
  joined_at timestamptz not null default now(),
  unique(group_id, user_id)
);

create index idx_group_members_group on public.group_members(group_id);
create index idx_group_members_user on public.group_members(user_id);

create table public.group_posts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(group_id, post_id)
);

-- =============================================================
-- LISTINGS (Marketplace)
-- =============================================================
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  title text not null,
  description text not null,
  price integer not null, -- in pence
  currency text not null default 'GBP',
  category text not null,
  image_urls text[],
  location text,
  postcode text,
  status text not null default 'active'
    check (status in ('active', 'sold', 'withdrawn')),
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_listings_seller on public.listings(seller_id);
create index idx_listings_status on public.listings(status);
create index idx_listings_created on public.listings(created_at desc);

-- =============================================================
-- NOTIFICATIONS
-- =============================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in (
    'like', 'reply', 'repost', 'follow', 'mention',
    'plate_message', 'mot_reminder', 'tax_reminder'
  )),
  post_id uuid references public.posts(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  message text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on public.notifications(user_id, created_at desc);
create index idx_notifications_unread on public.notifications(user_id) where is_read = false;

-- =============================================================
-- REPORTS
-- =============================================================
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'user', 'group', 'listing')),
  target_id uuid not null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);

-- =============================================================
-- BLOCKS
-- =============================================================
create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(blocker_id, blocked_id),
  constraint no_self_block check (blocker_id != blocked_id)
);

create index idx_blocks_blocker on public.blocks(blocker_id);
