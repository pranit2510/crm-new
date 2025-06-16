import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

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

// Database Schema SQL (to be run in Supabase SQL editor)
export const schema = `
-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create user profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'Technician' CHECK (role IN ('Admin', 'Technician', 'Manager')),
  avatar_url TEXT,
  phone TEXT
);

-- Create tables
CREATE TABLE IF NOT EXISTS clients (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  notes TEXT,
  address TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  lead_id BIGINT REFERENCES leads(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS jobs (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  budget DECIMAL(10,2),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_technicians TEXT[]
);

CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'lost')),
  notes TEXT,
  assigned_to TEXT
);

CREATE TABLE IF NOT EXISTS quotes (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE,
  job_id BIGINT REFERENCES jobs(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
  valid_until TIMESTAMP WITH TIME ZONE,
  terms TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS invoices (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE,
  job_id BIGINT REFERENCES jobs(id) ON DELETE SET NULL,
  quote_id BIGINT REFERENCES quotes(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  due_date TIMESTAMP WITH TIME ZONE,
  payment_terms TEXT,
  notes TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_job_id ON quotes(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_job_id ON invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_quote_id ON invoices(quote_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Row Level Security Policies
-- Users can only view and update their own profile
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Basic policies for other tables (adjust based on your business logic)
CREATE POLICY "Authenticated users can view clients" ON clients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage clients" ON clients FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view jobs" ON jobs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage jobs" ON jobs FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view leads" ON leads FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage leads" ON leads FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view quotes" ON quotes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage quotes" ON quotes FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view invoices" ON invoices FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage invoices" ON invoices FOR ALL USING (auth.role() = 'authenticated');
` 