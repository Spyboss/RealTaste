import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Session } from '@supabase/supabase-js';
import { supabase, signIn as supabaseSignIn, signUp as supabaseSignUp, signOut, resetPassword, updatePassword, fetchUserRole } from '@/services/supabase';
import { authRateLimiter, signupRateLimiter, getRateLimitKey, formatRemainingTime } from '@/utils/rateLimiter';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  setupAuthResetListener: () => () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  reset: () => void;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
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
              
              if (timeUntilExpire <= 0) {
                console.warn('Token has expired!');
                await supabase.auth.signOut();
                set({ user: null, session: null, isAuthenticated: false, error: 'Token expired. Please log in again.', loading: false });
                return;
              }
            } catch (e) {
              console.error('Failed to decode token for diagnostics:', e);
            }
            
            const role = await fetchUserRole(session.user.id);
            let { data: { user: refreshedUser }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;

            if (refreshedUser) {
              if (!refreshedUser.app_metadata) {
                refreshedUser.app_metadata = {};
              }
              refreshedUser.app_metadata.role = role; 
              console.log('[AuthStore:Initialize] User role set in store:', role, 'User object:', refreshedUser);
            }

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

      // Listen for auth reset events from API interceptor
      setupAuthResetListener: () => {
        const handleAuthReset = () => {
          console.log('Auth reset event received, clearing auth state');
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            error: 'Session expired. Please log in again.',
            loading: false
          });
        };
        
        window.addEventListener('auth-reset', handleAuthReset);
        
        // Setup Supabase auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            
            if (event === 'SIGNED_IN' && session?.user) {
              try {
                const role = await fetchUserRole(session.user.id);
                let { data: { user: refreshedUser }, error: userError } = await supabase.auth.getUser();
                if (userError) throw userError;

                if (refreshedUser) {
                  if (!refreshedUser.app_metadata) {
                    refreshedUser.app_metadata = {};
                  }
                  refreshedUser.app_metadata.role = role;
                }

                set({
                  user: refreshedUser,
                  session,
                  isAuthenticated: true,
                  error: null,
                  loading: false
                });
              } catch (error: any) {
                console.error('Error handling auth state change:', error);
                set({ error: error.message, loading: false });
              }
            } else if (event === 'SIGNED_OUT') {
              set({
                user: null,
                session: null,
                isAuthenticated: false,
                error: null,
                loading: false
              });
            }
          }
        );
        
        // Return cleanup function
        return () => {
          window.removeEventListener('auth-reset', handleAuthReset);
          subscription.unsubscribe();
        };
      },

      login: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          
          // Check rate limit
          const rateLimitKey = getRateLimitKey('login', email);
          if (!authRateLimiter.isAllowed(rateLimitKey)) {
            const remainingTime = authRateLimiter.getRemainingTime(rateLimitKey);
            throw new Error(`Too many login attempts. Please wait ${formatRemainingTime(remainingTime)} before trying again.`);
          }
          
          const { data, error } = await supabaseSignIn(email, password);
          
          if (error) {
            // Handle specific error types
            if (error.message.includes('rate_limit') || error.status === 429) {
              throw new Error('Too many login attempts. Please wait a few minutes before trying again.');
            }
            if (error.message.includes('Invalid login credentials') || error.status === 400) {
              throw new Error('Invalid email or password. Please check your credentials and try again.');
            }
            if (error.message.includes('Email not confirmed')) {
              throw new Error('Please check your email and confirm your account before logging in.');
            }
            throw error;
          }
          
          if (data.user && data.session) {
            const role = await fetchUserRole(data.user.id);
            
            // Create user object with role in app_metadata
            const userWithRole = {
              ...data.user,
              app_metadata: {
                ...data.user.app_metadata,
                role: role
              }
            };
            
            console.log('[AuthStore:Login] User role set in store:', role, 'User object:', userWithRole);

            set({
              user: userWithRole,
              session: data.session,
              isAuthenticated: true,
              error: null,
              loading: false
            });
          } else {
            throw new Error("Login did not return a user and session.");
          }
        } catch (error: any) {
          set({ error: error.message, user: null, session: null, isAuthenticated: false, loading: false });
        }
      },

      register: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          
          // Check rate limit for signup
          const rateLimitKey = getRateLimitKey('signup', email);
          if (!signupRateLimiter.isAllowed(rateLimitKey)) {
            const remainingTime = signupRateLimiter.getRemainingTime(rateLimitKey);
            throw new Error(`Too many signup attempts. Please wait ${formatRemainingTime(remainingTime)} before trying again.`);
          }
          
          const { data, error } = await supabaseSignUp(email, password);
          
          if (error) {
            // Handle specific error types
            if (error.message.includes('rate_limit') || error.status === 429) {
              throw new Error('Too many signup attempts. Please wait a few minutes before trying again.');
            }
            if (error.message.includes('User already registered')) {
              throw new Error('An account with this email already exists. Please try logging in instead.');
            }
            if (error.message.includes('Invalid email')) {
              throw new Error('Please enter a valid email address.');
            }
            if (error.message.includes('Password')) {
              throw new Error('Password must be at least 6 characters long.');
            }
            throw error;
          }
          
          if (data.user && data.session) {
            const role = await fetchUserRole(data.user.id);
            
            // Create user object with role in app_metadata
            const userWithRole = {
              ...data.user,
              app_metadata: {
                ...data.user.app_metadata,
                role: role
              }
            };
            
            console.log('[AuthStore:Register] User role set in store:', role, 'User object:', userWithRole);
            
            set({
              user: userWithRole,
              session: data.session,
              isAuthenticated: true,
              error: null,
              loading: false
            });
          } else {
            if (data.user) {
              // Handle case where sign up might not immediately return a session (e.g. email confirmation)
              const role = await fetchUserRole(data.user.id);
              const userWithRole = {
                ...data.user,
                app_metadata: {
                  ...data.user.app_metadata,
                  role: role
                }
              };
              console.log('[AuthStore:Register] User role set in store (no session):', role, 'User object:', userWithRole);
              set({ user: userWithRole, session: null, isAuthenticated: false, loading: false });
            } else {
              throw new Error("Registration did not return a user.");
            }
          }
        } catch (error: any) {
          set({ error: error.message, user: null, session: null, isAuthenticated: false, loading: false });
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
            const role = await fetchUserRole(data.user.id);
            let { data: { user: refreshedUser }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;

            if (refreshedUser) {
              if (!refreshedUser.app_metadata) {
                refreshedUser.app_metadata = {};
              }
              refreshedUser.app_metadata.role = role;
              console.log('[AuthStore:SignIn] User role set in store:', role, 'User object:', refreshedUser);
            }

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
            const role = await fetchUserRole(data.user.id);
            let { data: { user: refreshedUser }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;

            if (refreshedUser) {
              if (!refreshedUser.app_metadata) {
                refreshedUser.app_metadata = {};
              }
              refreshedUser.app_metadata.role = role;
              console.log('[AuthStore:SignUp] User role set in store:', role, 'User object:', refreshedUser);
            }

            set({
              user: refreshedUser,
              session: data.session,
              isAuthenticated: true,
              error: null
            });
          } else {
             if (data.user) {
              // Handle case where sign up might not immediately return a session (e.g. email confirmation)
              const role = await fetchUserRole(data.user.id);
              let userToSet = { ...data.user };
              if (!userToSet.app_metadata) userToSet.app_metadata = {};
              (userToSet.app_metadata as any).role = role;
              console.log('[AuthStore:SignUp] User role set in store (no session):', role, 'User object:', userToSet);
              set({ user: userToSet, session: null, isAuthenticated: false });
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
