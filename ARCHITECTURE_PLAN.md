# RealTaste Architecture & Feature Implementation Plan

## Current Issues & Solutions

### 1. Authentication Problems ✅ FIXED
- **Issue**: Users can't sign up, "JSON object requested, multiple rows returned"
- **Root Cause**: No trigger to create user records in `users` table when auth.users is populated
- **Solution**: Added `handle_new_user()` trigger function
- **Status**: Migration created (`20250117_add_user_creation_trigger.sql`)

### 2. Food Images ✅ FIXED
- **Issue**: Placeholder letters instead of food images
- **Root Cause**: Empty `image_url` fields in menu_items table
- **Solution**: Added high-quality stock images for all menu items
- **Status**: Migration created (`20250117_add_food_images.sql`)

### 3. API Connection ✅ FIXED
- **Issue**: Frontend connecting to localhost instead of deployed backend
- **Root Cause**: Wrong `VITE_API_URL` in environment
- **Solution**: Updated to use `https://realtaste.fly.dev/api`
- **Status**: Fixed in `.env` file

## New Features Implementation

### 1. Location-Based Ordering (5km Radius)

#### Implementation Strategy:
```typescript
// Location service
interface LocationService {
  getCurrentLocation(): Promise<{lat: number, lng: number}>;
  calculateDistance(point1: Location, point2: Location): number;
  isWithinRadius(userLocation: Location, restaurantLocation: Location, radiusKm: number): boolean;
}

// Restaurant location (hardcoded for now, admin configurable later)
const RESTAURANT_LOCATION = {
  lat: 6.9271, // Colombo coordinates
  lng: 79.8612,
  address: "Main Restaurant Location"
};
```

#### Components to Create:
- `LocationPermissionModal.tsx` - Request location access
- `LocationVerification.tsx` - Check if user is within 5km
- `LocationDeniedPage.tsx` - Show when user is outside radius
- `useLocation.ts` - Custom hook for location management

#### Database Changes:
```sql
-- Add location tracking to orders
ALTER TABLE orders ADD COLUMN delivery_latitude DECIMAL(10, 8);
ALTER TABLE orders ADD COLUMN delivery_longitude DECIMAL(11, 8);
ALTER TABLE orders ADD COLUMN delivery_address TEXT;
ALTER TABLE orders ADD COLUMN delivery_distance_km DECIMAL(5, 2);
```

### 2. Delivery Features

#### Delivery Pricing Structure:
- Base delivery fee: LKR 150
- Distance-based charge: LKR 50 per km beyond 2km
- Online payment processing fee: LKR 25
- Free delivery for orders above LKR 2000

#### New Order Types:
```typescript
type OrderType = 'pickup' | 'delivery';
type DeliveryZone = 'zone1' | 'zone2' | 'zone3'; // Based on distance

interface DeliveryInfo {
  type: OrderType;
  address?: string;
  coordinates?: {lat: number, lng: number};
  distance_km?: number;
  delivery_fee: number;
  estimated_delivery_time?: string;
}
```

#### Database Schema Updates:
```sql
-- Add delivery-related fields
ALTER TABLE orders ADD COLUMN order_type order_type DEFAULT 'pickup';
ALTER TABLE orders ADD COLUMN delivery_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN delivery_address TEXT;
ALTER TABLE orders ADD COLUMN estimated_delivery_time TIMESTAMP WITH TIME ZONE;

-- Create delivery zones table
CREATE TABLE delivery_zones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  max_distance_km DECIMAL(5,2) NOT NULL,
  base_fee DECIMAL(10,2) NOT NULL,
  per_km_fee DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);
```

### 3. Enhanced Admin Dashboard

#### Admin Capabilities:
1. **Menu Management**
   - Add/edit/delete menu items
   - Upload and manage food images
   - Set availability and pricing
   - Manage categories and variants

2. **Order Management**
   - Real-time order queue
   - Update order status
   - Delivery assignment and tracking
   - Customer communication

