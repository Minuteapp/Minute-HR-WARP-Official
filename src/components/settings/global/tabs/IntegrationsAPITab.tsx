import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Key, Webhook, Link, Download, Database, Shield, Plus, Copy, Eye, EyeOff, Trash2 } from 'lucide-react';

export const IntegrationsAPITab = () => {
  const [settings, setSettings] = useState({
    apiEnabled: true,
    apiRateLimit: 1000,
    apiRateLimitPeriod: 'minute',
    apiVersioning: true,
    apiCurrentVersion: 'v1',
    apiDeprecationWarnings: true,
    webhooksEnabled: true,
    webhookRetryAttempts: 3,
    webhookRetryDelay: 60,
    webhookSignature: true,
    webhookSecret: 'whsec_xxxxx',
    ipaasEnabled: true,
    zapierEnabled: true,
    makeEnabled: true,
    n8nEnabled: false,
    exportCsvEnabled: true,
    exportXlsxEnabled: true,
    exportPdfEnabled: true,
    exportJsonEnabled: true,
    exportAutomated: true,
    exportSchedule: 'weekly',
    exportEncryption: true,
    aggregationEnabled: true,
    aggregationConcern: true,
    aggregationLocation: true,
    aggregationAnonymized: true,
    auditLogsEnabled: true,
    auditLogsRetention: 365,
    auditLogsExport: true,
    auditLogsRealtime: false,
  });

  const [apiKeys] = useState([
    { id: '1', name: 'Produktiv-Key', key: 'pk_live_xxxxx', created: '2024-01-15', lastUsed: '2024-12-18' },
    { id: '2', name: 'Test-Key', key: 'pk_test_xxxxx', created: '2024-03-01', lastUsed: '2024-12-17' },
  ]);

  const [webhooks] = useState([
    { id: '1', name: 'Absence Events', url: 'https://api.example.com/webhook', events: ['absence.created', 'absence.approved'], active: true },
    { id: '2', name: 'Time Tracking', url: 'https://api.example.com/time', events: ['timeentry.created'], active: true },
  ]);

  const [showKey, setShowKey] = useState<string | null>(null);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* API-Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API-Keys
          </CardTitle>
          <CardDescription>Verwalten Sie Ihre API-Schlüssel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>API aktivieren</Label>
              <p className="text-sm text-muted-foreground">REST-API Zugriff erlauben</p>
            </div>
            <Switch 
              checked={settings.apiEnabled}
              onCheckedChange={(checked) => updateSetting('apiEnabled', checked)}
            />
          </div>

          {settings.apiEnabled && (
            <>
              <Separator />
              <div className="space-y-3">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{apiKey.name}</span>
                        <Badge variant={apiKey.key.includes('live') ? 'default' : 'secondary'}>
                          {apiKey.key.includes('live') ? 'Produktiv' : 'Test'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {showKey === apiKey.id ? apiKey.key : '•'.repeat(20)}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                        >
                          {showKey === apiKey.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Erstellt: {apiKey.created} • Letzte Nutzung: {apiKey.lastUsed}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Neuen API-Key erstellen
              </Button>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rate Limit (Anfragen)</Label>
                  <Input 
                    type="number"
                    value={settings.apiRateLimit}
                    onChange={(e) => updateSetting('apiRateLimit', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pro Zeitraum</Label>
                  <Select value={settings.apiRateLimitPeriod} onValueChange={(v) => updateSetting('apiRateLimitPeriod', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="second">Sekunde</SelectItem>
                      <SelectItem value="minute">Minute</SelectItem>
                      <SelectItem value="hour">Stunde</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>API-Versionierung</Label>
                  <p className="text-sm text-muted-foreground">Verschiedene API-Versionen unterstützen</p>
                </div>
                <Switch 
                  checked={settings.apiVersioning}
                  onCheckedChange={(checked) => updateSetting('apiVersioning', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Deprecation-Warnungen</Label>
                  <p className="text-sm text-muted-foreground">Warnung bei veralteten Endpunkten</p>
                </div>
                <Switch 
                  checked={settings.apiDeprecationWarnings}
                  onCheckedChange={(checked) => updateSetting('apiDeprecationWarnings', checked)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhooks
          </CardTitle>
          <CardDescription>Automatische Benachrichtigungen an externe Systeme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Webhooks aktivieren</Label>
              <p className="text-sm text-muted-foreground">Events an externe URLs senden</p>
            </div>
            <Switch 
              checked={settings.webhooksEnabled}
              onCheckedChange={(checked) => updateSetting('webhooksEnabled', checked)}
            />
          </div>

          {settings.webhooksEnabled && (
            <>
              <Separator />
              <div className="space-y-3">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{webhook.name}</span>
                        <Badge variant={webhook.active ? 'default' : 'secondary'}>
                          {webhook.active ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
                      </div>
                      <code className="text-xs text-muted-foreground">{webhook.url}</code>
                      <div className="flex gap-1 mt-1">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">{event}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Switch checked={webhook.active} />
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Webhook hinzufügen
              </Button>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Wiederholungsversuche</Label>
                  <Input 
                    type="number"
                    value={settings.webhookRetryAttempts}
                    onChange={(e) => updateSetting('webhookRetryAttempts', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Verzögerung zwischen Versuchen (Sek.)</Label>
                  <Input 
                    type="number"
                    value={settings.webhookRetryDelay}
                    onChange={(e) => updateSetting('webhookRetryDelay', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Webhook-Signatur</Label>
                  <p className="text-sm text-muted-foreground">HMAC-Signatur zur Verifizierung</p>
                </div>
                <Switch 
                  checked={settings.webhookSignature}
                  onCheckedChange={(checked) => updateSetting('webhookSignature', checked)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* iPaaS-Integrationen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            iPaaS-Integrationen
          </CardTitle>
          <CardDescription>No-Code-Automatisierungsplattformen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>iPaaS aktivieren</Label>
              <p className="text-sm text-muted-foreground">Integration mit Automatisierungstools</p>
            </div>
            <Switch 
              checked={settings.ipaasEnabled}
              onCheckedChange={(checked) => updateSetting('ipaasEnabled', checked)}
            />
          </div>

          {settings.ipaasEnabled && (
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <span>Zapier</span>
                </div>
                <Switch 
                  checked={settings.zapierEnabled}
                  onCheckedChange={(checked) => updateSetting('zapierEnabled', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <span>Make</span>
                </div>
                <Switch 
                  checked={settings.makeEnabled}
                  onCheckedChange={(checked) => updateSetting('makeEnabled', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <span>n8n</span>
                </div>
                <Switch 
                  checked={settings.n8nEnabled}
                  onCheckedChange={(checked) => updateSetting('n8nEnabled', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exporte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exporte
          </CardTitle>
          <CardDescription>Datenexport-Einstellungen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Verfügbare Export-Formate</Label>
            <div className="grid grid-cols-4 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>CSV</span>
                <Switch 
                  checked={settings.exportCsvEnabled}
                  onCheckedChange={(checked) => updateSetting('exportCsvEnabled', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>Excel</span>
                <Switch 
                  checked={settings.exportXlsxEnabled}
                  onCheckedChange={(checked) => updateSetting('exportXlsxEnabled', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>PDF</span>
                <Switch 
                  checked={settings.exportPdfEnabled}
                  onCheckedChange={(checked) => updateSetting('exportPdfEnabled', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>JSON</span>
                <Switch 
                  checked={settings.exportJsonEnabled}
                  onCheckedChange={(checked) => updateSetting('exportJsonEnabled', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Automatisierte Exporte</Label>
              <p className="text-sm text-muted-foreground">Regelmäßige Datenexporte planen</p>
            </div>
            <Switch 
              checked={settings.exportAutomated}
              onCheckedChange={(checked) => updateSetting('exportAutomated', checked)}
            />
          </div>

          {settings.exportAutomated && (
            <div className="space-y-2 pl-4 border-l-2 border-primary/20">
              <Label>Export-Zeitplan</Label>
              <Select value={settings.exportSchedule} onValueChange={(v) => updateSetting('exportSchedule', v)}>
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
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label>Export-Verschlüsselung</Label>
              <p className="text-sm text-muted-foreground">Exporte verschlüsselt speichern</p>
            </div>
            <Switch 
              checked={settings.exportEncryption}
              onCheckedChange={(checked) => updateSetting('exportEncryption', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Datenaggregation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Datenaggregation
          </CardTitle>
          <CardDescription>Daten über Organisationseinheiten hinweg</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Datenaggregation aktivieren</Label>
              <p className="text-sm text-muted-foreground">Daten konsolidieren</p>
            </div>
            <Switch 
              checked={settings.aggregationEnabled}
              onCheckedChange={(checked) => updateSetting('aggregationEnabled', checked)}
            />
          </div>

          {settings.aggregationEnabled && (
            <div className="space-y-3 pl-4 border-l-2 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Konzernweite Aggregation</Label>
                  <p className="text-sm text-muted-foreground">Über alle Gesellschaften</p>
                </div>
                <Switch 
                  checked={settings.aggregationConcern}
                  onCheckedChange={(checked) => updateSetting('aggregationConcern', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Je Standort</Label>
                  <p className="text-sm text-muted-foreground">Standortbezogene Auswertungen</p>
                </div>
                <Switch 
                  checked={settings.aggregationLocation}
                  onCheckedChange={(checked) => updateSetting('aggregationLocation', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Anonymisierte Aggregation</Label>
                  <p className="text-sm text-muted-foreground">Personenbezug entfernen</p>
                </div>
                <Switch 
                  checked={settings.aggregationAnonymized}
                  onCheckedChange={(checked) => updateSetting('aggregationAnonymized', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit-Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Audit-Logs
          </CardTitle>
          <CardDescription>Protokollierung aller Aktivitäten</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Audit-Logs aktivieren</Label>
              <p className="text-sm text-muted-foreground">Alle Aktionen protokollieren</p>
            </div>
            <Switch 
              checked={settings.auditLogsEnabled}
              onCheckedChange={(checked) => updateSetting('auditLogsEnabled', checked)}
            />
          </div>

          {settings.auditLogsEnabled && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <div className="space-y-2">
                <Label>Aufbewahrungsfrist (Tage)</Label>
                <Input 
                  type="number"
                  value={settings.auditLogsRetention}
                  onChange={(e) => updateSetting('auditLogsRetention', parseInt(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Audit-Logs exportieren</Label>
                  <p className="text-sm text-muted-foreground">Export als CSV/JSON</p>
                </div>
                <Switch 
                  checked={settings.auditLogsExport}
                  onCheckedChange={(checked) => updateSetting('auditLogsExport', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Echtzeit-Streaming</Label>
                  <p className="text-sm text-muted-foreground">Logs an SIEM-System senden</p>
                </div>
                <Switch 
                  checked={settings.auditLogsRealtime}
                  onCheckedChange={(checked) => updateSetting('auditLogsRealtime', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsAPITab;
