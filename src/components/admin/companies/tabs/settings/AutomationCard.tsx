
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail } from 'lucide-react';

interface AutomationCardProps {
  settings: {
    enableAutoInvite: boolean;
    enableDataSync: boolean;
  };
  handleSettingChange: (setting: string, value: boolean) => void;
}

export const AutomationCard: React.FC<AutomationCardProps> = ({ 
  settings, 
  handleSettingChange 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          Automatisierung
        </CardTitle>
        <CardDescription>Steuern Sie automatisierte Prozesse</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="enableAutoInvite">Automatische Einladungen</Label>
            <p className="text-sm text-gray-500">Automatisch Einladungen an neue Mitarbeiter senden</p>
          </div>
          <Switch 
            id="enableAutoInvite" 
            checked={settings.enableAutoInvite}
            onCheckedChange={(checked) => handleSettingChange('enableAutoInvite', checked)}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="enableDataSync">Datensynchronisierung</Label>
            <p className="text-sm text-gray-500">Automatisch Daten mit anderen Systemen synchronisieren</p>
          </div>
          <Switch 
            id="enableDataSync" 
            checked={settings.enableDataSync}
            onCheckedChange={(checked) => handleSettingChange('enableDataSync', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
