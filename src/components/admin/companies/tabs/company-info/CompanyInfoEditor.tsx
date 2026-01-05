
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Edit, X } from 'lucide-react';

interface EditorProps {
  isEditMode?: boolean;
  isSaving?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
}

export const CompanyInfoEditor: React.FC<EditorProps> = ({ 
  isEditMode = true, 
  isSaving = false, 
  onEdit, 
  onSave, 
  onCancel 
}) => {
  if (isEditMode) {
    return (
      <div className="space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCancel}
          disabled={isSaving}
        >
          <X className="h-4 w-4 mr-1" /> 
          Abbrechen
        </Button>
        <Button 
          size="sm" 
          onClick={onSave}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-1" /> 
          {isSaving ? 'Wird gespeichert...' : 'Speichern'}
        </Button>
      </div>
    );
  }
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onEdit}
    >
      <Edit className="h-4 w-4 mr-1" /> 
      Bearbeiten
    </Button>
  );
};
