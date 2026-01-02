"use client";

import React, { useState } from "react";
import { supabase, Order } from "@/lib/supabase";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdErrorOutline, MdCheckCircle, MdRemoveRedEye } from 'react-icons/md';
import { FiCalendar, FiUser, FiMail, FiMapPin, FiPackage } from 'react-icons/fi';

interface OrdersContentProps {
    initialOrders: any[];
}

export default function OrdersContent({ initialOrders }: OrdersContentProps) {
    const [orders, setOrders] = useState<any[]>(initialOrders);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const { error: updateError } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (updateError) throw updateError;

            setOrders(prev => prev.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));

            setSuccess(`Order status updated to ${newStatus}`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            console.error('Error updating order status:', err);
            setError(err.message || 'Failed to update order status');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentStatusChange = async (orderId: string, newStatus: string) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const { error: updateError } = await supabase
                .from('orders')
                .update({ payment_status: newStatus })
                .eq('id', orderId);

            if (updateError) throw updateError;

            setOrders(prev => prev.map(order =>
                order.id === orderId ? { ...order, payment_status: newStatus } : order
            ));

            setSuccess(`Payment status updated to ${newStatus}`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            console.error('Error updating payment status:', err);
            setError(err.message || 'Failed to update payment status');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'shipped': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'refunded': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Manage Orders</h1>
                {loading && <AiOutlineLoading3Quarters className="animate-spin text-blue-600 h-6 w-6" />}
            </div>

            {/* Notifications */}
            {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                    <MdErrorOutline className="h-5 w-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}
            {success && (
                <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
                    <MdCheckCircle className="h-5 w-5 flex-shrink-0" />
                    <p>{success}</p>
                </div>
            )}

            {/* Orders Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Order ID</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Customer</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Date</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Total</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Payment</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                                                #{order.id.slice(0, 8)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="font-medium text-gray-900 dark:text-white">{order.customer_name}</div>
                                            <div className="text-gray-500 dark:text-gray-400 text-xs">{order.customer_email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {formatDate(order.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                                            ${order.total_amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer ${getStatusColor(order.status)}`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={order.payment_status}
                                                onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                                                className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer ${getPaymentStatusColor(order.payment_status)}`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="paid">Paid</option>
                                                <option value="failed">Failed</option>
                                                <option value="refunded">Refunded</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
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

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order Details</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Order #{selectedOrder.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <FiUser className="text-blue-500" /> Customer Information
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <span className="font-medium text-gray-900 dark:text-white">Name:</span> {selectedOrder.customer_name}
                                        </p>
                                        <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <FiMail className="h-3 w-3" /> {selectedOrder.customer_email}
                                        </p>
                                        {selectedOrder.customer_phone && (
                                            <p className="text-gray-600 dark:text-gray-400">{selectedOrder.customer_phone}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <FiMapPin className="text-red-500" /> Shipping Address
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                                        {selectedOrder.shipping_address}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <FiPackage className="text-green-500" /> Order Items
                                </h3>
                                <div className="space-y-3">
                                    {selectedOrder.order_items?.map((item: any) => (
                                        <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.product_name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {item.quantity} x ${item.product_price.toFixed(2)}
                                                </p>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                ${item.subtotal.toFixed(2)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span className="text-gray-900 dark:text-white">Total Amount</span>
                                    <span className="text-blue-600 dark:text-blue-400">${selectedOrder.total_amount.toFixed(2)}</span>
                                </div>
                            </div>

                            {selectedOrder.notes && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-100 dark:border-yellow-900/20">
                                    <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-500 uppercase mb-1">Order Notes</p>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-400">{selectedOrder.notes}</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                                disabled={loading}
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
