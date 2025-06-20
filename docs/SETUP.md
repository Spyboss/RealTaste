# RealTaste Setup Guide

This guide will help you set up the complete RealTaste system with delivery management, payment integration, and admin dashboard from scratch for development and production.

## 🚀 Development Setup

### 1. Prerequisites

Make sure you have:
- **Node.js 18+** and **npm 9+**
- **Git** for version control
- **Supabase account** (free tier is fine)
- **Code editor** (VS Code recommended)
- **PayHere Developer Account** (for payment testing)
- **Modern browser** with geolocation support

### 2. Project Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd RealTaste

# Install dependencies for all workspaces
npm install
```

### 3. Supabase Setup

#### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be ready
4. Note down your project URL and anon key

#### Setup Database Schema
1. Go to SQL Editor in Supabase dashboard
2. Copy and paste the contents of `supabase/schema.sql`
3. Run the query to create tables and policies
4. Apply the latest migration for enhanced order status workflow:
   - Run `supabase/migrations/20250119_enhanced_order_status_workflow.sql`
   - This adds new order statuses: `confirmed`, `ready_for_delivery`, `picked_up`, `delivered`, `completed`
   - Includes delivery-related fields and database indexes

#### Add Sample Data
1. In SQL Editor, copy and paste `supabase/seed.sql`
2. Run the query to add sample menu items

#### Configure Authentication
1. Go to Authentication > Settings
2. Enable email authentication
3. Optionally enable Google OAuth:
   - Add Google provider
   - Configure OAuth credentials

### 4. Testing Order Status Workflow

After setup, test the enhanced order status workflow:

#### Create Test Orders
1. Place a pickup order and verify status progression:
   - received → confirmed → preparing → ready_for_pickup → picked_up → completed
2. Place a delivery order and verify status progression:
   - received → confirmed → preparing → ready_for_delivery → delivered → completed

#### Admin Dashboard Testing
1. Access admin dashboard at `/admin`
2. Test status updates using the OrderStatusWidget
3. Verify color-coded status display
4. Test bulk status updates
5. Test order filtering by status and type

#### Database Verification
```sql
-- Check order statuses
SELECT id, status, order_type, created_at FROM orders ORDER BY created_at DESC;

-- Verify enum values
SELECT unnest(enum_range(NULL::order_status));
```

### 4. Environment Configuration

#### Backend Environment
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
# Required - Get from Supabase dashboard
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Required - Generate a secure JWT secret
JWT_SECRET=your-super-secret-jwt-key-here

# PayHere Payment Gateway
PAYHERE_MERCHANT_ID=your-merchant-id
PAYHERE_MERCHANT_SECRET=your-merchant-secret
PAYHERE_SANDBOX=true

# Delivery System Configuration
DELIVERY_BASE_FEE=180
DELIVERY_PER_KM_FEE=40
DELIVERY_MAX_RANGE=5

# Business Configuration
RESTAURANT_NAME=RealTaste
RESTAURANT_PHONE=+94 76 195 2541
BUSINESS_OPEN_TIME=10:00
BUSINESS_CLOSE_TIME=22:00
BUSINESS_LAT=6.9271
BUSINESS_LNG=79.8612
```

#### Frontend Environment
```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:
```env
# Required - Same as backend
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# API URL for development
VITE_API_URL=http://localhost:3001/api

# App configuration
VITE_APP_NAME=RealTaste

# PayHere Configuration
VITE_PAYHERE_MERCHANT_ID=your-merchant-id
VITE_PAYHERE_SANDBOX=true

# Delivery System
VITE_DELIVERY_BASE_FEE=180
VITE_DELIVERY_PER_KM_FEE=40
VITE_DELIVERY_MAX_RANGE=5

# Business Location (Colombo coordinates as example)
VITE_BUSINESS_LAT=6.9271
VITE_BUSINESS_LNG=79.8612
```

### 5. Start Development

```bash
# Start both frontend and backend (Recommended)
npm run dev

# Or start individually
npm run dev:frontend  # http://localhost:5173
npm run dev:backend   # http://localhost:3001

