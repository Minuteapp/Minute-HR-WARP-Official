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
import { 
  Webhook, 
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Play,
  Copy
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface WebhookConfig {
  id: string;
  company_id: string;
  name: string;
  url: string;
  events: string[];
  auth_type: string;
  auth_value: string;
  payload_format: string;
  retry_strategy: any;
  is_active: boolean;
  last_triggered_at: string;
  success_count: number;
  failure_count: number;
}

const AVAILABLE_EVENTS = [
  { category: 'Benutzer', events: ['user.created', 'user.updated', 'user.deleted'] },
  { category: 'Onboarding', events: ['onboarding.started', 'onboarding.completed', 'onboarding.step_completed'] },
  { category: 'Abwesenheit', events: ['absence.requested', 'absence.approved', 'absence.rejected', 'absence.cancelled'] },
  { category: 'Zeiterfassung', events: ['time.checked_in', 'time.checked_out', 'time.entry_created'] },
  { category: 'Projekte', events: ['project.created', 'project.completed', 'project.status_changed'] },
  { category: 'Aufgaben', events: ['task.created', 'task.completed', 'task.overdue'] },
  { category: 'Finanzen', events: ['invoice.created', 'invoice.approved', 'expense.submitted'] },
  { category: 'System', events: ['system.maintenance', 'system.error', 'system.backup_completed'] }
];

export function WebhooksTab() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [formData, setFormData] = useState<Partial<WebhookConfig>>({
    name: '',
    url: '',
    events: [],
    auth_type: 'none',
    auth_value: '',
    payload_format: 'json',
    retry_strategy: { max_retries: 3, delay_seconds: 60 },
    is_active: true
  });

  const { data: webhooks, isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WebhookConfig[];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (webhook: Partial<WebhookConfig>) => {
      if (webhook.id) {
        const { error } = await supabase
          .from('webhooks')
          .update(webhook)
          .eq('id', webhook.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('webhooks')
          .insert(webhook);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success("Webhook gespeichert");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Fehler beim Speichern");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success("Webhook gelöscht");
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      events: [],
      auth_type: 'none',
      auth_value: '',
      payload_format: 'json',
      retry_strategy: { max_retries: 3, delay_seconds: 60 },
      is_active: true
    });
    setEditingWebhook(null);
  };

  const openDialog = (webhook?: WebhookConfig) => {
    if (webhook) {
      setEditingWebhook(webhook);
      setFormData(webhook);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const toggleEvent = (event: string) => {
    const events = formData.events as string[] || [];
    const newEvents = events.includes(event)
      ? events.filter(e => e !== event)
      : [...events, event];
    setFormData({ ...formData, events: newEvents });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhooks & Events
              </CardTitle>
              <CardDescription>
                Konfigurieren Sie Event-basierte Benachrichtigungen an externe Systeme
              </CardDescription>
            </div>
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Webhook hinzufügen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {webhooks && webhooks.length > 0 ? (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${webhook.is_active ? 'bg-green-100 dark:bg-green-900' : 'bg-muted'}`}>
                      <Webhook className={`h-5 w-5 ${webhook.is_active ? 'text-green-600' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{webhook.name}</span>
                        <Badge variant={webhook.is_active ? 'default' : 'secondary'}>
                          {webhook.is_active ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate max-w-md">{webhook.url}</p>
                      <div className="flex gap-1 mt-1">
                        {(webhook.events as string[]).slice(0, 3).map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                        {(webhook.events as string[]).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(webhook.events as string[]).length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        {webhook.success_count}
                      </div>
                      <div className="flex items-center gap-1 text-red-600">
                        <XCircle className="h-3 w-3" />
                        {webhook.failure_count}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(webhook)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteMutation.mutate(webhook.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Webhooks konfiguriert</p>
              <Button variant="outline" className="mt-4" onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Ersten Webhook erstellen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Webhook Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingWebhook ? 'Webhook bearbeiten' : 'Neuen Webhook erstellen'}
            </DialogTitle>
            <DialogDescription>
              Konfigurieren Sie die Webhook-Einstellungen
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input 
                  placeholder="z.B. HR System Sync"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input 
                  placeholder="https://example.com/webhook"
                  value={formData.url || ''}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Authentifizierung</Label>
                <Select 
                  value={formData.auth_type || 'none'}
                  onValueChange={(value) => setFormData({...formData, auth_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Keine</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="hmac">HMAC Signature</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.auth_type !== 'none' && (
                <div className="space-y-2">
                  <Label>Auth-Wert</Label>
                  <Input 
                    type="password"
                    placeholder="Token oder Secret"
                    value={formData.auth_value || ''}
                    onChange={(e) => setFormData({...formData, auth_value: e.target.value})}
                  />
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Payload-Format</Label>
                <Select 
                  value={formData.payload_format || 'json'}
                  onValueChange={(value) => setFormData({...formData, payload_format: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="xml">XML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Webhook aktiv</Label>
                <Switch 
                  checked={formData.is_active ?? true}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Events auswählen</Label>
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-4">
                {AVAILABLE_EVENTS.map((category) => (
                  <div key={category.category}>
                    <h4 className="font-medium text-sm mb-2">{category.category}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {category.events.map((event) => (
                        <div key={event} className="flex items-center gap-2">
                          <Checkbox 
                            id={event}
                            checked={(formData.events as string[] || []).includes(event)}
                            onCheckedChange={() => toggleEvent(event)}
                          />
                          <label htmlFor={event} className="text-sm text-muted-foreground">
                            {event}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={() => saveMutation.mutate(formData)}
              disabled={!formData.name || !formData.url || !(formData.events as string[] || []).length}
            >
              {editingWebhook ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
