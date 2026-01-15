'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { FiSave, FiSettings } from 'react-icons/fi';

export default function AdminSettingsPage() {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();
  const { settings: initialSettings, loading: initialLoading } = useSiteSettings();

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!user || profile?.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, profile, isLoading, router]);

  useEffect(() => {
    if (!initialLoading) {
      setFormData(initialSettings as Record<string, string>);
    }
  }, [initialSettings, initialLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save settings');

      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rare-background">
        <div className="animate-spin h-8 w-8 border-2 border-rare-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <main className="flex-grow p-6 lg:p-10">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-800 rounded-xl text-white shadow-sm border border-slate-700">
              <FiSettings className="h-8 w-8" />
            </div>
            <div>
              <h1 className="font-heading text-4xl font-bold text-white">
                Site Settings
              </h1>
              <p className="font-body text-slate-400 mt-1">
                Manage global website configuration
              </p>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-xl mb-6 border ${message.includes('Error') ? 'bg-red-900/20 text-red-300 border-red-800' : 'bg-green-900/20 text-green-300 border-green-800'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* General Settings */}
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl border border-slate-700">
              <h2 className="font-heading text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-4">General Information</h2>
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Site Name</label>
                  <input
                    type="text"
                    name="site_name"
                    value={formData.site_name || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rare-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Logo URL</label>
                  <input
                    type="text"
                    name="logo_url"
                    value={formData.logo_url || ''}
                    onChange={handleChange}
                    placeholder="/logo.png"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rare-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl border border-slate-700">
              <h2 className="font-heading text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-4">Contact Details</h2>
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Contact Email</label>
                  <input
                    type="text"
                    name="contact_email"
                    value={formData.contact_email || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rare-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Contact Phone</label>
                  <input
                    type="text"
                    name="contact_phone"
                    value={formData.contact_phone || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rare-primary focus:border-transparent transition-all"
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg font-body text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rare-primary focus:border-transparent transition-all min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl border border-slate-700">
              <h2 className="font-heading text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-4">Social Media Links</h2>
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Facebook URL</label>
                  <input
                    type="text"
                    name="social_facebook"
                    value={formData.social_facebook || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rare-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Twitter URL</label>
                  <input
                    type="text"
                    name="social_twitter"
                    value={formData.social_twitter || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rare-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Instagram URL</label>
                  <input
                    type="text"
                    name="social_instagram"
                    value={formData.social_instagram || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rare-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">LinkedIn URL</label>
                  <input
                    type="text"
                    name="social_linkedin"
                    value={formData.social_linkedin || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rare-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={saving}
                className="w-full md:w-auto min-w-[200px] shadow-lg shadow-rare-primary/20"
              >
                {saving ? 'Saving...' : (
                  <span className="flex items-center gap-2">
                    <FiSave className="h-4 w-4" />
                    Save Changes
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
