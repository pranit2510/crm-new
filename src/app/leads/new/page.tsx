'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PlusCircle, Save, DollarSign } from 'lucide-react';
import { leadOperations } from '@/lib/supabase-client';

const leadSourceOptions = ['website', 'referral', 'google', 'social', 'other'];

const CreateLeadPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    estimated_value: 0,
    source: 'website',
    status: 'new' as const,
    notes: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await leadOperations.create(formData);
      router.push('/leads');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'estimated_value' ? parseFloat(value) || 0 : value 
    }));
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-dark flex items-center'>
          <PlusCircle className='mr-3 h-8 w-8 text-primary' /> Add New Lead
        </h1>
        <Link href="/leads" className='btn-secondary btn-sm'>
          <ArrowLeft size={16} className="mr-1.5" /> Back to Lead List
        </Link>
      </div>

      <form onSubmit={handleSubmit} className='bg-white p-6 sm:p-8 rounded-lg shadow space-y-6'>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='name' className='form-label'>Lead Name</label>
            <input 
              type='text' 
              id='name' 
              name='name'
              value={formData.name} 
              onChange={handleInputChange} 
              className='default-input' 
              required 
              placeholder="e.g., Sarah Connor"
            />
          </div>
          <div>
            <label htmlFor='phone' className='form-label'>Phone Number</label>
            <input 
              type='tel' 
              id='phone' 
              name='phone'
              value={formData.phone} 
              onChange={handleInputChange} 
              className='default-input' 
              required
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
        
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='email' className='form-label'>Email</label>
            <input 
              type='email' 
              id='email' 
              name='email'
              value={formData.email} 
              onChange={handleInputChange} 
              className='default-input' 
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label htmlFor='estimated_value' className='form-label flex items-center'>
              <DollarSign size={14} className="mr-1.5 text-gray-400"/>
              Estimated Job Value
            </label>
            <input 
              type='number' 
              id='estimated_value' 
              name='estimated_value'
              value={formData.estimated_value} 
              onChange={handleInputChange} 
              className='default-input' 
              required
              min=""
              step="0.01"
              placeholder="1200"
            />
          </div>
        </div>

        <div>
          <label htmlFor='source' className='form-label'>Lead Source</label>
          <select 
            id='source' 
            name='source'
            value={formData.source} 
            onChange={handleInputChange} 
            className='default-select'
            required
          >
            {leadSourceOptions.map(opt => (
              <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor='notes' className='form-label'>Notes</label>
          <textarea 
            id='notes' 
            name='notes'
            value={formData.notes} 
            onChange={handleInputChange} 
            rows={3} 
            className='default-textarea'
            placeholder="e.g., Called about kitchen lighting installation"
          />
        </div>
        
        <div className='pt-4 border-t flex justify-end'>
          <button 
            type="submit" 
            disabled={loading}
            className='btn-primary'
          >
            <Save size={18} className="mr-2" /> {loading ? 'Saving...' : 'Save Lead'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateLeadPage; 