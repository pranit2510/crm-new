'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PlusCircle, Save } from 'lucide-react';
import { clientOperations } from '@/lib/supabase-client';

const CreateClientPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [source, setSource] = useState('Direct');
  const [estimatedValue, setEstimatedValue] = useState(0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await clientOperations.create({
        name: clientName,
        email,
        phone,
        address,
        notes,
        status: 'active',
        estimated_value: estimatedValue,
        source,
        assigned_to: ''
      });

      router.push('/clients');
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'object' && err !== null
          ? JSON.stringify(err)
          : 'Failed to create client';
      setError(errorMessage);
      console.error('Error creating client:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-dark flex items-center'>
          <PlusCircle className='mr-3 h-8 w-8 text-primary' /> Add New Client
        </h1>
        <Link href="/clients" className='btn-secondary btn-sm'>
          <ArrowLeft size={16} className="mr-1.5" /> Back to Client List
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className='bg-white p-6 sm:p-8 rounded-lg shadow space-y-6'>
        <div>
          <label htmlFor='clientName' className='form-label'>Client Name</label>
          <input 
            type='text' 
            id='clientName' 
            value={clientName} 
            onChange={(e) => setClientName(e.target.value)} 
            className='default-input' 
            required 
          />
        </div>
        <div>
          <label htmlFor='companyName' className='form-label'>Company Name (Optional)</label>
          <input 
            type='text' 
            id='companyName' 
            value={companyName} 
            onChange={(e) => setCompanyName(e.target.value)} 
            className='default-input' 
          />
        </div>
        <div>
          <label htmlFor='email' className='form-label'>Email</label>
          <input 
            type='email' 
            id='email' 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className='default-input' 
          />
        </div>
        <div>
          <label htmlFor='phone' className='form-label'>Phone</label>
          <input 
            type='tel' 
            id='phone' 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            className='default-input' 
          />
        </div>
        <div>
          <label htmlFor='address' className='form-label'>Address</label>
          <textarea 
            id='address' 
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
            className='default-textarea' 
            rows={3}
          />
        </div>
        <div>
          <label htmlFor='notes' className='form-label'>Notes</label>
          <textarea 
            id='notes' 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            className='default-textarea' 
            rows={4}
          />
        </div>
        <div>
          <label htmlFor='source' className='form-label'>Source</label>
          <select
            id='source'
            value={source}
            onChange={e => setSource(e.target.value)}
            className='default-input'
            required
          >
            <option value='Direct'>Direct</option>
            <option value='Referral'>Referral</option>
            <option value='Website'>Website</option>
            <option value='Other'>Other</option>
          </select>
        </div>
        <div>
          <label htmlFor='estimatedValue' className='form-label'>Estimated Value</label>
          <input
            type='number'
            id='estimatedValue'
            value={estimatedValue}
            onChange={e => setEstimatedValue(Number(e.target.value))}
            className='default-input'
            min={0}
            step={0.01}
            required
          />
        </div>
        
        <div className='pt-4 border-t flex justify-end'>
          <button 
            type="submit" 
            className='btn-primary'
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" /> Save Client
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateClientPage; 