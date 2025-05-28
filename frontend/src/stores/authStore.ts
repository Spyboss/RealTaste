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
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
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
          
          if (session?.user) {
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
          set({ error: error.message, user: null, session: null, isAuthenticated: false });
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
