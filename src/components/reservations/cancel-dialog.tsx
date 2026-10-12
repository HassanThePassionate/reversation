"use client";

import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CancelDialogProps {
  reservationTitle: string;
  onConfirm: () => Promise<void> | void;
  disabled?: boolean;
}

export function CancelDialog({
  reservationTitle,
  onConfirm,
  disabled,
}: CancelDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  async function handleConfirm() {
    setIsCancelling(true);
    try {
      await onConfirm();
      setIsOpen(false);
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className="h-8 gap-1 rounded-lg px-2.5 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span>Cancel</span>
      </Button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        >
          <div className="bg-card w-full max-w-sm rounded-2xl border p-6 shadow-xl">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              <h3 id="cancel-title" className="text-base font-bold text-slate-900 dark:text-white">
                Cancel Meeting?
              </h3>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Are you sure you want to cancel &ldquo;{reservationTitle}&rdquo;? The slot will be freed up for others.
            </p>

            <div className="mt-5 flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" size="sm" disabled={isCancelling} onClick={() => setIsOpen(false)}>
                Keep
              </Button>
              <Button variant="destructive" size="sm" disabled={isCancelling} onClick={handleConfirm}>
                {isCancelling ? "Cancelling..." : "Confirm Cancel"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
