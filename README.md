# Autism Edmonton LMS

A calm, accessible Netflix-style learning management system for the autism community. Built for autistic adults, caregivers, professionals, educators, and employers.

This website was developed as part of natHacks / natIgnite 2026 in collaboration with Autism Edmonton as the problem provider. The platform is designed to make autism-related learning resources easier to access through organized video learning, user profiles, progress tracking, accessibility tools, games, resources, and future AI-supported learning features.

## Website

The live website can be viewed here:

https://limitless-mind-seven.vercel.app/resources

Some pages may require sign-in because the LMS includes user accounts, protected learning resources, progress tracking, subscription-related features, and employee/admin tools.

## Contributors

This project was created by our natHacks 2026 team.

- Aidan and AyaanM worked together on the core codebase, including the HTML pages, web app structure, SQL database design, Java app component, frontend styling, and LMS feature implementation.
- Other team members contributed to research, planning, design feedback, testing, and presentation preparation.

This project was a collaborative effort focused on building an accessible learning platform for Autism Edmonton.

## Project Purpose

Autism Edmonton LMS is designed to extend Autism Edmonton’s learning and support resources into a structured digital platform. The goal is to create a calm and accessible online space where users can browse learning content, watch videos, explore support resources, play educational games, track progress, and access features based on their profile role.

The platform is intended for:

- Autistic adults
- Caregivers, parents, and guardians
- Professionals
- Educators
- Employers
- Community members looking for autism-related learning resources

The design prioritizes accessibility, simplicity, low sensory load, and clear navigation.

## Tech stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS (autism-friendly light blue/green palette)
- **Backend**: Supabase (Auth + Postgres + Row Level Security)
- **Video**: YouTube links (thumbnail browsing, opens YouTube in new tab)
- **AI**: Placeholder routes ready for Anthropic SDK integration

## Getting started

### 1. Clone the repository

```bash
git clone <repository-url>
cd <project-folder>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Open the Supabase SQL Editor
3. Run `supabase/schema.sql`
4. Run `supabase/seed.sql` to add sample data

### 4. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Then fill in the required Supabase environment variables in `.env.local`.

Common required variables may include:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Optional future variables may include:

```env
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_MOCK_SUBSCRIPTION=
```

### 5. Run locally

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

Until Stripe is connected, the "Upgrade to Premium" button activates premium directly in the database (dev mode). Set `NEXT_PUBLIC_MOCK_SUBSCRIPTION=true` in `.env.local` to give all users premium access without clicking through.

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

## Intellectual Property and Usage Rights

This project was created as part of natIgnite 2026 in collaboration with Autism Edmonton as the problem provider.

Under the natIgnite 2026 Problem Provider Agreement, the project contributors retain ownership of the innovations they created during the event. Autism Edmonton, as the problem provider, has been granted a non-exclusive, worldwide, royalty-free, perpetual, and irrevocable license to use, modify, reproduce, distribute, display, create derivative works from, and commercialize the project outputs, including use in learning platforms, training materials, video content, and subscription-based services.

The project contributors may also continue to use, build upon, and commercialize their work independently, subject to the terms of the agreement.

This repository is provided for project demonstration, documentation, and development purposes.