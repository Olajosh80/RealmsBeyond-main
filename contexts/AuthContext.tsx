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
                const refreshResponse = await fetch('/api/auth/refresh', { method: 'POST' });

                if (refreshResponse.ok) {
                    const retryResponse = await fetch('/api/auth/me');
                    if (retryResponse.ok) {
                        const data = await retryResponse.json();
                        store.setUser(data.user);
                        store.setProfile(data.profile);
                    } else {
                        store.clearAuth();
                    }
                } else {
                    store.clearAuth();
                }
            } else {
                store.clearAuth();
            }
        } catch {
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
            } catch {
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
        } catch {
            store.clearAuth();
        }
    };

    const refreshAuth = async () => {
        try {
            store.setIsLoading(true);
            await fetchAuthStatus();
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
