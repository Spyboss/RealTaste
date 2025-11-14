# User Flow

This document describes the end-to-end journey for a customer using the RealTaste PWA.

## 1. Landing & discovery
- **Entry point:** `/` served by `HomePage`.
- **Data:** `useMenu` hook fetches `/api/menu`; categories and items render through `MenuCard` components.
- **Filtering:** Customers search (`Input` control) or filter by category chips. State is maintained locally within `HomePage`.
- **Business context:** `useBusinessStore` displays open/closed status using `/api/business/hours` and `/api/business/status`.

## 2. Item exploration
- Selecting a menu item opens detail modals (variants/addons handled by `MenuCard` internals).
- Availability is governed by `is_available` flags returned by the API.

## 3. Cart management
- Adding to cart invokes `useCartStore.addItem`, storing entries in persistent Zustand storage (`localStorage` key `cart-storage`).
- The cart slide-over summarises item totals using `calculateItemTotal` and surfaces variants/addons for review.
- Users can adjust quantities or remove items; totals update reactively.

## 4. Checkout
- Route: `/checkout` (`CheckoutPage`).
- **Form handling:** `react-hook-form` captures customer details, order type, and payment method.
- **Delivery toggle:** When `orderType = 'delivery'`, the UI reveals `MapLocationPicker` for Mapbox map selection, OpenCage search, and geolocation.
- **Fee calculation:** Coordinates trigger `deliveryApi.calculateFee` → `POST /api/delivery/calculate-fee`. If location is missing, fallback fees come from `deliveryApi.getStandardFee`.
- **Validation:** Phone numbers validated via `validatePhoneNumber`. Delivery orders require address + coordinates within range.
- **Payment selection:** Customers choose between cash and card. Card payments append a 2% convenience fee in the UI (`onlinePaymentFee`).

## 5. Order submission
- Form submission creates a `CreateOrderRequest` and posts to `POST /api/orders` via `orderService.createOrder`.
- Backend response handling:
  - **Cash orders:** Receive the persisted order object. Cart clears and the user is redirected to `/order-confirmation/:orderId`.
  - **Card orders:** Receive PayHere payload. `CheckoutPage` initialises `window.payhere.startPayment`, registers callbacks, and navigates to payment status pages.

## 6. Payment completion
- Success redirects to `/payment/success`; failure or cancellation routes to `/payment/error` or `/payment/cancelled`.
- Pending states are supported via `/payment/pending` when PayHere requires asynchronous confirmation.

## 7. Order confirmation & tracking
- `/order-confirmation/:orderId` fetches `/api/orders/:id` to display status, ETA, and line items.
- Authenticated customers can open `/orders` to see historical orders (requires Supabase session via `useAuthStore`).
- Customers may cancel eligible orders by triggering `orderService.cancelOrder` → `PATCH /api/orders/:id/cancel`.

## 8. Notifications & PWA behaviour
- Toasts (`react-hot-toast`) provide inline feedback for add-to-cart, validation, and payment events.
- PWA installation prompts rely on the manifest configured in `vite.config.ts`. Offline caching ensures returning users can browse cached menu data; actions queue until online.

By following this flow, customers move from discovery through payment with minimal friction while the backend maintains consistent order and delivery records.
