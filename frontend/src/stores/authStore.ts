import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';
import { supabase, signIn, signUp, signOut } from '@/services/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      isAuthenticated: false,

      initialize: async () => {
        try {
          set({ loading: true });

          // Get current session
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            set({
              user: session.user,
              isAuthenticated: true,
              loading: false
            });

            // Store token for API requests
            localStorage.setItem('supabase.auth.token', session.access_token);
          } else {
            set({
              user: null,
              isAuthenticated: false,
              loading: false
            });
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              set({
                user: session.user,
                isAuthenticated: true
              });
              localStorage.setItem('supabase.auth.token', session.access_token);
            } else if (event === 'SIGNED_OUT') {
              set({
                user: null,
                isAuthenticated: false
              });
              localStorage.removeItem('supabase.auth.token');
            }
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({
            user: null,
            isAuthenticated: false,
            loading: false
          });
        }
      },

      login: async (email: string, password: string) => {
        try {
          set({ loading: true });
          const { user } = await signIn(email, password);
          set({
            user,
            isAuthenticated: true,
            loading: false
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, firstName?: string) => {
        try {
          set({ loading: true });
          const { user } = await signUp(email, password, firstName);
          set({
            user,
            isAuthenticated: !!user,
            loading: false
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await signOut();
          set({
            user: null,
            isAuthenticated: false,
            loading: false
          });
        } catch (error) {
          console.error('Logout error:', error);
          // Force logout even if API call fails
          set({
            user: null,
            isAuthenticated: false,
            loading: false
          });
        }
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user
        });
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);
