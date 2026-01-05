import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ProjectSettingsTabNewProps {
  project: any;
}

export const ProjectSettingsTabNew: React.FC<ProjectSettingsTabNewProps> = ({ project }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    automaticReports: true,
    riskAlerts: true,
    budgetTracking: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const settingsOptions = [
    {
      key: 'notifications' as const,
      label: 'Benachrichtigungen',
      description: 'E-Mail-Benachrichtigungen für Projektaktivitäten erhalten',
    },
    {
      key: 'automaticReports' as const,
      label: 'Automatische Berichte',
      description: 'Wöchentliche Statusberichte automatisch generieren',
    },
    {
      key: 'riskAlerts' as const,
      label: 'Risiko-Alerts',
      description: 'Benachrichtigungen bei neuen oder eskalierten Risiken',
    },
    {
      key: 'budgetTracking' as const,
      label: 'Budget-Tracking',
      description: 'Warnungen bei Budget-Überschreitungen erhalten',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Projekt-Einstellungen */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Projekt-Einstellungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {settingsOptions.map((option) => (
            <div key={option.key} className="flex items-center justify-between">
              <div>
                <Label htmlFor={option.key} className="font-medium text-sm cursor-pointer">
                  {option.label}
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
              </div>
              <Switch
                id={option.key}
                checked={settings[option.key]}
                onCheckedChange={() => handleToggle(option.key)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Gefahrenzone */}
      <Card className="border-red-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-red-600">Gefahrenzone</CardTitle>
          <CardDescription>
            Diese Aktionen können nicht rückgängig gemacht werden. Bitte seien Sie vorsichtig.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Projekt archivieren</p>
              <p className="text-xs text-muted-foreground">
                Das Projekt wird archiviert und ist nicht mehr aktiv sichtbar
              </p>
            </div>
            <button className="text-sm text-red-600 hover:text-red-700 hover:underline">
              Archivieren
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Projekt löschen</p>
              <p className="text-xs text-muted-foreground">
                Das Projekt und alle zugehörigen Daten werden unwiderruflich gelöscht
              </p>
            </div>
            <button className="text-sm text-red-600 hover:text-red-700 hover:underline">
              Löschen
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};