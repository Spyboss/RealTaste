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

export function isRestaurantOpen(hours: BusinessHours): boolean {
  if (!hours.is_open) return false;

  const now = new Date();
  const sriLankaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Colombo" }));
  const currentTime = sriLankaTime.getHours() * 100 + sriLankaTime.getMinutes();

  const openTime = parseInt(hours.open_time.replace(':', ''));
  const closeTime = parseInt(hours.close_time.replace(':', ''));

  return currentTime >= openTime && currentTime <= closeTime;
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
  base_price: number;
  category_id: string;
  image_url?: string;
  is_available: boolean;
  prep_time: number;
  is_vegetarian: boolean;
  is_spicy: boolean;
  allergens: string[];
  created_at: string;
  updated_at: string;
  variants?: MenuVariant[];
  addons?: MenuAddon[];
  menu_variants?: MenuVariant[];
  menu_addons?: MenuAddon[];
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  menu_items?: MenuItem[];
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_id?: string;
  status: 'received' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'completed' | 'cancelled';
  priority?: 'urgent' | 'normal' | 'low';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: 'payhere' | 'cash';
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  special_instructions?: string;
  notes?: string;
  estimated_ready_time?: string;
  estimated_pickup_time?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  items?: OrderItem[];
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
  notes?: string;
  created_at: string;
  menu_item?: MenuItem;
  variant?: MenuVariant;
  order_item_addons?: OrderItemAddon[];
}

export interface MenuVariant {
  id: string;
  menu_item_id: string;
  name: string;
  price_modifier: number;
  is_available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MenuAddon {
  id: string;
  name: string;
  price: number;
  category: string;
  is_available: boolean;
  sort_order: number;
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
  addon?: MenuAddon;
}

export interface CreateOrderRequest {
  customer_name?: string;
  customer_phone: string;
  payment_method: 'card' | 'cash';
  order_type: 'pickup' | 'delivery';
  delivery_address?: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  delivery_notes?: string;
  customer_gps_location?: string;
  notes?: string;
  items: {
    menu_item_id: string;
    variant_id?: string;
    quantity: number;
    addon_ids?: string[];
    notes?: string;
  }[];
}

export interface UpdateOrderStatusRequest {
  status: 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  estimated_pickup_time?: string;
}

export interface CartItem {
  id: string;
  menu_item_id: string;
  menu_item?: MenuItem;
  name: string;
  price: number;
  quantity: number;
  variant?: MenuVariant;
  addons: MenuAddon[];
  notes?: string;
  total: number;
}

export function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `RT-${timestamp}-${random}`.toUpperCase();
}

export function formatCurrency(amount: number): string {
  return `Rs. ${amount.toFixed(2)}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Admin Dashboard Types
export interface DailyAnalytics {
  date: string;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  completed_orders: number;
}

export interface TopItem {
  name: string;
  quantity: number;
  revenue: number;
}

export interface TrendData {
  date: string;
  orders: number;
  revenue: number;
}

export interface DashboardStats {
  timeframe: string;
  stats: {
    total_orders: number;
    completed_orders: number;
    total_revenue: number;
    avg_order_value: number;
    avg_prep_time: number;
    popular_items: {
      name: string;
      count: number;
      revenue: number;
    }[];
  };
  chart_data: {
    label: string;
    orders: number;
    revenue: number;
  }[];
  pending_orders: Order[];
  queue_length: number;
}

export interface AnalyticsData {
  timeframe: string;
  stats: DailyStats[];
}
