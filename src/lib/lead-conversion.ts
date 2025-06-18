import { supabase } from './supabase'
import { clientOperations } from './supabase-client'
import type { Client } from './supabase-types'

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
  source: string;
  estimated_value: number;
  assigned_to: string;
  status: string;
}

interface ConversionStats {
  total: number;
  converted: number;
  new: number;
  contacted: number;
  qualified: number;
  lost: number;
  conversionRate: number;
}

export const leadConversionOperations = {
  async convertLeadToClient(leadId: number): Promise<Client> {
    // Get the lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (leadError) throw new Error(`Error fetching lead: ${leadError.message}`)
    if (!lead) throw new Error('Lead not found')

    // Create new client from lead data, include lead_id
    const newClient: Omit<Client, 'id' | 'created_at'> & { lead_id: number } = {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      notes: `Converted from lead. Source: ${lead.source}. Original notes: ${lead.notes}`,
      address: '',
      status: 'active',
      estimated_value: lead.estimated_value,
      source: lead.source,
      assigned_to: lead.assigned_to,
      lead_id: lead.id
    }

    // Create the client
    const client = await clientOperations.create(newClient)

    // Update lead status to 'converted'
    const { error: updateError } = await supabase
      .from('leads')
      .update({ status: 'converted' })
      .eq('id', leadId)

    if (updateError) throw new Error(`Error updating lead status: ${updateError.message}`)

    return client
  },

  async deleteClientByLeadId(leadId: number): Promise<void> {
    // Find the client with this lead_id
    const { data: client, error } = await supabase
      .from('clients')
      .select('id')
      .eq('lead_id', leadId)
      .single()
    if (error && error.code !== 'PGRST116') throw error; // PGRST116: No rows found
    if (client) {
      await clientOperations.delete(client.id)
    }
  },

  async getConversionStats(): Promise<ConversionStats> {
    const { data, error } = await supabase
      .from('leads')
      .select('status')
    
    if (error) throw new Error(`Error fetching conversion stats: ${error.message}`)

    const stats = {
      total: data.length,
      converted: data.filter(lead => lead.status === 'converted').length,
      new: data.filter(lead => lead.status === 'new').length,
      contacted: data.filter(lead => lead.status === 'contacted').length,
      qualified: data.filter(lead => lead.status === 'qualified').length,
      lost: data.filter(lead => lead.status === 'lost').length
    }

    return {
      ...stats,
      conversionRate: stats.total > 0 ? (stats.converted / stats.total) * 100 : 0
    }
  }
} 