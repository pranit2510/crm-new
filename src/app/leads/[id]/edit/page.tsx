'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Lightbulb,
  Phone,
  Mail,
  DollarSign,
  ClipboardList,
  CalendarCheck2,
  Info
} from 'lucide-react';
import { leadOperations } from '@/lib/supabase-client';

const leadStatusOptions = [
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'lost', label: 'Lost' },
];
const leadSourceOptions = ['website', 'referral', 'google', 'social', 'other'];

const leadStatusColors: { [key: string]: string } = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-sky-100 text-sky-700',
  qualified: 'bg-indigo-100 text-indigo-700',
  lost: 'bg-red-100 text-red-700',
};

const LeadEditPage = () => {
  const params = useParams();
  const router = useRouter();
  const leadId = params?.id ? (params.id as string) : '';
  const [leadData, setLeadData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchLead = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await leadOperations.getById(Number(leadId));
        setLeadData(data);
      } catch (err) {
        setError('Failed to load lead');
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [leadId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLeadData((prev: any) => ({
      ...prev,
      [name]: name === 'estimated_value' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSaveLead = async () => {
    setSaving(true);
    setError(null);
    try {
      await leadOperations.update(Number(leadId), leadData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.push('/leads');
    } catch (err) {
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className='text-red-500'>{error}</div>;
  if (!leadData) return <div>Lead not found.</div>;

  return (
    <div>
      <div className='mb-6'>
        <Link href={`/leads/${leadId}`} className='inline-flex items-center text-sm text-primary hover:underline mb-3'>
          <ArrowLeft size={16} className="mr-1.5" /> Back to Lead Details
        </Link>
        <h1 className='text-3xl font-bold text-dark flex items-center'>
          <Lightbulb className="mr-3 h-8 w-8 text-primary" /> Edit Lead: {leadData.name}
        </h1>
      </div>
      <form className='bg-white p-6 rounded-lg shadow space-y-8' onSubmit={e => { e.preventDefault(); handleSaveLead(); }}>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='name' className='form-label'>Lead Name</label>
            <input type='text' id='name' name='name' value={leadData.name} onChange={handleInputChange} className='default-input' required />
          </div>
          <div>
            <label htmlFor='phone' className='form-label'>Phone Number</label>
            <input type='tel' id='phone' name='phone' value={leadData.phone} onChange={handleInputChange} className='default-input' required />
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='email' className='form-label'>Email</label>
            <input type='email' id='email' name='email' value={leadData.email || ''} onChange={handleInputChange} className='default-input' />
          </div>
          <div>
            <label htmlFor='estimated_value' className='form-label flex items-center'><DollarSign size={14} className="mr-1.5 text-gray-400"/>Estimated Value ($)</label>
            <input type='number' id='estimated_value' name='estimated_value' value={leadData.estimated_value || 0} onChange={handleInputChange} className='default-input' min="0" step="0.01" required />
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='source' className='form-label'>Lead Source</label>
            <select id='source' name='source' value={leadData.source} onChange={handleInputChange} className='default-select' required>
              {leadSourceOptions.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
            </select>
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='status' className='form-label'>Status</label>
            <select id='status' name='status' value={leadData.status} onChange={handleInputChange} className='default-select' required>
              {leadStatusOptions.map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor='notes' className='form-label'>Notes</label>
          <textarea id='notes' name='notes' value={leadData.notes || ''} onChange={handleInputChange} rows={3} className='default-textarea' />
        </div>
        <div className='pt-4 border-t border-gray-200 flex justify-end'>
          <button type="submit" disabled={saving} className='btn-primary'>
            <Save size={18} className="mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        {saved && <div className='text-green-600 text-right font-medium mt-2'>Changes saved!</div>}
        {error && <div className='text-red-600 text-right font-medium mt-2'>{error}</div>}
      </form>
    </div>
  );
};

export default LeadEditPage;