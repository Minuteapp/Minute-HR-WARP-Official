import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText, PasswordValidationResult } from '@/utils/validation/passwordValidator';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValidationChange?: (validation: PasswordValidationResult) => void;
  showStrengthIndicator?: boolean;
  showValidationErrors?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, onValidationChange, showStrengthIndicator = false, showValidationErrors = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [validation, setValidation] = useState<PasswordValidationResult | null>(null);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const password = e.target.value;
      
      if (showStrengthIndicator || showValidationErrors || onValidationChange) {
        const validationResult = validatePassword(password);
        setValidation(validationResult);
        onValidationChange?.(validationResult);
      }
      
      props.onChange?.(e);
    };

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            ref={ref}
            type={showPassword ? "text" : "password"}
            className={cn("pr-10", className)}
            onChange={handlePasswordChange}
            {...props}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Password Strength Indicator */}
        {showStrengthIndicator && validation && props.value && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Password Strength:</span>
              <span className={cn("text-sm font-medium", getPasswordStrengthColor(validation.strength))}>
                {getPasswordStrengthText(validation.strength)}
              </span>
            </div>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "h-2 flex-1 rounded-full transition-colors",
                    level <= validation.score
                      ? validation.strength === 'strong'
                        ? 'bg-success'
                        : validation.strength === 'medium'
                        ? 'bg-warning'
                        : 'bg-destructive'
                      : 'bg-muted'
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {showValidationErrors && validation && validation.errors.length > 0 && (
          <div className="space-y-1">
            {validation.errors.map((error, index) => (
              <p key={index} className="text-sm text-destructive">
                {error}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";