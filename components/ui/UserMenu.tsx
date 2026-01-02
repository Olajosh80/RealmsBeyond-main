'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiUser, FiLogOut, FiPackage, FiSettings } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';

interface UserMenuProps {
  user: any;
  profile: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  profile,
  isOpen,
  onClose,
  anchorEl,
}) => {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorEl]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onClose();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      const names = profile.full_name.trim().split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    return profile?.full_name || user?.email || 'User';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Dropdown Menu */}
      <div
        ref={menuRef}
        className="absolute right-0 top-full mt-2 w-56 rounded-lg bg-white shadow-lg border border-rare-border z-50 overflow-hidden"
        style={{ position: 'absolute' }}
      >
        {/* User Info Header */}
        <div className="px-4 py-3 bg-gradient-soft border-b border-rare-border">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={getUserDisplayName()}
                className="w-10 h-10 rounded-full object-cover border-2 border-rare-primary"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-rare-primary text-white flex items-center justify-center font-body font-semibold text-sm">
                {getUserInitials()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-heading text-sm font-normal text-rare-primary truncate">
                {getUserDisplayName()}
              </p>
              <p className="font-body text-xs text-rare-text-light truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          <Link
            href="/profile"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2 text-sm font-body text-rare-text hover:bg-rare-primary-light transition-colors"
          >
            <FiUser className="h-4 w-4 text-rare-primary" />
            My Profile
          </Link>

          <Link
            href="/orders"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2 text-sm font-body text-rare-text hover:bg-rare-primary-light transition-colors"
          >
            <FiPackage className="h-4 w-4 text-rare-primary" />
            My Orders
          </Link>

          {profile?.role === 'admin' && (
            <Link
              href="/admin"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2 text-sm font-body text-rare-text hover:bg-rare-primary-light transition-colors border-t border-rare-border mt-2 pt-2"
            >
              <FiSettings className="h-4 w-4 text-rare-primary" />
              Admin Panel
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-body text-red-600 hover:bg-red-50 transition-colors border-t border-rare-border mt-2 pt-2"
          >
            <FiLogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

