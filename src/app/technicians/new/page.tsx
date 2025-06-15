"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { technicianOperations } from '@/lib/supabase-client';

export default function CreateTechnicianPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await technicianOperations.create({
        name,
        email,
        phone,
        status,
        notes
      });
      router.push('/technicians');
    } catch (err) {
      setError('Failed to add technician');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Add New Technician</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="default-input w-full" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="default-input w-full" />
        </div>
        <div>
          <label className="block font-medium mb-1">Phone</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="default-input w-full" />
        </div>
        <div>
          <label className="block font-medium mb-1">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value as 'active' | 'inactive')} className="default-input w-full">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} className="default-textarea w-full" rows={3} />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? 'Saving...' : 'Add Technician'}</button>
        </div>
      </form>
    </div>
  );
} 