export default function MyReservationsLoading() {
  return (
    <div className="animate-pulse space-y-8">
      <div>
        <div className="bg-muted h-7 w-48 rounded-md" />
        <div className="bg-muted mt-2 h-4 w-64 rounded-md" />
      </div>

      <div className="space-y-4">
        <div className="bg-muted h-6 w-36 rounded-md" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-card flex flex-col justify-between gap-4 rounded-xl border p-4 shadow-xs sm:flex-row sm:items-center"
            >
              <div className="space-y-2">
                <div className="bg-muted h-5 w-40 rounded-md" />
                <div className="bg-muted h-4 w-48 rounded" />
                <div className="bg-muted h-3 w-32 rounded" />
              </div>
              <div className="bg-muted h-8 w-32 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
