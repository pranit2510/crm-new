'use client';

import React from 'react';
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
  const { user, loading } = useAuth();
  const router = useRouter();
  // Check if we're on a public page
  const isPublicPage = pathname === '/login' || pathname === '/register';

  if (loading) {
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

  // If we're not on a public page and there's no user, redirect to login
  if (!user && !loading) {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-visible p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 