3. **Analytics & Reporting**
   - Sales analytics
   - Popular items tracking
   - Customer insights
   - Delivery performance metrics

4. **System Configuration**
   - Restaurant location settings
   - Delivery zones and pricing
   - Operating hours
   - Payment gateway settings

#### Admin Dashboard Structure:
```
/admin
├── /dashboard          # Overview & analytics
├── /orders            # Order management
│   ├── /queue         # Real-time order queue
│   ├── /history       # Order history
│   └── /delivery      # Delivery management
├── /menu              # Menu management
│   ├── /items         # Menu items CRUD
│   ├── /categories    # Category management
│   └── /images        # Image management
├── /customers         # Customer management
├── /analytics         # Detailed analytics
├── /settings          # System settings
│   ├── /restaurant    # Restaurant info
│   ├── /delivery      # Delivery settings
│   └── /payments      # Payment settings
└── /staff             # Staff management
```

### 4. Kitchen Dashboard

#### Kitchen-Specific Features:
- Simplified order queue focused on preparation
- Timer-based workflow
- Ingredient availability tracking
- Preparation time estimation

#### Kitchen Dashboard Structure:
```
/kitchen
├── /queue             # Active orders to prepare
├── /preparing         # Orders currently being prepared
├── /ready             # Orders ready for pickup/delivery
└── /inventory         # Basic inventory tracking
```

## Technical Implementation Plan

### Phase 1: Core Fixes (Immediate)
1. ✅ Apply database migrations for user creation and food images
2. ✅ Fix API URL configuration
3. Test authentication flow
4. Verify food images display correctly

### Phase 2: Location-Based Ordering (Week 1)
1. Implement location services
2. Create location permission flow
3. Add radius checking logic
4. Update order flow to include location

### Phase 3: Delivery Features (Week 2)
1. Design delivery pricing logic
2. Update order schema for delivery
3. Implement delivery fee calculation
4. Create delivery address input

### Phase 4: Enhanced Admin Dashboard (Week 3-4)
1. Create admin menu management
2. Implement image upload functionality
3. Build analytics dashboard
4. Add system configuration panels

### Phase 5: Kitchen Dashboard (Week 5)
1. Design kitchen-focused interface
2. Implement order preparation workflow
3. Add timer and notification systems
4. Create inventory tracking basics

## Database Schema Evolution

### New Tables Needed:
```sql
-- Delivery zones
CREATE TABLE delivery_zones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  max_distance_km DECIMAL(5,2) NOT NULL,
  base_fee DECIMAL(10,2) NOT NULL,
  per_km_fee DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Restaurant settings
CREATE TABLE restaurant_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  phone TEXT,
  email TEXT,
  operating_hours JSONB,
  delivery_radius_km DECIMAL(5,2) DEFAULT 5,
  is_delivery_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff/Kitchen users
CREATE TYPE staff_role AS ENUM ('kitchen', 'delivery', 'manager');

ALTER TABLE users ADD COLUMN staff_role staff_role;
```

## Security Considerations

1. **Location Privacy**: Only store necessary location data, allow users to opt-out
2. **Admin Access**: Implement proper role-based access control
3. **Payment Security**: Ensure PCI compliance for payment processing
4. **Data Protection**: Implement proper data encryption and backup

## Performance Optimizations

1. **Image Optimization**: Implement WebP format, lazy loading, CDN
2. **Real-time Updates**: Optimize WebSocket connections for order updates
3. **Database Indexing**: Add proper indexes for location-based queries
4. **Caching**: Implement Redis for frequently accessed data

## Future Enhancements

1. **Multi-restaurant Support**: Scale to support multiple restaurant locations
2. **Advanced Analytics**: ML-based demand forecasting and recommendations
3. **Customer Loyalty**: Points system and rewards program
4. **Integration APIs**: Third-party delivery services, accounting software
5. **Mobile Apps**: Native iOS and Android applications

This architecture plan transforms RealTaste from a basic ordering system into a comprehensive restaurant management platform that can compete with major food delivery services while maintaining focus on the Sri Lankan market.