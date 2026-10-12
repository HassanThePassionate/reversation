interface FieldErrorProps {
  message?: string;
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p
      role="alert"
      aria-live="polite"
      className="text-destructive mt-1 text-[11px]"
    >
      {message}
    </p>
  );
}
