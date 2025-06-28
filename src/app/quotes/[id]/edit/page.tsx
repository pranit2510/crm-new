'use client'

import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Save, ArrowLeft } from 'lucide-react'
import { quoteOperations } from '@/lib/supabase-client'
import type { Quote } from '@/lib/supabase-types'

export default function EditQuotePage () {
  const router      = useRouter()
  const { id }      = useParams<{ id:string }>()
  const quoteId     = Number(id)

  const [quote, setQuote]       = useState<Quote | null>(null)
  const [amount, setAmount]     = useState(0)
  const [status, setStatus]     = useState<'draft'|'sent'|'accepted'|'rejected'>('draft')
  const [validUntil,setValidUntil] = useState('')
  const [terms, setTerms]       = useState('')
  const [notes, setNotes]       = useState('')
  const [loading,setLoading]    = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string| null>(null)

  /* ───────────────── fetch once ───────────────── */
  useEffect(() => {
    (async () => {
      try {
        const rows = await quoteOperations.getAll()
        const q    = rows.find((r:any)=>r.id===quoteId)
        if (!q) throw new Error('not-found')
        setQuote(q)
        setAmount(q.amount)
        setStatus(q.status)
        setValidUntil(q.valid_until?.split('T')[0] ?? '')
        setTerms(q.terms ?? '')
        setNotes(q.notes ?? '')
      } catch {
        setError('Could not load quote')
      } finally {
        setLoading(false)
      }
    })()
  }, [quoteId])

  /* ───────────────── update ───────────────── */
  async function handleSubmit (e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true)
      await quoteOperations.update(quoteId, {
        amount,
        status,
        valid_until: validUntil,
        terms,
        notes,
      } as any)
      router.push('/quotes')
    } catch {
      setError('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (loading)       return <p className="p-8">Loading…</p>
  if (error || !quote) return <p className="p-8 text-red-600">{error ?? 'Quote not found'}</p>

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Quote #{quote.id}</h1>
        <Link href="/quotes" className="btn-secondary btn-sm">
          <ArrowLeft size={16} className="mr-1.5"/> Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="form-label">Amount ($)</label>
          <input
            type="number" min={0} step="0.01"
            value={amount || ''}
            onChange={e=>setAmount(e.target.value ? parseFloat(e.target.value) : 0)}
            className="default-input w-full"
            required
          />
        </div>

        <div>
          <label className="form-label">Status</label>
          <select
            value={status}
            onChange={e=>setStatus(e.target.value as any)}
            className="default-select w-full"
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label className="form-label">Valid until</label>
          <input
            type="date"
            value={validUntil}
            onChange={e=>setValidUntil(e.target.value)}
            className="default-input w-full"
            required
          />
        </div>

        <div>
          <label className="form-label">Terms</label>
          <textarea
            rows={3}
            value={terms}
            onChange={e=>setTerms(e.target.value)}
            className="default-textarea w-full"
          />
        </div>

        <div>
          <label className="form-label">Notes</label>
          <textarea
            rows={3}
            value={notes}
            onChange={e=>setNotes(e.target.value)}
            className="default-textarea w-full"
          />
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <div className="flex justify-end border-t pt-4">
          <button type="submit" className="btn-primary" disabled={saving}>
            <Save size={18} className="mr-2" />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
