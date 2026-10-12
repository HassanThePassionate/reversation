export default function ResourcesLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="bg-muted h-7 w-36 rounded-md" />
          <div className="bg-muted mt-2 h-4 w-64 rounded-md" />
        </div>
        <div className="bg-muted h-8 w-28 rounded-lg" />
      </div>

      <div className="bg-card h-16 rounded-xl border p-4 shadow-xs" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-card space-y-4 rounded-xl border p-5 shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="bg-muted h-4 w-20 rounded-md" />
                <div className="bg-muted h-5 w-32 rounded-md" />
              </div>
              <div className="bg-muted h-5 w-14 rounded-full" />
            </div>
            <div className="space-y-2 pt-2">
              <div className="bg-muted h-3 w-40 rounded" />
              <div className="bg-muted h-3 w-28 rounded" />
              <div className="bg-muted h-3 w-32 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
