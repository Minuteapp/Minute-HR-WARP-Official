import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AICapabilitiesBox } from './AICapabilitiesBox';
import { DefaultHint } from './DefaultHint';

interface AISettingsSectionProps {
  aiEnabled: boolean;
  onAiEnabledChange: (value: boolean) => void;
}

export const AISettingsSection: React.FC<AISettingsSectionProps> = ({
  aiEnabled,
  onAiEnabledChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">KI-Unterstützung</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>KI-Unterstützung aktivieren</Label>
            <p className="text-xs text-muted-foreground">
              Intelligente Analysen und Empfehlungen aktivieren
            </p>
          </div>
          <Switch
            checked={aiEnabled}
            onCheckedChange={onAiEnabledChange}
          />
        </div>
        <DefaultHint text="80/20 Default: KI-Unterstützung verbessert die Entscheidungsfindung." />
        <AICapabilitiesBox />
      </CardContent>
    </Card>
  );
};
