// components/dashboard/DemoBorrowPositions.tsx
// Client component that renders the "Your Positions" panel
// using demo context data on the Borrow page.
"use client";

import { useDemo } from "@/lib/demo/DemoContext";
import { PositionCard } from "@/components/dashboard/PositionCard";

export function DemoBorrowPositions() {
  const { isDemoMode, positions } = useDemo();

  if (!isDemoMode) return null;

  const activePositions = positions.filter((p) => p.status === "active");

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white font-space">
        Your Positions ({activePositions.length})
      </h2>

      {activePositions.length === 0 ? (
        <div className="card-premium p-8 text-center">
          <p className="text-zinc-400 text-sm font-light">
            No active positions. Use the form to open your first one.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activePositions.map((pos) => (
            <PositionCard key={pos.id} position={pos} />
          ))}
        </div>
      )}
    </div>
  );
}
