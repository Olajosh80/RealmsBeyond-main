'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  role: 'admin' | 'user';
  full_name?: string;
  email?: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setIsLoading: (loading: boolean) => void;
  clearAuth: () => void;
  updateProfile: (profile: UserProfile) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isLoading: true,
      isAdmin: false,
      setUser: (user) => set({ user }),
      setProfile: (profile) => {
        set({
          profile,
          isAdmin: profile?.role === 'admin',
        });
      },
      setIsLoading: (isLoading) => set({ isLoading }),
      clearAuth: () =>
        set({
          user: null,
          profile: null,
          isAdmin: false,
          isLoading: false,
        }),
      updateProfile: (profile) =>
        set({
          profile,
          isAdmin: profile?.role === 'admin',
        }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        profile: state.profile,
        isAdmin: state.isAdmin,
      }),
    }
  )
);
