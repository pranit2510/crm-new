/* ------------------------------------------------------------------ */
/*  app/jobs/page.tsx  –  Server component (runs only on the server)  */
/* ------------------------------------------------------------------ */

import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import JobsPageContent from './JobsPageContent'  

/* ⬇︎  If you ran `supabase gen types typescript …`, uncomment next line
   and keep the generic `<Database>` in createServerComponentClient.      */
// import type { Database } from '@/lib/supabase'

/** 0 = pure SSR. Put any positive number for ISR (seconds). */
export const revalidate = 0

export default async function JobsPage() {
  /* <Database> is optional – include it only if you imported the type. */
  const supabase = createServerComponentClient({ cookies })

  /* ─── fetch all jobs, joined client name/address and tech IDs ────── */
  const { data: jobs = [] } = await supabase
    .from('jobs')
    .select(`
      *,
      clients ( name, address ),
      assigned_technicians
    `)
    .order('created_at', { ascending: false })

  /* ─── tiny lookup table to turn technician-id → human name ───────── */
  const { data: techs = [] } = await supabase
    .from('technicians')
    .select('id, name')

  /* ─── hand everything to the client-side table component ─────────── */
  return <JobsPageContent initialJobs={jobs || []} initialTechs={techs || []} />
}
