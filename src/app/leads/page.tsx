// app/leads/page.tsx
import { createClient } from '@/lib/supabase-server'
import LeadsPageContent from './LeadsPageContent'
import type { Lead } from '@/lib/supabase-types'

export const revalidate = 0      // pure SSR (set >0 = ISR)

export default async function LeadsPage() {
  const supabase = await createClient()

  const { data: leads = [] } = await supabase
    .from('leads')
    .select(
      'id, name, email, phone, status, source, estimated_value, created_at',
    )

  return <LeadsPageContent initialLeads={leads as Lead[]} />
}
