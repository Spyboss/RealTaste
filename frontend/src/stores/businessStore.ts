import { create } from 'zustand';
import { BusinessHours } from '../types/shared';
import { businessService } from '@/services/businessService';

interface BusinessState {
  businessHours: BusinessHours | null;
  isOpen: boolean;
  restaurantName: string;
  restaurantPhone: string;
  loading: boolean;
  error: string | null;

  // Actions
  fetchBusinessInfo: () => Promise<void>;
  checkStatus: () => Promise<void>;
}

export const useBusinessStore = create<BusinessState>((set) => ({
  businessHours: null,
  isOpen: false,
  restaurantName: 'RealTaste',
  restaurantPhone: '',
  loading: false,
  error: null,

  fetchBusinessInfo: async () => {
    try {
      set({ loading: true, error: null });

      // Add a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Business info request timed out')), 15000);
      });

      const data = await Promise.race([
        businessService.getBusinessHours(),
        timeoutPromise
      ]) as any;

      set({
        businessHours: data.business_hours,
        isOpen: data.currently_open,
        restaurantName: data.restaurant_name,
        restaurantPhone: data.restaurant_phone,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching business info:', error);
      set({
        error: 'Failed to load business information',
        loading: false,
        // Set default values so app can still function
        businessHours: null,
        isOpen: false,
        restaurantName: 'RealTaste',
        restaurantPhone: '',
      });
    }
  },

  checkStatus: async () => {
    try {
      const data = await businessService.getBusinessStatus();
      set({
        isOpen: data.is_open,
      });
    } catch (error) {
      console.error('Error checking business status:', error);
    }
  },
}));
