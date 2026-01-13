'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthStore, UserProfile } from '@/lib/stores/authStore';
import { LoginModal } from '@/components/auth/LoginModal';

interface AuthContextType {
    user: any | null;
    profile: UserProfile | null;
    isLoading: boolean;
    isAdmin: boolean;
    signOut: () => Promise<void>;
    refreshAuth: () => Promise<void>;
    openLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const store = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const openLoginModal = () => setIsLoginModalOpen(true);
    const closeLoginModal = () => setIsLoginModalOpen(false);

    const fetchAuthStatus = async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                store.setUser(data.user);
                store.setProfile(data.profile);
            } else if (response.status === 401) {
                // Access token missing or expired, try to refresh
                console.log('[AuthContext] Access token expired, attempting refresh...');
                const refreshResponse = await fetch('/api/auth/refresh', { method: 'POST' });

                if (refreshResponse.ok) {
                    console.log('[AuthContext] Refresh successful, retrying auth check...');
                    // Retry fetching auth status
                    const retryResponse = await fetch('/api/auth/me');
                    if (retryResponse.ok) {
                        const data = await retryResponse.json();
                        store.setUser(data.user);
                        store.setProfile(data.profile);
                    } else {
                        store.clearAuth();
                    }
                } else {
                    console.log('[AuthContext] Refresh failed, clearing auth.');
                    store.clearAuth();
                }
            } else {
                store.clearAuth();
            }
        } catch (err) {
            console.error('[AuthContext] Error fetching auth status:', err);
            store.clearAuth();
        }
    };

    // Initialize auth state on mount
    useEffect(() => {
        setMounted(true);

        if (hasInitialized) return;

        const initializeAuth = async () => {
            try {
                store.setIsLoading(true);
                await fetchAuthStatus();
                setHasInitialized(true);
            } catch (err: any) {
                console.error('[AuthContext] Error during initialization:', err);
                setHasInitialized(true);
            } finally {
                store.setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const signOut = async () => {
        try {
            await fetch('/api/auth/signout', { method: 'POST' });
            store.clearAuth();
        } catch (err) {
            console.error('[AuthContext] Error signing out:', err);
        }
    };

    const refreshAuth = async () => {
        try {
            store.setIsLoading(true);
            await fetchAuthStatus();
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
                openLoginModal,
            }}
        >
            {children}
            <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
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
