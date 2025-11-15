# API Reference

All endpoints are served from the Express API (`/api/...`). Unless otherwise stated, responses follow the `{ success, data?, error?, message? }` pattern defined in `backend/src/types/shared.ts`.

## Authentication & headers
- Authenticated requests require the Supabase JWT issued to the browser. Include it as `Authorization: Bearer <token>`.
- Admin-only endpoints require the JWT to carry `role=admin` (enforced in `backend/src/middleware/auth.ts`).
- Rate limiting is applied via Express Rate Limit. Admin mutating actions also pass through `adminLimiter`.

## Menu
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/menu` | Public | Returns active categories, menu items, variants, and addons filtered to `is_available = true` and sorted by `sort_order`. |
| GET | `/api/menu/items/:id` | Public | Fetches a single menu item with its category, variants, and addons. Returns 404 if unavailable. |
| GET | `/api/menu/categories` | Admin | Lists all categories (active or inactive). |
| POST | `/api/menu/categories` | Admin | Creates a category. Body validated by `schemas.createCategory`. |
| POST | `/api/menu/items` | Admin | Creates a menu item. Body validated by `schemas.createMenuItem`. |
| PATCH | `/api/menu/items/:id` | Admin | Updates a menu item (availability, pricing, metadata). |

## Business
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/business/hours` | Public | Returns configured business hours, open/closed status, restaurant name, and phone number. |
| GET | `/api/business/status` | Public | Returns current open state and contextual messaging using Sri Lanka timezone calculations. |

## Orders (customer + admin)
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/orders` | Optional | Creates a new order. Validates menu availability, calculates totals (including delivery fees), and returns either the order (cash) or PayHere payment payload (card). Body uses `CreateOrderRequest`. |
| GET | `/api/orders` | User/Admin | Lists orders. Customers receive only their orders; admins receive all. Supports `page`, `limit`, `status` query params. |
| GET | `/api/orders/:id` | User/Admin | Retrieves a single order with nested items/addons. Non-admins can only access their own orders. |
| PATCH | `/api/orders/:id/cancel` | User/Admin | Cancels an order if it is still in `received` or `confirmed` status. Customers can only cancel their own orders. |
| PATCH | `/api/orders/:id/status` | Admin | Updates an order's status and optional `estimated_pickup_time`. Body validated by `schemas.updateOrderStatus`. |

## Admin analytics & queue
_All endpoints below require admin authentication._

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/admin/dashboard` | Aggregated metrics (orders, revenue, trends) for the requested timeframe (`today`, `week`, `month`). |
| GET | `/api/admin/analytics` | Returns structured data for dashboard cards including revenue totals, queue metrics, and chart series. |
| GET | `/api/admin/analytics/daily` | Day-level breakdown of orders, revenue, and prep times. Optional `date` query. |
| GET | `/api/admin/analytics/items` | Popular items for the selected timeframe. Optional `days` query. |
| GET | `/api/admin/analytics/trends` | Rolling trend data for charts (`days` query defaults to 7). |
| GET | `/api/admin/orders/queue` | Current production queue filtered to `received`, `confirmed`, and `preparing`. |
| PATCH | `/api/admin/orders/bulk-update` | Bulk status update for a list of `orderIds`. Optional `estimated_pickup_time`. |
| PATCH | `/api/admin/orders/:id/assign` | Assigns an order to a staff member (`staff_id` in body). |
| PATCH | `/api/admin/orders/:id/priority` | Updates `priority` (`urgent`, `normal`, `low`). |
| GET | `/api/admin/queue` | Queue retrieval with filterable status/priority/time range (`status`, `priority`, `timeRange`, `staff_id`). |
| GET | `/api/admin/orders` | Admin view of all orders with filtering identical to `/queue`. |
| GET | `/api/admin/orders/:id` | Detailed order inspection including nested items, variants, and addons. |
| PATCH | `/api/admin/orders/:id/status` | Overrides order status with admin context (includes audit messaging). |
| DELETE | `/api/admin/orders/:id` | Soft deletes an order record. |
| PATCH | `/api/admin/orders/queue/reorder` | Reorders queue positions using drag-and-drop payloads. |
| DELETE | `/api/admin/orders/queue/remove` | Removes orders from queue management (does not delete the order record). |
| GET | `/api/admin/sales` | Sales summary across configurable date windows (`startDate`, `endDate`). |
| GET | `/api/admin/orders/stats` | Aggregated stats for orders (counts, revenue) filtered by timeframe. |
| GET | `/api/admin/customers/stats` | Customer acquisition and repeat purchase metrics. |
| POST | `/api/admin/orders/status-update` | Fine-grained status updates that also emit notifications. |
| GET | `/api/admin/daily-summary` | Day summary used for dashboard cards (orders, revenue, completions). |
| GET | `/api/admin/top-items` | Top-selling items within a lookback window. |
| GET | `/api/admin/trends` | Multi-day trend data for graphs. |
| PUT | `/api/admin/orders/bulk-update` | Alternate bulk update endpoint that accepts a payload optimised for CSV imports. |

## Delivery
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/delivery/settings` | Public | Returns active delivery configuration (base fee, per km fee, range, toggles). |
| PUT | `/api/delivery/settings` | Admin | Updates delivery configuration. Body fields include `base_fee`, `per_km_rate`, `max_delivery_distance_km`, `min_order_for_delivery`, `is_delivery_enabled`. |
| POST | `/api/delivery/calculate-fee` | Public | Calculates distance, fee, and ETA from restaurant coordinates to provided `delivery_latitude`/`delivery_longitude`. |
| GET | `/api/delivery/standard-fee` | Public | Returns fallback fee/time when coordinates are unavailable. |
| GET | `/api/delivery/active` | Admin | Lists delivery time slots currently in progress. |
| PATCH | `/api/delivery/status/:timeSlotId` | Admin | Updates delivery slot status (`pending`, `preparing`, `ready`, `out_for_delivery`, `delivered`) and optional actual time. |

## Payments
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/payments/initiate` | Optional | Creates PayHere form data for a given `orderId`. Valid only if the order belongs to the authenticated user (when logged in) and payment method is `card`. |
| POST | `/api/payments/webhook` | Server-to-server | PayHere webhook receiver. Verifies signature, updates `payment_status`, and keeps orders in `received` status on success. |
| GET | `/api/payments/return` | Public | PayHere return URL handler. Redirects to frontend success or pending pages based on stored status. |
| GET | `/api/payments/cancel` | Public | PayHere cancel URL handler. Marks payment as failed and redirects to frontend cancellation page. |

## Health
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/health` | Public | Returns `{ success: true, message, timestamp, environment }`. Useful for monitoring. |

For detailed payload shapes refer to the TypeScript definitions in `shared/src/types` and backend validation schemas in `backend/src/middleware/validation.ts`.
