import { api, handleApiResponse } from './api';
import { BusinessHours } from '@realtaste/shared';

export const businessService = {
  // Get business hours and info
  getBusinessHours: async (): Promise<{
    business_hours: BusinessHours;
    currently_open: boolean;
    restaurant_name: string;
    restaurant_phone: string;
  }> => {
    const response = await api.get('/business/hours');
    return handleApiResponse(response);
  },

  // Get current restaurant status
  getBusinessStatus: async (): Promise<{
    is_open: boolean;
    current_time: string;
    next_opening?: string;
    message: string;
  }> => {
    const response = await api.get('/business/status');
    return handleApiResponse(response);
  },
};
