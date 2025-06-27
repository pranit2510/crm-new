'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Save, FileText, Package, Trash2, PlusCircle
} from 'lucide-react'

import { invoiceOperations, clientOperations } from '@/lib/supabase-client'
import type { Invoice } from '@/lib/supabase-types'
import { useRoleRedirect } from '@/lib/hooks/useRoleRedirect'

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

export default function EditInvoicePage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = Number(params?.id)
  
  // Auth check
  useRoleRedirect(['admin', 'user'])
  
  // State
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [clientId, setClientId] = useState<number>(0)
  const [amount, setAmount] = useState<number>(0)
  const [status, setStatus] = useState<'draft' | 'sent' | 'paid' | 'overdue'>('draft')
  const [dueDate, setDueDate] = useState<string>('')
  const [paymentTerms, setPaymentTerms] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [lineItems, setLineItems] = useState<LineItem[]>([emptyItem()])

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        
        // Load clients and invoice data in parallel
        const [clientsData, invoicesData] = await Promise.all([
          clientOperations.getAll(),
          invoiceOperations.getAll()
        ])
        
        setClients(clientsData || [])
        
        // Find the specific invoice
        const foundInvoice = invoicesData?.find((inv: any) => inv.id === invoiceId)
        if (!foundInvoice) {
          setError('Invoice not found')
          return
        }
        
        setInvoice(foundInvoice)
        
        // Populate form fields
        setClientId(foundInvoice.client_id)
        setAmount(foundInvoice.amount)
        setStatus(foundInvoice.status)
        setDueDate(foundInvoice.due_date?.split('T')[0] || '')
        setPaymentTerms(foundInvoice.payment_terms || '')
        setNotes(foundInvoice.notes || '')
        
        // Initialize line items based on amount (simplified)
        if (foundInvoice.amount > 0) {
          setLineItems([{
            id: crypto.randomUUID(),
            description: 'Service rendered',
            quantity: 1,
            unitPrice: foundInvoice.amount
          }])
        }
        
      } catch (err: any) {
        setError(err.message || 'Failed to load invoice')
      } finally {
        setLoading(false)
      }
    }
    
    if (invoiceId) {
      loadData()
    }
  }, [invoiceId])

  // Line item handlers
  const addItem = () => setLineItems([...lineItems, emptyItem()])
  const removeItem = (id: string) => setLineItems(lineItems.filter(i => i.id !== id))
  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(items => items.map(item => 
      item.id === id 
        ? { ...item, [field]: field === 'description' ? value : Number(value) || 0 }
        : item
    ))
  }

  // Calculate totals
  const subTotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const grandTotal = subTotal

  // Update amount when line items change
  useEffect(() => {
    setAmount(grandTotal)
  }, [grandTotal])

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!clientId) {
      setError('Please select a client')
      return
    }
    
    setSaving(true)
    setError(null)
    
    try {
      const updateData = {
        client_id: clientId,
        amount: grandTotal,
        status,
        due_date: dueDate,
        payment_terms: paymentTerms,
        notes,
      }
      
      await invoiceOperations.update(invoiceId, updateData)
      router.push('/invoices')
    } catch (err: any) {
      setError(err.message || 'Failed to update invoice')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    )
  }

  if (error && !invoice) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    )
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <FileText className="h-8 w-8 text-primary mr-3" />
          Edit Invoice #{invoiceId}
        </h1>
        <Link href="/invoices" className="btn-secondary btn-sm">
          <ArrowLeft size={16} className="mr-1.5" /> Back to Invoices
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-lg shadow space-y-8">
        {/* Client + Status + Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="form-label">Client</label>
            <select 
              required 
              className="default-select"
              value={clientId} 
              onChange={e => setClientId(Number(e.target.value))}
            >
              <option value={0} disabled>Select client...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="form-label">Status</label>
            <select 
              className="default-select"
              value={status}
              onChange={e => setStatus(e.target.value as any)}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">Due Date</label>
            <input 
              type="date" 
              className="default-input" 
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Line Items */}
        <section>
          <h2 className="text-lg font-semibold flex items-center mb-4">
            <Package size={18} className="mr-2 text-primary" />
            Line Items
          </h2>

          {lineItems.map((item, idx) => (
            <div key={item.id} className="grid grid-cols-12 gap-3 items-center mt-3 bg-gray-50 p-3 rounded">
              <input 
                className="col-span-7 default-input"
                placeholder="Description"
                value={item.description}
                onChange={e => updateItem(item.id, 'description', e.target.value)}
              />
              <input 
                className="col-span-2 default-input text-right"
                placeholder="Qty"
                type="number" 
                min={0}
                value={item.quantity}
                onChange={e => updateItem(item.id, 'quantity', e.target.value)}
              />
              <input 
                className="col-span-2 default-input text-right"
                placeholder="Unit Price"
                type="number" 
                step="0.01" 
                min={0}
                value={item.unitPrice}
                onChange={e => updateItem(item.id, 'unitPrice', e.target.value)}
              />
              {idx > 0 && (
                <button 
                  type="button" 
                  onClick={() => removeItem(item.id)}
                  className="col-span-1 text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          
          <button 
            type="button" 
            onClick={addItem} 
            className="btn-secondary mt-4"
          >
            <PlusCircle size={16} className="mr-1.5" /> Add Line Item
          </button>
        </section>

        {/* Totals */}
        <div className="text-right space-y-1 pt-6 border-t">
          <div className="text-gray-600">Subtotal: <b>${subTotal.toFixed(2)}</b></div>
          <div className="text-lg font-bold">Total: ${grandTotal.toFixed(2)}</div>
        </div>

        {/* Terms & Notes */}
        <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t">
          <div>
            <label className="form-label">Payment Terms</label>
            <textarea 
              rows={4} 
              className="default-textarea"
              value={paymentTerms} 
              onChange={e => setPaymentTerms(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Internal Notes</label>
            <textarea 
              rows={4} 
              className="default-textarea"
              value={notes} 
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end border-t pt-6">
          <button 
            type="submit" 
            disabled={saving}
            className="btn-primary"
          >
            <Save size={18} className="mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        
        {error && (
          <div className="text-red-600 text-right font-medium mt-2">
            {error}
          </div>
        )}
      </form>
    </div>
  )
} 