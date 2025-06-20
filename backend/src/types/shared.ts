// Shared types for RealTaste backend
// This is a temporary solution to avoid shared package dependency in Docker

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PopularItem {
  menu_item_id: string;
  menu_item_name: string;
  quantity_sold: number;
  revenue: number;
}

export interface DailyStats {
  date: string;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  popular_items: PopularItem[];
}

export interface BusinessHours {
  open_time: string;
  close_time: string;
  timezone: string;
  is_open: boolean;
}

// Utility function to check if restaurant is open
export function isRestaurantOpen(hours: BusinessHours): boolean {
  if (!hours.is_open) return false;

  const now = new Date();
  const sriLankaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Colombo" }));
  const currentTime = sriLankaTime.getHours() * 100 + sriLankaTime.getMinutes();

  const openTime = parseInt(hours.open_time.replace(':', ''));
  const closeTime = parseInt(hours.close_time.replace(':', ''));

  return currentTime >= openTime && currentTime <= closeTime;
}

export interface User {
  id: string;
  email?: string;
  phone?: string;
  first_name?: string;
  role: 'customer' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  menu_items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
  is_available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  variants?: MenuVariant[];
  addons?: MenuAddon[];
}

export interface MenuVariant {
  id: string;
  menu_item_id: string;
  name: string;
  price_modifier: number;
  is_available: boolean;
  sort_order: number;
}

export interface MenuAddon {
  id: string;
  menu_item_id: string;
  name: string;
  price: number;
  is_available: boolean;
  sort_order: number;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'received' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'completed' | 'cancelled';
  order_type: 'pickup' | 'delivery';
  total_amount: number;
  delivery_fee?: number;
  delivery_address?: string;
  delivery_phone?: string;
  delivery_notes?: string;
  estimated_delivery_time?: string;
  payment_method: 'cash' | 'card' | 'payhere';
  payment_status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  user?: User;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  variant_id?: string;
  addon_ids: string[];
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  menu_item?: MenuItem;
  variant?: MenuVariant;
  addons?: MenuAddon[];
}

export interface CreateOrderRequest {
  items: {
    menu_item_id: string;
    variant_id?: string;
    addon_ids: string[];
    quantity: number;
    notes?: string;
  }[];
  order_type: 'pickup' | 'delivery';
  delivery_address?: string;
  delivery_phone?: string;
  delivery_notes?: string;
  payment_method: 'cash' | 'card' | 'payhere';
}

export function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `ORD-${timestamp}-${randomStr}`.toUpperCase();
}

export interface BusinessSettings {
  restaurant_name: string;
  phone: string;
  address: string;
  business_hours: BusinessHours[];
  is_accepting_orders: boolean;
  estimated_prep_time: number;
  minimum_order_amount: number;
}

export interface DeliveryCalculation {
  fee: number;
  estimated_time: number;
  distance?: number;
}

export interface PaymentRequest {
  order_id: string;
  amount: number;
  currency: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
}

export interface PaymentResponse {
  payment_id: string;
  status: 'pending' | 'completed' | 'failed';
  gateway_response?: any;
}

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
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 9) {
    return `0${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  }
  
  return phone;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return /^0[0-9]{9}$/.test(cleaned) || /^[0-9]{9}$/.test(cleaned);
};

// Validation Utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

// Date Utilities
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60000);
};
