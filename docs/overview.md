# Overview

RealTaste is a progressive web application for restaurants that need a full-stack ordering workflow without building native apps. The project was initially conceived for a Sri Lankan takeaway restaurant specialising in Chinese cuisine, but its architecture is modular enough to support any single-brand kitchen that offers pickup and short-range delivery.

The product targets three personas:
- **Customers** on mobile devices who expect an installable, low-friction ordering interface with real-time status visibility.
- **Restaurant operators** who need a consolidated admin dashboard with analytics, live order queues, and delivery coordination tools.
- **Developers/maintainers** who manage deployments, infrastructure credentials, and ongoing feature development.

Key product principles that inform the UX:
- **Mobile-first PWA**: The Vite/React frontend is optimised for mobile breakpoints, includes an app manifest, and caches Supabase responses to deliver fast repeat visits even on unstable connectivity.
- **Trustworthy data**: All menu, order, and delivery data flows through Supabase with Row Level Security. Admin-only functionality is guarded by server-side checks, while the client consumes only what it needs via scoped API calls.
- **Operational clarity**: Admin dashboards aggregate the metrics required to keep the kitchen flowing—queue counts, revenue snapshots, and order trend charts. Delivery tooling shows range validation, fee calculations, and time slots for drivers.
- **Sri Lanka-ready payments and logistics**: PayHere integration provides compliant local card payments. Mapbox GL and Haversine distance checks enforce the 5 km delivery radius commonly used by Colombo restaurants.

This documentation set explains how the pieces fit together so that new engineers can confidently ship features, triage incidents, and extend the platform.
