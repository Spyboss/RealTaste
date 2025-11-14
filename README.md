# RealTaste PWA

## Project Overview
RealTaste is a production-ready restaurant ordering platform designed for Sri Lankan takeout businesses. The platform delivers a mobile-first PWA that lets customers browse the menu, place pickup or delivery orders, and track status updates in real time. Restaurant operators manage the same workload through an analytics-driven admin dashboard that runs in the browser and synchronises with Supabase. The system was built by Uminda H. to modernise day-to-day restaurant operations without relying on native apps.

## Features
### Customer experience
- Browse live menu data grouped by category with variant and addon pricing.
- Persistent cart with variant/addon awareness powered by Zustand storage.
- Checkout flow with pickup or delivery selection, Mapbox-powered address capture, and automatic delivery fee calculation.
- PayHere card payments alongside cash on delivery/pickup.
- Order confirmation pages that surface itemised totals and delivery estimates.
- Authenticated order history with Supabase-backed email/password or Google login.
- Installable PWA with offline caching via `vite-plugin-pwa`.

### Operator tooling
- Secure Supabase-authenticated admin routes protected by JWT middleware.
- Real-time order queue that reacts to Supabase Postgres change feeds.
- Dashboard cards for revenue, order volume, and popular items with trend visualisations.
- Delivery control surface for configuring base fees, kilometre surcharges, and maximum range.
- Bulk and per-order status management, cancellation controls, and analytics exports (CSV/XLSX helpers in `frontend/src/services`).

## Tech Stack
- **Frontend:** React 18, TypeScript 5, Vite 6, Tailwind CSS 3, React Query, React Router, Zustand, Mapbox GL, `vite-plugin-pwa`.
- **Backend:** Node.js 18+, Express 4, TypeScript 5, Supabase JS v2, Joi validation, Express Rate Limit, Helmet, Compression.
- **Shared:** Workspace package for cross-cutting types (`shared/`).
- **Infrastructure:** Supabase (PostgreSQL + Auth + Realtime), Fly.io for the API, Cloudflare Pages for the PWA, PayHere for payments.

## Architecture Overview
```
┌──────────────┐    HTTPS     ┌──────────────┐    PostgREST    ┌──────────────┐
│ React PWA    │ ───────────▶ │ Express API  │ ──────────────▶ │ Supabase     │
│ (Vite, SW)   │ ◀─────────── │ (Fly.io)     │ ◀────────────── │ PostgreSQL    │
└──────────────┘  WebSockets  └──────────────┘   Realtime      └──────────────┘
       │ Mapbox GL & PayHere SDK │       │ PayHere Webhooks │        │ RLS + Functions │
       └────────────┬────────────┘       └──────────┬────────┘        └──────┬────────┘
                    │                                 │                     │
             Customer devices                 PayHere gateway         Admin dashboard
```
- React Query fetches data from `/api/*` endpoints and caches responses per route.
- Zustand stores (`frontend/src/stores`) keep client-side state for auth, cart, delivery settings, and admin metrics.
- Supabase realtime channels broadcast order mutations so the admin queue stays synchronised without polling.
- The Express API validates payloads, computes pricing, and uses the Supabase service role key for privileged writes.
- PayHere notifications flow back into the API to finalise card payment statuses.

## Folder Structure
```
.
├── backend/        # Express API, middleware, Supabase integrations
├── frontend/       # React PWA source, components, hooks, stores
├── shared/         # Shared TypeScript types/utilities used by all workspaces
├── supabase/       # SQL schema, migrations, and seed data
├── docs/           # Project documentation suite
├── scripts/        # Utility scripts for maintenance and diagnostics
└── production.env.example
```
A detailed breakdown lives in [`docs/folder-structure.md`](docs/folder-structure.md).

## How to Run (Local Development)
1. **Node.js**: Install Node 18 or later (see `package.json` engines).
2. **Dependencies**: From the repository root run `npm install` to bootstrap all workspaces.
3. **Environment**:
   - Copy `production.env.example` and trim values into local `.env` files (root for backend, `frontend/.env` for the PWA).
   - Supply Supabase URL/keys, PayHere sandbox credentials, and Mapbox access tokens.
4. **Start both services**: `npm run dev` starts the Express API on port `3001` and Vite dev server on port `5173` via `concurrently`.
5. **Frontend only**: `npm run dev:frontend` inside `frontend/`.
6. **Backend only**: `npm run dev:backend` inside `backend/`.
7. **Type checking & linting**: `npm run type-check` / `npm run lint` from the repo root execute workspace scripts.

Requests from `http://localhost:5173` are proxied to the API using the Vite dev server proxy configuration.

## Deploying the PWA (Production Guide)
### Backend (Fly.io)
1. Install and authenticate `flyctl`.
2. Set secrets (Supabase keys, JWT secret, PayHere credentials, Firebase keys if used) via `fly secrets set`.
3. Build and deploy: `npm run build:backend` then `fly deploy` from `backend/`.
4. Verify with `curl https://<your-app>.fly.dev/health`.

### Frontend (Cloudflare Pages)
1. Connect the repository to Cloudflare Pages.
2. Configure build: Root directory `frontend`, build command `npm install && npm run build`, output directory `dist`.
3. Add environment variables (`VITE_SUPABASE_URL`, `VITE_API_URL`, `VITE_MAPBOX_ACCESS_TOKEN`, etc.).
4. Trigger a deploy on the main branch or via manual build.

Refer to [`docs/setup.md`](docs/setup.md) for exhaustive environment variable lists and migration steps.

## API / Backend Setup
- Provision a Supabase project and execute the SQL in `supabase/schema.sql` plus any migrations under `supabase/migrations/`.
- Configure Row Level Security policies and service role keys as per the SQL scripts.
- Backend environment variables:
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `JWT_SECRET`
  - `PAYHERE_MERCHANT_ID`, `PAYHERE_MERCHANT_SECRET`, optional API keys, `USE_LIVE_PAYHERE`
  - `FRONTEND_URL`, `BACKEND_URL`
  - Optional: Firebase credentials if enabling push notifications.
- Frontend environment variables:
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - `VITE_API_URL`
  - `VITE_RESTAURANT_LAT`, `VITE_RESTAURANT_LNG`
  - `VITE_MAPBOX_ACCESS_TOKEN`, `VITE_OPENCAGE_API_KEY`
  - `VITE_PAYHERE_MERCHANT_ID`

Run `npm run build` at the root to compile `shared/`, `frontend/`, and `backend/` artefacts before packaging Docker images or shipping to production.

## Screenshots / GIFs
Screenshots of the ordering flow and admin dashboard are being curated and will be added to this repository.

## Roadmap
Upcoming initiatives are tracked in [`docs/roadmap.md`](docs/roadmap.md). Focus areas include POS integration, live kitchen displays, multi-restaurant support, and delivery partner handoffs.
