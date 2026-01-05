
import { Button } from "@/components/ui/button";
import { Edit2, Save, X } from 'lucide-react';

interface EditActionsProps {
  isEditing: boolean;
  isUpdating: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const EditActions = ({ isEditing, isUpdating, onEdit, onSave, onCancel }: EditActionsProps) => {
  if (isEditing) {
    return (
      <div className="space-x-2">
        <Button 
          onClick={onCancel} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Abbrechen
        </Button>
        <Button 
          onClick={onSave}
          disabled={isUpdating}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isUpdating ? 'Speichert...' : 'Speichern'}
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={onEdit}
      variant="outline"
      className="flex items-center gap-2"
    >
      <Edit2 className="h-4 w-4" />
      Bearbeiten
    </Button>
  );
};
