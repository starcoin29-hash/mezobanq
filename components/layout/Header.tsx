// components/layout/Header.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import {
  Menu, X, LayoutDashboard, CreditCard,
  TrendingUp, Send, Shield, Landmark, LogIn, ArrowRight,
} from "lucide-react";
import { clsx } from "clsx";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { useDemo } from "@/lib/demo/DemoContext";

// Lazy-load MobileMenu — not needed until user taps hamburger
const MobileMenu = dynamic(
  () => import("./MobileMenu").then((m) => ({ default: m.MobileMenu })),
  { ssr: false }
);

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/borrow", label: "Borrow", icon: Landmark },
  { href: "/dashboard/gift-cards", label: "Gift Cards", icon: CreditCard },
  { href: "/dashboard/yield", label: "Yield", icon: TrendingUp },
  { href: "/dashboard/payments", label: "Payments", icon: Send },
  { href: "/dashboard/passport", label: "Passport", icon: Shield },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const demo = useDemo();
  const isDashboard = pathname.startsWith("/dashboard");
  // In demo mode, treat user as signed in so nav + connect button show
  const effectiveSignedIn = demo.isDemoMode || isSignedIn;

  // Lightweight scroll listener
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const toggleMenu = useCallback(() => setMenuOpen((v) => !v), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Check if link is active
  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 animate-header-in",
          scrolled
            ? "bg-surface-900/80 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group shrink-0"
              aria-label="MezoBanq Home"
            >
              <div
                className="relative w-10 h-10 rounded-full overflow-hidden
                  ring-2 ring-bitcoin-500/40 group-hover:ring-bitcoin-400/70
                  group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(247,147,26,0.3)]
                  transition-all duration-300"
              >
                <Image
                  src="/mezobanq-logo.png"
                  alt="MezoBanq"
                  fill
                  className="object-cover"
                  sizes="40px"
                  priority
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[1.15rem] font-extrabold font-space tracking-wide text-white">
                  MEZO<span className="text-bitcoin-500">BANQ</span>
                </span>
                <span className="text-[0.55rem] font-medium tracking-[0.25em] uppercase text-zinc-500 mt-0.5">
                  Bank on Bitcoin
                </span>
              </div>
            </Link>

            {/* Desktop Navigation — only show on dashboard routes when signed in */}
            {isDashboard && effectiveSignedIn && (
              <nav
                className="hidden lg:flex items-center gap-0.5"
                aria-label="Main navigation"
              >
                {NAV_LINKS.map((link) => {
                  const active = isActive(link.href);
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={clsx(
                        "nav-link-premium flex items-center gap-1.5 px-3.5 py-2 text-sm",
                        "rounded-xl transition-all duration-200 font-medium",
                        active
                          ? "nav-link-active text-white"
                          : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                      )}
                    >
                      <Icon
                        className={clsx(
                          "w-3.5 h-3.5 transition-colors",
                          active ? "text-bitcoin-400" : "text-zinc-500"
                        )}
                        aria-hidden="true"
                      />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Right side */}
            <div className="flex items-center gap-3">

              {/* ── Not signed in: Show Sign In + Get Started ── */}
              {isLoaded && !effectiveSignedIn && (
                <>
                  <div className="hidden sm:flex items-center gap-2.5">
                    <SignInButton mode="modal">
                      <button
                        className="flex items-center gap-2 px-4 py-2 rounded-xl
                          text-sm font-medium text-zinc-300 hover:text-white
                          bg-white/[0.04] hover:bg-white/[0.08]
                          border border-white/[0.06] hover:border-white/[0.12]
                          transition-all duration-200"
                      >
                        <LogIn className="w-4 h-4" aria-hidden="true" />
                        Sign In
                      </button>
                    </SignInButton>

                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-5 py-2 rounded-xl
                        text-sm font-semibold text-white
                        bg-bitcoin-500 hover:bg-bitcoin-600
                        shadow-bitcoin-sm hover:shadow-bitcoin
                        transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      Get Started
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </div>

                  {/* Mobile: compact sign-in */}
                  <div className="flex sm:hidden items-center gap-2">
                    <SignInButton mode="modal">
                      <button
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl
                          text-sm font-semibold text-white
                          bg-bitcoin-500 hover:bg-bitcoin-600
                          shadow-bitcoin-sm
                          transition-all duration-200 active:scale-95"
                      >
                        <LogIn className="w-4 h-4" aria-hidden="true" />
                        Sign In
                      </button>
                    </SignInButton>
                  </div>
                </>
              )}

              {/* ── Signed in: Show wallet connect + user button ── */}
              {effectiveSignedIn && (
                <>
                  {/* Desktop: ConnectButton + Clerk UserButton */}
                  <div className="hidden lg:flex items-center gap-3">
                    <ConnectButton />
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox:
                            "w-9 h-9 ring-2 ring-surface-600 hover:ring-bitcoin-500/50 transition-all duration-200",
                          userButtonPopoverCard:
                            "bg-surface-800 border border-surface-500 shadow-2xl",
                          userButtonPopoverActionButton:
                            "text-zinc-300 hover:text-white hover:bg-surface-700",
                          userButtonPopoverActionButtonText: "text-zinc-300",
                          userButtonPopoverFooter: "hidden",
                        },
                      }}
                    />
                  </div>

                  {/* Mobile / Tablet menu toggle */}
                  <button
                    onClick={toggleMenu}
                    className={clsx(
                      "lg:hidden relative w-10 h-10 rounded-xl flex items-center justify-center",
                      "text-zinc-400 hover:text-white",
                      "bg-white/[0.03] hover:bg-white/[0.08]",
                      "border border-white/[0.06] hover:border-bitcoin-500/30",
                      "transition-all duration-200",
                      menuOpen && "text-white bg-white/[0.08] border-bitcoin-500/30"
                    )}
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={menuOpen}
                  >
                    {menuOpen ? (
                      <X className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <Menu className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu component — lazy loaded, only for signed-in users */}
      <MobileMenu
        open={menuOpen}
        links={NAV_LINKS}
        onClose={closeMenu}
      />
    </>
  );
}
