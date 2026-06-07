// components/dashboard/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import {
  Bitcoin, LayoutDashboard, CreditCard,
  TrendingUp, Send, Shield, LogOut,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", Icon: LayoutDashboard },
  { href: "/dashboard/borrow", label: "Borrow MUSD", Icon: Bitcoin },
  { href: "/dashboard/gift-cards", label: "Gift Cards", Icon: CreditCard },
  { href: "/dashboard/yield", label: "Earn Yield", Icon: TrendingUp },
  { href: "/dashboard/payments", label: "Payments", Icon: Send },
  { href: "/dashboard/passport", label: "Passport", Icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();

  async function handleLogout() {
    await signOut();
    router.push("/");
  }

  return (
    <aside
      className="hidden md:flex flex-col w-72 bg-surface-900
        border-r border-surface-600 flex-shrink-0 relative z-20"
      aria-label="Dashboard navigation"
    >
      {/* Background glow in sidebar */}
      <div className="absolute top-0 left-0 w-full h-40 bg-bitcoin-500/5 blur-[50px] pointer-events-none" />

      {/* Logo */}
      <div
        className="flex items-center gap-3 px-8 py-8
          border-b border-surface-600/50 relative z-10"
      >
        <div
          className="w-9 h-9 rounded-xl bg-gradient-bitcoin
            flex items-center justify-center shadow-bitcoin-sm border border-bitcoin-400/50"
        >
          <Bitcoin className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <span className="text-2xl font-bold font-space text-white tracking-tight drop-shadow-md">
          Mezo<span className="text-bitcoin-500">Banq</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 relative z-10">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "group relative flex items-center gap-3.5 px-4 py-3 rounded-xl",
                "text-sm font-medium transition-all duration-200 overflow-hidden",
                isActive
                  ? "text-white bg-surface-800 border border-white/5 shadow-glass"
                  : "text-zinc-400 hover:text-white hover:bg-surface-800/50"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active state background gradient */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-bitcoin-500/10 to-transparent pointer-events-none" />
              )}
              
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-0 bottom-0
                    w-[3px] bg-bitcoin-500 rounded-r-full shadow-[0_0_10px_rgba(247,147,26,0.8)]"
                  aria-hidden="true"
                />
              )}
              
              <div className={clsx(
                "p-1.5 rounded-lg transition-colors",
                isActive ? "bg-bitcoin-500/20" : "group-hover:bg-surface-700"
              )}>
                <Icon
                  className={clsx(
                    "w-5 h-5 flex-shrink-0 transition-colors",
                    isActive ? "text-bitcoin-400 drop-shadow-lg" : "text-zinc-500 group-hover:text-zinc-300"
                  )}
                  aria-hidden="true"
                />
              </div>
              <span className="tracking-wide">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 pb-6 relative z-10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl
            text-sm font-medium text-zinc-500
            hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
        >
          <div className="p-1.5 rounded-lg group-hover:bg-red-500/20 transition-colors">
            <LogOut className="w-5 h-5 transition-colors group-hover:text-red-400" aria-hidden="true" />
          </div>
          <span className="tracking-wide">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
