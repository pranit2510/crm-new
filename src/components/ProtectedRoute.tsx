'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, loading, initialized, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't do anything until auth is initialized
    if (!initialized) return;

    // If there's an auth error or no user, redirect to login
    if (!user || error) {
      console.log('ProtectedRoute: No user or error, redirecting to login');
      router.push(redirectTo);
      return;
    }

    // Check role-based access if roles are specified
    if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
      console.log('ProtectedRoute: User role not allowed, redirecting');
      router.push('/unauthorized');
    }
  }, [user, loading, initialized, error, allowedRoles, router, redirectTo]);

  // Show loading state while auth is initializing
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an auth error
  if (error && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Authentication error: {error}</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // If no user after initialization, don't render children (redirect will happen via useEffect)
  if (!user) {
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
}