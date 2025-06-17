import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type Location,
  calculateDistance,
  calculateDeliveryFee,
  RESTAURANT_LOCATION
} from '../services/locationService';

export interface DeliveryInfo {
  location: Location;
  distance: number;
  deliveryFee: number;
  address?: string;
  verified: boolean;
}

export interface DeliveryState {
  deliveryInfo: DeliveryInfo | null;
  isDeliveryAvailable: boolean;
  
  // Actions
  setDeliveryInfo: (location: Location, address?: string) => void;
  updateDeliveryFee: () => void;
  clearDeliveryInfo: () => void;
  getDeliveryFee: () => number;
  getDistance: () => number;
}

export const useDeliveryStore = create<DeliveryState>()(
  persist(
    (set, get) => ({
      deliveryInfo: null,
      isDeliveryAvailable: false,

      setDeliveryInfo: (location: Location, address?: string) => {
        const distance = calculateDistance(location, RESTAURANT_LOCATION);
        const deliveryFee = calculateDeliveryFee(distance);
        
        const deliveryInfo: DeliveryInfo = {
          location,
          distance,
          deliveryFee,
          address,
          verified: true
        };

        set({
          deliveryInfo,
          isDeliveryAvailable: true
        });
      },

      updateDeliveryFee: () => {
        const { deliveryInfo } = get();
        if (deliveryInfo) {
          const newDeliveryFee = calculateDeliveryFee(deliveryInfo.distance);
          set({
            deliveryInfo: {
              ...deliveryInfo,
              deliveryFee: newDeliveryFee
            }
          });
        }
      },

      clearDeliveryInfo: () => {
        set({
          deliveryInfo: null,
          isDeliveryAvailable: false
        });
      },

      getDeliveryFee: () => {
        const { deliveryInfo } = get();
        return deliveryInfo?.deliveryFee || 0;
      },

      getDistance: () => {
        const { deliveryInfo } = get();
        return deliveryInfo?.distance || 0;
      }
    }),
    {
      name: 'delivery-store',
      partialize: (state) => ({
        deliveryInfo: state.deliveryInfo,
        isDeliveryAvailable: state.isDeliveryAvailable
      })
    }
  )
);

// Helper function to get delivery info from global window object
export const getGlobalDeliveryInfo = (): DeliveryInfo | null => {
  if (typeof window !== 'undefined' && window.userDeliveryInfo) {
    const { location, distance } = window.userDeliveryInfo;
    return {
      location,
      distance,
      deliveryFee: calculateDeliveryFee(distance),
      verified: true
    };
  }
  return null;
};

// Extend window interface for TypeScript
declare global {
  interface Window {
    userDeliveryInfo?: {
      location: Location;
      distance: number;
      verified: boolean;
    };
  }
}