'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, FormEvent, Suspense } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, PlusCircle, Save,
  CalendarDays, User, DollarSign, ScrollText
} from 'lucide-react'
import { clientOperations, quoteOperations } from '@/lib/supabase-client'

const defaultTerms = `1. All payments are due within 30 days of invoice date.
2. A late fee of 1.5 % per month will be applied to overdue invoices.
3. All work is guaranteed for a period of 90 days from completion.`

function QuoteForm () {
  const router        = useRouter()
  const params        = useSearchParams()
  const prefillId     = params?.get('clientId') ?? ''

  /* ───────────────── state ───────────────── */
  const [clients, setClients] = useState<{ id:number; name:string }[]>([])
  const [clientId,  setClientId ] = useState(prefillId)
  const [amount,    setAmount   ] = useState<number>(0)
  const [status,    setStatus   ] = useState<'draft'|'sent'|'accepted'|'rejected'>('draft')
  const [validUntil,setValidUntil] = useState(
    () => new Date(Date.now()+1000*60*60*24*30).toISOString().split('T')[0],
  )
  const [terms, setTerms]       = useState(defaultTerms)
  const [notes, setNotes]       = useState('')

  const [loadingClients, setLoadingClients] = useState(true)
  const [saving,         setSaving]         = useState(false)
  const [error,          setError]          = useState<string| null>(null)

  /* ───────────────── fetch clients once ───────────────── */
  useEffect(() => {
    (async () => {
      try {
        const rows = await clientOperations.getAll()
        setClients(rows ?? [])
      } catch {
        setError('Could not load clients')
      } finally {
        setLoadingClients(false)
      }
    })()
  }, [])

  /* ───────────────── submit ───────────────── */
  async function handleSubmit (e: FormEvent) {
    e.preventDefault()
    if (!clientId) return setError('Select a client first')
    try {
      setSaving(true)
      await quoteOperations.create({
        client_id : Number(clientId),
        amount,
        status,
        valid_until: validUntil,
        terms,
        notes,
        job_id: null,
      } as any)
      router.push('/quotes')
    } catch {
      setError('Failed to save quote')
    } finally {
      setSaving(false)
    }
  }

  /* ───────────────── UI ───────────────── */
  return (
    <>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-3xl font-bold flex items-center'>
          <PlusCircle className='h-8 w-8 text-primary mr-3' />
          Create New Quote
        </h1>
        <Link href="/quotes" className='btn-secondary btn-sm'>
          <ArrowLeft size={16} className="mr-1.5" /> Back
        </Link>
      </div>

      {error && (
        <p className="mb-4 rounded bg-red-50 border border-red-200 p-3 text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-8">
        {/* row 1 */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className='form-label flex items-center'>
              <User size={14} className="mr-1.5 text-gray-400" /> Client
            </label>
            <select
              disabled={loadingClients}
              value={clientId}
              onChange={e=>setClientId(e.target.value)}
              className='default-select w-full'
              required
            >
              <option value="" disabled>Select…</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className='form-label flex items-center'>
              <DollarSign size={14} className="mr-1.5 text-gray-400" /> Amount ($)
            </label>
            <input
              type="number" min={0} step="0.01"
              value={amount}
              onChange={e=>setAmount(parseFloat(e.target.value || '0'))}
              className='default-input w-full'
              required
            />
          </div>
        </div>

        {/* row 2 */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className='form-label'>Status</label>
            <select
              value={status}
              onChange={e=>setStatus(e.target.value as any)}
              className='default-select w-full'
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className='form-label flex items-center'>
              <CalendarDays size={14} className="mr-1.5 text-gray-400" /> Valid until
            </label>
            <input
              type="date"
              value={validUntil}
              onChange={e=>setValidUntil(e.target.value)}
              className='default-input w-full'
              required
            />
          </div>
        </div>

        {/* terms & notes */}
        <div>
          <label className='form-label flex items-center'>
            <ScrollText size={14} className="mr-1.5 text-gray-400" /> Terms
          </label>
          <textarea
            rows={4}
            value={terms}
            onChange={e=>setTerms(e.target.value)}
            className='default-textarea w-full'
          />
        </div>

        <div>
          <label className='form-label'>Notes (optional)</label>
          <textarea
            rows={3}
            value={notes}
            onChange={e=>setNotes(e.target.value)}
            className='default-textarea w-full'
          />
        </div>

        <div className="border-t pt-4 flex justify-end">
          <button
            type="submit"
            className="btn-primary"
            disabled={saving || loadingClients}
          >
            <Save size={18} className="mr-2" />
            {saving ? 'Saving…' : 'Save Quote'}
          </button>
        </div>
      </form>
    </>
  )
}

export default function Page () {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
      <QuoteForm/>
    </Suspense>
  )
}
