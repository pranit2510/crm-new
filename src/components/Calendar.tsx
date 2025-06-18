"use client";

import { useState, useEffect } from 'react'
import { calendarService } from '@/lib/calendar-service'
import { jobOperations } from '@/lib/supabase-client'
import type { Job } from '@/lib/supabase-types'

export default function Calendar() {
  const [deadlines, setDeadlines] = useState<any>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [deadlinesData, jobsData] = await Promise.all([
        calendarService.getUpcomingDeadlines(),
        jobOperations.getAll()
      ])
      setDeadlines(deadlinesData)
      setJobs(jobsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSchedule = async () => {
    if (!selectedJob || !startDate || !endDate) return

    try {
      setLoading(true)
      
      // Update job dates in database and create calendar event
      await calendarService.scheduleJob(
        selectedJob.id,
        new Date(startDate),
        new Date(endDate)
      )
      
      await loadData() // Reload data after scheduling
      setSelectedJob(null)
      setStartDate('')
      setEndDate('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule job')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>

  return (
    <div className="space-y-6">
      {/* Schedule Job Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Schedule Job</h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Job</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={selectedJob?.id || ''}
              onChange={(e) => {
                const job = jobs.find(j => j.id === Number(e.target.value))
                setSelectedJob(job || null)
              }}
            >
              <option value="">Select a job...</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="datetime-local"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="datetime-local"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button
            onClick={handleSchedule}
            disabled={!selectedJob || !startDate || !endDate}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Schedule Job
          </button>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Upcoming Deadlines</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {/* Job Deadlines */}
          {deadlines?.jobs.map((job: any) => (
            <div key={`job-${job.title}`} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{job.title}</h3>
                  <p className="text-sm text-gray-500">Client: {job.client}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">
                    Due: {new Date(job.deadline).toLocaleDateString()}
                  </p>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${job.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {job.status}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Invoice Deadlines */}
          {deadlines?.invoices.map((invoice: any) => (
            <div key={`invoice-${invoice.title}`} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{invoice.title}</h3>
                  <p className="text-sm text-gray-500">Client: {invoice.client}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">
                    Due: {new Date(invoice.deadline).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-900">
                    Amount: ${invoice.amount.toFixed(2)}
                  </p>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 
                      invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 