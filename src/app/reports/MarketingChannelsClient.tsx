'use client'

import {
  BarChart3, TrendingUp, DollarSign, Target, Plus,
  Edit3, Save, X, Calendar, ChevronLeft, ChevronRight, Trash2,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import {
  channelReportOperations,
  type ChannelReport,
} from '@/lib/supabase-client'

/* ---------------- props injected by the SERVER wrapper ------------ */
export interface MarketingChannelsClientProps {
  initialMonth      : string
  initialChannels   : ChannelReport[]
  /** optional – delete if you don’t use lead data in this component */
  initialLeadReport?: { source: string; total: number; qualified: number }[]
}

 

  


export default function MarketingChannelsClient ({
  initialMonth,
  initialChannels,
}: MarketingChannelsClientProps) {

/* ---------------------------- state ------------------------------ */
  const [selectedMonth, setSelectedMonth] = useState(initialMonth)
  const [channelData,   setChannelData  ] = useState<ChannelReport[]>(initialChannels)
  const [loadingMonth,  setLoadingMonth ] = useState(false)

  const [editingRow,   setEditingRow   ] = useState<number|null>(null)
  const [editFormData, setEditFormData ] = useState<Partial<ChannelReport>>({})

  const [isAdding,     setIsAdding     ] = useState(false)
  const blankRow = (month = selectedMonth): Omit<ChannelReport,'id'|'created_at'> => ({
    month, channel:'', cost:0, leads:0, jobs:0, revenue:0,
    close_rate:0, cost_per_lead:0, roi:0,
  })
  const [newRow, setNewRow] = useState(blankRow())
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    if (role) {
      setUserRole(role);
    }
  }, []);


/* ---------------- fetch when month changes ----------------------- */
  useEffect(() => {
    if (selectedMonth === initialMonth) return        // SSR rows already shown
    ;(async () => {
      setLoadingMonth(true)
      const rows = await channelReportOperations.getByMonth(selectedMonth)
      setChannelData(rows || [])
      setLoadingMonth(false)
    })()
  }, [selectedMonth, initialMonth])

  const refresh = async () => {
    const rows = await channelReportOperations.getByMonth(selectedMonth)
    setChannelData(rows || [])
  }

/* ---------------- helpers ---------------- */
  const jumpMonth = (dir:'prev'|'next') => {
    const [y,m] = selectedMonth.split('-').map(Number)
    const d     = new Date(y, m-1 + (dir==='next'?1:-1))
    const str   = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
    setSelectedMonth(str)
    setNewRow(blankRow(str))
  }
  const fmtMonth = (s:string) =>
    new Date(+s.slice(0,4), +s.slice(5)-1)
      .toLocaleDateString('en-US',{month:'long',year:'numeric'})

  const calc = (r:ChannelReport) => {
    const close = r.leads ? (r.jobs / r.leads)*100 : 0
    const cpl   = r.leads ? (r.cost / r.leads)     : 0
    const roi   = r.cost  ? ((r.revenue-r.cost)/r.cost)*100 : 0
    return { close, cpl, roi }
  }

/* ---------------- CRUD ---------------- */
  const saveEdit = async () => {
    if (editingRow==null) return
    await channelReportOperations.update(editingRow, editFormData)
    setEditingRow(null); setEditFormData({}); refresh()
  }
  const cancelEdit = () => { setEditingRow(null); setEditFormData({}) }

  const addRow = async () => {
    if (!newRow.channel) return
    await channelReportOperations.create(newRow)
    setIsAdding(false); setNewRow(blankRow()); refresh()
  }
  const delRow = async (id:number) => {
    if (!confirm('Delete this channel?')) return
    await channelReportOperations.delete(id); refresh()
  }

/* ---------------- totals / chart data ---------------- */
  const totals = channelData.reduce((a,r)=>({
    cost   : a.cost+r.cost,   leads: a.leads+r.leads,
    jobs   : a.jobs+r.jobs,   revenue:a.revenue+r.revenue,
  }),{cost:0,leads:0,jobs:0,revenue:0})

  const overallClose = totals.leads ? (totals.jobs/totals.leads)*100 : 0
  const overallROI   = totals.cost  ? ((totals.revenue-totals.cost)/totals.cost)*100 : 0

  const chartData = channelData.map(r=>({
    channel:r.channel, revenue:r.revenue, cost:r.cost, leads:r.leads, jobs:r.jobs,
  }))

