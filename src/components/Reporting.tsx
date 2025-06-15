"use client";

import { useState } from 'react'
import { reportingService } from '@/lib/reporting-service'

export default function Reporting() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) return

    try {
      setLoading(true)
      const reportData = await reportingService.generateBusinessReport(
        new Date(startDate),
        new Date(endDate)
      )
      setReport(reportData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Report Generator Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Generate Business Report</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <button
              onClick={handleGenerateReport}
              disabled={!startDate || !endDate || loading}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {report && (
        <div className="space-y-6">
          {/* Revenue Overview */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">${report.revenue.total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Revenue</p>
                <p className="text-2xl font-bold">${report.revenue.pending.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Paid Revenue</p>
                <p className="text-2xl font-bold">${report.revenue.paid.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Collection Rate</p>
                <p className="text-2xl font-bold">{report.revenue.collectionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Job Metrics */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Job Metrics</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Jobs</p>
                <p className="text-2xl font-bold">{report.jobs.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold">{report.jobs.completed}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold">{report.jobs.inProgress}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Completion Rate</p>
                <p className="text-2xl font-bold">{report.jobs.completionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Client Metrics */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Client Metrics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Clients</p>
                <p className="text-2xl font-bold">{report.clients.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Clients</p>
                <p className="text-2xl font-bold">{report.clients.active}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Retention Rate</p>
                <p className="text-2xl font-bold">{report.clients.retentionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Conversion Metrics */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Conversion Metrics</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Lead Conversion</h4>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-gray-500">Conversion Rate:</span>{' '}
                    <span className="font-medium">{report.leads.conversionRate.toFixed(1)}%</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Total Leads:</span>{' '}
                    <span className="font-medium">{report.leads.total}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Converted:</span>{' '}
                    <span className="font-medium">{report.leads.converted}</span>
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Quote Conversion</h4>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-gray-500">Acceptance Rate:</span>{' '}
                    <span className="font-medium">{report.quotes.acceptanceRate.toFixed(1)}%</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Total Quotes:</span>{' '}
                    <span className="font-medium">{report.quotes.total}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Accepted:</span>{' '}
                    <span className="font-medium">{report.quotes.accepted}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Business Insights</h3>
            <div className="space-y-6">
              {/* Top Performing Clients */}
              <div>
                <h4 className="font-medium mb-2">Top Performing Clients</h4>
                <div className="space-y-2">
                  {report.insights.topPerformingClients.map(([clientId, revenue]: [number, number]) => (
                    <p key={clientId} className="text-sm">
                      <span className="text-gray-500">Client #{clientId}:</span>{' '}
                      <span className="font-medium">${revenue.toFixed(2)}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Revenue Trend */}
              <div>
                <h4 className="font-medium mb-2">Revenue Trend</h4>
                <div className="space-y-2">
                  {report.insights.revenueTrend.map(({ month, amount }: { month: string; amount: number }) => (
                    <p key={month} className="text-sm">
                      <span className="text-gray-500">{month}:</span>{' '}
                      <span className="font-medium">${amount.toFixed(2)}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Job Efficiency */}
              <div>
                <h4 className="font-medium mb-2">Job Efficiency</h4>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-gray-500">Average Job Duration:</span>{' '}
                    <span className="font-medium">{report.insights.jobEfficiency.averageJobDuration.toFixed(1)} days</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">On-Time Completion Rate:</span>{' '}
                    <span className="font-medium">{report.insights.jobEfficiency.onTimeCompletion.toFixed(1)}%</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 