// Core Entity Types
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
  name: string; // e.g., "Small", "Large"
  price_modifier: number; // +/- from base price
  is_available: boolean;
  sort_order: number;
}

export interface MenuAddon {
  id: string;
  menu_item_id: string;
  name: string; // e.g., "Extra Cheese"
  price: number;
  is_available: boolean;
  sort_order: number;
}

export interface Order {
  id: string;
  customer_id?: string; // null for guest orders
  customer_phone: string;
  customer_name?: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  estimated_pickup_time?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  menu_item?: MenuItem;
  variant?: MenuVariant;
  addons: OrderItemAddon[];
  order_item_addons?: OrderItemAddon[];
}

export interface OrderItemAddon {
  id: string;
  order_item_id: string;
  addon_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  addon?: MenuAddon;
}

// Enums
export type OrderStatus =
  | 'received'
  | 'preparing'
  | 'ready_for_pickup'
  | 'picked_up'
  | 'cancelled';

export type PaymentMethod = 'card' | 'cash';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

// API Request/Response Types
export interface CreateOrderRequest {
  customer_phone: string;
  customer_name?: string;
  payment_method: PaymentMethod;
  order_type: 'pickup' | 'delivery';
  delivery_address?: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  delivery_notes?: string;
  customer_gps_location?: string;
  notes?: string;
  items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  menu_item_id: string;
  variant_id?: string;
  quantity: number;
  notes?: string;
  addon_ids?: string[];
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  estimated_pickup_time?: string;
}

// Cart Types (Frontend)
export interface CartItem {
  menu_item: MenuItem;
  variant?: MenuVariant;
  addons: MenuAddon[];
  quantity: number;
  notes?: string;
}

// Analytics Types
export interface DailyStats {
  date: string;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  popular_items: PopularItem[];
}

export interface PopularItem {
  menu_item_id: string;
  menu_item_name: string;
  quantity_sold: number;
  revenue: number;
}

// Business Hours
export interface BusinessHours {
  open_time: string; // "10:00"
  close_time: string; // "22:00"
  timezone: string; // "Asia/Colombo"
  is_open: boolean;
}

// API Response Wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}
