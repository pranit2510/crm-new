/* ------------------------------------------------------------------ */
/*  /jobs/new – server component                                      */
/* ------------------------------------------------------------------ */
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import JobFormContent from './JobFormContent'

//    ⟋  if you generated types via `npx supabase gen …`
//   ⟋   import type { Database } from '@/lib/supabase'

export const revalidate = 0                 // true SSR (set >0 for ISR)

export default async function NewJobPage() {
  // add <Database> in <> if you generated types
  const supabase = createServerComponentClient(/*<Database>*/ { cookies })

  /* ---- get choices for the <select> boxes in *one* round-trip ------- */
  const [{ data: clients = [] }, { data: techs = [] }] = await Promise.all([
    supabase.from('clients').select('id, name'),
    supabase.from('technicians').select('id, name'),
  ])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center text-dark">
          <svg className="h-8 w-8 mr-3 text-primary" fill="none" stroke="currentColor" strokeWidth={2}
               viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Create New Job
        </h1>
        <a href="/jobs" className="btn-secondary btn-sm inline-flex">
          <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" strokeWidth={2}
               viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back to Jobs
        </a>
      </div>

      {/*  hand the data to the client component  */}
      return <JobFormContent initialClients={clients || []} initialTechs={techs || []} />
    </div>
  )
}
