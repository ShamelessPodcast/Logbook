-- =====================================================================
-- Nightshift — initial schema
--
-- Everything the crew learns, decides and does lives here. The dashboard
-- reads it; the nightly run writes it. Access is service-role only: RLS is
-- on with no policies, so the anon key can read nothing even if it leaks.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ── Projects ─────────────────────────────────────────────────────────
-- The unit of work. One row per thing you're running.

create table if not exists projects (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  name              text not null,
  summary           text,
  -- What "done" or "winning" looks like. The crew reads this constantly;
  -- a vague goal produces vague work.
  goal              text,
  status            text not null default 'active'
                      check (status in ('active', 'paused', 'archived')),
  health            text not null default 'unknown'
                      check (health in ('unknown', 'on_track', 'at_risk', 'stalled', 'blocked')),
  health_note       text,
  -- 1 = most important. Drives ordering and, when the run is short on time,
  -- which projects get looked at first.
  priority          int not null default 3 check (priority between 1 and 5),
  next_milestone    text,
  due_at            timestamptz,
  last_activity_at  timestamptz,
  last_reviewed_at  timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists projects_status_priority_idx on projects (status, priority);

-- ── Sources ──────────────────────────────────────────────────────────
-- Where the Scout looks to find out what happened on a project.

create table if not exists project_sources (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references projects (id) on delete cascade,
  kind           text not null
                   check (kind in ('github_repo', 'url', 'note', 'manual')),
  label          text,
  config         jsonb not null default '{}'::jsonb,
  enabled        boolean not null default true,
  last_polled_at timestamptz,
  last_error     text,
  created_at     timestamptz not null default now()
);

create index if not exists project_sources_project_idx on project_sources (project_id);

-- ── Runs ─────────────────────────────────────────────────────────────
-- One night's work. Phases run in order; `cursor` lets a run that ran out
-- of serverless wall-clock resume where it stopped.

create table if not exists runs (
  id             uuid primary key default gen_random_uuid(),
  status         text not null default 'running'
                   check (status in ('running', 'ok', 'failed', 'cancelled')),
  mode           text not null default 'live' check (mode in ('live', 'dry_run')),
  trigger        text not null default 'cron'
                   check (trigger in ('cron', 'manual', 'resume')),
  phase          text not null default 'scout'
                   check (phase in ('scout', 'analyst', 'planner', 'operator', 'scribe', 'done')),
  cursor         jsonb not null default '{}'::jsonb,
  started_at     timestamptz not null default now(),
  finished_at    timestamptz,
  summary        text,
  error          text,
  input_tokens   integer not null default 0,
  output_tokens  integer not null default 0,
  cost_pennies   numeric(10, 3) not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists runs_started_idx on runs (started_at desc);
create index if not exists runs_status_idx on runs (status);

-- ── Observations ─────────────────────────────────────────────────────
-- Facts the Scout gathered and risks the Analyst spotted. Evidence-bearing,
-- never speculative — anything speculative belongs in an action's rationale.

create table if not exists observations (
  id          uuid primary key default gen_random_uuid(),
  run_id      uuid not null references runs (id) on delete cascade,
  project_id  uuid references projects (id) on delete cascade,
  source      text not null default 'unknown',
  kind        text not null default 'signal'
                check (kind in ('progress', 'risk', 'blocker', 'signal', 'idle')),
  title       text not null,
  detail      text,
  evidence    jsonb not null default '[]'::jsonb,
  confidence  numeric(3, 2) not null default 0.50 check (confidence between 0 and 1),
  observed_at timestamptz not null default now()
);

create index if not exists observations_run_idx on observations (run_id);
create index if not exists observations_project_idx on observations (project_id, observed_at desc);

-- ── Actions ──────────────────────────────────────────────────────────
-- What the Planner decided to do, and what the Operator did about it.
-- Nothing happens to a project without a row here.

create table if not exists actions (
  id          uuid primary key default gen_random_uuid(),
  run_id      uuid not null references runs (id) on delete cascade,
  project_id  uuid references projects (id) on delete cascade,
  agent       text not null default 'planner',
  kind        text not null,
  title       text not null,
  rationale   text,
  payload     jsonb not null default '{}'::jsonb,
  risk        text not null default 'low' check (risk in ('low', 'medium', 'high')),
  status      text not null default 'proposed'
                check (status in ('proposed', 'approved', 'rejected', 'executed', 'failed', 'skipped')),
  result      jsonb,
  executed_at timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists actions_run_idx on actions (run_id);
create index if not exists actions_status_idx on actions (status, created_at desc);
create index if not exists actions_project_idx on actions (project_id, created_at desc);

-- ── Decisions ────────────────────────────────────────────────────────
-- The crew's escalation channel. When a project's next step genuinely
-- needs a human, it lands here instead of being guessed at.

create table if not exists decisions (
  id          uuid primary key default gen_random_uuid(),
  run_id      uuid references runs (id) on delete set null,
  project_id  uuid references projects (id) on delete cascade,
  question    text not null,
  context     text,
  options     jsonb not null default '[]'::jsonb,
  urgency     text not null default 'normal' check (urgency in ('low', 'normal', 'high')),
  status      text not null default 'open' check (status in ('open', 'answered', 'dismissed')),
  answer      text,
  answered_at timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists decisions_status_idx on decisions (status, urgency, created_at desc);

-- ── Briefs ───────────────────────────────────────────────────────────
-- The morning handover. One per run that gets far enough to write one.

create table if not exists briefs (
  id         uuid primary key default gen_random_uuid(),
  run_id     uuid not null references runs (id) on delete cascade,
  brief_date date not null default (now() at time zone 'utc')::date,
  headline   text not null,
  body_md    text not null,
  stats      jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists briefs_date_idx on briefs (brief_date desc);

-- ── Audit log ────────────────────────────────────────────────────────
-- Append-only. Every guardrail decision and every executed action.

create table if not exists audit_log (
  id     bigserial primary key,
  at     timestamptz not null default now(),
  actor  text not null,
  action text not null,
  target text,
  detail jsonb not null default '{}'::jsonb
);

create index if not exists audit_log_at_idx on audit_log (at desc);

-- ── Triggers ─────────────────────────────────────────────────────────

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists projects_updated_at on projects;
create trigger projects_updated_at
  before update on projects
  for each row execute function set_updated_at();

-- ── Lock everything down ─────────────────────────────────────────────
-- No policies are defined, so only the service role (which bypasses RLS)
-- can touch these tables. The dashboard runs server-side with that key.

alter table projects        enable row level security;
alter table project_sources enable row level security;
alter table runs            enable row level security;
alter table observations    enable row level security;
alter table actions         enable row level security;
alter table decisions       enable row level security;
alter table briefs          enable row level security;
alter table audit_log       enable row level security;
