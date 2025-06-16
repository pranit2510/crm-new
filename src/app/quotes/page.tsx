/* ------------------------------------------------------------------ */
/*  /quotes – 100 % SSR, no client-side data fetch                    */
/* ------------------------------------------------------------------ */
import { createClient } from '@/lib/supabase-server'
import QuotesPageContent from '@/components/QuotesPageContent'

// import type { Database } from '@/lib/supabase'     // keep if you generated types

export const revalidate = 0                // pure SSR (set >0 for ISR)

export default async function QuotesPage() {
  /* if you generated types add <Database> here */
  const supabase = await createClient()

  /* ---------- fetch everything needed in parallel -------------------- */
  const [quotesRes, clientsRes, invoicesRes] = await Promise.all([
    supabase.from('quotes').select('*'),
    supabase.from('clients').select('id, name'),
    supabase.from('invoices').select('id, quote_id'),
  ])

  const quotes   = quotesRes.data   ?? []
  const clients  = clientsRes.data  ?? []
  const invoices = invoicesRes.data ?? []

  /* ---------- enrich for UI ------------------------------------------ */
  const rows = quotes.map(q => {
    const clientName = clients.find(c => c.id === q.client_id)?.name ?? 'Unknown'
    const hasInvoice = invoices.some(i => i.quote_id === q.id)

    return {
      id:           q.id,
      clientId:     q.client_id,
      clientName,
      amount:       q.amount ?? 0,
      status:       q.status as 'draft'|'sent'|'accepted'|'rejected',
      validUntil:   q.valid_until,
      notes:        q.notes,
      hasInvoice,
    }
  })

  /* ---------- send to the interactive client part ------------------- */
  return <QuotesPageContent initialQuotes={rows} />
}
