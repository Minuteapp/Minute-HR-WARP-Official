/**
 * SettingsPermissionGuard
 * Wiederverwendbare Komponente zur Absicherung von Settings-Unterseiten
 * Prüft Sichtbarkeit und Bearbeitungsrechte basierend auf der Benutzerrolle
 */

import React, { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsPagePermission } from '@/hooks/useSettingsModulePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Eye, ArrowLeft, Loader2, Lock } from 'lucide-react';
import { SettingsScope } from '@/config/settingsPermissions';

// Context für ReadOnly-Status in verschachtelten Komponenten
interface SettingsPermissionContextValue {
  isReadOnly: boolean;
  canEdit: boolean;
  scope: SettingsScope;
  effectiveRole: string | undefined;
}

const SettingsPermissionContext = createContext<SettingsPermissionContextValue>({
  isReadOnly: true,
  canEdit: false,
  scope: 'own',
  effectiveRole: undefined,
});

export const useSettingsPermissionContext = () => useContext(SettingsPermissionContext);

interface SettingsPermissionGuardProps {
  /** Die ID des Settings-Moduls (z.B. 'payroll', 'absence') */
  moduleId: string;
  /** Der Inhalt der geschützten Seite */
  children: React.ReactNode;
  /** Optionales benutzerdefiniertes Fallback bei fehlendem Zugriff */
  fallback?: React.ReactNode;
  /** Ob ein Loading-State angezeigt werden soll */
  showLoading?: boolean;
}

/**
 * SettingsPermissionGuard Component
 * Umschließt Settings-Unterseiten und prüft Berechtigungen
 */
export const SettingsPermissionGuard: React.FC<SettingsPermissionGuardProps> = ({
  moduleId,
  children,
  fallback,
  showLoading = true,
}) => {
  const navigate = useNavigate();
  const { canAccess, canEdit, scope, isReadOnly, effectiveRole, loading } = useSettingsPagePermission(moduleId);

  // Loading State
  if (loading && showLoading) {
    return (
      <div className="w-full p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Berechtigungen werden geprüft...</p>
        </div>
      </div>
    );
  }

  // Kein Zugriff erlaubt
  if (!canAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="w-full p-6 space-y-6">
        <Card className="max-w-lg mx-auto mt-12">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-destructive/10">
              <ShieldAlert className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-xl">Zugriff verweigert</CardTitle>
            <CardDescription>
              Sie haben keine Berechtigung, diese Einstellung anzuzeigen.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground text-center">
              Ihre aktuelle Rolle <strong className="text-foreground">({effectiveRole || 'unbekannt'})</strong> hat keinen Zugriff auf dieses Modul.
              <br />
              Bitte wenden Sie sich an Ihren Administrator.
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/settings')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zu Einstellungen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Zugriff erlaubt - ReadOnly Banner wenn nötig
  const contextValue: SettingsPermissionContextValue = {
    isReadOnly,
    canEdit,
    scope,
    effectiveRole,
  };

  return (
    <SettingsPermissionContext.Provider value={contextValue}>
      {isReadOnly && (
        <Alert className="mb-4 mx-6 mt-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
          <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-200">Nur Lesezugriff</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            Sie können diese Einstellungen ansehen, aber nicht bearbeiten. 
            Ihre Rolle <strong>({effectiveRole})</strong> hat nur Leserechte für dieses Modul.
          </AlertDescription>
        </Alert>
      )}
      {children}
    </SettingsPermissionContext.Provider>
  );
};

/**
 * ReadOnlyFieldWrapper
 * Deaktiviert Eingabefelder wenn der Benutzer nur Leserechte hat
 */
interface ReadOnlyFieldWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const ReadOnlyFieldWrapper: React.FC<ReadOnlyFieldWrapperProps> = ({ 
  children, 
  className = '' 
}) => {
  const { isReadOnly } = useSettingsPermissionContext();

  if (isReadOnly) {
    return (
      <div className={`relative ${className}`}>
        <div className="opacity-60 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md opacity-0 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background px-2 py-1 rounded shadow-sm border">
            <Lock className="h-3 w-3" />
            Nur Lesezugriff
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * SaveButtonGuard
 * Versteckt oder deaktiviert Speichern-Buttons bei fehlendem Bearbeitungsrecht
 */
interface SaveButtonGuardProps {
  children: React.ReactNode;
  hideIfReadOnly?: boolean;
}

export const SaveButtonGuard: React.FC<SaveButtonGuardProps> = ({ 
  children, 
  hideIfReadOnly = false 
}) => {
  const { isReadOnly } = useSettingsPermissionContext();

  if (isReadOnly && hideIfReadOnly) {
    return null;
  }

  if (isReadOnly) {
    return (
      <div className="opacity-50 pointer-events-none" title="Sie haben keine Berechtigung zum Speichern">
        {children}
      </div>
    );
  }

  return <>{children}</>;
};

export default SettingsPermissionGuard;
