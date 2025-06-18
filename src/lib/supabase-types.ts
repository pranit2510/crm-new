// Database Types
export type Client = {
    id: number
    created_at: string
    name: string
    email: string
    phone: string
    notes: string
    address: string
    status: 'active' | 'inactive'
    estimated_value: number
    source: string
    assigned_to: string
  }
  
  export type Job = {
    id: number
    created_at: string
    title: string
    description: string
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    client_id: number
    start_date: string
    end_date: string
    budget: number
    priority: 'low' | 'medium' | 'high'
    assigned_technicians?: string[]
    serviceAddress?: string
  }
  
  export type Lead = {
    id: number
    created_at: string
    name: string
    email: string
    phone: string
    source: string
    status: 'new' | 'contacted' | 'qualified' | 'lost'
    notes: string
    estimated_value: number
  }
  
  export type Quote = {
    id: number
    created_at: string
    client_id: number
    job_id: number | null
    amount: number
    status: 'draft' | 'sent' | 'accepted' | 'rejected'
    valid_until: string
    terms: string
    notes: string
  }
  
  export type Invoice = {
    id: number
    created_at: string
    client_id: number
    job_id: number
    quote_id: number
    amount: number
    status: 'draft' | 'sent' | 'paid' | 'overdue'
    due_date: string
    payment_terms: string
    notes: string
  }
  
  export type UserProfile = {
    id: string
    created_at: string
    name: string
    email: string
    role: 'Admin' | 'Technician' | 'Manager'
    avatar_url?: string
    phone?: string
  }
  
  export type Technician = {
    id: number
    created_at: string
    name: string
    email: string
    phone: string
    status: 'active' | 'inactive'
    notes: string
  }
  
  export type ChannelReport = {
    id: number
    month: string
    channel: string
    cost: number
    leads: number
    jobs: number
    revenue: number
    close_rate: number
    cost_per_lead: number
    roi: number
    created_at: string
  }