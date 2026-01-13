'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthStore } from '@/lib/stores/authStore';
import { Loader } from '@/components/ui/Loader';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SignUpPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    agree: false,
  });

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
    setLoading(true);
    setError('');

    try {
      console.log('[Sign Up] Sending signup request to API...');
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          confirm_password: form.confirm_password,
          full_name: form.name,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account');
      }

      console.log('[Sign Up] Account created successfully:', result.user?.id);
      setSuccess(true);
      setTimeout(() => {
        router.push('/verify-email');
      }, 2000);
    } catch (err: any) {
      console.error('[Sign Up] Error:', err);
      setError(err.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };





  if (user || isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-rare-background">
        <Section background="gradient-soft" padding="lg" withTexture>
          <div className="container mx-auto px-4 flex items-center justify-center min-h-[70vh]">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
              {/* Header */}
              <h1 className="text-3xl font-bold text-rare-primary mb-2">Sign Up</h1>
              <p className="text-rare-text-light mb-6 text-sm">
                Enter your details to create your account!
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
                    {error}
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="p-4 rounded-xl bg-green-50 text-green-700 text-sm border border-green-100">
                    Account created successfully! Redirecting to sign in...
                  </div>
                )}

                {/* Name */}
                <Input
                  label="Name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                  fullWidth
                />

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

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-body font-medium text-rare-text">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirm_password"
                      value={form.confirm_password}
                      onChange={handleChange}
                      required
                      placeholder="Re-enter your password"
                      className="w-full px-4 py-3 border border-rare-border rounded-lg font-body text-rare-text placeholder:text-rare-text-light/50 focus:outline-none focus:ring-2 focus:ring-rare-primary focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-rare-text-light hover:text-rare-primary transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <RiEyeCloseLine size={20} /> : <MdOutlineRemoveRedEye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Agree to terms */}
                <label className="flex items-center text-rare-text text-sm cursor-pointer group">
                  <input
                    type="checkbox"
                    name="agree"
                    checked={form.agree}
                    onChange={handleChange}
                    className="h-4 w-4 text-rare-primary rounded border-rare-border focus:ring-rare-primary mr-2 cursor-pointer"
                    required
                  />
                  <span className="group-hover:text-rare-primary transition-colors">
                    I agree to the <Link href="/terms" className="text-rare-primary font-medium hover:underline">Terms & Conditions</Link>
                  </span>
                </label>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading || success}
                  fullWidth
                  className="py-4 shadow-md hover:shadow-lg transform transition-all active:scale-[0.98]"
                >
                  {loading ? 'Creating account...' : success ? 'Account created!' : 'Sign Up'}
                </Button>
              </form>

              {/* Sign In Link */}
              <div className="mt-8 text-center space-y-4">
                <p className="text-sm text-rare-text-light">
                  Already have an account?
                </p>
                <Button
                  href="/signin"
                  variant="outline"
                  fullWidth
                  className="py-3"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
