'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  PlusCircle,
  Search,
  Send,
  Edit3,
  Trash2,
} from 'lucide-react'
import { useRoleRedirect } from '@/lib/hooks/useRoleRedirect';
import {
  quoteOperations,
  invoiceOperations,          // still imported – may be useful elsewhere
} from '@/lib/supabase-client'
import { quoteConversionOperations } from '@/lib/quote-conversion'

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected'

interface UIQuote {
  id:          number
  clientId:    number
  clientName:  string
  amount:      number
  status:      QuoteStatus
  validUntil:  string | null
  notes:       string | null
  hasInvoice:  boolean
}

interface Props { initialQuotes: UIQuote[] }

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export default function QuotesPageContent({ initialQuotes }: Props) {
  /* ---------- state -------------------------------------------------- */
  const [rows, setRows]       = useState<UIQuote[]>(initialQuotes)
  const [search, setSearch]   = useState('')
  const [status, setStatus]   = useState<QuoteStatus | 'all'>('all')
  const [busy, setBusy]       = useState<number | null>(null)     // generic row-busy
  const [emailBusy, setEmailBusy] = useState<number | null>(null) // send-mail spinner
  useRoleRedirect(['admin', 'user']); 
  /* ---------- send-e-mail ------------------------------------------- */
  const sendEmail = async (qid: number) => {
    setEmailBusy(qid)
    try {
      // server route lives at /quotes/[id]/send (NOT under /api)
      const res = await fetch(`/quotes/${qid}/send`, { method: 'POST' })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Unknown error')
      }

      // reflect change immediately
      setRows(prev =>
        prev.map(r => (r.id === qid ? { ...r, status: 'sent' } : r)),
      )
      alert('Quote e-mailed 🎉')
    } catch (err) {
      alert(`Could not send e-mail: ${(err as Error).message}`)
    } finally {
      setEmailBusy(null)
    }
  }

  /* ---------- filter counts ----------------------------------------- */
  const counts = useMemo(() => ({
    all:       rows.length,
    draft:     rows.filter(r => r.status === 'draft').length,
    sent:      rows.filter(r => r.status === 'sent').length,
    accepted:  rows.filter(r => r.status === 'accepted').length,
    rejected:  rows.filter(r => r.status === 'rejected').length,
  }), [rows])

  /* ---------- derived list ------------------------------------------ */
  const list = useMemo(() => {
    let out = rows
    if (search.trim()) {
      const q = search.toLowerCase()
      out = out.filter(r =>
        r.id.toString().includes(q) ||
        r.clientName.toLowerCase().includes(q) ||
        (r.notes ?? '').toLowerCase().includes(q),
      )
    }
    if (status !== 'all') out = out.filter(r => r.status === status)
    return out
  }, [rows, search, status])

  /* ---------- mutate helpers ---------------------------------------- */
  const destroy = async (id: number) => {
    if (!confirm('Delete this quote?')) return
    setBusy(id)
    await quoteOperations.delete(id)
    setRows(prev => prev.filter(r => r.id !== id))
    setBusy(null)
  }

  const setStatusInline = async (id: number, s: QuoteStatus) => {
    setBusy(id)
    await quoteOperations.update(id, { status: s })
    setRows(prev => prev.map(r => (r.id === id ? { ...r, status: s } : r)))
    setBusy(null)
  }

  const createInvoice = async (id: number) => {
    setBusy(id)
    await quoteConversionOperations.convertQuoteToInvoice(id)
    setRows(prev => prev.map(r => (r.id === id ? { ...r, hasInvoice: true } : r)))
    setBusy(null)
  }

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <div className="fade-in">

      {/* header -------------------------------------------------------- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Quotes / Estimates ({counts.all})
        </h1>
        <Link href="/quotes/new" className="btn-primary inline-flex items-center">
          <PlusCircle size={20} className="mr-2" />
          New Quote
        </Link>
      </div>

      {/* filter bar ---------------------------------------------------- */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(['all','draft','sent','accepted','rejected'] as const).map(k => (
          <button
            key={k}
            onClick={() => setStatus(k)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              status === k
                ? 'bg-primary text-white'
                : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {k} ({counts[k]})
          </button>
        ))}
      </div>

      {/* search -------------------------------------------------------- */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          className="w-full pl-10 pr-3 py-2 border rounded-md"
          placeholder="Search quotes…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* table --------------------------------------------------------- */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['ID','Client','Amount','Status','Valid until','Notes','Actions']
                .map(h => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {h}
                  </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No quotes found.
                </td>
              </tr>
            )}

            {list.map(q => (
              <tr key={q.id} className="hover:bg-gray-50">
                {/* id, client, amount ----------------------------------- */}
                <td className="px-4 py-2">
                  <Link href={`/quotes/${q.id}`} className="text-primary hover:underline">
                    {q.id}
                  </Link>
                </td>
                <td className="px-4 py-2">{q.clientName}</td>
                <td className="px-4 py-2 font-semibold">
                  ${q.amount.toLocaleString()}
                </td>

                {/* status select ---------------------------------------- */}
                <td className="px-4 py-2">
                  <select
                    disabled={busy === q.id}
                    value={q.status}
                    onChange={e => setStatusInline(q.id, e.target.value as QuoteStatus)}
                    className="border rounded px-2 py-1 text-sm capitalize"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>

                {/* dates & notes ---------------------------------------- */}
                <td className="px-4 py-2 text-sm">
                  {q.validUntil ? new Date(q.validUntil).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-2 text-sm">{q.notes ?? '—'}</td>

                {/* actions ---------------------------------------------- */}
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    {/* edit */}
                    <Link
                      href={`/quotes/${q.id}/edit`}
                      className="text-yellow-600 hover:text-yellow-700"
                      title="Edit"
                    >
                      <Edit3 size={16} />
                    </Link>

                    {/* delete */}
                    <button
                      disabled={busy === q.id}
                      onClick={() => destroy(q.id)}
                      className="text-red-600 hover:text-red-700 disabled:opacity-40"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>

                    {/* send e-mail (only for drafts) */}
                    {q.status === 'draft' && (
                      <button
                        disabled={emailBusy === q.id}
                        onClick={() => sendEmail(q.id)}
                        className="text-blue-600 hover:text-blue-700 disabled:opacity-40"
                        title="Send to client"
                      >
                        {emailBusy === q.id
                          ? (
                            <span className="inline-block animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
                          ) : <Send size={16} />
                        }
                      </button>
                    )}

                    {/* create invoice (accepted & not yet invoiced) */}
                    {q.status === 'accepted' && !q.hasInvoice && (
                      <button
                        disabled={busy === q.id}
                        onClick={() => createInvoice(q.id)}
                        className="text-indigo-600 hover:text-indigo-700 disabled:opacity-40"
                        title="Create invoice"
                      >
                        <Send size={16} />
                      </button>
                    )}

                    {/* invoice marker */}
                    {q.hasInvoice && (
                      <span className="text-xs text-green-600">Invoice ✓</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
