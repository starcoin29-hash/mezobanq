// app/dashboard/InlineSignIn.tsx
// Renders the Clerk sign-in UI inline on the dashboard page
// so users never leave the page to authenticate
"use client";

import { SignIn } from "@clerk/nextjs";
import { Bitcoin, Shield } from "lucide-react";

export function InlineSignIn() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 animate-in fade-in duration-500">
      {/* Decorative glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px]
          h-[350px] bg-bitcoin-500/6 blur-[120px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="relative z-10 text-center mb-8">
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <div
            className="w-12 h-12 rounded-xl bg-bitcoin-500
              flex items-center justify-center shadow-bitcoin-sm"
          >
            <Bitcoin className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white font-space mb-2">
          Welcome to Mezo<span className="text-bitcoin-500">Banq</span>
        </h2>
        <p className="text-zinc-400 text-sm max-w-sm mx-auto font-light">
          Sign in to access your Bitcoin-native banking dashboard.
          Your keys, your coins.
        </p>
      </div>

      {/* Clerk SignIn — styled to match the app */}
      <div className="relative z-10 w-full max-w-md">
        <SignIn
          routing="hash"
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              cardBox: "shadow-2xl shadow-black/40 border border-surface-500 rounded-2xl",
              card: "bg-surface-800 rounded-2xl",
              headerTitle: "text-white font-space",
              headerSubtitle: "text-zinc-400",
              formFieldInput:
                "bg-surface-700 border-surface-500 text-white placeholder:text-zinc-500 focus:border-bitcoin-500/50 focus:ring-bitcoin-500/20 rounded-xl",
              formButtonPrimary:
                "bg-bitcoin-500 hover:bg-bitcoin-600 text-white font-semibold shadow-bitcoin-sm hover:shadow-bitcoin transition-all rounded-xl",
              footerActionLink: "text-bitcoin-400 hover:text-bitcoin-300",
              socialButtonsBlockButton:
                "bg-surface-700 border-surface-500 text-white hover:bg-surface-600 rounded-xl transition-all",
              dividerLine: "bg-surface-600",
              dividerText: "text-zinc-500",
              formFieldLabel: "text-zinc-300",
              identityPreviewEditButton: "text-bitcoin-400",
              formFieldAction: "text-bitcoin-400",
              alertText: "text-red-400",
              footer: "hidden",
            },
          }}
        />
      </div>

      {/* Security note */}
      <div className="relative z-10 flex items-center gap-2 mt-6 text-xs text-zinc-600">
        <Shield className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Protected by Clerk · End-to-end encrypted</span>
      </div>
    </div>
  );
}
