"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdErrorOutline, MdCheckCircle } from 'react-icons/md';

export default function SettingsPage() {
  const [form, setForm] = useState({
    siteName: "Beyond Realms LTD",
    email: "info@beyondrealms.com",
    phone: "+1 (234) 567-890",
    address: "123 Business Avenue, Suite 100, New York, NY 10001",
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    currency: "USD",
    darkMode: false,
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load settings from Supabase
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('site_settings')
          .select('*');

        if (fetchError) throw fetchError;

        // Map settings to form
        if (data) {
          const settingsMap: Record<string, string> = {};
          data.forEach(setting => {
            settingsMap[setting.key] = setting.value || '';
          });

          setForm(prev => ({
            ...prev,
            siteName: settingsMap['site_name'] || prev.siteName,
            email: settingsMap['contact_email'] || prev.email,
            phone: settingsMap['contact_phone'] || prev.phone,
            address: settingsMap['contact_address'] || prev.address,
            facebook: settingsMap['social_facebook'] || '',
            instagram: settingsMap['social_instagram'] || '',
            twitter: settingsMap['social_twitter'] || '',
            linkedin: settingsMap['social_linkedin'] || '',
            currency: settingsMap['currency'] || prev.currency,
          }));
        }
      } catch (err: any) {
        console.error('Error loading settings:', err);
        setError('Failed to load settings. Using defaults.');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate password if provided
      if (form.password || form.confirmPassword) {
        if (form.password !== form.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (form.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        // TODO: Update admin password via Supabase Auth
      }

      // Prepare settings to save
      const settingsToSave = [
        { key: 'site_name', value: form.siteName, category: 'general' },
        { key: 'contact_email', value: form.email, category: 'general' },
        { key: 'contact_phone', value: form.phone, category: 'general' },
        { key: 'contact_address', value: form.address, category: 'general' },
        { key: 'social_facebook', value: form.facebook, category: 'social' },
        { key: 'social_instagram', value: form.instagram, category: 'social' },
        { key: 'social_twitter', value: form.twitter, category: 'social' },
        { key: 'social_linkedin', value: form.linkedin, category: 'social' },
        { key: 'currency', value: form.currency, category: 'general' },
      ];

      // Upsert settings
      for (const setting of settingsToSave) {
        const { error: upsertError } = await supabase
          .from('site_settings')
          .upsert({ key: setting.key, value: setting.value, category: setting.category }, {
            onConflict: 'key'
          });

        if (upsertError) throw upsertError;
      }

      setSuccess('Settings saved successfully!');
      setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <AiOutlineLoading3Quarters className="h-8 w-8 animate-spin text-blue-600 mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold mb-4">Settings</h2>
      <p className="text-gray-600 dark:text-gray-400">Manage your site settings here.</p>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          <MdErrorOutline className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
          <MdCheckCircle className="h-5 w-5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
        {/* General Settings */}
        <h3 className="text-xl font-semibold mb-4">General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="siteName"
            value={form.siteName}
            onChange={handleChange}
            placeholder="Site Name"
            className="p-2 border rounded-lg w-full"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Contact Email"
            className="p-2 border rounded-lg w-full"
          />
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="p-2 border rounded-lg w-full"
          />
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
            className="p-2 border rounded-lg w-full"
          />
        </div>

        {/* Social Links */}
        <h3 className="text-xl font-semibold mt-6 mb-4">Social Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="facebook"
            value={form.facebook}
            onChange={handleChange}
            placeholder="Facebook URL"
            className="p-2 border rounded-lg w-full"
          />
          <input
            type="text"
            name="instagram"
            value={form.instagram}
            onChange={handleChange}
            placeholder="Instagram URL"
            className="p-2 border rounded-lg w-full"
          />
          <input
            type="text"
            name="twitter"
            value={form.twitter}
            onChange={handleChange}
            placeholder="Twitter URL"
            className="p-2 border rounded-lg w-full"
          />
          <input
            type="text"
            name="linkedin"
            value={form.linkedin}
            onChange={handleChange}
            placeholder="LinkedIn URL"
            className="p-2 border rounded-lg w-full"
          />
        </div>

        {/* Additional Settings */}
        <h3 className="text-xl font-semibold mt-6 mb-4">Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            name="currency"
            value={form.currency}
            onChange={handleChange}
            className="p-2 border rounded-lg w-full"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="darkMode"
              checked={form.darkMode}
              onChange={handleChange}
            />
            Enable Dark Mode
          </label>
        </div>

        {/* Security Settings */}
        <h3 className="text-xl font-semibold mt-6 mb-4">Security</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="New Password"
            className="p-2 border rounded-lg w-full"
          />
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            className="p-2 border rounded-lg w-full"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <AiOutlineLoading3Quarters className="h-4 w-4 animate-spin" />
              Saving Settings...
            </>
          ) : (
            'Save Settings'
          )}
        </button>
      </form>
    </div>
  );
}
