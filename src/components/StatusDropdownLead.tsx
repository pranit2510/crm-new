/* ---------------------------------------------------------------------- */
/*  StatusDropdownLead.tsx                                                */
/*  Generic dropdown used inside the Leads table                          */
/* ---------------------------------------------------------------------- */
'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost'

interface Props {
  id: number
  current: LeadStatus
  onChange: (s: LeadStatus) => void
  disabled?: boolean
}

/* colour pills for each status */
const colors: Record<LeadStatus, string> = {
  new:        'bg-blue-100  text-blue-800',
  contacted:  'bg-yellow-100 text-yellow-800',
  qualified:  'bg-green-100 text-green-800',
  lost:       'bg-red-100   text-red-800',
}

const labels: Record<LeadStatus, string> = {
  new:        'New',
  contacted:  'Contacted',
  qualified:  'Qualified',
  lost:       'Lost',
}

export default function StatusDropdownLead({
  id,
  current,
  onChange,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false)

  const choose = (s: LeadStatus) => {
    setOpen(false)
    if (s !== current) onChange(s)
  }

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${colors[current]} ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        {labels[current]}
        <ChevronDown size={12} className="ml-1" />
      </button>

      {open && !disabled && (
        <div className="absolute z-10 mt-1 w-32 bg-white border border-gray-200 rounded shadow-lg">
          {(Object.keys(colors) as LeadStatus[]).map(s => (
            <button
              key={s}
              onClick={() => choose(s)}
              disabled={s === current}
              className={`block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${
                s === current ? 'bg-gray-100 cursor-default' : ''
              }`}
            >
              {labels[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
