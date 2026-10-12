export default function ResourceDetailLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="bg-card space-y-4 rounded-xl border p-6 shadow-xs">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="bg-muted h-5 w-24 rounded-md" />
            <div className="bg-muted h-8 w-64 rounded-md" />
          </div>
          <div className="bg-muted h-8 w-28 rounded-md" />
        </div>
        <div className="grid grid-cols-3 gap-2 border-t pt-4">
          <div className="bg-muted h-4 w-32 rounded" />
          <div className="bg-muted h-4 w-32 rounded" />
          <div className="bg-muted h-4 w-32 rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="bg-card h-96 rounded-xl border p-6 shadow-xs lg:col-span-2" />
        <div className="bg-card h-80 rounded-xl border p-6 shadow-xs" />
      </div>
    </div>
  );
}
