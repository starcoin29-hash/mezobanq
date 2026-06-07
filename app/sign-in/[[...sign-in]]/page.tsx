// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";
import { Bitcoin } from "lucide-react";

export const metadata = { title: "Sign In" };

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px]
            h-[400px] bg-bitcoin-500/6 blur-[120px] rounded-full"
        />
      </div>

      {/* Logo */}
      <div className="flex items-center justify-center gap-2.5 mb-8 relative z-10">
        <div
          className="w-10 h-10 rounded-xl bg-bitcoin-500
            flex items-center justify-center shadow-bitcoin-sm"
        >
          <Bitcoin className="w-6 h-6 text-white" aria-hidden="true" />
        </div>
        <span className="text-2xl font-bold font-space text-white">
          Mezo<span className="text-bitcoin-500">Banq</span>
        </span>
      </div>

      {/* Clerk SignIn component -- themed via ClerkProvider in layout.tsx */}
      <div className="relative z-10">
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              cardBox: "shadow-2xl",
            },
          }}
        />
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-zinc-600 mt-6 relative z-10">
        Your keys, your coins. MezoBanq never touches your Bitcoin.
      </p>
    </div>
  );
}
