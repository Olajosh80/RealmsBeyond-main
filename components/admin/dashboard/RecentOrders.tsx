'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiEye } from 'react-icons/fi';

const statusColors: Record<string, string> = {
    processing: 'bg-blue-50 text-blue-600 border-blue-100',
    completed: 'bg-green-50 text-green-600 border-green-100',
    pending: 'bg-amber-50 text-amber-600 border-amber-100',
    cancelled: 'bg-red-50 text-red-600 border-red-100',
    shipped: 'bg-purple-50 text-purple-600 border-purple-100',
};

interface Order {
    _id: string;
    customer_name: string;
    total_amount: number;
    status: string;
}

export function RecentOrders() {
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
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
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-full animate-pulse">
                <div className="h-6 w-1/3 bg-gray-100 rounded mb-6"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-10 bg-gray-50 rounded w-full"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 transition-all hover:shadow-md duration-300">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading font-bold text-gray-900 text-xl">Recent Orders</h3>
                <Link href="/admin/orders" className="text-xs font-bold text-gray-500 hover:text-rare-primary uppercase tracking-wider transition-colors">
                    View All
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                            <th className="pb-3 pl-2">Order ID</th>
                            <th className="pb-3">Customer</th>
                            <th className="pb-3">Total</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3 text-right pr-2">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-body">
                        {recentOrders.map((order) => (
                            <tr key={order._id} className="group hover:bg-gray-50 transition-colors border-b last:border-0 border-gray-100">
                                <td className="py-4 pl-2 font-medium text-gray-900 text-xs">#{order._id.slice(-6).toUpperCase()}</td>
                                <td className="py-4 text-gray-600">{order.customer_name}</td>
                                <td className="py-4 font-bold text-gray-900">₦{order.total_amount?.toFixed(2)}</td>
                                <td className="py-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-500'}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="py-4 text-right pr-2">
                                    <Link href={`/admin/orders/${order._id || '#'}`} className="p-2 inline-block rounded-lg hover:bg-gray-100 text-gray-500 hover:text-rare-primary transition-all shadow-sm hover:shadow">
                                        <FiEye className="w-4 h-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {recentOrders.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-4 text-center text-gray-500">No orders found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
