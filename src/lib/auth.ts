import { supabase } from './supabase'
import type { User, AuthError } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  name?: string
  role?: 'User' | 'Technician'
  avatar_url?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignUpCredentials extends LoginCredentials {
  name: string
  role?: 'User' | 'Technician'
}

class AuthService {
  // Login user
  async login(credentials: LoginCredentials): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return { user: null, error }
      }

      if (data.user) {
        const authUser = await this.getUserProfile(data.user)
        return { user: authUser, error: null }
      }

      return { user: null, error: null }
    } catch (error) {
      return { 
        user: null, 
        error: { 
          message: 'Login failed', 
          name: 'AuthError',
          status: 500 
        } as AuthError 
      }
    }
  }

  // Sign up new user
  async signUp(credentials: SignUpCredentials): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
            role: credentials.role || 'Technician',
          }
        }
      })

      if (error) {
        return { user: null, error }
      }

      if (data.user) {
        // Create user profile
        await this.createUserProfile(data.user, credentials.name, credentials.role)
        const authUser = await this.getUserProfile(data.user)
        return { user: authUser, error: null }
      }

      return { user: null, error: null }
    } catch (error) {
      return { 
        user: null, 
        error: { 
          message: 'Sign up failed', 
          name: 'AuthError',
          status: 500 
        } as AuthError 
      }
    }
  }

  // Logout user
  async logout(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { 
        error: { 
          message: 'Logout failed', 
          name: 'AuthError',
          status: 500 
        } as AuthError 
      }
    }
  }

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) return null;
  
      return await this.getUserProfile(session.user);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
  

  // Get user profile from database
  private async getUserProfile(user: User): Promise<AuthUser> {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      return {
        id: user.id,
        email: user.email || '',
        name: profile?.name || user.user_metadata?.name || '',
        role: profile?.role || user.user_metadata?.role || 'Technician',
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      // Fallback to basic user data
      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || '',
        role: user.user_metadata?.role || 'Technician'
      }
    }
  }

  // Create user profile in database
  private async createUserProfile(user: User, name: string, role?: string) {
    try {
      await supabase
        .from('user_profiles')
        .insert([
          {
            id: user.id,
            name: name,
            role: role || 'Technician',
            email: user.email,
            created_at: new Date().toISOString()
          }
        ])
    } catch (error) {
      console.error('Error creating user profile:', error)
      // Don't throw - profile creation is optional
    }
  }

  // Listen for auth changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const authUser = await this.getUserProfile(session.user)
        callback(authUser)
      } else {
        callback(null)
      }
    })
  }

  // Reset password
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return { error }
    } catch (error) {
      return { 
        error: { 
          message: 'Password reset failed', 
          name: 'AuthError',
          status: 500 
        } as AuthError 
      }
    }
  }

  // Update password
  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      return { error }
    } catch (error) {
      return { 
        error: { 
          message: 'Password update failed', 
          name: 'AuthError',
          status: 500 
        } as AuthError 
      }
    }
  }
}

export const authService = new AuthService()
export default authService 