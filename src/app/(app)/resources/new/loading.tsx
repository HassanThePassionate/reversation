export default function NewResourceLoading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="bg-muted h-7 w-40 rounded" />
        <div className="bg-muted h-4 w-60 rounded" />
      </div>
      <div className="bg-card space-y-4 rounded-xl border p-6 shadow-xs">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="bg-muted h-3.5 w-24 rounded" />
              <div className="bg-muted/60 h-8 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="bg-muted/60 h-20 rounded-lg" />
      </div>
    </div>
  );
}
