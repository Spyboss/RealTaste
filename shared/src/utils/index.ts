import { BusinessHours } from '../types';

// Business Hours Utilities
export const isRestaurantOpen = (businessHours: BusinessHours): boolean => {
  if (!businessHours.is_open) return false;
  
  const now = new Date();
  const sriLankaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Colombo" }));
  
  const currentTime = sriLankaTime.getHours() * 100 + sriLankaTime.getMinutes();
  const openTime = parseTimeString(businessHours.open_time);
  const closeTime = parseTimeString(businessHours.close_time);
  
  return currentTime >= openTime && currentTime <= closeTime;
};

export const parseTimeString = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 100 + minutes;
};

export const formatTime = (timeStr: string): string => {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Price Utilities
export const formatPrice = (amount: number): string => {
  return `Rs. ${amount.toFixed(2)}`;
};

export const calculateItemTotal = (
  basePrice: number,
  variantModifier: number = 0,
  addonPrices: number[] = [],
  quantity: number = 1
): number => {
  const itemPrice = basePrice + variantModifier;
  const addonsTotal = addonPrices.reduce((sum, price) => sum + price, 0);
  return (itemPrice + addonsTotal) * quantity;
};

// Phone Number Utilities
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Sri Lankan phone number formatting
  if (cleaned.startsWith('94')) {
    // International format: +94 XX XXX XXXX
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  } else if (cleaned.startsWith('0')) {
    // Local format: 0XX XXX XXXX
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  return phone; // Return as-is if format not recognized
};

export const validatePhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  
  // Sri Lankan phone number validation
  // Mobile: 07X XXXXXXX (10 digits starting with 07)
  // Landline: 0XX XXXXXXX (9-10 digits starting with 0)
  // International: 947X XXXXXXX (11 digits starting with 947)
  
  if (cleaned.startsWith('94')) {
    return cleaned.length === 11 && cleaned.startsWith('947');
  } else if (cleaned.startsWith('0')) {
    return (cleaned.length === 9 || cleaned.length === 10) && cleaned.startsWith('07');
  }
  
  return false;
};

// Order Utilities
export const getOrderStatusDisplay = (status: string): string => {
  const statusMap: Record<string, string> = {
    'received': 'Order Received',
    'preparing': 'Preparing',
    'ready_for_pickup': 'Ready for Pickup',
    'picked_up': 'Picked Up',
    'cancelled': 'Cancelled'
  };
  
  return statusMap[status] || status;
};

export const getOrderStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'received': 'bg-blue-100 text-blue-800',
    'preparing': 'bg-yellow-100 text-yellow-800',
    'ready_for_pickup': 'bg-green-100 text-green-800',
    'picked_up': 'bg-gray-100 text-gray-800',
    'cancelled': 'bg-red-100 text-red-800'
  };
  
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

// Date/Time Utilities
export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Validation Utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateOrderId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `RT-${timestamp}-${random}`.toUpperCase();
};

// Local Storage Utilities
export const setLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Failed to read from localStorage:', error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
  }
};
