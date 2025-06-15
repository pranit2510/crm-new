import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import ClientsPageContent from '@/components/ClientsPageContent'
import type { EnhancedClient, StatusCounts } from '@/components/ClientsPageContent'

export const revalidate = 0   // pure SSR (set >0 for ISR)

/**
 * GET everything we need in one shot, then hand off to the client component
 */
export default async function ClientsPage() {
  const supabase = createServerComponentClient({ cookies })

  const [
    clientsRes,
    jobsRes,
    invoicesRes,
  ] = await Promise.all([
    supabase.from('clients').select('*'),
    supabase.from('jobs').select('id, client_id, created_at'),
    supabase.from('invoices').select('id, client_id, amount, status'),
  ])

  const clients  = clientsRes.data  ?? []
  const jobs     = jobsRes.data     ?? []
  const invoices = invoicesRes.data ?? []

  /* enrich each client --------------------------------------------------- */
  const enhanced: EnhancedClient[] = clients.map(c => {
    const jobRows     = jobs.filter(j => j.client_id === c.id)
    const invoiceRows = invoices.filter(i => i.client_id === c.id)

    const totalJobs    = jobRows.length
    const totalRevenue = invoiceRows
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + (i.amount || 0), 0)

    const lastJobDate =
      jobRows.length
        ? jobRows
            .slice()
            .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))[0]
            .created_at
        : undefined

    const flowStatus =
      c.status === 'inactive' ? 'Inactive'
      : c.status === 'active' ? 'Active'
      : 'Prospective'

    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      created_at: c.created_at,
      flowStatus,
      totalJobs,
      totalRevenue,
      lastJobDate,
      estimated_value: c.estimated_value ?? 0,
      source: c.source,
    }
  })

  /* counts for tabs ------------------------------------------------------ */
  const statusCounts: StatusCounts = {
    Prospective: enhanced.filter(x => x.flowStatus === 'Prospective').length,
    Active:      enhanced.filter(x => x.flowStatus === 'Active').length,
    Inactive:    enhanced.filter(x => x.flowStatus === 'Inactive').length,
    All:         enhanced.length,
  }

  return (
    <ClientsPageContent
      initialClients={enhanced}
    />
  )
}
