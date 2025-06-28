import { supabase } from './supabase-client'
import { invoiceOperations } from './supabase-client'
import type { Invoice } from './supabase-types'

export const quoteConversionOperations = {
  async convertQuoteToInvoice(quoteId: number): Promise<Invoice> {
    // Get the quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single()

    if (quoteError) throw new Error(`Error fetching quote: ${quoteError.message}`)
    if (!quote) throw new Error('Quote not found')

    // Create new invoice from quote data
    const newInvoice: Omit<Invoice, 'id' | 'created_at'> = {
      client_id: quote.client_id,
      job_id: quote.job_id,
      quote_id: quote.id,
      amount: quote.amount,
      status: 'draft',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      payment_terms: quote.terms || 'Net 30',
      notes: `Generated from quote #${quote.id}. Original notes: ${quote.notes}`
    }

    // Create the invoice
    const invoice = await invoiceOperations.create(newInvoice)

    // Update quote status to 'accepted'
    const { error: updateError } = await supabase
      .from('quotes')
      .update({ status: 'accepted' })
      .eq('id', quoteId)

    if (updateError) throw new Error(`Error updating quote status: ${updateError.message}`)

    return invoice
  },

  async getQuoteStats() {
    const { data, error } = await supabase
      .from('quotes')
      .select('status')
    
    if (error) throw new Error(`Error fetching quote stats: ${error.message}`)

    const stats = {
      total: data.length,
      draft: data.filter(quote => quote.status === 'draft').length,
      sent: data.filter(quote => quote.status === 'sent').length,
      accepted: data.filter(quote => quote.status === 'accepted').length,
      rejected: data.filter(quote => quote.status === 'rejected').length
    }

    return {
      ...stats,
      acceptanceRate: stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0
    }
  }
} 