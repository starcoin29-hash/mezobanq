// app/dashboard/gift-cards/create/page.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import {
  ArrowLeft,
  CreditCard,
  Sparkles,
  Gift,
  Send,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useDemo } from "@/lib/demo/DemoContext";

// Available card themes
const THEMES = [
  { id: "bitcoin", label: "Bitcoin", gradient: "from-bitcoin-900/60 via-yellow-900/40 to-bitcoin-900/60", border: "border-bitcoin-500/40", accent: "text-bitcoin-400" },
  { id: "neon", label: "Neon", gradient: "from-purple-900/60 via-blue-900/40 to-purple-900/60", border: "border-purple-500/40", accent: "text-purple-400" },
  { id: "gold", label: "Gold", gradient: "from-yellow-900/60 via-amber-900/40 to-yellow-900/60", border: "border-yellow-500/40", accent: "text-yellow-400" },
  { id: "minimal", label: "Minimal", gradient: "from-surface-700 via-surface-800 to-surface-700", border: "border-surface-400", accent: "text-zinc-300" },
  { id: "birthday", label: "Birthday", gradient: "from-pink-900/60 via-rose-900/40 to-pink-900/60", border: "border-pink-500/40", accent: "text-pink-400" },
] as const;

// Preset amounts
const PRESET_AMOUNTS = ["10", "25", "50", "100", "250", "500"];

