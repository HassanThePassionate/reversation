import { DashboardReservationItem } from "@/components/dashboard/dashboard-reservation-item";

interface ReservationSummary {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  resource: { id: string; name: string };
  user: { name: string };
}

interface DashboardReservationColumnProps {
  title: string;
  count: number;
  emptyText: string;
  items: ReservationSummary[];
  formatTime: (res: ReservationSummary) => string;
  isAdmin: boolean;
}

export function DashboardReservationColumn({
  title,
  count,
  emptyText,
  items,
  formatTime,
  isAdmin,
}: DashboardReservationColumnProps) {
  return (
    <div>
      <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
        {title} ({count})
      </h3>
      <div className="mt-2.5 space-y-2">
        {items.length === 0 ? (
          <p className="text-muted-foreground bg-muted/20 rounded-lg border border-dashed p-4 text-center text-xs">
            {emptyText}
          </p>
        ) : (
          items.map((res) => (
            <DashboardReservationItem
              key={res.id}
              id={res.id}
              title={res.title}
              timeLabel={formatTime(res)}
              resourceId={res.resource.id}
              resourceName={res.resource.name}
              userName={isAdmin ? res.user.name : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
