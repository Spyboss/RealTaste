import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

// Client for authenticated requests (uses service role key)
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Client for public requests (uses anon key)
export const supabaseClient = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

// Database Tables
export const tables = {
  users: 'users',
  categories: 'categories',
  menu_items: 'menu_items',
  menu_variants: 'menu_variants',
  menu_addons: 'menu_addons',
  orders: 'orders',
  order_items: 'order_items',
  order_item_addons: 'order_item_addons',
} as const;

// Helper function to get user from JWT token
export const getUserFromToken = async (token: string) => {
  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
};

// Helper function to verify admin role
export const verifyAdminRole = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabaseAdmin
      .from(tables.users)
      .select('role')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data?.role === 'admin';
  } catch (error) {
    console.error('Error verifying admin role:', error);
    return false;
  }
};

// Realtime functionality for order status updates
export const setupOrderStatusRealtime = (channelName: string, callback: (payload: any) => void) => {
  const channel = supabaseAdmin.channel(channelName);

  channel
    .on('postgres_changes', { event: '*', schema: 'public', table: tables.orders }, payload => {
      callback(payload);
    })
    .subscribe(err => {
      if (err) {
        console.error('Error subscribing to order status updates:', err);
      } else {
        console.log(`Subscribed to order status updates on channel ${channelName}`);
      }
    });
};

// Function to trigger order status updates
export const triggerOrderStatusUpdate = async (orderId: string) => {
  try {
    // This will trigger the realtime update by updating the order's updated_at timestamp
    const { error } = await supabaseAdmin
      .from(tables.orders)
      .update({ updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      console.error('Error triggering order status update:', error);
      throw error;
    }

    console.log(`Order status update triggered for order ${orderId}`);
    return true;
  } catch (error) {
    console.error('Error in triggerOrderStatusUpdate:', error);
    return false;
  }
};