export default function CreateGiftCardPage() {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [theme, setTheme] = useState<string>("bitcoin");
  const [created, setCreated] = useState(false);
  const [claimCode, setClaimCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isCreating, setIsCreating] = useState(false);
  const demo = useDemo();

  const selectedTheme = THEMES.find((t) => t.id === theme) ?? THEMES[0];
  const isValid = Number(amount) >= 1;

  async function handleCreate() {
    if (!isValid || isCreating) return;
    setIsCreating(true);
    setError("");

    // ── Demo mode: simulate gift card creation ──
    if (demo.isDemoMode) {
      const amt = Number(amount);
      if (amt > demo.musdBalance) {
        setError(`Insufficient MUSD. You have ${demo.musdBalance.toLocaleString()} MUSD.`);
        setIsCreating(false);
        return;
      }
      // Simulate a brief delay
      await new Promise((r) => setTimeout(r, 1200));
      // Generate a fake claim code
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const code = "MEZO" + Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      demo.simulateGiftCard(amt, code, theme as any, message || undefined);
      setClaimCode(code);
      setCreated(true);
      setIsCreating(false);
      toast.success("Gift card created successfully!");
      return;
    }

    // ── Real mode: call API ──
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch("/api/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, message, theme }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create gift card");
      }

      setClaimCode(data.giftCard.claimCode);
      setCreated(true);
      toast.success("Gift card created successfully!");
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError("Request timed out. Please check your connection and try again.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
      toast.error("Failed to create gift card");
    } finally {
      setIsCreating(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(claimCode);
    setCopied(true);
    toast.success("Claim code copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleCreateAnother() {
    setCreated(false);
    setClaimCode("");
    setAmount("");
    setMessage("");
    setTheme("bitcoin");
    setError("");
  }

  // Success state
  if (created) {
    return (
      <div className="max-w-lg mx-auto py-12 animate-in fade-in duration-300">
        <div className="card-premium p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white font-space mb-2">
            Gift Card Created!
          </h2>
          <p className="text-zinc-400 text-sm mb-6 font-light">
            Your ${Number(amount).toLocaleString()} MUSD gift card is ready to share.
          </p>

          {/* Claim code display */}
          <div className="bg-black/30 rounded-xl p-4 mb-6 border border-white/5">
            <p className="text-xs text-zinc-500 mb-1.5">Claim Code</p>
            <p className="font-mono text-lg text-white tracking-[0.2em] select-all font-bold">
              {claimCode.match(/.{1,4}/g)?.join(" - ")}
            </p>
          </div>

          <p className="text-xs text-zinc-500 mb-6">
            Share this code with the recipient. They can claim at{" "}
            <span className="text-bitcoin-400">mezobanq.com/claim</span>
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5
                rounded-xl bg-surface-700 border border-surface-500
                text-sm text-zinc-300 hover:text-white hover:border-bitcoin-500/40
                transition-all font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Copy Code
                </>
              )}
            </button>
            <Link
              href="/dashboard/gift-cards"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5
                rounded-xl bg-bitcoin-500 hover:bg-bitcoin-600
                text-sm text-white font-semibold
                transition-all shadow-bitcoin-sm hover:shadow-bitcoin"
            >
              View All Cards
            </Link>
          </div>

          <button
            onClick={handleCreateAnother}
            className="mt-4 w-full text-sm text-zinc-500 hover:text-zinc-300
              transition-colors py-2"
          >
            Create Another Gift Card
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Back link */}
      <Link
        href="/dashboard/gift-cards"
        className="inline-flex items-center gap-2 text-sm text-zinc-400
          hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Gift Cards
      </Link>

      {/* Page title */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Gift className="w-5 h-5 text-purple-400" aria-hidden="true" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-space tracking-tight">
            Create Gift Card
          </h1>
        </div>
        <p className="text-zinc-400 text-sm sm:text-base mt-1 font-light">
          Send Bitcoin-backed MUSD to anyone with a shareable code.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 animate-in fade-in slide-in-from-top-2 duration-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p>{error}</p>
            <button
              onClick={() => setError("")}
              className="text-xs text-red-500 hover:text-red-300 mt-1 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Amount */}
          <div className="card-premium p-6 space-y-4">
            <label className="block text-sm font-medium text-white">
              Amount (MUSD)
            </label>

            {/* Preset amounts */}
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={clsx(
                    "py-2.5 rounded-xl text-sm font-semibold transition-all duration-150",
                    "border",
                    amount === preset
                      ? "bg-bitcoin-500/15 border-bitcoin-500/40 text-bitcoin-400 scale-[1.02]"
                      : "bg-surface-700/50 border-surface-500 text-zinc-400 hover:border-surface-400 hover:text-zinc-300 active:scale-95"
                  )}
                >
                  ${preset}
                </button>
              ))}
            </div>

            {/* Custom amount input */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium">
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Custom amount"
                min="1"
                max="10000"
                step="1"
                className="w-full pl-8 pr-16 py-3 rounded-xl bg-surface-700/50
                  border border-surface-500 text-white text-sm
                  placeholder:text-zinc-600
                  focus:outline-none focus:border-bitcoin-500/50 focus:ring-1 focus:ring-bitcoin-500/20
                  transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-medium">
                MUSD
              </span>
            </div>
          </div>

          {/* Message */}
          <div className="card-premium p-6 space-y-3">
            <label className="block text-sm font-medium text-white">
              Personal Message{" "}
              <span className="text-zinc-600 font-normal">(optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal note for the recipient..."
              maxLength={200}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-surface-700/50
                border border-surface-500 text-white text-sm
                placeholder:text-zinc-600
                focus:outline-none focus:border-bitcoin-500/50 focus:ring-1 focus:ring-bitcoin-500/20
                transition-all resize-none"
            />
            <p className="text-xs text-zinc-600 text-right">
              {message.length}/200
            </p>
          </div>

          {/* Theme selector */}
          <div className="card-premium p-6 space-y-3">
            <label className="block text-sm font-medium text-white">
              Card Theme
            </label>
            <div className="grid grid-cols-5 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={clsx(
                    "relative py-3 rounded-xl text-xs font-medium transition-all duration-150",
                    "bg-linear-to-br border",
                    t.gradient,
                    theme === t.id
                      ? `${t.border} ring-1 ring-white/10 scale-[1.02]`
                      : "border-transparent opacity-60 hover:opacity-80"
                  )}
                >
                  <span className={t.accent}>{t.label}</span>
                  {theme === t.id && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full
                      bg-bitcoin-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={!isValid || isCreating}
            className={clsx(
              "w-full flex items-center justify-center gap-2.5",
              "px-6 py-3.5 rounded-xl text-sm font-bold",
              "transition-all duration-200",
              isValid && !isCreating
                ? "bg-bitcoin-500 hover:bg-bitcoin-600 text-white shadow-bitcoin-sm hover:shadow-bitcoin hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                : "bg-surface-700 text-zinc-500 border border-surface-500 cursor-not-allowed"
            )}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Gift Card...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Create ${Number(amount || 0).toLocaleString()} MUSD Gift Card
              </>
            )}
          </button>
        </div>

        {/* Live preview */}
        <div className="lg:col-span-2">
          <div className="sticky top-24">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3 font-medium">
              Preview
            </p>
            <div
              className={clsx(
                "relative overflow-hidden rounded-2xl border p-6 transition-all duration-300",
                "bg-linear-to-br",
                selectedTheme.gradient,
                selectedTheme.border,
                "shadow-card"
              )}
            >
              {/* Watermark */}
              <div
                className="absolute -right-4 -bottom-4 text-[90px] font-bold
                  opacity-[0.06] select-none pointer-events-none leading-none"
                aria-hidden="true"
              >
                ₿
              </div>

              <div className="relative">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                  MUSD Gift Card
                </p>
                <p className={clsx(
                  "text-3xl font-bold font-mono mb-4",
                  selectedTheme.accent
                )}>
                  ${Number(amount || 0).toLocaleString()} MUSD
                </p>

                {message && (
                  <p className="text-sm text-zinc-400 italic mb-4 bg-black/20 rounded-lg px-3 py-2 line-clamp-2">
                    &ldquo;{message}&rdquo;
                  </p>
                )}

                <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-zinc-500 mb-1">Claim Code</p>
                  <p className="font-mono text-sm text-white tracking-widest">
                    MEZO - XXXX - XXXX - XXXX
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-zinc-600 mt-3">
                  <CreditCard className="w-3 h-3" />
                  Expires in 30 days
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
