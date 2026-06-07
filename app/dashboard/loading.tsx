// app/dashboard/loading.tsx
// Dashboard loading skeleton — shows during dashboard route transitions
// Uses CSS-only skeletons for zero JS cost

export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 animate-fade-in">
      {/* Page title skeleton */}
      <div className="space-y-2">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-5 w-96" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-surface-600/50 bg-surface-800 p-6 space-y-3"
          >
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-8 w-32" />
            <div className="skeleton h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-4">
          <div className="skeleton h-6 w-40" />
          <div className="rounded-2xl border border-surface-600/50 bg-surface-800 p-8 space-y-4">
            <div className="skeleton h-5 w-full" />
            <div className="skeleton h-5 w-4/5" />
            <div className="skeleton h-5 w-3/5" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="skeleton h-6 w-32" />
          <div className="rounded-2xl border border-surface-600/50 bg-surface-800 p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton w-8 h-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-3 w-3/4" />
                  <div className="skeleton h-2 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
