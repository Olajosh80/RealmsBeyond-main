'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductEditor } from '@/components/admin/products/ProductEditor';
import { Header } from '@/components/layout/Header';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

function CreateProductContent() {
    const searchParams = useSearchParams();
    const productId = searchParams.get('id');
    const isEditMode = !!productId;

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            <Header />
            <main className="flex-grow p-6 lg:p-10">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-heading font-bold text-white mb-8">
                        {isEditMode ? 'Edit Product' : 'Add New Product'}
                    </h1>
                    <ProductEditor productId={productId} />
                </div>
            </main>
        </div>
    );
}

export default function CreateProductPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <AiOutlineLoading3Quarters className="h-8 w-8 animate-spin text-white" />
            </div>
        }>
            <CreateProductContent />
        </Suspense>
    );
}
