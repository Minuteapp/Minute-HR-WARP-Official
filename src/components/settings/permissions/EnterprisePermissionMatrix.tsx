import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Shield,
  Users,
  Settings,
  Search,
  Filter,
  Save,
  Download,
  Upload,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  RotateCcw,
  PlaySquare,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types basierend auf dem Blueprint
interface PermissionModule {
  id: string;
  name: string;
  module_key: string;
  description: string;
  is_active: boolean;
}

interface RolePermission {
  id: string;
  role: string;
  module_name: string;
  is_visible: boolean;
  allowed_actions: string[];
  visible_fields: Record<string, any>;
  editable_fields: Record<string, any>;
  allowed_notifications: string[];
  workflow_triggers: string[];
  conditions: Record<string, any>;
  metadata: Record<string, any>;
}

// Alle verfügbaren Aktionen aus dem Blueprint
const AVAILABLE_ACTIONS = [
  'view', 'create', 'edit', 'delete', 'approve', 'export', 'archive',
  'sign', 'upload', 'download', 'notify', 'correct', 'simulate',
  'test', 'activate', 'manage'
];

const AVAILABLE_NOTIFICATIONS = ['push', 'email', 'sms', 'slack', 'teams'];

const AVAILABLE_ROLES = ['superadmin', 'admin', 'manager', 'hr', 'employee'];

