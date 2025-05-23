# 🚀 RealTaste Deployment Guide

This guide will help you deploy RealTaste to production using **Cloudflare Pages** (frontend) and **Fly.io** (backend).

## 📋 Prerequisites

1. **GitHub Account** - Your code should be pushed to GitHub
2. **Cloudflare Account** - For frontend hosting
3. **Fly.io Account** - For backend hosting
4. **Supabase Project** - Already set up
5. **Domain** (optional) - For custom domain

## 🎯 Deployment Strategy

```
Frontend (React PWA) → Cloudflare Pages
Backend (Node.js API) → Fly.io
Database → Supabase (already configured)
```

## 🔧 Phase 1: Backend Deployment (Fly.io)

### Step 1: Install Fly CLI

**Windows (PowerShell):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**macOS/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

### Step 2: Login to Fly.io
```bash
fly auth login
```

### Step 3: Initialize Fly App
```bash
cd backend
fly launch --no-deploy
```

When prompted:
- App name: `realtaste-api` (or your preferred name)
- Region: `sin` (Singapore - closest to Sri Lanka)
- PostgreSQL: `No` (we're using Supabase)
- Redis: `No`

### Step 4: Set Environment Variables
```bash
# Set your environment variables
fly secrets set NODE_ENV=production
fly secrets set SUPABASE_URL=your-supabase-url
fly secrets set SUPABASE_ANON_KEY=your-supabase-anon-key
fly secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
fly secrets set JWT_SECRET=your-super-secret-jwt-key
fly secrets set FRONTEND_URL=https://your-frontend-domain.pages.dev

# Optional: PayHere and Firebase
fly secrets set PAYHERE_MERCHANT_ID=your-merchant-id
fly secrets set PAYHERE_MERCHANT_SECRET=your-merchant-secret
fly secrets set FIREBASE_PROJECT_ID=your-firebase-project-id
# ... add other secrets as needed
```

### Step 5: Deploy Backend
```bash
# Option 1: Use the deployment script
./deploy.ps1  # Windows
# or
./deploy.sh   # macOS/Linux

# Option 2: Manual deployment
fly deploy
```

### Step 6: Verify Backend
```bash
fly status
fly logs
```

Your API should be live at: `https://realtaste-api.fly.dev`

## 🌐 Phase 2: Frontend Deployment (Cloudflare Pages)

### Step 1: Push to GitHub
Make sure your code is pushed to GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages**
3. Click **Create a project**
4. Choose **Connect to Git**
5. Select your **RealTaste** repository
6. Configure build settings:

**Build Configuration:**
- **Framework preset:** `Vite`
- **Build command:** `npm run build:frontend`
- **Build output directory:** `frontend/dist`
- **Root directory:** `/` (leave empty)

### Step 3: Set Environment Variables

In Cloudflare Pages settings, add these environment variables:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=https://realtaste-api.fly.dev/api
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_PAYHERE_MERCHANT_ID=your-merchant-id
VITE_PAYHERE_SANDBOX=false
VITE_APP_NAME=RealTaste
```

### Step 4: Deploy Frontend
1. Click **Save and Deploy**
2. Wait for the build to complete
3. Your app will be live at: `https://realtaste.pages.dev`

## 🔗 Phase 3: Connect Frontend & Backend

### Update Backend CORS
Your backend is already configured to accept requests from `*.pages.dev` domains.

### Update Frontend API URL
Make sure your frontend `.env` file has:
```
VITE_API_URL=https://realtaste-api.fly.dev/api
```

## ✅ Phase 4: Testing & Verification

### Test Backend
```bash
curl https://realtaste-api.fly.dev/health
```

### Test Frontend
1. Visit your Cloudflare Pages URL
2. Test PWA installation
3. Test API connectivity
4. Test offline functionality

## 🎨 Phase 5: Custom Domain (Optional)

### For Frontend (Cloudflare Pages)
1. Go to your Pages project
2. Click **Custom domains**
3. Add your domain
4. Update DNS records as instructed

### For Backend (Fly.io)
1. Add custom domain in Fly.io dashboard
2. Update DNS records
3. Update CORS settings in backend

## 📊 Monitoring & Maintenance

### Fly.io Commands
```bash
fly status                 # Check app status
fly logs                   # View logs
fly ssh console           # SSH into container
fly scale count 1         # Scale instances
fly deploy                 # Redeploy
```

### Cloudflare Pages
- Monitor builds in the dashboard
- Check analytics and performance
- Set up alerts for failures

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check backend CORS configuration
   - Verify frontend URL in backend env vars

2. **Build Failures**
   - Check environment variables
   - Verify build commands
   - Check logs for specific errors

3. **API Connection Issues**
   - Verify backend is running: `fly status`
   - Check API URL in frontend env vars
   - Test API endpoints directly

### Getting Help
- Fly.io: `fly help` or [docs](https://fly.io/docs/)
- Cloudflare: [Pages docs](https://developers.cloudflare.com/pages/)
- Supabase: [docs](https://supabase.com/docs)

## 🎉 Success!

Your RealTaste PWA is now live and ready for customers in Sri Lanka! 

**Frontend:** `https://realtaste.pages.dev`  
**Backend:** `https://realtaste-api.fly.dev`  
**Database:** Supabase (managed)
