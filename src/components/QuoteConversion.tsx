"use client";

import { useState, useEffect } from 'react'
import { quoteConversionOperations } from '@/lib/quote-conversion'
import { quoteOperations } from '@/lib/supabase-client'
import type { Quote } from '@/lib/supabase-types'

export default function QuoteConversion() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [quotesData, statsData] = await Promise.all([
        quoteOperations.getAll(),
        quoteConversionOperations.getQuoteStats()
      ])
      setQuotes(quotesData)
      setStats(statsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleConvert = async (quoteId: number) => {
    try {
      setLoading(true)
      await quoteConversionOperations.convertQuoteToInvoice(quoteId)
      await loadData() // Reload data after conversion
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert quote')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Acceptance Rate</h3>
          <p className="text-2xl font-bold">{stats?.acceptanceRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Quotes</h3>
          <p className="text-2xl font-bold">{stats?.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Accepted</h3>
          <p className="text-2xl font-bold">{stats?.accepted}</p>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quote #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quotes.map((quote) => (
              <tr key={quote.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">#{quote.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Client #{quote.client_id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${quote.amount.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${quote.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                      quote.status === 'sent' ? 'bg-blue-100 text-blue-800' : 
                      quote.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'}`}>
                    {quote.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {quote.status === 'sent' && (
                    <button
                      onClick={() => handleConvert(quote.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Convert to Invoice
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 