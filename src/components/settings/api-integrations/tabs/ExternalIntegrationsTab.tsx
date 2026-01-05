import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plug, 
  Plus,
  Settings,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Trash2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface ExternalIntegration {
  id: string;
  company_id: string;
  category: string;
  provider: string;
  display_name: string;
  status: string;
  auth_type: string;
  credentials: any;
  data_direction: string;
  sync_interval_minutes: number;
  error_behavior: string;
  retry_count: number;
  cost_limit_monthly: number;
  last_sync_at: string;
  last_error: string;
}

const INTEGRATION_CATALOG = {
  payroll: {
    label: 'Payroll & Finance',
    providers: [
      { id: 'datev', name: 'DATEV', description: 'Deutsche Lohnbuchhaltung', logo: '📊' },
      { id: 'sap', name: 'SAP', description: 'Enterprise Resource Planning', logo: '🏢' },
      { id: 'personio', name: 'Personio', description: 'HR Software', logo: '👥' }
    ]
  },
  identity: {
    label: 'Identity & Access',
    providers: [
      { id: 'azure_ad', name: 'Azure AD', description: 'Microsoft Identity', logo: '🔐' },
      { id: 'google_workspace', name: 'Google Workspace', description: 'Google Identity', logo: '🔑' },
      { id: 'okta', name: 'Okta', description: 'Identity Management', logo: '🛡️' }
    ]
  },
  location: {
    label: 'Zeiterfassung & Location',
    providers: [
      { id: 'mapbox', name: 'Mapbox', description: 'Karten & Geolocation', logo: '🗺️' },
      { id: 'google_maps', name: 'Google Maps', description: 'Maps API', logo: '📍' }
    ]
  },
  communication: {
    label: 'Kommunikation',
    providers: [
      { id: 'slack', name: 'Slack', description: 'Team Messaging', logo: '💬' },
      { id: 'teams', name: 'Microsoft Teams', description: 'Collaboration', logo: '👥' },
      { id: 'smtp', name: 'E-Mail (SMTP)', description: 'E-Mail Versand', logo: '📧' }
    ]
  },
  documents: {
    label: 'Dokumente & Signatur',
    providers: [
      { id: 'docusign', name: 'DocuSign', description: 'E-Signatur', logo: '✍️' },
      { id: 'adobe_sign', name: 'Adobe Sign', description: 'Digital Signatures', logo: '📝' }
    ]
  },
  travel: {
    label: 'Reisen & Ausgaben',
    providers: [
      { id: 'amadeus', name: 'Amadeus', description: 'Travel Booking', logo: '✈️' },
      { id: 'booking', name: 'Booking APIs', description: 'Hotel Reservations', logo: '🏨' }
    ]
  }
};

export function ExternalIntegrationsTab() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('payroll');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [formData, setFormData] = useState<Partial<ExternalIntegration>>({});

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['external-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_integrations')
        .select('*');
      
      if (error) throw error;
      return data as ExternalIntegration[];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (integration: Partial<ExternalIntegration>) => {
      if (integration.id) {
        const { error } = await supabase
          .from('external_integrations')
          .update(integration)
          .eq('id', integration.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('external_integrations')
          .insert(integration);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-integrations'] });
      toast.success("Integration gespeichert");
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error("Fehler beim Speichern");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('external_integrations')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-integrations'] });
      toast.success("Integration gelöscht");
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const openConfigDialog = (provider: any, category: string) => {
    const existing = integrations?.find(i => i.provider === provider.id);
    setSelectedProvider({ ...provider, category });
    setFormData(existing || {
      category,
      provider: provider.id,
      display_name: provider.name,
      status: 'inactive',
      auth_type: 'api_key',
      data_direction: 'bidirectional',
      sync_interval_minutes: 60,
      error_behavior: 'retry',
      retry_count: 3
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            Externe Integrationen
          </CardTitle>
          <CardDescription>
            Verbinden Sie externe Systeme und Dienste
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-6">
              {Object.entries(INTEGRATION_CATALOG).map(([key, cat]) => (
                <TabsTrigger key={key} value={key} className="text-xs">
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(INTEGRATION_CATALOG).map(([key, cat]) => (
              <TabsContent key={key} value={key} className="mt-4">
                <div className="grid gap-4 md:grid-cols-3">
                  {cat.providers.map((provider) => {
                    const existing = integrations?.find(i => i.provider === provider.id);
                    
                    return (
                      <Card 
                        key={provider.id} 
                        className={`cursor-pointer transition-all hover:shadow-md ${existing?.status === 'active' ? 'border-primary' : ''}`}
                        onClick={() => openConfigDialog(provider, key)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{provider.logo}</span>
                              <div>
                                <h4 className="font-medium">{provider.name}</h4>
                                <p className="text-xs text-muted-foreground">{provider.description}</p>
                              </div>
                            </div>
                            {existing && getStatusIcon(existing.status)}
                          </div>
                          {existing && (
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Letzte Sync:</span>
                                <span>{existing.last_sync_at ? new Date(existing.last_sync_at).toLocaleString('de') : 'Nie'}</span>
                              </div>
                            </div>
                          )}
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

      {/* Config Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedProvider?.logo} {selectedProvider?.name} konfigurieren
            </DialogTitle>
            <DialogDescription>
              Verbindungseinstellungen für {selectedProvider?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {formData.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                </span>
                <Switch 
                  checked={formData.status === 'active'}
                  onCheckedChange={(checked) => setFormData({...formData, status: checked ? 'active' : 'inactive'})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Authentifizierungstyp</Label>
              <Select 
                value={formData.auth_type || 'api_key'}
                onValueChange={(value) => setFormData({...formData, auth_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="api_key">API-Key</SelectItem>
                  <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                  <SelectItem value="saml">SAML</SelectItem>
                  <SelectItem value="oidc">OpenID Connect</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Datenrichtung</Label>
              <Select 
                value={formData.data_direction || 'bidirectional'}
                onValueChange={(value) => setFormData({...formData, data_direction: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inbound">Nur Eingehend</SelectItem>
                  <SelectItem value="outbound">Nur Ausgehend</SelectItem>
                  <SelectItem value="bidirectional">Bidirektional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sync-Intervall (Minuten)</Label>
              <Input 
                type="number"
                value={formData.sync_interval_minutes || 60}
                onChange={(e) => setFormData({...formData, sync_interval_minutes: parseInt(e.target.value)})}
              />
            </div>

            <div className="space-y-2">
              <Label>Fehlerverhalten</Label>
              <Select 
                value={formData.error_behavior || 'retry'}
                onValueChange={(value) => setFormData({...formData, error_behavior: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retry">Wiederholen</SelectItem>
                  <SelectItem value="stop">Stoppen</SelectItem>
                  <SelectItem value="alert">Nur Warnung</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Monatliches Kostenlimit (€)</Label>
              <Input 
                type="number"
                placeholder="Optional"
                value={formData.cost_limit_monthly || ''}
                onChange={(e) => setFormData({...formData, cost_limit_monthly: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            {formData.id && (
              <Button 
                variant="destructive" 
                onClick={() => {
                  deleteMutation.mutate(formData.id!);
                  setIsDialogOpen(false);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Löschen
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={() => saveMutation.mutate(formData)}>
                Speichern
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
