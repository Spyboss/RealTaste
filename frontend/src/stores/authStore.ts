import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Session } from '@supabase/supabase-js';
import { supabase, signIn as supabaseSignIn, signUp as supabaseSignUp, signOut, resetPassword, updatePassword, fetchUserRole } from '@/services/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOutAction: () => Promise<void>;
  resetPasswordAction: (email: string) => Promise<void>;
  updatePasswordAction: (newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set: (state: Partial<AuthState>) => void) => ({
      user: null,
      session: null,
      loading: true,
      isAuthenticated: false,
      error: null,

      initialize: async () => {
        try {
          set({ loading: true });
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            // If the error is due to an invalid JWT, sign out the user
            if (error.message.includes('bad_jwt') || error.message.includes('invalid JWT')) {
              await supabase.auth.signOut();
              set({ user: null, session: null, isAuthenticated: false, error: 'Invalid session. Please log in again.', loading: false });
              return;
            }
            throw error;
          }
          
          if (session?.user) {
            // Diagnostic logging for token expiration
            try {
              const token = session.access_token;
              const payload = JSON.parse(atob(token.split('.')[1]));
              const expiration = new Date(payload.exp * 1000);
              const timeUntilExpire = (expiration.getTime() - Date.now()) / 1000;
              console.log(`Token expiration: ${expiration}, Current time: ${new Date()}`);
              console.log(`Token will expire in: ${timeUntilExpire} seconds`);
              
              // Log token expiration status
              if (timeUntilExpire <= 0) {
                console.warn('Token has expired!');
                // Reset auth state if token expired
                await supabase.auth.signOut(); // Ensure logout on expired token
                set({ user: null, session: null, isAuthenticated: false, error: 'Token expired. Please log in again.', loading: false });
                return;
              }
            } catch (e) {
              console.error('Failed to decode token for diagnostics:', e);
            }
            
            await fetchUserRole(session.user.id);
            const { data: { user: refreshedUser } } = await supabase.auth.getUser();
            set({
              user: refreshedUser,
              session,
              isAuthenticated: true,
              error: null
            });
          } else {
            set({ user: null, session: null, isAuthenticated: false });
          }
        } catch (error: any) {
          // Also handle potential "bad_jwt" or "invalid JWT" errors caught here
          if (error.message.includes('bad_jwt') || error.message.includes('invalid JWT')) {
            await supabase.auth.signOut();
            set({ error: 'Invalid session. Please log in again.', user: null, session: null, isAuthenticated: false, loading: false });
          } else {
            set({ error: error.message, user: null, session: null, isAuthenticated: false, loading: false });
          }
        } finally {
          set({ loading: false });
        }
      },

      login: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          const { data, error } = await supabaseSignIn(email, password);
          if (error) throw error;
          if (data.user && data.session) {
            await fetchUserRole(data.user.id);
            const { data: { user: refreshedUser } } = await supabase.auth.getUser();
            set({
              user: refreshedUser,
              session: data.session,
              isAuthenticated: true,
              error: null
            });
            console.log('Login successful. User role:', refreshedUser?.app_metadata?.role);
          } else {
            throw new Error("Login did not return a user and session.");
          }
        } catch (error: any) {
          set({ error: error.message, user: null, session: null, isAuthenticated: false });
        } finally {
          set({ loading: false });
        }
      },

      register: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          const { data, error } = await supabaseSignUp(email, password);
          if (error) throw error;
          if (data.user && data.session) {
            await fetchUserRole(data.user.id);
            const { data: { user: refreshedUser } } = await supabase.auth.getUser();
            set({
              user: refreshedUser,
              session: data.session,
              isAuthenticated: true,
              error: null
            });
          } else {
            if (data.user) {
              set({ user: data.user, session: null, isAuthenticated: false });
            } else {
              throw new Error("Registration did not return a user.");
            }
          }
        } catch (error: any) {
          set({ error: error.message, user: null, session: null, isAuthenticated: false });
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        try {
          set({ loading: true, error: null });
          const { error } = await signOut();
          if (error) throw error;
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            error: null
          });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ loading: false });
        }
      },

      reset: () => {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          error: null,
          loading: false
        });
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      // Add event listener for token expiration
      // ... existing methods ...

      setSession: (session) => {
        set({ session, isAuthenticated: !!session });
      },

      setLoading: (loading) => {
        set({ loading });
      },

      setError: (error) => {
        set({ error });
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          const { data, error } = await supabaseSignIn(email, password);
          if (error) throw error;
          if (data.user && data.session) {
            await fetchUserRole(data.user.id);
            const { data: { user: refreshedUser } } = await supabase.auth.getUser();
            set({
              user: refreshedUser,
              session: data.session,
              isAuthenticated: true,
              error: null
            });
          } else {
            throw new Error("Login did not return a user and session.");
          }
        } catch (error: any) {
          set({ error: error.message, user: null, session: null, isAuthenticated: false });
        } finally {
          set({ loading: false });
        }
      },

      signUp: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          const { data, error } = await supabaseSignUp(email, password);
          if (error) throw error;
          if (data.user && data.session) {
            await fetchUserRole(data.user.id);
            const { data: { user: refreshedUser } } = await supabase.auth.getUser();
            set({
              user: refreshedUser,
              session: data.session,
              isAuthenticated: true,
              error: null
            });
          } else {
            if (data.user) {
              set({ user: data.user, session: null, isAuthenticated: false });
            } else {
              throw new Error("Registration did not return a user.");
            }
          }
        } catch (error: any) {
          set({ error: error.message, user: null, session: null, isAuthenticated: false });
        } finally {
          set({ loading: false });
        }
      },

      signOutAction: async () => {
        try {
          set({ loading: true, error: null });
          const { error } = await signOut();
          if (error) throw error;
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            error: null
          });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ loading: false });
        }
      },

      resetPasswordAction: async (email: string) => {
        try {
          set({ loading: true, error: null });
          const { data, error } = await resetPassword(email);
          if (error) throw error;
          // Optionally handle success (e.g., set a success message)
          console.log('Password reset email sent:', data);
        } catch (error: any) {
          set({ error: error.message, loading: false });
        } finally {
          set({ loading: false });
        }
      },

      updatePasswordAction: async (newPassword: string) => {
        try {
          set({ loading: true, error: null });
          const { data, error } = await updatePassword(newPassword);
          if (error) throw error;
          // Optionally handle success (e.g., update user state, set a success message)
          console.log('Password updated successfully:', data);
        } catch (error: any) {
          set({ error: error.message, loading: false });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      // getStorage: () => localStorage, // (optional) by default, 'localStorage' is used - Using default
    }
  )
);
