// Location Configuration
// This file contains configurable location settings for the restaurant

export interface LocationConfig {
  lat: number;
  lng: number;
  name: string;
  address: string;
  deliveryRadius: number; // in kilometers
}

// Default restaurant location (can be overridden by environment variables)
export const DEFAULT_RESTAURANT_LOCATION: LocationConfig = {
  lat: 6.261449,
  lng: 80.906462,
  name: "RealTaste Restaurant",
  address: "Main Location",
  deliveryRadius: 10 // 10km delivery radius
};

// Environment-based configuration
// You can override these values using environment variables in .env file:
// VITE_RESTAURANT_LAT=6.261449
// VITE_RESTAURANT_LNG=80.906462
// VITE_RESTAURANT_NAME="RealTaste Restaurant"
// VITE_RESTAURANT_ADDRESS="Main Location"
// VITE_DELIVERY_RADIUS=10

export const getRestaurantLocation = (): LocationConfig => {
  return {
    lat: Number(import.meta.env.VITE_RESTAURANT_LAT as string) || DEFAULT_RESTAURANT_LOCATION.lat,
    lng: Number(import.meta.env.VITE_RESTAURANT_LNG as string) || DEFAULT_RESTAURANT_LOCATION.lng,
    name: (import.meta.env.VITE_RESTAURANT_NAME as string) || DEFAULT_RESTAURANT_LOCATION.name,
    address: (import.meta.env.VITE_RESTAURANT_ADDRESS as string) || DEFAULT_RESTAURANT_LOCATION.address,
    deliveryRadius: Number(import.meta.env.VITE_DELIVERY_RADIUS as string) || DEFAULT_RESTAURANT_LOCATION.deliveryRadius
  };
};

// Helper function to get just the coordinates
export const getRestaurantCoordinates = () => {
  const config = getRestaurantLocation();
  return {
    lat: config.lat,
    lng: config.lng
  };
};

// Helper function to get delivery radius
export const getDeliveryRadius = (): number => {
  return getRestaurantLocation().deliveryRadius;
};