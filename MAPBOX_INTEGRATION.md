# Mapbox Location Selection Integration

This document outlines the implementation of the world-class location selection experience for RealTaste's food delivery PWA using Mapbox GL JS.

## Overview

The new location selection system replaces the previous text input and browser GPS API approach with an interactive map interface that provides:

- **Interactive Map**: Drag-and-drop pin selection for exact delivery points
- **GPS Detection**: Optional location detection with user consent
- **Visual Display**: Restaurant and user locations shown on map
- **Real-time Calculations**: Haversine distance and delivery fee preview
- **Fallback Support**: Manual address entry with geocoding
- **Privacy-First**: No mandatory GPS permissions
- **Mobile-Friendly**: Touch and mouse-friendly UX

## Implementation Details

### 1. MapLocationPicker Component

**File**: `frontend/src/components/MapLocationPicker.tsx`

A React functional component that integrates Mapbox GL JS with the existing RealTaste design system.

#### Key Features:
- Interactive map with drag-and-drop pin placement
- Search functionality using Mapbox Geocoding API
- GPS location detection with user consent
- Real-time delivery fee calculation
- Visual indicators for delivery range status
- Responsive design for mobile and desktop

#### Props Interface:
```typescript
interface MapLocationPickerProps {
  address: string;
  onAddressChange: (address: string) => void;
  coordinates: { lat: number; lng: number } | null;
  onCoordinatesChange: (coords: { lat: number; lng: number } | null) => void;
  deliveryFee: number;
  isWithinRange: boolean;
  onDeliveryFeeChange: (fee: number) => void;
  onRangeStatusChange: (isWithinRange: boolean) => void;
  className?: string;
}
```

### 2. Integration with Checkout Flow

**File**: `frontend/src/pages/CheckoutPage.tsx`

The MapLocationPicker has been integrated into the existing checkout flow, replacing the previous DeliveryAddressInput component.

#### Changes Made:
- Replaced `DeliveryAddressInput` import with `MapLocationPicker`
- Updated delivery location section to use the new component
- Separated delivery notes into a standalone textarea
- Maintained all existing state management and validation logic

### 3. Environment Configuration

**File**: `frontend/.env.example`

Added required environment variables for Mapbox integration:

```env
# Mapbox Configuration
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here

# OpenCage Geocoding API (Optional)
VITE_OPENCAGE_API_KEY=your_opencage_api_key_here

# Restaurant Location (Already configured)
VITE_RESTAURANT_LAT=6.261449
VITE_RESTAURANT_LNG=80.906462
```

### Production Environment Setup

