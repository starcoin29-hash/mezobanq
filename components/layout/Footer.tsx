// components/layout/Footer.tsx
import Link from "next/link";
import { Bitcoin, ExternalLink } from "lucide-react";

const FOOTER_LINKS = {
  Product: [
    { label: "Borrow MUSD", href: "/dashboard/borrow" },
    { label: "Gift Cards", href: "/dashboard/gift-cards" },
    { label: "Earn Yield", href: "/dashboard/yield" },
    { label: "Payments", href: "/dashboard/payments" },
    { label: "Mezo Passport", href: "/dashboard/passport" },
  ],
  Protocol: [
    { label: "Mezo Docs", href: "https://docs.mezo.org", external: true },
    { label: "MUSD Info", href: "https://mezo.org", external: true },
    { label: "Testnet Faucet", href: "https://faucet.mezo.org", external: true },
    { label: "Explorer", href: "https://explorer.test.mezo.org", external: true },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Risk Disclosure", href: "/risks" },
  ],
};

export function Footer() {
  return (
    <footer className="relative bg-surface-950 border-t border-white/4">
      {/* Ambient top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px]
          bg-bitcoin-500/[0.03] blur-[120px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
              <div
                className="w-9 h-9 rounded-xl bg-linear-to-br from-bitcoin-500 to-bitcoin-600
                  flex items-center justify-center shadow-bitcoin-sm"
              >
                <Bitcoin className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold font-space text-white tracking-tight">
                Mezo<span className="text-bitcoin-500">Banq</span>
              </span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6 max-w-xs">
              Bitcoin-native banking powered by Mezo Protocol.
              Borrow, save, and send without ever selling your BTC.
            </p>

            {/* Social links */}
            <div className="flex gap-2.5">
              {[
                {
                  href: "https://github.com",
                  label: "GitHub",
                  path: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z",
                },
                {
                  href: "https://x.com",
                  label: "Twitter",
                  path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
                },
              ].map(({ href, label, path }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/3 flex
                    items-center justify-center text-zinc-500
                    hover:text-white hover:bg-white/8
                    border border-white/4 hover:border-bitcoin-500/20
                    transition-all duration-300"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3
                className="text-white font-semibold text-sm mb-4 sm:mb-5
                  tracking-wide uppercase text-[11px]"
              >
                {category}
              </h3>
              <ul className="space-y-2.5 sm:space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-zinc-500 hover:text-white
                          transition-colors duration-200 flex items-center gap-1.5
                          group"
                      >
                        {link.label}
                        <ExternalLink
                          className="w-3 h-3 opacity-0 group-hover:opacity-100
                            transition-opacity duration-200"
                          aria-hidden="true"
                        />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-zinc-500 hover:text-white
                          transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="border-t border-white/4 pt-6 sm:pt-8 flex flex-col
            sm:flex-row justify-between items-center gap-3 sm:gap-4 text-sm"
        >
          <p className="text-zinc-600 text-xs sm:text-sm">
            © 2025 MezoBanq. Built on Mezo Protocol.
          </p>
          <p className="text-zinc-700 text-[11px] sm:text-xs">
            Not financial advice. DeFi involves risk. Do your own research.
          </p>
        </div>
      </div>
    </footer>
  );
}