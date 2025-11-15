# Admin Workflows

This guide walks through daily operator tasks inside the RealTaste admin dashboard. All screens assume the user is authenticated as an admin (Supabase role `admin`).

## Accessing the dashboard
- Log in at `/login` or via Google OAuth.
- Navigate to `/admin` (protected by `ProtectedRoute requireAdmin`).
- The dashboard loads realtime subscriptions via `useAdminStore.subscribeToOrders()`.

## 1. Monitoring the queue
**Files:** `frontend/src/pages/admin/AdminDashboard.tsx`, `frontend/src/components/admin/OrderQueue.tsx`
1. Use the **Dashboard** tab to view headline metrics (total orders, revenue, average prep time).
2. Switch to the **Queue** tab to see orders grouped by status (`received`, `confirmed`, `preparing`, etc.).
3. Drag-and-drop ordering triggers `PATCH /api/admin/orders/queue/reorder` for priority adjustments.
4. Bulk-select orders and use the status dropdown to call `PATCH /api/admin/orders/bulk-update`.
5. Sound notifications can be toggled via the notification centre component.

## 2. Assigning and prioritising orders
**Files:** `frontend/src/services/adminService.ts`, `backend/src/routes/admin.ts`
1. From the queue table, use the “Assign” action to choose a staff member. This calls `PATCH /api/admin/orders/:id/assign`.
2. Adjust urgency via the “Priority” selector; the UI posts to `PATCH /api/admin/orders/:id/priority` with `urgent`, `normal`, or `low`.
3. Assigned orders can be filtered using the staff filter in the queue toolbar.

## 3. Updating order statuses
**Files:** `frontend/src/services/orderService.ts`, `backend/src/routes/orders.ts`
1. Select an order and choose a new status from the action menu.
2. Admins hit `PATCH /api/orders/:id/status`; customers attempting to cancel use `PATCH /api/orders/:id/cancel`.
3. When marking orders as `ready_for_delivery` or `ready_for_pickup`, include `estimated_pickup_time` if known.
4. Delivery orders update associated time slots via `deliveryService.updateDeliveryStatus` when the delivery workflow is adjusted.

## 4. Managing menu content
**Files:** `frontend/src/services/menuService.ts`, `backend/src/routes/menu.ts`
1. Navigate to the menu management screen (component wiring within admin layout).
2. Create categories via `POST /api/menu/categories` and adjust `sort_order` for presentation.
3. Add or edit items with base prices, variants, and addons using `POST /api/menu/items` and `PATCH /api/menu/items/:id`.
4. Upload or link menu images by populating the `image_url` field via the same endpoints.

## 5. Configuring delivery policies
**Files:** `frontend/src/stores/deliveryStore.ts`, `backend/src/routes/delivery.ts`
1. Open the Delivery Settings panel.
2. Update base fee, per-kilometre rate, maximum distance, and minimum order thresholds.
3. Changes call `PUT /api/delivery/settings` and immediately affect fee calculations for new orders.
4. Use the Delivery Monitor view to see active time slots (data from `GET /api/delivery/active`).

## 6. Reviewing analytics
**Files:** `frontend/src/components/admin/DashboardStats.tsx`, `frontend/src/components/admin/AnalyticsSummary.tsx`
1. Dashboard cards read from `GET /api/admin/dashboard` with timeframe filters.
2. Charts and summaries use `/api/admin/analytics`, `/api/admin/analytics/daily`, `/api/admin/analytics/items`, and `/api/admin/analytics/trends`.
3. Export helpers (see `frontend/src/services/adminService.ts`) turn API responses into CSV/XLSX using `exceljs` and `file-saver`.

## 7. Handling payments and refunds
**Files:** `backend/src/routes/payments.ts`
1. For card payments, verify webhook notifications in the PayHere portal if discrepancies appear.
2. Use Supabase to review `payment_status`. The admin API exposes aggregated metrics but refunds are handled through PayHere’s dashboard; update internal state via `/api/admin/orders/status-update` if manual adjustments are required.

## 8. Auditing and troubleshooting
- The backend logs configuration and PayHere settings during startup (`backend/src/config/index.ts`).
- Health endpoint: `GET /health`.
- Supabase logs can be inspected to confirm row-level security and realtime events.
- For authentication issues, clear persisted tokens by removing `auth-storage` from `localStorage` (handled automatically by `authStore` on 401 events).

Following these workflows keeps operations aligned with the data models and ensures realtime updates remain reliable across the kitchen and delivery teams.
