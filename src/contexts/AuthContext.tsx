'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '@/lib/auth';
import type { AuthUser } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearAuthData: () => Promise<void>;
  refreshAuth: () => Promise<void>;
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
  const [error, setError] = useState<string | null>(null);

  const clearAuthData = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      setError(null);
      console.log('Auth data cleared successfully');
    } catch (error) {
      console.error('Error clearing auth data:', error);
      // Force clear even if logout fails
      authService.clearAllAuthData();
      setUser(null);
      setError(null);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to refresh the session first
      await authService.refreshSession();
      
      // Then get the current user
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      
      console.log('Auth refreshed successfully:', currentUser);
    } catch (error) {
      console.error('Error refreshing auth:', error);
      setError('Failed to refresh authentication');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      try {
        console.log('AuthContext: Starting initialization...');
        setError(null);
        
        // Set a reasonable timeout for auth initialization
        initTimeout = setTimeout(() => {
          if (mounted && !initialized) {
            console.warn('Auth initialization timeout - assuming logged out');
            setUser(null);
            setLoading(false);
            setInitialized(true);
            setError('Authentication timeout');
          }
        }, 3000); // 3 second timeout

        // Get current user
        const currentUser = await authService.getCurrentUser();
        
        if (!mounted) return;
        
        clearTimeout(initTimeout);
        
        console.log('AuthContext: Initial user:', currentUser);
        setUser(currentUser);
        setLoading(false);
        setInitialized(true);
        
        // Set up auth state listener
        const authSubscription = authService.onAuthStateChange((user) => {
          if (mounted) {
            console.log('AuthContext: Auth state changed:', user);
            setUser(user);
            setError(null);
          }
        });
        
        // Extract the unsubscribe function
        unsubscribe = authSubscription.data?.subscription?.unsubscribe;
        
      } catch (error) {
        console.error('Auth initialization error:', error);
        
        if (!mounted) return;
        
        clearTimeout(initTimeout);
        
        // Clear potentially corrupted auth data
        try {
          console.log('Clearing corrupted auth data...');
          authService.clearAllAuthData();
        } catch (clearError) {
          console.error('Failed to clear auth data:', clearError);
        }
        
        setUser(null);
        setLoading(false);
        setInitialized(true);
        setError('Authentication initialization failed - cleared corrupted data');
      }
    };

    initAuth();

    return () => {
      mounted = false;
      if (initTimeout) clearTimeout(initTimeout);
      if (unsubscribe) unsubscribe();
    };
  }, []); // Remove clearAuthData from dependencies

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const { user, error } = await authService.login({ email, password });
      
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      if (user) {
        setUser(user);
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Force clear user even if logout fails
      setUser(null);
      setError('Logout failed, but session cleared');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    initialized,
    error,
    login,
    logout,
    clearAuthData,
    refreshAuth,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;