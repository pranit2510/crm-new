import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
    )
    const { data: { session } } = await supabase.auth.getSession()
    // Protect dashboard routes
    if (request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname === '/') {
    if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
    }
    }
    // Redirect to dashboard if logged in and trying to access login
    if (request.nextUrl.pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/', request.url))
    }
    return response
    }
    export const config = {
matcher: ['/((?!api|_next/static|_next/image|favicon.ico|debug-env|clear-auth).*)'],
}