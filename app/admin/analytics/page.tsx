'use client';

import React, { useState, useEffect } from 'react';
import { EcommerceMetrics } from '@/components/ecommerce/EcommerceMetrics';
import { RecentOrders } from '@/components/admin/dashboard/RecentOrders';
import { FiTrendingUp, FiDownload } from 'react-icons/fi';

export default function AnalyticsPage() {
    const [chartData, setChartData] = useState<number[]>(new Array(12).fill(0));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/metrics');
                if (res.ok) {
                    const data = await res.json();
                    if (data.chartData) {
                        setChartData(data.chartData);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const maxRevenue = Math.max(...chartData, 1); // Prevent division by zero

    return (
        <div className="bg-gray-50 min-h-screen">
            <main className="p-6 lg:p-10">
                <div className="mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="font-heading text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <FiTrendingUp className="text-rare-primary" />
                                Sales Analytics
                            </h1>
                            <p className="text-gray-500 mt-1">Detailed insights into your store&apos;s performance.</p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-200 transition-colors text-sm font-medium shadow-sm">
                            <FiDownload />
                            Export Report
                        </button>
                    </div>

                    {/* Key Metrics */}
                    <div>
                        <EcommerceMetrics />
                    </div>

                    {/* Charts & Tables Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Revenue Chart */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <h3 className="font-heading font-bold text-gray-900 text-xl mb-6">Revenue Overview (Current Year)</h3>

                            <div className="h-64 flex items-end justify-between gap-2">
                                {chartData.map((revenue, i) => {
                                    const heightPercentage = (revenue / maxRevenue) * 100;
                                    return (
                                        <div key={i} className="w-full bg-gray-100 rounded-t-lg relative group h-full flex items-end">
                                            <div
                                                style={{ height: `${heightPercentage}%` }}
                                                className="w-full bg-gradient-to-t from-rare-primary to-rare-primary/60 rounded-t-lg opacity-80 group-hover:opacity-100 transition-all duration-500 relative min-h-[4px]"
                                            >
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-700 pointer-events-none z-10 shadow-xl">
                                                    ₦{revenue.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-between mt-4 text-xs text-gray-500 font-medium uppercase tracking-wider">
                                <span>Jan</span>
                                <span>Feb</span>
                                <span>Mar</span>
                                <span>Apr</span>
                                <span>May</span>
                                <span>Jun</span>
                                <span>Jul</span>
                                <span>Aug</span>
                                <span>Sep</span>
                                <span>Oct</span>
                                <span>Nov</span>
                                <span>Dec</span>
                            </div>
                        </div>

                        {/* Recent Transactions / Orders */}
                        <div className="lg:col-span-1">
                            <RecentOrders />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
