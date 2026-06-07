// app/dashboard/gift-cards/create/loading.tsx
// Skeleton loading state for the create gift card page
// Shows instantly while the page JS bundle loads

export default function CreateGiftCardLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-pulse">
      {/* Back link skeleton */}
      <div className="h-4 w-32 bg-surface-700 rounded" />

      {/* Title skeleton */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-surface-700" />
          <div className="h-8 w-48 bg-surface-700 rounded-lg" />
        </div>
        <div className="h-4 w-80 bg-surface-700/60 rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form skeleton */}
        <div className="lg:col-span-3 space-y-6">
          {/* Amount card */}
          <div className="bg-surface-800/50 border border-surface-600 rounded-2xl p-6 space-y-4">
            <div className="h-4 w-24 bg-surface-700 rounded" />
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 bg-surface-700 rounded-xl" />
              ))}
            </div>
            <div className="h-12 bg-surface-700 rounded-xl" />
          </div>

          {/* Message card */}
          <div className="bg-surface-800/50 border border-surface-600 rounded-2xl p-6 space-y-3">
            <div className="h-4 w-32 bg-surface-700 rounded" />
            <div className="h-24 bg-surface-700 rounded-xl" />
          </div>

          {/* Theme card */}
          <div className="bg-surface-800/50 border border-surface-600 rounded-2xl p-6 space-y-3">
            <div className="h-4 w-20 bg-surface-700 rounded" />
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-surface-700 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Button */}
          <div className="h-14 bg-surface-700 rounded-xl" />
        </div>

        {/* Preview skeleton */}
        <div className="lg:col-span-2">
          <div className="h-4 w-16 bg-surface-700 rounded mb-3" />
          <div className="h-56 bg-surface-800/50 border border-surface-600 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
