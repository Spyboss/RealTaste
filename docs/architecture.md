# Architecture

## High-level system
RealTaste is organised as a TypeScript workspace with three packages:
- `frontend/` – React 18 PWA built with Vite, Tailwind CSS, Zustand, and React Query.
- `backend/` – Express API that brokers all privileged access to Supabase.
- `shared/` – Shared interfaces and utilities consumed by both packages at build time.

Supabase hosts PostgreSQL, authentication, and realtime channels. The backend is deployed to Fly.io and exposes `/api/*` endpoints. The frontend is compiled to static assets and served from Cloudflare Pages, communicating with the API over HTTPS.

## Frontend architecture
- **Routing**: `frontend/src/App.tsx` wires React Router routes for customer, authentication, payment, and admin pages. Protected routes wrap admin and order history paths with role-aware checks.
- **State management**: Zustand stores in `frontend/src/stores` isolate domain concerns:
  - `authStore` orchestrates Supabase sessions, login flows, and token expiry recovery.
  - `cartStore` persists the shopping cart with variant/addon totals.
  - `businessStore`, `deliveryStore`, and `adminStore` cache business metadata, delivery settings, and admin metrics respectively.
- **Data fetching**: React Query (`QueryClientProvider` in `App.tsx`) handles menu, orders, and analytics queries with caching and retry policies. Axios wrappers in `frontend/src/services/api.ts` centralise auth headers and error handling.
- **UI composition**: Components live under `frontend/src/components`. Key groupings include:
  - `components/menu` for menu cards, search, and filters.
  - `components/admin` for dashboard stats, order queue tables, performance monitors, and notifications.
  - `components/auth` for login/register flows and route guards.
- **Maps and delivery**: `MapLocationPicker` combines Mapbox GL and OpenCage geocoding to capture precise delivery coordinates. Delivery fees are recalculated in real time via `/api/delivery/calculate-fee`.
- **Payments**: PayHere JavaScript SDK hooks in `CheckoutPage` start card payments. Success/error callbacks transition users to dedicated result pages.
- **Offline & PWA**: `vite-plugin-pwa` in `frontend/vite.config.ts` registers a service worker that precaches the bundle and caches Supabase requests with a network-first strategy. The manifest supports standalone installation on mobile.

## Backend architecture
- **HTTP server**: `backend/src/server.ts` configures Express with Helmet, CORS, JSON parsing, compression, and rate limiting. Static assets from the frontend build can be served directly if deployed together.
- **Configuration**: `backend/src/config/index.ts` maps environment variables, PayHere settings, CORS origins, and business metadata. Missing Supabase credentials stop the process on boot.
- **Authentication**: Middleware in `backend/src/middleware/auth.ts` validates Supabase JWTs, resolves user roles, and enforces admin-only access for sensitive endpoints.
- **Validation & rate limiting**: Joi schemas in `backend/src/middleware/validation.ts` and per-route limiters in `backend/src/middleware/rateLimiter.ts` protect API boundaries.
- **Services**:
  - `supabase.ts` exposes service-role and anon clients, table constants, and realtime helpers.
  - `deliveryService.ts` encapsulates fee calculation, settings management, and delivery time slot records.
  - `payhere.ts` signs payment requests, verifies webhook payloads, and normalises callback URLs.
  - `adminOrderService.ts` provides queue-level operations reused by the `/api/admin/orders` router.
- **Routing**: Express routers live in `backend/src/routes` and map to thematic API segments (menu, orders, admin, business, delivery, payments).
- **Error handling**: A global error handler logs stack traces in non-production environments and returns structured JSON responses.

## Data flow
1. **Menu and business info**: The frontend reads `/api/menu` and `/api/business/*` to populate menus and store hours. Responses are cached client-side and refreshed via React Query policies.
2. **Ordering**: `CheckoutPage` constructs a `CreateOrderRequest` payload and sends it to `POST /api/orders`. The backend validates menu item availability, calculates totals, persists order + items, and optionally returns PayHere payment payloads.
3. **Realtime updates**: Order status changes trigger Supabase realtime events. `adminStore.subscribeToOrders` in the frontend opens a channel to keep the queue in sync without polling.
4. **Delivery**: When customers toggle delivery, the frontend calls `/api/delivery/calculate-fee`. The backend uses `deliveryService` and Haversine calculations to enforce the configured radius and compute fees.
5. **Payments**: Successful PayHere checkouts redirect back to `/api/payments/return` while asynchronous status notifications hit `/api/payments/webhook`. Both endpoints update order payment_status fields.
6. **Analytics**: Admin dashboards aggregate metrics through `/api/admin/dashboard`, `/api/admin/analytics`, `/api/admin/top-items`, and related endpoints, which query Supabase with filters based on timeframes and statuses.

## Offline and caching considerations
- **Service worker**: Static assets and Supabase API calls are cached by Workbox with cache versioning managed by `vite-plugin-pwa` auto-update.
- **Persisted state**: Zustand stores persist carts and auth sessions to `localStorage`, allowing disconnected users to rebuild requests once connectivity returns.
- **Graceful fallbacks**: Delivery fee calculation defaults to base fees when GPS coordinates are unavailable. Menu requests degrade gracefully with user-facing messaging when Supabase or the API is offline.
