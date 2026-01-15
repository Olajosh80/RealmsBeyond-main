'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiAlertCircle } from 'react-icons/fi';

export function StockStatus() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStock = async () => {
            try {
                const response = await fetch('/api/products/out-of-stock');
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error('Failed to fetch stock status', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStock();
    }, []);

    if (loading) {
        return (
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 shadow-xl shadow-black/10 p-6 h-full animate-pulse">
                <div className="h-6 w-1/3 bg-slate-700 rounded mb-6"></div>
                <div className="space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-12 bg-slate-700 rounded-xl"></div>)}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 shadow-xl shadow-black/10 p-6 h-full transform transition-all hover:shadow-2xl duration-300">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading font-bold text-white text-xl flex items-center gap-2">
                    Stock Alert
                    {products.length > 0 && <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>}
                </h3>
                <Link href="/admin/products" className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors">
                    Manage
                </Link>
            </div>

            <div className="space-y-4">
                {products.length > 0 ? (
                    products.map((product) => (
                        <div key={product._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-700/30 border border-slate-600 hover:bg-slate-700/50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-red-900/30 text-red-400">
                                    <FiAlertCircle className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm text-slate-200 group-hover:text-white transition-colors line-clamp-1">{product.name}</p>
                                    <p className="text-xs font-bold mt-0.5 text-red-400">Out of Stock</p>
                                </div>
                            </div>

                            <Link href={`/admin/products/${product._id}`} className="text-xs px-2 py-1 bg-slate-800 rounded border border-slate-600 hover:border-rare-accent hover:text-rare-accent transition-colors text-slate-300">
                                Edit
                            </Link>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center text-green-400 mb-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <p className="text-sm font-medium text-white">All Clear!</p>
                        <p className="text-xs text-slate-400 mt-1">No out-of-stock products found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