Since the application is deployed on:
- **Frontend**: Cloudflare Pages (https://realtaste.pages.dev/)
- **Backend**: Fly.io

You need to configure environment variables on their respective dashboards:

#### Cloudflare Pages Dashboard
1. Go to your Cloudflare Pages dashboard
2. Select your RealTaste project
3. Navigate to Settings → Environment Variables
4. Add the following variables:
   - `VITE_MAPBOX_ACCESS_TOKEN`: your_mapbox_access_token_here
- `VITE_OPENCAGE_API_KEY`: your_opencage_api_key_here

#### Fly.io Dashboard (Backend)
If any backend environment variables are needed for map integration, configure them in your Fly.io app settings.

## Setup Instructions

### 1. Install Dependencies

The following packages have been added to support Mapbox integration:

```bash
cd frontend
npm install mapbox-gl react-map-gl @types/mapbox-gl
```

### 2. Mapbox API Key Configuration

1. **Create Mapbox Account**:
   - Visit [Mapbox](https://account.mapbox.com/)
   - Sign up for a free account
   - Navigate to "Access Tokens"

2. **Create Access Token**:
   - Click "Create a token"
   - Name: "RealTaste Production" (or similar)
   - Scopes: Ensure the following are selected:
     - `styles:read`
     - `fonts:read`
     - `datasets:read`
     - `geocoding:read`
   - URL restrictions (optional but recommended for production):
     - Add your production domain(s)

3. **Configure Environment**:
   ```bash
   # Copy the example file
   cp .env.example .env.local
   
   # Edit .env.local and add your Mapbox token
   VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbGV4YW1wbGUifQ.example
   ```

### 3. OpenCage API Key (Optional)

For enhanced reverse geocoding, especially for Sri Lankan addresses:

1. Visit [OpenCage Data](https://opencagedata.com/api)
2. Sign up for a free account (2,500 requests/day)
3. Get your API key from the dashboard
4. Add to `.env.local`:
   ```env
   VITE_OPENCAGE_API_KEY=your_opencage_api_key_here
   ```

### 4. Restaurant Location Configuration

Update the restaurant coordinates in `.env.local` to match your actual location:

```env
VITE_RESTAURANT_LAT=6.261449  # Your restaurant's latitude
VITE_RESTAURANT_LNG=80.906462 # Your restaurant's longitude
```

## Features and Functionality

### 1. Location Selection Methods

#### Interactive Map
- Click anywhere on the map to place a delivery pin
- Drag the pin to fine-tune the exact location
- Visual feedback with color-coded pins (green = in range, red = out of range)

#### Search Functionality
- Type-ahead search for Sri Lankan locations
- Powered by Mapbox Geocoding API
- Results prioritized by proximity to restaurant
- Click any result to automatically place pin

#### GPS Detection
- "Use My Location" button for GPS detection
- Requires user permission (not mandatory)
- Automatic reverse geocoding to get readable address
- Fallback to manual selection if GPS fails

### 2. Real-time Calculations

#### Distance Calculation
- Uses existing backend Haversine formula
- Real-time updates as pin is moved
- Displays distance in kilometers

#### Delivery Fee Preview
- Instant calculation based on LKR 180 + LKR 40/km policy
- Uses existing backend `/delivery/calculate-fee` endpoint
- Shows estimated delivery time
- Clear indication if location is outside delivery range

### 3. Privacy and UX Considerations

#### Privacy-First Design
- GPS permission is optional, not required
- Clear messaging about location usage
- No location data transmitted without user action
- Manual override always available

#### Mobile-Friendly UX
- Touch-optimized map controls
- Responsive design for all screen sizes
- Large touch targets for mobile users
- Smooth animations and transitions

## Backend Integration

The implementation leverages existing backend infrastructure:

### Existing Endpoints Used
- `POST /delivery/calculate-fee` - Real-time fee calculation
- `GET /delivery/standard-fee` - Fallback fee when GPS unavailable

### Data Flow
1. User selects location on map
2. Coordinates sent to backend for validation and fee calculation
3. Real-time feedback displayed to user
4. Final coordinates persisted in order data

### Database Schema
No changes required - uses existing order fields:
- `delivery_latitude`
- `delivery_longitude`
- `delivery_address`
- `delivery_fee`
- `delivery_distance_km`

## Security Considerations

### API Key Security
- Mapbox tokens are public by design (client-side usage)
- Use URL restrictions in production to prevent unauthorized usage
- Monitor usage through Mapbox dashboard
- Rotate tokens periodically

### Data Privacy
- Location data only transmitted with explicit user consent
- No persistent storage of GPS coordinates without order placement
- Clear privacy messaging in UI

### Rate Limiting
- Mapbox free tier: 50,000 map loads/month
- Geocoding: 100,000 requests/month
- OpenCage free tier: 2,500 requests/day
- Implement client-side debouncing for search requests

## SSR Considerations

### Current Implementation
- Component designed for client-side rendering
- Mapbox GL JS requires browser environment
- Graceful fallback when Mapbox token not configured

### Future SSR Support
If SSR is required:
1. Use dynamic imports for Mapbox components
2. Implement server-side geocoding for initial address resolution
3. Consider using Mapbox Static API for server-rendered map previews

## Testing and Quality Assurance

### Manual Testing Checklist
- [ ] Map loads correctly with restaurant marker
- [ ] Search functionality works for Sri Lankan locations
- [ ] GPS detection works (with permission)
- [ ] Pin placement and dragging functions properly
- [ ] Delivery fee calculation updates in real-time
- [ ] Out-of-range locations properly indicated
- [ ] Mobile touch interactions work smoothly
- [ ] Fallback behavior when APIs unavailable
- [ ] Order placement includes correct coordinates

### Performance Considerations
- Mapbox GL JS bundle size: ~500KB gzipped
- Lazy loading implemented for map component
- Debounced search requests (300ms delay)
- Efficient re-rendering with React.memo where appropriate

## Troubleshooting

### Common Issues

#### Map Not Loading
- Check Mapbox access token is correctly set
- Verify token has required scopes
- Check browser console for errors
- Ensure internet connectivity

#### GPS Not Working
- Requires HTTPS in production
- User must grant location permission
- Some browsers block location on localhost
- Fallback to manual selection always available

#### Search Not Working
- Verify Mapbox token has geocoding scope
- Check network requests in browser dev tools
- Ensure proper error handling for API failures

#### Delivery Fee Not Calculating
- Check backend `/delivery/calculate-fee` endpoint
- Verify restaurant coordinates are configured
- Ensure coordinates are valid (lat/lng format)

## Future Enhancements

### Potential Improvements
1. **Offline Support**: Cache map tiles for offline usage
2. **Route Optimization**: Show actual driving routes instead of straight-line distance
3. **Delivery Zones**: Visual overlay of delivery boundaries
4. **Address Validation**: Integration with Sri Lankan postal service
5. **Saved Locations**: Allow users to save frequently used addresses
6. **Real-time Tracking**: Integration with delivery tracking system

### Performance Optimizations
1. **Map Clustering**: For multiple restaurant locations
2. **Tile Caching**: Reduce repeated map tile requests
3. **Geocoding Cache**: Cache search results locally
4. **Progressive Loading**: Load map components on demand

## Conclusion

The Mapbox integration provides a world-class location selection experience that addresses the accuracy and privacy concerns of the previous implementation. The solution is:

- **User-Friendly**: Intuitive drag-and-drop interface
- **Privacy-Conscious**: Optional GPS with clear consent
- **Accurate**: Precise coordinate-based delivery
- **Performant**: Optimized for mobile and desktop
- **Maintainable**: Clean integration with existing codebase
- **Scalable**: Ready for future enhancements

The implementation maintains backward compatibility while providing a significantly improved user experience for location selection in the RealTaste food delivery platform.