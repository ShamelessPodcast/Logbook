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

---

## Session 2 — 2026-04-28 (Infrastructure Migration)

### Completed
- [x] GitHub repo `ShamelessPodcast/Logbook` confirmed live. Untracked brand PNG files committed + pushed. All 10 commits on `main`.
- [x] Supabase project `euduwyhbahrxsaytfzki` (EU West) confirmed live with all 7 migrations applied.
  - Migration 007 (`plate_mention` notification constraint) run via SQL editor.
  - All 5 storage buckets confirmed: `avatars`, `post-images`, `listing-images`, `group-covers`, `vehicle-images`.
- [x] Supabase Auth configured:
  - Site URL: `https://logbook-sable-one.vercel.app`
  - Redirect URLs: production + `https://*.vercel.app/auth/callback` + localhost
- [x] Vercel env vars fixed and expanded:
  - Fixed `NEXT_PUBLIC_APP_URL` (was empty), fixed trailing `\n` in 5 vars.
  - All 10 vars now set for Production, Preview **and** Development environments.
- [x] `.env.example` updated with full var list (PlateRecognizer, DVSA, Sentry added).
- [x] `.env.local` updated with PlateRecognizer API key.
- [x] PlateRecognizer API key retrieved from `app.platerecognizer.com` and added to Vercel + `.env.local`.
- [x] Production deploy successful: `https://logbook-sable-one.vercel.app` — all routes 200, DB live (2 profiles, 1 post confirmed).
- [x] PROGRESS.md updated to 100/100, all blockers resolved.

### Remaining Manual Steps
| # | Item |
|---|------|
| M1 | Stripe keys (4 vars) → Vercel env |
| M2 | Register Stripe webhook URL in Stripe dashboard |
| M3 | Resend API key → Vercel `RESEND_API_KEY` |
| M4 | DVLA API key |
| M5 | DVSA MOT History API key |
| M6 | Deploy Edge Functions via Supabase CLI |
| M7 | Custom domain |
