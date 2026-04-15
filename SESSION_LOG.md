# Logbook — Session Log

## Session 1 — 2026-04-15

### Completed
- [x] Task 1 (partial): Local git repo initialised. GitHub repo creation blocked — `gh` CLI not authenticated. SSH key `id_ed25519_supa` works for git operations. **Action needed**: `~/bin/gh auth login` with a PAT for SUPAUniverse account, then `gh repo create logbook --private`.
- [x] Task 2: Next.js 14 App Router + TypeScript + Tailwind CSS initialised via `create-next-app@14`.
- [x] Task 3: Folder structure created (`/app /components /lib /hooks /types /utils /supabase`).
- [x] Task 4: ESLint, Prettier, TypeScript strict mode configured.
- [x] Task 5: `.env.local` + `.env.example` created with all vars.

### Blockers
| Task | Blocker | Action needed |
|------|---------|---------------|
| 1 | GitHub repo — `gh` CLI needs auth | Run `~/bin/gh auth login` as SUPAUniverse |
| 6 | Supabase project — needs CLI/dashboard access | Create via dashboard, fill `.env.local` |
| 7 | Vercel project — needs CLI/dashboard + GitHub repo | Do after tasks 1 & 6 |
| 8 | Deploy — blocked by 1 & 7 | |

### In Progress
- Building all application code (tasks 9–100) locally. All code complete and ready to push once blockers resolved.
