# Autism Edmonton LMS

A calm, accessible Netflix-style learning management system for the autism community. Built for autistic adults, caregivers, professionals, educators, and employers.

## Contributors

This project was created by our natHacks 2026 team.

- Aidan and AyaanM worked together on the core codebase, including the HTML pages, web app structure, SQL database design, Java app component, frontend styling, and LMS feature implementation.
- Other team members contributed to research, planning, design feedback, testing, and presentation preparation.

This project was a collaborative effort focused on building an accessible learning platform for Autism Edmonton.
## Tech stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS (autism-friendly light blue/green palette)
- **Backend**: Supabase (Auth + Postgres + Row Level Security)
- **Video**: Vimeo embeds (never YouTube)
- **AI**: Placeholder routes ready for Anthropic SDK integration

## Getting started

### 1. Clone and install

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Run `supabase/seed.sql` to add sample data

### 3. Configure environment

```bash
cp .env.example .env.local
# Fill in your Supabase URL and anon key
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Key features

- **13 pages**: Landing, sign-up/in, profile setup, home dashboard, library, video detail, games, subscription, progress, profile, contact, employee dashboard
- **Autism-friendly design**: Soft blue/green palette, large whitespace, no flashing, minimal animation, keyboard accessible
- **Accessibility panel**: Dark/light mode, high contrast, invert colors, font size (small/normal/large), zoom (100/115/130%)
- **Video categories**: Housing, Employment, Mental Health, Relationships, Identity
- **User roles**: Autistic Adult, Caregiver/Parent/Guardian, Professional, Educator, Employer
- **AI features** (premium): Chat assistant, video summaries, smart search — all mocked, structured for Anthropic SDK
- **Built-in games**: Emotion Match, Calm Breathing, Memory Cards, Job Interview Practice, Daily Routine Builder, Communication Choices
- **Subscription**: Free / Premium ($10/month CAD) — Stripe-ready structure
- **Employee dashboard**: Add/edit/delete videos, manage contacts, view user progress

## Adding Stripe

1. Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `.env.local`
2. Replace the `handleUpgrade()` function in `app/(dashboard)/subscription/page.tsx` with a Stripe Checkout session
3. Add a webhook handler at `app/api/subscriptions/route.ts` to update subscription status on payment events

## Adding real AI (Anthropic)

1. Add `ANTHROPIC_API_KEY` to `.env.local`
2. In `app/api/ai/chat/route.ts`, replace `generateReply()` with an `@anthropic-ai/sdk` call
3. In `app/api/ai/summary/route.ts`, replace the mock with a summarization call using the transcript text

## Employee access

To give a user employee access:

```sql
UPDATE profiles SET is_employee = TRUE WHERE email = 'staff@example.com';
```

## Design system

All colors are CSS custom properties defined in `app/globals.css` and mapped in `tailwind.config.ts`:

| Token | Light | Dark |
|---|---|---|
| `background` | `#EFF7FB` | `#0F2030` |
| `accent` | `#3D8FB5` (calm blue) | `#5BAAD6` |
| `sage` | `#4FA87A` (soft green) | `#6BBE94` |
| `card` | `#FFFFFF` | `#172B3A` |
