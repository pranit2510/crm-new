'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Briefcase,
  CalendarDays,
  ClipboardList,
  Wrench,
  Camera,
  MessageSquare,
  DollarSign,
  Info,
  MapPin,
  Clock,
  User
} from 'lucide-react';
import { jobOperations, technicianOperations, clientOperations } from '@/lib/supabase-client';

// Define types
type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
type JobPriority = 'low' | 'medium' | 'high';

interface JobFormData {
  title: string;
  description: string;
  status: JobStatus;
  priority: JobPriority;
  budget: number;
  assigned_technicians: string[];
  service_address: string;
  start_date: string;
  end_date: string;
  client_id: number;
}

const EditJobPage = () => {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  // Form state with proper typing
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    budget: 0,
    assigned_technicians: [],
    service_address: '',
    start_date: '',
    end_date: '',
    client_id: 0,
  });

  useEffect(() => {
    async function fetchData() {
      if (!jobId) return;
      
      try {
        setLoading(true);
        // Fetch job data
        const jobData = await jobOperations.getAll();
        const found = jobData.find((j: any) => j.id.toString() === jobId);
        
        if (!found) {
          setError('Job not found');
          return;
        }

        // Format the start_date for the datetime-local input
        const startDate = found.start_date ? new Date(found.start_date) : null;
        const startDateStr = startDate ? startDate.toISOString().slice(0, 16) : '';

        setJob(found);
        setFormData({
          title: found.title || '',
          description: found.description || '',
          status: (found.status as JobStatus) || 'pending',
          priority: (found.priority as JobPriority) || 'medium',
          budget: found.budget || 0,
          assigned_technicians: found.assigned_technicians || [],
          service_address: found.service_address || '',
          start_date: startDateStr,
          end_date: startDateStr,
          client_id: found.client_id || 0
        });

        // Fetch technicians and clients
        const [techs, clientData] = await Promise.all([
          technicianOperations.getAll(),
          clientOperations.getAll()
        ]);
        setTechnicians(techs || []);
        setClients(clientData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load job data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [jobId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['budget', 'completion_percentage', 'actual_cost'].includes(name) ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const startDateTime = formData.start_date ? new Date(formData.start_date).toISOString() : undefined;

      const updateData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        budget: formData.budget,
        assigned_technicians: formData.assigned_technicians,
        service_address: formData.service_address,
        start_date: startDateTime,
        end_date: startDateTime,
        client_id: formData.client_id
      };

      await jobOperations.update(Number(jobId), updateData);

      // Update Google Calendar event
      if (startDateTime) {
        await fetch('/api/schedule-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            start: startDateTime,
            end: startDateTime,
          }),
        });
      }

      router.push('/jobs');
    } catch (err) {
      console.error('Error updating job:', err);
      setError('Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading job data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-red-50 text-red-600 rounded-lg">
      {error}
    </div>
  );

  if (!job) return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-yellow-50 text-yellow-600 rounded-lg">
      Job not found
    </div>
  );

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-dark flex items-center'>
          <Briefcase className='mr-3 h-8 w-8 text-primary' /> Edit Job #{job.id}
        </h1>
        <Link href="/jobs" className='btn-secondary btn-sm'>
          <ArrowLeft size={16} className="mr-1.5" /> Back to Jobs
        </Link>
      </div>

      <form onSubmit={handleSubmit} className='bg-white p-6 sm:p-8 rounded-lg shadow space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='client_id' className='form-label flex items-center'>
              <User size={14} className="mr-1.5 text-gray-400" />Client
            </label>
            <select
              id='client_id'
              name='client_id'
              value={formData.client_id}
              onChange={handleInputChange}
              className='default-select'
              required
            >
              <option value="" disabled>Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor='priority' className='form-label'>Priority</label>
            <select
              id='priority'
              name='priority'
              value={formData.priority}
              onChange={handleInputChange}
              className='default-select'
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor='title' className='form-label'>Job Title</label>
          <input
            type='text'
            id='title'
            name='title'
            value={formData.title}
            onChange={handleInputChange}
            className='default-input'
            required
          />
        </div>

        <div>
          <label htmlFor='service_address' className='form-label'>Service Address</label>
          <input
            type='text'
            id='service_address'
            name='service_address'
            value={formData.service_address}
            onChange={handleInputChange}
            className='default-input'
            required
          />
        </div>

        <div>
          <label htmlFor='budget' className='form-label'>Budget / Amount ($)</label>
          <input
            type='number'
            id='budget'
            name='budget'
            value={formData.budget}
            onChange={handleInputChange}
            className='default-input'
            min={0}
            step={0.01}
            required
          />
        </div>

        <div>
          <label htmlFor='description' className='form-label'>Job Description</label>
          <textarea
            id='description'
            name='description'
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className='default-textarea'
            required
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='status' className='form-label'>Status</label>
            <select
              id='status'
              name='status'
              value={formData.status}
              onChange={handleInputChange}
              className='default-select'
            >
              <option value="pending">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label htmlFor='start_date' className='form-label flex items-center'>
              <CalendarDays size={14} className="mr-1.5 text-gray-400" />Scheduled Date & Time
            </label>
            <input
              type="datetime-local"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  start_date: e.target.value,
                  end_date: e.target.value
                }));
              }}
              className="default-input"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor='assigned_technicians' className='form-label'>Assign Technician(s)</label>
          <select
            multiple
            id='assigned_technicians'
            name='assigned_technicians'
            value={formData.assigned_technicians}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              setFormData(prev => ({ ...prev, assigned_technicians: values }));
            }}
            className='default-select h-24 w-full max-w-md'
          >
            {technicians.map(tech => (
              <option key={tech.id} value={tech.id}>{tech.name}</option>
            ))}
          </select>
          <p className='text-xs text-gray-500 mt-1'>Hold Ctrl/Cmd to select multiple.</p>
        </div>

        <div className='pt-4 border-t border-gray-200 flex justify-end'>
          <button type="submit" disabled={saving} className='btn-primary'>
            <Save size={18} className="mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        {error && <div className='text-red-600 text-right font-medium mt-2'>{error}</div>}
      </form>
    </div>
  );
};

export default EditJobPage; 