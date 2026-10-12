"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  activateResourceAction,
  deactivateResourceAction,
} from "@/actions/resource.actions";
import { Button } from "@/components/ui/button";
import { DeactivateModalContent } from "@/components/resources/deactivate-modal-content";

interface DeactivateDialogProps {
  resourceId: string;
  resourceName: string;
  isActive: boolean;
  futureReservationsCount: number;
}

export function DeactivateDialog({
  resourceId,
  resourceName,
  isActive,
  futureReservationsCount,
}: DeactivateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const res = isActive
        ? await deactivateResourceAction(resourceId)
        : await activateResourceAction(resourceId);

      if (!res.success) {
        toast.error(res.error || "Action failed");
        return;
      }
      toast.success(isActive ? "Resource deactivated." : "Resource activated.");
      setIsOpen(false);
    });
  }

  if (!isActive) {
    return (
      <Button
        variant="outline"
        size="xs"
        disabled={isPending}
        onClick={handleToggle}
      >
        {isPending ? "Activating..." : "Activate"}
      </Button>
    );
  }

  return (
    <>
      <Button variant="destructive" size="xs" onClick={() => setIsOpen(true)}>
        Deactivate
      </Button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="deactivate-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        >
          <DeactivateModalContent
            resourceName={resourceName}
            futureReservationsCount={futureReservationsCount}
            isPending={isPending}
            onCancel={() => setIsOpen(false)}
            onConfirm={handleToggle}
          />
        </div>
      )}
    </>
  );
}
