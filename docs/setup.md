# Setup Guide

Use this guide to configure RealTaste for local development or a new deployment environment.

## Prerequisites
- Node.js **18+** and npm **9+** (enforced via `package.json` engines).
- Supabase project with database access and service role credentials.
- PayHere sandbox or production merchant account.
- Mapbox and OpenCage API keys for geocoding and map tiles.
- (Optional) Firebase project if enabling push notifications.

## 1. Clone & install
```bash
git clone https://github.com/Spyboss/RealTaste.git
cd RealTaste
npm install
```
The root workspace installs dependencies for `frontend/`, `backend/`, and `shared/` packages.

## 2. Environment variables
Use `production.env.example` as a reference. For local development create:
- `.env` in the repository root (consumed by the backend)
- `frontend/.env` for Vite

### Backend `.env`
```
NODE_ENV=development
PORT=3001

SUPABASE_URL=... # Supabase project URL
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

JWT_SECRET=change-me
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001

PAYHERE_MERCHANT_ID=...
PAYHERE_MERCHANT_SECRET=...
USE_LIVE_PAYHERE=false

RESTAURANT_NAME=RealTaste
RESTAURANT_PHONE=+94 76 000 0000
BUSINESS_OPEN_TIME=10:00
BUSINESS_CLOSE_TIME=22:00

VITE_RESTAURANT_LAT=6.261449
VITE_RESTAURANT_LNG=80.906462

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```
Optional keys such as `PAYHERE_API_APP_ID`, Firebase credentials, and additional delivery overrides can also be included.

### Frontend `frontend/.env`
```
VITE_APP_NAME=RealTaste
VITE_APP_VERSION=local

VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_API_URL=http://localhost:3001/api

VITE_RESTAURANT_LAT=6.261449
VITE_RESTAURANT_LNG=80.906462

VITE_MAPBOX_ACCESS_TOKEN=...
VITE_OPENCAGE_API_KEY=...

VITE_PAYHERE_MERCHANT_ID=...
VITE_PAYHERE_SANDBOX=true
```
Add Firebase web keys if notifications will be tested.

## 3. Database provisioning
1. Sign in to Supabase and create a project.
2. Run `supabase/schema.sql` against the project database.
3. Apply migrations in chronological order from `supabase/migrations/` (for delivery and workflow enhancements).
4. (Optional) Load `supabase/seed.sql` for demo data.

## 4. Development workflow
```bash
# Start API + PWA together
npm run dev

# Only frontend
npm run dev:frontend

# Only backend
npm run dev:backend
```
The Vite dev server proxies `/api/*` calls to `http://localhost:3001`.

Additional scripts:
- `npm run type-check` – TypeScript checking across all workspaces.
- `npm run lint` – ESLint using workspace configs.
- `npm run build` – Builds shared package, frontend, and backend sequentially.

## 5. Verifying integrations
- `GET http://localhost:3001/health` should return a JSON health payload.
- Visit `http://localhost:5173` to browse the menu; create a test order to ensure Supabase writes succeed.
- Inspect the Supabase dashboard for new rows in `orders`, `order_items`, and `delivery_time_slots`.
- Trigger a PayHere sandbox payment to validate webhooks (`/api/payments/webhook`) by exposing the local server via tunnelling (e.g., `ngrok`) or by deploying the backend to Fly.io.

## 6. Production deployment checklist
- Set Fly.io secrets for all backend environment variables (see `production.env.example`).
- Configure Cloudflare Pages build settings: root `frontend`, build command `npm install && npm run build`, output `dist`.
- Enable HTTPS and custom domains if applicable.
- Configure Supabase RLS policies to restrict access (policies are defined in the SQL scripts, but verify they are active).
- Rotate credentials regularly and enforce 2FA on all provider accounts.

Once the environment is healthy, proceed to the workflow documentation for admin (`docs/admin-workflows.md`) and customer journeys (`docs/user-flow.md`).
