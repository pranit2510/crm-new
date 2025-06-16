import { supabase } from './supabase'

export const calendarService = {
  async scheduleJob(jobId: number, startDate: Date, endDate: Date) {
    // Update job dates
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      })
      .eq('id', jobId)

    if (updateError) throw new Error(`Error scheduling job: ${updateError.message}`)

    // Get job details for calendar event
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*, clients(*)')
      .eq('id', jobId)
      .single()

    if (jobError) throw new Error(`Error fetching job details: ${jobError.message}`)

    // Create calendar event
    const calendarEvent = {
      title: job.title,
      description: job.description,
      start: startDate,
      end: endDate,
      client: job.clients.name,
      location: job.clients.address
    }

    // Create Google Calendar event
    try {
      const response = await fetch('/api/schedule-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: job.title,
          description: `${job.description}\n\nClient: ${job.clients.name}\nLocation: ${job.clients.address || job.service_address}`,
          start: startDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Calendar API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Google Calendar event created:', result);
    } catch (error) {
      console.error('Failed to create Google Calendar event:', error);
      // Don't throw error here to avoid breaking the job scheduling
    }

    return calendarEvent
  },

  async getUpcomingDeadlines() {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Get upcoming job deadlines
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*, clients(*)')
      .gte('end_date', now.toISOString())
      .lte('end_date', thirtyDaysFromNow.toISOString())
      .order('end_date', { ascending: true })

    if (jobsError) throw new Error(`Error fetching upcoming deadlines: ${jobsError.message}`)

    // Get upcoming invoice due dates
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('*, clients(*)')
      .gte('due_date', now.toISOString())
      .lte('due_date', thirtyDaysFromNow.toISOString())
      .order('due_date', { ascending: true })

    if (invoicesError) throw new Error(`Error fetching upcoming invoices: ${invoicesError.message}`)

    return {
      jobs: jobs.map(job => ({
        type: 'job',
        title: job.title,
        deadline: job.end_date,
        client: job.clients.name,
        status: job.status
      })),
      invoices: invoices.map(invoice => ({
        type: 'invoice',
        title: `Invoice #${invoice.id}`,
        deadline: invoice.due_date,
        client: invoice.clients.name,
        amount: invoice.amount,
        status: invoice.status
      }))
    }
  }
} 