"use client";

import LeadConversion from '@/components/LeadConversion'
import QuoteConversion from '@/components/QuoteConversion'
import Calendar from '@/components/Calendar'
import Reporting from '@/components/Reporting'

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lead Conversion */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Lead Management</h2>
          <LeadConversion />
        </div>

        {/* Quote Conversion */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Quote Management</h2>
          <QuoteConversion />
        </div>

        {/* Calendar */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Calendar & Deadlines</h2>
          <Calendar />
        </div>

        {/* Reporting */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Business Reports</h2>
          <Reporting />
        </div>
      </div>
    </div>
  )
} 