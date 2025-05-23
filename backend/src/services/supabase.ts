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
