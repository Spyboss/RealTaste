import { createClient, RealtimeChannel, RealtimeChannelOptions, Session, User } from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';

interface Env {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_API_URL?: string;
}

declare global {
  interface ImportMeta {
    env: Env;
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

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

// Add global error handling for realtime connection
const handleRealtimeError = (err: Error) => {
  console.error('Supabase Realtime error:', err);
  // Attempt to reconnect
  setTimeout(() => {
    console.log('Attempting to reconnect to Supabase Realtime...');
    // Force reconnection by unsubscribing and resubscribing to channels
    supabase.realtime.channels.forEach((channel: RealtimeChannel) => {
      if (channel) {
        channel.unsubscribe();
        channel.subscribe();
      }
    });
  }, 5000); // Try to reconnect every 5 seconds
};

// Add error handler to each channel
const wrapChannelSubscribe = (originalSubscribe: (topic: string, params?: RealtimeChannelOptions) => RealtimeChannel) => {
  return (topic: string, params?: RealtimeChannelOptions) => {
    const channel = originalSubscribe(topic, params);

    // Add error handler to this channel
    channel.on('error', handleRealtimeError);

    return channel;
  };
};

// Override the channel creation method to add error handling
const originalChannel = supabase.realtime.channel;
supabase.realtime.channel = {
  ...supabase.realtime.channel,
  subscribe: wrapChannelSubscribe(originalChannel.subscribe)
};

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
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
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

// Fetch user role from the users table
export const fetchUserRole = async (userId: string): Promise<string | undefined> => {
  // First try to get role from app_metadata
  const { data: { user } } = await supabase.auth.getUser();
  const roleFromMeta = user?.app_metadata?.role;

  if (roleFromMeta) {
    return roleFromMeta;
  }

  // If not in app_metadata, get from users table and update app_metadata
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error) throw error;

  if (data?.role) {
    // Update app_metadata with the role
    const { error: updateError } = await supabase.auth.updateUser({
      data: { role: data.role }
    });

    if (updateError) throw updateError;
  }

  return data?.role;
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
export const subscribeToOrderUpdates = (orderId: string, callback: (payload: any) => void): RealtimeChannel => {
  return supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`
      },
      callback
    )
    .subscribe();
};

export const subscribeToOrderQueue = (callback: (payload: any) => void): RealtimeChannel => {
  return supabase
    .channel('order-queue')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: 'status=in.(received,preparing)'
      },
      callback
    )
    .subscribe();
};
