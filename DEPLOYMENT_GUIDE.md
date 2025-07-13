# 🚀 RealTaste Production Deployment Guide

This guide provides a stable, reproducible deployment setup for the RealTaste full-stack application with clear separation between frontend (Cloudflare Pages) and backend (Fly.io) deployments.

## 📋 Architecture Overview

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Frontend (PWA)    │    │   Backend (API)     │    │   Database          │
│   Cloudflare Pages  │───▶│   Fly.io           │───▶│   Supabase          │
│   React + Vite      │    │   Node.js + Express│    │   PostgreSQL + RLS │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

**Deployment Strategy:**
- **Frontend**: Cloudflare Pages (Static hosting with edge optimization)
- **Backend**: Fly.io (Containerized Node.js API)
- **Database**: Supabase (Managed PostgreSQL with real-time features)
- **Payments**: PayHere (Sri Lankan payment gateway)
- **CI/CD**: GitHub push triggers (automatic deployments)

## 🔧 Prerequisites

### Required Accounts
- [GitHub](https://github.com) - Source code repository
- [Cloudflare](https://dash.cloudflare.com) - Frontend hosting
- [Fly.io](https://fly.io) - Backend hosting
- [Supabase](https://supabase.com) - Database and authentication

### Required Tools
- Node.js 18+ and npm 9+
- Git
- Fly CLI (installed during setup)

### Environment Setup Verification
```bash
# Verify prerequisites
node --version  # Should be 18+
npm --version   # Should be 9+
git --version   # Any recent version
```

## 🎯 Phase 1: Backend Deployment (Fly.io)

### Step 1: Install and Setup Fly CLI

**Windows (PowerShell):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**macOS/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Verify installation:**
```bash
fly version
fly auth login
```

### Step 2: Initialize Fly Application

```bash
# Navigate to project root
cd /path/to/RealTaste

# Initialize Fly app (this will create/update fly.toml)
fly launch --no-deploy
```

**Configuration prompts:**
- App name: `realtaste-api` (or your preferred name)
- Region: `sin` (Singapore - optimal for Sri Lanka)
- PostgreSQL: `No` (using Supabase)
- Redis: `No`

### Step 3: Configure Environment Variables

**Set production secrets:**
```bash
# Core configuration
fly secrets set NODE_ENV=production
fly secrets set PORT=3001

# Database configuration
fly secrets set SUPABASE_URL="https://your-project-id.supabase.co"
fly secrets set SUPABASE_ANON_KEY="your-supabase-anon-key"
fly secrets set SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Security
fly secrets set JWT_SECRET="your-super-secure-jwt-secret-min-32-chars"

# CORS configuration
fly secrets set FRONTEND_URL="https://realtaste.pages.dev"

# PayHere payment gateway
fly secrets set PAYHERE_MERCHANT_ID="your-merchant-id"
fly secrets set PAYHERE_MERCHANT_SECRET="your-merchant-secret"
fly secrets set USE_LIVE_PAYHERE="false"  # Set to "true" for live payments

# Business configuration
fly secrets set RESTAURANT_NAME="RealTaste"
fly secrets set RESTAURANT_PHONE="+94 76 195 2541"
fly secrets set BUSINESS_OPEN_TIME="10:00"
fly secrets set BUSINESS_CLOSE_TIME="22:00"

# Location configuration
fly secrets set RESTAURANT_LAT="6.261449"
fly secrets set RESTAURANT_LNG="80.906462"

# Rate limiting
fly secrets set RATE_LIMIT_WINDOW_MS="900000"
fly secrets set RATE_LIMIT_MAX_REQUESTS="100"
```

### Step 4: Deploy Backend

```bash
# Deploy using the optimized Dockerfile
fly deploy

# Verify deployment
fly status
fly logs

# Test health endpoint
curl https://your-app-name.fly.dev/health
```

**Expected response:**
```json
{"status":"healthy","timestamp":"2025-01-XX...","version":"1.0.1"}
```

## 🌐 Phase 2: Frontend Deployment (Cloudflare Pages)

### Step 1: Prepare Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "Production deployment setup"
git push origin main
```

### Step 2: Connect to Cloudflare Pages

1. Navigate to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
2. Click **"Create a project"**
3. Select **"Connect to Git"**
4. Choose your **RealTaste** repository
5. Configure build settings:

**Build Configuration:**
```
Framework preset: Vite
Build command: cd frontend && npm install && npm run build
Build output directory: frontend/dist
Root directory: (leave empty)
Node.js version: 18
```

### Step 3: Configure Environment Variables

In Cloudflare Pages → Settings → Environment variables, add:

**Production Environment Variables:**
```
# Supabase configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# API configuration
VITE_API_URL=https://your-app-name.fly.dev/api

# App configuration
VITE_APP_NAME=RealTaste
VITE_APP_VERSION=1.0.1

# Restaurant location
VITE_RESTAURANT_LAT=6.261449
VITE_RESTAURANT_LNG=80.906462
VITE_RESTAURANT_NAME=RealTaste Restaurant
VITE_RESTAURANT_ADDRESS=Main Location
VITE_DELIVERY_RADIUS=10

# PayHere configuration
VITE_PAYHERE_MERCHANT_ID=your-merchant-id
VITE_PAYHERE_SANDBOX=false

# Firebase configuration (optional)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key

# Mapbox configuration (optional)
VITE_MAPBOX_ACCESS_TOKEN=your-mapbox-access-token
VITE_OPENCAGE_API_KEY=your-opencage-api-key
```

### Step 4: Deploy Frontend

1. Click **"Save and Deploy"**
2. Monitor build progress in the dashboard
3. Once complete, your app will be available at: `https://realtaste.pages.dev`

## 🔗 Phase 3: Integration & Testing

### Update Backend CORS

If using a custom domain, update the CORS configuration:
```bash
fly secrets set FRONTEND_URL="https://your-custom-domain.com"
```

### Verification Checklist

**Backend Tests:**
```bash
# Health check
curl https://your-app-name.fly.dev/health

# API endpoints
curl https://your-app-name.fly.dev/api/menu
curl https://your-app-name.fly.dev/api/health

# Check logs
fly logs
```

**Frontend Tests:**
1. Visit your Cloudflare Pages URL
2. Test PWA installation (Add to Home Screen)
3. Verify API connectivity (check Network tab in DevTools)
4. Test offline functionality
5. Verify payment flow (sandbox mode)

## 🎨 Phase 4: Custom Domain (Optional)

### Frontend Custom Domain

1. In Cloudflare Pages → Custom domains
2. Add your domain
3. Update DNS records as instructed
4. SSL certificate is automatically provisioned

### Backend Custom Domain

1. In Fly.io dashboard → Certificates
2. Add custom domain
3. Update DNS records
4. Update CORS settings:
   ```bash
   fly secrets set FRONTEND_URL="https://your-custom-domain.com"
   ```

## 📊 Monitoring & Maintenance

### Fly.io Monitoring
```bash
# Check application status
fly status

# View real-time logs
fly logs

# SSH into container (for debugging)
fly ssh console

# Scale application
fly scale count 2  # Scale to 2 instances
```

### Cloudflare Analytics
- Monitor performance in Cloudflare Pages dashboard
- Set up alerts for build failures
- Review Core Web Vitals metrics

### Health Monitoring
- Backend health: `https://your-app-name.fly.dev/health`
- Frontend availability: Monitor via Cloudflare
- Database health: Monitor via Supabase dashboard

## 🚨 Troubleshooting

### Common Backend Issues

**Build Failures:**
```bash
# Check build logs
fly logs

# Rebuild and deploy
fly deploy --force
```

**Environment Variable Issues:**
```bash
# List current secrets
fly secrets list

# Update specific secret
fly secrets set KEY="new-value"
```

**Performance Issues:**
```bash
# Check resource usage
fly status

# Scale up if needed
fly scale memory 2gb
```

### Common Frontend Issues

**Build Failures:**
1. Check build logs in Cloudflare Pages dashboard
2. Verify all environment variables are set
3. Check for missing dependencies

**API Connection Issues:**
1. Verify `VITE_API_URL` is correct
2. Check CORS configuration on backend
3. Verify backend is running: `fly status`

**PWA Issues:**
1. Check service worker registration
2. Verify manifest.json is accessible
3. Test offline functionality

## 🔄 Deployment Updates

### Backend Updates
```bash
# After code changes
git push origin main
fly deploy
```

### Frontend Updates
```bash
# After code changes
git push origin main
# Cloudflare Pages will automatically rebuild and deploy
```

## 📞 Support Resources

- **Fly.io Documentation**: [fly.io/docs](https://fly.io/docs)
- **Cloudflare Pages**: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)
- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **PayHere Integration**: [payhere.lk/developers](https://payhere.lk/developers)

---

**🎉 Congratulations!** Your RealTaste application is now live in production with a robust, scalable architecture.

**Production URLs:**
- Frontend: `https://realtaste.pages.dev`
- Backend API: `https://your-app-name.fly.dev/api`
- Health Check: `https://your-app-name.fly.dev/health`