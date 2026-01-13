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
    <div className="flex flex-col h-full bg-rare-background">
      <main className="flex-grow">
        <Section background="gradient-soft" padding="lg">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-white/50 backdrop-blur-sm rounded-xl text-rare-primary shadow-sm">
                <FiSettings className="h-8 w-8" />
              </div>
              <div>
                <h1 className="font-heading text-4xl md:text-5xl font-normal text-rare-primary">
                  Site Settings
                </h1>
                <p className="font-body text-rare-text-light mt-1">
                  Manage global website configuration
                </p>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl mb-6 border ${message.includes('Error') ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* General Settings */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-rare-border/10">
                <h2 className="font-heading text-2xl font-normal text-rare-primary mb-6 border-b border-rare-border/10 pb-4">General Information</h2>
                <div className="grid gap-6">
                  <Input
                    label="Site Name"
                    name="site_name"
                    value={formData.site_name || ''}
                    onChange={handleChange}
                    fullWidth
                  />
                  <Input
                    label="Logo URL"
                    name="logo_url"
                    value={formData.logo_url || ''}
                    onChange={handleChange}
                    placeholder="/logo.png"
                    fullWidth
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-rare-border/10">
                <h2 className="font-heading text-2xl font-normal text-rare-primary mb-6 border-b border-rare-border/10 pb-4">Contact Details</h2>
                <div className="grid gap-6">
                  <Input
                    label="Contact Email"
                    name="contact_email"
                    value={formData.contact_email || ''}
                    onChange={handleChange}
                    fullWidth
                  />
                  <Input
                    label="Contact Phone"
                    name="contact_phone"
                    value={formData.contact_phone || ''}
                    onChange={handleChange}
                    fullWidth
                  />
                  <div className="w-full">
                    <label className="block text-sm font-body font-medium text-rare-text mb-2">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-3 border border-rare-border rounded-lg font-body text-rare-text placeholder:text-rare-text-light/50 focus:outline-none focus:ring-2 focus:ring-rare-primary focus:border-transparent transition-all min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-rare-border/10">
                <h2 className="font-heading text-2xl font-normal text-rare-primary mb-6 border-b border-rare-border/10 pb-4">Social Media Links</h2>
                <div className="grid gap-6">
                  <Input
                    label="Facebook URL"
                    name="social_facebook"
                    value={formData.social_facebook || ''}
                    onChange={handleChange}
                    fullWidth
                  />
                  <Input
                    label="Twitter URL"
                    name="social_twitter"
                    value={formData.social_twitter || ''}
                    onChange={handleChange}
                    fullWidth
                  />
                  <Input
                    label="Instagram URL"
                    name="social_instagram"
                    value={formData.social_instagram || ''}
                    onChange={handleChange}
                    fullWidth
                  />
                  <Input
                    label="LinkedIn URL"
                    name="social_linkedin"
                    value={formData.social_linkedin || ''}
                    onChange={handleChange}
                    fullWidth
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={saving}
                  className="w-full md:w-auto min-w-[200px]"
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
        </Section>
      </main>
    </div>
  );
}
