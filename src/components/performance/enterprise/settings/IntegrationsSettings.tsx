import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DefaultHint } from './DefaultHint';

interface IntegrationsSettingsProps {
  goalsIntegration: boolean;
  onGoalsIntegrationChange: (value: boolean) => void;
}

export const IntegrationsSettings: React.FC<IntegrationsSettingsProps> = ({
  goalsIntegration,
  onGoalsIntegrationChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Integrationen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Integration mit Zielen-Modul</Label>
            <p className="text-xs text-muted-foreground">
              Ziele aus dem Zielen-Modul in Performance-Bewertungen einbeziehen
            </p>
          </div>
          <Switch
            checked={goalsIntegration}
            onCheckedChange={onGoalsIntegrationChange}
          />
        </div>
        <DefaultHint text="80/20 Default: Die Integration ermöglicht eine ganzheitliche Bewertung." />
      </CardContent>
    </Card>
  );
};
