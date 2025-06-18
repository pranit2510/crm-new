import { supabase } from './supabase';
import type { AuthChangeEvent, Session, Subscription } from '@supabase/supabase-js';

export type AuthUser = {
  id: string;
  email: string;
  role?: string;
};

export const authService = {
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // First check if we have a session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        return null;
      }

      if (!session?.user) {
        return null;
      }

      // Fetch user profile with role
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        // Return basic user info even if profile fetch fails
        return {
          id: session.user.id,
          email: session.user.email!,
          role: undefined
        };
      }

      return {
        id: session.user.id,
        email: session.user.email!,
        role: profile?.role
      };
    } catch (error) {
      console.error('getCurrentUser error:', error);
      return null;
    }
  },

  async login({ email, password }: { email: string; password: string }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { user: null, error };
      }

      if (!data.user) {
        return { user: null, error: new Error('No user returned') };
      }

      // Fetch user role
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        role: profile?.role
      };

      // Store role in localStorage for quick access
      if (profile?.role) {
        localStorage.setItem('user_role', profile.role.toLowerCase());
      }

      return { user, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  },

  async logout() {
    // Clear all auth-related data
    if (typeof window !== 'undefined') {
      // Clear Supabase-related items
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear user role
      localStorage.removeItem('user_role');
      
      // Clear any session storage
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void): {
    data: { subscription: Subscription };
    error: null;
  } | {
    data: null;
    error: Error;
  } {
    try {
      const { data } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state change event:', event);
        
        if (event === 'SIGNED_OUT' || !session) {
          callback(null);
          return;
        }

        if (session?.user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          callback({
            id: session.user.id,
            email: session.user.email!,
            role: profile?.role
          });
        }
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Helper to refresh the session
  async refreshSession() {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Session refresh error:', error);
      return null;
    }
    return session;
  }
};