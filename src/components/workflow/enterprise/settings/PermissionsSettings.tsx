import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PermissionRoleRow } from './PermissionRoleRow';

interface PermissionsSettingsProps {
  permissions: Record<string, string[]>;
  visibilityOwnOnly: boolean;
  visibilityTeam: boolean;
  visibilityAll: boolean;
  onPermissionChange: (action: string, roles: string[]) => void;
  onVisibilityChange: (key: string, value: boolean) => void;
}

const allRoles = ['admin', 'hr_manager', 'team_lead', 'employee', 'revisor'];

const permissionActions = [
  { key: 'create', label: 'Workflows erstellen', description: 'Neue Workflows anlegen' },
  { key: 'edit', label: 'Workflows bearbeiten', description: 'Bestehende Workflows ändern' },
  { key: 'delete', label: 'Workflows löschen', description: 'Workflows entfernen' },
  { key: 'execute', label: 'Workflows ausführen', description: 'Workflows manuell starten' },
  { key: 'view_logs', label: 'Logs einsehen', description: 'Ausführungsprotokolle ansehen' },
  { key: 'export_logs', label: 'Logs exportieren', description: 'Logs als CSV/JSON exportieren' },
];

export const PermissionsSettings = ({
  permissions,
  visibilityOwnOnly,
  visibilityTeam,
  visibilityAll,
  onPermissionChange,
  onVisibilityChange
}: PermissionsSettingsProps) => {
  const handleRoleToggle = (action: string, role: string) => {
    const currentRoles = permissions[action] || [];
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];
    onPermissionChange(action, newRoles);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aktionsberechtigungen</CardTitle>
          <CardDescription>
            Definiere, welche Rollen welche Aktionen ausführen dürfen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          {permissionActions.map((action) => (
            <PermissionRoleRow
              key={action.key}
              action={action.label}
              description={action.description}
              roles={allRoles}
              selectedRoles={permissions[action.key] || []}
              onRoleToggle={(role) => handleRoleToggle(action.key, role)}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workflow-Sichtbarkeit</CardTitle>
          <CardDescription>
            Steuere, welche Workflows Benutzer sehen können
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="visibility-own" className="flex flex-col gap-0.5">
              <span>Nur eigene Workflows</span>
              <span className="text-xs text-muted-foreground font-normal">
                Benutzer sehen nur selbst erstellte Workflows
              </span>
            </Label>
            <Switch
              id="visibility-own"
              checked={visibilityOwnOnly}
              onCheckedChange={(checked) => onVisibilityChange('visibility_own_only', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="visibility-team" className="flex flex-col gap-0.5">
              <span>Team-weite Workflows</span>
              <span className="text-xs text-muted-foreground font-normal">
                Benutzer sehen Workflows ihres Teams
              </span>
            </Label>
            <Switch
              id="visibility-team"
              checked={visibilityTeam}
              onCheckedChange={(checked) => onVisibilityChange('visibility_team', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="visibility-all" className="flex flex-col gap-0.5">
              <span>Systemweite Workflows</span>
              <span className="text-xs text-muted-foreground font-normal">
                Nur für Admins: Alle Workflows sichtbar
              </span>
            </Label>
            <Switch
              id="visibility-all"
              checked={visibilityAll}
              onCheckedChange={(checked) => onVisibilityChange('visibility_all', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
