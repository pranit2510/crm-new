/* ------------------------------------------------------------------ */
/*  src/app/payments/PaymentsPageContent.tsx – COMPLETE VERSION      */
/* ------------------------------------------------------------------ */
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  PlusCircle, Search, Send, Trash2, Copy, Check, DollarSign, MessageSquare,
} from 'lucide-react'
import { paymentOperations } from '@/lib/supabase-client'
import { useRoleRedirect } from '@/lib/hooks/useRoleRedirect'
import SkeletonLoader from '@/components/ui/SkeletonLoader'

export type PaymentStatus = 'draft' | 'sent' | 'paid' | 'cancelled'

interface UIPayment {
  id: number
  amount: number
  status: PaymentStatus
  description: string | null
  client: { id:number; name:string }
  paymentUrl?: string | null
  createdAt: string
}

interface SquarePayment {
  id: string
  status: string
  amount_money?: { amount: number; currency: string }
  created_at: string
  receipt_url?: string
}

export default function PaymentsPageContent({ initialPayments, squarePayments }: { initialPayments: any[]; squarePayments: SquarePayment[] }) {
  const [rows, setRows] = useState<UIPayment[]>(() =>
    initialPayments.map(p => ({
      id: p.id,
      amount: p.amount,
      status: p.status,
      description: p.description,
      client: { id: p.clients?.id, name: p.clients?.name ?? '—' },
      paymentUrl: p.payment_url,
      createdAt: p.created_at,
    }))
  )

  const [tab, setTab] = useState<'internal' | 'square'>('internal')

  /* ---------- filters / search ---------------------------------- */
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PaymentStatus | 'all'>('all')
  const [busy, setBusy] = useState<number | null>(null)
  const [copied, setCopied] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  useRoleRedirect(['admin', 'user'])

  const counts = useMemo(() => ({
    all: rows.length,
    draft: rows.filter(r => r.status === 'draft').length,
    sent: rows.filter(r => r.status === 'sent').length,
    paid: rows.filter(r => r.status === 'paid').length,
    cancelled: rows.filter(r => r.status === 'cancelled').length,
  }), [rows])

  const list = useMemo(() => {
    let out = [...rows]
    if (search.trim()) {
      const q = search.toLowerCase()
      out = out.filter(r =>
        r.id.toString().includes(q) ||
        r.client.name.toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q),
      )
    }
    if (status !== 'all') out = out.filter(r => r.status === status)
    return out
  }, [rows, search, status])

  /* ---------- internal actions ---------------------------------- */
  const copyLink = async (p: UIPayment) => {
    if (!p.paymentUrl) return alert('No payment link')
    await navigator.clipboard.writeText(p.paymentUrl)
    setCopied(p.id); setTimeout(() => setCopied(null), 2000)
  }

  const sendMail = async (id: number) => {
    setBusy(id)
    try {
      await paymentOperations.sendMail(id)
      alert('Link emailed')
      setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'sent' } : r))
    } catch (e: any) {
      alert(e.message ?? 'Send fail')
    } finally { setBusy(null) }
  }

  const sendSMS = async (id: number) => {
    setBusy(id)
    try { await paymentOperations.sendSMS(id); alert('SMS sent') }
    catch (e: any) { alert(e.message ?? 'SMS fail') }
    finally { setBusy(null) }
  }

  const destroy = async (id: number) => {
    if (!confirm('Delete?')) return
    setRows(prev => prev.filter(r => r.id !== id))
    try { await paymentOperations.delete(id) }
    catch (e: any) { alert(e.message) }
  }

  /* ---------- render -------------------------------------------- */
  return (
    <div className="fade-in">
      {/* header -------------------------------------------------- */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center mr-auto">
          <DollarSign className="h-8 w-8 text-primary mr-3" /> Payments
        </h1>
        <button onClick={() => setTab('internal')} className={`px-4 py-1 rounded-lg ${tab==='internal'?'bg-primary text-white':'bg-gray-200'}`}>My DB</button>
        <button onClick={() => setTab('square')} className={`px-4 py-1 rounded-lg ${tab==='square'?'bg-primary text-white':'bg-gray-200'}`}>Square API</button>
        {tab==='internal' && (
          <Link href="/payments/new" className="btn-primary inline-flex items-center ml-4">
            <PlusCircle size={20} className="mr-2"/> New Payment
          </Link>
        )}
      </div>

      {/* tab content --------------------------------------------- */}
      {tab==='square' ? (
        <SquarePaymentsTable rows={squarePayments} />
      ) : (
        <>
          {/* filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            {(['all','draft','sent','paid','cancelled'] as const).map(k => (
              <button key={k} onClick={() => setStatus(k)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${status===k?'bg-primary text-white':'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
              >{k} ({counts[k]})</button>
            ))}
          </div>
          {/* search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
            <input className="w-full pl-10 pr-3 py-2 border rounded-md" placeholder="Search payments…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          {/* table */}
          {isLoading ? <SkeletonLoader variant="table"/> : list.length===0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">No payments found</div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>{['ID','Client','Amount','Status','Created','Actions'].map(h=>
                    <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                  )}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {list.map(p=>
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2"><Link href={`/payments/${p.id}`} className="text-primary hover:underline">{p.id}</Link></td>
                      <td className="px-4 py-2"><Link href={`/clients/${p.client.id}`} className="font-medium hover:text-primary">{p.client.name}</Link></td>
                      <td className="px-4 py-2 font-semibold">${p.amount.toLocaleString()}</td>
                      <td className="px-4 py-2 capitalize">{p.status}</td>
                      <td className="px-4 py-2 text-sm">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          {p.paymentUrl && <Link href={p.paymentUrl} target="_blank" className="text-primary underline text-sm">View</Link>}
                          <button onClick={() => copyLink(p)} className="text-gray-600 hover:text-gray-800" title="Copy link">{copied===p.id?<Check size={16}/>:<Copy size={16}/>}</button>
                          {['draft','sent'].includes(p.status) && (
                            <>
                              <button disabled={busy===p.id} onClick={() => sendMail(p.id)} className="text-blue-600 hover:text-blue-700 disabled:opacity-40" title="Send e-mail"><Send size={16}/></button>
                              <button disabled={busy===p.id} onClick={() => sendSMS(p.id)} className="text-green-600 hover:text-green-700 disabled:opacity-40" title="Send SMS"><MessageSquare size={16}/></button>
                              <button disabled={busy===p.id} onClick={() => destroy(p.id)} className="text-red-600 hover:text-red-700 disabled:opacity-40" title="Delete"><Trash2 size={16}/></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ---------- Square Payments Table Component ------------------------ */

function SquarePaymentsTable({ rows }: { rows: SquarePayment[] }) {
  return (
    <div className="bg-white shadow rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>{['ID','Amount','Status','Created','Receipt'].map(h =>
            <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
          )}</tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map(row => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-sm">{row.id.slice(0, 6)}…</td>
              <td className="px-4 py-2 font-semibold">
                ${((Number(row.amount_money?.amount ?? 0) / 100).toFixed(2))}
              </td>
              <td className="px-4 py-2 capitalize">{row.status.toLowerCase()}</td>
              <td className="px-4 py-2 text-sm">{new Date(row.created_at).toLocaleDateString()}</td>
              <td className="px-4 py-2">
                {row.receipt_url ? (
                  <Link href={row.receipt_url} target="_blank" className="text-primary hover:underline text-sm">View</Link>
                ) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
