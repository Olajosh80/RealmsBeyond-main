'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, profile } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: false,
  });

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      console.log('[Sign In Page] User already logged in:', user.email);
      // Redirect to appropriate dashboard based on role
      if (profile?.role === 'admin') {
        console.log('[Sign In Page] Redirecting admin user to /admin');
        router.push('/admin');
      } else {
        console.log('[Sign In Page] Redirecting user to home');
        router.push('/');
      }
    }
  }, [user, isLoading, profile, router]);

  const performSignIn = async (email: string, password: string) => {
    setLoading(true);
    setError('');

    try {
      console.log('[Sign In] Calling sign-in API...');
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Sign in failed');
      }

      console.log('[Sign In] API Sign in successful');
      
      // Manually set the session in the client-side Supabase client 
      // so other components can see the user is logged in
      const { data: authData, error: sessionError } = await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      });

      if (sessionError) {
        throw new Error('Failed to establish session: ' + sessionError.message);
      }

      if (authData.user) {
        console.log('[Sign In] Session established for:', authData.user.email);
        
        // Fetch profile and redirect
        try {
          const profileResponse = await fetch('/api/users/' + authData.user.id);
          const profileData = await profileResponse.json();
          
          if (profileData && profileData.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/');
          }
        } catch (err) {
          console.error('[Sign In] Profile fetch error, defaulting to home');
          router.push('/');
        }
      }
    } catch (err: any) {
      console.error('[Sign In] Error:', err);
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  // Populate form with query params if provided (user will click sign in button to trigger API)
  useEffect(() => {
    const email = searchParams.get('email');
    const password = searchParams.get('password');
    
    if (email && password) {
      console.log('[Sign In] Query params detected, populating form for:', email);
      // Decode URL-encoded values and populate the form
      // User will click the sign-in button to trigger the API call
      setForm(prev => ({
        ...prev,
        email: decodeURIComponent(email),
        password: decodeURIComponent(password),
      }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performSignIn(form.email, form.password);
  };

  // Show loading state while checking if user is logged in
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rare-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rare-primary mx-auto"></div>
          <p className="mt-4 text-rare-text-light">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-rare-background">
      <Section background="gradient-soft" padding="lg" withTexture>
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <h1 className="text-3xl font-bold text-rare-primary mb-2">Sign In</h1>
            <p className="text-rare-text-light mb-6 text-sm">
              Enter your email and password to sign in!
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
                  {error}
                </div>
              )}

              {/* Email */}
              <Input
                label="Email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="mail@example.com"
                fullWidth
              />

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-body font-medium text-rare-text">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="Min. 8 characters"
                    className="w-full px-4 py-3 border border-rare-border rounded-lg font-body text-rare-text placeholder:text-rare-text-light/50 focus:outline-none focus:ring-2 focus:ring-rare-primary focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-rare-text-light hover:text-rare-primary transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <RiEyeCloseLine size={20} /> : <MdOutlineRemoveRedEye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center text-rare-text cursor-pointer group">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={handleChange}
                    className="h-4 w-4 text-rare-primary rounded border-rare-border focus:ring-rare-primary mr-2 cursor-pointer"
                  />
                  <span className="group-hover:text-rare-primary transition-colors">Keep me logged in</span>
                </label>
                <Link href="/forgot-password" title="Forgot Password" className="text-rare-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                fullWidth
                className="py-4 shadow-md hover:shadow-lg transform transition-all active:scale-[0.98]"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center space-y-4">
              <p className="text-sm text-rare-text-light">
                Not registered yet?
              </p>
              <Button 
                href="/signup" 
                variant="outline" 
                fullWidth 
                className="py-3"
              >
                Create an Account
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}

export default function SignInPage() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-rare-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rare-primary mx-auto"></div>
            <p className="mt-4 text-rare-text-light">Loading...</p>
          </div>
        </div>
      }>
        <SignInForm />
      </Suspense>
      <Footer />
    </>
  );
}
