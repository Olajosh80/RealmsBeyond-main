'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { FiMenu } from 'react-icons/fi';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/signin');
      } else if (profile && profile.role !== 'admin') {
        router.push('/');
      } else if (profile && profile.role === 'admin') {
        setAuthorized(true);
      }
    }
  }, [user, profile, isLoading, router]);

  if (isLoading || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rare-background">
        <div className="animate-spin h-8 w-8 border-2 border-rare-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rare-background flex">
      {/* Sidebar for Desktop */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen relative">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-rare-border/10 p-4 flex items-center justify-between sticky top-0 z-30">
          <span className="font-heading font-bold text-rare-primary">Admin Dashboard</span>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-rare-primary">
            <FiMenu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="absolute top-0 bottom-0 left-0 w-64 bg-white shadow-xl">
              <AdminSidebar />
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}
