import { Button } from "@/components/ui/button";

interface RescheduleButtonsProps {
  isPending: boolean;
  onCancel: () => void;
}

export function RescheduleButtons({
  isPending,
  onCancel,
}: RescheduleButtonsProps) {
  return (
    <div className="flex justify-end gap-2 border-t pt-4">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Updating..." : "Save Changes"}
      </Button>
    </div>
  );
}
