import { useState } from 'react';
import { useRolePreview, UserRole } from '@/hooks/useRolePreview';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const RoleSwitcher = () => {
  const { isSuperAdmin } = useRolePermissions();
  const {
    previewRole,
    originalRole,
    isPreviewActive,
    isLoading,
    activateRolePreview,
    deactivateRolePreview,
    getRoleLabel,
  } = useRolePreview();

  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');

  // Nur für Superadmins sichtbar
  if (!isSuperAdmin) {
    return null;
  }

  const availableRoles: UserRole[] = ['employee', 'team_lead', 'hr_admin', 'admin'];

  const handleRoleChange = (role: string) => {
    setSelectedRole(role as UserRole);
  };

  const handleActivatePreview = () => {
    if (selectedRole) {
      activateRolePreview(selectedRole);
    }
  };

  const handleDeactivatePreview = () => {
    deactivateRolePreview();
    setSelectedRole('');
  };

  return (
    <Card className="border-amber-400 bg-amber-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-base">Role Preview System</CardTitle>
          </div>
          {isPreviewActive && (
            <Badge variant="outline" className="bg-amber-500 text-white border-amber-600">
              🎭 Preview aktiv
            </Badge>
          )}
        </div>
        <CardDescription>
          {isPreviewActive
            ? `Du siehst aktuell die Ansicht eines ${getRoleLabel(previewRole!)}-Users`
            : 'Wähle eine Rolle aus, um die Ansicht zu testen'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {isPreviewActive ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
              <div>
                <div className="text-sm font-medium text-amber-900">
                  Aktive Rolle: {getRoleLabel(previewRole!)}
                </div>
                <div className="text-xs text-amber-700">
                  Original: {getRoleLabel(originalRole)}
                </div>
              </div>
              <EyeOff className="h-5 w-5 text-amber-600" />
            </div>

            <Button
              onClick={handleDeactivatePreview}
              disabled={isLoading}
              variant="outline"
              className="w-full border-amber-400 hover:bg-amber-100"
              size="sm"
            >
              <Shield className="h-4 w-4 mr-2" />
              Zurück zur Admin-Ansicht
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Select value={selectedRole} onValueChange={handleRoleChange}>
              <SelectTrigger className="bg-white border-amber-200">
                <SelectValue placeholder="Rolle auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {getRoleLabel(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleActivatePreview}
              disabled={!selectedRole || isLoading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              size="sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview aktivieren
            </Button>
          </div>
        )}

        {isPreviewActive && (
          <div className="mt-3 p-2 bg-amber-100 rounded text-xs text-amber-800 border border-amber-300">
            ⚠️ Hinweis: Im Preview-Modus siehst du nur, was andere Rollen sehen können. 
            Datenänderungen sind mit eingeschränkten Berechtigungen möglich.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
