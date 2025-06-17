// Location service for 5km radius restriction

export interface Location {
  lat: number;
  lng: number;
}

export interface LocationPermissionResult {
  granted: boolean;
  location?: Location;
  error?: string;
}

// Restaurant location (Real Taste, Rawatawatta Rd, Moratuwa 10400)
export const RESTAURANT_LOCATION: Location = {
  lat: 6.788071, // Moratuwa, Sri Lanka - Rawatawatta Road area
  lng: 79.891281
};

export const DELIVERY_RADIUS_KM = 5;

/**
 * Calculate distance between two points using Haversine formula
 * @param point1 First location
 * @param point2 Second location
 * @returns Distance in kilometers
 */
export function calculateDistance(point1: Location, point2: Location): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if user location is within delivery radius
 * @param userLocation User's current location
 * @returns true if within radius, false otherwise
 */
export function isWithinDeliveryRadius(userLocation: Location): boolean {
  const distance = calculateDistance(userLocation, RESTAURANT_LOCATION);
  return distance <= DELIVERY_RADIUS_KM;
}

/**
 * Get user's current location
 * @returns Promise with location result
 */
export async function getCurrentLocation(): Promise<LocationPermissionResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        granted: false,
        error: 'Geolocation is not supported by this browser'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        resolve({
          granted: true,
          location
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        resolve({
          granted: false,
          error: errorMessage
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}

/**
 * Calculate delivery fee based on distance
 * @param distance Distance in kilometers
 * @returns Delivery fee in LKR
 */
export function calculateDeliveryFee(distance: number): number {
  const BASE_FEE = 150; // LKR 150 base fee
  const PER_KM_FEE = 50; // LKR 50 per km beyond 2km
  const FREE_DELIVERY_THRESHOLD = 2; // Free delivery within 2km
  
  if (distance <= FREE_DELIVERY_THRESHOLD) {
    return BASE_FEE;
  }
  
  const extraDistance = distance - FREE_DELIVERY_THRESHOLD;
  return BASE_FEE + (extraDistance * PER_KM_FEE);
}

/**
 * Get address from coordinates using reverse geocoding
 * @param location Location coordinates
 * @returns Promise with address string
 */
export async function getAddressFromLocation(location: Location): Promise<string> {
  try {
    // Using a free geocoding service (you might want to use Google Maps API for production)
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.lat}&longitude=${location.lng}&localityLanguage=en`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }
    
    const data = await response.json();
    return data.display_name || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
  } catch (error) {
    console.error('Error getting address:', error);
    return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
  }
}

/**
 * Store user location in localStorage for future use
 * @param location User location
 */
export function storeUserLocation(location: Location): void {
  localStorage.setItem('userLocation', JSON.stringify(location));
}

/**
 * Get stored user location from localStorage
 * @returns Stored location or null
 */
export function getStoredUserLocation(): Location | null {
  try {
    const stored = localStorage.getItem('userLocation');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Clear stored user location
 */
export function clearStoredLocation(): void {
  localStorage.removeItem('userLocation');
}