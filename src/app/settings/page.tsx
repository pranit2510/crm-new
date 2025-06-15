"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { Save } from "lucide-react";

const initialProfile = {
  name: "",
  email: "",
  phone: "",
  role: "",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch user profile from user_profiles table
        const { data, error } = await supabase
          .from("user_profiles")
          .select("name, email, phone, role")
          .eq("id", user.id)
          .maybeSingle();
        if (data) {
          setProfile(data);
        } else {
          setProfile({ ...initialProfile, email: user.email ?? "" });
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    try {
      await supabase.from("user_profiles").upsert({
        id: user.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        role: profile.role || 'Technician',
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="form-label">Name</label>
          <input type="text" id="name" name="name" value={profile.name} onChange={handleChange} className="default-input w-full" required />
        </div>
        <div>
          <label htmlFor="email" className="form-label">Email</label>
          <input type="email" id="email" name="email" value={profile.email} onChange={handleChange} className="default-input w-full" required disabled />
        </div>
        <div>
          <label htmlFor="phone" className="form-label">Phone</label>
          <input type="tel" id="phone" name="phone" value={profile.phone} onChange={handleChange} className="default-input w-full" />
        </div>
        <div>
          <label htmlFor="role" className="form-label">Role</label>
          <input type="text" id="role" name="role" value={profile.role} onChange={handleChange} className="default-input w-full" disabled />
        </div>
        <div className="pt-4 border-t flex justify-end">
          <button type="submit" className="btn-primary" disabled={saveStatus==='saving'}>
            <Save size={18} className="mr-2" /> {saveStatus==='saving' ? 'Saving...' : 'Save Profile'}
          </button>
          {saveStatus==='success' && <span className="ml-4 text-green-600 font-medium">Saved!</span>}
          {saveStatus==='error' && <span className="ml-4 text-red-600 font-medium">Error saving</span>}
        </div>
      </form>
    </div>
  );
} 