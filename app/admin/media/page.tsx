'use client';

import React from 'react';
import { MediaManager } from '@/components/admin/media/MediaManager';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function MediaPage() {
    return (
        <div className="bg-gray-50 min-h-screen">
            <main className="p-6 lg:p-10">
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
