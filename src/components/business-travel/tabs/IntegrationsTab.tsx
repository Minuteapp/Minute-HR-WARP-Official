import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Link, RefreshCw, CheckCircle, XCircle, AlertTriangle, 
  FileSpreadsheet, Wallet, Archive, Settings, Zap, Database
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  provider: string;
  category: string;
  status: string;
  last_sync: string | null;
  sync_count: number;
  error_count: number;
  success_rate: number;
}

export function IntegrationsTab() {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const queryClient = useQueryClient();

  // Fetch integrations
  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['system-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_integrations')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Integration[];
    }
  });

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      const { error } = await supabase
        .from('system_integrations')
        .update({ 
          last_sync: new Date().toISOString(),
          sync_count: integrations.find(i => i.id === integrationId)?.sync_count || 0 + 1
        })
        .eq('id', integrationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-integrations'] });
      toast.success('Synchronisation gestartet');
    }
  });

  // Calculate stats
  const totalIntegrations = integrations.length;
  const activeIntegrations = integrations.filter(i => i.status === 'active').length;
  const errorIntegrations = integrations.filter(i => i.status === 'error').length;
  const avgSuccessRate = integrations.length > 0 
    ? Math.round(integrations.reduce((sum, i) => sum + (i.success_rate || 100), 0) / integrations.length)
    : 100;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Aktiv</Badge>;
      case 'error':
        return <Badge variant="destructive">Fehler</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inaktiv</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'accounting':
        return <FileSpreadsheet className="h-5 w-5" />;
      case 'payroll':
        return <Wallet className="h-5 w-5" />;
      case 'archive':
        return <Archive className="h-5 w-5" />;
      case 'erp':
        return <Database className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Link className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">System-Integrationen</h2>
            <p className="text-muted-foreground">
              Automatische Übertragung und Synchronisation mit externen Systemen
            </p>
          </div>
        </div>
        <Button onClick={() => integrations.forEach(i => syncMutation.mutate(i.id))}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Alle synchronisieren
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Integrationen</p>
                <p className="text-2xl font-bold">{totalIntegrations}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <Link className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktiv</p>
                <p className="text-2xl font-bold text-green-600">{activeIntegrations}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fehler</p>
                <p className="text-2xl font-bold text-red-600">{errorIntegrations}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Erfolgsrate</p>
                <p className="text-2xl font-bold text-primary">{avgSuccessRate}%</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Zap className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sub-Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="datev">DATEV Export</TabsTrigger>
          <TabsTrigger value="payroll">Lohn & Gehalt</TabsTrigger>
          <TabsTrigger value="archive">Dokumenten-Archiv</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Verfügbare Integrationen</CardTitle>
              <CardDescription>
                Übersicht aller verfügbaren System-Integrationen und deren Status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {integrations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Keine Integrationen konfiguriert</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {integrations.map((integration) => (
                    <div 
                      key={integration.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          {getCategoryIcon(integration.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{integration.name}</h4>
                            {getStatusBadge(integration.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {integration.provider} • {integration.sync_count} Synchronisationen
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p className="text-muted-foreground">Letzte Sync</p>
                          <p>
                            {integration.last_sync 
                              ? format(new Date(integration.last_sync), 'dd.MM.yyyy HH:mm', { locale: de })
                              : 'Nie'
                            }
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => syncMutation.mutate(integration.id)}
                          disabled={syncMutation.isPending}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datev" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                DATEV Export
              </CardTitle>
              <CardDescription>
                Automatischer Export von Spesenabrechnungen nach DATEV.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Automatischer Export</h4>
                    <p className="text-sm text-muted-foreground">
                      Genehmigte Spesen werden automatisch nach DATEV exportiert
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Export-Format</h4>
                    <p className="text-sm text-muted-foreground">
                      DATEV-Format für Buchungsstapel
                    </p>
                  </div>
                  <Badge>DATEV CSV</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Lohn & Gehalt Integration
              </CardTitle>
              <CardDescription>
                Übertragung von Reisekosten in die Lohnabrechnung.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Automatische Übertragung</h4>
                    <p className="text-sm text-muted-foreground">
                      Genehmigte Spesen werden zur Lohnabrechnung übertragen
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archive" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Dokumenten-Archiv
              </CardTitle>
              <CardDescription>
                Automatische Archivierung von Reisedokumenten und Belegen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Automatische Archivierung</h4>
                    <p className="text-sm text-muted-foreground">
                      Dokumente werden nach Abschluss automatisch archiviert
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Aufbewahrungsfrist</h4>
                    <p className="text-sm text-muted-foreground">
                      DSGVO-konforme Aufbewahrung
                    </p>
                  </div>
                  <Badge>10 Jahre</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}