
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Users, Shield, Settings, Loader2, Save } from "lucide-react";

const ROLES = [
  { id: 'employee', name: 'Mitarbeiter', description: 'Reguläre Mitarbeiter' },
  { id: 'teamlead', name: 'Teamleiter', description: 'Team- und Abteilungsleiter' },
  { id: 'hr', name: 'HR', description: 'Personalabteilung' },
  { id: 'finance', name: 'Finance', description: 'Finanzabteilung' },
  { id: 'admin', name: 'Admin', description: 'Systemadministratoren' },
  { id: 'superadmin', name: 'Superadmin', description: 'Globale Administratoren' },
];

const EVENT_CATEGORIES = [
  { id: 'tasks', name: 'Aufgaben' },
  { id: 'absence', name: 'Abwesenheit' },
  { id: 'time', name: 'Zeiterfassung' },
  { id: 'projects', name: 'Projekte' },
  { id: 'hr', name: 'HR' },
  { id: 'finance', name: 'Finanzen' },
  { id: 'system', name: 'System' },
];

const CONTENT_LEVELS = [
  { id: 'minimal', name: 'Minimal', description: 'Nur wichtigste Infos' },
  { id: 'summary', name: 'Zusammenfassung', description: 'Kurze Übersicht' },
  { id: 'detailed', name: 'Detailliert', description: 'Alle relevanten Informationen' },
];

const CHANNELS = ['in-app', 'email', 'push', 'sms', 'slack', 'teams'];

export default function RoleContextTab() {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string>('employee');

  const { data: roleConfigs, isLoading } = useQuery({
    queryKey: ['notification-role-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_role_config')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (config: any) => {
      const { data: existing } = await supabase
        .from('notification_role_config')
        .select('id')
        .eq('role', config.role)
        .eq('event_category', config.event_category)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('notification_role_config')
          .update(config)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notification_role_config')
          .insert(config);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-role-config'] });
      toast.success('Konfiguration gespeichert');
    },
    onError: () => {
      toast.error('Fehler beim Speichern');
    }
  });

  const getRoleConfig = (role: string, category: string) => {
    return roleConfigs?.find(c => c.role === role && c.event_category === category) || {
      role,
      event_category: category,
      content_level: 'detailed',
      summary_enabled: false,
      summary_frequency: 'daily',
      allowed_channels: ['in-app', 'email'],
      can_customize: true
    };
  };

  const handleConfigChange = (category: string, field: string, value: any) => {
    const config = getRoleConfig(selectedRole, category);
    saveMutation.mutate({
      ...config,
      [field]: value
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const selectedRoleData = ROLES.find(r => r.id === selectedRole);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rollen- & Kontextsteuerung</CardTitle>
          <CardDescription>
            Unterschiedliche Benachrichtigungsinhalte und -kanäle je nach Rolle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2 mb-6">
            {ROLES.map(role => (
              <Button
                key={role.id}
                variant={selectedRole === role.id ? 'default' : 'outline'}
                className="flex flex-col h-auto py-3"
                onClick={() => setSelectedRole(role.id)}
              >
                <Shield className="h-5 w-5 mb-1" />
                <span className="text-xs">{role.name}</span>
              </Button>
            ))}
          </div>

          {selectedRoleData && (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-medium">{selectedRoleData.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{selectedRoleData.description}</p>
            </div>
          )}

          <div className="space-y-4">
            {EVENT_CATEGORIES.map(category => {
              const config = getRoleConfig(selectedRole, category.id);
              
              return (
                <Card key={category.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Benachrichtigungseinstellungen für {category.name}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {CONTENT_LEVELS.find(l => l.id === config.content_level)?.name}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Detailgrad</Label>
                        <Select
                          value={config.content_level}
                          onValueChange={(value) => handleConfigChange(category.id, 'content_level', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CONTENT_LEVELS.map(level => (
                              <SelectItem key={level.id} value={level.id}>
                                {level.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Erlaubte Kanäle</Label>
                        <div className="flex flex-wrap gap-2">
                          {CHANNELS.map(channel => (
                            <div key={channel} className="flex items-center gap-1">
                              <Checkbox
                                checked={(config.allowed_channels || []).includes(channel)}
                                onCheckedChange={(checked) => {
                                  const channels = config.allowed_channels || [];
                                  handleConfigChange(
                                    category.id, 
                                    'allowed_channels',
                                    checked 
                                      ? [...channels, channel]
                                      : channels.filter((c: string) => c !== channel)
                                  );
                                }}
                              />
                              <Label className="text-xs font-normal">{channel}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={config.summary_enabled}
                            onCheckedChange={(checked) => handleConfigChange(category.id, 'summary_enabled', checked)}
                          />
                          <Label>Zusammenfassung aktivieren</Label>
                        </div>

                        {config.summary_enabled && (
                          <Select
                            value={config.summary_frequency}
                            onValueChange={(value) => handleConfigChange(category.id, 'summary_frequency', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hourly">Stündlich</SelectItem>
                              <SelectItem value="daily">Täglich</SelectItem>
                              <SelectItem value="weekly">Wöchentlich</SelectItem>
                            </SelectContent>
                          </Select>
                        )}

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={config.can_customize}
                            onCheckedChange={(checked) => handleConfigChange(category.id, 'can_customize', checked)}
                          />
                          <Label>User kann anpassen</Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
