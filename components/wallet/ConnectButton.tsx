// components/wallet/ConnectButton.tsx
"use client";
import { useAccount, useDisconnect, useConnect } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Wallet, ChevronDown, X, Smartphone, LogOut } from "lucide-react";
import { clsx } from "clsx";
import { useDemo } from "@/lib/demo/DemoContext";

// Shortens an Ethereum address for display
// "0x1234567890abcdef1234" becomes "0x1234...1234"
function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

interface ConnectButtonProps {
  fullWidth?: boolean; // Makes button full width (for mobile menu)
}

export function ConnectButton({ fullWidth = false }: ConnectButtonProps) {
  const { address, isConnected: wagmiConnected, chain } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { connect, isPending } = useConnect();
  const demo = useDemo();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Determine effective connection state
  const isConnected = demo.isDemoMode ? demo.isConnected : wagmiConnected;
  const displayAddress = demo.isDemoMode ? demo.address : address;
  const displayChain = demo.isDemoMode ? demo.chain : chain;

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDropdown]);

  // Close dropdown on Escape
  useEffect(() => {
    if (!showDropdown) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowDropdown(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [showDropdown]);

  // Close dropdown on successful connection
  useEffect(() => {
    if (isConnected) setShowDropdown(false);
  }, [isConnected]);

  // ── Demo mode: one-click connect ──
  const handleDemoConnect = () => {
    demo.connect();
    setShowDropdown(false);
  };

  const handleDisconnect = () => {
    if (demo.isDemoMode) {
      demo.disconnect();
    } else {
      wagmiDisconnect();
    }
    setShowDropdown(false);
  };

  const WALLET_OPTIONS = [
    {
      id: "metamask",
      label: "MetaMask",
      description: "Browser extension",
      Icon: Wallet,
      action: () => {
        if (demo.isDemoMode) {
          handleDemoConnect();
        } else {
          connect({ connector: injected({ target: "metaMask" }) });
        }
      },
    },
    {
      id: "walletconnect",
      label: "WalletConnect",
      description: "Mobile via QR code",
      Icon: Smartphone,
      action: () => {
        if (demo.isDemoMode) {
          handleDemoConnect();
        } else {
          connect({
            connector: walletConnect({
              projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
            }),
          });
        }
      },
    },
  ];

  // Connected state: show address and disconnect option
  if (isConnected && displayAddress) {
    return (
      <div
        ref={dropdownRef}
        className={clsx("relative", fullWidth && "w-full")}
      >
        <div className={clsx("flex items-center gap-2", fullWidth && "w-full")}>
          {/* Network badge */}
          <span
            className="hidden sm:flex items-center gap-1.5 text-xs
            bg-surface-700 text-zinc-400 px-3 py-1.5 rounded-full
            border border-surface-500"
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-green-400
              animate-pulse"
            />
            {displayChain?.name ?? "Unknown"}
          </span>

          {/* Address button with disconnect */}
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            title="Wallet options"
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-xl",
              "bg-surface-700 border border-surface-500",
              "text-sm font-mono text-zinc-300",
              "hover:border-bitcoin-500/50 hover:text-white",
              "transition-all duration-150",
              fullWidth && "flex-1 justify-center"
            )}
          >
            <Wallet className="w-4 h-4 text-bitcoin-400" aria-hidden="true" />
            {shortenAddress(displayAddress)}
            <ChevronDown
              className={clsx(
                "w-3 h-3 text-zinc-500 transition-transform duration-200",
                showDropdown && "rotate-180"
              )}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Connected dropdown */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 top-full mt-2 w-56
                bg-surface-800 border border-surface-500
                rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-[80]"
            >
              <div className="p-1.5">
                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                    text-sm text-zinc-300 hover:text-white
                    hover:bg-red-500/10 hover:border-red-500/20
                    transition-all duration-150 text-left"
                >
                  <LogOut className="w-4 h-4 text-red-400" aria-hidden="true" />
                  Disconnect Wallet
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Disconnected state: show connect button with dropdown
  return (
    <div
      ref={dropdownRef}
      className={clsx("relative", fullWidth && "w-full")}
    >
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={clsx(
          "flex items-center justify-center gap-2",
          "px-5 py-2.5 rounded-xl",
          "bg-bitcoin-500 hover:bg-bitcoin-600 text-white",
          "font-semibold text-sm",
          "shadow-bitcoin-sm hover:shadow-bitcoin",
          "transition-all duration-200 hover:scale-105",
          fullWidth && "w-full"
        )}
      >
        <Wallet className="w-4 h-4" aria-hidden="true" />
        Connect Wallet
      </button>

      {/* Wallet selection dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-72
              bg-surface-800 border border-surface-500
              rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-[80]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h3 className="text-sm font-semibold text-white font-space">
                Connect Wallet
              </h3>
              <button
                onClick={() => setShowDropdown(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white
                  hover:bg-surface-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Wallet options */}
            <div className="p-2 space-y-1">
              {WALLET_OPTIONS.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={wallet.action}
                  disabled={isPending}
                  className="w-full flex items-center gap-3 p-3 rounded-xl
                    bg-surface-700/50 hover:bg-surface-600
                    border border-transparent hover:border-bitcoin-500/30
                    transition-all duration-150
                    disabled:opacity-50 disabled:cursor-not-allowed
                    text-left"
                >
                  <div
                    className="w-9 h-9 rounded-lg bg-bitcoin-500/10
                    flex items-center justify-center flex-shrink-0"
                  >
                    <wallet.Icon
                      className="w-4 h-4 text-bitcoin-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      {wallet.label}
                    </p>
                    <p className="text-zinc-500 text-xs">{wallet.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {isPending && (
              <p className="text-center text-xs text-zinc-500 pb-3 animate-pulse">
                Connecting...
              </p>
            )}

            <div className="border-t border-surface-600 px-4 py-2.5">
              <p className="text-[10px] text-zinc-600 text-center">
                By connecting, you agree to our Terms of Service
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
