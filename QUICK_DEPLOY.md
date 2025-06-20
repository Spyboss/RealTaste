# ⚡ Quick Deploy Guide - RealTaste

Get your complete RealTaste system with delivery management, payment integration, and admin dashboard live in production in under 30 minutes!

## 🚀 Quick Start (TL;DR)

```bash
# 1. Check prerequisites
npm run deploy:check

# 2. Deploy backend
cd backend
fly launch --no-deploy
fly secrets set NODE_ENV=production
fly secrets set SUPABASE_URL=your-supabase-url
fly secrets set SUPABASE_ANON_KEY=your-anon-key
fly secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-key
fly secrets set JWT_SECRET=your-jwt-secret
fly secrets set FRONTEND_URL=https://realtaste.pages.dev
fly deploy

# 3. Deploy frontend to Cloudflare Pages
# Push to GitHub, then connect to Cloudflare Pages
git add . && git commit -m "Production deployment with enhanced order status workflow" && git push
```

## 📋 Step-by-Step

### 1️⃣ Prerequisites (5 minutes)

**Install Fly CLI:**
```powershell
# Windows
iwr https://fly.io/install.ps1 -useb | iex

# macOS/Linux
curl -L https://fly.io/install.sh | sh
```

**Create accounts:**
- [Fly.io account](https://fly.io/app/sign-up) (free tier)
- [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier)

### 2️⃣ Backend Deployment (10 minutes)

```bash
# Navigate to backend
cd backend

# Login to Fly.io
fly auth login

# Initialize app
fly launch --no-deploy
# Choose: app name, Singapore region, no PostgreSQL, no Redis

# Set environment variables (replace with your values)
fly secrets set NODE_ENV=production
fly secrets set SUPABASE_URL=https://your-project-id.supabase.co
fly secrets set SUPABASE_ANON_KEY=your-supabase-anon-key
fly secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
fly secrets set JWT_SECRET=your-super-secret-jwt-key-min-32-chars
fly secrets set FRONTEND_URL=https://your-app-name.pages.dev

# PayHere Payment Gateway (Required for Sri Lankan market)
fly secrets set PAYHERE_MERCHANT_ID=your-merchant-id
fly secrets set PAYHERE_MERCHANT_SECRET=your-merchant-secret
fly secrets set PAYHERE_SANDBOX=false

# Delivery System Configuration
fly secrets set DELIVERY_BASE_FEE=180
fly secrets set DELIVERY_PER_KM_FEE=40
fly secrets set DELIVERY_MAX_RANGE=5

# Deploy
fly deploy

# Verify
fly status
curl https://your-app-name.fly.dev/health
```

### 3️⃣ Frontend Deployment (10 minutes)

**Push to GitHub:**
```bash
cd ..  # Back to root
git add .
git commit -m "Ready for production deployment"
git push origin main
```

**Cloudflare Pages Setup:**
1. Go to [Cloudflare Pages](https://dash.cloudflare.com/pages)
2. Click "Create a project" → "Connect to Git"
3. Select your RealTaste repository
4. Configure:
   - **Framework:** Vite
   - **Build command:** `npm run build:frontend`
   - **Build output:** `frontend/dist`

**Environment Variables:**
Add these in Cloudflare Pages settings:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=https://your-app-name.fly.dev/api
VITE_APP_NAME=RealTaste
VITE_PAYHERE_MERCHANT_ID=your-merchant-id
VITE_PAYHERE_SANDBOX=false
VITE_DELIVERY_BASE_FEE=180
VITE_DELIVERY_PER_KM_FEE=40
VITE_DELIVERY_MAX_RANGE=5
```

5. Click "Save and Deploy"

### 4️⃣ Verification (5 minutes)

**Test Backend:**
```bash
curl https://your-app-name.fly.dev/health
curl https://your-app-name.fly.dev/api/menu
```

**Test Frontend:**
- Visit `https://realtaste.pages.dev`
- Test PWA installation
- Check API connectivity in browser dev tools

## 🎯 Production URLs

After deployment, your app will be available at:

- **Frontend:** `https://realtaste.pages.dev`
- **Backend:** `https://your-app-name.fly.dev`
- **API:** `https://your-app-name.fly.dev/api`

## 🔧 Common Issues & Fixes

### Backend Issues
```bash
# Check logs
fly logs

# Check status
fly status

# Redeploy
fly deploy
```

### Frontend Issues
- Check build logs in Cloudflare Pages dashboard
- Verify environment variables are set
- Check browser console for errors

### CORS Issues
Update backend CORS settings:
```bash
fly secrets set FRONTEND_URL=https://your-actual-domain.pages.dev
```

## 📱 Next Steps

1. **Custom Domain:** Add your own domain in Cloudflare Pages
2. **SSL Certificate:** Automatic with Cloudflare
3. **Performance:** Monitor with Cloudflare Analytics
4. **Monitoring:** Set up alerts in Fly.io dashboard

## 🆘 Need Help?

- **Full Guide:** See `DEPLOYMENT.md`
- **Checklist:** See `DEPLOYMENT_CHECKLIST.md`
- **Environment:** See `production.env.example`

## 🎉 Success!

Your RealTaste PWA is now live and ready for customers! 

**Share your success:** Tweet about your deployment with #RealTaste #PWA #SriLanka
