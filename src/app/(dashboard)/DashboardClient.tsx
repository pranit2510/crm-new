'use client'

import { useState, useLayoutEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  PlusCircle,
  Users,
  FileText as FileTextIcon,
  Lightbulb as LightbulbIcon,
  Receipt as ReceiptIcon,
  Settings2,
  Lock,
  Unlock,
} from 'lucide-react'

import TodaysScheduleWidget from '@/components/dashboard/TodaysScheduleWidget'
import SummaryCardWidget    from '@/components/dashboard/SummaryCardWidget'
import RecentActivityWidget from '@/components/dashboard/RecentActivityWidget'

import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import type { DashboardStats } from './page'

const GridLayout = dynamic(() => import('react-grid-layout').then(m => m.default || m), { ssr: false }) as any

interface Props {
  initialStats: DashboardStats
  defaultLayout: any[]
}

export default function DashboardClient({ initialStats, defaultLayout }: Props) {
  const [stats]    = useState(initialStats)
  const [layout, setLayout] = useState<any[]>(defaultLayout)
  const [edit,   setEdit]   = useState(false)
  const [mounted,setMounted]= useState(false)

  useLayoutEffect(() => {
    const saved = localStorage.getItem('dashboardLayout')
    if (saved) try { setLayout(JSON.parse(saved)) } catch {}
    setMounted(true)
  }, [])

  const onLayoutChange = (l:any[]) => {
    setLayout(l)
    localStorage.setItem('dashboardLayout', JSON.stringify(l))
  }
  const resetLayout = () => {
    setLayout(defaultLayout)
    localStorage.removeItem('dashboardLayout')
  }

  if (!mounted) return null

  /* widgets use only the five stats */
  const widgets = {
    schedule:      <TodaysScheduleWidget />,

    activeJobs:    (
      <SummaryCardWidget
        title="Active Jobs"
        count={stats.activeJobs.toString()}
        linkText="View all jobs"
        linkHref="/jobs"
        icon={LightbulbIcon}
        iconColor="text-yellow-500"
      />
    ),

    pendingQuotes: (
      <SummaryCardWidget
        title="Pending Quotes"
        count={stats.pendingQuotes.toString()}
        linkText="View all quotes"
        linkHref="/quotes"
        icon={FileTextIcon}
        iconColor="text-blue-500"
      />
    ),

    unpaidInvoices: (
      <SummaryCardWidget
        title="Unpaid Invoices"
        count={stats.unpaidInvoices.toString()}
        linkText="View all invoices"
        linkHref="/invoices"
        icon={ReceiptIcon}
        iconColor="text-orange-500"
      />
    ),

    totalClients:  (
      <SummaryCardWidget
        title="Total Clients"
        count={stats.totalClients.toString()}
        linkText="View all clients"
        linkHref="/clients"
        icon={Users}
        iconColor="text-green-500"
      />
    ),

    activity:      <RecentActivityWidget />,
  } as const

  return (
    <div className="fade-in">
      {/* banner */}
      {stats.totalRevenue > 0 && (
        <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800">
            Total Revenue: ${stats.totalRevenue.toLocaleString()}
          </h3>
          <Link href="/reports" className="btn-secondary text-sm">View Reports</Link>
        </div>
      )}

      {/* grid */}
      <GridLayout
        cols={12}
        rowHeight={60}
        width={1200}
        layout={layout}
        isDraggable={edit}
        isResizable={edit}
        onLayoutChange={onLayoutChange}
        draggableHandle=".drag-handle"
      >
        {layout.map(l => (
          <div key={l.i} className={edit ? 'grid-item-edit' : ''}>
            {edit && <div className="drag-handle h-8 bg-gray-100 border-b text-xs flex items-center justify-center">drag</div>}
            <div className={edit ? 'pt-8 h-full' : 'h-full'}>
              {widgets[l.i as keyof typeof widgets]}
            </div>
          </div>
        ))}
      </GridLayout>

      {/* controls */}
      <div className="fixed bottom-4 right-4 flex gap-2">
        <button onClick={() => setEdit(!edit)} className="p-2 rounded-lg bg-primary text-white">
          {edit ? <Unlock size={18}/> : <Lock size={18}/>}
        </button>
        {edit && (
          <button onClick={resetLayout} className="p-2 rounded-lg bg-gray-200">
            <Settings2 size={18}/>
          </button>
        )}
      </div>
    </div>
  )
}
