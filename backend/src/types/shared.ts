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

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url?: string;
  is_available: boolean;
  prep_time: number;
  is_vegetarian: boolean;
  is_spicy: boolean;
  allergens: string[];
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Alias for compatibility
export interface Category extends MenuCategory {}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  status: 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: 'payhere' | 'cash';
  total_amount: number;
  special_instructions?: string;
  estimated_ready_time?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  created_at: string;
}

export interface MenuVariant {
  id: string;
  menu_item_id: string;
  name: string;
  price_modifier: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuAddon {
  id: string;
  name: string;
  price: number;
  category: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItemAddon {
  id: string;
  order_item_id: string;
  addon_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface CreateOrderRequest {
  customer_name?: string;
  customer_phone: string;
  payment_method: 'card' | 'cash';
  notes?: string;
  order_type?: 'pickup' | 'delivery';
  delivery_address?: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  delivery_notes?: string;
  customer_gps_location?: string;
  items: {
    menu_item_id: string;
    variant_id?: string;
    quantity: number;
    addon_ids?: string[];
    notes?: string;
  }[];
}

// Utility function to generate order ID
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `RT-${timestamp}-${random}`.toUpperCase();
}
