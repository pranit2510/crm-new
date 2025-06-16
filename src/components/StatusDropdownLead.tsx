/* ---------------------------------------------------------------------- */
/*  StatusDropdownLead.tsx                                                */
/*  Generic dropdown used inside the Leads table                          */
/* ---------------------------------------------------------------------- */
'use client'

import React from 'react'

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



export default function StatusDropdownLead({
  id,
  current,
  onChange,
  disabled,
}: Props) {
  const choose = (s: LeadStatus) => {
    if (s !== current) onChange(s)
  }

  return (
    <select
      disabled={disabled}
      value={current}
      onChange={(e) => choose(e.target.value as LeadStatus)}
      className={`px-2 py-1 rounded-md text-xs font-medium border ${colors[current]} ${
        disabled ? 'opacity-60 cursor-not-allowed' : ''
      }`}
    >
      <option value="new">New</option>
      <option value="contacted">Contacted</option>
      <option value="qualified">Qualified</option>
      <option value="lost">Lost</option>
    </select>
  )
}
