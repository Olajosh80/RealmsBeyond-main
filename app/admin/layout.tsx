"use client";

import React from 'react';
import Topbar from '@/app/admin/Topbar/topbar';

/**
 * Admin Layout
 * 
 * Note: This layout trusts middleware protection.
 * The middleware.ts file already handles:
 * - User authentication check
 * - Admin role verification
 * - Redirects for unauthorized access
 * 
 * No need for redundant client-side checks that cause re-authentication loops.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-gray-900">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 fixed"
        style={{ 
          backgroundImage: "url('/Background.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15
        }}
      />
      
      <div className="flex-1 flex flex-col relative z-10">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto bg-white/50 backdrop-blur-[2px]">{children}</main>
      </div>
    </div>
  );
}
