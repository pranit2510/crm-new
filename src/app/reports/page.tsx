/* ------------------------------------------------------------------ *
 *  /reports – SERVER COMPONENT (pure SSR + streamed HTML)            *
 * ------------------------------------------------------------------ */
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
// import type { Database } from '@/lib/supabase'   // ❐ keep if you generated types
import ReportsPageClient from './ReportsPageClient'          // (2)

export const revalidate = 0            // pure SSR (set >0 for ISR)

/* default month = “YYYY-MM” (today) */
const now          = new Date()
const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

export default async function ReportsPage () {
  const supabase = createServerComponentClient/*<Database>*/({ cookies })

  /* ───────── 1. marketing-channel report for the default month ───── */
  const { data: channels } = await supabase
    .from('channels_report')
    .select('*')
    .eq('month', defaultMonth)
    .order('channel') || { data: [] }

  /* ───────── 2. all leads (for lead-conversion bars) ─────────────── */
  const { data: leads = [] } = await supabase
    .from('leads')
    .select('source, status')

  /* aggregate leads → chart format */
  const leadSummary: Record<string, { total: number; qualified: number }> = {};
  (leads || []).forEach(l => {
    const src = l.source ?? 'Unknown'
    if (!leadSummary[src]) leadSummary[src] = { total: 0, qualified: 0 }
    leadSummary[src].total += 1
    if (['qualified', 'converted', 'client'].includes(l.status)) {
      leadSummary[src].qualified += 1
    }
  })
  const leadChartData = Object.entries(leadSummary).map(([source, v]) => ({
    source,
    total:      v.total,
    qualified:  v.qualified,
  }))

  /* ───────── 3. hand everything to the (*tiny*) client wrapper ───── */
  return (
    <ReportsPageClient
      initialMonth      = {defaultMonth}
      initialChannels   = {channels || []}
      initialLeadReport = {leadChartData}
    />
  )
}
