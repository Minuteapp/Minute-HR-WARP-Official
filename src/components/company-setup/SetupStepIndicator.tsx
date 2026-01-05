import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SetupStep } from '@/hooks/useCompanySetup';

interface SetupStepIndicatorProps {
  steps: SetupStep[];
  currentStep: SetupStep;
  completedSteps: SetupStep[];
  onStepClick?: (step: SetupStep) => void;
}

const STEP_LABELS: Record<SetupStep, string> = {
  welcome: 'Willkommen',
  locations: 'Standorte',
  departments: 'Abteilungen',
  teams: 'Teams',
  employees: 'Mitarbeiter',
  modules: 'Module',
  complete: 'Fertig',
};

export const SetupStepIndicator = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: SetupStepIndicatorProps) => {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step);
          const isCurrent = step === currentStep;
          const isPast = index < currentIndex;
          const isClickable = isCompleted || isPast;

          return (
            <div key={step} className="flex items-center flex-1">
              {/* Step Circle */}
              <button
                onClick={() => isClickable && onStepClick?.(step)}
                disabled={!isClickable}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && !isCompleted && "border-primary bg-primary/10 text-primary",
                  !isCurrent && !isCompleted && "border-muted-foreground/30 text-muted-foreground",
                  isClickable && "cursor-pointer hover:scale-110",
                  !isClickable && "cursor-default"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </button>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2 rounded",
                    isPast || isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Labels */}
      <div className="flex items-center justify-between mt-2">
        {steps.map((step) => (
          <div key={step} className="flex-1 text-center">
            <span className={cn(
              "text-xs font-medium",
              step === currentStep ? "text-primary" : "text-muted-foreground"
            )}>
              {STEP_LABELS[step]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
