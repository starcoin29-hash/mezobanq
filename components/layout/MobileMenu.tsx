// components/layout/MobileMenu.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { X, ArrowRight, Bitcoin, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface MobileMenuProps {
  open: boolean;
  links: NavLink[];
  onClose: () => void;
}

// Stagger children animation
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.03, staggerDirection: -1 },
  },
};

const linkVariants = {
  hidden: { opacity: 0, x: 30, filter: "blur(4px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    opacity: 0,
    x: 20,
    filter: "blur(4px)",
    transition: { duration: 0.2 },
  },
};

export function MobileMenu({ open, links, onClose }: MobileMenuProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — tinted blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-40 lg:hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(7,7,10,0.85) 0%, rgba(10,10,15,0.9) 50%, rgba(7,7,10,0.85) 100%)",
              backdropFilter: "blur(8px) saturate(0.8)",
              WebkitBackdropFilter: "blur(8px) saturate(0.8)",
            }}
            aria-hidden="true"
          />

          {/* Slide-in panel — full-height glassmorphic sidebar */}
          <motion.div
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
              mass: 0.8,
            }}
            className="fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-[340px]
              glass-deep flex flex-col lg:hidden safe-top safe-bottom safe-right
              noise-overlay overflow-hidden"
          >
            {/* Ambient glow — top-right corner */}
            <div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(247,147,26,0.08) 0%, transparent 70%)",
              }}
              aria-hidden="true"
            />
            {/* Ambient glow — bottom-left */}
            <div
              className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(78,205,196,0.05) 0%, transparent 70%)",
              }}
              aria-hidden="true"
            />

            {/* ── Panel header ── */}
            <div className="flex items-center justify-between px-6 py-5 relative z-10">
              {/* Brand mark */}
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg bg-linear-to-br from-bitcoin-500 to-bitcoin-600
                    flex items-center justify-center shadow-bitcoin-sm"
                >
                  <Bitcoin className="w-4.5 h-4.5 text-white" aria-hidden="true" />
                </div>
                <span className="text-lg font-bold font-space text-white">
                  Mezo<span className="text-bitcoin-500">Banq</span>
                </span>
              </div>
              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 rounded-xl flex items-center justify-center
                  text-zinc-400 hover:text-white
                  bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06]
                  hover:border-bitcoin-500/30
                  transition-all duration-200"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </motion.button>
            </div>

            {/* Divider with gradient */}
            <div className="mx-6 h-px bg-linear-to-r from-transparent via-white/[0.08] to-transparent" />

            {/* ── Navigation links ── */}
            <motion.nav
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex-1 px-4 py-6 space-y-1 overflow-y-auto relative z-10"
            >
              {links.map((link) => {
                const active = isActive(link.href);
                const Icon = link.icon;
                return (
                  <motion.div key={link.href} variants={linkVariants}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className={clsx(
                        "mobile-nav-link group flex items-center gap-3.5",
                        "px-5 py-3.5 rounded-2xl transition-all duration-200",
                        "font-medium text-[15px]",
                        active
                          ? "text-white bg-bitcoin-500/[0.1] border border-bitcoin-500/20"
                          : "text-zinc-300 hover:text-white hover:bg-white/[0.04] border border-transparent"
                      )}
                    >
                      <div
                        className={clsx(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                          active
                            ? "bg-bitcoin-500/20"
                            : "bg-white/[0.04] group-hover:bg-white/[0.08]"
                        )}
                      >
                        <Icon
                          className={clsx(
                            "w-4 h-4 transition-colors",
                            active
                              ? "text-bitcoin-400"
                              : "text-zinc-500 group-hover:text-zinc-300"
                          )}
                          aria-hidden="true"
                        />
                      </div>
                      <span className="flex-1">{link.label}</span>
                      {active ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-bitcoin-400 shadow-[0_0_6px_rgba(247,147,26,0.6)]" />
                      ) : (
                        <ArrowRight
                          className="w-4 h-4 text-zinc-600 group-hover:text-bitcoin-400
                            group-hover:translate-x-1 transition-all duration-200"
                          aria-hidden="true"
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>

            {/* ── Bottom section ── */}
            <div className="relative z-10">
              {/* Divider */}
              <div className="mx-6 h-px bg-linear-to-r from-transparent via-white/[0.08] to-transparent" />

              {/* Promo badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="mx-6 mt-5 mb-4 p-3.5 rounded-2xl
                  bg-linear-to-r from-bitcoin-500/[0.08] to-mezo-500/[0.06]
                  border border-bitcoin-500/15"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles
                    className="w-3.5 h-3.5 text-bitcoin-400"
                    aria-hidden="true"
                  />
                  <span className="text-xs font-bold text-bitcoin-400 uppercase tracking-wider">
                    1% Fixed Rate
                  </span>
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Borrow MUSD against your BTC — the cheapest loan in DeFi.
                </p>
              </motion.div>

              {/* Connect wallet */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="px-6 pb-4"
              >
                <ConnectButton fullWidth />
              </motion.div>

              {/* User profile */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="px-6 pb-8 flex items-center justify-center"
              >
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox:
                        "w-9 h-9 ring-2 ring-surface-600 hover:ring-bitcoin-500/50 transition-all",
                      userButtonPopoverCard:
                        "bg-surface-800 border border-surface-500 shadow-2xl",
                      userButtonPopoverActionButton:
                        "text-zinc-300 hover:text-white hover:bg-surface-700",
                      userButtonPopoverActionButtonText: "text-zinc-300",
                      userButtonPopoverFooter: "hidden",
                    },
                  }}
                  showName
                />
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
