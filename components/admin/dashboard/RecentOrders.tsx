'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiEye } from 'react-icons/fi';

const statusColors: Record<string, string> = {
    processing: 'bg-blue-900/20 text-blue-400 border-blue-800/30',
    completed: 'bg-green-900/20 text-green-400 border-green-800/30',
    pending: 'bg-amber-900/20 text-amber-400 border-amber-800/30',
    cancelled: 'bg-red-900/20 text-red-400 border-red-800/30',
    shipped: 'bg-purple-900/20 text-purple-400 border-purple-800/30',
};

export function RecentOrders() {
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('/api/orders');
                if (response.ok) {
                    const data = await response.json();
                    setRecentOrders(data.slice(0, 5));
                }
            } catch (error) {
                console.error('Failed to fetch orders', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 shadow-xl shadow-black/10 p-6 h-full animate-pulse">
                <div className="h-6 w-1/3 bg-slate-700 rounded mb-6"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-10 bg-slate-700 rounded w-full"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 shadow-xl shadow-black/10 p-6 transform transition-all hover:shadow-2xl duration-300">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading font-bold text-white text-xl">Recent Orders</h3>
                <Link href="/admin/orders" className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors">
                    View All
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-700 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                            <th className="pb-3 pl-2">Order ID</th>
                            <th className="pb-3">Customer</th>
                            <th className="pb-3">Total</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3 text-right pr-2">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-body">
                        {recentOrders.map((order) => (
                            <tr key={order._id} className="group hover:bg-slate-700/30 transition-colors border-b last:border-0 border-slate-700/50">
                                <td className="py-4 pl-2 font-medium text-white text-xs">#{order._id.slice(-6).toUpperCase()}</td>
                                <td className="py-4 text-slate-300">{order.customer_name}</td>
                                <td className="py-4 font-bold text-slate-200">₦{order.total_amount?.toFixed(2)}</td>
                                <td className="py-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border capitalize ${statusColors[order.status] || 'bg-slate-700 text-slate-300'}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="py-4 text-right pr-2">
                                    <Link href={`/admin/orders/${order._id || '#'}`} className="p-2 inline-block rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-all shadow-sm hover:shadow">
                                        <FiEye className="w-4 h-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {recentOrders.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-4 text-center text-slate-500">No orders found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
