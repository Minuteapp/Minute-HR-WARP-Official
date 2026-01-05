
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, AlertTriangle, ArrowUp, Clock, Loader2 } from "lucide-react";

const TRIGGER_TYPES = [
  { id: 'no_response', name: 'Keine Reaktion', description: 'Eskalation wenn keine Reaktion erfolgt' },
  { id: 'deadline', name: 'Fristüberschreitung', description: 'Eskalation bei Fristüberschreitung' },
  { id: 'priority', name: 'Hohe Priorität', description: 'Sofortige Eskalation bei kritischen Events' },
  { id: 'error', name: 'Systemfehler', description: 'Eskalation bei technischen Problemen' },
];

const ESCALATION_ROLES = [
  { id: 'teamlead', name: 'Teamleiter' },
  { id: 'manager', name: 'Manager' },
  { id: 'hr', name: 'HR' },
  { id: 'admin', name: 'Admin' },
  { id: 'ceo', name: 'Geschäftsführung' },
];

const CHANNELS = ['email', 'push', 'sms', 'in-app'];

export default function EscalationsTab() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);

  const { data: rules, isLoading } = useQuery({
    queryKey: ['escalation-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('escalation_rules')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (rule: any) => {
      if (rule.id) {
        const { error } = await supabase
          .from('escalation_rules')
          .update(rule)
          .eq('id', rule.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('escalation_rules')
          .insert(rule);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalation-rules'] });
      toast.success('Eskalationsregel gespeichert');
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
        .from('escalation_rules')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalation-rules'] });
      toast.success('Eskalationsregel gelöscht');
    }
  });

  const openCreateDialog = () => {
    setEditingRule({
      name: '',
      description: '',
      trigger_type: 'no_response',
      trigger_threshold_hours: 24,
      escalation_levels: [
        { level: 1, role: 'teamlead', after_hours: 24 }
      ],
      max_level: 3,
      notification_channels: ['email'],
      is_active: true
    });
    setDialogOpen(true);
  };

  const addEscalationLevel = () => {
    if (editingRule && editingRule.escalation_levels.length < editingRule.max_level) {
      const lastLevel = editingRule.escalation_levels[editingRule.escalation_levels.length - 1];
      setEditingRule({
        ...editingRule,
        escalation_levels: [
          ...editingRule.escalation_levels,
          { 
            level: lastLevel.level + 1, 
            role: 'manager', 
            after_hours: lastLevel.after_hours + 24 
          }
        ]
      });
    }
  };

  const removeEscalationLevel = (index: number) => {
    if (editingRule && editingRule.escalation_levels.length > 1) {
      const newLevels = editingRule.escalation_levels.filter((_: any, i: number) => i !== index);
      setEditingRule({
        ...editingRule,
        escalation_levels: newLevels.map((level: any, i: number) => ({ ...level, level: i + 1 }))
      });
    }
  };

  const updateEscalationLevel = (index: number, field: string, value: any) => {
    const newLevels = [...editingRule.escalation_levels];
    newLevels[index] = { ...newLevels[index], [field]: value };
    setEditingRule({ ...editingRule, escalation_levels: newLevels });
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
              <CardTitle>Eskalationsregeln</CardTitle>
              <CardDescription>
                Definieren Sie Eskalationspfade für wichtige Ereignisse
              </CardDescription>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Neue Regel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rules?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Keine Eskalationsregeln definiert
              </p>
            ) : (
              rules?.map((rule) => (
                <Card key={rule.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`h-4 w-4 ${rule.is_active ? 'text-orange-500' : 'text-muted-foreground'}`} />
                          <h4 className="font-medium">{rule.name}</h4>
                          {!rule.is_active && (
                            <Badge variant="secondary">Inaktiv</Badge>
                          )}
                        </div>
                        {rule.description && (
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline">
                            {TRIGGER_TYPES.find(t => t.id === rule.trigger_type)?.name}
                          </Badge>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Nach {rule.trigger_threshold_hours}h
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <ArrowUp className="h-3 w-3" />
                            {(rule.escalation_levels as any[])?.length || 0} Stufen
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {((rule.escalation_levels as any[]) || []).map((level: any, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {level.level}. {ESCALATION_ROLES.find(r => r.id === level.role)?.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setEditingRule(rule);
                            setDialogOpen(true);
                          }}
                        >
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
              {editingRule?.id ? 'Eskalationsregel bearbeiten' : 'Neue Eskalationsregel'}
            </DialogTitle>
          </DialogHeader>
          
          {editingRule && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={editingRule.name}
                    onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                    placeholder="z.B. Keine Reaktion auf Genehmigung"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Trigger-Typ</Label>
                  <Select
                    value={editingRule.trigger_type}
                    onValueChange={(value) => setEditingRule({ ...editingRule, trigger_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIGGER_TYPES.map(type => (
                        <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Beschreibung</Label>
                <Textarea
                  value={editingRule.description || ''}
                  onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                  placeholder="Optionale Beschreibung..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Auslöser nach (Stunden)</Label>
                  <Input
                    type="number"
                    value={editingRule.trigger_threshold_hours}
                    onChange={(e) => setEditingRule({ ...editingRule, trigger_threshold_hours: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max. Eskalationsstufen</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={editingRule.max_level}
                    onChange={(e) => setEditingRule({ ...editingRule, max_level: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Eskalationsstufen</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={addEscalationLevel}
                    disabled={editingRule.escalation_levels.length >= editingRule.max_level}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Stufe hinzufügen
                  </Button>
                </div>
                <div className="space-y-2">
                  {editingRule.escalation_levels.map((level: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <Badge>{level.level}</Badge>
                          <Select
                            value={level.role}
                            onValueChange={(value) => updateEscalationLevel(index, 'role', value)}
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ESCALATION_ROLES.map(role => (
                                <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">Nach</Label>
                            <Input
                              type="number"
                              className="w-[80px]"
                              value={level.after_hours}
                              onChange={(e) => updateEscalationLevel(index, 'after_hours', parseInt(e.target.value) || 0)}
                            />
                            <Label className="text-sm">Stunden</Label>
                          </div>
                          {editingRule.escalation_levels.length > 1 && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeEscalationLevel(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                  disabled={!editingRule.name}
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