export const EnterprisePermissionMatrix = () => {
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState<string>('');
  const [editingPermission, setEditingPermission] = useState<RolePermission | null>(null);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [simulationRole, setSimulationRole] = useState<string>('');

  const queryClient = useQueryClient();

  // Lade Module
  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ['permission-modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permission_modules')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as PermissionModule[];
    }
  });

  // Lade Rechtematrix mit korrigierter Tabelle
  const { data: permissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ['role-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*, permission_modules(name, module_key)')
        .order('role, module_id');
      
      if (error) throw error;
      return data as any[];
    }
  });

  // Update Permission Mutation mit korrigierter Tabelle
  const updatePermissionMutation = useMutation({
    mutationFn: async (permission: any) => {
      const { data, error } = await supabase
        .from('role_permissions')
        .upsert(permission)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      toast.success('Berechtigung erfolgreich aktualisiert');
    },
    onError: (error) => {
      toast.error('Fehler beim Aktualisieren der Berechtigung');
      console.error(error);
    }
  });

  // Bulk Update Mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ 
      role, 
      modules, 
      action, 
      value 
    }: { 
      role: string; 
      modules: string[]; 
      action: string; 
      value: boolean 
    }) => {
      const updates = modules.map(moduleName => {
        const existing = permissions.find(p => p.role === role && p.module_name === moduleName);
        const currentActions = existing?.allowed_actions || [];
        
        let newActions = [...currentActions];
        if (value && !newActions.includes(action)) {
          newActions.push(action);
        } else if (!value) {
          newActions = newActions.filter(a => a !== action);
        }

        return {
          role,
          module_name: moduleName,
          is_visible: existing?.is_visible || false,
          allowed_actions: newActions,
          visible_fields: existing?.visible_fields || {},
          editable_fields: existing?.editable_fields || {},
          allowed_notifications: existing?.allowed_notifications || [],
          workflow_triggers: existing?.workflow_triggers || [],
          conditions: existing?.conditions || {},
          metadata: existing?.metadata || {}
        };
      });

      const { error } = await supabase
        .from('role_permissions')
        .upsert(updates);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      toast.success('Massenaktualisierung erfolgreich');
    }
  });

  // Filtered data
  const filteredModules = modules.filter(module => 
    module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPermissionForRoleAndModule = (role: string, moduleName: string) => {
    return permissions.find(p => p.role === role && p.module_name === moduleName);
  };

  const hasAction = (role: string, moduleName: string, action: string) => {
    const permission = getPermissionForRoleAndModule(role, moduleName);
    return permission?.allowed_actions?.includes(action) || false;
  };

  const toggleAction = (role: string, moduleName: string, action: string) => {
    const permission = getPermissionForRoleAndModule(role, moduleName);
    const currentActions = permission?.allowed_actions || [];
    
    let newActions = [...currentActions];
    if (newActions.includes(action)) {
      newActions = newActions.filter(a => a !== action);
    } else {
      newActions.push(action);
    }

    updatePermissionMutation.mutate({
      id: permission?.id,
      role,
      module_name: moduleName,
      is_visible: permission?.is_visible || true,
      allowed_actions: newActions,
      visible_fields: permission?.visible_fields || {},
      editable_fields: permission?.editable_fields || {},
      allowed_notifications: permission?.allowed_notifications || [],
      workflow_triggers: permission?.workflow_triggers || [],
      conditions: permission?.conditions || {},
      metadata: permission?.metadata || {}
    });
  };

  const toggleVisibility = (role: string, moduleName: string) => {
    const permission = getPermissionForRoleAndModule(role, moduleName);
    
    updatePermissionMutation.mutate({
      id: permission?.id,
      role,
      module_name: moduleName,
      is_visible: !permission?.is_visible,
      allowed_actions: permission?.allowed_actions || [],
      visible_fields: permission?.visible_fields || {},
      editable_fields: permission?.editable_fields || {},
      allowed_notifications: permission?.allowed_notifications || [],
      workflow_triggers: permission?.workflow_triggers || [],
      conditions: permission?.conditions || {},
      metadata: permission?.metadata || {}
    });
  };

  if (modulesLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Lade Rechtematrix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Enterprise Rechtematrix</h1>
            <p className="text-muted-foreground">
              Granulare Berechtigungsverwaltung für alle Module und Rollen
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <PlaySquare className="h-4 w-4" />
                Simulation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rollen-Simulation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Rolle auswählen</Label>
                  <Select value={simulationRole} onValueChange={setSimulationRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Rolle für Simulation..." />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_ROLES.map(role => (
                        <SelectItem key={role} value={role}>
                          {role.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-muted-foreground">
                  Simuliert die Ansicht und Berechtigungen der ausgewählten Rolle
                </p>
              </div>
              <DialogFooter>
                <Button onClick={() => toast.success('Simulation würde hier starten')}>
                  Simulation starten
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Button size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            Alle speichern
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Role Selection */}
            <div className="flex items-center gap-2">
              <Label>Rolle:</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ROLES.map(role => (
                    <SelectItem key={role} value={role}>
                      {role.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Module durchsuchen..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Bulk Edit Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                checked={bulkEditMode}
                onCheckedChange={setBulkEditMode}
              />
              <Label>Massenbearbeitung</Label>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Erlaubt</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Verweigert</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-300 rounded"></div>
                <span>Nicht konfiguriert</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permission Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Berechtigungsmatrix - {selectedRole.toUpperCase()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredModules.map((module) => {
                const permission = getPermissionForRoleAndModule(selectedRole, module.name);
                
                return (
                  <Card key={module.id} className="border-l-4 border-l-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={permission?.is_visible || false}
                            onCheckedChange={() => toggleVisibility(selectedRole, module.name)}
                          />
                          <div>
                            <h3 className="font-semibold">{module.name}</h3>
                            <p className="text-sm text-muted-foreground">{module.description}</p>
                          </div>
                        </div>

                        <Badge 
                          variant={permission?.is_visible ? "default" : "secondary"}
                          className="gap-1"
                        >
                          {permission?.is_visible ? (
                            <><Eye className="h-3 w-3" /> Sichtbar</>
                          ) : (
                            <><EyeOff className="h-3 w-3" /> Versteckt</>
                          )}
                        </Badge>
                      </div>

                      {/* Actions Grid */}
                      {permission?.is_visible && (
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">Aktionen</Label>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mt-2">
                              {AVAILABLE_ACTIONS.map((action) => {
                                const isActive = hasAction(selectedRole, module.name, action);
                                return (
                                  <Button
                                    key={action}
                                    variant={isActive ? "default" : "outline"}
                                    size="sm"
                                    className={`text-xs ${
                                      isActive 
                                        ? "bg-green-600 hover:bg-green-700" 
                                        : "border-gray-300 hover:border-primary"
                                    }`}
                                    onClick={() => toggleAction(selectedRole, module.name, action)}
                                  >
                                    {action}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Benachrichtigungen</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {AVAILABLE_NOTIFICATIONS.map((notif) => {
                                const isActive = permission?.allowed_notifications?.includes(notif);
                                return (
                                  <Badge
                                    key={notif}
                                    variant={isActive ? "default" : "outline"}
                                    className={`cursor-pointer ${
                                      isActive ? "bg-blue-600" : "border-gray-300"
                                    }`}
                                    onClick={() => {
                                      const current = permission?.allowed_notifications || [];
                                      const updated = isActive 
                                        ? current.filter(n => n !== notif)
                                        : [...current, notif];
                                      
                                      updatePermissionMutation.mutate({
                                        ...permission,
                                        role: selectedRole,
                                        module_name: module.name,
                                        allowed_notifications: updated
                                      });
                                    }}
                                  >
                                    {notif}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>

                          {/* Advanced Settings Button */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="gap-2">
                                <Settings className="h-4 w-4" />
                                Erweiterte Einstellungen
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>
                                  Erweiterte Berechtigungen - {module.name}
                                </DialogTitle>
                              </DialogHeader>
                              
                              <Tabs defaultValue="fields">
                                <TabsList>
                                  <TabsTrigger value="fields">Sichtbare Felder</TabsTrigger>
                                  <TabsTrigger value="editable">Bearbeitbare Felder</TabsTrigger>
                                  <TabsTrigger value="triggers">Workflow-Trigger</TabsTrigger>
                                  <TabsTrigger value="conditions">Bedingungen</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="fields" className="space-y-4">
                                  <Label>Sichtbare Felder (JSON)</Label>
                                  <Textarea
                                    className="font-mono text-sm"
                                    rows={8}
                                    value={JSON.stringify(permission?.visible_fields || {}, null, 2)}
                                    onChange={(e) => {
                                      try {
                                        const parsed = JSON.parse(e.target.value);
                                        // Update permission with new visible_fields
                                      } catch (err) {
                                        // Handle JSON parsing error
                                      }
                                    }}
                                  />
                                </TabsContent>
                                
                                <TabsContent value="editable" className="space-y-4">
                                  <Label>Bearbeitbare Felder (JSON)</Label>
                                  <Textarea
                                    className="font-mono text-sm"
                                    rows={8}
                                    value={JSON.stringify(permission?.editable_fields || {}, null, 2)}
                                  />
                                </TabsContent>
                                
                                <TabsContent value="triggers" className="space-y-4">
                                  <Label>Workflow-Trigger</Label>
                                  <div className="space-y-2">
                                    {(permission?.workflow_triggers || []).map((trigger, index) => (
                                      <Badge key={index} variant="outline">
                                        {trigger}
                                      </Badge>
                                    ))}
                                  </div>
                                </TabsContent>
                                
                                <TabsContent value="conditions" className="space-y-4">
                                  <Label>Bedingungen (JSON)</Label>
                                  <Textarea
                                    className="font-mono text-sm"
                                    rows={6}
                                    value={JSON.stringify(permission?.conditions || {}, null, 2)}
                                  />
                                </TabsContent>
                              </Tabs>
                              
                              <DialogFooter>
                                <Button>Speichern</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {permissions.filter(p => p.is_visible).length}
              </div>
              <div className="text-sm text-muted-foreground">Sichtbare Module</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {permissions.reduce((acc, p) => acc + (p.allowed_actions?.length || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Aktive Aktionen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {modules.length}
              </div>
              <div className="text-sm text-muted-foreground">Module insgesamt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {AVAILABLE_ROLES.length}
              </div>
              <div className="text-sm text-muted-foreground">Rollen</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};