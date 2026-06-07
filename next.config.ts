import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Partial Pre-Rendering via cacheComponents (Next.js 16)
  // PPR pre-renders the static shell and streams dynamic content
  cacheComponents: true,

  // Allow images from Clerk and other external sources
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },

  // Security headers on every route
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;