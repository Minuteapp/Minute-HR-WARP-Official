import React from 'react';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export const PermissionsTestComponent = () => {
  const { 
    permissions, 
    isLoading, 
    error,
    hasAccess,
    canView,
    canCreate,
    canEdit,
    canDelete 
  } = useEnterprisePermissions();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Lade Berechtigungen...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Fehler beim Laden der Berechtigungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Permissions Debug-Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Geladene Berechtigungen ({permissions.length}):</h4>
              {permissions.length === 0 ? (
                <p className="text-muted-foreground">Keine Berechtigungen gefunden</p>
              ) : (
                <div className="space-y-2">
                  {permissions.map((permission, index) => (
                    <div key={index} className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{permission.module_name}</h5>
                        <Badge variant={permission.is_visible ? "default" : "secondary"}>
                          {permission.is_visible ? "Sichtbar" : "Versteckt"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Actions: {permission.allowed_actions.join(', ')}</p>
                        <p>Notifications: {permission.allowed_notifications.join(', ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-2">Test Permissions:</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p>Dashboard Zugriff: <Badge variant={hasAccess('Dashboard') ? "default" : "destructive"}>{hasAccess('Dashboard') ? "✓" : "✗"}</Badge></p>
                  <p>Projekte ansehen: <Badge variant={canView('Projekte') ? "default" : "destructive"}>{canView('Projekte') ? "✓" : "✗"}</Badge></p>
                  <p>Projekte erstellen: <Badge variant={canCreate('Projekte') ? "default" : "destructive"}>{canCreate('Projekte') ? "✓" : "✗"}</Badge></p>
                </div>
                <div>
                  <p>Zeiterfassung bearbeiten: <Badge variant={canEdit('Zeiterfassung') ? "default" : "destructive"}>{canEdit('Zeiterfassung') ? "✓" : "✗"}</Badge></p>
                  <p>Mitarbeiter löschen: <Badge variant={canDelete('Mitarbeiter') ? "default" : "destructive"}>{canDelete('Mitarbeiter') ? "✓" : "✗"}</Badge></p>
                  <p>Einstellungen Zugriff: <Badge variant={hasAccess('Einstellungen') ? "default" : "destructive"}>{hasAccess('Einstellungen') ? "✓" : "✗"}</Badge></p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};