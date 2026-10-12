interface ResourceActiveToggleProps {
  isActive?: boolean;
  isPending: boolean;
}

export function ResourceActiveToggle({
  isActive = true,
  isPending,
}: ResourceActiveToggleProps) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <input
        id="isActive"
        type="checkbox"
        name="isActive"
        value="true"
        defaultChecked={isActive}
        disabled={isPending}
        className="h-4 w-4 rounded border-gray-300"
      />
      <label htmlFor="isActive" className="text-foreground text-xs font-medium">
        Active and available for bookings
      </label>
    </div>
  );
}
