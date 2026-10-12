export default function ReservationsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div>
        <div className="bg-muted h-7 w-40 rounded-md" />
        <div className="bg-muted mt-2 h-4 w-64 rounded-md" />
      </div>

      <div className="bg-card h-20 rounded-xl border p-4 shadow-xs" />

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-card flex flex-col justify-between gap-4 rounded-xl border p-4 shadow-xs sm:flex-row sm:items-center"
          >
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="bg-muted h-5 w-32 rounded-md" />
                <div className="bg-muted h-5 w-16 rounded-full" />
              </div>
              <div className="bg-muted h-4 w-48 rounded" />
              <div className="bg-muted h-3 w-36 rounded" />
            </div>
            <div className="bg-muted h-8 w-36 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
