export default function LoginLoading() {
  return (
    <div className="bg-card w-full max-w-md animate-pulse space-y-4 rounded-xl border p-8 shadow-sm">
      <div className="space-y-2 text-center">
        <div className="bg-muted mx-auto h-6 w-32 rounded" />
        <div className="bg-muted mx-auto h-4 w-48 rounded" />
      </div>
      <div className="space-y-3 pt-4">
        <div className="bg-muted/60 h-9 rounded-md" />
        <div className="bg-muted/60 h-9 rounded-md" />
        <div className="bg-muted h-9 rounded-md" />
      </div>
    </div>
  );
}
