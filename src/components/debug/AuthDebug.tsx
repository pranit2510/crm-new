'use client';

import { useAuth } from '@/contexts/AuthContext';

export function AuthDebug() {
  const { user, loading, initialized, clearAuthData } = useAuth();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-red-100 border border-red-300 rounded-lg p-4 text-sm max-w-sm z-50">
      <h3 className="font-bold text-red-800 mb-2">Auth Debug</h3>
      <div className="space-y-1 text-red-700">
        <div>User: {user ? user.email : 'null'}</div>
        <div>Loading: {loading.toString()}</div>
        <div>Initialized: {initialized.toString()}</div>
        <div>Authenticated: {(!!user).toString()}</div>
      </div>
      <button
        onClick={clearAuthData}
        className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
      >
        Clear Auth Data
      </button>
    </div>
  );
} 