import { createClient } from '@/lib/supabase-server'
import DashboardClient from './DashboardClient'
import defaultLayout   from './defaultLayout'

export const revalidate = 30            // rebuild every 30 s

export interface DashboardStats {
  activeJobs:      number
  pendingQuotes:   number
  unpaidInvoices:  number
  totalClients:    number
  totalRevenue:    number
}

export default async function DashboardPage() {
  const supabase = await createClient()

  /* parallel, lean queries */
  const [
    { count: totalClients },
    { count: activeJobs },
    { count: pendingQuotes },
    { count: unpaidInvoices },
    { data: revenueRow },
  ] = await Promise.all([
    supabase.from('clients').select('*', { head: true, count: 'exact' }),

    supabase
      .from('jobs')
      .select('*', { head: true, count: 'exact' })
      .in('status', ['pending', 'in_progress']),

    supabase
      .from('quotes')
      .select('*', { head: true, count: 'exact' })
      .in('status', ['draft', 'sent']),

    supabase
      .from('invoices')
      .select('*', { head: true, count: 'exact' })
      .in('status', ['sent', 'overdue']),

    supabase.rpc('marketing_revenue_this_month'),
  ])

  const stats: DashboardStats = {
    activeJobs:     activeJobs     ?? 0,
    pendingQuotes:  pendingQuotes  ?? 0,
    unpaidInvoices: unpaidInvoices ?? 0,
    totalClients:   totalClients   ?? 0,
    totalRevenue:   revenueRow?.[0]?.revenue ?? 0,
  }

  return (
    <DashboardClient
      initialStats={stats}
      defaultLayout={defaultLayout}
    />
  )
}
