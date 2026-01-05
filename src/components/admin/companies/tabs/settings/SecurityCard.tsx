
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Shield } from 'lucide-react';

interface SecurityCardProps {
  settings: {
    enableAuditLogs: boolean;
    allowMultiAdmin: boolean;
  };
  handleSettingChange: (setting: string, value: boolean) => void;
}

export const SecurityCard: React.FC<SecurityCardProps> = ({ 
  settings, 
  handleSettingChange 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Sicherheit und Berechtigungen
        </CardTitle>
        <CardDescription>Sicherheitseinstellungen und Berechtigungsverwaltung</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="enableAuditLogs">Audit-Logs aktivieren</Label>
            <p className="text-sm text-gray-500">Protokolliert alle wichtigen Benutzeraktionen im System</p>
          </div>
          <Switch 
            id="enableAuditLogs" 
            checked={settings.enableAuditLogs}
            onCheckedChange={(checked) => handleSettingChange('enableAuditLogs', checked)}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="allowMultiAdmin">Mehrere Administratoren zulassen</Label>
            <p className="text-sm text-gray-500">Erlaubt der Firma, mehrere Administratoren zu haben</p>
          </div>
          <Switch 
            id="allowMultiAdmin" 
            checked={settings.allowMultiAdmin}
            onCheckedChange={(checked) => handleSettingChange('allowMultiAdmin', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
