
import { Button } from "@/components/ui/button";

interface FormNavButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  showSubmit?: boolean;
  isSubmitting?: boolean;
  isFormValid?: boolean;
  mode: 'create' | 'edit';
}

export const FormNavButtons = ({
  onBack,
  onNext,
  backLabel = "Zurück",
  nextLabel = "Weiter",
  showSubmit = false,
  isSubmitting = false,
  isFormValid = true,
  mode
}: FormNavButtonsProps) => {
  return (
    <div className="flex justify-between">
      {onBack && (
        <Button variant="outline" onClick={onBack} type="button">
          {backLabel}
        </Button>
      )}
      <div className="flex-grow"></div>
      {showSubmit && (
        <Button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className="ml-auto"
        >
          {isSubmitting
            ? 'Wird gespeichert...'
            : mode === 'create'
              ? 'Projekt erstellen'
              : 'Projekt aktualisieren'}
        </Button>
      )}
      {onNext && (
        <Button variant="outline" onClick={onNext} type="button" className={showSubmit ? "ml-2" : "ml-auto"}>
          {nextLabel}
        </Button>
      )}
    </div>
  );
};
