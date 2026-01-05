import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Users, 
  Search, 
  Eye, 
  EyeOff, 
  Save, 
  Download, 
  ChevronDown, 
  ChevronRight,
  Settings,
  Clock,
  Bell,
  Lock,
  Zap,
  Database,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Mail,
  MessageSquare,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';
import { ModulePermissions, SubmodulePermissions, DEFAULT_PERMISSION_MODULES } from '@/types/granular-permissions';

interface PermissionState {
  [moduleId: string]: {
    [submoduleId: string]: {
      [roleId: string]: {
        permissions: Record<string, boolean>;
        visibleFields: string[];
        editableFields: string[];
        notifications: Record<string, boolean>;
        limits: Record<string, any>;
        timeWindows: Record<string, any>;
      };
    };
  };
}

export const UltraGranularPermissionMatrix = () => {
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'json'>('overview');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [permissionState, setPermissionState] = useState<PermissionState>({});
  
  // Verfügbare Rollen aus den Modulen extrahieren
  const availableRoles = useMemo(() => {
    const roles = new Set<string>();
    DEFAULT_PERMISSION_MODULES.forEach(module => {
      module.allowedRoles.forEach(role => roles.add(role));
    });
    return Array.from(roles);
  }, []);

  // Gefilterte Module basierend auf Suche und Rolle
  const filteredModules = useMemo(() => {
    return DEFAULT_PERMISSION_MODULES.filter(module => {
      const matchesSearch = module.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           module.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const hasRoleAccess = module.allowedRoles.includes(selectedRole);
      const isActive = module.isActive;
      
      return matchesSearch && hasRoleAccess && isActive;
    });
  }, [searchQuery, selectedRole]);

  // Toggle Module Expansion
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

  // Update Permission
  const updatePermission = (moduleId: string, submoduleId: string, action: string, value: boolean) => {
    setPermissionState(prev => {
      const newState = { ...prev };
      
      if (!newState[moduleId]) {
        newState[moduleId] = {};
      }
      if (!newState[moduleId][submoduleId]) {
        newState[moduleId][submoduleId] = {};
      }
      if (!newState[moduleId][submoduleId][selectedRole]) {
        newState[moduleId][submoduleId][selectedRole] = {
          permissions: {},
          visibleFields: [],
          editableFields: [],
          notifications: {},
          limits: {},
          timeWindows: {}
        };
      }
      
      newState[moduleId][submoduleId][selectedRole].permissions[action] = value;
      return newState;
    });
    
    toast.success(`Berechtigung ${value ? 'gewährt' : 'entzogen'}: ${action}`);
  };

  // Check if permission is granted
  const hasPermission = (moduleId: string, submoduleId: string, action: string): boolean => {
    return permissionState[moduleId]?.[submoduleId]?.[selectedRole]?.permissions[action] || false;
  };

  // Get field visibility
  const getVisibleFields = (module: ModulePermissions, submodule: SubmodulePermissions): string[] => {
    const fields = submodule.visibleFields[selectedRole] || [];
    return fields.includes('*') ? ['Alle Felder'] : fields;
  };

  const getEditableFields = (module: ModulePermissions, submodule: SubmodulePermissions): string[] => {
    const fields = submodule.editableFields[selectedRole] || [];
    return fields.includes('*') ? ['Alle Felder'] : fields;
  };

  // Render Permission Actions
  const renderPermissionActions = (module: ModulePermissions, submodule: SubmodulePermissions) => {
    const permissions = submodule.permissions;
    const actions = Object.keys(permissions);
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {actions.map(action => {
          const isAllowed = permissions[action as keyof typeof permissions]?.includes(selectedRole);
          const isActive = hasPermission(module.module, submodule.name, action);
          
          return (
            <Button
              key={action}
              variant={isActive ? "default" : "outline"}
              size="sm"
              disabled={!isAllowed}
              className={`text-xs ${
                isActive 
                  ? "bg-green-600 hover:bg-green-700" 
                  : isAllowed 
                    ? "hover:border-primary" 
                    : "opacity-50 cursor-not-allowed"
              }`}
              onClick={() => isAllowed && updatePermission(module.module, submodule.name, action, !isActive)}
            >
              {isActive && <CheckCircle className="h-3 w-3 mr-1" />}
              {action.replace('can', '').toLowerCase()}
            </Button>
          );
        })}
      </div>
    );
  };

  // Render Notifications
  const renderNotifications = (submodule: SubmodulePermissions) => {
    const notifications = submodule.notifications;
    const notificationTypes = Object.keys(notifications);
    
    return (
      <div className="flex flex-wrap gap-2">
        {notificationTypes.map(type => {
          const isAllowed = notifications[type as keyof typeof notifications]?.includes(selectedRole);
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
    );
  };

  // Render Field Access
  const renderFieldAccess = (module: ModulePermissions, submodule: SubmodulePermissions) => {
    const visibleFields = getVisibleFields(module, submodule);
    const editableFields = getEditableFields(module, submodule);
    
    return (
      <div className="space-y-3">
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Sichtbare Felder</Label>
          <div className="flex flex-wrap gap-1 mt-1">
            {visibleFields.map(field => (
              <Badge key={field} variant="outline" className="text-xs">
                <Eye className="h-3 w-3 mr-1" />
                {field}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Editierbare Felder</Label>
          <div className="flex flex-wrap gap-1 mt-1">
            {editableFields.map(field => (
              <Badge key={field} variant="outline" className="text-xs bg-orange-50">
                <Settings className="h-3 w-3 mr-1" />
                {field}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render Time Windows
  const renderTimeWindows = (submodule: SubmodulePermissions) => {
    if (!submodule.timeWindows) return null;
    
    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Zeitfenster</Label>
        {Object.entries(submodule.timeWindows).map(([action, window]) => (
          <div key={action} className="flex items-center gap-2 text-xs">
            <Clock className="h-3 w-3" />
            <span className="font-medium">{action}:</span>
            <Badge variant="outline" className="text-xs">
              {window.start} - {window.end}
            </Badge>
            {window.days && (
              <Badge variant="secondary" className="text-xs">
                {window.days.join(', ')}
              </Badge>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render Limits
  const renderLimits = (submodule: SubmodulePermissions) => {
    if (!submodule.maxLimits) return null;
    
    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Limits</Label>
        {Object.entries(submodule.maxLimits).map(([role, limit]) => {
          if (role !== selectedRole) return null;
          
          return (
            <div key={role} className="flex items-center gap-2 text-xs">
              <AlertTriangle className="h-3 w-3 text-orange-500" />
              <span>{limit.action}:</span>
              <div className="flex gap-1">
                {limit.maxPerDay && (
                  <Badge variant="outline" className="text-xs">
                    {limit.maxPerDay}/Tag
                  </Badge>
                )}
                {limit.maxPerWeek && (
                  <Badge variant="outline" className="text-xs">
                    {limit.maxPerWeek}/Woche
                  </Badge>
                )}
                {limit.maxPerMonth && (
                  <Badge variant="outline" className="text-xs">
                    {limit.maxPerMonth}/Monat
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Export JSON Configuration
  const exportConfiguration = () => {
    const config = {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      selectedRole,
      modules: DEFAULT_PERMISSION_MODULES,
      currentState: permissionState
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Ultra-Granulare Rechtematrix</h1>
            <p className="text-muted-foreground">
              Enterprise-Level Berechtigungsverwaltung mit vollständiger Kontrolle
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
                  {availableRoles.map(role => (
                    <SelectItem key={role} value={role}>
                      {role.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label>Ansicht:</Label>
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Übersicht</SelectItem>
                  <SelectItem value="detailed">Detailliert</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Module durchsuchen..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Aktiv</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span>Eingeschränkt</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Gesperrt</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* JSON View */}
      {viewMode === 'json' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              JSON-Konfiguration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <pre className="text-xs bg-muted p-4 rounded-lg">
                {JSON.stringify({
                  selectedRole,
                  modules: filteredModules,
                  currentPermissions: permissionState
                }, null, 2)}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Detailed Permission Matrix */}
      {viewMode !== 'json' && (
        <div className="space-y-4">
          {filteredModules.map((module) => {
            const isExpanded = expandedModules.has(module.module);
            
            return (
              <Card key={module.module} className="border-l-4 border-l-primary/20">
                <Collapsible defaultOpen={true}>
                  <CollapsibleTrigger 
                    className="w-full"
                    onClick={() => toggleModuleExpansion(module.module)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <Shield className="h-5 w-5 text-primary" />
                          </div>
                          <div className="text-left">
                            <CardTitle className="text-lg">{module.module}</CardTitle>
                            <p className="text-sm text-muted-foreground">{module.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {module.submodules.length} Unterbereiche
                          </Badge>
                          <Badge 
                            variant={module.isActive ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {module.isActive ? "Aktiv" : "Inaktiv"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {module.submodules.map((submodule, idx) => (
                          <Card key={idx} className="bg-muted/30">
                            <CardContent className="p-4">
                              <div className="space-y-4">
                                {/* Submodule Header */}
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-semibold">{submodule.name}</h4>
                                    <p className="text-sm text-muted-foreground">{submodule.description}</p>
                                  </div>
                                  
                                  {submodule.workflowStages && (
                                    <Badge variant="outline" className="text-xs">
                                      Workflow: {submodule.workflowStages.length} Stufen
                                    </Badge>
                                  )}
                                </div>

                                {viewMode === 'detailed' && (
                                  <Tabs defaultValue="permissions" className="space-y-4">
                                    <TabsList className="grid w-full grid-cols-5">
                                      <TabsTrigger value="permissions">Aktionen</TabsTrigger>
                                      <TabsTrigger value="fields">Felder</TabsTrigger>
                                      <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
                                      <TabsTrigger value="limits">Limits</TabsTrigger>
                                      <TabsTrigger value="timing">Zeiten</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="permissions" className="space-y-3">
                                      <Label className="text-sm font-medium">Berechtigungen</Label>
                                      {renderPermissionActions(module, submodule)}
                                    </TabsContent>

                                    <TabsContent value="fields" className="space-y-3">
                                      {renderFieldAccess(module, submodule)}
                                    </TabsContent>

                                    <TabsContent value="notifications" className="space-y-3">
                                      <Label className="text-sm font-medium">Benachrichtigungen</Label>
                                      {renderNotifications(submodule)}
                                    </TabsContent>

                                    <TabsContent value="limits" className="space-y-3">
                                      {renderLimits(submodule)}
                                    </TabsContent>

                                    <TabsContent value="timing" className="space-y-3">
                                      {renderTimeWindows(submodule)}
                                    </TabsContent>
                                  </Tabs>
                                )}

                                {viewMode === 'overview' && (
                                  <div className="space-y-3">
                                    <div>
                                      <Label className="text-sm font-medium">Aktionen</Label>
                                      {renderPermissionActions(module, submodule)}
                                    </div>
                                    
                                    <Separator />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                      <div>
                                        <Label className="text-xs font-medium text-muted-foreground">Benachrichtigungen</Label>
                                        {renderNotifications(submodule)}
                                      </div>
                                      
                                      <div>
                                        <Label className="text-xs font-medium text-muted-foreground">Sichtbare Felder</Label>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {getVisibleFields(module, submodule).slice(0, 3).map(field => (
                                            <Badge key={field} variant="outline" className="text-xs">
                                              {field}
                                            </Badge>
                                          ))}
                                          {getVisibleFields(module, submodule).length > 3 && (
                                            <Badge variant="secondary" className="text-xs">
                                              +{getVisibleFields(module, submodule).length - 3} weitere
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiken für Rolle: {selectedRole.toUpperCase()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredModules.reduce((sum, m) => sum + m.submodules.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Zugängliche Bereiche</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredModules.length}
              </div>
              <div className="text-sm text-muted-foreground">Aktive Module</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Object.keys(permissionState).length}
              </div>
              <div className="text-sm text-muted-foreground">Konfigurierte Bereiche</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {availableRoles.length}
              </div>
              <div className="text-sm text-muted-foreground">Verfügbare Rollen</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};