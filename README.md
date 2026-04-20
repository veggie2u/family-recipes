# Family Recipes

A web app for preserving, organizing, and sharing the recipes that bring your family together.

Built with [Next.js](https://nextjs.org) and [Supabase](https://supabase.com).

## Getting started

1. Create a Supabase project at [database.new](https://database.new)

2. Copy `.env.example` to `.env.local` and fill in your project credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=<your project URL>
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your publishable or anon key>
   ```

3. Install dependencies and run the dev server:
   ```bash
   npm install
   npm run dev
   ```

The app will be running at [localhost:3000](http://localhost:3000).

## Tech stack

- **Framework**: Next.js (App Router)
- **Auth & database**: Supabase
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Fonts**: Playfair Display (headings), Geist Sans (body)

## Docs

- [`docs/requirements.md`](docs/requirements.md) — product requirements
- [`docs/branding.md`](docs/branding.md) — visual language & design decisions
- [`docs/database-schema.md`](docs/database-schema.md) — database schema
- [`docs/phase-1-foundation.md`](docs/phase-1-foundation.md) — auth & welcome page
- [`docs/phase-2-recipes.md`](docs/phase-2-recipes.md) — recipe management
- [`docs/phase-3-cookbooks.md`](docs/phase-3-cookbooks.md) — cookbook management
- [`docs/phase-4-families.md`](docs/phase-4-families.md) — family groups
- [`docs/phase-5-permissions-sharing.md`](docs/phase-5-permissions-sharing.md) — permissions & sharing
