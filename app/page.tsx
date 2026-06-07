// app/page.tsx
// Public landing page -- no authentication required
// This is a Server Component: no 'use client' needed here
// Child components that animate will be Client Components

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CTA } from "@/components/landing/CTA";

// We use Suspense to stream components as they load
// This makes the page feel fast -- users see content immediately
import { Suspense } from "react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-900 overflow-hidden">
      <Header />

      {/* Hero renders immediately -- no data fetching needed */}
      <Hero />

      {/* Stats can be streamed in after */}
      <Suspense fallback={<div className="h-32" />}>
        <Stats />
      </Suspense>

      <Features />
      <HowItWorks />
      <CTA />

      <Footer />
    </div>
  );
}
