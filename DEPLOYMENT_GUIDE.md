# RealTaste PayHere Sandbox Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Backend Deployment (Fly.io)

```bash
# Navigate to backend directory
cd backend

# Set environment variables for sandbox testing in production
fly secrets set USE_LIVE_PAYHERE=false
fly secrets set BACKEND_URL=https://realtaste-api.fly.dev
fly secrets set NODE_ENV=production

# Deploy the updated backend
fly deploy
```

### 2. Frontend Deployment (Cloudflare Pages)

The frontend doesn't need any changes for PayHere sandbox testing. The existing environment variables are sufficient:

```bash
VITE_API_URL=https://realtaste-api.fly.dev/api
VITE_APP_NAME=RealTaste
```

### 3. Verify Deployment

After deployment, check the backend logs to confirm PayHere configuration:

```bash
fly logs
```

You should see:
```
🔧 PayHere Configuration:
   Sandbox Mode: true
   PayHere Base URL: https://sandbox.payhere.lk
   Backend URL: https://realtaste-api.fly.dev
   Environment USE_LIVE_PAYHERE: false
   Environment NODE_ENV: production
```

## 🧪 Testing PayHere Sandbox on Deployed Environment

### Test Card Numbers (PayHere Sandbox)

Use these test card numbers for sandbox testing:

**Successful Payment:**
- Card Number: `4111111111111111`
- Expiry: Any future date (e.g., `12/25`)
- CVV: Any 3 digits (e.g., `123`)
- Name: Any name

**Failed Payment:**
- Card Number: `4000000000000002`
- Expiry: Any future date
- CVV: Any 3 digits

### Testing Flow

1. **Place an Order**: Go to your deployed frontend and place an order with card payment
2. **PayHere Redirect**: Verify you're redirected to `https://sandbox.payhere.lk/pay/checkout`
3. **Complete Payment**: Use test card numbers above
4. **Verify Callbacks**: Check that you're redirected back to your frontend
5. **Check Order Status**: Verify the order status updates correctly

## 🔄 Switching to Live PayHere (When Ready)

### Prerequisites
- Live PayHere merchant account approved
- Live merchant ID and secret obtained
- All testing completed successfully

### Steps
```bash
# Update to live credentials
fly secrets set PAYHERE_MERCHANT_ID=your-live-merchant-id
fly secrets set PAYHERE_MERCHANT_SECRET=your-live-merchant-secret

# Enable live PayHere
fly secrets set USE_LIVE_PAYHERE=true

# Deploy
fly deploy
```

### Verification
After switching to live mode, verify:
- PayHere URL becomes `https://www.payhere.lk/pay`
- Real payments are processed
- All callbacks work correctly

## 🛠️ Troubleshooting

### Common Issues

**1. PayHere shows "Merchant not found"**
- Check `PAYHERE_MERCHANT_ID` is correct
- Verify merchant account is active in PayHere dashboard

**2. Payments stuck in "Pending"**
- Check `notify_url` is accessible from internet
- Verify PayHere webhook signature validation
- Check backend logs for webhook errors

**3. Callback URLs not working**
- Ensure `BACKEND_URL` is set correctly
- Verify all callback endpoints are deployed
- Check CORS configuration

### Debug Commands

```bash
# Check current environment variables
fly secrets list

# View real-time logs
fly logs -f

# Check app status
fly status
```

## 📋 Environment Variables Reference

### Required for Sandbox Testing in Production
```bash
NODE_ENV=production
USE_LIVE_PAYHERE=false
BACKEND_URL=https://realtaste-api.fly.dev
PAYHERE_MERCHANT_ID=1230547
PAYHERE_MERCHANT_SECRET=your-sandbox-secret
```

### Required for Live Production
```bash
NODE_ENV=production
USE_LIVE_PAYHERE=true
BACKEND_URL=https://realtaste-api.fly.dev
PAYHERE_MERCHANT_ID=your-live-merchant-id
PAYHERE_MERCHANT_SECRET=your-live-secret
```

## 🔐 Security Notes

- Never commit `.env.production` files
- Use `fly secrets` for sensitive data
- Regularly rotate merchant secrets
- Monitor PayHere webhook logs
- Test thoroughly before switching to live mode

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review PayHere documentation
3. Check backend logs for detailed error messages
4. Verify all environment variables are set correctly
