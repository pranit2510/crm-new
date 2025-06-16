// components/StatusDropdown.tsx
'use client'

import React from 'react'
import { clientOperations } from '@/lib/supabase-client'

export type ClientStatus = 'Prospective' | 'Active' | 'Inactive'

interface Props {
  id: number
  current: ClientStatus
  onChange: (s: ClientStatus) => void
}

const colors: Record<ClientStatus, string> = {
  Prospective: 'bg-blue-100 text-blue-700',
  Active:      'bg-green-100 text-green-700',
  Inactive:    'bg-gray-100 text-gray-700',
}

export default function StatusDropdown({ id, current, onChange }: Props) {
  const update = async (status: ClientStatus) => {
    if (status === current) return
    await clientOperations.update(id, { status: status.toLowerCase() as 'active' | 'inactive' })
    onChange(status)
  }

  return (
    <select
      value={current}
      onChange={(e) => update(e.target.value as ClientStatus)}
      className={`px-2 py-1 rounded-md text-xs font-medium border ${colors[current]}`}
    >
      <option value="Prospective">Prospective</option>
      <option value="Active">Active</option>
      <option value="Inactive">Inactive</option>
    </select>
  )
}
