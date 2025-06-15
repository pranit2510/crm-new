/* ------------------------------------------------------------------ */
/*  /technicians – server rendered                                    */
/* ------------------------------------------------------------------ */
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'     
import TechniciansTable from './TechniciansTable'

// 0 = pure SSR (change to a number >0 for ISR)
export const revalidate = 0

export default async function TechniciansPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: technicians = [] } = await supabase
    .from('technicians')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl w-full mx-auto mt-10">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Technicians</h1>
          {/* use Next Link so the SPA navigation always works */}
          <Link href="/technicians/new" className="btn-primary">
            Add Technician
         </Link>
        </div>

        {/* hand the rows to a small client component so we can delete */}
        <TechniciansTable initial={technicians || []} />
      </div>
    </div>
  )
}
