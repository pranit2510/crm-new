'use client'

import {
  DollarSign,
  Calendar,
  Edit3,
  Trash2,
  FileText,
} from 'lucide-react'
import StatusDropdownLead from '@/components/StatusDropdownLead'     // implement similar to client one
import { leadOperations } from '@/lib/supabase-client'
import type { Lead } from '@/lib/supabase-types'
import Link from 'next/link'
import { useState } from 'react'
import { leadConversionOperations } from '@/lib/lead-conversion'

interface Props {
  leads: Lead[]
  onDelete: (id: number) => void
  onStatusChange: (id: number, s: Lead['status']) => void
}

export default function LeadsTable({ leads, onDelete, onStatusChange }: Props) {
  const [busyId, setBusy] = useState<number | null>(null)

  const remove = async (id: number) => {
    if (!confirm('Delete this lead?')) return
    setBusy(id)
    await leadOperations.delete(id)
    onDelete(id)
    setBusy(null)
  }

  const changeStatus = async (id: number, status: Lead['status']) => {
    setBusy(id)
    if (status === 'qualified') await leadConversionOperations.convertLeadToClient(id)
    await leadOperations.update(id, { status })
    onStatusChange(id, status)
    setBusy(null)
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-x-auto overflow-y-visible">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Value</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {leads.map(l => (
            <tr key={l.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 font-medium">{l.name}</td>
              <td className="px-4 py-4">
                <div>{l.email}</div>
                <div className="text-xs text-gray-500">{l.phone}</div>
              </td>
              <td className="px-4 py-4 relative">
                <StatusDropdownLead
                  id={l.id}
                  current={l.status}
                  disabled={busyId === l.id}
                  onChange={(s) => changeStatus(l.id, s)}
                />
              </td>
              <td className="px-4 py-4">
                ${l.estimated_value?.toLocaleString() ?? 0}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <Link href={`/leads/${l.id}/edit`} className="text-yellow-600 mr-3">
                  <Edit3 size={16} />
                </Link>
                <button
                  className="text-red-600"
                  disabled={busyId === l.id}
                  onClick={() => remove(l.id)}
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
