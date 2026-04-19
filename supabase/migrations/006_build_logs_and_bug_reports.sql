-- =============================================================
-- Logbook — Migration 006: Build Logs, Bug Reports, Post Types
-- =============================================================

-- Add post_type to posts table
alter table public.posts
  add column if not exists post_type text not null default 'post'
    check (post_type in ('post', 'build_log'));

-- Add build log metadata columns to posts
alter table public.posts
  add column if not exists build_log_data jsonb;

-- Remove overly strict content_length constraint so build logs can be richer
alter table public.posts
  drop constraint if exists content_length;

alter table public.posts
  add constraint content_length check (char_length(content) <= 2000);

-- =============================================================
-- BUILD LOGS (structured service/mod records)
-- =============================================================
create table if not exists public.build_logs (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete set null,

  -- What type of work
  category text not null default 'mod'
    check (category in ('mod', 'service', 'repair', 'track', 'detail', 'other')),

  title text not null,
  description text,

  -- Parts used
  parts jsonb default '[]'::jsonb,
  -- [{ name: string, part_number: string, supplier: string, cost_pence: number }]

  -- Financials (in pence)
  parts_cost_pence integer not null default 0,
  labour_cost_pence integer not null default 0,
  total_cost_pence integer generated always as (parts_cost_pence + labour_cost_pence) stored,

  -- Time tracking
  hours_spent numeric(5,1),

  -- Mileage at time of work
  mileage integer,

  -- Before/after images
  before_image_urls text[],
  after_image_urls text[],

  -- Ratings
  difficulty integer check (difficulty between 1 and 5),
  would_recommend boolean,

  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_build_logs_author on public.build_logs(author_id);
create index idx_build_logs_vehicle on public.build_logs(vehicle_id);
create index idx_build_logs_created on public.build_logs(created_at desc);

-- =============================================================
-- BUG REPORTS
-- =============================================================
create table if not exists public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  steps text,
  reported_url text,
  user_agent text,
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'resolved', 'wont_fix')),
  admin_notes text,
  created_at timestamptz not null default now()
);

create index idx_bug_reports_status on public.bug_reports(status);
create index idx_bug_reports_created on public.bug_reports(created_at desc);

-- =============================================================
-- RLS
-- =============================================================

-- Build logs: owners can insert/update/delete, everyone can read non-deleted
alter table public.build_logs enable row level security;

create policy "build_logs_select" on public.build_logs
  for select using (not is_deleted);

create policy "build_logs_insert" on public.build_logs
  for insert with check (auth.uid() = author_id);

create policy "build_logs_update" on public.build_logs
  for update using (auth.uid() = author_id);

create policy "build_logs_delete" on public.build_logs
  for delete using (auth.uid() = author_id);

-- Bug reports: authenticated users can insert
alter table public.bug_reports enable row level security;

create policy "bug_reports_insert" on public.bug_reports
  for insert with check (true);

-- Only service role can read/update bug reports
create policy "bug_reports_service_select" on public.bug_reports
  for select using (false); -- blocked to regular users; use service role for admin

-- =============================================================
-- Updated_at triggers
-- =============================================================
create trigger set_updated_at_build_logs
  before update on public.build_logs
  for each row execute function public.set_updated_at();
