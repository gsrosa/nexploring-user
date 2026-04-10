import { Label } from '@gsrosa/atlas-ui';
import type { ReactNode } from 'react';

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
};

export function FormField({ label, htmlFor, error, hint, children, className }: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <Label htmlFor={htmlFor} className="text-xs uppercase tracking-wider">
        {label}
      </Label>
      {children}
      {hint && !error ? (
        <p className="text-xs text-[var(--atlas-surface-muted-foreground)]">{hint}</p>
      ) : null}
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
