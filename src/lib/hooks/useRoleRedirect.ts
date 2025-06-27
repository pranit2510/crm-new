// lib/hooks/useRoleRedirect.ts
'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function useRoleRedirect(allowedRoles: string[]) {
  const router = useRouter();
  const { user, loading, initialized } = useAuth();

  useEffect(() => {
    // Don't do anything while auth is still loading
    if (loading || !initialized) {
      return;
    }

    // If no user is authenticated, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    // If user doesn't have a role or role is not allowed, redirect to unauthorized
    if (!user.role || !allowedRoles.includes(user.role.toLowerCase())) {
      router.push('/unauthorized');
      return;
    }
  }, [user, loading, initialized, router, allowedRoles]);
}
