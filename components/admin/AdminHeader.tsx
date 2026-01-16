"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdDashboard, MdInventory, MdSettings, MdPeople, MdShoppingCart, MdEdit } from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function AdminHeader() {
  const [time, setTime] = useState(new Date());
  const pathname = usePathname();
  const { profile } = useAuth();
  const { settings } = useSiteSettings();

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: <MdDashboard className="w-4 h-4" /> },
    { name: "Goods", href: "/admin/goods", icon: <MdInventory className="w-4 h-4" /> },
    { name: "Orders", href: "/admin/orders", icon: <MdShoppingCart className="w-4 h-4" /> },
    { name: "Users", href: "/admin/customers", icon: <MdPeople className="w-4 h-4" /> },
    { name: "Blog", href: "/admin/blog", icon: <MdEdit className="w-4 h-4" /> },
    { name: "Settings", href: "/admin/settings", icon: <MdSettings className="w-4 h-4" /> },
  ];

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-20 flex items-center justify-between px-8 bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      {/* Left section: Brand */}
      <div className="flex items-center gap-8">
        <Link href="/admin" className="flex items-center gap-2 group">
          <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-all">
            <img src={settings?.logo_url || "/logo.png"} alt="Logo" className="h-7 w-7 rounded-full" />
          </div>
          <span className="text-xl font-heading font-bold tracking-wide text-gray-900">Admin</span>
        </Link>


        <nav className="hidden lg:flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200">
          {menuItems.slice(0, 3).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white text-rare-primary shadow-sm border border-gray-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right section: Info */}
      <div className="flex items-center gap-8">
        {/* Current time */}
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">System Time</span>
          <div className="font-mono text-xs text-gray-700 font-medium">{time.toLocaleTimeString()}</div>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 pl-8 border-l border-gray-200">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-gray-900">{profile?.full_name || "Admin User"}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-tighter font-medium">{settings?.site_name || "Realms Beyond"}</span>
          </div>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-rare-primary to-rare-secondary rounded-full opacity-20 group-hover:opacity-40 blur transition duration-300"></div>
            <img
              src={profile?.avatar_url || "/admin-logo.png"}
              alt="Admin"
              className="relative h-10 w-10 rounded-full border border-gray-200 object-cover shadow-sm"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
