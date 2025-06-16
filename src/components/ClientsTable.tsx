'use client'
import Link from 'next/link'
import { DollarSign, Calendar, Trash2, FileText, Users } from 'lucide-react'
import StatusDropdown, { ClientStatus } from './StatusDropdown'
import { clientOperations } from '@/lib/supabase-client'
import type { EnhancedClient } from '@/components/ClientsPageContent'


interface Props {
  clients: EnhancedClient[]
  onDelete: (id: number) => void
  onStatusChange: (id: number, status: ClientStatus) => void
}

export default function ClientsTable({ clients, onDelete, onStatusChange }: Props) {
  /* helpers that call API then bubble up -------------------------------- */
  const remove = async (id: number) => {
    if (!confirm('Delete this client?')) return
    await clientOperations.delete(id)
    onDelete(id)
  }

  const changeStatus = async (id: number, status: ClientStatus) => {
    await clientOperations.update(id, { status: status.toLowerCase() as 'active' | 'inactive' })
    onStatusChange(id, status)
  }

  /* render -------------------------------------------------------------- */
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow" style={{ overflow: 'visible' }}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metrics</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {clients.map(c => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 font-medium">
                <Link href={`/clients/${c.id}`} className="hover:underline">{c.name}</Link>
                <div className="text-xs text-gray-400">Added {new Date(c.created_at).toLocaleDateString()}</div>
              </td>

              <td className="px-4 py-4">
                <div>{c.email ?? '—'}</div>
                <div className="text-xs text-gray-500">{c.phone}</div>
              </td>

              <td className="px-4 py-4 relative">
                <StatusDropdown
                  id={c.id}
                  current={c.flowStatus}
                  onChange={status => changeStatus(c.id, status)}
                />
                {c.source && <div className="text-xs text-gray-500 mt-1">Source: {c.source}</div>}
              </td>

              <td className="px-4 py-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <DollarSign size={14}/> ${c.totalRevenue.toLocaleString()}
                  <Calendar size={14} className="ml-2" /> {c.totalJobs} jobs
                </div>
                {c.lastJobDate && (
                  <div className="text-xs text-gray-400">
                    Last job: {new Date(c.lastJobDate).toLocaleDateString()}
                  </div>
                )}
              </td>

              <td className="px-4 py-4 whitespace-nowrap">
                <Link
                  href={`/quotes/new?clientId=${c.id}`}
                  className="text-blue-600 hover:underline mr-4 inline-flex items-center text-xs font-semibold border border-blue-200 bg-blue-50 px-2 py-1 rounded"
                >
                  <FileText size={14} className="mr-1" />
                  Create Quote
                </Link>

                <button
                  onClick={() => remove(c.id)}
                  className="text-red-600 hover:underline inline-flex items-center text-xs font-semibold border border-red-200 bg-red-50 px-2 py-1 rounded"
                >
                  <Trash2 size={14} className="mr-1" />
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {clients.length === 0 && (
        <div className="p-12 text-center text-gray-500">
          <Users className="mx-auto h-10 w-10 mb-4" />
          No clients found.
        </div>
      )}
    </div>
  )
}
