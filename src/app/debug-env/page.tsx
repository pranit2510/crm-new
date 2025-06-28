'use client'

export default function DebugEnvPage() {
  const envVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET ✅' : 'MISSING ❌',
    'NODE_ENV': process.env.NODE_ENV,
    'VERCEL_URL': process.env.VERCEL_URL || 'Not Vercel',
    'RENDER_EXTERNAL_URL': process.env.RENDER_EXTERNAL_URL || 'Not Render',
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Environment Debug</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-bold text-blue-800">Current Domain:</h3>
            <p className="text-blue-700">{typeof window !== 'undefined' ? window.location.origin : 'Server-side'}</p>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded">
            <h3 className="font-bold text-gray-800">Environment Variables:</h3>
            <div className="mt-2 space-y-2">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="font-mono text-sm">{key}:</span>
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">{value || 'MISSING ❌'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-bold text-yellow-800">Action Required:</h3>
            <ol className="mt-2 text-sm text-yellow-700 list-decimal list-inside space-y-1">
              <li>Copy the "Current Domain" above</li>
              <li>Add it to Supabase Dashboard → Auth → URL Configuration</li>
              <li>Set as both Site URL and Redirect URL</li>
              <li>Check that environment variables are SET ✅</li>
              <li>Delete this debug page when done</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
} 