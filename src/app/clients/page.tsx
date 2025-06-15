import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'


import ClientsTable, {
  EnhancedClient,
  StatusCounts,
} from '@/components/ClientsPageContent'


export const revalidate = 0     // set >0 for ISR if you like

export default async function ClientsPage() {

  const cookieStore = cookies()

  /* 2. hand a callback to Supabase helper */
  const supabase = createServerComponentClient({
    cookies: () => cookieStore,   // ✅ no warning
  })


  /* -- fetch three tables in parallel ----------------------------------- */
  const [
    clientsRes,
    jobsRes,
    invoicesRes,
  ] = await Promise.all([
    supabase.from('clients').select('*'),
    supabase.from('jobs').select('*'),
    supabase.from('invoices').select('*'),
  ])

  /* -- coalesce possible nulls ------------------------------------------ */
  const clients  = clientsRes.data  ?? []
  const jobs     = jobsRes.data     ?? []
  const invoices = invoicesRes.data ?? []

  /* -- enrich each client ----------------------------------------------- */
  const enhanced: EnhancedClient[] = clients.map(c => {
    const jobRows     = jobs.filter(j => j.client_id === c.id)
    const invoiceRows = invoices.filter(i => i.client_id === c.id)

    const totalJobs    = jobRows.length
    const totalRevenue = invoiceRows
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + (i.amount || 0), 0)

    const lastJobDate =
      jobRows.length
        ? jobRows.slice().sort(
            (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
          )[0].created_at
        : undefined

    const flowStatus =
      c.status === 'inactive' ? 'Inactive' :
      c.status === 'active'   ? 'Active'   :
                                'Prospective'

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
    }
  })

  /* -- counts for metric cards ------------------------------------------ */
  const statusCounts: StatusCounts = {
    Prospective: enhanced.filter(x => x.flowStatus === 'Prospective').length,
    Active:      enhanced.filter(x => x.flowStatus === 'Active').length,
    Inactive:    enhanced.filter(x => x.flowStatus === 'Inactive').length,
    All:         enhanced.length,
  }

  return (
    <ClientsTable
      initialClients={enhanced}
    />
  )
}
