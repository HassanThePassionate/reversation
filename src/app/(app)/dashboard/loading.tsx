import {
  ReservationsSkeleton,
  ResourceStatusSkeleton,
  UtilizationSkeleton,
} from "@/components/dashboard/dashboard-skeletons";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="bg-muted h-4 w-40 rounded" />
          <div className="bg-muted h-7 w-52 rounded" />
          <div className="bg-muted h-4 w-60 rounded" />
        </div>
        <div className="bg-muted h-9 w-32 rounded-lg" />
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
        <div className="bg-muted h-[640px] animate-pulse rounded-2xl" />
        <div className="space-y-5">
          <ResourceStatusSkeleton />
          <ReservationsSkeleton />
          <UtilizationSkeleton />
        </div>
      </div>
    </div>
  );
}
