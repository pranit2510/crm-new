'use client'

import { ReactNode, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Briefcase,
  PlusCircle,
  Edit3,
  Trash2,
  AlertCircle,
} from 'lucide-react'
import { jobOperations } from '@/lib/supabase-client'
import { useRoleRedirect } from '@/lib/hooks/useRoleRedirect';
/* ─── helper types ──────────────────────────────────────────────────── */
export type JobStatus   = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type JobPriority = 'low' | 'medium' | 'high'
export interface JobsPageProps {
    initialJobs: any[]          // replace any with your generated row type
    initialTechs: { id: string; name: string }[]
  }

interface Technician {
  id: string
  name: string
}

interface UIJob {
  id: number
  clientName: string
  title: string
  status: JobStatus
  priority: JobPriority
  address: string
  assignedTechs: string[]
  budget: number
  scheduled: string
}

/* ─── colour maps ----------------------------------------------------- */
const statusCls: Record<JobStatus, string> = {
  pending:     'bg-blue-100  text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-100   text-red-700',
}

const prioCls: Record<JobPriority, string> = {
  high:   'text-red-600 bg-red-100',
  medium: 'text-orange-600 bg-orange-100',
  low:    'text-green-600 bg-green-100',
}

/* ─── main component -------------------------------------------------- */
interface Props {
  initialJobs:  any[]            // raw rows from Supabase query
  initialTechs: Technician[]     // id + name only
}

export default function JobsPageContent({ initialJobs, initialTechs }: JobsPageProps):ReactNode {
  /* 1. map SQL rows → clean UI rows (only once) */
  const [jobs, setJobs] = useState<UIJob[]>(() =>
    initialJobs.map(row => ({
      id:            row.id,
      clientName:    row.clients?.name ?? 'Unknown',
      title:         row.title,
      status:        row.status as JobStatus,
      priority:      row.priority as JobPriority,
      address:       row.service_address ?? '',
      assignedTechs: row.assigned_technicians ?? [],
      budget:        row.budget ?? 0,
      scheduled:     row.start_date
                       ? new Date(row.start_date).toLocaleString()
                       : '',
    })),
  )

  /* 2. local state for filters / busy flag */
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState<JobStatus | 'all'>('all')
  const [priority, setPriority] = useState<JobPriority | 'all'>('all')
  const [busy,     setBusy]     = useState<number | null>(null)
  useRoleRedirect(['admin', 'user']); 
  /* helper: tech-id → human name */
  const techName = (id: string) =>
    initialTechs.find(t => t.id.toString() === id.toString())?.name ?? id

  /* 3. counters for the status pills */
  const counters = useMemo(() => {
    const base = {
      all:        jobs.length,
      pending:    0,
      in_progress:0,
      completed:  0,
      cancelled:  0,
    } satisfies Record<'all' | JobStatus, number>

    jobs.forEach(j => { base[j.status] += 1 })
    return base
  }, [jobs])

  /* 4. list after applying filters / search */
  const filtered = useMemo(() => {
    let list = jobs

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(j =>
        j.id.toString().includes(q) ||
        j.clientName.toLowerCase().includes(q) ||
        j.title.toLowerCase().includes(q),
      )
    }
    if (status   !== 'all') list = list.filter(j => j.status   === status)
    if (priority !== 'all') list = list.filter(j => j.priority === priority)

    return list
  }, [jobs, search, status, priority])

  /* 5. mutators -------------------------------------------------------- */
  const remove = async (id: number) => {
    if (!confirm('Delete this job?')) return
    setBusy(id)
    await jobOperations.delete(id)
    setJobs(prev => prev.filter(j => j.id !== id))
    setBusy(null)
  }

  const changeStatus = async (id: number, s: JobStatus) => {
    setBusy(id)
    await jobOperations.update(id, { status: s })
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: s } : j))
    setBusy(null)
  }

  /* ─── render --------------------------------------------------------- */
  return (
    <div className="fade-in">
      {/* ╭── header ───────────────────────────────────────────────╮ */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <Briefcase className="h-8 w-8 text-primary mr-3" />
          Jobs / Work Orders <span className="text-gray-500 ml-2">({counters.all})</span>
        </h1>
        <Link href="/jobs/new" className="btn-primary inline-flex items-center">
          <PlusCircle size={20} className="mr-2" /> Create New Job
        </Link>
      </div>

      {/* ╭── status pills ────────────────────────────────────────╮ */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(['all','pending','in_progress','completed','cancelled'] as const).map(k => (
          <button
            key={k}
            onClick={() => setStatus(k === 'all' ? 'all' : k)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              status === k
                ? (k === 'all'
                    ? 'bg-primary text-white'
                    : statusCls[k as JobStatus])
                : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {k.replace('_',' ')} ({counters[k]})
          </button>
        ))}
      </div>

      {/* ╭── search + priority filter ─────────────────────────────╮ */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            className="w-full pl-10 pr-3 py-2 border rounded-md"
            placeholder="Search jobs…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={priority}
          onChange={e => setPriority(e.target.value as any)}
          className="sm:w-40 border rounded-md px-3 py-2"
        >
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* ╭── table ────────────────────────────────────────────────╮ */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Client / Title</th>
              <th className="px-4 py-2 text-left">Priority</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Assigned</th>
              <th className="px-4 py-2 text-left">Address</th>
              <th className="px-4 py-2 text-left">Budget</th>
              <th className="px-4 py-2 text-left">Scheduled</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-500">
                  No jobs found.
                </td>
              </tr>
            )}

            {filtered.map(j => (
              <tr key={j.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{j.id}</td>

                <td className="px-4 py-2">
                  <div className="font-medium">{j.clientName}</div>
                  <div className="text-sm text-gray-600 max-w-xs truncate">
                    {j.title}
                  </div>
                </td>

                <td className="px-4 py-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${prioCls[j.priority]}`}>
                    {j.priority === 'high' && <AlertCircle size={12} className="mr-1" />}
                    {j.priority}
                  </span>
                </td>

                <td className="px-4 py-2">
                  <select
                    disabled={busy === j.id}
                    value={j.status}
                    onChange={e => changeStatus(j.id, e.target.value as JobStatus)}
                    className={`px-2 py-1 rounded-md text-xs font-medium border ${statusCls[j.status]}`}
                  >
                    <option value="pending">Scheduled</option>
                    <option value="in_progress">In progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>

                <td className="px-4 py-2 text-sm">
                  {j.assignedTechs.length
                    ? j.assignedTechs.map(techName).join(', ')
                    : <span className="text-gray-400">—</span>}
                </td>

                <td className="px-4 py-2 text-sm">{j.address || '—'}</td>
                <td className="px-4 py-2">$ {j.budget.toLocaleString()}</td>
                <td className="px-4 py-2 text-sm">{j.scheduled || '—'}</td>

                <td className="px-4 py-2 whitespace-nowrap">
                  <Link
                    href={`/jobs/${j.id}/edit`}
                    className="text-yellow-600 mr-3 hover:text-yellow-700"
                  >
                    <Edit3 size={16} />
                  </Link>
                  <button
                    disabled={busy === j.id}
                    onClick={() => remove(j.id)}
                    className="text-red-600 hover:text-red-700 disabled:opacity-40"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
