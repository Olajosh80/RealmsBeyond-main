'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiCheck, FiX } from 'react-icons/fi';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading, refreshAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/signin?returnTo=/profile');
      return;
    }

    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
      setLoading(false);
    } else {
      // Profile will be fetched by AuthContext. If it's still null and authLoading is false,
      // it means fetching failed or user has no profile.
      setLoading(false);
    }
  }, [user, profile, authLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSave = async () => {
    if (!user) return;
    
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Refresh global auth state to pick up changes
      await refreshAuth();

      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err?.message || 'Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setError('');
    setFormData({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <Section background="gradient-soft" padding="lg">
          <div className="container">
            <div className="flex justify-center items-center py-20">
              <p className="font-body text-rare-text-light">Loading profile...</p>
            </div>
          </div>
        </Section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-rare-background">
        <Section background="gradient-soft" padding="lg">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h1 className="font-heading text-4xl md:text-5xl font-normal text-rare-primary">
                  My Profile
                </h1>
                {!editing && (
                  <Button
                    variant="primary"
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <FiEdit2 size={18} />
                    Edit Profile
                  </Button>
                )}
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 rounded-xl bg-green-50 text-green-700 text-sm border border-green-100">
                  {success}
                </div>
              )}

              <Card padding="lg">
                {!editing ? (
                  // View Mode
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Avatar Section */}
                    <div className="flex-shrink-0 text-center md:text-left">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name || user?.email || 'User'}
                          className="w-32 h-32 rounded-full object-cover border-4 border-rare-primary mx-auto md:mx-0"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-rare-primary text-white flex items-center justify-center font-heading text-4xl font-normal mx-auto md:mx-0">
                          {profile?.full_name
                            ? profile.full_name
                              .trim()
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()
                            : user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 space-y-6">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-body font-medium text-rare-text-light mb-2">
                          <FiUser className="h-4 w-4" />
                          Full Name
                        </label>
                        <p className="font-body text-lg text-rare-primary">
                          {profile?.full_name || 'Not set'}
                        </p>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-body font-medium text-rare-text-light mb-2">
                          <FiMail className="h-4 w-4" />
                          Email
                        </label>
                        <p className="font-body text-lg text-rare-primary">
                          {user?.email || 'Not available'}
                        </p>
                      </div>

                      {profile?.phone && (
                        <div>
                          <label className="flex items-center gap-2 text-sm font-body font-medium text-rare-text-light mb-2">
                            <FiPhone className="h-4 w-4" />
                            Phone
                          </label>
                          <p className="font-body text-lg text-rare-primary">
                            {profile.phone}
                          </p>
                        </div>
                      )}

                      {profile?.address && (
                        <div>
                          <label className="flex items-center gap-2 text-sm font-body font-medium text-rare-text-light mb-2">
                            <FiMapPin className="h-4 w-4" />
                            Address
                          </label>
                          <p className="font-body text-lg text-rare-primary">
                            {profile.address}
                          </p>
                        </div>
                      )}

                      <div className="pt-4 border-t border-rare-border">
                        <Button href="/orders" variant="primary">
                          View My Orders
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Edit Mode
                  <div className="space-y-6">
                    <Input
                      label="Full Name"
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      fullWidth
                    />

                    <Input
                      label="Phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Your phone number"
                      fullWidth
                    />

                    <div>
                      <label className="block text-sm font-body font-medium text-rare-text mb-2">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Your address"
                        className="w-full px-4 py-3 border border-rare-border rounded-lg font-body text-rare-text placeholder:text-rare-text-light/50 focus:outline-none focus:ring-2 focus:ring-rare-primary focus:border-transparent transition-all min-h-[100px]"
                      />
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-rare-border">
                      <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={updating}
                        fullWidth
                        className="flex items-center justify-center gap-2"
                      >
                        <FiCheck size={18} />
                        {updating ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={updating}
                        fullWidth
                        className="flex items-center justify-center gap-2"
                      >
                        <FiX size={18} />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </Section>
      </main>

      <Footer />
    </>
  );
}

