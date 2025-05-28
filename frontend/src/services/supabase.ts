import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL!;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Fetch user role from the users table
export const fetchUserRole = async (userId: string) => {
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

// Auth helpers
export const signUp = async (email: string, password: string, firstName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
      }
    }
  });

  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Fetch user role if sign in successful
  if (data.user) {
    const role = await fetchUserRole(data.user.id);
    // Store role in app_metadata
    if (role) {
      await supabase.auth.updateUser({
        data: { role }
      });
    }
  }

  return data;
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
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

export const getSession = async () => {
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
export const subscribeToOrderUpdates = (orderId: string, callback: (payload: any) => void) => {
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

export const subscribeToOrderQueue = (callback: (payload: any) => void) => {
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
