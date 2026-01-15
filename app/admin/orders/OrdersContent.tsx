"use client";

import React, { useState } from "react";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdErrorOutline, MdCheckCircle, MdRemoveRedEye } from 'react-icons/md';
import { FiCalendar, FiUser, FiMail, FiMapPin, FiPackage, FiSearch, FiFilter } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { useDebounce } from "@/hooks/useDebounce";

interface OrderItem {
    id: string;
    product_name: string;
    product_price: number;
    quantity: number;
    subtotal: number;
}

interface Order {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    shipping_address: string;
    total_amount: number;
    status: string;
    payment_status: string;
    created_at: string;
    order_items: OrderItem[];
    notes?: string;
}

interface OrdersContentProps {
    initialOrders: Order[];
}

export default function OrdersContent({ initialOrders }: OrdersContentProps) {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update order status');
            }

            setOrders(prev => prev.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));

            setSuccess(`Order status updated to ${newStatus}`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: unknown) {
            console.error('Error updating order status:', err);
            setError(err instanceof Error ? err.message : 'Failed to update order status');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentStatusChange = async (orderId: string, newStatus: string) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payment_status: newStatus }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update payment status');
            }

            setOrders(prev => prev.map(order =>
                order.id === orderId ? { ...order, payment_status: newStatus } : order
            ));

            setSuccess(`Payment status updated to ${newStatus}`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: unknown) {
            console.error('Error updating payment status:', err);
            setError(err instanceof Error ? err.message : 'Failed to update payment status');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-green-50 text-green-600 border-green-200';
            case 'shipped': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'processing': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-50 text-green-600 border-green-200';
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'failed': return 'bg-red-50 text-red-600 border-red-200';
            case 'refunded': return 'bg-purple-50 text-purple-600 border-purple-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Filter orders based on debounced search
    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    return (
        <div className="bg-gray-50 min-h-screen">
            <main className="p-6 lg:p-10">
                <div className="mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="font-heading text-3xl font-bold text-gray-900 flex items-center gap-3">
                                Orders
                                <span className="text-sm font-normal text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                                    {orders.length} items
                                </span>
                            </h1>
                        </div>
                        {loading && <AiOutlineLoading3Quarters className="animate-spin text-rare-primary h-6 w-6" />}
                    </div>

                    {/* Filters & Search - Toolbar */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="flex gap-2 w-full md:w-auto">
                            {/* Potential Tab Filters here if needed */}
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative group w-full md:w-64">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-rare-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search orders..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-rare-primary/20 focus:border-rare-primary focus:outline-none transition-all"
                                />
                            </div>
                            <Button variant="outline" className="hidden md:flex items-center gap-2 px-3 py-2">
                                <FiFilter /> Filter
                            </Button>
                        </div>
                    </div>

                    {/* Notifications */}
                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 animate-in fade-in slide-in-from-top-2">
                            <MdErrorOutline className="h-5 w-5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 animate-in fade-in slide-in-from-top-2">
                            <MdCheckCircle className="h-5 w-5 flex-shrink-0" />
                            <p>{success}</p>
                        </div>
                    )}

                    {/* Orders Table */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-600 font-bold tracking-wider">
                                    <tr>
                                        <th className="p-4">Order ID</th>
                                        <th className="p-4">Customer</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Total</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Payment</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-12 text-center text-gray-500 font-body">
                                                No orders found matching your search.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrders.map((order) => (
                                            <tr key={order.id} className="group hover:bg-gray-50 transition-colors">
                                                <td className="p-4">
                                                    <span className="font-mono text-xs text-gray-600 bg-gray-100 border border-gray-200 px-2 py-1 rounded">
                                                        #{order.id.slice(-8)}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm">
                                                    <div className="font-bold text-gray-900">{order.customer_name}</div>
                                                    <div className="text-gray-500 text-xs">{order.customer_email}</div>
                                                </td>
                                                <td className="p-4 text-sm text-gray-500">
                                                    {formatDate(order.created_at)}
                                                </td>
                                                <td className="p-4 text-sm font-bold text-rare-primary">
                                                    ₦{order.total_amount.toFixed(2)}
                                                </td>
                                                <td className="p-4">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        className={`text-[10px] uppercase font-bold px-2 py-1 rounded border cursor-pointer outline-none focus:ring-2 focus:ring-rare-accent/20 ${getStatusColor(order.status)}`}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="processing">Processing</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td className="p-4">
                                                    <select
                                                        value={order.payment_status}
                                                        onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                                                        className={`text-[10px] uppercase font-bold px-2 py-1 rounded border cursor-pointer outline-none focus:ring-2 focus:ring-rare-accent/20 ${getPaymentStatusColor(order.payment_status)}`}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="paid">Paid</option>
                                                        <option value="failed">Failed</option>
                                                        <option value="refunded">Refunded</option>
                                                    </select>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="p-2 text-rare-primary hover:bg-gray-100 rounded-lg transition-all"
                                                        title="View Details"
                                                    >
                                                        <MdRemoveRedEye className="h-5 w-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 text-gray-900">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-heading font-bold text-gray-900">Order Details</h2>
                                <p className="text-sm text-gray-500 font-mono">#{selectedOrder.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <span className="sr-only">Close</span>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                                        <FiUser className="text-rare-primary" /> Customer Info
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <p className="flex flex-col">
                                            <span className="text-xs text-gray-500">Name</span>
                                            <span className="font-medium text-gray-900">{selectedOrder.customer_name}</span>
                                        </p>
                                        <p className="flex flex-col">
                                            <span className="text-xs text-gray-500">Email</span>
                                            <span className="font-medium text-gray-900 flex items-center gap-1"><FiMail className="h-3 w-3" /> {selectedOrder.customer_email}</span>
                                        </p>
                                        {selectedOrder.customer_phone && (
                                            <p className="flex flex-col">
                                                <span className="text-xs text-gray-500">Phone</span>
                                                <span className="font-medium text-gray-900">{selectedOrder.customer_phone}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                                        <FiMapPin className="text-red-500" /> Shipping Info
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <p className="flex flex-col">
                                            <span className="text-xs text-gray-500">Address</span>
                                            <span className="font-medium text-gray-900 whitespace-pre-line leading-snug">{selectedOrder.shipping_address}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <FiPackage className="text-blue-500" /> Order Items
                                </h3>
                                <div className="space-y-2">
                                    {selectedOrder.order_items?.map((item: OrderItem) => (
                                        <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-900">{item.product_name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {item.quantity} x ₦{item.product_price.toFixed(2)}
                                                </p>
                                            </div>
                                            <p className="text-sm font-mono font-bold text-gray-900">
                                                ₦{item.subtotal.toFixed(2)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                                <span className="font-bold text-gray-500">Total Amount</span>
                                <span className="font-heading text-2xl font-bold text-rare-primary">₦{selectedOrder.total_amount.toFixed(2)}</span>
                            </div>

                            {selectedOrder.notes && (
                                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                    <p className="text-xs font-bold text-yellow-600 uppercase mb-1">Order Notes</p>
                                    <p className="text-sm text-yellow-800 italic">{selectedOrder.notes}</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <Button
                                onClick={() => setSelectedOrder(null)}
                                variant="outline"
                                className="border-gray-300 text-gray-600 hover:bg-white"
                            >
                                Close Details
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
