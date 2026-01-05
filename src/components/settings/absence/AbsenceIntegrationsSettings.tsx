import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  BarChart3, 
  Download, 
  Upload,
  Save, 
  Settings2,
  CheckCircle,
  AlertCircle,
  Link2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRolePermissions } from "@/hooks/useRolePermissions";

interface Integration {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  syncEnabled: boolean;
  lastSync?: string;
}

export const AbsenceIntegrationsSettings = () => {
  const { toast } = useToast();
  const { hasPermission } = useRolePermissions();
  
  const canEdit = hasPermission('absence_settings');

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'calendar',
      name: 'Kalender-Synchronisation',
      icon: <Calendar className="h-4 w-4" />,
      description: 'Google Calendar, Outlook, iCal Integration',
      status: 'connected',
      syncEnabled: true,
      lastSync: '2024-01-18 14:30',
    },
    {
      id: 'timetracking',
      name: 'Zeiterfassung',
      icon: <Clock className="h-4 w-4" />,
      description: 'Automatische Zeiterfassung bei Abwesenheiten',
      status: 'connected',
      syncEnabled: true,
      lastSync: '2024-01-18 14:25',
    },
    {
      id: 'payroll',
      name: 'Lohn & Gehalt',
      icon: <DollarSign className="h-4 w-4" />,
      description: 'Synchronisation mit Lohnbuchhaltung',
      status: 'disconnected',
      syncEnabled: false,
    },
    {
      id: 'reporting',
      name: 'Reporting/BI',
      icon: <BarChart3 className="h-4 w-4" />,
      description: 'Business Intelligence und Berichtswesen',
      status: 'error',
      syncEnabled: false,
      lastSync: '2024-01-17 10:15',
    },
  ]);

  const handleSave = () => {
    toast({
      title: "Integrationseinstellungen gespeichert",
      description: "Die Integrationseinstellungen wurden erfolgreich aktualisiert.",
    });
  };

  const handleConnect = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: 'connected', syncEnabled: true, lastSync: new Date().toISOString().slice(0, 16).replace('T', ' ') }
        : integration
    ));
    
    toast({
      title: "Integration verbunden",
      description: "Die Integration wurde erfolgreich eingerichtet.",
    });
  };

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: 'disconnected', syncEnabled: false }
        : integration
    ));
    
    toast({
      title: "Integration getrennt",
      description: "Die Integration wurde erfolgreich getrennt.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'connected':
        return { label: 'Verbunden', variant: 'default' as const };
      case 'error':
        return { label: 'Fehler', variant: 'destructive' as const };
      default:
        return { label: 'Getrennt', variant: 'secondary' as const };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link2 className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Integrationen</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            System-Integrationen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {integrations.map((integration) => {
            const statusInfo = getStatusLabel(integration.status);
            
            return (
              <div key={integration.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {integration.icon}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{integration.name}</span>
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {integration.description}
                      </p>
                      {integration.lastSync && (
                        <p className="text-xs text-muted-foreground">
                          Letzte Synchronisation: {integration.lastSync}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(integration.status)}
                    {canEdit && (
                      <div className="flex gap-2">
                        {integration.status === 'connected' ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDisconnect(integration.id)}
                          >
                            Trennen
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => handleConnect(integration.id)}
                          >
                            Verbinden
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {integration.status === 'connected' && (
                  <div className="flex items-center justify-between pl-7">
                    <div className="space-y-1">
                      <Label>Automatische Synchronisation</Label>
                      <p className="text-sm text-muted-foreground">
                        Daten werden automatisch synchronisiert
                      </p>
                    </div>
                    <Switch 
                      checked={integration.syncEnabled} 
                      disabled={!canEdit}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Kalender-Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Standard-Kalender-Provider</Label>
              <Select disabled={!canEdit}>
                <SelectTrigger>
                  <SelectValue placeholder="Provider wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google Calendar</SelectItem>
                  <SelectItem value="outlook">Microsoft Outlook</SelectItem>
                  <SelectItem value="ical">iCal (Apple Calendar)</SelectItem>
                  <SelectItem value="exchange">Exchange Server</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Synchronisation-Intervall</Label>
              <Select disabled={!canEdit}>
                <SelectTrigger>
                  <SelectValue placeholder="Intervall wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="real-time">Echtzeit</SelectItem>
                  <SelectItem value="15min">Alle 15 Minuten</SelectItem>
                  <SelectItem value="30min">Alle 30 Minuten</SelectItem>
                  <SelectItem value="1hour">Stündlich</SelectItem>
                  <SelectItem value="daily">Täglich</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Bidirektionale Synchronisation</Label>
                <p className="text-sm text-muted-foreground">
                  Änderungen im externen Kalender werden zurück synchronisiert
                </p>
              </div>
              <Switch disabled={!canEdit} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Private Termine ausblenden</Label>
                <p className="text-sm text-muted-foreground">
                  Private Kalendereinträge werden nicht übertragen
                </p>
              </div>
              <Switch disabled={!canEdit} defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Datenexport
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Export-Format</Label>
              <Select disabled={!canEdit}>
                <SelectTrigger>
                  <SelectValue placeholder="Format wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Zeitraum</Label>
              <Select disabled={!canEdit}>
                <SelectTrigger>
                  <SelectValue placeholder="Zeitraum wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-year">Aktuelles Jahr</SelectItem>
                  <SelectItem value="last-year">Letztes Jahr</SelectItem>
                  <SelectItem value="last-6-months">Letzte 6 Monate</SelectItem>
                  <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Automatischer Export</Label>
              <Select disabled={!canEdit}>
                <SelectTrigger>
                  <SelectValue placeholder="Häufigkeit wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manuell</SelectItem>
                  <SelectItem value="weekly">Wöchentlich</SelectItem>
                  <SelectItem value="monthly">Monatlich</SelectItem>
                  <SelectItem value="quarterly">Quartalsweise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" disabled={!canEdit}>
              <Download className="h-4 w-4 mr-2" />
              Jetzt exportieren
            </Button>
            <Button variant="outline" disabled={!canEdit}>
              <Upload className="h-4 w-4 mr-2" />
              Daten importieren
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API-Konfiguration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-endpoint">API-Endpunkt</Label>
            <Input
              id="api-endpoint"
              defaultValue="https://api.company.com/absences"
              disabled={!canEdit}
              placeholder="https://api.company.com/absences"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">API-Schlüssel</Label>
            <Input
              id="api-key"
              type="password"
              disabled={!canEdit}
              placeholder="••••••••••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Webhook-Benachrichtigungen</Label>
              <p className="text-sm text-muted-foreground">
                Externe Systeme bei Änderungen benachrichtigen
              </p>
            </div>
            <Switch disabled={!canEdit} />
          </div>
        </CardContent>
      </Card>

      {canEdit && (
        <div className="flex justify-end">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Einstellungen speichern
          </Button>
        </div>
      )}
    </div>
  );
};