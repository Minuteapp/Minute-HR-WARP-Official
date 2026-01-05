
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Users } from 'lucide-react';

interface UserManagementCardProps {
  settings: {
    allowUserRegistration: boolean;
    enforceStrongPasswords: boolean;
    autoDeactivateInactive: boolean;
  };
  handleSettingChange: (setting: string, value: boolean) => void;
}

export const UserManagementCard: React.FC<UserManagementCardProps> = ({ 
  settings, 
  handleSettingChange 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Benutzerverwaltung
        </CardTitle>
        <CardDescription>Steuern Sie, wie Benutzer mit dem System interagieren können</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="allowUserRegistration">Benutzerregistrierung zulassen</Label>
            <p className="text-sm text-gray-500">Erlaubt Benutzern, sich selbst zu registrieren</p>
          </div>
          <Switch 
            id="allowUserRegistration" 
            checked={settings.allowUserRegistration}
            onCheckedChange={(checked) => handleSettingChange('allowUserRegistration', checked)}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="enforceStrongPasswords">Starke Passwörter erzwingen</Label>
            <p className="text-sm text-gray-500">Stellt sicher, dass alle Passwörter den Sicherheitsrichtlinien entsprechen</p>
          </div>
          <Switch 
            id="enforceStrongPasswords" 
            checked={settings.enforceStrongPasswords}
            onCheckedChange={(checked) => handleSettingChange('enforceStrongPasswords', checked)}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="autoDeactivateInactive">Inaktive Benutzer deaktivieren</Label>
            <p className="text-sm text-gray-500">Automatisch Benutzer deaktivieren, die 90 Tage inaktiv waren</p>
          </div>
          <Switch 
            id="autoDeactivateInactive" 
            checked={settings.autoDeactivateInactive}
            onCheckedChange={(checked) => handleSettingChange('autoDeactivateInactive', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
