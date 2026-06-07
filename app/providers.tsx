// app/providers.tsx
// Global providers — wraps every page with Web3 + data + theme context
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useState } from "react";
import { DemoProvider } from "@/lib/demo/DemoContext";

// Suppress empty {} console.error noise from WalletConnect v2 SDK
// The WC relay client logs empty objects on connection attempts -- harmless but noisy
if (typeof window !== "undefined") {
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    try {
      // Filter out empty-object errors from WalletConnect relay
      const isEmptyOrNoise = (v: unknown): boolean => {
        if (v === "{}" || v === "" || v === undefined) return true;
        if (
          v !== null &&
          typeof v === "object" &&
          !(v instanceof Error) &&
          !(v instanceof Array)
        ) {
          // Catch objects with zero own keys (including non-enumerable edge cases)
          if (Object.keys(v as Record<string, unknown>).length === 0) return true;
          // Catch objects that stringify to "{}" (e.g. WC relay error wrappers)
          try {
            if (JSON.stringify(v) === "{}") return true;
          } catch {
            /* non-serializable — not WC noise */
          }
        }
        return false;
      };

      // Suppress if ALL args are empty noise, OR if it's a single empty-object arg
      if (args.length > 0 && args.every((a) => isEmptyOrNoise(a))) {
        return;
      }
      // Also suppress single-arg calls where the only arg is WC relay noise
      if (args.length === 1 && isEmptyOrNoise(args[0])) {
        return;
      }
    } catch {
      // Never let the filter itself cause an error
    }
    originalConsoleError.apply(console, args);
  };
}

export function Providers({ children }: { children: React.ReactNode }) {
  // QueryClient must be created with useState to avoid sharing state
  // between different users in SSR (server-side rendering)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 30 seconds before refetching
            staleTime: 30_000,
            // Retry failed requests twice before showing error
            retry: 2,
            // Refetch when browser window regains focus (good for balances)
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  return (
    // WagmiProvider: provides wallet connection state to the entire app
    <WagmiProvider config={wagmiConfig}>
      {/* React Query: handles all data fetching, caching, and background refetching */}
      <QueryClientProvider client={queryClient}>
        {/* ThemeProvider: manages dark/light mode via CSS class on <html> */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false} // We default to dark -- no system detection
          disableTransitionOnChange={false}
        >
          <DemoProvider>
            {children}
          </DemoProvider>

          {/* Toaster: renders toast notifications -- must be inside providers */}
          <Toaster
            position="top-right"
            richColors
            expand={false}
            duration={4000}
            theme="dark"
            toastOptions={{
              style: {
                background: "#1A1A24",
                border: "1px solid #2E2E40",
                color: "#ffffff",
                fontFamily: "var(--font-inter)",
                fontSize: "14px",
              },
            }}
          />
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
