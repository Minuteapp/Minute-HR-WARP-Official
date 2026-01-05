import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, MessageSquare, TrendingUp, Languages, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AISettingsProps {
  aiGenerationEnabled: boolean;
  aiExplanationsEnabled: boolean;
  aiOptimizationEnabled: boolean;
  aiTranslationEnabled: boolean;
  aiAutoDecisions: boolean;
  aiConfidenceThreshold: number;
  aiLoggingEnabled: boolean;
  aiDataRetentionDays: number;
  onSettingChange: (key: string, value: boolean | number) => void;
}

export const AISettings = ({
  aiGenerationEnabled,
  aiExplanationsEnabled,
  aiOptimizationEnabled,
  aiTranslationEnabled,
  aiAutoDecisions,
  aiConfidenceThreshold,
  aiLoggingEnabled,
  aiDataRetentionDays,
  onSettingChange
}: AISettingsProps) => {
  const features = [
    {
      key: 'ai_generation_enabled',
      label: 'Workflow-Generierung',
      description: 'Aus Beschreibung generieren',
      icon: Sparkles,
      enabled: aiGenerationEnabled
    },
    {
      key: 'ai_explanations_enabled',
      label: 'Erklärungen',
      description: 'Warum-so-gebaut Transparenz',
      icon: MessageSquare,
      enabled: aiExplanationsEnabled
    },
    {
      key: 'ai_optimization_enabled',
      label: 'Optimierung',
      description: 'Verbesserungsvorschläge',
      icon: TrendingUp,
      enabled: aiOptimizationEnabled
    },
    {
      key: 'ai_translation_enabled',
      label: 'Übersetzung',
      description: 'Multi-Language Support',
      icon: Languages,
      enabled: aiTranslationEnabled
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aktivierte KI-Features</CardTitle>
          <CardDescription>
            Steuere, wie KI Workflows generiert und optimiert
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.key}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-lg border transition-colors cursor-pointer',
                    feature.enabled 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'bg-muted/50 border-muted'
                  )}
                  onClick={() => onSettingChange(feature.key, !feature.enabled)}
                >
                  <div className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center',
                    feature.enabled ? 'bg-primary/10' : 'bg-muted'
                  )}>
                    <Icon className={cn(
                      'h-5 w-5',
                      feature.enabled ? 'text-primary' : 'text-muted-foreground'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{feature.label}</p>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                  {feature.enabled ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Automatische Entscheidungen</CardTitle>
          <CardDescription>
            Konfiguriere, wie KI automatisch Entscheidungen trifft
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-decisions" className="flex flex-col gap-0.5">
              <span>KI darf automatisch Entscheidungen treffen</span>
              <span className="text-xs text-muted-foreground font-normal">
                Bei hoher Konfidenz werden Aktionen automatisch ausgeführt
              </span>
            </Label>
            <Switch
              id="auto-decisions"
              checked={aiAutoDecisions}
              onCheckedChange={(checked) => onSettingChange('ai_auto_decisions', checked)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Konfidenz-Schwellwert für Auto-Execution</Label>
              <span className="text-sm font-medium">{aiConfidenceThreshold}%</span>
            </div>
            <Slider
              value={[aiConfidenceThreshold]}
              onValueChange={([value]) => onSettingChange('ai_confidence_threshold', value)}
              min={50}
              max={100}
              step={5}
              disabled={!aiAutoDecisions}
            />
            <p className="text-xs text-muted-foreground">
              Nur Entscheidungen über diesem Schwellwert werden automatisch ausgeführt
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Protokollierung</CardTitle>
          <CardDescription>
            Verwalte KI-Nutzungsdaten und Aufbewahrung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="ai-logging" className="flex flex-col gap-0.5">
              <span>KI-Protokollierung aktivieren</span>
              <span className="text-xs text-muted-foreground font-normal">
                Alle KI-Interaktionen werden protokolliert
              </span>
            </Label>
            <Switch
              id="ai-logging"
              checked={aiLoggingEnabled}
              onCheckedChange={(checked) => onSettingChange('ai_logging_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="flex flex-col gap-0.5">
              <span>KI-Datenaufbewahrung</span>
              <span className="text-xs text-muted-foreground font-normal">
                Wie lange werden KI-Logs gespeichert
              </span>
            </Label>
            <Select
              value={aiDataRetentionDays.toString()}
              onValueChange={(value) => onSettingChange('ai_data_retention_days', parseInt(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 Tage</SelectItem>
                <SelectItem value="60">60 Tage</SelectItem>
                <SelectItem value="90">90 Tage</SelectItem>
                <SelectItem value="180">180 Tage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
