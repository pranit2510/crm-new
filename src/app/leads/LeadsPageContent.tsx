/* -------------------------------------------------------------------- */
/*  app/leads/LeadsPageContent.tsx  – client component                  */
/* -------------------------------------------------------------------- */
'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { PlusCircle, Search, Lightbulb } from 'lucide-react'
import LeadsTable from '@/components/LeadsTable'
import type { Lead } from '@/lib/supabase-types'
import { useRoleRedirect } from '@/lib/hooks/useRoleRedirect';


/* ---- helper types --------------------------------------------------- */
export interface LeadStatusCounts {
  new: number
  contacted: number
  qualified: number
  lost: number
  all: number
}

interface Props {
  initialLeads: Lead[]
}

export default function LeadsPageContent({ initialLeads }: Props) {
  /* ---- local state --------------------------------------------------- */
  const [leads, setLeads]   = useState(initialLeads)
  const [search, setSearch] = useState('')
  const [
    filter,
    setFilter,
  ] = useState<'all' | 'new' | 'contacted' | 'qualified' | 'lost'>('all')

  /* ---- live counters ------------------------------------------------- */
  const counts: LeadStatusCounts = useMemo(() => ({
    new:        leads.filter(l => l.status === 'new').length,
    contacted:  leads.filter(l => l.status === 'contacted').length,
    qualified:  leads.filter(l => l.status === 'qualified').length,
    lost:       leads.filter(l => l.status === 'lost').length,
    all:        leads.length,
  }), [leads])

  /* ---- filtered list ------------------------------------------------- */
  const list = useMemo(() => {
    let rows = leads
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(l =>
        l.name.toLowerCase().includes(q) ||
        (l.email ?? '').toLowerCase().includes(q) ||
        (l.phone ?? '').toLowerCase().includes(q),
      )
    }
    if (filter !== 'all') rows = rows.filter(l => l.status === filter)
    return rows
  }, [leads, search, filter])

  /* ---- callbacks for LeadsTable ------------------------------------- */
  const handleDelete = (id: number) =>
    setLeads(prev => prev.filter(l => l.id !== id))

  const handleStatus = (id: number, status: Lead['status']) =>
    setLeads(prev => prev.map(l => (l.id === id ? { ...l, status } : l)))

  useRoleRedirect(['admin', 'user']); 
  /* ---- ui ------------------------------------------------------------ */
  return (
    <div className="fade-in">
      {/* header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <Lightbulb className="h-8 w-8 text-primary mr-3" />
          Leads ({counts.all})
        </h1>
        <Link href="/leads/new" className="btn-primary group inline-flex items-center">
          <PlusCircle size={20} className="mr-2 group-hover:rotate-90 transition-transform" />
          New Lead
        </Link>
      </div>

      {/* search + dropdown */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* search */}
        <div className="relative flex-1">
          <Search className="absolute h-5 w-5 text-gray-400 left-3 top-1/2 -translate-y-1/2" />
          <input
            className="w-full pl-10 pr-3 py-2 border rounded-md"
            placeholder="Search leads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* dropdown (optional quick filter) */}
        <select
          className="sm:w-48 border rounded-md px-3 py-2"
          value={filter}
          onChange={e => setFilter(e.target.value as any)}
        >
          <option value="all">All Statuses</option>
          <option value="new">New ({counts.new})</option>
          <option value="contacted">Contacted ({counts.contacted})</option>
          <option value="qualified">Qualified ({counts.qualified})</option>
          <option value="lost">Lost ({counts.lost})</option>
        </select>
      </div>

      {/* status-counter bar --------------------------------------------- */}
      <div className="mb-6 flex flex-wrap gap-2">
        {([
          { key: 'all',        label: 'All',        color: 'bg-gray-100 text-gray-600' },
          { key: 'new',        label: 'New',        color: 'bg-blue-100 text-blue-800' },
          { key: 'contacted',  label: 'Contacted',  color: 'bg-yellow-100 text-yellow-800' },
          { key: 'qualified',  label: 'Qualified',  color: 'bg-green-100 text-green-800' },
          { key: 'lost',       label: 'Lost',       color: 'bg-red-100 text-red-800' },
        ] as const).map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1
              ${filter === key ? color : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <span>{label}</span>
            <span className="text-xs opacity-70">({counts[key]})</span>
          </button>
        ))}
      </div>

      {/* table */}
      <LeadsTable
        leads={list}
        onDelete={handleDelete}
        onStatusChange={handleStatus}
      />
    </div>
  )
}
