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
      // Clear auth storage and reset auth state on 401
      localStorage.removeItem('auth-storage');
      // Reset auth store state by dispatching a custom event
      window.dispatchEvent(new CustomEvent('auth-reset'));
      // Redirect to login
      window.location.href = '/login';
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
