# 🔧 Frontend API Connection Fix

## 🚨 **Current Issue**
The frontend is trying to connect to `http://localhost:3001/api` instead of the deployed backend `https://realtaste.fly.dev/api`, causing 500 errors when fetching orders.

## ✅ **Solution**

### **Option 1: Update Cloudflare Pages Environment Variables (Recommended)**

1. **Go to Cloudflare Pages Dashboard**:
   - Visit: https://dash.cloudflare.com/
   - Navigate to Pages → realtaste

2. **Update Environment Variables**:
   - Go to Settings → Environment Variables
   - Update or add: `VITE_API_URL=https://realtaste.fly.dev/api`
   - Save changes

3. **Trigger Redeploy**:
   - Go to Deployments tab
   - Click "Retry deployment" on the latest deployment
   - Or push any change to trigger new deployment

### **Option 2: Quick Local Test**

To test locally with the correct API:

```bash
cd frontend
# Update .env file
echo "VITE_API_URL=https://realtaste.fly.dev/api" > .env.local
npm run dev
```

## 🧪 **Verification Steps**

After updating the environment variables:

1. **Check Network Tab**: 
   - Open browser dev tools
   - Go to Network tab
   - Place an order
   - Verify API calls go to `realtaste.fly.dev` not `localhost`

2. **Test Payment Flow**:
   - Add items to cart
   - Go to checkout
   - Select card payment
   - Complete order creation
   - Should redirect to PayHere sandbox

3. **Test Order Fetching**:
   - After payment, check if order details load correctly
   - No more "undefined" errors in console

## 📋 **Current Environment Variables Needed**

```bash
# Critical - Must be updated
VITE_API_URL=https://realtaste.fly.dev/api

# Already correct
VITE_SUPABASE_URL=https://vyqcamhvltkwjsnrfkkj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_NAME=RealTaste
```

## 🎯 **Expected Result**

After fixing the API URL:
- ✅ Orders will load correctly
- ✅ Payment flow will work end-to-end
- ✅ No more 500 errors
- ✅ PayHere sandbox integration fully functional

## 🚀 **Status**

- ✅ Backend: Deployed and working (PayHere sandbox configured)
- ❌ Frontend: Needs API URL update
- ⏳ Next: Update Cloudflare Pages environment variables
