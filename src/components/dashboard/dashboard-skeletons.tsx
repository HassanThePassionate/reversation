export function ResourceStatusSkeleton() {
  return (
    <div className="bg-card animate-pulse rounded-xl border p-5 shadow-xs">
      <div className="bg-muted h-5 w-36 rounded-md" />
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-muted/50 h-16 rounded-lg" />
        <div className="bg-muted/50 h-16 rounded-lg" />
        <div className="bg-muted/50 h-16 rounded-lg" />
      </div>
    </div>
  );
}

export function ReservationsSkeleton() {
  return (
    <div className="bg-card animate-pulse rounded-xl border p-5 shadow-xs">
      <div className="flex justify-between">
        <div className="bg-muted h-5 w-40 rounded-md" />
        <div className="bg-muted h-4 w-20 rounded" />
      </div>
      <div className="mt-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-muted/50 h-14 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function UtilizationSkeleton() {
  return (
    <div className="bg-card animate-pulse rounded-xl border p-5 shadow-xs">
      <div className="flex justify-between">
        <div className="bg-muted h-5 w-44 rounded-md" />
        <div className="bg-muted h-4 w-24 rounded" />
      </div>
      <div className="mt-4 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <div className="bg-muted h-3.5 w-28 rounded" />
              <div className="bg-muted h-3.5 w-12 rounded" />
            </div>
            <div className="bg-muted/50 h-2.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
