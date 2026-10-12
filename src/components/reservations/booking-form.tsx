"use client";

import { useActionState, useRef } from "react";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { createReservationAction } from "@/actions/reservation.actions";
import { Button } from "@/components/ui/button";
import { ReservationFormFields } from "@/components/reservations/reservation-form-fields";
import type { ActionResult } from "@/lib/errors";

interface BookingFormProps {
  resourceId: string;
  isActive: boolean;
  defaultDate: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
}

export function BookingForm({
  resourceId,
  isActive,
  defaultDate,
  defaultStartTime,
  defaultEndTime,
}: BookingFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionResult | null, formData: FormData) => {
      const res = await createReservationAction(prevState, formData);
      if (res.success) {
        toast.success("Reservation confirmed!");
        formRef.current?.reset();
      }
      return res;
    },
    null
  );

  if (!isActive) {
    return (
      <div className="bg-card text-slate-500 rounded-2xl border border-dashed p-6 text-center text-xs">
        This room is currently inactive and unavailable for new bookings.
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="bg-card space-y-4 rounded-2xl border p-6 shadow-xs"
    >
      <input type="hidden" name="resourceId" value={resourceId} />
      <div className="flex items-center gap-2 border-b pb-3">
        <CalendarPlus className="h-4 w-4 text-blue-600" />
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Book this Room
        </h2>
      </div>

      {state && !state.success && state.error && (
        <div role="alert" className="border-destructive/20 bg-destructive/10 text-destructive rounded-xl border p-3 text-xs">
          {state.error}
        </div>
      )}

      <ReservationFormFields
        defaultValues={{
          startTime: defaultStartTime ?? `${defaultDate}T10:00`,
          endTime: defaultEndTime ?? `${defaultDate}T11:00`,
        }}
        fieldErrors={state?.fieldErrors}
        disabled={isPending}
      />

      <Button
        type="submit"
        disabled={isPending}
        className="w-full gap-2 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 shadow-xs"
        size="sm"
      >
        <CalendarPlus className="h-4 w-4" />
        <span>{isPending ? "Confirming..." : "Confirm Booking"}</span>
      </Button>
    </form>
  );
}
