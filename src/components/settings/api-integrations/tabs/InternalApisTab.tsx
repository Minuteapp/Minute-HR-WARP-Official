import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Server, 
  Users, 
  Clock, 
  Calendar, 
  CheckSquare, 
  FolderKanban,
  CalendarClock,
  Wallet,
  Receipt,
  Shield,
  LayoutDashboard,
  Brain,
  Settings,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ModuleApi {
  id: string;
  module_name: string;
  enabled: boolean;
  allowed_actions: string[];
  data_scope: string;
  allowed_roles: string[];
}

const MODULES = [
  { key: 'employees', label: 'Mitarbeiter', icon: Users, description: 'Mitarbeiterdaten & Profile' },
  { key: 'time_tracking', label: 'Zeiterfassung', icon: Clock, description: 'Arbeitszeiten & Stempelungen' },
  { key: 'absence', label: 'Abwesenheit', icon: Calendar, description: 'Urlaub & Krankmeldungen' },
  { key: 'tasks', label: 'Aufgaben', icon: CheckSquare, description: 'Aufgabenmanagement' },
  { key: 'projects', label: 'Projekte', icon: FolderKanban, description: 'Projektverwaltung' },
  { key: 'shift_planning', label: 'Schichtplanung', icon: CalendarClock, description: 'Dienstpläne & Schichten' },
  { key: 'payroll', label: 'Lohn & Gehalt', icon: Wallet, description: 'Gehaltsabrechnungen' },
  { key: 'expenses', label: 'Ausgaben', icon: Receipt, description: 'Spesen & Reisekosten' },
  { key: 'compliance', label: 'Compliance', icon: Shield, description: 'Richtlinien & Audits' },
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Analytics & Reports' },
  { key: 'ai_services', label: 'KI-Services', icon: Brain, description: 'KI-gestützte Funktionen' },
  { key: 'settings', label: 'Einstellungen', icon: Settings, description: 'Systemkonfiguration' }
];

const ROLES = ['admin', 'hr', 'manager', 'team_lead', 'employee'];
const ACTIONS = ['read', 'write', 'delete'];
const SCOPES = [
  { value: 'own', label: 'Eigene Daten' },
  { value: 'team', label: 'Team' },
  { value: 'location', label: 'Standort' },
  { value: 'company', label: 'Unternehmen' }
];

export function InternalApisTab() {
  const queryClient = useQueryClient();
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const { data: moduleSettings, isLoading } = useQuery({
    queryKey: ['api-module-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_module_settings')
        .select('*');
      
      if (error) throw error;
      return data as ModuleApi[];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (module: Partial<ModuleApi>) => {
      const existing = moduleSettings?.find(m => m.module_name === module.module_name);
      
      if (existing) {
        const { error } = await supabase
          .from('api_module_settings')
          .update(module)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('api_module_settings')
          .insert(module);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-module-settings'] });
      toast.success("Modul-Einstellungen gespeichert");
    },
    onError: () => {
      toast.error("Fehler beim Speichern");
    }
  });

  const getModuleSettings = (moduleName: string): Partial<ModuleApi> => {
    return moduleSettings?.find(m => m.module_name === moduleName) || {
      module_name: moduleName,
      enabled: false,
      allowed_actions: ['read'],
      data_scope: 'own',
      allowed_roles: []
    };
  };

  const updateModule = (moduleName: string, updates: Partial<ModuleApi>) => {
    const current = getModuleSettings(moduleName);
    saveMutation.mutate({ ...current, ...updates, module_name: moduleName });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Interne Minute HR APIs
          </CardTitle>
          <CardDescription>
            Konfigurieren Sie API-Zugriff für jedes Modul einzeln
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {MODULES.map((module) => {
            const settings = getModuleSettings(module.key);
            const isExpanded = expandedModule === module.key;
            const Icon = module.icon;

            return (
              <Collapsible 
                key={module.key}
                open={isExpanded}
                onOpenChange={() => setExpandedModule(isExpanded ? null : module.key)}
              >
                <div className="border rounded-lg">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${settings.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Icon className={`h-5 w-5 ${settings.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{module.label}</span>
                          {settings.enabled && (
                            <Badge variant="secondary" className="text-xs">
                              {(settings.allowed_actions as string[] || []).join(', ')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Switch 
                        checked={settings.enabled}
                        onCheckedChange={(checked) => updateModule(module.key, { enabled: checked })}
                      />
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>

                  <CollapsibleContent>
                    <div className="px-4 pb-4 pt-2 border-t bg-muted/50 space-y-4">
                      {/* Erlaubte Aktionen */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Erlaubte Aktionen</label>
                        <div className="flex gap-4">
                          {ACTIONS.map((action) => (
                            <div key={action} className="flex items-center gap-2">
                              <Checkbox 
                                id={`${module.key}-${action}`}
                                checked={(settings.allowed_actions as string[] || []).includes(action)}
                                onCheckedChange={(checked) => {
                                  const actions = settings.allowed_actions as string[] || [];
                                  const newActions = checked 
                                    ? [...actions, action]
                                    : actions.filter(a => a !== action);
                                  updateModule(module.key, { allowed_actions: newActions });
                                }}
                              />
                              <label htmlFor={`${module.key}-${action}`} className="text-sm capitalize">
                                {action === 'read' ? 'Lesen' : action === 'write' ? 'Schreiben' : 'Löschen'}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Datenumfang */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Datenumfang</label>
                        <Select 
                          value={settings.data_scope || 'own'}
                          onValueChange={(value) => updateModule(module.key, { data_scope: value })}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SCOPES.map((scope) => (
                              <SelectItem key={scope.value} value={scope.value}>
                                {scope.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Rollenbindung */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Erlaubte Rollen</label>
                        <div className="flex flex-wrap gap-2">
                          {ROLES.map((role) => (
                            <div key={role} className="flex items-center gap-2">
                              <Checkbox 
                                id={`${module.key}-role-${role}`}
                                checked={(settings.allowed_roles as string[] || []).includes(role)}
                                onCheckedChange={(checked) => {
                                  const roles = settings.allowed_roles as string[] || [];
                                  const newRoles = checked 
                                    ? [...roles, role]
                                    : roles.filter(r => r !== role);
                                  updateModule(module.key, { allowed_roles: newRoles });
                                }}
                              />
                              <label htmlFor={`${module.key}-role-${role}`} className="text-sm capitalize">
                                {role.replace('_', ' ')}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
