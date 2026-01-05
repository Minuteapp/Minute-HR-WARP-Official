import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Save, Eye, Edit, Delete, Users, FileText, Settings } from 'lucide-react';

interface RoleTemplate {
  id: string;
  role_name: string;
  display_name: string;
  description: string;
  base_template: string;
  is_system_role: boolean;
  permission_overrides: Record<string, any>;
}

interface PermissionModule {
  name: string;
  module_key: string;
}

interface RolePermission {
  id: string;
  role: string;
  module_name: string;
  is_visible: boolean;
  allowed_actions: string[];
}

interface RolePermissionMatrixProps {
  roleTemplates: RoleTemplate[];
  users: Array<{id: string, email: string, role?: string, user_metadata?: {full_name?: string}}>;
  onPermissionUpdate?: (role: string, module: string, permissions: any) => void;
}

const MODULES = [
  { name: 'users', display_name: 'Benutzerverwaltung', icon: Users },
  { name: 'employees', display_name: 'Mitarbeiterverwaltung', icon: Users },
  { name: 'documents', display_name: 'Dokumentenverwaltung', icon: FileText },
  { name: 'projects', display_name: 'Projektverwaltung', icon: Settings },
  { name: 'calendar', display_name: 'Kalender', icon: Settings },
  { name: 'settings', display_name: 'Einstellungen', icon: Settings }
];

const ACTIONS = [
  { key: 'view', name: 'Anzeigen', icon: Eye },
  { key: 'create', name: 'Erstellen', icon: Users },
  { key: 'edit', name: 'Bearbeiten', icon: Edit },
  { key: 'delete', name: 'Löschen', icon: Delete }
];

export const RolePermissionMatrix: React.FC<RolePermissionMatrixProps> = ({ 
  roleTemplates, 
  users,
  onPermissionUpdate 
}) => {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('role_permission_matrix')
        .select('*');

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Berechtigungen:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPermission = (role: string, module: string): RolePermission | undefined => {
    return permissions.find(p => p.role === role && p.module_name === module);
  };

  const updatePermission = (role: string, module: string, updates: Partial<RolePermission>) => {
    setPermissions(prev => {
      const existing = prev.find(p => p.role === role && p.module_name === module);
      if (existing) {
        return prev.map(p => 
          p.role === role && p.module_name === module 
            ? { ...p, ...updates }
            : p
        );
      } else {
        const newPermission: RolePermission = {
          id: '',
          role,
          module_name: module,
          is_visible: false,
          allowed_actions: [],
          ...updates
        };
        return [...prev, newPermission];
      }
    });
    setHasChanges(true);
  };

  const toggleModuleVisibility = (role: string, module: string) => {
    const permission = getPermission(role, module);
    const newVisibility = !permission?.is_visible;
    updatePermission(role, module, { is_visible: newVisibility });
  };

  const toggleAction = (role: string, module: string, actionKey: string) => {
    const permission = getPermission(role, module);
    const currentActions = permission?.allowed_actions || [];
    const newActions = currentActions.includes(actionKey)
      ? currentActions.filter(a => a !== actionKey)
      : [...currentActions, actionKey];
    
    updatePermission(role, module, { allowed_actions: newActions });
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
              allowed_actions: permission.allowed_actions
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
              allowed_actions: permission.allowed_actions
            });

          if (error) throw error;
        }
      }

      setHasChanges(false);
      toast({
        title: "Erfolgreich gespeichert",
        description: "Berechtigungen wurden aktualisiert."
      });

      await loadPermissions();

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rechtematrix</CardTitle>
          <CardDescription>Lädt...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Rechtematrix</span>
              </CardTitle>
              <CardDescription>
                Granulare Berechtigungen pro Rolle und Modul
              </CardDescription>
            </div>
            {hasChanges && (
              <Button onClick={saveChanges} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Änderungen speichern
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">Modul</TableHead>
                  {roleTemplates.map(role => (
                    <TableHead key={role.role_name} className="text-center min-w-32">
                      <div className="space-y-1">
                        <div className="font-semibold">{role.display_name}</div>
                        <Badge variant="outline" className="text-xs">
                          {role.role_name}
                        </Badge>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {MODULES.map(module => (
                  <TableRow key={module.name}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <module.icon className="h-4 w-4" />
                        <div>
                          <div>{module.display_name}</div>
                          <div className="text-xs text-muted-foreground">{module.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    {roleTemplates.map(role => {
                      const permission = getPermission(role.role_name, module.name);
                      return (
                        <TableCell key={`${role.role_name}-${module.name}`} className="text-center">
                          <div className="space-y-3">
                            {/* Sichtbarkeit */}
                            <div className="flex items-center justify-center space-x-2">
                              <span className="text-xs text-muted-foreground">Sichtbar:</span>
                              <Switch
                                checked={permission?.is_visible || false}
                                onCheckedChange={() => toggleModuleVisibility(role.role_name, module.name)}
                              />
                            </div>
                            
                            {/* Aktionen */}
                            {permission?.is_visible && (
                              <div className="space-y-2">
                                {ACTIONS.map(action => (
                                  <div key={action.key} className="flex items-center justify-center space-x-1">
                                    <Switch
                                      checked={permission?.allowed_actions?.includes(action.key) || false}
                                      onCheckedChange={() => toggleAction(role.role_name, module.name, action.key)}
                                    />
                                    <span className="text-xs">{action.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {hasChanges && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-amber-800">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Ungespeicherte Änderungen</span>
              </div>
              <Button onClick={saveChanges} variant="outline" className="border-amber-600 text-amber-800 hover:bg-amber-100">
                <Save className="h-4 w-4 mr-2" />
                Jetzt speichern
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benutzer mit aktueller Rechtematrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Benutzer in der Rechtematrix</span>
          </CardTitle>
          <CardDescription>
            Alle registrierten Benutzer werden automatisch in der Rechtematrix berücksichtigt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map(user => {
              const roleTemplate = roleTemplates.find(r => r.role_name === user.role);
              return (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-white text-sm font-medium">
                      {user.user_metadata?.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{user.user_metadata?.full_name || 'Unbekannt'}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {roleTemplate?.display_name || user.role || 'Keine Rolle'}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {/* Zeige Anzahl verfügbarer Berechtigungen */}
                      {(() => {
                        const userPermissions = permissions.filter(p => p.role === user.role);
                        const visibleModules = userPermissions.filter(p => p.is_visible).length;
                        const totalActions = userPermissions.reduce((sum, p) => sum + (p.allowed_actions?.length || 0), 0);
                        return `${visibleModules} Module, ${totalActions} Aktionen`;
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}
            {users.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Keine Benutzer vorhanden. Fügen Sie Benutzer hinzu, um sie in der Rechtematrix zu verwalten.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};