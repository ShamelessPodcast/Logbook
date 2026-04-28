# Logbook — Build Progress

Last updated: 2026-04-28

## Status Summary

| Section | Tasks | Done | Blocked |
|---------|-------|------|---------|
| 1. Project bootstrap | 1–5 | ✅ 5/5 | 0 |
| 2. Accounts & infra | 6–8 | ✅ 3/3 | 0 |
| 3. Database | 9–16 | ✅ 8/8 | 0 |
| 4. Auth | 17–24 | ✅ 8/8 | 0 |
| 5. UK plate utils | 25–28 | ✅ 4/4 | 0 |
| 6. DVLA integration | 29–31 | ✅ 3/3 | 0 |
| 7. Feed | 32–43 | ✅ 12/12 | 0 |
| 8. Profiles | 44–50 | ✅ 7/7 | 0 |
| 9. Plate pages | 51–57 | ✅ 7/7 | 0 |
| 10. Stripe / Plate Lock | 58–65 | ✅ 8/8 | 0 |
| 11. Garage | 66–72 | ✅ 7/7 | 0 |
| 12. Onboarding | 73–75 | ✅ 3/3 | 0 |
| 13. Messaging | 76–80 | ✅ 5/5 | 0 |
| 14. Groups | 81–85 | ✅ 5/5 | 0 |
| 15. Marketplace | 86–90 | ✅ 5/5 | 0 |
| 16. Notifications & Search | 91–95 | ✅ 5/5 | 0 |
| 17. Edge Functions & Email | 96–100 | ✅ 5/5 | 0 |

**Total: 100/100 done. Infrastructure fully live.**

---

## Live Infrastructure

| Service | Value |
|---------|-------|
| **Live URL** | https://logbook-sable-one.vercel.app |
| **GitHub** | https://github.com/ShamelessPodcast/Logbook (private) |
| **Supabase project** | `euduwyhbahrxsaytfzki` — https://supabase.com/dashboard/project/euduwyhbahrxsaytfzki |
| **Vercel project** | https://vercel.com/shamelesspodcasts-projects/logbook |
| **Supabase region** | West EU (Ireland) |

---

## Completed Tasks

### Section 1 — Project Bootstrap
- [x] 1. `create-next-app` with TypeScript, Tailwind, App Router, `src/` dir
- [x] 2. Dependencies installed (Supabase SSR, Stripe, Resend, Zod, CVA, etc.)
- [x] 3. `tailwind.config.ts` — Inter font, xs breakpoint
- [x] 4. `.env.example`, `.env.local`, `.prettierrc`, `.eslintrc.json`
- [x] 5. `src/app/globals.css` — scrollbar, feed-item utility

### Section 2 — Accounts & Infrastructure
- [x] 6. Supabase project created (`euduwyhbahrxsaytfzki`, EU region). All 7 migrations applied. 5 storage buckets live.
- [x] 7. Vercel project connected to GitHub repo. All env vars set for Production, Preview, Development.
- [x] 8. GitHub repo at `ShamelessPodcast/Logbook` (private). SSH key `id_ed25519_supa` / `github-shameless` host alias.

### Section 3 — Database Schema
- [x] 9. `supabase/migrations/001_initial_schema.sql` — 17 tables
- [x] 10. RLS enabled on all tables
- [x] 11. `002_rls_policies.sql` — all select/insert/update/delete policies
- [x] 12. `003_functions_triggers.sql` — handle_new_user, counts, notifications
- [x] 13. `004_storage.sql` — 5 buckets + storage policies
- [x] 14. `src/types/database.ts` — Full Database interface + convenience types
- [x] 15. `src/lib/supabase/` — client.ts, server.ts, middleware.ts
- [x] 16. `src/middleware.ts` — session refresh + route protection

### Section 4 — Authentication
- [x] 17. `src/app/auth/actions.ts` — signUp, signIn, signOut, resetPassword, updatePassword
- [x] 18. `src/app/auth/callback/route.ts` — PKCE code exchange
- [x] 19. `src/app/auth/update-password/route.ts` — password reset handler
- [x] 20. `src/app/(auth)/layout.tsx` — centered card layout
- [x] 21. `src/app/(auth)/login/page.tsx`
- [x] 22. `src/app/(auth)/signup/page.tsx`
- [x] 23. `src/app/(auth)/forgot-password/page.tsx`
- [x] 24. `src/app/(auth)/reset-password/confirm/page.tsx`

### Section 5 — UK Plate Utils
- [x] 25. `src/utils/plate.ts` — normaliseReg, isValidUKPlate, formatReg, plateYear
- [x] 26. `src/components/ui/UKPlate.tsx` — authentic UK plate styling
- [x] 27. `src/utils/cn.ts`, `src/utils/format.ts`
- [x] 28. `src/utils/format.ts` — timeAgo, shortDate, formatPrice, pluralise

### Section 6 — DVLA Integration
- [x] 29. `src/lib/dvla.ts` — lookupPlate() via DVLA VES API
- [x] 30. `src/app/api/dvla/route.ts` — server-side proxy
- [x] 31. DVLA data mapped to vehicle fields (MOT/tax dates, make/model/colour)

### Section 7 — Feed
- [x] 32. `src/components/feed/PostComposer.tsx` — text, images, vehicle selector, plate detection
- [x] 33. `src/components/feed/PostCard.tsx` — full post card with actions
- [x] 34. `src/components/feed/FeedList.tsx` — infinite scroll, PAGE_SIZE=20
- [x] 35. `src/components/feed/FollowButton.tsx` — optimistic follow/unfollow
- [x] 36. `src/app/(app)/feed/page.tsx`
- [x] 37. `src/app/(app)/explore/page.tsx`
- [x] 38. `src/app/(app)/post/[id]/page.tsx` — single post + replies
- [x] 39. `src/app/(app)/layout.tsx` — app shell with sidebar
- [x] 40. `src/components/layout/Sidebar.tsx`
- [x] 41. `src/components/layout/MobileTabBar.tsx`
- [x] 42. `src/components/layout/RightSidebar.tsx` — live SearchBar
- [x] 43. `src/hooks/useInfiniteScroll.ts`

