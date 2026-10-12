interface FormFieldProps {
  label: string;
  id?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({
  label,
  id,
  error,
  required,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-foreground block text-xs font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p role="alert" aria-live="polite" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
