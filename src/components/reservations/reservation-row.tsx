"use client";

import { useOptimistic, useTransition } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { Clock, DoorOpen, User } from "lucide-react";
import { toast } from "sonner";
import { cancelReservationAction } from "@/actions/reservation.actions";
import { CancelDialog } from "@/components/reservations/cancel-dialog";
import { RescheduleDialog } from "@/components/reservations/reschedule-dialog";
import { ReservationStatusBadge } from "@/components/reservations/reservation-status-badge";
import type { ReservationRowProps } from "@/components/reservations/reservation-types";
import { DEFAULT_ORG_TIMEZONE } from "@/lib/constants";
import { env } from "@/lib/env";
import { ReservationStatus } from "@prisma/client";

export function ReservationRow({
  reservation,
  viewerId,
  isAdmin,
}: ReservationRowProps) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    reservation.status,
    (_, next: ReservationStatus) => next
  );
  const [isPending, startTransition] = useTransition();
  const tz = env.NEXT_PUBLIC_ORG_TIMEZONE || DEFAULT_ORG_TIMEZONE;

  const dateStr = formatInTimeZone(reservation.startTime, tz, "yyyy-MM-dd");
  const timeStr = `${formatInTimeZone(reservation.startTime, tz, "HH:mm")} – ${formatInTimeZone(reservation.endTime, tz, "HH:mm")}`;
  const isEnded = Boolean(reservation.isCompleted);
  const isCancelled = optimisticStatus === ReservationStatus.CANCELLED;
  const canModify =
    (isAdmin || reservation.user.id === viewerId) && !isEnded && !isCancelled;

  function handleCancel() {
    startTransition(async () => {
      setOptimisticStatus(ReservationStatus.CANCELLED);
      const res = await cancelReservationAction(reservation.id);
      if (!res.success) toast.error(res.error || "Failed to cancel reservation");
      else toast.success("Reservation cancelled.");
    });
  }

  return (
    <div className="bg-card flex flex-col justify-between gap-4 rounded-2xl border p-4 shadow-xs transition hover:shadow-sm sm:flex-row sm:items-center">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
            {reservation.title}
          </span>
          <ReservationStatusBadge
            status={optimisticStatus}
            isCompleted={isEnded}
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
            <DoorOpen className="h-3.5 w-3.5 text-blue-500" />
            {reservation.resource.name}
          </span>
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-slate-400" />
            {reservation.user.name}
          </span>
          <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
            <Clock className="h-3 w-3" />
            {dateStr} • {timeStr}
          </span>
        </div>
      </div>

      {canModify && (
        <div className="flex items-center gap-2 self-end sm:self-center">
          <RescheduleDialog reservation={reservation} />
          <CancelDialog
            reservationTitle={reservation.title}
            onConfirm={handleCancel}
            disabled={isPending}
          />
        </div>
      )}
    </div>
  );
}
