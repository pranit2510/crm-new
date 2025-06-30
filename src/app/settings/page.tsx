"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { supabase } from "@/lib/supabase-client";
import { Save, Camera, User } from "lucide-react";

const initialProfile = {
  name: "",
  email: "",
  phone: "",
  role: "",
  avatar_url: "",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch user profile from user_profiles table
        const { data, error } = await supabase
          .from("user_profiles")
          .select("name, email, phone, role, avatar_url")
          .eq("id", user.id)
          .maybeSingle();
        if (data) {
          setProfile({
            name: data.name ?? "",
            email: data.email ?? "",
            phone: data.phone ?? "",
            role: data.role ?? "",
            avatar_url: data.avatar_url ?? "",
          });
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

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile state
      setProfile(prev => ({ ...prev, avatar_url: data.publicUrl }));
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
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
        avatar_url: profile.avatar_url,
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
      
      {/* Profile Picture Section */}
      <div className="mb-8 text-center">
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-gray-400" />
            )}
          </div>
          <label 
            htmlFor="avatar-upload" 
            className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary-dark transition-colors shadow-lg"
          >
            <Camera className="w-5 h-5" />
          </label>
          <input 
            id="avatar-upload"
            type="file" 
            accept="image/*" 
            onChange={handleAvatarUpload}
            className="hidden"
            disabled={uploading}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {uploading ? 'Uploading...' : 'Click camera icon to upload'}
        </p>
      </div>

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
          <button type="submit" className="btn-primary" disabled={saveStatus==='saving' || uploading}>
            <Save size={18} className="mr-2" /> 
            {uploading ? 'Uploading...' : saveStatus==='saving' ? 'Saving...' : 'Save Profile'}
          </button>
          {saveStatus==='success' && <span className="ml-4 text-green-600 font-medium">Saved!</span>}
          {saveStatus==='error' && <span className="ml-4 text-red-600 font-medium">Error saving</span>}
        </div>
      </form>
    </div>
  );
} 