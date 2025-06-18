import { createBrowserClient } from '@supabase/ssr'
import type { Client, Job, Lead, Quote, Invoice } from './supabase-types'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Add better cookie handling for auth persistence
        get(name: string) {
          if (typeof window === 'undefined') return undefined;
          const cookies = document.cookie.split('; ');
          const cookie = cookies.find(c => c.startsWith(`${name}=`));
          return cookie?.split('=')[1];
        },
        set(name: string, value: string, options?: any) {
          if (typeof window === 'undefined') return;
          let cookieString = `${name}=${value}`;
          if (options?.maxAge) {
            cookieString += `; max-age=${options.maxAge}`;
          }
          if (options?.path) {
            cookieString += `; path=${options.path}`;
          }
          document.cookie = cookieString;
        },
        remove(name: string, options?: any) {
          if (typeof window === 'undefined') return;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${options?.path || '/'}`;
        }
      },
      auth: {
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
        // Add storage key prefix to avoid conflicts
        storageKey: 'voltflow-auth',
      }
    }
  )
}

// Export a singleton instance for use throughout the app
export const supabase = createClient()

// Add a helper to check and refresh session
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    // Try to refresh
    const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
    return refreshedSession;
  }
  
  return session;
}

// Client operations
export const clientOperations = {
  async create(client: Omit<Client, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Error creating client: ${error.message}`);
    }
    return data
  },

  async getAll() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: number, updates: Partial<Client>) {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Job operations
export const jobOperations = {
  async create(job: Omit<Job, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('jobs')
      .insert([job])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getAll() {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, clients(*)')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getByClientId(clientId: number) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async update(id: number, data: Partial<Job>) {
    const { data: updatedJob, error } = await supabase
      .from('jobs')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return updatedJob;
  }
}

// Lead operations
export const leadOperations = {
  async create(lead: Omit<Lead, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getAll() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async update(id: number, updates: Partial<Lead>) {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }
}

// Quote operations
export const quoteOperations = {
  async create(quote: Omit<Quote, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('quotes')
      .insert([quote])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getByClientId(clientId: number) {
    const { data, error } = await supabase
      .from('quotes')
      .select('*, clients(*)')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getAll() {
    const { data, error } = await supabase
      .from('quotes')
      .select('*, clients(*)')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async update(id: number, updates: Partial<Quote>) {
    const { data, error } = await supabase
      .from('quotes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
}

// Invoice operations
export const invoiceOperations = {
  async create(invoice: Omit<Invoice, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('invoices')
      .insert([invoice])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getByClientId(clientId: number) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getAll() {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, clients(*), jobs(*)')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async update(id: number, updates: Partial<Invoice>) {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

// Add remaining operations here (technician, channel reports, etc.)...