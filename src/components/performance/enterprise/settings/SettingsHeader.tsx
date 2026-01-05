import React from 'react';
import { Settings } from 'lucide-react';

export const SettingsHeader = () => {
  return (
    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg border">
      <div className="p-3 bg-primary/10 rounded-lg">
        <Settings className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Performance Management Einstellungen
        </h2>
        <p className="text-sm text-muted-foreground">
          Konfigurieren Sie das Performance Management System nach dem 80/20-Prinzip: 
          Die wichtigsten Einstellungen sind bereits optimal voreingestellt.
        </p>
      </div>
    </div>
  );
};
