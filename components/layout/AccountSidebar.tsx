'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiUser, FiPackage, FiLogOut } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ href, icon: Icon, label, active }) => (
  <Link
    href={href}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      active
        ? 'bg-rare-primary text-white shadow-md'
        : 'text-rare-text-light hover:bg-rare-primary-light hover:text-rare-primary'
    }`}
  >
    <Icon className="h-5 w-5" />
    <span className="font-body font-medium">{label}</span>
  </Link>
);

export const AccountSidebar: React.FC = () => {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const menuItems = [
    { href: '/profile', icon: FiUser, label: 'My Profile' },
    { href: '/orders', icon: FiPackage, label: 'My Orders' },
  ];

  return (
    <aside className="w-full md:w-64 space-y-8">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-rare-border/10">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
            />
          ))}
          
          <div className="pt-4 mt-4 border-t border-rare-border/10">
            <button
              onClick={() => signOut()}
              className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left text-red-600 hover:bg-red-50 transition-all"
            >
              <FiLogOut className="h-5 w-5" />
              <span className="font-body font-medium">Sign Out</span>
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
};
