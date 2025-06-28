import { supabase } from './supabase-client'
import { leadConversionOperations } from './lead-conversion'
import { quoteConversionOperations } from './quote-conversion'

export const reportingService = {
  async generateBusinessReport(startDate: Date, endDate: Date) {
    // Get all relevant data
    const [
      clients,
      jobs,
      quotes,
      invoices,
      leadStats,
      quoteStats
    ] = await Promise.all([
      // Get clients created in date range
      supabase
        .from('clients')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString()),
      
      // Get jobs in date range
      supabase
        .from('jobs')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString()),
      
      // Get quotes in date range
      supabase
        .from('quotes')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString()),
      
      // Get invoices in date range
      supabase
        .from('invoices')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString()),
      
      // Get lead conversion stats
      leadConversionOperations.getConversionStats(),
      
      // Get quote conversion stats
      quoteConversionOperations.getQuoteStats()
    ])

    // Ensure we have data
    if (!clients.data || !jobs.data || !quotes.data || !invoices.data) {
      throw new Error('Failed to fetch data for report')
    }

    // Calculate revenue metrics
    const totalRevenue = invoices.data.reduce((sum, invoice) => sum + invoice.amount, 0)
    const pendingRevenue = invoices.data
      .filter(invoice => invoice.status === 'sent' || invoice.status === 'draft')
      .reduce((sum, invoice) => sum + invoice.amount, 0)
    const paidRevenue = invoices.data
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.amount, 0)

    // Calculate job metrics
    const totalJobs = jobs.data.length
    const completedJobs = jobs.data.filter(job => job.status === 'completed').length
    const inProgressJobs = jobs.data.filter(job => job.status === 'in_progress').length
    const cancelledJobs = jobs.data.filter(job => job.status === 'cancelled').length

    // Calculate client metrics
    const totalClients = clients.data.length
    const activeClients = clients.data.filter(client => client.status === 'active').length

    return {
      period: {
        start: startDate,
        end: endDate
      },
      revenue: {
        total: totalRevenue,
        pending: pendingRevenue,
        paid: paidRevenue,
        collectionRate: totalRevenue > 0 ? (paidRevenue / totalRevenue) * 100 : 0
      },
      jobs: {
        total: totalJobs,
        completed: completedJobs,
        inProgress: inProgressJobs,
        cancelled: cancelledJobs,
        completionRate: totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0
      },
      clients: {
        total: totalClients,
        active: activeClients,
        retentionRate: totalClients > 0 ? (activeClients / totalClients) * 100 : 0
      },
      leads: leadStats,
      quotes: quoteStats,
      insights: {
        topPerformingClients: this.getTopPerformingClients(invoices.data),
        revenueTrend: this.calculateRevenueTrend(invoices.data),
        jobEfficiency: this.calculateJobEfficiency(jobs.data)
      }
    }
  },

  getTopPerformingClients(invoices: any[]) {
    const clientRevenue = invoices.reduce((acc, invoice) => {
      acc[invoice.client_id] = (acc[invoice.client_id] || 0) + invoice.amount
      return acc
    }, {} as Record<number, number>)

    return Object.entries(clientRevenue)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
  },

  calculateRevenueTrend(invoices: any[]) {
    // Group invoices by month
    const monthlyRevenue = invoices.reduce((acc, invoice) => {
      const month = new Date(invoice.created_at).toISOString().slice(0, 7)
      acc[month] = (acc[month] || 0) + invoice.amount
      return acc
    }, {} as Record<string, number>)

    return Object.entries(monthlyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({ month, amount }))
  },

  calculateJobEfficiency(jobs: any[]) {
    const completedJobs = jobs.filter(job => job.status === 'completed')
    const totalDuration = completedJobs.reduce((sum, job) => {
      const start = new Date(job.start_date)
      const end = new Date(job.end_date)
      return sum + (end.getTime() - start.getTime())
    }, 0)

    return {
      averageJobDuration: completedJobs.length > 0 
        ? totalDuration / completedJobs.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0,
      onTimeCompletion: completedJobs.filter(job => {
        const end = new Date(job.end_date)
        const completed = new Date(job.updated_at)
        return completed <= end
      }).length / completedJobs.length * 100
    }
  }
} 