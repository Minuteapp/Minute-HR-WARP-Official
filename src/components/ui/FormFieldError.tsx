import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormFieldErrorProps {
  error?: string | null;
  className?: string;
  showIcon?: boolean;
}

export const FormFieldError: React.FC<FormFieldErrorProps> = ({
  error,
  className,
  showIcon = true,
}) => {
  if (!error) return null;

  return (
    <div 
      className={cn(
        "flex items-center gap-1.5 text-sm text-destructive mt-1.5",
        className
      )}
      role="alert"
    >
      {showIcon && <AlertCircle className="h-3.5 w-3.5 shrink-0" />}
      <span>{error}</span>
    </div>
  );
};

interface FormFieldProps {
  label?: string;
  error?: string | null;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
  hint?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  className,
  children,
  hint,
}) => {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      <FormFieldError error={error} />
    </div>
  );
};

export default FormFieldError;
