// app/dashboard/layout.tsx
// This layout wraps all dashboard pages
// It's a Server Component that checks authentication before rendering

import { currentUser } from "@clerk/nextjs/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Web3Provider } from "@/app/Web3Provider";
import { InlineSignIn } from "./InlineSignIn";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch the current user on the server via Clerk
  const isDevBypass = process.env.DEV_BYPASS_AUTH === "true";
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  let user = null;

  if (!isDevBypass && !isDemoMode) {
    try {
      user = await currentUser();
    } catch (error) {
      // Clerk network failures (API unreachable, rate-limited, etc.)
      // should not crash the entire page — fall through to InlineSignIn
      console.warn("[DashboardLayout] Clerk auth failed, showing sign-in:", error);
    }
  }

  // If not logged in (or auth failed), show inline sign-in modal instead of redirecting
  const isAuthenticated = !!user || isDevBypass || isDemoMode;

  return (
    <Web3Provider>
      <div className="min-h-screen bg-surface-900 page-background">
        {/* Ambient glow orbs — same as landing page for visual consistency */}
        <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
          <div
            className="glow-orb absolute top-[10%] left-[15%] w-[500px] h-[500px]
              rounded-full bg-bitcoin-500/[0.04] blur-[100px] animate-pulse-slow
              mix-blend-screen"
          />
          <div
            className="glow-orb absolute bottom-[20%] right-[10%] w-[400px] h-[400px]
              rounded-full bg-mezo-500/[0.03] blur-[100px] animate-float-slow
              mix-blend-screen"
          />
        </div>

        {/* Shared premium navbar */}
        <Header />

        {/* Main content area with top padding for fixed header */}
        <main className="relative z-10 pt-[72px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            {isAuthenticated ? (
              children
            ) : (
              <InlineSignIn />
            )}
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Web3Provider>
  );
}