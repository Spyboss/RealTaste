import { create } from 'zustand';
import { BusinessHours } from '@realtaste/shared';
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

      const data = await businessService.getBusinessHours();

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
