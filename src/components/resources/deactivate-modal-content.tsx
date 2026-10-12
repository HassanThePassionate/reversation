import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeactivateModalContentProps {
  resourceName: string;
  futureReservationsCount: number;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeactivateModalContent({
  resourceName,
  futureReservationsCount,
  isPending,
  onCancel,
  onConfirm,
}: DeactivateModalContentProps) {
  return (
    <div className="bg-card text-card-foreground w-full max-w-md rounded-xl border p-5 shadow-lg">
      <h3 id="deactivate-title" className="text-base font-semibold">
        Deactivate Resource
      </h3>
      <p className="text-muted-foreground mt-2 text-xs">
        Are you sure you want to deactivate{" "}
        <strong className="text-foreground">{resourceName}</strong>?
      </p>

      <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
        {futureReservationsCount > 0 && (
          <TriangleAlert
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
        )}
        <span>
          {futureReservationsCount > 0
            ? `This resource has ${futureReservationsCount} upcoming confirmed reservation(s). New bookings will be blocked.`
            : "This resource has no upcoming reservations. It will be hidden from booking searches."}
        </span>
      </div>

      <div className="mt-5 flex justify-end gap-2 border-t pt-3">
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          size="sm"
          disabled={isPending}
          onClick={onConfirm}
        >
          {isPending ? "Deactivating..." : "Confirm Deactivate"}
        </Button>
      </div>
    </div>
  );
}
