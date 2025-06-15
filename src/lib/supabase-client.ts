import { supabase } from './supabase'
import type { Client, Job, Lead, Quote, Invoice } from './supabase'

// Client operations
export const clientOperations = {
  async create(client: Omit<Client, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Error creating client: ${error.message}`);
    }
    return data
  },

  async getAll() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: number, updates: Partial<Client>) {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Job operations
export const jobOperations = {
  async create(job: Omit<Job, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('jobs')
      .insert([job])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getAll() {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, clients(*)')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getByClientId(clientId: number) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async update(id: number, data: Partial<Job>) {
    const { data: updatedJob, error } = await supabase
      .from('jobs')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return updatedJob;
  }
}

// Lead operations
export const leadOperations = {
  async create(lead: Omit<Lead, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getAll() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async update(id: number, updates: Partial<Lead>) {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }
}

// Quote operations
export const quoteOperations = {
  async create(quote: Omit<Quote, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('quotes')
      .insert([quote])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getByClientId(clientId: number) {
    const { data, error } = await supabase
      .from('quotes')
      .select('*, clients(*)')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getAll() {
    const { data, error } = await supabase
      .from('quotes')
      .select('*, clients(*)')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async update(id: number, updates: Partial<Quote>) {
    const { data, error } = await supabase
      .from('quotes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
}

// Invoice operations
export const invoiceOperations = {
  async create(invoice: Omit<Invoice, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('invoices')
      .insert([invoice])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getByClientId(clientId: number) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getAll() {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, clients(*), jobs(*)')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async update(id: number, updates: Partial<Invoice>) {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async downloadPDF(invoiceId: number) {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*, clients(*), jobs(*)')
      .eq('id', invoiceId)
      .single()
    if (error) throw error
    if (!invoice) throw new Error('Invoice not found')
  
    const { jsPDF }   = await import('jspdf')
    const pdf         = new jsPDF()
    const container   = document.createElement('div')
    container.innerHTML = `
      <h1>Invoice #${invoice.id}</h1>
      <p><b>Client:</b> ${invoice.clients?.name ?? '—'}</p>
      <p><b>Amount:</b> $${invoice.amount.toFixed(2)}</p>
      <p><b>Due:</b>    ${invoice.due_date}</p>
      <p><b>Terms:</b>  ${invoice.payment_terms}</p>
      ${invoice.notes ? `<p><i>${invoice.notes}</i></p>` : ''}
    `
  
    await pdf.html(container)                // waits until rendered
    const blob = pdf.output('blob')
  
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `Invoice-${invoice.id}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  },  

  async send(id: number) {
    const res = await fetch(`/invoices/${id}/send`, { method: 'POST' })
    if (!res.ok) throw new Error((await res.json()).error ?? 'Send failed')
  },
  async delete(id: number) {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
  
  
  
}


// Helper function to generate PDF
async function generateInvoicePDF(invoice: any) {
  // For now, we'll create a simple PDF using the browser's built-in capabilities
  // In a production environment, you might want to use a proper PDF generation library
  const doc = document.createElement('div');
  doc.innerHTML = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1>Invoice #${invoice.id}</h1>
      <div style="margin: 20px 0;">
        <h2>Client Information</h2>
        <p>Name: ${invoice.clients?.name || 'N/A'}</p>
        <p>Job: ${invoice.jobs?.title || 'N/A'}</p>
      </div>
      <div style="margin: 20px 0;">
        <h2>Invoice Details</h2>
        <p>Amount: $${invoice.amount.toFixed(2)}</p>
        <p>Due Date: ${new Date(invoice.due_date).toLocaleDateString()}</p>
        <p>Payment Terms: ${invoice.payment_terms}</p>
      </div>
      <div style="margin: 20px 0;">
        <h2>Notes</h2>
        <p>${invoice.notes || 'No additional notes'}</p>
      </div>
    </div>
  `;

  // Convert the HTML to a PDF using html2pdf.js
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF();
  
  // Add the content to the PDF
  pdf.html(doc, {
    callback: function(pdf) {
      // Return the PDF as a blob
      return pdf.output('blob');
    },
    x: 10,
    y: 10
  });

  return pdf.output('blob');
}

// Add this type if not already present
export type Technician = {
  id: number
  created_at: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive'
  notes: string
}

// Add this object to your exports
export const technicianOperations = {
  async create(technician: Omit<Technician, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('technicians')
      .insert([technician])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async getAll() {
    const { data, error } = await supabase
      .from('technicians')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async delete(id: string) {
    const { error } = await supabase
      .from('technicians')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// Channel Report type
export type ChannelReport = {
  id: number;
  month: string;
  channel: string;
  cost: number;
  leads: number;
  jobs: number;
  revenue: number;
  close_rate: number;
  cost_per_lead: number;
  roi: number;
  created_at: string;
};

export const channelReportOperations = {
  async getByMonth(month: string) {
    const { data, error } = await supabase
      .from('channels_report')
      .select('*')
      .eq('month', month)
      .order('channel', { ascending: true });
    if (error) throw error;
    return data;
  },
  async create(report: Omit<ChannelReport, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('channels_report')
      .insert([report])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async update(id: number, updates: Partial<ChannelReport>) {
    const { data, error } = await supabase
      .from('channels_report')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async delete(id: number) {
    const { error } = await supabase
      .from('channels_report')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

export const leadConversionReportOperations = {
  async getByMonth(month: string) {
    // month format: 'YYYY-MM'
    const { data, error } = await supabase
      .from('leads')
      .select('source, status, id, created_at')
      .gte('created_at', `${month}-01`)
      .lt('created_at', `${month}-32`); // crude, but works for all months
    if (error) throw error;

    // Aggregate by source
    const summary: Record<string, { total: number; converted: number }> = {};
    data.forEach((lead: any) => {
      const src = lead.source || 'Unknown';
      if (!summary[src]) summary[src] = { total: 0, converted: 0 };
      summary[src].total += 1;
      if (lead.status === 'qualified' || lead.status === 'converted' || lead.status === 'client') {
        summary[src].converted += 1;
      }
    });
    // Convert to array for chart
    return Object.entries(summary).map(([source, { total, converted }]) => ({
      source,
      total,
      converted,
      conversionRate: total > 0 ? (converted / total) * 100 : 0,
    }));
  }
};

export const companyProfileOperations = {
  async get() {
    const { data, error } = await supabase
      .from('company_profile')
      .select('*')
      .maybeSingle();
    if (error) throw error;
    return data;
  },
  async upsert(profile: any) {
    const { data, error } = await supabase
      .from('company_profile')
      .upsert([profile], { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}; 