# Build shared utilities in watch mode
npm run build:shared --watch
```

### 6. Create Admin User

1. Register a new account through the frontend
2. In Supabase dashboard, go to Authentication > Users
3. Find your user and note the UUID
4. In SQL Editor, run:
```sql
UPDATE users SET role = 'admin' WHERE id = 'your-user-uuid';
```

## 🌐 Production Deployment

### 1. Frontend Deployment (Cloudflare Pages)

#### Setup
1. Push your code to GitHub
2. Go to [Cloudflare Pages](https://pages.cloudflare.com)
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: `cd frontend && npm run build`
   - **Build output directory**: `frontend/dist`
   - **Root directory**: `/` (leave empty)

#### Environment Variables
Add these in Cloudflare Pages dashboard:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-backend-domain.railway.app/api
VITE_APP_NAME=RealTaste
```

#### Custom Domain (Optional)
1. Add your domain in Cloudflare Pages
2. Update DNS records as instructed
3. SSL will be automatically configured

### 2. Backend Deployment (Railway)

#### Setup
1. Go to [Railway](https://railway.app)
2. Create new project from GitHub repo
3. Configure service:
   - **Root directory**: `backend`
   - **Build command**: `npm run build`
   - **Start command**: `npm start`

#### Environment Variables
Add these in Railway dashboard:
```
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-production-jwt-secret
RESTAURANT_NAME=RealTaste
RESTAURANT_PHONE=+94 76 195 2541
BUSINESS_OPEN_TIME=10:00
BUSINESS_CLOSE_TIME=22:00
```

#### Custom Domain (Optional)
1. Add custom domain in Railway
2. Update DNS records
3. SSL will be automatically configured

### 3. Database Configuration (Supabase)

#### Production Settings
1. Go to Settings > API
2. Note your production URLs and keys
3. Update environment variables in frontend and backend

#### Security
1. Go to Authentication > Settings
2. Add your production domains to allowed origins
3. Configure email templates if needed

#### Backup
1. Enable automatic backups in Supabase
2. Consider setting up monitoring

## 🔧 Configuration Options

### Business Hours
Modify in backend environment:
```env
BUSINESS_OPEN_TIME=09:00
BUSINESS_CLOSE_TIME=23:00
```

### Rate Limiting
Adjust API rate limits:
```env
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # requests per window
```

### Payment Methods
Enable/disable payment options:
```env
# PayHere for card payments
PAYHERE_MERCHANT_ID=your-id
PAYHERE_SANDBOX=false  # Set to false for production

# Cash is always enabled
```

## 🔍 Verification

### Development Checklist
- [ ] Frontend loads at http://localhost:5173
- [ ] Backend API responds at http://localhost:3001/health
- [ ] Menu items display correctly
- [ ] User registration/login works
- [ ] Cart functionality works
- [ ] Order placement works
- [ ] Admin panel accessible (after creating admin user)

### Production Checklist
- [ ] Frontend deployed and accessible
- [ ] Backend deployed and accessible
- [ ] Database connected and working
- [ ] Authentication working
- [ ] Orders can be placed
- [ ] Admin panel working
- [ ] PWA installable on mobile
- [ ] SSL certificates active

## 🚨 Troubleshooting

### Common Issues

#### "Cannot connect to Supabase"
- Check your Supabase URL and keys
- Ensure project is not paused
- Check network connectivity

#### "JWT token invalid"
- Verify JWT_SECRET matches between frontend and backend
- Check token expiration settings
- Clear browser localStorage and try again

#### "CORS errors"
- Add your domain to Supabase allowed origins
- Check backend CORS configuration
- Ensure API URL is correct in frontend

#### "Build fails"
- Check Node.js version (18+ required)
- Clear node_modules and reinstall
- Check for TypeScript errors

#### "Orders not updating in real-time"
- Verify Supabase realtime is enabled
- Check RLS policies allow subscriptions
- Test WebSocket connectivity

### Getting Help

1. Check the logs:
   - **Frontend**: Browser console
   - **Backend**: Railway logs or local terminal
   - **Database**: Supabase logs

2. Common log locations:
   - Railway: Project dashboard > Deployments > View logs
   - Cloudflare: Pages dashboard > Functions > View logs
   - Supabase: Dashboard > Logs

3. Debug mode:
   - Set `NODE_ENV=development` for detailed errors
   - Enable browser dev tools
   - Check network tab for API calls

## 📞 Support

If you encounter issues:
1. Check this documentation
2. Review error logs
3. Search existing GitHub issues
4. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details
   - Relevant logs

---

Happy coding! 🚀
