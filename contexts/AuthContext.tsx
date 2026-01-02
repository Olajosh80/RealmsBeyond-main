'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore, UserProfile } from '@/lib/stores/authStore';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    isLoading: boolean;
    isAdmin: boolean;
    signOut: () => Promise<void>;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const store = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);

    const loadUserProfile = async (userId: string) => {
        try {
            console.log('[AuthContext] Loading profile for user:', userId);
            
            // Check if profile is cached in Zustand store first
            if (store.profile?.id === userId) {
                console.log('[AuthContext] Profile already in store, skipping fetch');
                return;
            }
            
            // Check if profile is cached in localStorage
            const cachedProfile = localStorage.getItem(`user_profile_${userId}`);
            if (cachedProfile) {
                const profileData = JSON.parse(cachedProfile);
                store.setProfile(profileData);
                console.log('[AuthContext] Profile loaded from cache:', { id: profileData.id, role: profileData.role });
                return;
            }
            
            // Only fetch from API if explicitly needed (manual call)
            // Auto-loading is prevented to respect user preference
            console.log('[AuthContext] Profile not cached, waiting for manual trigger');
        } catch (err) {
            console.error('[AuthContext] Exception loading profile:', err);
            store.setProfile(null);
        }
    };

    const fetchProfileManually = async (userId: string) => {
        try {
            console.log('[AuthContext] Manually fetching profile for user:', userId);
            
            // Call API endpoint to fetch user profile
            const response = await fetch(`/api/users/${userId}`);
            console.log('[AuthContext] Profile API response status:', response.status);
            
            if (!response.ok) {
                console.warn('[AuthContext] Profile API returned status:', response.status);
                store.setProfile(null);
                return;
            }
            
            const profileData = await response.json();
            
            if (!profileData) {
                console.warn('[AuthContext] No profile data returned for user:', userId);
                store.setProfile(null);
                return;
            }

            // Cache profile in localStorage
            localStorage.setItem(`user_profile_${userId}`, JSON.stringify(profileData));
            store.setProfile(profileData);
            console.log('[AuthContext] Profile fetched manually and cached:', { id: profileData.id, role: profileData.role });
        } catch (err) {
            console.error('[AuthContext] Exception fetching profile:', err);
            store.setProfile(null);
        }
    };

    // Initialize auth state on mount - ONLY check session, don't fetch profile
    useEffect(() => {
        setMounted(true);

        // One-time initialization
        if (hasInitialized) return;
        
        const initializeAuth = async () => {
            try {
                store.setIsLoading(true);
                const { data: { user: currentUser } } = await supabase.auth.getUser();
                store.setUser(currentUser);
                
                // Load profile from cache if available
                if (currentUser?.id) {
                    const cachedProfile = localStorage.getItem(`user_profile_${currentUser.id}`);
                    if (cachedProfile) {
                        const profileData = JSON.parse(cachedProfile);
                        store.setProfile(profileData);
                    }
                }
                
                setHasInitialized(true);
            } catch (err) {
                console.error('[AuthContext] Error during initialization:', err);
                setHasInitialized(true);
            } finally {
                store.setIsLoading(false);
            }
        };
        
        initializeAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('[AuthContext] Auth state changed:', event);

                const currentUser = session?.user ?? null;
                store.setUser(currentUser);

                if (event === 'SIGNED_OUT') {
                    // Clear everything on sign out
                    if (currentUser?.id) {
                        localStorage.removeItem(`user_profile_${currentUser.id}`);
                    }
                    store.clearAuth();
                } else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                    // Only load from cache on sign in, don't fetch from API
                    if (currentUser?.id) {
                        const cachedProfile = localStorage.getItem(`user_profile_${currentUser.id}`);
                        if (cachedProfile) {
                            const profileData = JSON.parse(cachedProfile);
                            store.setProfile(profileData);
                        }
                    }
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            store.clearAuth();
        } catch (err) {
            console.error('[AuthContext] Error signing out:', err);
        }
    };

    const refreshAuth = async () => {
        try {
            store.setIsLoading(true);
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            store.setUser(currentUser);

            if (currentUser?.id) {
                await fetchProfileManually(currentUser.id);
            }
        } catch (err) {
            console.error('[AuthContext] Error refreshing auth:', err);
        } finally {
            store.setIsLoading(false);
        }
    };

    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <AuthContext.Provider
            value={{
                user: store.user,
                profile: store.profile,
                isLoading: store.isLoading,
                isAdmin: store.isAdmin,
                signOut,
                refreshAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
