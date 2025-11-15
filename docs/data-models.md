# Data Models

Supabase stores all transactional and operational data. The schema is defined in `supabase/schema.sql` with additional migrations for delivery and workflow enhancements.

## Enumerations
- `order_status`: `received`, `confirmed`, `preparing`, `ready_for_pickup`, `ready_for_delivery`, `picked_up`, `delivered`, `completed`, `cancelled`
- `payment_method`: `card`, `cash`
- `payment_status`: `pending`, `completed`, `failed`, `refunded`
- `user_role`: `customer`, `admin`

## Tables
### `users`
Extends `auth.users` with role metadata.
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | References `auth.users(id)` |
| `email` | `text` | Optional convenience copy |
| `phone` | `text` | Optional |
| `first_name` | `text` | Optional |
| `role` | `user_role` | Defaults to `customer` |
| `created_at` / `updated_at` | `timestamptz` | Auto-managed via trigger |

### `categories`
Top-level menu groupings.
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `name` | `text` | Required |
| `description` | `text` | Optional |
| `sort_order` | `int` | Controls display order |
| `is_active` | `bool` | Controls visibility |
| `created_at` / `updated_at` | `timestamptz` | Auto timestamps |

### `menu_items`
Menu entries tied to categories.
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `category_id` | `uuid` | References `categories(id)` |
| `name` | `text` | Required |
| `description` | `text` | Optional |
| `base_price` | `numeric(10,2)` | Required, >= 0 |
| `image_url` | `text` | Optional |
| `is_available` | `bool` | Defaults to `true` |
| `sort_order` | `int` | Display ordering |
| `created_at` / `updated_at` | `timestamptz` | Auto timestamps |

### `menu_variants`
Size or portion modifiers.
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `menu_item_id` | `uuid` | References `menu_items(id)` |
| `name` | `text` | e.g. `Large` |
| `price_modifier` | `numeric(10,2)` | Defaults to 0 |
| `is_available` | `bool` | Defaults to `true` |
| `sort_order` | `int` | Controls UI order |
| `created_at` / `updated_at` | `timestamptz` | Auto timestamps |

### `menu_addons`
Addon options per menu item.
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `menu_item_id` | `uuid` | References `menu_items(id)` |
| `name` | `text` | e.g. `Extra Cheese` |
| `price` | `numeric(10,2)` | Required |
| `is_available` | `bool` | Defaults to `true` |
| `sort_order` | `int` | Controls UI order |
| `created_at` / `updated_at` | `timestamptz` | Auto timestamps |

### `orders`
Core transactional record.
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `customer_id` | `uuid` | References `users(id)`; nullable for guest checkouts |
| `customer_phone` | `text` | Required |
| `customer_name` | `text` | Optional |
| `order_type` | `text` | `pickup` or `delivery` |
| `status` | `order_status` | Workflow state |
| `payment_method` | `payment_method` | |
| `payment_status` | `payment_status` | |
| `subtotal` | `numeric(10,2)` | Sum before taxes/fees |
| `tax_amount` | `numeric(10,2)` | Defaults to 0 |
| `total_amount` | `numeric(10,2)` | Includes delivery fee |
| `delivery_fee` | `numeric(10,2)` | 0 for pickup |
| `delivery_address` | `text` | Optional |
| `delivery_latitude` / `delivery_longitude` | `numeric` | Optional GPS coordinates |
| `delivery_distance_km` | `numeric(5,2)` | Calculated distance |
| `estimated_delivery_time` | `timestamptz` | Derived ETA |
| `actual_delivery_time` | `timestamptz` | Logged by operators |
| `delivery_notes` | `text` | Optional |
| `customer_gps_location` | `text` | Raw geolocation payload |
| `notes` | `text` | Kitchen instructions |
| `estimated_pickup_time` | `timestamptz` | For pickup orders |
| `created_at` / `updated_at` | `timestamptz` | Auto timestamps |

### `order_items`
Line items per order.
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `order_id` | `uuid` | References `orders(id)` |
| `menu_item_id` | `uuid` | References `menu_items(id)` |
| `variant_id` | `uuid` | References `menu_variants(id)`; nullable |
| `quantity` | `integer` | > 0 |
| `unit_price` | `numeric(10,2)` | Includes variant/addon modifiers |
| `total_price` | `numeric(10,2)` | `unit_price * quantity` |
| `notes` | `text` | Optional |
| `created_at` | `timestamptz` | Timestamp |

### `order_item_addons`
Addon selections linked to line items.
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `order_item_id` | `uuid` | References `order_items(id)` |
| `addon_id` | `uuid` | References `menu_addons(id)` |
| `quantity` | `integer` | Defaults to 1 |
| `unit_price` | `numeric(10,2)` | |
| `total_price` | `numeric(10,2)` | |
| `created_at` | `timestamptz` | Timestamp |

### `delivery_settings`
Single-row configuration table for delivery policies (created via `20250119_add_delivery_system.sql`).
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `base_fee` | `numeric(10,2)` | Default LKR 180 |
| `per_km_fee` | `numeric(10,2)` | Default LKR 40 |
| `max_delivery_range_km` | `numeric(5,2)` | Default 5.0 |
| `min_order_for_delivery` | `numeric(10,2)` | Optional threshold |
| `is_delivery_enabled` | `bool` | Toggle for service availability |
| `created_at` / `updated_at` | `timestamptz` | Auto timestamps |

### `delivery_time_slots`
Operational tracker for delivery prep and dispatch windows.
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `order_id` | `uuid` | References `orders(id)` |
| `estimated_prep_time` | `integer` | Minutes |
| `estimated_delivery_time` | `integer` | Minutes |
| `actual_prep_time` / `actual_delivery_time` | `integer` | Nullable minute durations |
| `status` | `text` | `pending`, `preparing`, `ready`, `out_for_delivery`, `delivered` |
| `updated_by` | `uuid` | References `users(id)` |
| `created_at` / `updated_at` | `timestamptz` | Auto timestamps |

## Relationships
- `categories` → `menu_items` (one-to-many)
- `menu_items` → `menu_variants` and `menu_addons` (one-to-many)
- `orders` → `order_items` (one-to-many)
- `order_items` → `order_item_addons` (one-to-many)
- `orders` → `delivery_time_slots` (one-to-one per active delivery)
- `users` → `orders` (optional relationship; guest orders leave `customer_id` null)

Row Level Security policies in the SQL scripts ensure:
- Public users can read categories and menu items.
- Authenticated customers can read/write their own orders.
- Admin role holders (as determined by Supabase JWT claims) can manage menu, orders, delivery settings, and analytics data.
