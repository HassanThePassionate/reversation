export default function AvailabilityLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div>
        <div className="bg-muted h-7 w-60 rounded-md" />
        <div className="bg-muted mt-2 h-4 w-72 rounded-md" />
      </div>

      <div className="bg-card h-20 rounded-xl border p-4 shadow-xs" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-card flex flex-col justify-between space-y-4 rounded-xl border p-5 shadow-xs"
          >
            <div className="space-y-2">
              <div className="bg-muted h-4 w-20 rounded" />
              <div className="bg-muted h-6 w-36 rounded" />
              <div className="bg-muted h-3 w-28 rounded" />
            </div>
            <div className="bg-muted mt-4 h-8 w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
