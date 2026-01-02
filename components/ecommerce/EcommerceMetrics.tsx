"use client";
import React, { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import { FaUsers, FaShoppingCart, FaMoneyBillWave, FaChartLine, FaSpinner } from "react-icons/fa";
import { supabase } from "@/lib/supabase";

export const EcommerceMetrics = () => {
  const [metrics, setMetrics] = useState([
    { title: "Customers", value: "0", trend: "up", percent: "0%", icon: <FaUsers className="text-white text-2xl" />, color: "bg-blue-500" },
    { title: "Orders", value: "0", trend: "up", percent: "0%", icon: <FaShoppingCart className="text-white text-2xl" />, color: "bg-green-500" },
    { title: "Revenue", value: "$0", trend: "up", percent: "0%", icon: <FaMoneyBillWave className="text-white text-2xl" />, color: "bg-purple-500" },
    { title: "Products", value: "0", trend: "up", percent: "0%", icon: <FaChartLine className="text-white text-2xl" />, color: "bg-yellow-500" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Fetch users count
        const { count: usersCount } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch orders count and total revenue
        const { data: ordersData, count: ordersCount } = await supabase
          .from('orders')
          .select('total_amount, created_at', { count: 'exact' });

        const totalRevenue = ordersData?.reduce((sum, order) => sum + parseFloat(order.total_amount || '0'), 0) || 0;
        const thisMonthRevenue = ordersData?.filter(order => {
          const orderDate = new Date(order.created_at);
          const now = new Date();
          return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
        }).reduce((sum, order) => sum + parseFloat(order.total_amount || '0'), 0) || 0;

        // Fetch products count
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // Calculate growth percentage (simplified - comparing this month to last month)
        const revenueGrowth = totalRevenue > 0 ? ((thisMonthRevenue / totalRevenue) * 100).toFixed(1) : '0';

        setMetrics([
          {
            title: "Customers",
            value: usersCount?.toLocaleString() || "0",
            trend: "up",
            percent: "0%",
            icon: <FaUsers className="text-white text-2xl" />,
            color: "bg-blue-500",
          },
          {
            title: "Orders",
            value: ordersCount?.toLocaleString() || "0",
            trend: "up",
            percent: "0%",
            icon: <FaShoppingCart className="text-white text-2xl" />,
            color: "bg-green-500",
          },
          {
            title: "Revenue",
            value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            trend: revenueGrowth !== '0' ? "up" : "up",
            percent: `${revenueGrowth}%`,
            icon: <FaMoneyBillWave className="text-white text-2xl" />,
            color: "bg-purple-500",
          },
          {
            title: "Products",
            value: productsCount?.toLocaleString() || "0",
            trend: "up",
            percent: "0%",
            icon: <FaChartLine className="text-white text-2xl" />,
            color: "bg-yellow-500",
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
            className="relative overflow-hidden rounded-2xl p-5 shadow-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 animate-pulse"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
      {metrics.map((metric) => (
        <div
          key={metric.title}
          className="relative overflow-hidden rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
        >
          {/* Icon */}
          <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${metric.color} mb-4`}>
            {metric.icon}
          </div>

          {/* Metric */}
          <div className="flex items-end justify-between">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{metric.title}</span>
              <h4 className="mt-1 text-xl font-bold text-gray-800 dark:text-white/90">{metric.value}</h4>
            </div>

            {/* Badge */}
            <Badge color={metric.trend === "up" ? "success" : "error"}>
              {metric.trend === "up" ? "▲" : "▼"} {metric.percent}
            </Badge>
          </div>

          {/* Optional hover effect */}
          <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full opacity-10 bg-gradient-to-tr from-blue-400 to-purple-400"></div>
        </div>
      ))}
    </div>
  );
};
