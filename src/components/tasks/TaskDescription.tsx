
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Edit, Save, X } from "lucide-react";

interface TaskDescriptionProps {
  description: string;
  onDescriptionChange: (value: string) => void;
}

export const TaskDescription = ({ description, onDescriptionChange }: TaskDescriptionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState(description);

  const handleSave = () => {
    onDescriptionChange(editingValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditingValue(description);
    setIsEditing(false);
  };

  const startEditing = () => {
    setEditingValue(description);
    setIsEditing(true);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Beschreibung</h3>
        
        {!isEditing && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={startEditing}
            className="h-8 px-2 text-gray-500 hover:text-gray-700"
          >
            <Edit className="h-4 w-4 mr-1" />
            <span className="text-xs">Bearbeiten</span>
          </Button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            placeholder="Beschreibung hinzufügen..."
            className="min-h-[120px] focus-visible:ring-[#9b87f5]"
            autoFocus
          />
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              <X className="h-4 w-4 mr-1" />
              Abbrechen
            </Button>
            
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="bg-[#9b87f5] hover:bg-[#8e7aef]"
            >
              <Save className="h-4 w-4 mr-1" />
              Speichern
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-md p-4 min-h-[100px]">
          {description ? (
            <p className="text-sm whitespace-pre-wrap">{description}</p>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Keine Beschreibung vorhanden. Klicken Sie auf "Bearbeiten", um eine Beschreibung hinzuzufügen.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
