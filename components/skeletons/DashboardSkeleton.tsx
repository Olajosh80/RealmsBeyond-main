import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-rare-background flex">
            {/* Sidebar Skeleton */}
            <div className="hidden lg:block w-64 border-r border-rare-border/10 bg-white/50 backdrop-blur-xl p-6 space-y-8">
                {/* Logo */}
                <div className="px-2 mb-8">
                    <Skeleton className="h-8 w-32" />
                </div>

                {/* Nav Items */}
                <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2">
                            <Skeleton className="h-5 w-5 rounded-md" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    ))}
                </div>

                {/* User Profile at bottom */}
                <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Topbar/Header */}
                <div className="h-16 border-b border-rare-border/10 bg-white/50 backdrop-blur-sm px-8 flex items-center justify-between">
                    <Skeleton className="h-6 w-48" />
                    <div className="flex gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                </div>

                {/* Page Content */}
                <div className="p-8 space-y-8">
                    {/* Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-white/40 rounded-xl border border-white/20 p-4 space-y-4">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-8 w-8 rounded-lg" />
                                </div>
                                <Skeleton className="h-8 w-32" />
                            </div>
                        ))}
                    </div>

                    {/* Chart/Table Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 h-96 bg-white/40 rounded-xl border border-white/20 p-6 space-y-4">
                            <Skeleton className="h-6 w-40 mb-6" />
                            <Skeleton className="h-full w-full rounded-lg opacity-50" />
                        </div>
                        <div className="h-96 bg-white/40 rounded-xl border border-white/20 p-6 space-y-4">
                            <Skeleton className="h-6 w-32 mb-6" />
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
