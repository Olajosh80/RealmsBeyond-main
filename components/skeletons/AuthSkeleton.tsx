import React from 'react';
import { Section } from '@/components/ui/Section';
import { Skeleton } from '@/components/ui/Skeleton';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export function AuthSkeleton() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-rare-background">
                <Section background="gradient-soft" padding="lg" withTexture>
                    <div className="container mx-auto px-4 flex items-center justify-center min-h-[70vh]">
                        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-8">
                            {/* Header Skeleton */}
                            <div className="space-y-4">
                                <Skeleton className="h-10 w-32" />
                                <Skeleton className="h-4 w-48" />
                            </div>

                            {/* Form Skeleton */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-12" />
                                    <Skeleton className="h-12 w-full" />
                                </div>

                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-12 w-full" />
                                </div>

                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-32" />
                                </div>

                                <Skeleton className="h-14 w-full rounded-lg" />
                            </div>

                            {/* Footer Link Skeleton */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <div className="flex justify-center">
                                    <Skeleton className="h-4 w-40" />
                                </div>
                                <Skeleton className="h-12 w-full" />
                            </div>
                        </div>
                    </div>
                </Section>
            </main>
            <Footer />
        </>
    );
}
