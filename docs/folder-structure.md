# Folder Structure

The repository is managed as an npm workspace. This section explains what lives where and why it matters.

## Root
- `package.json` – workspace scripts (`npm run dev`, `npm run build`, etc.) and shared dependencies.
- `production.env.example` – canonical list of environment variables for both backend and frontend deployments.
- `scripts/` – ad-hoc Node scripts for data cleanup, diagnostics, and deployment automation.
- `supabase/` – SQL schema, migrations, and seed data for Supabase.
- `docs/` – documentation suite (you are here).

## Frontend (`frontend/`)
- `src/App.tsx` – top-level router and React Query provider.
- `src/components/` – reusable UI components grouped by domain (admin, auth, menu, layout, ui primitives).
- `src/pages/` – routed screens such as `HomePage`, `CheckoutPage`, `OrdersPage`, and admin dashboards.
- `src/hooks/` – React Query hooks (`useMenu`, `useOrders`, admin analytics hooks).
- `src/services/` – API clients (axios instance, menu/order services, Supabase client wrapper, business/delivery helpers).
- `src/stores/` – Zustand stores for auth, cart, admin data, business metadata, and delivery state.
- `src/types/` – UI-friendly type definitions mirrored from the shared package.
- `src/utils/` – formatting helpers, phone validators, rate limiter utilities, and temporary calculations.
- `public/` – static assets copied into the build output.
- `vite.config.ts` – Vite + PWA configuration, path aliases, and dev server proxy rules.

## Backend (`backend/`)
- `src/server.ts` – Express bootstrapper with middleware registration, static serving, and health endpoint.
- `src/config/` – environment configuration loader.
- `src/routes/` – route handlers grouped by capability (`menu`, `orders`, `admin`, `business`, `delivery`, `payments`).
- `src/middleware/` – authentication, validation, and rate-limiting middleware.
- `src/services/` – Supabase client wrappers, PayHere integration, delivery logic, and admin order helpers.
- `src/types/` – backend-only interfaces (`ApiResponse`, menu/order models).
- `Dockerfile` – production container definition used by Fly.io.

## Shared (`shared/`)
- `src/types/` – canonical TypeScript interfaces for menu, order, and analytics models.
- `src/utils/` – helpers that can be compiled and imported into frontend or backend builds.
- `tsconfig.json` – build settings for the shared package (referenced by other workspace tsconfigs).

## Supabase (`supabase/`)
- `schema.sql` – base schema applied to new databases.
- `migrations/` – incremental change scripts for delivery features, order status workflows, and data fixes.
- `seed.sql` – optional seed data to bootstrap a demo environment.

Refer back to this document when onboarding contributors so that every change lands in the correct package.
