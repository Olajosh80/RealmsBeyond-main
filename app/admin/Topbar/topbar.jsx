"use client";

import React, { useEffect, useState } from "react";

export default function Topbar() {
  const [time, setTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-6 shadow bg-gradient-blue from-blue-800 to-blue-600 text-white">
      {/* Portal name */}
      <h1 className="text-lg font-bold flex items-center gap-2">
        <img src="/logo.png" alt="BeyondRealms" className="h-8 w-8 rounded-full" />
        BeyondRealms
      </h1>

      {/* Right section */}
      <div className="flex items-center gap-6">
        {/* Current time */}
        <div className="font-mono text-sm">{time.toLocaleTimeString()}</div>

        {/* User info */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">John Doe</span>
          <img
            src="/admin-logo.png"
            alt="Admin"
            className="h-8 w-8 rounded-full border-2 border-white object-cover"
          />
        </div>
      </div>
    </header>
  );
}
