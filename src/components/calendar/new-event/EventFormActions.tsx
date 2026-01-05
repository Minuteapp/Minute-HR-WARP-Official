
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface EventFormActionsProps {
  onCancel: () => void;
  onSave: () => void;
  disabled?: boolean;
}

const EventFormActions = ({ onCancel, onSave, disabled = false }: EventFormActionsProps) => {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button 
        variant="outline" 
        onClick={onCancel} 
        disabled={disabled}
        type="button"
      >
        Abbrechen
      </Button>
      <Button 
        onClick={onSave} 
        disabled={disabled}
        type="button"
      >
        {disabled ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Speichern...
          </>
        ) : (
          "Speichern"
        )}
      </Button>
    </div>
  );
};

export default EventFormActions;
