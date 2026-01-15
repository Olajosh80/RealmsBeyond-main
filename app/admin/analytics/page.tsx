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
        <div className="min-h-screen bg-slate-900 flex flex-col">
            <main className="flex-grow p-6 lg:p-10">
                <div className="mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
                                <FiTrendingUp className="text-rare-accent" />
                                Sales Analytics
                            </h1>
                            <p className="text-slate-400 mt-1">Detailed insights into your store's performance.</p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors text-sm font-medium">
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
                        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 shadow-xl p-6">
                            <h3 className="font-heading font-bold text-white text-xl mb-6">Revenue Overview (Current Year)</h3>

                            <div className="h-64 flex items-end justify-between gap-2">
                                {chartData.map((revenue, i) => {
                                    const heightPercentage = (revenue / maxRevenue) * 100;
                                    return (
                                        <div key={i} className="w-full bg-slate-700/30 rounded-t-lg relative group h-full flex items-end">
                                            <div
                                                style={{ height: `${heightPercentage}%` }}
                                                className="w-full bg-gradient-to-t from-rare-primary to-rare-accent/60 rounded-t-lg opacity-80 group-hover:opacity-100 transition-all duration-500 relative min-h-[4px]"
                                            >
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none z-10 shadow-xl">
                                                    ₦{revenue.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-between mt-4 text-xs text-slate-400 font-medium uppercase tracking-wider">
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
