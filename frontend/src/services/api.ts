import axios from 'axios';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || 'https://realtaste.fly.dev/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get the session from the auth store's persisted data
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        const token = authData?.state?.session?.access_token;
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.warn('Failed to get auth token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login for protected endpoints, not public ones
      const url = error.config?.url || '';
      const isPublicEndpoint = url.includes('/menu') || url.includes('/business');
      const currentPath = window.location.pathname;
      const isOnPublicPage = ['/', '/login', '/register'].includes(currentPath);
      
      if (!isPublicEndpoint && !isOnPublicPage) {
        // Clear auth storage and reset auth state on 401 for protected endpoints
        localStorage.removeItem('auth-storage');
        // Reset auth store state by dispatching a custom event
        window.dispatchEvent(new CustomEvent('auth-reset'));
        // Redirect to login only if not already on a public page
        window.location.href = '/login';
      } else {
        // For public endpoints or when on public pages, just log the error
        console.warn('401 error on public endpoint or public page:', url, currentPath);
      }
    } else if (error.response?.data) {
      // Log API errors with response details
      console.error('API Error:', {
        status: error.response.status,
        url: error.config.url,
        method: error.config.method,
        data: error.response.data
      });
    }

    return Promise.reject(error);
  }
);

// Generic API response handler
export const handleApiResponse = <T>(response: any): T => {
  // First check if response is actually JSON
  const contentType = response.headers['content-type'];
  if (!contentType?.includes('application/json')) {
    const error = new Error(`Expected JSON response but got ${contentType}`);
    console.error('Non-JSON response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });

    // Check if response is HTML (likely an error page)
    if (response.data && response.data.includes('<!doctype html>')) {
      console.error('Received HTML error page instead of JSON:', response.config.url);
      throw new Error('Received HTML error page from server');
    }

    throw error;
  }

  if (!response.data.success) {
    throw new Error(response.data.error || 'API request failed');
  }
  return response.data.data!;
};

// API error handler
export const handleApiError = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Delivery API functions
export const deliveryApi = {
  // Calculate delivery fee based on coordinates
  calculateFee: async (lat: number, lng: number) => {
    const response = await api.post('/delivery/calculate-fee', {
      delivery_latitude: lat,
      delivery_longitude: lng
    });
    return response.data;
  },

  // Get standard delivery fee when coordinates not available
  getStandardFee: async () => {
    const response = await api.get('/delivery/standard-fee');
    return response.data;
  },

  // Get delivery settings (admin only)
  getSettings: async () => {
    const response = await api.get('/delivery/settings');
    return handleApiResponse(response);
  },

  // Update delivery settings (admin only)
  updateSettings: async (settings: {
    base_fee: number;
    per_km_fee: number;
    max_distance_km: number;
    base_time_minutes: number;
    per_km_time_minutes: number;
  }) => {
    const response = await api.put('/delivery/settings', settings);
    return handleApiResponse(response);
  },

  // Get active deliveries (admin only)
  getActiveDeliveries: async () => {
    const response = await api.get('/delivery/active');
    return handleApiResponse(response);
  },

  // Update delivery status (admin only)
  updateDeliveryStatus: async (orderId: string, status: string, estimatedTime?: number, actualTime?: number) => {
    const response = await api.put(`/delivery/status/${orderId}`, {
      status,
      estimated_delivery_time: estimatedTime,
      actual_delivery_time: actualTime
    });
    return handleApiResponse(response);
  },

  // Get delivery time slot by order ID
  getTimeSlot: async (orderId: string) => {
    const response = await api.get(`/delivery/time-slot/${orderId}`);
    return handleApiResponse(response);
  }
};
