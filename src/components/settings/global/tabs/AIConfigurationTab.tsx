import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Brain, Zap, Shield, DollarSign, Eye, FileText, AlertTriangle, Settings } from 'lucide-react';

export const AIConfigurationTab = () => {
  const [settings, setSettings] = useState({
    aiGlobalStatus: 'active',
    aiProvider: 'internal',
    aiCustomApiKey: '',
    aiCustomEndpoint: '',
    aiCustomRegion: 'eu',
    aiFallbackProvider: 'none',
    aiGovernanceMode: 'suggestions',
    aiActionsRequireApproval: true,
    aiAutoActionsEnabled: false,
    aiAutoActionsWhitelist: [],
    aiLoggingEnabled: true,
    aiLoggingDetailed: false,
    aiExplainability: true,
    aiExplainabilityLevel: 'basic',
    aiCostLimit: 500,
    aiCostLimitPeriod: 'monthly',
    aiCostAlerts: true,
    aiCostAlertThreshold: 80,
    aiModulesAbsence: true,
    aiModulesTimeTracking: true,
    aiModulesRecruiting: true,
    aiModulesOnboarding: true,
    aiModulesDocuments: true,
    aiModulesHelpdesk: true,
    aiModulesAnalytics: true,
    aiModulesWorkflow: true,
    aiPersonalDataProcessing: false,
    aiSensitiveDataFiltering: true,
    aiDataRetention: 30,
    aiModelPreference: 'balanced',
    aiResponseLanguage: 'auto',
    aiToneOfVoice: 'professional',
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* KI-Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            KI-Status
          </CardTitle>
          <CardDescription>Globale KI-Aktivierung</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>KI-Status global</Label>
            <Select value={settings.aiGlobalStatus} onValueChange={(v) => updateSetting('aiGlobalStatus', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <span className="flex items-center gap-2">
                    <Badge className="bg-green-500">Aktiv</Badge>
                    Vollständig aktiviert
                  </span>
                </SelectItem>
                <SelectItem value="restricted">
                  <span className="flex items-center gap-2">
                    <Badge className="bg-yellow-500">Eingeschränkt</Badge>
                    Nur ausgewählte Module
                  </span>
                </SelectItem>
                <SelectItem value="disabled">
                  <span className="flex items-center gap-2">
                    <Badge variant="destructive">Deaktiviert</Badge>
                    KI vollständig aus
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KI-Provider */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            KI-Provider
          </CardTitle>
          <CardDescription>Welcher KI-Dienst wird verwendet?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Primärer Provider</Label>
            <Select value={settings.aiProvider} onValueChange={(v) => updateSetting('aiProvider', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Minute HR KI (Standard)</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="azure">Azure OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                <SelectItem value="google">Google AI</SelectItem>
                <SelectItem value="custom">Eigener Endpunkt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {settings.aiProvider === 'custom' && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <div className="space-y-2">
                <Label>API-Key</Label>
                <Input 
                  type="password"
                  value={settings.aiCustomApiKey}
                  onChange={(e) => updateSetting('aiCustomApiKey', e.target.value)}
                  placeholder="sk-..."
                />
              </div>
              <div className="space-y-2">
                <Label>API-Endpunkt</Label>
                <Input 
                  value={settings.aiCustomEndpoint}
                  onChange={(e) => updateSetting('aiCustomEndpoint', e.target.value)}
                  placeholder="https://api.example.com/v1"
                />
              </div>
              <div className="space-y-2">
                <Label>Region</Label>
                <Select value={settings.aiCustomRegion} onValueChange={(v) => updateSetting('aiCustomRegion', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eu">EU (Europa)</SelectItem>
                    <SelectItem value="us">US (Amerika)</SelectItem>
                    <SelectItem value="asia">Asien</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <Label>Fallback-Provider</Label>
            <Select value={settings.aiFallbackProvider} onValueChange={(v) => updateSetting('aiFallbackProvider', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Fallback</SelectItem>
                <SelectItem value="internal">Minute HR KI</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Wird verwendet, wenn der primäre Provider nicht verfügbar ist</p>
          </div>
        </CardContent>
      </Card>

      {/* KI-Governance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            KI-Governance
          </CardTitle>
          <CardDescription>Wie autonom darf die KI handeln?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Governance-Modus</Label>
            <Select value={settings.aiGovernanceMode} onValueChange={(v) => updateSetting('aiGovernanceMode', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="suggestions">
                  <span className="flex flex-col">
                    <span className="font-medium">Nur Vorschläge</span>
                    <span className="text-xs text-muted-foreground">KI macht Vorschläge, Mensch entscheidet</span>
                  </span>
                </SelectItem>
                <SelectItem value="approval">
                  <span className="flex flex-col">
                    <span className="font-medium">Mit Freigabe</span>
                    <span className="text-xs text-muted-foreground">KI-Aktionen erfordern Genehmigung</span>
                  </span>
                </SelectItem>
                <SelectItem value="automatic">
                  <span className="flex flex-col">
                    <span className="font-medium">Vollautomatisch</span>
                    <span className="text-xs text-muted-foreground">KI handelt selbstständig (mit Audit)</span>
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>KI-Aktionen erfordern Genehmigung</Label>
              <p className="text-sm text-muted-foreground">Alle datenändernden Aktionen</p>
            </div>
            <Switch 
              checked={settings.aiActionsRequireApproval}
              onCheckedChange={(checked) => updateSetting('aiActionsRequireApproval', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="flex items-center gap-2">
                Automatische Aktionen erlauben
                <Badge variant="destructive">Vorsicht</Badge>
              </Label>
              <p className="text-sm text-muted-foreground">KI kann ohne Rückfrage handeln</p>
            </div>
            <Switch 
              checked={settings.aiAutoActionsEnabled}
              onCheckedChange={(checked) => updateSetting('aiAutoActionsEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Logging & Erklärbarkeit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Logging & Erklärbarkeit
          </CardTitle>
          <CardDescription>Nachvollziehbarkeit von KI-Entscheidungen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>KI-Logging aktivieren</Label>
              <p className="text-sm text-muted-foreground">Alle KI-Anfragen protokollieren</p>
            </div>
            <Switch 
              checked={settings.aiLoggingEnabled}
              onCheckedChange={(checked) => updateSetting('aiLoggingEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Detailliertes Logging</Label>
              <p className="text-sm text-muted-foreground">Inkl. Prompts und Antworten</p>
            </div>
            <Switch 
              checked={settings.aiLoggingDetailed}
              onCheckedChange={(checked) => updateSetting('aiLoggingDetailed', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Erklärbarkeit aktivieren</Label>
              <p className="text-sm text-muted-foreground">KI erklärt ihre Entscheidungen</p>
            </div>
            <Switch 
              checked={settings.aiExplainability}
              onCheckedChange={(checked) => updateSetting('aiExplainability', checked)}
            />
          </div>

          {settings.aiExplainability && (
            <div className="space-y-2 pl-4 border-l-2 border-primary/20">
              <Label>Erklärungstiefe</Label>
              <Select value={settings.aiExplainabilityLevel} onValueChange={(v) => updateSetting('aiExplainabilityLevel', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Einfach (für alle verständlich)</SelectItem>
                  <SelectItem value="detailed">Detailliert (mit Faktoren)</SelectItem>
                  <SelectItem value="technical">Technisch (für Experten)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kostenlimits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Kostenlimits
          </CardTitle>
          <CardDescription>Budget für KI-Nutzung</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kostenlimit (€)</Label>
              <Input 
                type="number"
                value={settings.aiCostLimit}
                onChange={(e) => updateSetting('aiCostLimit', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Periode</Label>
              <Select value={settings.aiCostLimitPeriod} onValueChange={(v) => updateSetting('aiCostLimitPeriod', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Täglich</SelectItem>
                  <SelectItem value="weekly">Wöchentlich</SelectItem>
                  <SelectItem value="monthly">Monatlich</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Kosten-Warnungen</Label>
              <p className="text-sm text-muted-foreground">Benachrichtigung bei hohen Kosten</p>
            </div>
            <Switch 
              checked={settings.aiCostAlerts}
              onCheckedChange={(checked) => updateSetting('aiCostAlerts', checked)}
            />
          </div>

          {settings.aiCostAlerts && (
            <div className="space-y-2 pl-4 border-l-2 border-primary/20">
              <Label>Warnung bei (% des Limits)</Label>
              <Input 
                type="number"
                value={settings.aiCostAlertThreshold}
                onChange={(e) => updateSetting('aiCostAlertThreshold', parseInt(e.target.value))}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* KI pro Modul */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            KI pro Modul
          </CardTitle>
          <CardDescription>Welche Module nutzen KI?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span>Abwesenheit</span>
              <Switch 
                checked={settings.aiModulesAbsence}
                onCheckedChange={(checked) => updateSetting('aiModulesAbsence', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span>Zeiterfassung</span>
              <Switch 
                checked={settings.aiModulesTimeTracking}
                onCheckedChange={(checked) => updateSetting('aiModulesTimeTracking', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span>Recruiting</span>
              <Switch 
                checked={settings.aiModulesRecruiting}
                onCheckedChange={(checked) => updateSetting('aiModulesRecruiting', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span>Onboarding</span>
              <Switch 
                checked={settings.aiModulesOnboarding}
                onCheckedChange={(checked) => updateSetting('aiModulesOnboarding', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span>Dokumente</span>
              <Switch 
                checked={settings.aiModulesDocuments}
                onCheckedChange={(checked) => updateSetting('aiModulesDocuments', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span>Helpdesk</span>
              <Switch 
                checked={settings.aiModulesHelpdesk}
                onCheckedChange={(checked) => updateSetting('aiModulesHelpdesk', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span>Analytics</span>
              <Switch 
                checked={settings.aiModulesAnalytics}
                onCheckedChange={(checked) => updateSetting('aiModulesAnalytics', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span>Workflow</span>
              <Switch 
                checked={settings.aiModulesWorkflow}
                onCheckedChange={(checked) => updateSetting('aiModulesWorkflow', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Datenschutz bei KI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Datenschutz bei KI
          </CardTitle>
          <CardDescription>Schutz sensibler Daten</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="flex items-center gap-2">
                Personenbezogene Daten verarbeiten
                <Badge variant="destructive">Sensibel</Badge>
              </Label>
              <p className="text-sm text-muted-foreground">KI darf personenbezogene Daten nutzen</p>
            </div>
            <Switch 
              checked={settings.aiPersonalDataProcessing}
              onCheckedChange={(checked) => updateSetting('aiPersonalDataProcessing', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Sensible Daten filtern</Label>
              <p className="text-sm text-muted-foreground">Automatisch sensible Daten maskieren</p>
            </div>
            <Switch 
              checked={settings.aiSensitiveDataFiltering}
              onCheckedChange={(checked) => updateSetting('aiSensitiveDataFiltering', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>KI-Daten-Aufbewahrung (Tage)</Label>
            <Input 
              type="number"
              value={settings.aiDataRetention}
              onChange={(e) => updateSetting('aiDataRetention', parseInt(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">Wie lange werden KI-Anfragen gespeichert?</p>
          </div>
        </CardContent>
      </Card>

      {/* KI-Präferenzen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            KI-Präferenzen
          </CardTitle>
          <CardDescription>Stil und Verhalten der KI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Modell-Präferenz</Label>
              <Select value={settings.aiModelPreference} onValueChange={(v) => updateSetting('aiModelPreference', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">Schnell (kürzere Antworten)</SelectItem>
                  <SelectItem value="balanced">Ausgewogen</SelectItem>
                  <SelectItem value="quality">Qualität (bessere Antworten)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Antwortsprache</Label>
              <Select value={settings.aiResponseLanguage} onValueChange={(v) => updateSetting('aiResponseLanguage', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Automatisch (wie Anfrage)</SelectItem>
                  <SelectItem value="de">Immer Deutsch</SelectItem>
                  <SelectItem value="en">Immer Englisch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tonalität</Label>
            <Select value={settings.aiToneOfVoice} onValueChange={(v) => updateSetting('aiToneOfVoice', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formell</SelectItem>
                <SelectItem value="professional">Professionell</SelectItem>
                <SelectItem value="friendly">Freundlich</SelectItem>
                <SelectItem value="casual">Locker</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIConfigurationTab;
