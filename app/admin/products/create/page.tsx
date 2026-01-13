'use client';

import React from 'react';
import { ProductEditor } from '@/components/admin/products/ProductEditor';
import { Header } from '@/components/layout/Header';
import { Section } from '@/components/ui/Section';

export default function CreateProductPage() {
    return (
        <div className="min-h-screen bg-rare-background flex flex-col">
            <Header />
            <main className="flex-grow p-6 lg:p-10">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-heading font-bold text-rare-primary mb-8">
                        Add New Product
                    </h1>
                    <ProductEditor />
                </div>
            </main>
        </div>
    );
}
