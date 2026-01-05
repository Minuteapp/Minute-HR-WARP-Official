import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';

interface SettingsHeaderProps {
  isSaving: boolean;
  hasChanges: boolean;
  onSave: () => void;
}

export const SettingsHeader = ({ isSaving, hasChanges, onSave }: SettingsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Workflow-Einstellungen</h2>
        <p className="text-sm text-muted-foreground">
          Globale Konfiguration für Workflows & Automatisierungen
        </p>
      </div>
      <Button 
        onClick={onSave} 
        disabled={isSaving || !hasChanges}
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Änderungen speichern
      </Button>
    </div>
  );
};
