'use client';

import React from 'react';
import { MediaManager } from '@/components/admin/media/MediaManager';
import { Header } from '@/components/layout/Header';

export default function MediaPage() {
    return (
        <div className="min-h-screen bg-rare-background flex flex-col">
            <Header />
            <main className="flex-grow p-6 lg:p-10">
                <div className="max-w-7xl mx-auto h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-heading font-bold text-rare-primary">
                            Media Library
                        </h1>
                    </div>

                    <div className="flex-grow">
                        <MediaManager variant="inline" />
                    </div>
                </div>
            </main>
        </div>
    );
}
