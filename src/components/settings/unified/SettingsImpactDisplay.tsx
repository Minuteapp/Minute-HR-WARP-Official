import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowRight, Link2 } from 'lucide-react';
import { SettingChangeEvent } from '@/types/unified-settings';

interface SettingsImpactDisplayProps {
  pendingChange: SettingChangeEvent | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SettingsImpactDisplay({
  pendingChange,
  isOpen,
  onConfirm,
  onCancel
}: SettingsImpactDisplayProps) {
  if (!pendingChange) return null;

  const formatValue = (value: unknown): string => {
    if (typeof value === 'boolean') {
      return value ? 'Aktiviert' : 'Deaktiviert';
    }
    if (value === null || value === undefined) {
      return 'Nicht gesetzt';
    }
    return String(value);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Änderung bestätigen
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Diese Einstellung beeinflusst andere Module und erfordert eine Bestätigung.
              </p>

              {/* Change Preview */}
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Einstellung:</span>
                  <span className="font-medium">{pendingChange.settingKey}</span>
                </div>
                <div className="flex items-center justify-center gap-3 py-2">
                  <Badge variant="outline" className="text-destructive">
                    {formatValue(pendingChange.oldValue)}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className="text-primary">
                    {formatValue(pendingChange.newValue)}
                  </Badge>
                </div>
              </div>

              {/* Affected Modules */}
              {pendingChange.affectedModules.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Link2 className="h-4 w-4" />
                    Betroffene Module:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pendingChange.affectedModules.map((module) => (
                      <Badge key={module} variant="secondary">
                        {module}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Scope Info */}
              <div className="text-xs text-muted-foreground">
                Gültigkeitsbereich: {pendingChange.scope === 'global' ? 'Gesamtes Unternehmen' : 
                  pendingChange.scope === 'standort' ? 'Standort' :
                  pendingChange.scope === 'abteilung' ? 'Abteilung' : 'Team'}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Abbrechen</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Änderung bestätigen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
