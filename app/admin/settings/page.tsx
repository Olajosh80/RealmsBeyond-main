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
    <div className="space-y-6">
      <div className="p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
        <h2 className="text-4xl font-heading font-normal text-rare-primary mb-2">Settings</h2>
        <p className="text-rare-text-light font-body">Manage your site configurations and security.</p>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-8 bg-white/40 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-xl">
        {/* General Settings */}
        <div>
          <h3 className="text-xl font-heading font-normal text-rare-primary mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-600">1</span>
            General Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-body text-rare-text-light ml-1">Site Name</label>
              <input
                type="text"
                name="siteName"
                value={form.siteName}
                onChange={handleChange}
                placeholder="Site Name"
                className="w-full p-2.5 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-body"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-body text-rare-text-light ml-1">Contact Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Contact Email"
                className="w-full p-2.5 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-body"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-body text-rare-text-light ml-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                className="w-full p-2.5 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-body"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-body text-rare-text-light ml-1">Business Address</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Address"
                className="w-full p-2.5 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-body"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="pt-6 border-t border-white/10">
          <h3 className="text-xl font-heading font-normal text-rare-primary mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-600">2</span>
            Social Media Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-body text-rare-text-light ml-1">Facebook</label>
              <input
                type="text"
                name="facebook"
                value={form.facebook}
                onChange={handleChange}
                placeholder="Facebook URL"
                className="w-full p-2.5 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-body"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-body text-rare-text-light ml-1">Instagram</label>
              <input
                type="text"
                name="instagram"
                value={form.instagram}
                onChange={handleChange}
                placeholder="Instagram URL"
                className="w-full p-2.5 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-body"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-body text-rare-text-light ml-1">Twitter</label>
              <input
                type="text"
                name="twitter"
                value={form.twitter}
                onChange={handleChange}
                placeholder="Twitter URL"
                className="w-full p-2.5 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-body"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-body text-rare-text-light ml-1">LinkedIn</label>
              <input
                type="text"
                name="linkedin"
                value={form.linkedin}
                onChange={handleChange}
                placeholder="LinkedIn URL"
                className="w-full p-2.5 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-body"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="pt-6 border-t border-white/10">
          <h3 className="text-xl font-heading font-normal text-rare-primary mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center text-green-600">3</span>
            Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-1">
              <label className="text-xs font-body text-rare-text-light ml-1">Default Currency</label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="w-full p-2.5 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-body"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
            <label className="flex items-center gap-3 cursor-pointer group mt-4">
              <div className="relative">
                <input
                  type="checkbox"
                  name="darkMode"
                  checked={form.darkMode}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </div>
              <span className="text-sm font-body text-rare-primary group-hover:text-blue-600 transition-colors">Enable Dark Mode</span>
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div className="pt-6 border-t border-white/10">
          <h3 className="text-xl font-heading font-normal text-rare-primary mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center text-red-600">4</span>
            Security & Authentication
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-body text-rare-text-light ml-1">New Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full p-2.5 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-body"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-body text-rare-text-light ml-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full p-2.5 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-body"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 mt-4 text-white bg-blue-600/80 hover:bg-blue-600 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-heading text-lg"
        >
          {saving ? (
            <>
              <AiOutlineLoading3Quarters className="h-5 w-5 animate-spin" />
              Saving Site Configuration...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </form>
    </div>
  );
}
