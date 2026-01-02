"use client";

import React from 'react';
import Sidebar from '@/app/admin/Sidebar/Sidebar';
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
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
