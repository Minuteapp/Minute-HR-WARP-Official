import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Workflow, 
  Plus,
  Settings,
  Shield,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface IPaaSConnection {
  id: string;
  company_id: string;
  platform: string;
  connection_name: string;
  allowed_events: string[];
  data_masking_enabled: boolean;
  masked_fields: string[];
  environment: string;
  api_key: string;
  is_active: boolean;
}

const IPAAS_PLATFORMS = [
  { 
    id: 'zapier', 
    name: 'Zapier', 
    description: 'Verbinden Sie tausende Apps ohne Code',
    logo: '⚡',
    color: 'bg-orange-100 dark:bg-orange-900'
  },
  { 
    id: 'make', 
    name: 'Make (Integromat)', 
    description: 'Leistungsstarke Automatisierungen',
    logo: '🔮',
    color: 'bg-purple-100 dark:bg-purple-900'
  },
  { 
    id: 'n8n', 
    name: 'n8n', 
    description: 'Self-hosted Workflow Automation',
    logo: '🔄',
    color: 'bg-green-100 dark:bg-green-900'
  },
  { 
    id: 'custom', 
    name: 'Eigene Middleware', 
    description: 'Custom Integration Plattform',
    logo: '🛠️',
    color: 'bg-blue-100 dark:bg-blue-900'
  }
];

const AVAILABLE_EVENTS = [
  'user.created', 'user.updated', 'user.deleted',
  'absence.requested', 'absence.approved', 
  'time.checked_in', 'time.checked_out',
  'task.created', 'task.completed',
  'project.created', 'project.completed'
];

const SENSITIVE_FIELDS = [
  { id: 'email', label: 'E-Mail-Adressen' },
  { id: 'phone', label: 'Telefonnummern' },
  { id: 'salary', label: 'Gehaltsdaten' },
  { id: 'address', label: 'Adressen' },
  { id: 'bank_account', label: 'Bankdaten' },
  { id: 'social_security', label: 'Sozialversicherungsnummer' }
];

export function IPaasTab() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<typeof IPAAS_PLATFORMS[0] | null>(null);
  const [formData, setFormData] = useState<Partial<IPaaSConnection>>({});
  const [showApiKey, setShowApiKey] = useState(false);

  const { data: connections, isLoading } = useQuery({
    queryKey: ['ipaas-connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ipaas_connections')
        .select('*');
      
      if (error) throw error;
      return data as IPaaSConnection[];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (connection: Partial<IPaaSConnection>) => {
      if (connection.id) {
        const { error } = await supabase
          .from('ipaas_connections')
          .update(connection)
          .eq('id', connection.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ipaas_connections')
          .insert(connection);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ipaas-connections'] });
      toast.success("Verbindung gespeichert");
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error("Fehler beim Speichern");
    }
  });

  const openDialog = (platform: typeof IPAAS_PLATFORMS[0]) => {
    const existing = connections?.find(c => c.platform === platform.id);
    setSelectedPlatform(platform);
    setFormData(existing || {
      platform: platform.id,
      connection_name: `${platform.name} Integration`,
      allowed_events: [],
      data_masking_enabled: true,
      masked_fields: ['salary', 'bank_account', 'social_security'],
      environment: 'sandbox',
      is_active: false
    });
    setIsDialogOpen(true);
  };

  const toggleEvent = (event: string) => {
    const events = formData.allowed_events as string[] || [];
    const newEvents = events.includes(event)
      ? events.filter(e => e !== event)
      : [...events, event];
    setFormData({ ...formData, allowed_events: newEvents });
  };

  const toggleMaskedField = (field: string) => {
    const fields = formData.masked_fields as string[] || [];
    const newFields = fields.includes(field)
      ? fields.filter(f => f !== field)
      : [...fields, field];
    setFormData({ ...formData, masked_fields: newFields });
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            iPaaS & Automationsplattformen
          </CardTitle>
          <CardDescription>
            Verbinden Sie Minute HR mit Low-Code Automationsplattformen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {IPAAS_PLATFORMS.map((platform) => {
              const connection = connections?.find(c => c.platform === platform.id);
              
              return (
                <Card 
                  key={platform.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${connection?.is_active ? 'border-primary' : ''}`}
                  onClick={() => openDialog(platform)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${platform.color}`}>
                        <span className="text-2xl">{platform.logo}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{platform.name}</h3>
                          {connection && (
                            <Badge variant={connection.is_active ? 'default' : 'secondary'}>
                              {connection.is_active ? 'Aktiv' : 'Inaktiv'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {platform.description}
                        </p>
                        {connection && (
                          <div className="mt-3 flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              {connection.environment === 'sandbox' ? '🧪 Sandbox' : '🚀 Produktion'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {(connection.allowed_events as string[] || []).length} Events
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Config Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{selectedPlatform?.logo}</span>
              {selectedPlatform?.name} konfigurieren
            </DialogTitle>
            <DialogDescription>
              Steuern Sie die Verbindung und Datenmaskierung
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Status & Environment */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label>Verbindung aktiv</Label>
                  <p className="text-xs text-muted-foreground">Aktiviert die Integration</p>
                </div>
                <Switch 
                  checked={formData.is_active ?? false}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
              </div>
              <div className="space-y-2">
                <Label>Umgebung</Label>
                <Select 
                  value={formData.environment || 'sandbox'}
                  onValueChange={(value) => setFormData({...formData, environment: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">🧪 Sandbox (Test)</SelectItem>
                    <SelectItem value="production">🚀 Produktion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.environment === 'production' && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Produktionsumgebung: Alle Aktionen werden auf echten Daten ausgeführt.
                </AlertDescription>
              </Alert>
            )}

            {/* API Key */}
            <div className="space-y-2">
              <Label>API-Key</Label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input 
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="Ihr API-Key für diese Plattform"
                    value={formData.api_key || ''}
                    onChange={(e) => setFormData({...formData, api_key: e.target.value})}
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Allowed Events */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Erlaubte Events
              </Label>
              <div className="border rounded-lg p-4 grid grid-cols-2 gap-2">
                {AVAILABLE_EVENTS.map((event) => (
                  <div key={event} className="flex items-center gap-2">
                    <Checkbox 
                      id={`event-${event}`}
                      checked={(formData.allowed_events as string[] || []).includes(event)}
                      onCheckedChange={() => toggleEvent(event)}
                    />
                    <label htmlFor={`event-${event}`} className="text-sm">
                      {event}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Masking */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Datenmaskierung
                </Label>
                <Switch 
                  checked={formData.data_masking_enabled ?? true}
                  onCheckedChange={(checked) => setFormData({...formData, data_masking_enabled: checked})}
                />
              </div>
              
              {formData.data_masking_enabled && (
                <div className="border rounded-lg p-4 space-y-2">
                  <p className="text-sm text-muted-foreground mb-3">
                    Wählen Sie Felder, die maskiert werden sollen:
                  </p>
                  {SENSITIVE_FIELDS.map((field) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Checkbox 
                        id={`mask-${field.id}`}
                        checked={(formData.masked_fields as string[] || []).includes(field.id)}
                        onCheckedChange={() => toggleMaskedField(field.id)}
                      />
                      <label htmlFor={`mask-${field.id}`} className="text-sm">
                        {field.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={() => saveMutation.mutate(formData)}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
