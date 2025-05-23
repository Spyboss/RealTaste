import axios from 'axios';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('supabase.auth.token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
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
      // Clear auth token on 401
      localStorage.removeItem('supabase.auth.token');
      // Optionally redirect to login
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Generic API response handler
export const handleApiResponse = <T>(response: any): T => {
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
