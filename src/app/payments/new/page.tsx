/* ------------------------------------------------------------------ */
/*  src/app/payments/new/page.tsx – Create‑Payment (Client side)      */
/* ------------------------------------------------------------------ */
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter }            from 'next/navigation'
import { clientOperations }     from '@/lib/supabase-client'

type ClientRow = { id: number; name: string }

export default function NewPaymentPage() {
  /* ───────────────────── state ──────────────────────── */
  const [clients , setClients ] = useState<ClientRow[]>([])
  const [clientId, setClientId] = useState('')
  const [amount  , setAmount  ] = useState('')
  const [description, setDescription] = useState('')
  const [error   , setError   ] = useState('')
  const [loading , setLoading ] = useState(false)
  const router = useRouter()

  /* load clients once ---------------------------------- */
  useEffect(() => {
    clientOperations.getAll()
      .then(c => setClients(c ?? []))
      .catch(err => {
        console.error('Load clients failed', err)
        setError('Could not load clients')
      })
  }, [])

  /* submit handler ------------------------------------- */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const dollars = parseFloat(amount)
    if (!clientId || isNaN(dollars) || dollars <= 0) {
      setError('Select a client and enter a valid amount')
      return
    }

    const cents = Math.round(dollars * 100)          // FIX: convert → cents
    setLoading(true)

    try {
      /* POST to our API route */
      const res  = await fetch('/payments/create', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          clientId   : Number(clientId),
          amountCents: cents,                       // server now receives cents
          description,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Server error')

      router.push('/payments')
    } catch (err: any) {
      console.error('Create payment error', err)
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  /* ───────────────────── UI ─────────────────────────── */
  return (
    <div className="max-w-xl mx-auto mt-10 bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6">New Payment</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={submit} className="space-y-4">
        {/* Client drop‑down */}
        <div>
          <label className="block text-sm font-medium">Client</label>
          <select
            required
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
          >
            <option value="" disabled>Select…</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Amount in dollars (shown to user) */}
        <div>
          <label className="block text-sm font-medium">Amount (USD)</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Create Payment'}
        </button>
      </form>
    </div>
  )
}
