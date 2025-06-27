'use client'

import { authService } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function ClearAuthPage() {
  const router = useRouter()

  const handleClearAuth = async () => {
    try {
      console.log('Starting auth clear...')
      
      // Debug current state
      authService.debugAuthState()
      
      // Clear all auth data
      authService.clearAllAuthData()
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Auth cleared, redirecting to login...')
      
      // Force redirect to login
      window.location.href = '/login'
      
    } catch (error) {
      console.error('Error clearing auth:', error)
      alert('Error clearing auth data. Check console for details.')
    }
  }

  const handleDebugAuth = () => {
    authService.debugAuthState()
    alert('Check browser console for auth debug info')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Auth Debug Tools</h1>
        
        <div className="space-y-4">
          <button
            onClick={handleClearAuth}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            🗑️ Clear All Auth Data
          </button>
          
          <button
            onClick={handleDebugAuth}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            🔍 Debug Auth State
          </button>
          
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            🔑 Go to Login
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-bold text-yellow-800">Instructions:</h3>
          <ol className="mt-2 text-sm text-yellow-700 list-decimal list-inside">
            <li>Click "Debug Auth State" to see what's stored</li>
            <li>Click "Clear All Auth Data" to remove everything</li>
            <li>Try logging in normally</li>
            <li>Delete this page when done: <code>/clear-auth</code></li>
          </ol>
        </div>
      </div>
    </div>
  )
} 