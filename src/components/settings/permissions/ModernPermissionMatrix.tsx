import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Users, 
  Search, 
  Eye, 
  EyeOff, 
  Save, 
  Download, 
  Clock,
  Bell,
  AlertTriangle,
  CheckCircle,
  Mail,
  MessageSquare,
  Phone,
  Settings
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DEFAULT_PERMISSION_MODULES } from '@/types/granular-permissions';

const AVAILABLE_ACTIONS = ['view', 'create', 'edit', 'delete', 'approve', 'export', 'assign', 'comment', 'trigger', 'audit'];
const AVAILABLE_ROLES = ['superadmin', 'admin', 'hr', 'manager', 'employee', 'finance', 'ai_team'];

// Modulspezifische Aktionen
const MODULE_SPECIFIC_ACTIONS = {
  'Dashboard': ['view'],
  'Zeiterfassung': ['view', 'create', 'edit', 'approve', 'export'],
  'Abwesenheit': ['view', 'create', 'edit', 'approve', 'export'],
  'Aufgaben': ['view', 'create', 'edit', 'delete', 'export'],
  'Projekte': ['view', 'create', 'edit', 'delete', 'export'],
  'Dokumente': ['view', 'upload', 'download', 'delete', 'export'],
  'Mitarbeiter': ['view', 'create', 'edit', 'delete', 'export'],
  'Lohn & Gehalt': ['view', 'create', 'edit', 'export'],
  'Recruiting': ['view', 'create', 'edit', 'delete', 'export'],
  'Performance': ['view', 'create', 'edit', 'approve', 'export'],
  'Einstellungen': ['view', 'edit'],
  // Sub-Module Einstellungen
  'Benutzereinstellungen': ['view', 'create', 'edit', 'delete', 'reset'],
  'Systemeinstellungen': ['view', 'edit', 'backup', 'restore'],
  'Sicherheitseinstellungen': ['view', 'edit', 'audit'],
  'Firmeneinstellungen': ['view', 'edit', 'upload'],
  'Benachrichtigungseinstellungen': ['view', 'edit', 'test'],
  'Integrationseinstellungen': ['view', 'create', 'edit', 'delete', 'test'],
  'Backup & Export': ['view', 'backup', 'restore', 'export']
};

