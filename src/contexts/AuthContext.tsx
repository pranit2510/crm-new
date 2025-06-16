'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/lib/auth';
import type { AuthUser } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearAuthData: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    let authTimeout: NodeJS.Timeout;

    // Check for existing session
    const initAuth = async () => {
      try {
        console.log('AuthContext: Initializing auth...');
        const currentUser = await authService.getCurrentUser();
        console.log('AuthContext: Current user:', currentUser);
        
        if (mounted) {
          setUser(currentUser);
          setLoading(false);
          setInitialized(true);
          console.log('AuthContext: Initialization complete');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        
        // If auth initialization fails, it might be due to stale data
        // Clear it automatically to prevent loops
        if (error && typeof window !== 'undefined') {
          console.log('AuthContext: Clearing potentially stale auth data...');
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-')) {
              localStorage.removeItem(key);
            }
          });
          localStorage.removeItem('user_role');
        }
        
        if (mounted) {
          setUser(null);
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Set a timeout to detect stale auth data
    authTimeout = setTimeout(() => {
      if (mounted && !initialized) {
        console.log('AuthContext: Auth initialization timeout - clearing stale data');
        if (typeof window !== 'undefined') {
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-')) {
              localStorage.removeItem(key);
            }
          });
          localStorage.removeItem('user_role');
        }
        setUser(null);
        setLoading(false);
        setInitialized(true);
      }
    }, 5000); // 5 second timeout

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      console.log('AuthContext: Auth state changed:', user);
      if (mounted) {
        clearTimeout(authTimeout);
        setUser(user);
        setLoading(false);
        setInitialized(true);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(authTimeout);
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user, error } = await authService.login({ email, password });
      
      if (error) {
        return { success: false, error: error.message };
      }

      if (user) {
        setUser(user);
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const clearAuthData = async () => {
    try {
      // Clear Supabase session
      await authService.logout();
      
      // Clear local storage
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-')) {
            localStorage.removeItem(key);
          }
        });
        
        // Clear any user role data
        localStorage.removeItem('user_role');
      }
      
      setUser(null);
      setLoading(false);
      setInitialized(true);
      
      console.log('Auth data cleared successfully');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    initialized,
    login,
    logout,
    clearAuthData,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 