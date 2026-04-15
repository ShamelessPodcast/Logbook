# Logbook

**Twitter for car owners — your licence plate is your identity.**

Logbook is a UK social media platform where car owners can share their builds, discoveries, and automotive life. Your number plate is your verified identity on the platform.

## Features

- **Feed** — Post updates, photos, and share your automotive life
- **Plate Identity** — Your UK registration plate is your verified identity
- **Plate Lock** — Pay £9.99/yr to lock your plate and get a verified badge
- **Garage** — Track your vehicles with MOT/tax status via DVLA integration
- **Groups** — Join communities around makes, models, and interests
- **Marketplace** — Buy and sell cars and parts
- **Messaging** — Direct messages between users
- **Notifications** — Real-time alerts for likes, reposts, follows, and replies

## Stack

- **Frontend** — Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend** — Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
- **Payments** — Stripe Checkout (plate locking)
- **Email** — Resend (MOT/tax reminders)
- **Deployment** — Vercel

## Development Setup

### Prerequisites

- Node.js 18+
- Supabase CLI
- Stripe CLI (for webhook testing)

### Install

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `NEXT_PUBLIC_APP_URL` | App URL (http://localhost:3000 locally) |
| `STRIPE_SECRET_KEY` | Stripe secret key (use `sk_test_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `RESEND_API_KEY` | Resend API key for emails |
| `DVLA_API_KEY` | DVLA Vehicle Enquiry Service API key |

### Database

Apply migrations via Supabase CLI:

```bash
supabase db push
```

Or run migrations manually in the Supabase SQL editor from `supabase/migrations/`.

### Run Locally

```bash
npm run dev
```

### Stripe Webhooks (local testing)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Deployment

Deploy to Vercel. Set all environment variables in the Vercel project settings.

After deploying, register the Stripe webhook endpoint:
- URL: `https://your-domain.com/api/stripe/webhook`
- Events: `checkout.session.completed`

## Project Structure

```
src/
  app/
    (auth)/          # Login, signup, password reset
    (app)/           # Main app (feed, garage, profiles, etc.)
    api/             # API routes (DVLA proxy, Stripe webhooks)
  components/
    ui/              # Base UI components (Button, Input, UKPlate, etc.)
    feed/            # Post composer, feed list, post card
    garage/          # Vehicle cards and forms
    layout/          # Sidebar, mobile tab bar
    messaging/       # Conversation view
    plate/           # Plate lock/follow buttons
  hooks/             # useUser, useRealtime, useInfiniteScroll
  lib/               # Supabase clients, Stripe, Resend, DVLA
  types/             # Database types
  utils/             # cn, plate validation, formatting
supabase/
  migrations/        # SQL migrations (001–004)
  functions/         # Edge Functions (mot-reminder, tax-reminder)
```

## Licence

Private — All rights reserved.
