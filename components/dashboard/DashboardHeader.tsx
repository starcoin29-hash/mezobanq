// components/dashboard/DashboardHeader.tsx
"use client";

import { Bell } from "lucide-react";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { UserButton } from "@clerk/nextjs";

export function DashboardHeader() {
  return (
    <header
      className="flex items-center justify-between px-4 sm:px-6 lg:px-8
        h-16 border-b border-surface-600 bg-surface-800 flex-shrink-0"
    >
      {/* Left: greeting */}
      <div>
        <p className="text-white font-semibold text-sm font-space">
          Welcome back
        </p>
        <p className="text-xs text-zinc-500">
          Manage your Bitcoin positions
        </p>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg text-zinc-400 hover:text-white
            hover:bg-surface-700 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
          {/* Notification dot */}
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full
              bg-bitcoin-500"
            aria-hidden="true"
          />
        </button>

        {/* Wallet connect */}
        <ConnectButton />

        {/* Clerk user avatar & menu */}
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
            },
          }}
        />
      </div>
    </header>
  );
}
