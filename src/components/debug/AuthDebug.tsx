'use client';

import { useAuth } from '@/contexts/AuthContext';

export function AuthDebug() {
  const { user, loading, initialized, clearAuthData } = useAuth();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Check for potential stale data indicators
  const hasStaleData = typeof window !== 'undefined' && 
    Object.keys(localStorage).some(key => key.startsWith('sb-')) && 
    !user && 
    initialized;

  return (
    <div className={`fixed bottom-4 right-4 border rounded-lg p-4 text-sm max-w-sm z-50 ${
      hasStaleData 
        ? 'bg-yellow-100 border-yellow-300' 
        : 'bg-red-100 border-red-300'
    }`}>
      <h3 className={`font-bold mb-2 ${
        hasStaleData ? 'text-yellow-800' : 'text-red-800'
      }`}>
        Auth Debug {hasStaleData && '⚠️'}
      </h3>
      <div className={`space-y-1 ${
        hasStaleData ? 'text-yellow-700' : 'text-red-700'
      }`}>
        <div>User: {user ? user.email : 'null'}</div>
        <div>Loading: {loading.toString()}</div>
        <div>Initialized: {initialized.toString()}</div>
        <div>Authenticated: {(!!user).toString()}</div>
        {hasStaleData && (
          <div className="text-yellow-800 font-semibold">
            ⚠️ Stale data detected!
          </div>
        )}
      </div>
      <button
        onClick={clearAuthData}
        className={`mt-2 px-3 py-1 text-white rounded text-xs hover:opacity-80 ${
          hasStaleData 
            ? 'bg-yellow-600 hover:bg-yellow-700' 
            : 'bg-red-500 hover:bg-red-600'
        }`}
      >
        Clear Auth Data
      </button>
    </div>
  );
} 