'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { jobOperations } from '@/lib/supabase-client'

type Client   = { id: number; name: string }
type Tech     = { id: string;  name: string }
type Priority = 'Low' | 'Medium' | 'High'

interface Props {
  initialClients: Client[]
  initialTechs:   Tech[]
}

export default function JobFormContent({ initialClients, initialTechs }: Props) {
  const router              = useRouter()
  const clientIdFromQuery   = useSearchParams().get('clientId') ?? ''

  /* ------- local state ---------------------------------------------- */
  const [clientId,  setClientId]  = useState(clientIdFromQuery)
  const [desc,      setDesc]      = useState('')
  const [address,   setAddress]   = useState('')
  const [start,     setStart]     = useState('')
  const [techs,     setTechs]     = useState<string[]>([])
  const [priority,  setPriority]  = useState<Priority>('Medium')
  const [budget,    setBudget]    = useState(0)

  /* ------- submit ---------------------------------------------------- */
  async function submit(e: FormEvent) {
    e.preventDefault()

    await jobOperations.create({
      client_id: Number(clientId),
      title:       desc.slice(0, 50),
      description: desc,
      status:      'pending',
      start_date:  new Date(start).toISOString(),
      end_date:    new Date(start).toISOString(),
      budget,
      priority:    priority.toLowerCase() as 'low' | 'medium' | 'high',
      assigned_technicians: techs,
      service_address: address,
    } as any)

    router.push('/jobs')
  }

  /* ------- UI -------------------------------------------------------- */
  return (
    <form onSubmit={submit} className="bg-white p-6 sm:p-8 rounded-lg shadow space-y-6">
      {/* CLIENT + PRIORITY ------------------------------------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="form-label">Client</label>
          <select value={clientId} onChange={e => setClientId(e.target.value)}
                  className="default-select" required>
            <option value="" disabled>Select a client</option>
            {initialClients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Priority</label>
          <select value={priority} onChange={e => setPriority(e.target.value as Priority)}
                  className="default-select">
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
        </div>
      </div>

      {/* ADDRESS + BUDGET ------------------------------------------------- */}
      <label className="form-label">Service Address
        <input className="default-input mt-1" value={address}
               onChange={e => setAddress(e.target.value)} required />
      </label>

      <label className="form-label">Budget ($)
        <input type="number" min={0} step={0.01} value={budget}
               onChange={e => setBudget(Number(e.target.value))}
               className="default-input mt-1" required />
      </label>

      {/* DESCRIPTION ------------------------------------------------------ */}
      <label className="form-label">Job Description
        <textarea className="default-textarea mt-1" rows={4} value={desc}
                  onChange={e => setDesc(e.target.value)} required />
      </label>

      {/* DATE & TECHS ----------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label className="form-label">Scheduled Date&nbsp;/ Time
          <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)}
                 className="default-input mt-1" required />
        </label>

        <label className="form-label">Assign Technicians
          <select multiple value={techs}
                  onChange={e => setTechs(Array.from(e.target.selectedOptions, o => o.value))}
                  className="default-select mt-1 h-24">
            {initialTechs.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl / Cmd to select multiple.</p>
        </label>
      </div>

      {/* SUBMIT ----------------------------------------------------------- */}
      <div className="pt-4 border-t flex justify-end">
        <button className="btn-primary">
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth={2}
               viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Create Job
        </button>
      </div>
    </form>
  )
}
