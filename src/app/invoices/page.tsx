/* ------------------------------------------------------------------ */
/*  /invoices – server component (SSR)                                */
/* ------------------------------------------------------------------ */
import { createClient } from '@/lib/supabase-server'
import InvoicesPageContent from './InvoicesPageContent'
// import type { Database } from '@/lib/supabase'            // ← keep if you generated types

export const revalidate = 0          // pure SSR (set a number >0 for ISR)

export default async function InvoicesPage() {
  const supabase = await createClient()

  /* 1 ▸ fetch invoices + joined client + job + quote in one roundtrip */
  const { data: invoices = [] } = await supabase
    .from('invoices')
    .select(`
      *,
      clients      : client_id ( id, name ),
      jobs         : job_id    ( id, title ),
      quotes       : quote_id  ( id )
    `)
    .order('created_at', { ascending: false })

  /* 2 ▸ pass the data to the interactive client component */
  return <InvoicesPageContent initialInvoices={invoices || []} />
}
