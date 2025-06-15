'use client'

import {
  BarChart3, DollarSign, Filter, Calendar, Search,
} from 'lucide-react'
import { useState } from 'react'
import MarketingChannelsClient from './MarketingChannelsClient'
import type { ChannelReport } from '@/lib/supabase-client'

export interface ReportsPageClientProps {
  initialMonth      : string
  initialChannels   : ChannelReport[]
  initialLeadReport : { source:string; total:number; qualified:number }[]
}

export default function ReportsPageClient ({
  initialMonth,
  initialChannels,
  initialLeadReport,
}: ReportsPageClientProps) {
  /* the rest of your page logic can stay, but the snippet below
     simply shows the marketing-channels section so you can compile   */

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <BarChart3 className="mr-3 h-8 w-8 text-[#1877F2]" />
          Reports
        </h1>
      </div>

      {/* global filters can stay here … */}

      {/* the marketing card is rendered directly */}
      <MarketingChannelsClient
        initialMonth      ={initialMonth}
        initialChannels   ={initialChannels}
        initialLeadReport ={initialLeadReport}
      />
    </div>
  )
}
