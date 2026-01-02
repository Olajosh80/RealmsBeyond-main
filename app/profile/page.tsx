'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
          router.push('/signin?returnTo=/profile');
          return;
        }

        setUser(currentUser);

        const { data: profileData, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (error) throw error;
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
        router.push('/signin?returnTo=/profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []); // Empty dependency array - only run once on mount

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
              <h1 className="font-heading text-4xl md:text-5xl font-normal text-rare-primary mb-8">
                My Profile
              </h1>

              <Card padding="lg">
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
              </Card>
            </div>
          </div>
        </Section>
      </main>

      <Footer />
    </>
  );
}

