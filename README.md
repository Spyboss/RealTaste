# RealTaste - Restaurant Order Pickup PWA 🇱🇰

A modern, mobile-first Progressive Web App (PWA) for restaurant order pickup, specifically designed for Sri Lankan restaurants. Built with React, Node.js, TypeScript, and Supabase.

![RealTaste Demo](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![PWA](https://img.shields.io/badge/PWA-Enabled-purple)
![Sri Lanka](https://img.shields.io/badge/Made%20for-Sri%20Lanka-orange)

## 🚀 Features

### 👥 Customer Features
- **📱 Mobile-First Design**: Optimized for Sri Lankan mobile users
- **🍽️ Browse Menu**: Categorized menu with authentic Sri Lankan dishes
- **🛒 Smart Cart**: Add, customize, and manage orders easily
- **🚚 Delivery System**: Location-based ordering with 5km range
- **💰 Smart Pricing**: LKR 180 base + LKR 40/km delivery fee
- **💳 Local Payments**: PayHere integration for LKR transactions
- **📍 Real-time Tracking**: Complete order status workflow (received → confirmed → preparing → ready → delivered/picked up → completed)
- **🔐 Secure Auth**: Email/Google login with Supabase
- **📲 PWA Install**: Works offline, installs like native app
- **🌐 Bilingual**: Sinhala and English support

### 👨‍💼 Admin Features
- **📊 Advanced Dashboard**: Real-time order management with analytics
- **🍜 Complete Menu Management**: Categories, variants, addons with images
- **🚚 Delivery Management**: Track orders, manage delivery zones with enhanced status workflow
- **⏰ Business Configuration**: Hours, location, delivery settings
- **📈 Revenue Analytics**: Daily/weekly sales tracking
- **🔔 Real-time Notifications**: Instant order alerts
- **👥 Customer Management**: Order history and preferences
- **🎯 Order Status Management**: Complete workflow from received to completed with pickup/delivery differentiation

## 📋 Order Status Workflow

RealTaste features a comprehensive order management system with different workflows for pickup and delivery orders:

### Order Statuses
- **received** - Initial order placement
- **confirmed** - Order confirmed by restaurant
- **preparing** - Kitchen is preparing the order
- **ready_for_pickup** - Order ready for customer pickup
- **ready_for_delivery** - Order ready for delivery
- **picked_up** - Customer has collected the order
- **delivered** - Order has been delivered to customer
- **completed** - Order fully completed
- **cancelled** - Order cancelled

### Workflow Paths

**Pickup Orders:**
```
received → confirmed → preparing → ready_for_pickup → picked_up → completed
```

**Delivery Orders:**
```
received → confirmed → preparing → ready_for_delivery → delivered → completed
```

### Admin Features
- Color-coded status display for easy identification
- Bulk status updates for multiple orders
- Dynamic filtering by order status and type
- Real-time status updates with notifications
- Estimated delivery time tracking

## 🛠️ Tech Stack

### Frontend (PWA)
```
React 18 + TypeScript
├── Vite (Build Tool)
├── Tailwind CSS (Styling)
├── React Query (Data Fetching)
├── Zustand (State Management)
├── React Router (Navigation)
├── Lucide React (Icons)
├── React Hook Form (Forms)
├── React Hot Toast (Notifications)
└── Workbox (Service Worker)
```

### Backend (API)
```
Node.js + Express + TypeScript
├── Supabase (Database & Auth)
├── JWT (Session Management)
├── Rate Limiting (Security)
├── CORS (Cross-Origin)
├── Validation Middleware
└── PayHere Integration
```

### Database & Infrastructure
```
Supabase (PostgreSQL)
├── Row Level Security (RLS)
├── Real-time Subscriptions
├── Authentication
├── File Storage
└── Edge Functions
```

## 🏗️ Project Architecture

```
RealTaste/
├── 📁 frontend/                 # React PWA Application
│   ├── 📁 src/
│   │   ├── 📁 components/       # Reusable UI Components
│   │   ├── 📁 pages/            # Page Components
│   │   ├── 📁 hooks/            # Custom React Hooks
│   │   ├── 📁 services/         # API Services
│   │   ├── 📁 stores/           # Zustand State Stores
│   │   └── 📁 utils/            # Utility Functions
│   ├── 📁 public/               # Static Assets
│   └── 📁 dist/                 # Built application
├── 📁 backend/                  # Node.js API Server
│   ├── 📁 src/
│   │   ├── 📁 routes/           # Express Routes
│   │   ├── 📁 middleware/       # Express Middleware
│   │   ├── 📁 services/         # Business Logic
│   │   ├── 📁 config/           # Configuration
│   │   └── server.ts            # Express app setup
│   └── 📁 dist/                 # Compiled JavaScript
├── 📁 shared/                   # Shared Code
│   ├── 📁 src/
│   │   ├── 📁 types/            # Shared TypeScript Types
│   │   └── 📁 utils/            # Shared Utilities
│   └── 📁 dist/                 # Compiled shared code
├── 📁 supabase/                 # Database Schema
│   ├── 📁 migrations/           # SQL migrations
│   └── seed.sql                 # Sample data
├── 📁 docs/                     # Documentation
├── 📄 package.json              # Root package configuration
├── 📄 .gitignore               # Git ignore rules
├── 📄 README.md                # This file
└── 📄 LICENSE                  # MIT License
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **Supabase account** (free tier available)
- **PayHere merchant account** (for Sri Lankan payments)

### 1. Clone Repository
```bash
git clone https://github.com/Spyboss/RealTaste.git
cd RealTaste
npm install
```

### 2. Environment Setup
```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit the .env files with your credentials
```

### 3. Database Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and keys to the .env files
3. Run the database setup:
```bash
# This will create tables and seed sample Sri Lankan menu data
npm run db:setup
```

### 4. Development
```bash
# Start all services (frontend + backend)
npm run dev
```

**🎉 Your app is now running:**
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Database**: Your Supabase dashboard

### 5. Production Build
```bash
# Build all packages
npm run build

# Test production build
npm run preview
```

## 🔧 Configuration

### Backend Environment (.env)
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase (Get from your Supabase project settings)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# PayHere (Sri Lankan Payment Gateway)
PAYHERE_MERCHANT_ID=your-payhere-merchant-id
PAYHERE_MERCHANT_SECRET=your-payhere-merchant-secret
PAYHERE_SANDBOX=true

# Business Settings
RESTAURANT_NAME=RealTaste
RESTAURANT_PHONE=+94 76 195 2541
BUSINESS_OPEN_TIME=10:00
BUSINESS_CLOSE_TIME=22:00
```

### Frontend Environment (.env)
```env
# Supabase (Same as backend)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Configuration
VITE_API_URL=http://localhost:3001/api

# PayHere (Frontend integration)
VITE_PAYHERE_MERCHANT_ID=your-payhere-merchant-id
VITE_PAYHERE_SANDBOX=true
```

## 📊 Database Schema

### Core Tables
```sql
-- Menu Structure
categories (id, name, description, sort_order, is_active)
menu_items (id, category_id, name, description, base_price, image_url, is_available)
menu_variants (id, menu_item_id, name, price_modifier)
menu_addons (id, menu_item_id, name, price, is_available)

-- Order Management
orders (id, user_id, status, total_amount, customer_info, created_at)
order_items (id, order_id, menu_item_id, variant_id, quantity, unit_price, total_price)
order_item_addons (id, order_item_id, addon_id, quantity, unit_price)

-- Business Configuration
business_hours (id, day_of_week, open_time, close_time, is_open)
```

### Sample Sri Lankan Menu Data
The database comes pre-seeded with authentic Sri Lankan dishes:
- **Rice & Curry**: Traditional rice with various curries
- **Kottu**: Sri Lankan stir-fried bread dish
- **String Hoppers**: Steamed rice noodle pancakes
- **Hoppers**: Bowl-shaped pancakes
- **Short Eats**: Sri Lankan snacks and appetizers

## 🔐 Security Features

- **🛡️ Row Level Security (RLS)**: Database-level access control
- **🚦 Rate Limiting**: API endpoint protection (100 requests/15min)
- **✅ Input Validation**: All requests validated with middleware
- **🌐 CORS Protection**: Configured for production domains
- **🔐 JWT Authentication**: Secure session management
- **🔒 Environment Variables**: All secrets in .env files
- **🚫 SQL Injection Protection**: Parameterized queries only

## 🚀 Deployment

### ⚡ Quick Deploy (30 minutes)
```bash
# 1. Check prerequisites
npm run deploy:check

# 2. Deploy backend to Fly.io
cd backend
fly launch --no-deploy
fly secrets set NODE_ENV=production SUPABASE_URL=your-url SUPABASE_ANON_KEY=your-key
fly deploy

# 3. Deploy frontend to Cloudflare Pages
# Push to GitHub, then connect to Cloudflare Pages
git push origin main
```

**📚 Detailed Guides:**
- **🚀 Quick Start**: [QUICK_DEPLOY.md](QUICK_DEPLOY.md) - 30-minute deployment
- **📖 Full Guide**: [DEPLOYMENT.md](DEPLOYMENT.md) - Complete instructions
- **✅ Checklist**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Step-by-step verification

### 🌐 Production Stack (Currently Live)
- **Frontend**: Cloudflare Pages (Global CDN, PWA enabled)
- **Backend**: Fly.io (Singapore region, auto-scaling)
- **Database**: Supabase (PostgreSQL with RLS, real-time)
- **Payments**: PayHere (Sri Lankan payment gateway)
- **Status**: ✅ Production Ready with Delivery System

### 🔧 Deployment Commands
```bash
# Check deployment readiness
npm run deploy:check

# Deploy backend only
npm run deploy:backend

# Get deployment help
npm run deploy:help
```

## 📱 PWA Features

### Installation
1. **Mobile**: Open in browser → "Add to Home Screen"
2. **Desktop**: Install prompt appears automatically
3. **Offline**: Works without internet connection

### Capabilities
- **📲 App-like Experience**: Full-screen, no browser UI
- **⚡ Fast Loading**: Service worker caching
- **🔄 Background Sync**: Orders sync when online
- **🔔 Push Notifications**: Order status updates (coming soon)
- **📱 Native Feel**: Smooth animations and gestures

## 🧪 Testing

```bash
# Run all tests
npm test

# Frontend unit tests
npm run test:frontend

# Backend API tests
npm run test:backend

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 📈 Performance

### Lighthouse Scores
- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100
- **PWA**: 100

### Optimizations
- **Code Splitting**: Lazy-loaded routes
- **Image Optimization**: WebP format with fallbacks
- **Caching Strategy**: Service worker + CDN
- **Bundle Size**: < 500KB initial load
- **Database**: Optimized queries with indexes

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

### Development Workflow
1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **Conventional Commits**: Commit message format

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **🇱🇰 Sri Lankan Restaurants**: For inspiring this project
- **💳 PayHere**: For local payment processing
- **🔥 Supabase**: For amazing backend infrastructure
- **⚛️ React Team**: For the excellent framework
- **🎨 Tailwind CSS**: For beautiful, responsive design

## 📞 Support & Contact

- **📧 Email**: support@realtaste.lk
- **🐛 Issues**: [GitHub Issues](https://github.com/Spyboss/RealTaste/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/Spyboss/RealTaste/discussions)
- **📱 WhatsApp**: +94 77 123 4567

---

<div align="center">

**🍽️ RealTaste - Bringing Sri Lankan Restaurants into the Digital Age! 🇱🇰**

[![Made with ❤️ in Sri Lanka](https://img.shields.io/badge/Made%20with%20❤️%20in-Sri%20Lanka-orange)](https://github.com/Spyboss/RealTaste)

</div>
