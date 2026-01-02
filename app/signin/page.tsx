'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function SignInPage() {
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
      console.log('[Sign In] Calling Supabase auth endpoint for:', email);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log('[Sign In] Sign in successful for:', data.user.email);
        console.log('[Sign In] User ID:', data.user.id);
        
        // Immediately call profile endpoint
        try {
          console.log('[Sign In] Attempting to fetch profile from /api/users/' + data.user.id);
          const profileResponse = await fetch('/api/users/' + data.user.id);
          
          console.log('[Sign In] Profile API response status:', profileResponse.status);
          
          if (!profileResponse.ok) {
            throw new Error(`Profile API returned status ${profileResponse.status}`);
          }
          
          const profileData = await profileResponse.json();
          
          console.log('[Sign In] Profile API response:', profileData);
          
          if (profileData && profileData.role) {
            // Redirect based on role from API response
            if (profileData.role === 'admin') {
              console.log('[Sign In] Admin user detected, redirecting to /admin');
              router.push('/admin');
            } else {
              console.log('[Sign In] Regular user, redirecting to home');
              router.push('/');
            }
          } else {
            console.log('[Sign In] No role in profile, redirecting to home');
            router.push('/');
          }
        } catch (err) {
          console.error('[Sign In] Error calling profile API:', err);
          // Fallback: try reading from database directly
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle();
          
          console.log('[Sign In] Fallback - Profile:', profile);
          
          if (profile?.role === 'admin') {
            console.log('[Sign In] Admin detected via fallback, redirecting to /admin');
            router.push('/admin');
          } else {
            console.log('[Sign In] Regular user via fallback, redirecting to home');
            router.push('/');
          }
        }
      } else {
        console.error('[Sign In] No user returned from authentication');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during sign in';
      setError(errorMessage);
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
  }, []);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Sign In</h1>
        <p className="text-gray-500 dark:text-gray-300 mb-6 text-sm">
          Enter your email and password to sign in!
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-100 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="mail@example.com"
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Min. 8 characters"
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              {showPassword ? <RiEyeCloseLine /> : <MdOutlineRemoveRedEye />}
            </button>
          </div>

          {/* Remember & Forgot */}
          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 mr-2"
              />
              Keep me logged in
            </label>
            <Link href="/forgot-password" className="text-blue-600 dark:text-blue-400 hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
          Not registered yet?{' '}
          <Link href="/signup" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
