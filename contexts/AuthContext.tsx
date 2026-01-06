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
    const fetchInProgress = React.useRef<string | null>(null);
    const lastFetchedId = React.useRef<string | null>(null);
    
    const fetchProfileManually = async (userId: string, force: boolean = false) => {
        // Prevent concurrent fetches for the same user
        if (fetchInProgress.current === userId) {
            console.log('[AuthContext] Fetch already in progress for user:', userId);
            return;
        }
    
        // Skip if we already fetched this user successfully and not forcing
        if (!force && lastFetchedId.current === userId && store.profile?.id === userId) {
            console.log('[AuthContext] Profile already fetched for user:', userId);
            return;
        }
    
        try {
            fetchInProgress.current = userId;
            console.log('[AuthContext] Fetching profile for user:', userId);
            
            const { data: profileData, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();
            
            if (error) {
                console.error('[AuthContext] Error fetching profile:', error);
                store.setProfile(null);
                return;
            }
            
            if (!profileData) {
                console.warn('[AuthContext] No profile data returned for user:', userId);
                store.setProfile(null);
                return;
            }

            // Cache profile in localStorage
            localStorage.setItem(`user_profile_${userId}`, JSON.stringify(profileData));
            store.setProfile(profileData);
            lastFetchedId.current = userId;
            console.log('[AuthContext] Profile fetched and cached:', { id: profileData.id, role: profileData.role });
        } catch (err) {
            console.error('[AuthContext] Exception fetching profile:', err);
            store.setProfile(null);
        } finally {
            fetchInProgress.current = null;
        }
    };

    // Initialize auth state on mount
    useEffect(() => {
        setMounted(true);

        if (hasInitialized) return;
        
        const initializeAuth = async () => {
            try {
                store.setIsLoading(true);
                // Use getSession instead of getUser for initial check to avoid triggering redundant refreshes
                // getUser is more secure but getSession is faster and less prone to race conditions on mount
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        store.setUser(currentUser);
        
        if (currentUser?.id) {
            const cachedProfile = localStorage.getItem(`user_profile_${currentUser.id}`);
            if (cachedProfile) {
                const profileData = JSON.parse(cachedProfile);
                store.setProfile(profileData);
                lastFetchedId.current = currentUser.id;
            } else {
                // Auto-fetch if not in cache
                await fetchProfileManually(currentUser.id);
            }
        }
                
                setHasInitialized(true);
            } catch (err: any) {
                // Silently handle "Already Used" error as it's often a race condition
                if (err?.message?.includes('Already Used')) {
                    console.warn('[AuthContext] Refresh token already used, ignoring conflict');
                } else {
                    console.error('[AuthContext] Error during initialization:', err);
                }
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
                    if (currentUser?.id) {
                        localStorage.removeItem(`user_profile_${currentUser.id}`);
                    }
                    lastFetchedId.current = null;
                    store.clearAuth();
                } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                    if (currentUser?.id) {
                        // For USER_UPDATED or TOKEN_REFRESHED, we might want to force fetch
                        const shouldForce = event === 'USER_UPDATED';
                        
                        const cachedProfile = localStorage.getItem(`user_profile_${currentUser.id}`);
                        if (cachedProfile && !shouldForce) {
                            const profileData = JSON.parse(cachedProfile);
                            store.setProfile(profileData);
                            lastFetchedId.current = currentUser.id;
                        } else {
                            await fetchProfileManually(currentUser.id, shouldForce);
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
                // When explicitly refreshing, we force fetch
                await fetchProfileManually(currentUser.id, true);
            }
        } catch (err) {
            console.error('[AuthContext] Error refreshing auth:', err);
        } finally {
            store.setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user: mounted ? store.user : null,
                profile: mounted ? store.profile : null,
                isLoading: mounted ? store.isLoading : true,
                isAdmin: mounted ? store.isAdmin : false,
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