/* ---------------- UI ---------------- */
  return (
    <div className="bg-white rounded-lg shadow-sm border">

      {/* header */}
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center">
          <BarChart3 className="mr-2 text-[#1877F2]" size={22}/> Marketing Channels
        </h2>
        <div className="flex items-center space-x-3">
          <button onClick={()=>jumpMonth('prev')} className="p-2"><ChevronLeft size={18}/></button>
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-[#1877F2]"/>
            <span className="min-w-[140px] text-center">{fmtMonth(selectedMonth)}</span>
          </div>
          <button onClick={()=>jumpMonth('next')} className="p-2"><ChevronRight size={18}/></button>
        </div>
      </div>

      {/* body */}
      <div className="p-6">

        {/* cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {icon:DollarSign,label:'Ad Spend',value:`$${totals.cost.toLocaleString()}`},
            {icon:DollarSign,label:'Revenue', value:`$${totals.revenue.toLocaleString()}`},
            {icon:TrendingUp,label:'ROI',     value:`${overallROI.toFixed(1)}%`},
            {icon:Target,    label:'Close %',value:`${overallClose.toFixed(1)}%`},
          ].map(c=>(
            <div key={c.label} className="bg-gray-50 p-4 rounded border">
              <h3 className="text-sm text-gray-500 flex items-center mb-1">
                <c.icon size={16} className="mr-1 text-[#1877F2]"/>{c.label}
              </h3>
              <p className="text-2xl font-semibold">{c.value}</p>
            </div>
          ))}
        </div>

        {/* chart */}
        {loadingMonth ? (
          <div className="h-48 flex items-center justify-center text-gray-400">Loading…</div>
        ) : (
          <div className="h-64 mb-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="channel"/><YAxis/><Tooltip/><Legend/>
                <Bar dataKey="revenue" fill="#4F46E5"/><Bar dataKey="cost" fill="#F59E42"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Channel','Cost','Leads','Jobs','Revenue',
                  'Close %','CPL','ROI','Actions'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs uppercase text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">

              {/* rows */}
              {channelData.map(r=>{
                const m = calc(r); const editing = editingRow===r.id
                const cell = (k:keyof ChannelReport, money=false)=> editing? (
                  <input type={k==='channel'?'text':'number'}
                         value={(editFormData as any)[k] ?? r[k] ?? ''}
                         onChange={e=>setEditFormData(p=>({
                           ...p,[k]:k==='channel'?e.target.value:Number(e.target.value||0)}))}
                         className="w-full px-2 py-1 border rounded"/>
                ):(
                  <span>{k==='channel'
                           ? r.channel
                           : money ? `$${Number(r[k]||0).toLocaleString()}` : r[k]}</span>
                )

                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{cell('channel')}</td>
                    <td className="px-4 py-3">{cell('cost',true)}</td>
                    <td className="px-4 py-3">{cell('leads')}</td>
                    <td className="px-4 py-3">{cell('jobs')}</td>
                    <td className="px-4 py-3">{cell('revenue',true)}</td>
                    <td className="px-4 py-3">{m.close.toFixed(1)}%</td>
                    <td className="px-4 py-3">${m.cpl.toFixed(2)}</td>
                    <td className={`px-4 py-3 font-medium ${m.roi>=0?'text-green-600':'text-red-600'}`}>
                      {m.roi.toFixed(1)}%
                    </td>
                    {userRole !== 'user' && (
                    <td className="px-4 py-3">
                      {editing?(
                        <>
                          <button onClick={saveEdit} className="p-1 text-green-600"><Save size={15}/></button>
                          <button onClick={cancelEdit} className="p-1 text-red-600"><X size={15}/></button>
                        </>
                      ):(
                        <>
                          <button onClick={()=>{setEditingRow(r.id);setEditFormData({...r})}}
                                  className="p-1 text-blue-600"><Edit3 size={15}/></button>
                          <button onClick={()=>delRow(r.id)} className="p-1 text-red-600"><Trash2 size={15}/></button>
                        </>
                      )}
                    </td>
                    )}
                  </tr>
                )
              })}

              {/* add-row inline */}
              {isAdding && (
                <tr className="bg-blue-50">
                  <td className="px-4 py-3"><input autoFocus
                    className="w-full px-2 py-1 border rounded"
                    value={newRow.channel}
                    onChange={e=>setNewRow(p=>({...p,channel:e.target.value}))}/></td>
                  {(['cost','leads','jobs','revenue'] as const).map(k=>(
                    <td key={k} className="px-4 py-3"><input type="number"
                      className="w-full px-2 py-1 border rounded"
                      value={(newRow as any)[k]}
                      onChange={e=>setNewRow(p=>({...p,[k]:Number(e.target.value||0)}))}/></td>
                  ))}
                  <td className="px-4 py-3 text-gray-400" colSpan={3}>auto</td>
                  <td className="px-4 py-3">
                    <button onClick={addRow} className="p-1 text-green-600"><Save size={15}/></button>
                    <button onClick={()=>{setIsAdding(false);setNewRow(blankRow())}}
                            className="p-1 text-red-600"><X size={15}/></button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* add button */}
        {!isAdding && (
          <div className="mt-4 flex justify-center">
            {userRole !== 'user' && (
              <button onClick={()=>setIsAdding(true)}
              className="flex items-center px-4 py-2 border text-blue-600 rounded">
        <Plus size={16} className="mr-2"/> Add Channel
      </button>

)}
            
          </div>
        )}
      </div>
    </div>
  )
}
