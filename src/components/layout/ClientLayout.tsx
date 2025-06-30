'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const { user, loading, initialized } = useAuth();
  const router = useRouter();
  // Check if we're on a public page
  const isPublicPage = pathname === '/login' || pathname === '/signup' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/reset-password';

  // Handle redirect in useEffect to avoid setState during render
  useEffect(() => {
    // Only redirect if auth is fully initialized and add a small delay to prevent rapid redirects
    if (initialized && !loading && !user && !isPublicPage) {
      console.log('ClientLayout: Redirecting to login', { user, loading, initialized, isPublicPage, pathname });
      const timer = setTimeout(() => {
        router.push('/login');
      }, 100); // Small delay to prevent rapid redirects
      
      return () => clearTimeout(timer);
    }
  }, [user, loading, initialized, isPublicPage, router, pathname]);

  // Show loading only if we don't have any initial data and auth is still loading
  if (!initialized && loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If we're on a public page, just render the children
  if (isPublicPage) {
    return <>{children}</>;
  }

  // If we're not on a public page and there's no user, show loading while redirecting
  // But only if auth is fully initialized to avoid premature redirects
  if (!user && !loading && initialized && !isPublicPage) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100">
      <Header />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto overflow-x-visible p-4 md:p-6">
          {/* Show content immediately, even if auth is still loading */}
          {children}
        </main>
      </div>
    </div>
  );
} 