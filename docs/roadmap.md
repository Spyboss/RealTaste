# Roadmap

The roadmap outlines strategic initiatives planned for the RealTaste platform. Timelines are indicative; prioritise according to restaurant needs and engineering capacity.

## Near-term (0–3 months)
- **Stabilise admin queue performance:** Optimise Supabase queries for large order volumes and add pagination to `/api/admin/orders`.
- **Menu image pipeline:** Add signed upload support for menu imagery with Supabase Storage and integrate an admin UI for asset management.
- **Delivery monitoring UI:** Expand delivery time slot management with driver assignment and live countdown timers.
- **Improved error telemetry:** Wire server logs to an observability stack (e.g., Logtail) and capture frontend exceptions with Sentry.

## Mid-term (3–6 months)
- **POS handoff:** Build integrations with in-store POS systems to sync completed orders and avoid double entry.
- **Kitchen display system:** Deliver a dedicated kitchen view optimised for tablets, fed by the same realtime Supabase channel.
- **Multi-branch support:** Introduce organisation-level tables to manage multiple locations with distinct menus and delivery radii.
- **Delivery partner APIs:** Connect to third-party couriers for extended ranges, with status webhooks feeding back into the admin queue.

## Long-term (6–12 months)
- **Customer loyalty programme:** Implement reward points, targeted promotions, and referral tracking.
- **AI-assisted recommendations:** Use order history to suggest upsells and bundle combinations at checkout.
- **Advanced analytics:** Layer in cohort analyses, heatmaps of delivery density, and exportable BI datasets.
- **Real-time customer tracking:** Provide live driver location sharing using WebSocket channels.

## Ongoing initiatives
- Continuous accessibility audits to keep the PWA usable on low-end devices.
- Security reviews for Supabase policies, JWT expiry, and PayHere credential management.
- Regular dependency updates with automated CI to catch regressions.

Track roadmap execution in your chosen project management tool, linking commits and deployments back to these themes.
