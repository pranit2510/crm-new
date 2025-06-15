// lib/hooks/useRoleRedirect.ts
'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useRoleRedirect(allowedRoles: string[]) {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('user_role');

    if (!role) {
      router.push('/login');
    } else if (!allowedRoles.includes(role)) {
      router.push('/unauthorized'); // or a dashboard page
    }
  }, [router, allowedRoles]);
}
