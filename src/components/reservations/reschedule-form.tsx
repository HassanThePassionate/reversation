"use client";

import { useActionState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { toast } from "sonner";
import { rescheduleReservationAction } from "@/actions/reservation.actions";
import { ReservationFormFields } from "@/components/reservations/reservation-form-fields";
import { RescheduleButtons } from "@/components/reservations/reschedule-buttons";
import { DEFAULT_ORG_TIMEZONE } from "@/lib/constants";
import { env } from "@/lib/env";
import type { ActionResult } from "@/lib/errors";

interface RescheduleFormProps {
  reservation: {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    notes: string | null;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export function RescheduleForm({
  reservation,
  onSuccess,
  onCancel,
}: RescheduleFormProps) {
  const tz = env.NEXT_PUBLIC_ORG_TIMEZONE || DEFAULT_ORG_TIMEZONE;

  const [state, formAction, isPending] = useActionState(
    async (prev: ActionResult | null, formData: FormData) => {
      const res = await rescheduleReservationAction(
        reservation.id,
        prev,
        formData
      );
      if (res.success) {
        toast.success("Reservation rescheduled!");
        onSuccess();
      }
      return res;
    },
    null
  );

  return (
    <>
      {state && !state.success && state.error && (
        <div
          role="alert"
          aria-live="polite"
          className="border-destructive/20 bg-destructive/10 text-destructive mt-3 rounded-lg border p-2.5 text-xs"
        >
          {state.error}
        </div>
      )}

      <form action={formAction} className="mt-4 space-y-4">
        <ReservationFormFields
          defaultValues={{
            title: reservation.title,
            startTime: formatInTimeZone(
              reservation.startTime,
              tz,
              "yyyy-MM-dd'T'HH:mm"
            ),
            endTime: formatInTimeZone(
              reservation.endTime,
              tz,
              "yyyy-MM-dd'T'HH:mm"
            ),
            notes: reservation.notes,
          }}
          fieldErrors={state?.fieldErrors}
          disabled={isPending}
        />

        <RescheduleButtons isPending={isPending} onCancel={onCancel} />
      </form>
    </>
  );
}
