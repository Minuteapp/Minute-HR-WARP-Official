import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Undo, Redo, Play, Save, Loader2 } from 'lucide-react';

interface BuilderHeaderProps {
  name: string;
  description: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onSave: () => void;
  isSaving?: boolean;
}

export const BuilderHeader: React.FC<BuilderHeaderProps> = ({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  onSave,
  isSaving = false,
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <Input
              placeholder="Workflow-Name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="text-lg font-semibold border-none bg-transparent px-0 focus-visible:ring-0"
            />
            <Textarea
              placeholder="Beschreibung des Workflows..."
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="resize-none border-none bg-transparent px-0 focus-visible:ring-0 min-h-[60px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Redo className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Play className="h-4 w-4" />
            </Button>
            <Button onClick={onSave} disabled={isSaving} className="bg-primary text-primary-foreground">
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? 'Speichern...' : 'Speichern'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
