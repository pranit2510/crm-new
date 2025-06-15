'use client'

import { useState } from 'react'
import Link from 'next/link'
import { technicianOperations } from '@/lib/supabase-client'
import { useRoleRedirect } from '@/lib/hooks/useRoleRedirect';
type Row = {
  id: string
  name: string
  email: string | null
  phone: string | null
  status: 'active' | 'inactive'
  notes:  string | null
}

export default function TechniciansTable({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial)
  const [busy, setBusy] = useState<string | null>(null)
  useRoleRedirect(['admin', 'user']); 

  const remove = async (id: string) => {
    if (!confirm('Delete this technician?')) return
    setBusy(id)
    await technicianOperations.delete(id)
    setRows(prev => prev.filter(t => t.id !== id))
    setBusy(null)
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Name','Email','Phone','Status','Notes','Actions'].map(h => (
              <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-100">
          {rows.map(t => (
            <tr key={t.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">{t.name}</td>
              <td className="px-6 py-4">{t.email ?? '—'}</td>
              <td className="px-6 py-4">{t.phone ?? '—'}</td>
              <td className="px-6 py-4">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                  t.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {t.status}
                </span>
              </td>
              <td className="px-6 py-4">{t.notes ?? '—'}</td>
              <td className="px-6 py-4 whitespace-nowrap">
  <button
    title="Delete"
    disabled={busy === t.id}
    onClick={() => remove(t.id)}
    className="text-red-600 hover:text-red-700 disabled:opacity-40"
  >
    🗑️
  </button>
</td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr><td colSpan={6} className="text-center py-8 text-gray-400">
              No technicians found.
            </td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