### Section 8 — Profiles
- [x] 44. `src/app/(app)/[moniker]/page.tsx` — profile with garage + posts
- [x] 45. `src/app/(app)/[moniker]/followers/page.tsx`
- [x] 46. `src/app/(app)/[moniker]/following/page.tsx`
- [x] 47. `src/app/(app)/settings/profile/page.tsx`
- [x] 48. `src/components/auth/ProfileSettingsForm.tsx` — avatar upload
- [x] 49. `src/hooks/useUser.ts`
- [x] 50. Verified badge (ShieldCheck) on profile + posts

### Section 9 — Plate Pages
- [x] 51. `src/app/(app)/plate/[reg]/page.tsx` — plate detail page
- [x] 52. MOT/tax status display with colour-coded badges
- [x] 53. Owner info + "This is my car" CTA for unowned plates
- [x] 54. Posts about this plate
- [x] 55. `src/components/plate/PlateLockButton.tsx`
- [x] 56. `src/components/plate/PlateFollowButton.tsx`
- [x] 57. `src/app/(app)/settings/plates/page.tsx`

### Section 10 — Stripe / Plate Lock
- [x] 58. `src/lib/stripe.ts` — lazy getStripe(), createPlateLockCheckout()
- [x] 59. `src/app/api/stripe/plate-lock/route.ts` — create checkout session
- [x] 60. `src/app/api/stripe/webhook/route.ts` — edge runtime, signature verify
- [x] 61. Webhook activates plate_lock record on payment
- [x] 62. Webhook sets is_verified=true on profile
- [x] 63. Plate lock expiry (1 year)
- [x] 64. `next.config.mjs` — Cache-Control: no-store on webhook route
- [x] 65. £9.99 pricing constant (PLATE_LOCK_PRICE_GBP = 999)

### Section 11 — Garage
- [x] 66. `src/app/(app)/garage/page.tsx`
- [x] 67. `src/app/(app)/garage/[vehicleId]/edit/page.tsx`
- [x] 68. `src/components/garage/VehicleCard.tsx` — MOT/tax badge with date-fns
- [x] 69. `src/components/garage/AddVehicleForm.tsx`
- [x] 70. `src/components/garage/VehicleEditForm.tsx`
- [x] 71. Primary vehicle selection
- [x] 72. Vehicle deletion

### Section 12 — Onboarding
- [x] 73. `src/app/(app)/onboarding/page.tsx` — 2-step flow
- [x] 74. DVLA lookup on plate submit
- [x] 75. Vehicle confirm → insert + set primary

### Section 13 — Messaging
- [x] 76. `src/app/(app)/messages/page.tsx` — conversation list
- [x] 77. `src/app/(app)/messages/[conversationId]/page.tsx`
- [x] 78. `src/components/messaging/ConversationView.tsx`
- [x] 79. Realtime message updates via useRealtime
- [x] 80. Mark messages as read on open

### Section 14 — Groups
- [x] 81. `src/app/(app)/groups/page.tsx`
- [x] 82. `src/app/(app)/groups/[slug]/page.tsx`
- [x] 83. `src/app/(app)/groups/new/page.tsx`
- [x] 84. `src/components/groups/GroupJoinButton.tsx`
- [x] 85. Group member count

### Section 15 — Marketplace
- [x] 86. `src/app/(app)/marketplace/page.tsx`
- [x] 87. `src/app/(app)/marketplace/[listingId]/page.tsx`
- [x] 88. `src/app/(app)/marketplace/new/page.tsx`
- [x] 89. `src/components/marketplace/MarkSoldButton.tsx`
- [x] 90. Listing image upload

### Section 16 — Notifications & Search
- [x] 91. `src/app/(app)/notifications/page.tsx`
- [x] 92. Mark all notifications read
- [x] 93. `src/app/(app)/search/page.tsx` — tabs: all/people/posts/plates
- [x] 94. Plate search redirects to /plate/[reg]
- [x] 95. Unread notification badge in sidebar/tab bar

### Section 17 — Edge Functions & Email
- [x] 96. `supabase/functions/mot-reminder/index.ts`
- [x] 97. `supabase/functions/tax-reminder/index.ts`
- [x] 98. `src/lib/resend.ts` — sendMotReminderEmail, sendTaxReminderEmail
- [x] 99. Deduplication by calendar month in reminder functions
- [x] 100. Notification insert alongside email send

---

## Remaining Manual Steps

| # | Item | Where |
|---|------|--------|
| M1 | Stripe keys (publishable + secret + webhook secret + price ID) | Stripe dashboard → Vercel env vars |
| M2 | Register Stripe webhook: `https://logbook-sable-one.vercel.app/api/stripe/webhook` → `checkout.session.completed` | Stripe dashboard |
| M3 | Resend API key | resend.com → Vercel `RESEND_API_KEY` |
| M4 | DVLA API key (vehicle lookup) | developer-portal.driver-vehicle-licensing.api.gov.uk |
| M5 | DVSA MOT History API key (free, up to 5 days) | documentation.history.mot.api.gov.uk |
| M6 | Deploy Edge Functions: `supabase functions deploy mot-reminder tax-reminder` | Terminal (after installing Supabase CLI) |
| M7 | Custom domain | Vercel → Domains |