export const ModernPermissionMatrix = () => {
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [searchQuery, setSearchQuery] = useState('');
  
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
      return data;
    }
  });

  // Lade Berechtigungen
  const { data: permissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ['role-permissions', selectedRole],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permission_matrix')
        .select('*')
        .eq('role', selectedRole);
      
      if (error) throw error;
      return data;
    }
  });

  // Update Permission Mutation
  const updatePermissionMutation = useMutation({
    mutationFn: async ({ moduleName, action, isGranted }: { 
      moduleName: string; 
      action: string; 
      isGranted: boolean; 
    }) => {
      // Finde die existierende Berechtigung
      const existingPermission = permissions.find(p => p.module_name === moduleName);
      
      if (existingPermission) {
        // Aktualisiere die allowed_actions Array
        const currentActions = existingPermission.allowed_actions || [];
        let newActions;
        
        if (isGranted) {
          // Aktion hinzufügen falls nicht vorhanden
          newActions = [...new Set([...currentActions, action])];
        } else {
          // Aktion entfernen
          newActions = currentActions.filter(a => a !== action);
        }
        
        const { data, error } = await supabase
          .from('role_permission_matrix')
          .update({
            allowed_actions: newActions
          })
          .eq('id', existingPermission.id);
        
        if (error) throw error;
        return data;
      } else {
        // Erstelle neue Berechtigung
        const { data, error } = await supabase
          .from('role_permission_matrix')
          .insert({
            role: selectedRole,
            module_name: moduleName,
            is_visible: true,
            allowed_actions: isGranted ? [action] : [],
            visible_fields: { all: true },
            editable_fields: { all: true },
            allowed_notifications: [],
            workflow_triggers: []
          });
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      toast.success('Berechtigung aktualisiert');
    },
    onError: (error) => {
      toast.error('Fehler beim Aktualisieren');
      console.error(error);
    }
  });

  // Update Module Visibility Mutation
  const updateModuleVisibility = async (moduleName: string, isVisible: boolean) => {
    const existingPermission = permissions.find(p => p.module_name === moduleName);
    
    if (existingPermission) {
      const { error } = await supabase
        .from('role_permission_matrix')
        .update({ is_visible: isVisible })
        .eq('id', existingPermission.id);
      
      if (error) {
        toast.error('Fehler beim Aktualisieren der Sichtbarkeit');
        console.error(error);
      } else {
        queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
        toast.success(`Modul ${isVisible ? 'sichtbar' : 'versteckt'}`);
      }
    } else {
      // Erstelle neue Berechtigung wenn noch keine existiert
      const { error } = await supabase
        .from('role_permission_matrix')
        .insert({
          role: selectedRole,
          module_name: moduleName,
          is_visible: isVisible,
          allowed_actions: [],
          visible_fields: {},
          editable_fields: {},
          allowed_notifications: [],
          workflow_triggers: []
        });
      
      if (error) {
        toast.error('Fehler beim Erstellen der Berechtigung');
        console.error(error);
      } else {
        queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
        toast.success(`Modul ${isVisible ? 'sichtbar' : 'versteckt'}`);
      }
    }
  };

  const getModuleActions = (moduleName: string) => {
    return MODULE_SPECIFIC_ACTIONS[moduleName] || AVAILABLE_ACTIONS;
  };

  const filteredModules = modules.filter(module => 
    module.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    module.is_active !== false
  );

  const hasPermission = (moduleName: string, action: string): boolean => {
    const permission = permissions.find(p => p.module_name === moduleName);
    return permission?.allowed_actions?.includes(action) || false;
  };

  const togglePermission = (moduleName: string, action: string) => {
    const currentValue = hasPermission(moduleName, action);
    updatePermissionMutation.mutate({
      moduleName,
      action,
      isGranted: !currentValue
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

  // Export JSON Configuration
  const exportConfiguration = () => {
    const config = {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      selectedRole,
      modules: DEFAULT_PERMISSION_MODULES,
      currentPermissions: permissions
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `permissions-${selectedRole}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Konfiguration exportiert');
  };

  // Get granular field access
  const getFieldAccess = (moduleName: string, fieldType: 'visible' | 'editable') => {
    const module = DEFAULT_PERMISSION_MODULES.find(m => m.module === moduleName);
    if (!module) return [];
    
    const submodule = module.submodules[0]; // Vereinfacht für Demo
    if (!submodule) return [];
    
    const fields = fieldType === 'visible' 
      ? submodule.visibleFields[selectedRole] || []
      : submodule.editableFields[selectedRole] || [];
    
    return fields.includes('*') ? ['Alle Felder'] : fields;
  };

  // Get notification settings
  const getNotificationSettings = (moduleName: string) => {
    const module = DEFAULT_PERMISSION_MODULES.find(m => m.module === moduleName);
    if (!module) return {};
    
    const submodule = module.submodules[0]; // Vereinfacht für Demo
    return submodule?.notifications || {};
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Enterprise Rechtematrix</h1>
            <p className="text-muted-foreground">
              Ultra-granulare Berechtigungsverwaltung mit vollständiger Kontrolle
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportConfiguration} className="gap-2">
            <Download className="h-4 w-4" />
            Export JSON
          </Button>
          <Button size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            Speichern
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
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

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Module durchsuchen..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Erlaubt</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Verweigert</span>
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
          <div className="space-y-4">
            {filteredModules.map((module) => {
              const modulePermission = permissions.find(p => p.module_name === module.name);
              const isModuleVisible = modulePermission?.is_visible !== false;
              
              return (
                <Card key={module.id} className={`border-l-4 ${
                  isModuleVisible 
                    ? 'border-l-primary/20 bg-background' 
                    : 'border-l-red-200 bg-red-50/50 opacity-60'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{module.name}</h3>
                          {!isModuleVisible && (
                            <Badge variant="secondary" className="text-xs">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Versteckt
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                      </div>
                      
                      <Switch
                        checked={isModuleVisible}
                        onCheckedChange={(checked) => {
                          // Modul Sichtbarkeit umschalten
                          updateModuleVisibility(module.name, checked);
                        }}
                      />
                    </div>

                    <Tabs defaultValue="actions" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="actions">Aktionen</TabsTrigger>
                        <TabsTrigger value="fields">Felder</TabsTrigger>
                        <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
                        <TabsTrigger value="limits">Limits & Zeiten</TabsTrigger>
                      </TabsList>

                      <TabsContent value="actions" className="space-y-3">
                        <Label className="text-sm font-medium">Berechtigungen</Label>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                          {getModuleActions(module.name).map((action) => {
                            const isActive = hasPermission(module.name, action);
                            const isDisabled = !isModuleVisible;
                            
                            return (
                              <Button
                                key={action}
                                variant={isActive ? "default" : "outline"}
                                size="sm"
                                disabled={isDisabled}
                                className={`text-xs ${
                                  isActive 
                                    ? "bg-green-600 hover:bg-green-700" 
                                    : "border-gray-300 hover:border-primary"
                                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => !isDisabled && togglePermission(module.name, action)}
                              >
                                {isActive && <CheckCircle className="h-3 w-3 mr-1" />}
                                {action}
                              </Button>
                            );
                          })}
                        </div>
                      </TabsContent>

                      <TabsContent value="fields" className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Sichtbare Felder</Label>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {getFieldAccess(module.name, 'visible').map(field => (
                                <Badge key={field} variant="outline" className="text-xs">
                                  <Eye className="h-3 w-3 mr-1" />
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Editierbare Felder</Label>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {getFieldAccess(module.name, 'editable').map(field => (
                                <Badge key={field} variant="outline" className="text-xs bg-orange-50">
                                  <Settings className="h-3 w-3 mr-1" />
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="notifications" className="space-y-3">
                        <Label className="text-sm font-medium">Benachrichtigungskanäle</Label>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(getNotificationSettings(module.name)).map(([type, roles]) => {
                            const isAllowed = Array.isArray(roles) && roles.includes(selectedRole);
                            const icons = {
                              push: Bell,
                              email: Mail,
                              slack: MessageSquare,
                              sms: Phone,
                              teams: MessageSquare
                            };
                            const Icon = icons[type as keyof typeof icons] || Bell;
                            
                            return (
                              <Badge
                                key={type}
                                variant={isAllowed ? "default" : "secondary"}
                                className={`text-xs ${isAllowed ? "bg-blue-600" : "bg-gray-400"}`}
                              >
                                <Icon className="h-3 w-3 mr-1" />
                                {type.toUpperCase()}
                              </Badge>
                            );
                          })}
                        </div>
                      </TabsContent>

                      <TabsContent value="limits" className="space-y-3">
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <Label className="text-sm font-medium">Zeitfenster</Label>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Badge variant="outline" className="text-xs justify-center">
                              Genehmigungen: 08:00-18:00
                            </Badge>
                            <Badge variant="outline" className="text-xs justify-center">
                              Nur Werktage
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-3">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <Label className="text-sm font-medium">Limits</Label>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <Badge variant="outline" className="text-xs justify-center">
                              Max 10/Tag
                            </Badge>
                            <Badge variant="outline" className="text-xs justify-center">
                              Max 50/Woche
                            </Badge>
                            <Badge variant="outline" className="text-xs justify-center">
                              Max 200/Monat
                            </Badge>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {permissions.reduce((count, p) => count + (p.allowed_actions?.length || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Aktive Berechtigungen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {modules.length}
              </div>
              <div className="text-sm text-muted-foreground">Module insgesamt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {AVAILABLE_ROLES.length}
              </div>
              <div className="text-sm text-muted-foreground">Verfügbare Rollen</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};