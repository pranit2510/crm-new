'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import ClientsTable from '@/components/ClientsTable'
import type { ClientStatus } from '@/components/StatusDropdown'
import { useRoleRedirect } from '@/lib/hooks/useRoleRedirect';


/* ---------- shared types --------------------------------------------- */
export interface EnhancedClient {
  id: number
  name: string
  email?: string
  phone?: string
  created_at: string
  flowStatus: ClientStatus
  totalJobs: number
  totalRevenue: number
  lastJobDate?: string
  estimated_value: number
  source?: string | null
}
export type StatusCounts = {
  Prospective: number
  Active: number
  Inactive: number
  All: number
}

/* ---------- component ------------------------------------------------- */
interface Props {
  initialClients: EnhancedClient[]
}
export default function ClientsPageContent({ initialClients }: Props) {
  const [clients, setClients] = useState(initialClients)
  const [search,  setSearch]  = useState('')
  const [tab,     setTab]     = useState<ClientStatus | 'All'>('All')
  useRoleRedirect(['admin', 'user']); 

  /* live counters */
  const counts: StatusCounts = useMemo(() => ({
    Prospective: clients.filter(c => c.flowStatus === 'Prospective').length,
    Active:      clients.filter(c => c.flowStatus === 'Active').length,
    Inactive:    clients.filter(c => c.flowStatus === 'Inactive').length,
    All:         clients.length,
  }), [clients])

  /* filtered list shown in the table */
  const list = useMemo(() => {
    let rows = clients
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.email ?? '').toLowerCase().includes(q),
      )
    }
    if (tab !== 'All') rows = rows.filter(c => c.flowStatus === tab)
    return rows
  }, [clients, search, tab])

  /* handlers the table will call --------------------------------------- */
  const handleDelete = (id: number) =>
    setClients(prev => prev.filter(c => c.id !== id))

  const handleStatus = (id: number, s: ClientStatus) =>
    setClients(prev => prev.map(c => c.id === id ? { ...c, flowStatus: s } : c))

  /* ------------------------- render ----------------------------------- */
  return (
    <div className="fade-in">
      {/* header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold flex items-center">
          <svg className="h-8 w-8 text-primary mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3a2 2 0 0 0-2 2v14l4-4h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5z"/></svg>
          Clients ({clients.length})
        </h1>

        <Link href="/clients/new" className="btn-primary flex items-center group">
          <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform" />
          Add New Client
        </Link>
      </div>

      {/* tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['Prospective','Active','Inactive','All'] as const).map(k => (
          <button
            key={k}
            onClick={() => setTab(k === 'All' ? 'All' : k)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === k
                ? 'bg-primary text-white shadow'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {k} ({counts[k]})
          </button>
        ))}
      </div>

      {/* search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-primary focus:border-primary"
          placeholder="Search clients by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* table */}
      <ClientsTable
        clients={list}
        onDelete={handleDelete}
        onStatusChange={handleStatus}
      />
    </div>
  )
}
