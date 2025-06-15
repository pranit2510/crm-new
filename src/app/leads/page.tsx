// app/leads/page.tsx
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import LeadsPageContent from './LeadsPageContent'
import type { Lead } from '@/lib/supabase'

export const revalidate = 0      // pure SSR (set >0 = ISR)

export default async function LeadsPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: leads = [] } = await supabase
    .from('leads')
    .select(
      'id, name, email, phone, status, source, estimated_value, created_at',
    )

  return <LeadsPageContent initialLeads={leads as Lead[]} />
}
