// src/app/reports/MarketingChannelsCard.tsx
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import MarketingChannelsClient from './MarketingChannelsClient'
// import type { Database } from '@/lib/supabase'

interface Props { month: string }        // YYYY-MM from the parent page

export default async function MarketingChannelsCard ({ month }: Props) {
  const supabase = createServerComponentClient/*<Database>*/({ cookies })

  const { data: channelRows = [] } = await supabase
    .from('channels_report')
    .select('*')
    .eq('month', month)
    .order('channel')

  return (
    <MarketingChannelsClient
      /** names ⬇︎ must match the client interface exactly */
      initialMonth      ={month}
      initialChannels   ={channelRows ?? []}
      initialLeadReport ={[]}            // ← you can remove this prop if unused
    />
  )
}
