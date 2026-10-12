"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RescheduleForm } from "@/components/reservations/reschedule-form";

interface RescheduleDialogProps {
  reservation: {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    notes: string | null;
  };
}

export function RescheduleDialog({ reservation }: RescheduleDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-8 gap-1.5 rounded-lg px-2.5 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300"
      >
        <CalendarClock className="h-3.5 w-3.5 text-blue-600" />
        <span>Reschedule</span>
      </Button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reschedule-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        >
          <div className="bg-card w-full max-w-md rounded-2xl border p-6 shadow-xl">
            <h3 id="reschedule-title" className="text-base font-bold text-slate-900 dark:text-white">
              Reschedule Meeting
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Choose a new time slot or update meeting reservation details.
            </p>

            <RescheduleForm
              reservation={reservation}
              onSuccess={() => setIsOpen(false)}
              onCancel={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
