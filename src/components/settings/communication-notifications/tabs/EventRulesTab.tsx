
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Bell, Clock, Users, Loader2 } from "lucide-react";

const EVENT_CATEGORIES = [
  { id: 'tasks', name: 'Aufgaben', events: ['task.created', 'task.due', 'task.overdue', 'task.completed'] },
  { id: 'absence', name: 'Abwesenheit', events: ['absence.requested', 'absence.approved', 'absence.rejected'] },
  { id: 'time', name: 'Zeiterfassung', events: ['time.missing', 'time.overtime', 'time.reminder'] },
  { id: 'projects', name: 'Projekte', events: ['project.created', 'project.status_changed', 'project.completed'] },
  { id: 'shifts', name: 'Schichtplanung', events: ['shift.assigned', 'shift.changed', 'shift.reminder'] },
  { id: 'system', name: 'System', events: ['system.maintenance', 'system.error', 'system.update'] },
  { id: 'hr', name: 'HR', events: ['employee.onboarded', 'employee.birthday', 'contract.expiring'] },
];

const CHANNELS = ['in-app', 'email', 'push', 'sms', 'slack', 'teams'];
const RECIPIENT_TYPES = [
  { id: 'user', name: 'Betroffener Benutzer' },
  { id: 'manager', name: 'Vorgesetzter' },
  { id: 'team', name: 'Ganzes Team' },
  { id: 'hr', name: 'HR-Abteilung' },
  { id: 'admin', name: 'Administratoren' },
];

export default function EventRulesTab() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: rules, isLoading } = useQuery({
    queryKey: ['notification-event-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_event_rules')
        .select('*')
        .order('event_category', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (rule: any) => {
      if (rule.id) {
        const { error } = await supabase
          .from('notification_event_rules')
          .update(rule)
          .eq('id', rule.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notification_event_rules')
          .insert(rule);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-event-rules'] });
      toast.success('Regel gespeichert');
      setDialogOpen(false);
      setEditingRule(null);
    },
    onError: () => {
      toast.error('Fehler beim Speichern');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notification_event_rules')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-event-rules'] });
      toast.success('Regel gelöscht');
    }
  });

  const filteredRules = rules?.filter(r => 
    selectedCategory === 'all' || r.event_category === selectedCategory
  ) || [];

  const openEditDialog = (rule: any) => {
    setEditingRule(rule);
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingRule({
      event_type: '',
      event_category: 'tasks',
      event_name: '',
      recipients: [],
      channels: ['in-app'],
      timing: 'immediate',
      batch_interval_minutes: null,
      escalation_enabled: false,
      is_active: true
    });
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Benachrichtigungs-Regeln</CardTitle>
              <CardDescription>
                Definieren Sie, welche Events welche Benachrichtigungen auslösen
              </CardDescription>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Neue Regel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Kategorie filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {EVENT_CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filteredRules.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Keine Regeln definiert
              </p>
            ) : (
              filteredRules.map((rule) => (
                <Card key={rule.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-primary" />
                          <h4 className="font-medium">{rule.event_name}</h4>
                          {!rule.is_active && (
                            <Badge variant="secondary">Inaktiv</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{rule.event_type}</Badge>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {rule.timing === 'immediate' ? 'Sofort' : 
                             rule.timing === 'batched' ? `Gesammelt (${rule.batch_interval_minutes} Min)` : 
                             'Geplant'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {(rule.recipients as any[])?.length || 0} Empfänger
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {(rule.channels || []).map((channel: string) => (
                            <Badge key={channel} variant="secondary" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(rule)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            if (confirm('Regel wirklich löschen?')) {
                              deleteMutation.mutate(rule.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRule?.id ? 'Regel bearbeiten' : 'Neue Regel erstellen'}
            </DialogTitle>
          </DialogHeader>
          
          {editingRule && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategorie</Label>
                  <Select
                    value={editingRule.event_category}
                    onValueChange={(value) => setEditingRule({ ...editingRule, event_category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_CATEGORIES.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Event-Typ</Label>
                  <Select
                    value={editingRule.event_type}
                    onValueChange={(value) => setEditingRule({ ...editingRule, event_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Event auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_CATEGORIES.find(c => c.id === editingRule.event_category)?.events.map(event => (
                        <SelectItem key={event} value={event}>{event}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Regelname</Label>
                <Input
                  value={editingRule.event_name}
                  onChange={(e) => setEditingRule({ ...editingRule, event_name: e.target.value })}
                  placeholder="z.B. Aufgabe fällig - Erinnerung"
                />
              </div>

              <div className="space-y-2">
                <Label>Empfänger</Label>
                <div className="grid grid-cols-2 gap-2">
                  {RECIPIENT_TYPES.map(type => (
                    <div key={type.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={(editingRule.recipients || []).includes(type.id)}
                        onCheckedChange={(checked) => {
                          const recipients = editingRule.recipients || [];
                          setEditingRule({
                            ...editingRule,
                            recipients: checked 
                              ? [...recipients, type.id]
                              : recipients.filter((r: string) => r !== type.id)
                          });
                        }}
                      />
                      <Label className="font-normal">{type.name}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Kanäle</Label>
                <div className="flex flex-wrap gap-2">
                  {CHANNELS.map(channel => (
                    <div key={channel} className="flex items-center gap-2">
                      <Checkbox
                        checked={(editingRule.channels || []).includes(channel)}
                        onCheckedChange={(checked) => {
                          const channels = editingRule.channels || [];
                          setEditingRule({
                            ...editingRule,
                            channels: checked 
                              ? [...channels, channel]
                              : channels.filter((c: string) => c !== channel)
                          });
                        }}
                      />
                      <Label className="font-normal">{channel}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Timing</Label>
                  <Select
                    value={editingRule.timing}
                    onValueChange={(value) => setEditingRule({ ...editingRule, timing: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Sofort</SelectItem>
                      <SelectItem value="batched">Gesammelt</SelectItem>
                      <SelectItem value="scheduled">Geplant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editingRule.timing === 'batched' && (
                  <div className="space-y-2">
                    <Label>Sammelintervall (Minuten)</Label>
                    <Input
                      type="number"
                      value={editingRule.batch_interval_minutes || ''}
                      onChange={(e) => setEditingRule({ 
                        ...editingRule, 
                        batch_interval_minutes: e.target.value ? parseInt(e.target.value) : null 
                      })}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={editingRule.escalation_enabled}
                  onCheckedChange={(checked) => setEditingRule({ ...editingRule, escalation_enabled: checked })}
                />
                <Label>Eskalation aktivieren</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={editingRule.is_active}
                  onCheckedChange={(checked) => setEditingRule({ ...editingRule, is_active: checked })}
                />
                <Label>Regel aktiv</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button 
                  onClick={() => saveMutation.mutate(editingRule)}
                  disabled={!editingRule.event_type || !editingRule.event_name}
                >
                  Speichern
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
