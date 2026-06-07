// app/layout.tsx
// Root layout: wraps EVERY page in the app
// This is a Server Component -- runs on the server for every request

import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Providers } from "./providers";

// Load Google Fonts -- Next.js downloads them at build time,
// so users never need to fetch from Google's servers (privacy + speed)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap", // 'swap' prevents invisible text while font loads
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

// Metadata is used for SEO and social media sharing
export const metadata: Metadata = {
  title: {
    default: "MezoBanq -- Bitcoin-Native Banking",
    template: "%s | MezoBanq", // e.g., "Dashboard | MezoBanq"
  },
  icons: {
    icon: "/image.png",
  },
  description:
    "Borrow MUSD against your Bitcoin at 1% fixed interest. " +
    "Send Bitcoin gift cards, earn yield, and manage your " +
    "Bitcoin finances -- all without selling a single satoshi.",
  keywords: [
    "Bitcoin",
    "MUSD",
    "DeFi",
    "Mezo Protocol",
    "stablecoin",
    "Bitcoin banking",
    "crypto lending",
  ],
  openGraph: {
    type: "website",
    title: "MezoBanq -- Bitcoin-Native Banking",
    description: "Your Bitcoin, working for you. Powered by Mezo.",
    url: "https://mezobanq.xyz",
    siteName: "MezoBanq",
    images: [
      {
        url: "/og-image.png", // Create a 1200x630 image in /public
        width: 1200,
        height: 630,
        alt: "MezoBanq -- Bitcoin Banking",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MezoBanq -- Bitcoin-Native Banking",
    description: "Borrow MUSD against Bitcoin at 1% fixed rate",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#F7931A",
          colorBackground: "#12121A",
          colorInputBackground: "#1A1A24",
          colorInputText: "#FFFFFF",
          borderRadius: "0.75rem",
          fontFamily: "var(--font-inter)",
        },
      }}
    >
      <html
        lang="en"
        // suppressHydrationWarning prevents React from warning about
        // the 'class' attribute mismatch between server and client
        // (next-themes adds 'dark' class on client, server doesn't know)
        suppressHydrationWarning
        className={`${inter.variable} ${spaceGrotesk.variable}`}
      >
        <body
          className="bg-surface-900 text-white antialiased font-sans
            min-h-screen"
        >
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}