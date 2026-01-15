"use client";
import React, { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import { FaUsers, FaShoppingCart, FaMoneyBillWave, FaChartLine, FaSpinner } from "react-icons/fa";

export const EcommerceMetrics = () => {
  const [metrics, setMetrics] = useState([
    { title: "Customers", value: "0", trend: "up", percent: "0%", icon: <FaUsers />, color: "bg-rare-secondary" },
    { title: "Orders", value: "0", trend: "up", percent: "0%", icon: <FaShoppingCart />, color: "bg-rare-primary" },
    { title: "Revenue", value: "₦0", trend: "up", percent: "0%", icon: <FaMoneyBillWave />, color: "bg-emerald-600" },
    { title: "Products", value: "0", trend: "up", percent: "0%", icon: <FaChartLine />, color: "bg-amber-500" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/admin/metrics');
        if (!response.ok) throw new Error('Failed to fetch metrics');

        const data = await response.json();

        setMetrics([
          {
            title: "Customers",
            value: data.customers?.toLocaleString() || "0",
            trend: "up",
            percent: "0%",
            icon: <FaUsers />,
            color: "bg-rare-secondary", // Slate Blue
          },
          {
            title: "Orders",
            value: data.orders?.toLocaleString() || "0",
            trend: "up",
            percent: "0%",
            icon: <FaShoppingCart />,
            color: "bg-rare-primary", // Midnight Blue
          },
          {
            title: "Revenue",
            value: `₦${(data.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            trend: "up",
            percent: data.revenueGrowth || '0%',
            icon: <FaMoneyBillWave />,
            color: "bg-emerald-600",
          },
          {
            title: "Products",
            value: data.products?.toLocaleString() || "0",
            trend: "up",
            percent: "0%",
            icon: <FaChartLine />,
            color: "bg-amber-500", // Gold-ish
          },
        ]);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl p-5 shadow-md bg-slate-800 border border-slate-700 animate-pulse"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-700 mb-4"></div>
            <div className="h-4 bg-slate-700 rounded w-24 mb-2"></div>
            <div className="h-8 bg-slate-700 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.title}
          className="group relative overflow-hidden rounded-2xl p-6 bg-slate-800/50 backdrop-blur-md border border-slate-700 shadow-xl shadow-black/10 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${metric.color} text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform duration-300`}>
                {React.cloneElement(metric.icon as React.ReactElement<{ className?: string }>, { className: "text-lg" })}
              </div>
              {/* Badge */}
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${metric.trend === "up"
                ? "bg-green-900/30 text-green-400 border border-green-800/30"
                : "bg-red-900/30 text-red-400 border border-red-800/30"
                }`}>
                {metric.trend === "up" ? "▲" : "▼"} {metric.percent}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-heading font-medium text-slate-400 uppercase tracking-wider mb-1">{metric.title}</h3>
              <p className="text-3xl font-body font-bold text-white tracking-tight">{metric.value}</p>
            </div>
          </div>

          {/* Decorative blob */}
          <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${metric.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />
        </div>
      ))}
    </div>
  );
};
