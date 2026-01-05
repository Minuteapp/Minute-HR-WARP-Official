
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface TaskDialogActionsProps {
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const TaskDialogActions = ({ onSubmit, onCancel, isSubmitting }: TaskDialogActionsProps) => {
  return (
    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
      <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
        Abbrechen
      </Button>
      <Button 
        onClick={onSubmit} 
        disabled={isSubmitting}
        className="bg-[#3B44F6] hover:bg-[#2a35e8] text-white"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Wird erstellt...
          </>
        ) : (
          "Aufgabe erstellen"
        )}
      </Button>
    </div>
  );
};
