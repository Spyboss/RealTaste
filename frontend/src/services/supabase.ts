import { createClient, RealtimeChannel, Session, User, SupabaseClient } from '@supabase/supabase-js';

interface Env {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_RESTAURANT_LAT: string;
  readonly VITE_RESTAURANT_LNG: string;
  readonly VITE_RESTAURANT_NAME: string;
  readonly VITE_RESTAURANT_ADDRESS: string;
  readonly VITE_DELIVERY_RADIUS: string;
}

declare global {
  interface ImportMeta {
    env: Env;
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'present' : 'missing',
    key: supabaseAnonKey ? 'present' : 'missing'
  });
  throw new Error('Missing required Supabase environment variables');
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key present:', !!supabaseAnonKey);

// Clear any corrupted session data
if (typeof window !== 'undefined') {
  // Clear localStorage items that might be corrupted
  const storageKeys = Object.keys(localStorage);
  storageKeys.forEach(key => {
    if (key.includes('supabase') && key.includes('auth-token')) {
      console.log('Clearing potentially corrupted auth token:', key);
      localStorage.removeItem(key);
    }
  });
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
      vsn: '1.0.0'
    }
  }
});

// Fetch user role from app_metadata
export const getUserRole = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.app_metadata?.role || 'customer';
};

// Check if user is admin
export const isAdmin = async () => {
  const role = await getUserRole();
  return role === 'admin';
};

// Auth helpers
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  return { data, error };
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'customer' // Default role
      }
    }
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  console.log('Attempting sign in with:', { email, supabaseUrl, hasKey: !!supabaseAnonKey });
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  console.log('Sign in result:', { data: !!data, error });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  return { data, error };
};

export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });
  return { data, error };
};

// Fetch user role from the users table with better error handling
export const fetchUserRole = async (userId: string): Promise<string> => {
  try {
    // First try to get role from app_metadata
    const { data: { user } } = await supabase.auth.getUser();
    const roleFromMeta = user?.app_metadata?.role;

    if (roleFromMeta) {
      return roleFromMeta;
    }

    // If not in app_metadata, get from users table
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('Failed to fetch user role from database:', error.message);
      // Return default role if database query fails
      return 'customer';
    }

    const role = data?.role || 'customer';

    // Try to update app_metadata with the role (non-blocking)
    try {
      await supabase.auth.updateUser({
        data: { role }
      });
    } catch (updateError) {
      console.warn('Failed to update user metadata:', updateError);
      // Don't throw here, just log the warning
    }

    return role;
  } catch (error) {
    console.error('Error in fetchUserRole:', error);
    return 'customer'; // Default fallback
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;

  // Fetch and attach role if user exists
  if (user) {
    const role = await fetchUserRole(user.id);
    if (role) {
      await supabase.auth.updateUser({
        data: { role }
      });
    }
  }

  return user;
};

export const getSession = async (): Promise<Session | null> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;

  // Fetch and attach role if session exists
  if (session?.user) {
    const role = await fetchUserRole(session.user.id);
    if (role) {
      await supabase.auth.updateUser({
        data: { role }
      });
    }
  }

  return session;
};

// Realtime helpers
export const subscribeToOrderUpdates = (orderId: string, onChange: (payload: any) => void, onStatus?: (status: string) => void): RealtimeChannel => {
  const channel = supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`
      },
      onChange
    );
  channel.subscribe(onStatus);
  return channel;
};

export const subscribeToOrderQueue = (onChange: (payload: any) => void, onStatus?: (status: string) => void): RealtimeChannel => {
  const channel = supabase
    .channel('order-queue')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: 'status=in.(received,preparing)'
      },
      onChange
    )
    .subscribe((status) => {
      if (onStatus) {
        onStatus(status);
      } else {
        console.log('Realtime: SUBSCRIBED to order-queue');
      }
    });

  return channel;
};
