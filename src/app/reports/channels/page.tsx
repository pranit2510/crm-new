'use client';

import React, { useEffect, useState } from 'react';
import { channelReportOperations, type ChannelReport } from '@/lib/supabase-client';

const defaultMonth = new Date().toISOString().slice(0, 7);

export default function ChannelReportsPage() {
  const [month, setMonth] = useState(defaultMonth);
  const [reports, setReports] = useState<ChannelReport[]>([]);
  const [form, setForm] = useState<Omit<ChannelReport, 'id' | 'created_at'>>({
    month: defaultMonth,
    channel: '',
    cost: 0,
    leads: 0,
    jobs: 0,
    revenue: 0,
    close_rate: 0,
    cost_per_lead: 0,
    roi: 0,
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadReports();
  }, [month]);

  async function loadReports() {
    const data = await channelReportOperations.getByMonth(month);
    setReports(data || []);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'channel' ? value : Number(value) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await channelReportOperations.update(editingId, form);
    } else {
      await channelReportOperations.create(form);
    }
    setForm({ ...form, channel: '', cost: 0, leads: 0, jobs: 0, revenue: 0, close_rate: 0, cost_per_lead: 0, roi: 0 });
    setEditingId(null);
    loadReports();
  }

  function handleEdit(report: ChannelReport) {
    setForm({ ...report });
    setEditingId(report.id);
  }

  async function handleDelete(id: number) {
    if (confirm('Delete this channel report?')) {
      await channelReportOperations.delete(id);
      loadReports();
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Channel Reports for {month}</h1>
      <div className="mb-4">
        <label>Month: </label>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} />
      </div>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap gap-2 items-end">
        <input name="channel" value={form.channel} onChange={handleInputChange} placeholder="Channel" required className="border p-1" />
        <input name="cost" type="number" value={form.cost} onChange={handleInputChange} placeholder="Cost" className="border p-1" />
        <input name="leads" type="number" value={form.leads} onChange={handleInputChange} placeholder="Leads" className="border p-1" />
        <input name="jobs" type="number" value={form.jobs} onChange={handleInputChange} placeholder="Jobs" className="border p-1" />
        <input name="revenue" type="number" value={form.revenue} onChange={handleInputChange} placeholder="Revenue" className="border p-1" />
        <input name="close_rate" type="number" value={form.close_rate} onChange={handleInputChange} placeholder="Close Rate (%)" className="border p-1" />
        <input name="cost_per_lead" type="number" value={form.cost_per_lead} onChange={handleInputChange} placeholder="Cost/Lead" className="border p-1" />
        <input name="roi" type="number" value={form.roi} onChange={handleInputChange} placeholder="ROI (%)" className="border p-1" />
        <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">{editingId ? 'Update' : 'Add'} Channel</button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ ...form, channel: '', cost: 0, leads: 0, jobs: 0, revenue: 0, close_rate: 0, cost_per_lead: 0, roi: 0 }); }} className="ml-2 text-gray-600">Cancel</button>}
      </form>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th>Channel</th><th>Cost</th><th>Leads</th><th>Jobs</th><th>Revenue</th><th>Close Rate</th><th>Cost/Lead</th><th>ROI</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(r => (
            <tr key={r.id}>
              <td>{r.channel}</td>
              <td>${r.cost.toLocaleString()}</td>
              <td>{r.leads}</td>
              <td>{r.jobs}</td>
              <td>${r.revenue.toLocaleString()}</td>
              <td>{(r.close_rate * 100).toFixed(1)}%</td>
              <td>${r.cost_per_lead.toFixed(2)}</td>
              <td style={{ color: r.roi > 0 ? 'green' : undefined }}>{(r.roi * 100).toFixed(1)}%</td>
              <td>
                <button onClick={() => handleEdit(r)} className="text-blue-600 mr-2">✏️</button>
                <button onClick={() => handleDelete(r.id)} className="text-red-600">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
