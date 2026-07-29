# Nightshift

**A crew of AI agents that manages all your projects overnight and hands you a brief in the morning.**

You go to bed. At 2am five agents wake up, look at every project you're running, work out
what actually moved and what's quietly rotting, do the small things themselves, and put
anything that needs your judgement in a queue. You wake up, open one page, and know where
everything stands.

---

## What it actually does

Every night, in order:

| | Agent | What it does | What it may change |
|---|---|---|---|
| 1 | **Scout** | Reads every source on every active project. Commits, pull requests, open issues, whether your site is up. | Observations only |
| 2 | **Analyst** | Decides how each project is genuinely going, against its goal and its history. Willing to say "stalled". | Project health |
| 3 | **Planner** | Chooses what should happen next — only from a fixed catalogue of permitted actions. | Proposes; executes nothing |
| 4 | **Operator** | Carries out what the guardrails allow. Queues the rest for you. **Has no model access at all.** | Projects, decisions, audit log |
| 5 | **Scribe** | Writes the morning brief. | One brief |

The separation is the point. The agents that can think can't act, and the agent that can act
can't think. A hallucinated capability never becomes a real one, because the Operator is a
switch statement over nine allowed operations and nothing else.

## What it can't do

By construction, not by instruction:

- No email, no messages, no Slack, no posting anywhere.
- No spending, no payments, no subscriptions.
- No deletion of anything, ever.
- No access to any system that isn't explicitly attached to a project as a source.
- No writes to your repositories. The GitHub connector is read-only.

High-risk actions — currently just "draft a message intended for a human" — are **never**
executed automatically, at any autonomy level. That's enforced in `src/lib/guardrails.ts`,
not requested in a prompt.

---

## Setup

Roughly fifteen minutes, most of it waiting for Vercel.

### 1. Database

Create a Supabase project, open the SQL editor, and run
[`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql).

From **Settings → API**, copy the project URL and the **service role** key.

### 2. Environment

```bash
cp .env.example .env.local
```

Fill in at minimum:

```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Add `ANTHROPIC_API_KEY` when you're ready for the crew to think. Without it everything still
runs — sources are polled, observations recorded, the dashboard populated — but no model is
called. That's dry-run mode, and it's a good way to spend the first night.

### 3. Run it locally

```bash
npm install
npm run nightshift:seed   # optional: two example projects
npm run dev               # dashboard at localhost:3000
npm run nightshift:run    # do a shift right now, in your terminal
```

### 4. Deploy

Push to GitHub, import into Vercel, set the same environment variables in the project
settings. `vercel.json` registers the cron schedule: a full run at 02:00 UTC, then resume
ticks through to 03:20.

> Vercel Cron on the Hobby plan is limited to one job per day. Nightshift's resume ticks need
> the Pro plan. On Hobby, keep only the `/api/cron/nightly` entry and lower
> `NIGHTSHIFT_MAX_PROJECTS` so a night fits in one invocation.

Finally, set `CRON_SECRET` and `NIGHTSHIFT_PASSWORD`. Without them the cron endpoints and the
dashboard are open to anyone who finds the URL — the dashboard tells you so on every page
until you fix it.

---

## Adding a project

Projects live at `/projects`. Each one needs:

- **A name.**
- **A goal.** Be specific. "500 signed-up users and a working plate-lock flow by September"
  gives the Analyst something to measure against. "Grow the platform" doesn't, and you'll get
  a brief that reads like a horoscope.
- **At least one source.** With no sources the crew has nothing to look at and will honestly
  report the project as unknown every night.

Source types:

| Kind | Config | What the Scout sees |
|---|---|---|
| `github_repo` | `owner/name` | Commits in the last 7 days, open PRs and their age, open issues |
| `url` | `https://…` | Status code, response time, whether the page content changed |
| `note` | free text | Standing context you want the crew to hold in mind |

---

## Autonomy

`NIGHTSHIFT_AUTONOMY` decides how much the Operator may do without you:

| Value | Behaviour |
|---|---|
| `dry_run` | Thinks, records everything, executes nothing |
| `low_risk_live` | Executes low-risk actions; queues medium and high **(default)** |
| `full_live` | Executes low and medium risk; high still waits |

The full list of permitted actions, and which of them run automatically at your current
setting, is on the **Crew** page in the dashboard. It's generated from the same catalogue the
Planner is handed, so it can't drift out of date with reality.

Start on `dry_run` for a few nights. Read the briefs. Move up when you trust it.

---

## Cost

A run costs roughly one model call per project per thinking agent — three calls per project,
plus one for the brief. On Claude Opus 5 with ten projects that lands around 15–40p a night,
depending on how much source material each project has.

`NIGHTSHIFT_MAX_SPEND_PENNIES` (default 200) is a hard ceiling. The run stops when it's hit
and resumes the next night rather than quietly emptying your account.

Every run records its own token usage and cost; `/runs` shows the running total.

---

## Why it's built the way it is

**Serverless functions get killed on a wall clock, and reviewing twenty projects with a
frontier model takes longer than that.** So a run is a resumable state machine. Each phase
records which projects it finished; when an invocation runs low on time it checkpoints and
returns, and a later tick continues from exactly there. A night is never lost to a timeout —
it just takes two or three invocations.

**A stalled project is the thing you most need to be told about, and the thing an eager
assistant is least likely to say.** So the Analyst is instructed explicitly that silence is
not progress, and there's a deterministic floor under its judgement: fourteen days without
detected activity forces `stalled`, whatever a generous reading of the evidence might
suggest.

**Risk is assigned by the catalogue, never by the model.** An agent that could label its own
action low-risk would eventually do so.

**The brief is allowed to be short.** The Scribe is told that a quiet night should produce two
sentences. A system that manufactures three paragraphs every morning stops being read within
a week, and then none of the rest of this matters.

---

## Project layout

```
src/
  lib/
    agents/        Scout, Analyst, Planner, Operator, Scribe
    connectors/    GitHub, URL — read-only, judgement-free
    guardrails.ts  The action catalogue, risk levels, autonomy, budgets
    orchestrator.ts  The resumable state machine
    llm.ts         The single door to the model; structured output + dry run
  app/
    page.tsx       Command deck
    projects/      Project list and detail
    decisions/     The approval queue
    runs/          Every shift, in full
    crew/          What the crew is and what it may do
    api/cron/      nightly + resume tick
supabase/migrations/001_init.sql
```

## Licence

Private — all rights reserved.
