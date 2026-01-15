'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductEditor } from '@/components/admin/products/ProductEditor';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

function CreateProductContent() {
    const searchParams = useSearchParams();
    const productId = searchParams.get('id');
    const isEditMode = !!productId;

    return (
        <div className="bg-gray-50 min-h-screen">
            <main className="p-6 lg:p-10">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-heading font-bold text-gray-900 mb-8">
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <AiOutlineLoading3Quarters className="h-8 w-8 animate-spin text-rare-primary" />
            </div>
        }>
            <CreateProductContent />
        </Suspense>
    );
}
