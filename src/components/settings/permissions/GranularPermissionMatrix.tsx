import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import * as LucideIcons from 'lucide-react';
import { ChevronDown, ChevronRight, Shield, Settings, AlertTriangle, Info, Save, RotateCcw } from 'lucide-react';

interface PermissionModule {
  id: string;
  name: string;
  module_key: string;
  description: string;
  module_type: 'main' | 'submodule';
  parent_module_id?: string;
  icon?: string;
  color?: string;
  submodules?: PermissionModule[];
}

interface PermissionAction {
  id: string;
  action_key: string;
  action_name: string;
  description: string;
  category: string;
  requires_approval: boolean;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
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
  field_permissions: Record<string, any>;
  approval_permissions: Record<string, any>;
  notification_settings: Record<string, any>;
  automation_permissions: Record<string, any>;
  report_permissions: Record<string, any>;
  audit_permissions: Record<string, any>;
  special_permissions: Record<string, any>;
}

const ROLES = ['superadmin', 'admin', 'manager', 'employee'];
const RISK_LEVEL_COLORS = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800', 
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

export const GranularPermissionMatrix: React.FC = () => {
  const [modules, setModules] = useState<PermissionModule[]>([]);
  const [actions, setActions] = useState<PermissionAction[]>([]);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('employee');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Lade Module und Submodule
      const { data: modulesData, error: modulesError } = await supabase
        .from('permission_modules')
        .select('*')
        .order('sort_order', { ascending: true });

      if (modulesError) throw modulesError;

      // Organisiere Module in Tree-Struktur
      const organizedModules = organizeModulesInTree(modulesData || []);
      setModules(organizedModules);

      // Lade verfügbare Aktionen
      const { data: actionsData, error: actionsError } = await supabase
        .from('permission_actions')
        .select('*')
        .order('category', { ascending: true });

      if (actionsError) throw actionsError;
      setActions(actionsData || []);

      // Lade bestehende Berechtigungen
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('role_permission_matrix')
        .select('*');

      if (permissionsError) throw permissionsError;
      setPermissions(permissionsData || []);

    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
      toast({
        title: "Fehler",
        description: "Daten konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const organizeModulesInTree = (modulesList: any[]): PermissionModule[] => {
    const mainModules = modulesList.filter(m => m.module_type === 'main');
    const subModules = modulesList.filter(m => m.module_type === 'submodule');

    return mainModules.map(mainModule => ({
      ...mainModule,
      submodules: subModules.filter(sub => sub.parent_module_id === mainModule.id)
    }));
  };

  const toggleModuleExpansion = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const getIcon = (iconName?: string) => {
    if (!iconName) return <Shield className="h-4 w-4" />;
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <Shield className="h-4 w-4" />;
  };

  const getPermissionForRoleAndModule = (role: string, moduleName: string): RolePermission | undefined => {
    return permissions.find(p => p.role === role && p.module_name === moduleName);
  };

  const updatePermission = (role: string, moduleName: string, updates: Partial<RolePermission>) => {
    setPermissions(prev => {
      const existing = prev.find(p => p.role === role && p.module_name === moduleName);
      if (existing) {
        return prev.map(p => 
          p.role === role && p.module_name === moduleName 
            ? { ...p, ...updates }
            : p
        );
      } else {
        const newPermission: RolePermission = {
          id: '',
          role,
          module_name: moduleName,
          is_visible: false,
          allowed_actions: [],
          visible_fields: {},
          editable_fields: {},
          allowed_notifications: [],
          workflow_triggers: [],
          field_permissions: {},
          approval_permissions: {},
          notification_settings: {},
          automation_permissions: {},
          report_permissions: {},
          audit_permissions: {},
          special_permissions: {},
          ...updates
        };
        return [...prev, newPermission];
      }
    });
    setHasChanges(true);
  };

  const toggleAction = (role: string, moduleName: string, actionKey: string) => {
    const permission = getPermissionForRoleAndModule(role, moduleName);
    const currentActions = permission?.allowed_actions || [];
    const newActions = currentActions.includes(actionKey)
      ? currentActions.filter(a => a !== actionKey)
      : [...currentActions, actionKey];
    
    updatePermission(role, moduleName, { allowed_actions: newActions });
  };

  const saveChanges = async () => {
    try {
      setLoading(true);

      for (const permission of permissions) {
        if (permission.id) {
          // Update existing
          const { error } = await supabase
            .from('role_permission_matrix')
            .update({
              is_visible: permission.is_visible,
              allowed_actions: permission.allowed_actions,
              visible_fields: permission.visible_fields,
              editable_fields: permission.editable_fields,
              allowed_notifications: permission.allowed_notifications,
              workflow_triggers: permission.workflow_triggers,
              field_permissions: permission.field_permissions,
              approval_permissions: permission.approval_permissions,
              notification_settings: permission.notification_settings,
              automation_permissions: permission.automation_permissions,
              report_permissions: permission.report_permissions,
              audit_permissions: permission.audit_permissions,
              special_permissions: permission.special_permissions
            })
            .eq('id', permission.id);

          if (error) throw error;
        } else {
          // Insert new
          const { error } = await supabase
            .from('role_permission_matrix')
            .insert({
              role: permission.role,
              module_name: permission.module_name,
              is_visible: permission.is_visible,
              allowed_actions: permission.allowed_actions,
              visible_fields: permission.visible_fields,
              editable_fields: permission.editable_fields,
              allowed_notifications: permission.allowed_notifications,
              workflow_triggers: permission.workflow_triggers,
              field_permissions: permission.field_permissions,
              approval_permissions: permission.approval_permissions,
              notification_settings: permission.notification_settings,
              automation_permissions: permission.automation_permissions,
              report_permissions: permission.report_permissions,
              audit_permissions: permission.audit_permissions,
              special_permissions: permission.special_permissions
            });

          if (error) throw error;
        }
      }

      setHasChanges(false);
      toast({
        title: "Erfolgreich gespeichert",
        description: "Berechtigungen wurden aktualisiert."
      });

      // Daten neu laden
      await loadData();

    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      toast({
        title: "Fehler",
        description: "Berechtigungen konnten nicht gespeichert werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetChanges = () => {
    loadData();
    setHasChanges(false);
  };

  const filteredModules = modules.filter(module => 
    module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.submodules?.some(sub => 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const actionsByCategory = actions.reduce((acc, action) => {
    if (!acc[action.category]) acc[action.category] = [];
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, PermissionAction[]>);

  const renderModulePermissions = (module: PermissionModule, isSubmodule = false) => {
    const permission = getPermissionForRoleAndModule(selectedRole, module.name);
    const isExpanded = expandedModules.has(module.id);

    return (
      <div key={module.id} className={`border rounded-lg ${isSubmodule ? 'ml-6 border-dashed' : ''}`}>
        <Collapsible 
          open={isExpanded} 
          onOpenChange={() => toggleModuleExpansion(module.id)}
          defaultOpen={true}
        >
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-4 hover:bg-muted/50">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {module.submodules && module.submodules.length > 0 && (
                    isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                  )}
                  <div 
                    className="p-2 rounded-md"
                    style={{ backgroundColor: `${module.color}20`, color: module.color }}
                  >
                    {getIcon(module.icon)}
                  </div>
                </div>
                <div className="text-left">
                  <h4 className="font-semibold">{module.name}</h4>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">{module.module_key}</span>
                <Switch
                  checked={permission?.is_visible || false}
                  onCheckedChange={(checked) => 
                    updatePermission(selectedRole, module.name, { is_visible: checked })
                  }
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4">
              {/* Aktionen nach Kategorien */}
              <div className="space-y-3">
                <h5 className="font-medium text-sm">Berechtigungen</h5>
                {Object.entries(actionsByCategory).map(([category, categoryActions]) => (
                  <div key={category} className="space-y-2">
                    <h6 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {category}
                    </h6>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {categoryActions.map(action => {
                        const isAllowed = permission?.allowed_actions?.includes(action.action_key) || false;
                        return (
                          <div key={action.action_key} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${module.id}-${action.action_key}`}
                              checked={isAllowed}
                              onCheckedChange={() => toggleAction(selectedRole, module.name, action.action_key)}
                            />
                            <label 
                              htmlFor={`${module.id}-${action.action_key}`}
                              className="text-sm flex items-center space-x-1 cursor-pointer"
                            >
                              <span>{action.action_name}</span>
                              <Badge className={`text-xs ${RISK_LEVEL_COLORS[action.risk_level]}`}>
                                {action.risk_level}
                              </Badge>
                              {action.requires_approval && (
                                <AlertTriangle className="h-3 w-3 text-amber-500" />
                              )}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Zusätzliche Konfigurationen */}
              <Tabs defaultValue="notifications" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
                  <TabsTrigger value="fields">Felder</TabsTrigger>
                  <TabsTrigger value="workflows">Workflows</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="notifications" className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Konfigurieren Sie, welche Benachrichtigungen diese Rolle erhalten soll.
                  </div>
                  <div className="space-y-2">
                    {['push', 'email', 'sms', 'slack'].map(notificationType => (
                      <div key={notificationType} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${module.id}-notif-${notificationType}`}
                          checked={permission?.allowed_notifications?.includes(notificationType) || false}
                          onCheckedChange={(checked) => {
                            const current = permission?.allowed_notifications || [];
                            const updated = checked
                              ? [...current, notificationType]
                              : current.filter(n => n !== notificationType);
                            updatePermission(selectedRole, module.name, { allowed_notifications: updated });
                          }}
                        />
                        <label htmlFor={`${module.id}-notif-${notificationType}`} className="text-sm capitalize">
                          {notificationType}
                        </label>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="fields" className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Definieren Sie feldspezifische Sichtbarkeits- und Bearbeitungsrechte.
                  </div>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Feldberechtigungen werden über eine separate Konfiguration verwaltet.
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="workflows" className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Legen Sie fest, welche Workflow-Trigger verfügbar sind.
                  </div>
                  <div className="space-y-2">
                    {['onStatusChange', 'onCreate', 'onDelete', 'onApproval'].map(trigger => (
                      <div key={trigger} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${module.id}-trigger-${trigger}`}
                          checked={permission?.workflow_triggers?.includes(trigger) || false}
                          onCheckedChange={(checked) => {
                            const current = permission?.workflow_triggers || [];
                            const updated = checked
                              ? [...current, trigger]
                              : current.filter(t => t !== trigger);
                            updatePermission(selectedRole, module.name, { workflow_triggers: updated });
                          }}
                        />
                        <label htmlFor={`${module.id}-trigger-${trigger}`} className="text-sm">
                          {trigger}
                        </label>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reports" className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Bestimmen Sie Report- und Analytics-Berechtigungen.
                  </div>
                  <div className="space-y-2">
                    {['basic_reports', 'advanced_analytics', 'export_data', 'custom_reports'].map(reportType => (
                      <div key={reportType} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${module.id}-report-${reportType}`}
                          checked={permission?.report_permissions?.[reportType] || false}
                          onCheckedChange={(checked) => {
                            const current = permission?.report_permissions || {};
                            updatePermission(selectedRole, module.name, { 
                              report_permissions: { ...current, [reportType]: checked }
                            });
                          }}
                        />
                        <label htmlFor={`${module.id}-report-${reportType}`} className="text-sm">
                          {reportType.replace('_', ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Submodule */}
            {module.submodules && module.submodules.length > 0 && (
              <div className="space-y-2 pb-4">
                {module.submodules.map(submodule => renderModulePermissions(submodule, true))}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Granulare Berechtigungsmatrix</CardTitle>
          <CardDescription>Lädt...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <span>Granulare Berechtigungsmatrix</span>
          </CardTitle>
          <CardDescription>
            Konfigurieren Sie detaillierte Berechtigungen für jeden Modul-Tree und jede Rolle mit maximaler Granularität.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rolle</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="border rounded-md px-3 py-2 bg-background"
                >
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Suche</label>
                <Input
                  placeholder="Module durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              {hasChanges && (
                <Button variant="outline" onClick={resetChanges}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Zurücksetzen
                </Button>
              )}
              <Button 
                onClick={saveChanges} 
                disabled={!hasChanges || loading}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </Button>
            </div>
          </div>

          {hasChanges && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Sie haben ungespeicherte Änderungen. Vergessen Sie nicht zu speichern!
              </AlertDescription>
            </Alert>
          )}

          {/* Module Tree */}
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredModules.map(module => renderModulePermissions(module))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};