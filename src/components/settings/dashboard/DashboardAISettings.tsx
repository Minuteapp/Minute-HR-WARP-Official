import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Brain, Sparkles, MessageSquare, TrendingUp, HelpCircle, 
  Database, Shield, Save, AlertTriangle, Zap, Loader2
} from 'lucide-react';
import { useAISettings, AIRoleSettings } from '@/hooks/useAISettings';

const dataSources = [
  { key: 'employees', name: 'Mitarbeiterdaten', sensitive: true },
  { key: 'absences', name: 'Abwesenheiten', sensitive: false },
  { key: 'time_tracking', name: 'Zeiterfassung', sensitive: false },
  { key: 'payroll', name: 'Lohndaten', sensitive: true },
  { key: 'performance', name: 'Leistungsdaten', sensitive: true },
  { key: 'documents', name: 'Dokumente', sensitive: false },
  { key: 'projects', name: 'Projekte', sensitive: false },
  { key: 'tickets', name: 'Tickets', sensitive: false },
];

export const DashboardAISettings: React.FC = () => {
  const {
    globalSettings,
    setGlobalSettings,
    roleSettings,
    setRoleSettings,
    allowedSources,
    setAllowedSources,
    isLoading,
    isSaving,
    saveSettings,
  } = useAISettings();

  const toggleRoleSetting = (role: string, field: keyof AIRoleSettings) => {
    setRoleSettings(settings =>
      settings.map(s =>
        s.role === role ? { ...s, [field]: !s[field] } : s
      )
    );
  };

  const updateTokenLimit = (role: string, value: number) => {
    setRoleSettings(settings =>
      settings.map(s =>
        s.role === role ? { ...s, max_tokens_per_query: value } : s
      )
    );
  };

  const toggleDataSource = (source: string) => {
    setAllowedSources(sources =>
      sources.includes(source)
        ? sources.filter(s => s !== source)
        : [...sources, source]
    );
  };

  const usagePercentage = globalSettings.monthly_token_limit > 0 
    ? (globalSettings.current_month_usage / globalSettings.monthly_token_limit) * 100 
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Lade KI-Einstellungen...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Globale KI-Einstellungen */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>Globale KI-Einstellungen</CardTitle>
            </div>
            <Switch
              checked={globalSettings.ai_enabled}
              onCheckedChange={(checked) => 
                setGlobalSettings(s => ({ ...s, ai_enabled: checked }))
              }
            />
          </div>
          <CardDescription>
            Zentrale Steuerung aller KI-Funktionen im Dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>KI-Modell</Label>
              <Select 
                value={globalSettings.default_model}
                onValueChange={(v) => setGlobalSettings(s => ({ ...s, default_model: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4 (Empfohlen)</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Monatliches Token-Limit</Label>
              <Input
                type="number"
                value={globalSettings.monthly_token_limit}
                onChange={(e) => 
                  setGlobalSettings(s => ({ ...s, monthly_token_limit: parseInt(e.target.value) }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Aktueller Verbrauch</Label>
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{globalSettings.current_month_usage.toLocaleString()} Tokens</span>
                  <span className={usagePercentage > 80 ? 'text-destructive' : ''}>
                    {usagePercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      usagePercentage > 80 ? 'bg-destructive' : 
                      usagePercentage > 60 ? 'bg-yellow-500' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Daten anonymisieren</span>
              </div>
              <Switch
                checked={globalSettings.anonymize_data}
                onCheckedChange={(checked) =>
                  setGlobalSettings(s => ({ ...s, anonymize_data: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Kostentracking</span>
              </div>
              <Switch
                checked={globalSettings.cost_tracking_enabled}
                onCheckedChange={(checked) =>
                  setGlobalSettings(s => ({ ...s, cost_tracking_enabled: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Alle Abfragen auditieren</span>
              </div>
              <Switch
                checked={globalSettings.audit_all_queries}
                onCheckedChange={(checked) =>
                  setGlobalSettings(s => ({ ...s, audit_all_queries: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KI-Funktionen pro Rolle */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>KI-Funktionen pro Rolle</CardTitle>
          </div>
          <CardDescription>
            Steuern Sie, welche KI-Funktionen für welche Rollen verfügbar sind
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rolle</TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    Zusammenfassungen
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    Empfehlungen
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Prognosen
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    NL-Abfragen
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <HelpCircle className="h-4 w-4" />
                    Erklärpflicht
                  </div>
                </TableHead>
                <TableHead>Max. Tokens</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roleSettings.map((setting) => (
                <TableRow key={setting.role}>
                  <TableCell>
                    <Badge variant="outline">{setting.role_name}</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={setting.ai_summaries_enabled}
                      onCheckedChange={() => toggleRoleSetting(setting.role, 'ai_summaries_enabled')}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={setting.ai_recommendations_enabled}
                      onCheckedChange={() => toggleRoleSetting(setting.role, 'ai_recommendations_enabled')}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={setting.ai_forecasts_enabled}
                      onCheckedChange={() => toggleRoleSetting(setting.role, 'ai_forecasts_enabled')}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={setting.natural_language_queries}
                      onCheckedChange={() => toggleRoleSetting(setting.role, 'natural_language_queries')}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={setting.explainability_required}
                      onCheckedChange={() => toggleRoleSetting(setting.role, 'explainability_required')}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 w-40">
                      <Slider
                        value={[setting.max_tokens_per_query]}
                        onValueChange={([v]) => updateTokenLimit(setting.role, v)}
                        max={10000}
                        step={100}
                        className="flex-1"
                      />
                      <span className="text-sm w-14 text-right">
                        {(setting.max_tokens_per_query / 1000).toFixed(1)}k
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Erlaubte Datenquellen */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Erlaubte Datenquellen für KI</CardTitle>
          </div>
          <CardDescription>
            Wählen Sie, auf welche Daten die KI zugreifen darf
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {dataSources.map((source) => (
              <div
                key={source.key}
                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  allowedSources.includes(source.key) 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => toggleDataSource(source.key)}
              >
                <Checkbox checked={allowedSources.includes(source.key)} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{source.name}</span>
                    {source.sensitive && (
                      <Badge variant="destructive" className="text-xs">
                        Sensibel
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Datenschutz-Hinweis
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Sensible Daten werden vor der KI-Verarbeitung anonymisiert, wenn die Option aktiviert ist.
                  Stellen Sie sicher, dass die Datenverarbeitung DSGVO-konform erfolgt.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Speichere...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Alle KI-Einstellungen speichern
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DashboardAISettings;
