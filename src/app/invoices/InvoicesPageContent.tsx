'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  PlusCircle, Search, Send, Edit3, Trash2, Download, Eye, DollarSign, Clock, FileText,
} from 'lucide-react'
import {
    invoiceOperations,          // now has .delete  .update  .downloadPDF  .send
  } from '@/lib/supabase-client'
  
import { quoteConversionOperations } from '@/lib/quote-conversion'
import { useRoleRedirect } from '@/lib/hooks/useRoleRedirect';
  
import SkeletonLoader               from '@/components/ui/SkeletonLoader'
import { invoiceStages }            from '@/lib/flowStates'

/* ---------- types -------------------------------------------------- */
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

interface UIInvoice {
  id:           number
  amount:       number
  status:       InvoiceStatus
  invoiceDate:  string
  dueDate:      string
  notes:        string | null
  client:       { id: number;  name: string }
  job?:         { id: number;  title: string | null }
  quote?:       { id: number }
  paidAmount?:  number | null
  overdueDays?: number | null
}

/* ---------- props -------------------------------------------------- */
export default function InvoicesPageContent(
  { initialInvoices }: { initialInvoices: any[] }    // raw from Supabase
) {
  /* map SQL ➝ UI once (no extra network on the client!) -------------- */
  const [rows, setRows] = useState<UIInvoice[]>(() =>
    initialInvoices.map(inv => ({
      id:          inv.id,
      amount:      inv.amount,
      status:      inv.status as InvoiceStatus,
      invoiceDate: inv.invoice_date,
      dueDate:     inv.due_date,
      notes:       inv.payment_terms,
      client:      { id: inv.clients?.id, name: inv.clients?.name ?? '—' },
      job:         inv.jobs   ? { id: inv.jobs.id,   title: inv.jobs.title } : undefined,
      quote:       inv.quotes ? { id: inv.quotes.id }                         : undefined,
      paidAmount:  inv.paid_amount,
      overdueDays: inv.overdue_days,
    })),
  )

  const [search,  setSearch]  = useState('')
  const [status,  setStatus]  = useState<InvoiceStatus | 'all'>('all')
  const [overdue, setOverdue] = useState<'all' | 'overdue' | 'not'>('all')
  const [busy,    setBusy]    = useState<number | null>(null)
  useRoleRedirect(['admin', 'user']); 
  // top-level inside the component
  const sendMail = async (id: number) => {
    setBusy(id)
    try {
      await invoiceOperations.send(id)
      alert('Invoice e-mailed 🎉')
      setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'sent' } : r))
    } catch (err:any) {
      alert(err.message ?? 'Could not send')
    }
    finally {
        /* 4 — always re-enable the dropdown */
        setBusy(null)
      }
  }
  

  /* ---------- derived helpers -------------------------------------- */
  const counts = useMemo(() => ({
    all     : rows.length,
    draft   : rows.filter(r => r.status === 'draft').length,
    sent    : rows.filter(r => r.status === 'sent').length,
    paid    : rows.filter(r => r.status === 'paid').length,
    overdue : rows.filter(r => r.status === 'overdue').length,
  }), [rows])

  const list = useMemo(() => {
    let out = rows
    if (search.trim()) {
      const q = search.toLowerCase()
      out = out.filter(r =>
        r.id.toString().includes(q) ||
        r.client.name.toLowerCase().includes(q) ||
        (r.job?.title ?? '').toLowerCase().includes(q),
      )
    }
    if (status  !== 'all')      out = out.filter(r => r.status === status)
    if (overdue !== 'all')      out = out.filter(r =>
      overdue === 'overdue' ? r.status === 'overdue' : r.status !== 'overdue',
    )
    return out
  }, [rows, search, status, overdue])

  /* ---------- mutations -------------------------------------------- */
  const destroy = async (id: number) => {
    if (!confirm('Delete this invoice?')) return
    // optimistic removal
    setRows(prev => prev.filter(r => r.id !== id))
    try   { await invoiceOperations.delete(id) }
    catch (err:any) {
      alert(err.message ?? 'Could not delete');          // roll-back
      await refreshFromServer()                          // helper below
    }
  }
  const setStatusInline = async (id: number, newStatus: InvoiceStatus) => {
    /* 1 — immediate UI feedback */
    setRows(prev => prev.map(r =>
      r.id === id ? { ...r, status: newStatus } : r
    ))
  
    /* 2 — mark row as “busy” */
    setBusy(id)
    try {
      await invoiceOperations.update(id, { status: newStatus })
    } catch (err) {
      /* 3 — roll-back on failure */
      alert('Could not save status')
      await refreshFromServer()          // reload a fresh list
    } finally {
      /* 4 — always re-enable the dropdown */
      setBusy(null)
    }
  }
  

  const refreshFromServer = async () => {
    const fresh = await invoiceOperations.getAll()      // <- already exported
    setRows(fresh.map(inv => ({
      id: inv.id,
      amount: inv.amount,
      status: inv.status,
      invoiceDate: inv.invoice_date,
      dueDate: inv.due_date,
      notes: inv.payment_terms,
      client: { id: inv.clients?.id, name: inv.clients?.name ?? '—' },
      job  : inv.jobs ? { id: inv.jobs.id, title: inv.jobs.title } : undefined,
      quote: inv.quotes ? { id: inv.quotes.id } : undefined,
      paidAmount : inv.paid_amount,
      overdueDays: inv.overdue_days,
    })))
  }
  

  
    

  /* ---------- totals for insight panel ----------------------------- */
  const totalPaid       = rows.filter(r => r.status === 'paid')
                              .reduce((s, r) => s + (r.amount ?? 0), 0)
                                                     
  const totalOutstanding= rows.filter(r => !['paid','draft'].includes(r.status))
                              .reduce((s, r) => s + r.amount, 0)
  const totalOverdue    = rows.filter(r => r.status === 'overdue')
                              .reduce((s, r) => s + r.amount, 0)

  /* ---------- UI --------------------------------------------------- */
  return (
    <div className="fade-in">

      {/* header ------------------------------------------------------ */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <FileText className="h-8 w-8 text-primary mr-3" />
          Invoices / Billing ({counts.all})
        </h1>
        <Link href="/invoices/new" className="btn-primary inline-flex items-center">
          <PlusCircle size={20} className="mr-2" /> New Invoice
        </Link>
      </div>

      {/* filter bar -------------------------------------------------- */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(['all','draft','sent','paid','overdue'] as const).map(k => (
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

      {/* search + overdue filter ------------------------------------ */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          className="w-full pl-10 pr-3 py-2 border rounded-md"
          placeholder="Search invoices…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          value={overdue}
          onChange={e => setOverdue(e.target.value as any)}
          className="absolute right-0 top-0 h-full px-3 border-l bg-white text-sm"
        >
          <option value="all">All</option>
          <option value="overdue">Overdue</option>
          <option value="not">Not overdue</option>
        </select>
      </div>

      {/* table ------------------------------------------------------- */}
      {rows.length === 0 ? (
        <SkeletonLoader variant="table" />
      ) : (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['ID','Client / Job','Amount','Status','Due','Terms','Actions']
                  .map(h => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                  ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {list.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  {/* id */}
                  <td className="px-4 py-2">
                    <Link href={`/invoices/${inv.id}`} className="text-primary hover:underline">
                      {inv.id}
                    </Link>
                    {inv.quote && (
                      <div className="text-xs text-gray-500">
                        from&nbsp;Q{inv.quote.id}
                      </div>
                    )}
                  </td>

                  {/* client / job */}
                  <td className="px-4 py-2">
                    <Link
                      href={`/clients/${inv.client.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {inv.client.name}
                    </Link>
                    {inv.job?.title && (
                      <div className="text-xs text-gray-500 max-w-xs truncate">
                        Job: {inv.job.title}
                      </div>
                    )}
                  </td>

                  {/* amount */}
                  <td className="px-4 py-2 font-semibold">
                    ${inv.amount.toLocaleString()}
                    {inv.paidAmount && (
                      <div className="text-xs text-green-600">
                        Paid ${inv.paidAmount.toLocaleString()}
                      </div>
                    )}
                  </td>

                  {/* status */}
                  <td className="px-4 py-2">
                    <select
                      disabled={busy === inv.id}
                      value={inv.status}
                      onChange={e => setStatusInline(inv.id, e.target.value as InvoiceStatus)}
                      className="border rounded px-2 py-1 text-sm capitalize"
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                    {inv.overdueDays && (
                      <div className="text-xs text-red-600 flex items-center mt-1">
                        <Clock size={12} className="mr-1" />
                        {inv.overdueDays} d overdue
                      </div>
                    )}
                  </td>

                  {/* due & issued */}
                  <td className="px-4 py-2 text-sm">
                    {inv.dueDate}
                    <div className="text-xs text-gray-500">
                      Issued&nbsp;{inv.invoiceDate}
                    </div>
                  </td>

                  {/* terms */}
                  <td className="px-4 py-2 text-sm">{inv.notes ?? '—'}</td>

                  {/* actions */}
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/invoices/${inv.id}/edit`}
                        className="text-blue-600 hover:text-blue-700"
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </Link>

                      <button
                        disabled={busy === inv.id}
                        onClick={() => destroy(inv.id)}
                        className="text-red-600 hover:text-red-700 disabled:opacity-40"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>

                      {inv.status === 'draft' && (
                        <button
                        disabled={busy === inv.id}
                        onClick={() => sendMail(inv.id)}
                        className="text-blue-600 hover:text-blue-700 disabled:opacity-40"
                            title="Send by e-mail"
                            >
      <Send size={16} />
    </button>
                      )}

                      <button
                        className="text-blue-600 hover:text-blue-700"
                        title="Download PDF"
                        onClick={() => invoiceOperations.downloadPDF(inv.id)}
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* insights panel ------------------------------------------------ */}
      <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-6 border border-emerald-200">
        <h3 className="text-lg font-semibold flex items-center mb-4">
          <DollarSign className="h-5 w-5 mr-2 text-emerald-500" />
          Invoice Flow Insights
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { value: `$${totalPaid.toLocaleString()}`,   label: 'Total Paid',       extra: `${counts.paid} paid` },
            { value: `$${totalOutstanding.toLocaleString()}`, label: 'Outstanding',   extra: '' },
            { value: `$${totalOverdue.toLocaleString()}`,     label: 'Overdue',       extra: `${counts.overdue} overdue` },
            { value: counts.draft,                      label: 'Drafts',        extra: 'Ready to send' },
          ].map(b => (
            <div key={b.label} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold">{b.value}</div>
              <div className="text-sm text-gray-600">{b.label}</div>
              {b.extra && <div className="text-xs text-gray-500 mt-1">{b.extra}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
