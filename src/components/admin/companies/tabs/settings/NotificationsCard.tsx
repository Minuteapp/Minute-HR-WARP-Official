
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell } from 'lucide-react';

interface NotificationsCardProps {
  settings: {
    enableNotifications: boolean;
  };
  handleSettingChange: (setting: string, value: boolean) => void;
}

export const NotificationsCard: React.FC<NotificationsCardProps> = ({ 
  settings, 
  handleSettingChange 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Benachrichtigungen
        </CardTitle>
        <CardDescription>Steuern Sie Benachrichtigungseinstellungen</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="enableNotifications">Benachrichtigungen aktivieren</Label>
            <p className="text-sm text-gray-500">Aktiviert Benachrichtigungen für wichtige Ereignisse</p>
          </div>
          <Switch 
            id="enableNotifications" 
            checked={settings.enableNotifications}
            onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
