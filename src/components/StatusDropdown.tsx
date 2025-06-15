// components/StatusDropdown.tsx
'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
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
  const [open, setOpen] = useState(false)

  const update = async (status: ClientStatus) => {
    setOpen(false)
    if (status === current) return
    await clientOperations.update(id, { status: status.toLowerCase() as 'active' | 'inactive' })
    onChange(status)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${colors[current]}`}
      >
        {current}
        <ChevronDown size={12} className="ml-1" />
      </button>

      {open && (
        <div className="absolute z-10 mt-1 bg-white border rounded shadow">
          {(['Prospective', 'Active', 'Inactive'] as ClientStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => update(s)}
              className={`block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${
                s === current ? 'bg-gray-100' : ''
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
