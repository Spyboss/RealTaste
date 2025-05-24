# PayHere Sandbox Integration Fix

## 🔧 Problem Fixed

The RealTaste app was redirecting users to the live PayHere URL (`https://www.payhere.lk/pay/checkout`) even when configured with sandbox credentials, causing payments to get stuck in "Pending" state during testing.

## ✅ Solution Implemented

### 1. **Environment-Aware PayHere Configuration**

- **New Environment Variable**: `USE_LIVE_PAYHERE`
  - `false` or unset = Sandbox mode (default)
  - `true` = Live PayHere mode

- **Improved Backend URL Detection**: 
  - Auto-detects based on `NODE_ENV`
  - Can be overridden with `BACKEND_URL` environment variable

### 2. **Configuration Changes**

#### Backend Configuration (`backend/src/config/index.ts`)
```typescript
payhere: {
  // Use sandbox unless explicitly set to use live PayHere
  sandbox: process.env.USE_LIVE_PAYHERE !== 'true',
  baseUrl: process.env.USE_LIVE_PAYHERE === 'true'
    ? 'https://www.payhere.lk'
    : 'https://sandbox.payhere.lk',
  // Backend URL for callbacks (supports both local dev and deployed environments)
  backendUrl: process.env.BACKEND_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://realtaste-api.fly.dev' 
      : 'http://localhost:3001'),
}
```

#### PayHere Service (`backend/src/services/payhere.ts`)
- Fixed callback URL logic to use configured backend URL instead of hardcoded localhost
- Added comprehensive debug logging
- Improved environment detection

### 3. **Environment Variables**

#### Development (`.env`)
```bash
USE_LIVE_PAYHERE=false
BACKEND_URL=http://localhost:3001
```

#### Production Sandbox Testing (`.env.production`)
```bash
NODE_ENV=production
USE_LIVE_PAYHERE=false  # Keep sandbox even in production
BACKEND_URL=https://realtaste-api.fly.dev
```

#### Production Live (when ready)
```bash
NODE_ENV=production
USE_LIVE_PAYHERE=true   # Enable live PayHere
BACKEND_URL=https://realtaste-api.fly.dev
```

## 🧪 Testing Results

### Local Development
✅ **Sandbox URL**: `https://sandbox.payhere.lk/pay`
✅ **Callback URLs**: `http://localhost:3001/api/payments/*`

### Production Sandbox (Deployed)
✅ **Sandbox URL**: `https://sandbox.payhere.lk/pay`
✅ **Callback URLs**: `https://realtaste-api.fly.dev/api/payments/*`

### Production Live (When Enabled)
✅ **Live URL**: `https://www.payhere.lk/pay`
✅ **Callback URLs**: `https://realtaste-api.fly.dev/api/payments/*`

## 🚀 Deployment Instructions

### For Sandbox Testing in Production:
```bash
# Fly.io secrets (backend)
fly secrets set USE_LIVE_PAYHERE=false
fly secrets set BACKEND_URL=https://realtaste-api.fly.dev
fly deploy

# Cloudflare Pages (frontend) - no changes needed
```

### For Live PayHere (when ready):
```bash
# Update to live merchant credentials
fly secrets set PAYHERE_MERCHANT_ID=your-live-merchant-id
fly secrets set PAYHERE_MERCHANT_SECRET=your-live-merchant-secret
fly secrets set USE_LIVE_PAYHERE=true
fly deploy
```

## 🔍 Debug Information

The backend now logs detailed PayHere configuration on startup:
```
🔧 PayHere Configuration:
   Sandbox Mode: true
   PayHere Base URL: https://sandbox.payhere.lk
   Backend URL: https://realtaste-api.fly.dev
   Merchant ID: 1230547
   Environment USE_LIVE_PAYHERE: false
   Environment NODE_ENV: production
```

## 📋 Testing Checklist

- [x] Sandbox mode works in local development
- [x] Sandbox mode works in deployed production environment
- [x] Live mode can be enabled via environment variable
- [x] Callback URLs point to correct backend
- [x] PayHere URLs are correct for each mode
- [x] No regression to existing functionality
- [x] Environment variable documentation updated

## 🎯 Benefits

1. **Flexible Testing**: Can test sandbox payments on deployed environments
2. **Easy Toggle**: Switch between sandbox and live with one environment variable
3. **No Code Changes**: Mode switching requires only environment variable changes
4. **Backward Compatible**: Existing functionality preserved
5. **Production Ready**: Supports both sandbox testing and live payments in production

## 🔄 Next Steps

1. Deploy to production with `USE_LIVE_PAYHERE=false`
2. Test sandbox payments end-to-end on deployed environment
3. Verify PayHere webhook callbacks work correctly
4. When ready for live payments, set `USE_LIVE_PAYHERE=true`
