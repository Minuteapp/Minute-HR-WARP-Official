import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Switch } from "../../ui/switch";
import { Textarea } from "../../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Link, Settings, CheckCircle, XCircle, Plus, RefreshCw, Zap, Database, CreditCard, FileText } from "lucide-react";

interface User {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface ExpenseIntegrationsProps {
  user: User;
}

interface Integration {
  id: string;
  name: string;
  type: 'accounting' | 'banking' | 'receipt' | 'travel' | 'workflow';
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  config?: Record<string, any>;
  icon: any;
}

const availableIntegrations: Integration[] = [
  {
    id: '1',
    name: 'SAP',
    type: 'accounting',
    description: 'Direkte Integration mit SAP ERP für automatische Buchungen',
    status: 'connected',
    lastSync: '2024-01-15T10:30:00Z',
    icon: Database
  },
  {
    id: '2',
    name: 'DATEV',
    type: 'accounting',
    description: 'Integration mit DATEV für Lohnbuchhaltung und Steuer',
    status: 'connected',
    lastSync: '2024-01-15T09:15:00Z',
    icon: FileText
  },
  {
    id: '3',
    name: 'American Express',
    type: 'banking',
    description: 'Automatischer Import von Kreditkarten-Transaktionen',
    status: 'connected',
    lastSync: '2024-01-15T08:45:00Z',
    icon: CreditCard
  },
  {
    id: '4',
    name: 'Corporate Card Program',
    type: 'banking',
    description: 'Firmenkreditkarten-Integration für automatische Spesenerfassung',
    status: 'disconnected',
    icon: CreditCard
  },
  {
    id: '5',
    name: 'Receipt Bank',
    type: 'receipt',
    description: 'OCR-basierte Belegverarbeitung und automatische Kategorisierung',
    status: 'error',
    lastSync: '2024-01-14T16:20:00Z',
    icon: FileText
  },
  {
    id: '6',
    name: 'Concur Travel',
    type: 'travel',
    description: 'Integration mit SAP Concur für Travel & Expense Management',
    status: 'disconnected',
    icon: Zap
  },
  {
    id: '7',
    name: 'Microsoft Outlook',
    type: 'workflow',
    description: 'E-Mail-Benachrichtigungen und Kalendar-Integration',
    status: 'connected',
    lastSync: '2024-01-15T11:00:00Z',
    icon: Zap
  }
];

export function ExpenseIntegrations({ user }: ExpenseIntegrationsProps) {
  const [integrations, setIntegrations] = useState<Integration[]>(availableIntegrations);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  
  const [connectionConfig, setConnectionConfig] = useState({
    endpoint: '',
    apiKey: '',
    username: '',
    password: '',
    enabled: true,
    syncFrequency: 'hourly'
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="success">Verbunden</Badge>;
      case 'error':
        return <Badge variant="destructive">Fehler</Badge>;
      default:
        return <Badge variant="secondary">Getrennt</Badge>;
    }
  };

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration);
    setIsConfigDialogOpen(true);
  };

  const handleSaveConnection = () => {
    if (selectedIntegration) {
      setIntegrations(integrations.map(int =>
        int.id === selectedIntegration.id
          ? { ...int, status: 'connected' as const, lastSync: new Date().toISOString(), config: connectionConfig }
          : int
      ));
    }
    setIsConfigDialogOpen(false);
    setSelectedIntegration(null);
  };

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(integrations.map(int =>
      int.id === integrationId
        ? { ...int, status: 'disconnected' as const, lastSync: undefined }
        : int
    ));
  };

  const handleSync = (integrationId: string) => {
    setIntegrations(integrations.map(int =>
      int.id === integrationId
        ? { ...int, lastSync: new Date().toISOString() }
        : int
    ));
  };

  const groupedIntegrations = integrations.reduce((acc, integration) => {
    if (!acc[integration.type]) acc[integration.type] = [];
    acc[integration.type].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'accounting': return 'Buchhaltung';
      case 'banking': return 'Banking';
      case 'receipt': return 'Belege';
      case 'travel': return 'Reisen';
      case 'workflow': return 'Workflow';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'accounting': return Database;
      case 'banking': return CreditCard;
      case 'receipt': return FileText;
      case 'travel': return Zap;
      case 'workflow': return Settings;
      default: return Link;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                System-Integrationen
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Verbinden Sie externe Systeme für automatisierte Spesenverwaltung
              </p>
            </div>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Alle synchronisieren
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Alle</TabsTrigger>
              <TabsTrigger value="accounting">Buchhaltung</TabsTrigger>
              <TabsTrigger value="banking">Banking</TabsTrigger>
              <TabsTrigger value="receipt">Belege</TabsTrigger>
              <TabsTrigger value="travel">Reisen</TabsTrigger>
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="space-y-6">
                {Object.entries(groupedIntegrations).map(([type, typeIntegrations]) => {
                  const TypeIcon = getTypeIcon(type);
                  return (
                    <div key={type}>
                      <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                        <TypeIcon className="h-5 w-5" />
                        {getTypeLabel(type)}
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {typeIntegrations.map((integration) => {
                          const IconComponent = integration.icon;
                          return (
                            <Card key={integration.id}>
                              <CardContent className="pt-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                                      <IconComponent className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium">{integration.name}</h4>
                                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                                    </div>
                                  </div>
                                  {getStatusIcon(integration.status)}
                                </div>
                                
                                <div className="flex items-center justify-between mb-4">
                                  {getStatusBadge(integration.status)}
                                  {integration.lastSync && (
                                    <span className="text-xs text-muted-foreground">
                                      Zuletzt: {new Date(integration.lastSync).toLocaleString('de-DE')}
                                    </span>
                                  )}
                                </div>

                                <div className="flex gap-2">
                                  {integration.status === 'connected' ? (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSync(integration.id)}
                                        className="flex-1"
                                      >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Sync
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleConnect(integration)}
                                        className="flex-1"
                                      >
                                        <Settings className="h-4 w-4 mr-2" />
                                        Konfigurieren
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDisconnect(integration.id)}
                                      >
                                        Trennen
                                      </Button>
                                    </>
                                  ) : (
                                    <Button
                                      onClick={() => handleConnect(integration)}
                                      size="sm"
                                      className="w-full"
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Verbinden
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {Object.entries(groupedIntegrations).map(([type, typeIntegrations]) => (
              <TabsContent key={type} value={type}>
                <div className="grid gap-4 md:grid-cols-2">
                  {typeIntegrations.map((integration) => {
                    const IconComponent = integration.icon;
                    return (
                      <Card key={integration.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-medium">{integration.name}</h4>
                                <p className="text-sm text-muted-foreground">{integration.description}</p>
                              </div>
                            </div>
                            {getStatusIcon(integration.status)}
                          </div>
                          
                          <div className="flex items-center justify-between mb-4">
                            {getStatusBadge(integration.status)}
                            {integration.lastSync && (
                              <span className="text-xs text-muted-foreground">
                                Zuletzt: {new Date(integration.lastSync).toLocaleString('de-DE')}
                              </span>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {integration.status === 'connected' ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSync(integration.id)}
                                  className="flex-1"
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Sync
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleConnect(integration)}
                                  className="flex-1"
                                >
                                  <Settings className="h-4 w-4 mr-2" />
                                  Konfigurieren
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDisconnect(integration.id)}
                                >
                                  Trennen
                                </Button>
                              </>
                            ) : (
                              <Button
                                onClick={() => handleConnect(integration)}
                                size="sm"
                                className="w-full"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Verbinden
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedIntegration?.name} konfigurieren
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="endpoint">API Endpoint</Label>
              <Input
                id="endpoint"
                value={connectionConfig.endpoint}
                onChange={(e) => setConnectionConfig({ ...connectionConfig, endpoint: e.target.value })}
                placeholder="https://api.example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Schlüssel</Label>
              <Input
                id="apiKey"
                type="password"
                value={connectionConfig.apiKey}
                onChange={(e) => setConnectionConfig({ ...connectionConfig, apiKey: e.target.value })}
                placeholder="API Schlüssel eingeben"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Benutzername</Label>
                <Input
                  id="username"
                  value={connectionConfig.username}
                  onChange={(e) => setConnectionConfig({ ...connectionConfig, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  value={connectionConfig.password}
                  onChange={(e) => setConnectionConfig({ ...connectionConfig, password: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="syncFrequency">Synchronisation</Label>
              <Select
                value={connectionConfig.syncFrequency}
                onValueChange={(value) => setConnectionConfig({ ...connectionConfig, syncFrequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manuell</SelectItem>
                  <SelectItem value="hourly">Stündlich</SelectItem>
                  <SelectItem value="daily">Täglich</SelectItem>
                  <SelectItem value="weekly">Wöchentlich</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={connectionConfig.enabled}
                onCheckedChange={(checked) => setConnectionConfig({ ...connectionConfig, enabled: checked })}
              />
              <Label htmlFor="enabled">Integration aktivieren</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveConnection}>
              Verbindung speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}