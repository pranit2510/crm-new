/* ------------------------------------------------------------ */
/*  src/app/invoices/new/page.tsx – Create-Invoice (Client)     */
/* ------------------------------------------------------------ */
'use client'

import { useState, useEffect, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link  from 'next/link'
import {
  ArrowLeft, PlusCircle, Package, Trash2,
} from 'lucide-react'

import { invoiceOperations, clientOperations } from '@/lib/supabase-client'
import type { Invoice } from '@/lib/supabase-types'          // generated types

/* ---------------- types & helpers -------------------------- */
type NewInvoice = Omit<Invoice, 'id' | 'created_at'>

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

const emptyItem = (): LineItem => ({
  id: crypto.randomUUID(),
  description: '',
  quantity: 1,
  unitPrice: 0,
})

/* ---------------- form component --------------------------- */
function InvoiceForm () {
  const router            = useRouter()
  const params            = useSearchParams()
  const jobIdFromQuery    = params.get('jobId') || ''
  const quoteIdFromQuery  = params.get('quoteId') || ''

  /* clients -------------------------------------------------- */
  const [clients,   setClients] = useState<any[]>([])
  const [clientId,  setClient]  = useState('')

  useEffect(() => {
    clientOperations.getAll().then(c => setClients(c ?? []))
  }, [])

  /* invoice basics ------------------------------------------- */
  const today = new Date().toISOString().slice(0,10)
  const plus30 = () => {
    const d = new Date(); d.setDate(d.getDate() + 30)
    return d.toISOString().slice(0,10)
  }

  const [invoiceDate] = useState(today)
  const [dueDate, setDue] = useState(plus30)
  const [lineItems, setItems] = useState<LineItem[]>([emptyItem()])
  const [paymentTerms, setTerms] = useState('Payment due within 30 days.')
  const [notes, setNotes] = useState('')

  /* sums ----------------------------------------------------- */
  const subTotal   = lineItems.reduce((s,i)=>s+i.quantity*i.unitPrice, 0)
  const grandTotal = subTotal                              // (no tax field)

  /* ui handlers --------------------------------------------- */
  const addItem    = () => setItems([...lineItems, emptyItem()])
  const rmItem     = (id:string) =>
    setItems(lineItems.filter(i => i.id !== id))
  const chgItem    = (id:string,f:keyof LineItem,v:any)=>
    setItems(li => li.map(i => i.id===id ? {...i,[f]:f==='description'?v:+v} : i))

  /* ------------- submit: always create a DRAFT -------------- */
  const save = async (e: FormEvent) => {
    e.preventDefault()

    const payload = {
      client_id     : Number(clientId),
      amount        : grandTotal,
      status        : 'draft',          // always create drafts first
      due_date      : dueDate,
      payment_terms : paymentTerms,
      notes,
    } satisfies Partial<NewInvoice>   
    

    try {
      await invoiceOperations.create(payload as NewInvoice)
      router.push('/invoices')
    } catch (err) {
      alert('Could not create invoice – see console')
      console.error(err)
    }
  }

  /* ------------- JSX --------------------------------------- */
  return (
    <form onSubmit={save} className="bg-white p-6 sm:p-8 rounded-lg shadow space-y-8">
      {/* client + dates */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <label className="form-label">Client</label>
          <select required className="default-select"
                  value={clientId} onChange={e=>setClient(e.target.value)}>
            <option value="" disabled>Select…</option>
            {clients.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Invoice&nbsp;Date</label>
          <input type="date" className="default-input" value={invoiceDate} disabled />
        </div>
        <div>
          <label className="form-label">Due&nbsp;Date</label>
          <input type="date" className="default-input" value={dueDate}
                 onChange={e=>setDue(e.target.value)} required/>
        </div>
      </div>

      {/* line items */}
      <section>
        <h2 className="text-lg font-semibold flex items-center">
          <Package size={18} className="mr-2 text-primary"/>Line&nbsp;Items
        </h2>

        {lineItems.map((it,idx)=>(
          <div key={it.id}
               className="grid grid-cols-12 gap-3 items-center mt-3 bg-gray-50 p-3 rounded">
            <input className="col-span-7 default-input"
                   placeholder="Description"
                   value={it.description}
                   onChange={e=>chgItem(it.id,'description',e.target.value)} />
            <input className="col-span-2 default-input text-right"
            placeholder="Quantity"
                   type="number" min={0}
                   value={it.quantity || ''}
                   onChange={e=>chgItem(it.id,'quantity',e.target.value ? +e.target.value : 0)} />
            <input className="col-span-2 default-input text-right"
            placeholder="Unit price"
                   type="number" step="0.01" min={0}
                   value={it.unitPrice || ''}
                   onChange={e=>chgItem(it.id,'unitPrice',e.target.value ? +e.target.value : 0)} />
            {idx>0 && (
              <button type="button" onClick={()=>rmItem(it.id)}
                      className="col-span-1 text-red-600 hover:text-red-800">
                <Trash2 size={16}/>
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addItem} className="btn-secondary mt-4">
          <PlusCircle size={16} className="mr-1.5"/> Add line
        </button>
      </section>

      {/* totals preview */}
      <div className="text-right space-y-1 pt-6 border-t">
        <div className="text-gray-600">Subtotal: <b>${subTotal.toFixed(2)}</b></div>
        <div className="text-lg font-bold">Total: ${grandTotal.toFixed(2)}</div>
      </div>

      {/* terms / notes */}
      <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t">
        <div>
          <label className="form-label">Payment terms</label>
          <textarea rows={4} className="default-textarea"
                    value={paymentTerms} onChange={e=>setTerms(e.target.value)}/>
        </div>
        <div>
          <label className="form-label">Internal notes</label>
          <textarea rows={4} className="default-textarea"
                    value={notes} onChange={e=>setNotes(e.target.value)}/>
        </div>
      </div>

      {/* single action -------------------------------------------------- */}
      <div className="flex justify-end border-t pt-6">
        <button type="submit" className="btn-primary">
          Create&nbsp;Invoice
        </button>
      </div>
    </form>
  )
}

/* ---------------- wrapper (Suspense) ----------------------- */
export default function NewInvoice () {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <PlusCircle className="h-8 w-8 mr-3 text-primary"/>Create&nbsp;Invoice
        </h1>

        <Link href="/invoices" className="btn-secondary btn-sm">
          <ArrowLeft size={16} className="mr-1.5"/> Back
        </Link>
      </div>
      <InvoiceForm/>
    </Suspense>
  )
}
