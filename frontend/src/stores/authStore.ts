import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Session } from '@supabase/supabase-js';
import { supabase, signIn, signUp, signOut, resetPassword, updatePassword } from '@/services/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,
      isAuthenticated: false,
      error: null,

      initialize: async () => {
        try {
          set({ loading: true });
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) throw error;
          
          if (session) {
            set({
              user: session.user,
              session,
              isAuthenticated: true,
              error: null
            });
          }
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ loading: false });
        }
      },

      login: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          const { data, error } = await signIn(email, password);
          if (error) throw error;
          set({
            user: data.user,
            session: data.session,
            isAuthenticated: true,
            error: null
          });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ loading: false });
        }
      },

      register: async (email: string, password: string, firstName?: string) => {
        try {
          set({ loading: true, error: null });
          const { data, error } = await signUp(email, password, firstName);
          if (error) throw error;
          set({
            user: data.user,
            session: data.session,
            isAuthenticated: true,
            error: null
          });
        } catch (error: any) {
          set({ error: error.message });
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

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

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
          const { data, error } = await signIn(email, password);
          if (error) throw error;
          set({
            user: data.user,
            session: data.session,
            isAuthenticated: true,
            error: null
          });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ loading: false });
        }
      },

      signUp: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          const { data, error } = await signUp(email, password);
          if (error) throw error;
          set({
            user: data.user,
            session: data.session,
            isAuthenticated: true,
            error: null
          });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ loading: false });
        }
      },

      signOut: async () => {
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

      resetPassword: async (email: string) => {
        try {
          set({ loading: true, error: null });
          const { error } = await resetPassword(email);
          if (error) throw error;
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ loading: false });
        }
      },

      updatePassword: async (newPassword: string) => {
        try {
          set({ loading: true, error: null });
          const { error } = await updatePassword(newPassword);
          if (error) throw error;
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ loading: false });
        }
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
