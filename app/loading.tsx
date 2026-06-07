// app/loading.tsx
// Root loading skeleton — shows instantly during route transitions
// Pure CSS, no external dependencies

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Animated logo placeholder */}
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-gradient-bitcoin opacity-80 animate-pulse" />
          <div
            className="absolute inset-0 w-12 h-12 rounded-xl"
            style={{
              background: "linear-gradient(135deg, #f7931a, #f5b942)",
              animation: "pulse-glow 2s ease-in-out infinite",
            }}
          />
        </div>
        {/* Loading text */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-sm font-medium tracking-wide">
            Loading
          </span>
          <span className="flex gap-1">
            <span className="w-1 h-1 rounded-full bg-bitcoin-500/60 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1 h-1 rounded-full bg-bitcoin-500/60 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1 h-1 rounded-full bg-bitcoin-500/60 animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
        </div>
      </div>
    </div>
  );
}
