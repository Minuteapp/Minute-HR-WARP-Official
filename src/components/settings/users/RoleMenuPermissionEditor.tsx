import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Shield, Users, UserCheck, User, 
  Eye, Edit, Trash2, CheckCircle,
  Save, RotateCcw, Loader2
} from 'lucide-react';

// Die 4 Kunden-Rollen
const CUSTOMER_ROLES = [
  { 
    key: 'employee', 
    name: 'Mitarbeiter', 
    icon: User, 
    color: 'bg-gray-100 text-gray-800',
    description: 'Sieht nur eigene Daten'
  },
  { 
    key: 'team_lead', 
    name: 'Teamleiter', 
    icon: UserCheck, 
    color: 'bg-orange-100 text-orange-800',
    description: 'Sieht eigene + Team-Daten'
  },
  { 
    key: 'hr_admin', 
    name: 'HR Admin', 
    icon: Users, 
    color: 'bg-blue-100 text-blue-800',
    description: 'Sieht alle HR-relevanten Daten'
  },
  { 
    key: 'admin', 
    name: 'Admin', 
    icon: Shield, 
    color: 'bg-red-100 text-red-800',
    description: 'Vollzugriff auf alles'
  }
];

const SCOPE_OPTIONS = [
  { value: 'own', label: 'Eigene Daten', color: 'bg-gray-100' },
  { value: 'team', label: 'Team-Daten', color: 'bg-orange-100' },
  { value: 'department', label: 'Abteilung', color: 'bg-blue-100' },
  { value: 'all', label: 'Alle Daten', color: 'bg-green-100' }
];

const MODULE_NAMES: Record<string, string> = {
  absence: 'Abwesenheit',
  time: 'Zeiterfassung',
  payroll: 'Lohn/Gehalt',
  projects: 'Projekte',
  recruiting: 'Recruiting',
  onboarding: 'Onboarding',
  helpdesk: 'Helpdesk',
  documents: 'Dokumente',
  goals: 'Ziele',
  performance: 'Performance',
  shifts: 'Schichtplanung',
  travel: 'Reisekosten',
  expenses: 'Spesen',
  innovation: 'Innovation',
  surveys: 'Umfragen',
  dashboard: 'Dashboard',
  settings: 'Einstellungen'
};

interface MenuItem {
  id: string;
  module_key: string;
  menu_key: string;
  menu_name: string;
  menu_order: number;
  requires_team_context: boolean;
  icon: string | null;
}

interface RolePermission {
  id?: string;
  role: string;
  module_key: string;
  menu_key: string;
  is_visible: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_approve: boolean;
  scope: string;
  company_id: string | null;
}

export const RoleMenuPermissionEditor: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>('employee');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [permissions, setPermissions] = useState<Record<string, RolePermission>>({});
  const [originalPermissions, setOriginalPermissions] = useState<Record<string, RolePermission>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Load company_id
  useEffect(() => {
    const loadCompanyId = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      setCompanyId(data?.company_id || null);
    };
    loadCompanyId();
  }, [user?.id]);

  // Load menu items and permissions
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load all menu items
        const { data: items, error: itemsError } = await supabase
          .from('module_menu_items')
          .select('*')
          .eq('is_active', true)
          .order('module_key')
          .order('menu_order');

        if (itemsError) throw itemsError;
        setMenuItems(items || []);

        // Load permissions for selected role
        await loadRolePermissions(selectedRole);
      } catch (err: any) {
        console.error('Error loading data:', err);
        toast({
          title: 'Fehler',
          description: 'Daten konnten nicht geladen werden',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [companyId, selectedRole]);

  const loadRolePermissions = async (role: string) => {
    try {
      // Load ALL permissions for this role (global defaults have company_id = NULL)
      const { data, error } = await supabase
        .from('role_menu_permissions')
        .select('*')
        .eq('role', role);

      if (error) throw error;

      // Build permission map
      // First: load global defaults (company_id = NULL)
      // Then: override with company-specific if exists
      const permMap: Record<string, RolePermission> = {};
      
      // First pass: global defaults
      (data || []).filter((p: any) => p.company_id === null).forEach((p: any) => {
        const key = `${p.module_key}:${p.menu_key}`;
        permMap[key] = p;
      });
      
      // Second pass: company-specific overrides
      if (companyId) {
        (data || []).filter((p: any) => p.company_id === companyId).forEach((p: any) => {
          const key = `${p.module_key}:${p.menu_key}`;
          permMap[key] = p; // Override global
        });
      }

      setPermissions(permMap);
      setOriginalPermissions(JSON.parse(JSON.stringify(permMap)));
      setHasChanges(false);
    } catch (err) {
      console.error('Error loading permissions:', err);
    }
  };

  const handleRoleChange = async (role: string) => {
    if (hasChanges) {
      const confirm = window.confirm('Es gibt ungespeicherte Änderungen. Trotzdem wechseln?');
      if (!confirm) return;
    }
    setSelectedRole(role);
    await loadRolePermissions(role);
  };

  const updatePermission = (
    moduleKey: string, 
    menuKey: string, 
    field: keyof RolePermission, 
    value: boolean | string
  ) => {
    const key = `${moduleKey}:${menuKey}`;
    const existing = permissions[key] || {
      role: selectedRole,
      module_key: moduleKey,
      menu_key: menuKey,
      is_visible: false,
      can_edit: false,
      can_delete: false,
      can_approve: false,
      scope: 'own',
      company_id: companyId
    };

    const updated = { ...existing, [field]: value, company_id: companyId };
    setPermissions(prev => ({ ...prev, [key]: updated }));
    setHasChanges(true);
  };

  const saveChanges = async () => {
    if (!companyId) {
      toast({
        title: 'Fehler',
        description: 'Keine Firma gefunden',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      // Collect all changed permissions
      const toUpsert: any[] = [];

      Object.entries(permissions).forEach(([key, perm]) => {
        const original = originalPermissions[key];
        if (JSON.stringify(perm) !== JSON.stringify(original)) {
          toUpsert.push({
            role: selectedRole,
            module_key: perm.module_key,
            menu_key: perm.menu_key,
            is_visible: perm.is_visible,
            can_edit: perm.can_edit,
            can_delete: perm.can_delete,
            can_approve: perm.can_approve,
            scope: perm.scope,
            company_id: companyId,
            updated_at: new Date().toISOString()
          });
        }
      });

      if (toUpsert.length > 0) {
        const { error } = await supabase
          .from('role_menu_permissions')
          .upsert(toUpsert, {
            onConflict: 'role,module_key,menu_key,company_id'
          });

        if (error) throw error;
      }

      toast({
        title: 'Gespeichert',
        description: `${toUpsert.length} Berechtigung(en) für ${CUSTOMER_ROLES.find(r => r.key === selectedRole)?.name} aktualisiert`
      });

      setOriginalPermissions(JSON.parse(JSON.stringify(permissions)));
      setHasChanges(false);
    } catch (err: any) {
      console.error('Error saving:', err);
      toast({
        title: 'Fehler',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    setPermissions(JSON.parse(JSON.stringify(originalPermissions)));
    setHasChanges(false);
  };

  // Group menu items by module
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.module_key]) {
      acc[item.module_key] = [];
    }
    acc[item.module_key].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const getPermissionForMenu = (moduleKey: string, menuKey: string): RolePermission => {
    const key = `${moduleKey}:${menuKey}`;
    return permissions[key] || {
      role: selectedRole,
      module_key: moduleKey,
      menu_key: menuKey,
      is_visible: false,
      can_edit: false,
      can_delete: false,
      can_approve: false,
      scope: 'own',
      company_id: companyId
    };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Menüpunkt-Berechtigungen
            </CardTitle>
            <CardDescription>
              Legen Sie fest, welche Menüpunkte jede Rolle in jedem Modul sehen und bearbeiten kann
            </CardDescription>
          </div>
          {hasChanges && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetChanges}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Zurücksetzen
              </Button>
              <Button size="sm" onClick={saveChanges} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                Speichern
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Role Tabs */}
        <Tabs value={selectedRole} onValueChange={handleRoleChange} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            {CUSTOMER_ROLES.map(role => {
              const Icon = role.icon;
              return (
                <TabsTrigger key={role.key} value={role.key} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{role.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {CUSTOMER_ROLES.map(role => (
            <TabsContent key={role.key} value={role.key}>
              <div className="mb-4 p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2">
                  <Badge className={role.color}>{role.name}</Badge>
                  <span className="text-sm text-muted-foreground">{role.description}</span>
                </div>
              </div>

              <ScrollArea className="h-[600px] pr-4">
                <Accordion type="multiple" className="space-y-2">
                  {Object.entries(groupedMenuItems).map(([moduleKey, items]) => (
                    <AccordionItem key={moduleKey} value={moduleKey} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{MODULE_NAMES[moduleKey] || moduleKey}</span>
                          <Badge variant="secondary" className="text-xs">
                            {items.filter(item => getPermissionForMenu(moduleKey, item.menu_key).is_visible).length} / {items.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-2">
                          {items.map(item => {
                            const perm = getPermissionForMenu(moduleKey, item.menu_key);
                            return (
                              <div 
                                key={item.menu_key} 
                                className={`p-3 rounded-lg border ${perm.is_visible ? 'bg-background' : 'bg-muted/30 opacity-60'}`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{item.menu_name}</span>
                                    {item.requires_team_context && (
                                      <Badge variant="outline" className="text-xs">Team-Kontext</Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                    <Switch
                                      checked={perm.is_visible}
                                      onCheckedChange={(checked) => 
                                        updatePermission(moduleKey, item.menu_key, 'is_visible', checked)
                                      }
                                    />
                                  </div>
                                </div>

                                {perm.is_visible && (
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t">
                                    {/* Scope */}
                                    <div className="space-y-1">
                                      <label className="text-xs text-muted-foreground">Datenbereich</label>
                                      <Select
                                        value={perm.scope}
                                        onValueChange={(value) => 
                                          updatePermission(moduleKey, item.menu_key, 'scope', value)
                                        }
                                      >
                                        <SelectTrigger className="h-8 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {SCOPE_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                              {opt.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Can Edit */}
                                    <div className="flex items-center gap-2">
                                      <Switch
                                        id={`edit-${moduleKey}-${item.menu_key}`}
                                        checked={perm.can_edit}
                                        onCheckedChange={(checked) => 
                                          updatePermission(moduleKey, item.menu_key, 'can_edit', checked)
                                        }
                                      />
                                      <label 
                                        htmlFor={`edit-${moduleKey}-${item.menu_key}`}
                                        className="text-xs flex items-center gap-1"
                                      >
                                        <Edit className="h-3 w-3" />
                                        Bearbeiten
                                      </label>
                                    </div>

                                    {/* Can Delete */}
                                    <div className="flex items-center gap-2">
                                      <Switch
                                        id={`delete-${moduleKey}-${item.menu_key}`}
                                        checked={perm.can_delete}
                                        onCheckedChange={(checked) => 
                                          updatePermission(moduleKey, item.menu_key, 'can_delete', checked)
                                        }
                                      />
                                      <label 
                                        htmlFor={`delete-${moduleKey}-${item.menu_key}`}
                                        className="text-xs flex items-center gap-1"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                        Löschen
                                      </label>
                                    </div>

                                    {/* Can Approve */}
                                    <div className="flex items-center gap-2">
                                      <Switch
                                        id={`approve-${moduleKey}-${item.menu_key}`}
                                        checked={perm.can_approve}
                                        onCheckedChange={(checked) => 
                                          updatePermission(moduleKey, item.menu_key, 'can_approve', checked)
                                        }
                                      />
                                      <label 
                                        htmlFor={`approve-${moduleKey}-${item.menu_key}`}
                                        className="text-xs flex items-center gap-1"
                                      >
                                        <CheckCircle className="h-3 w-3" />
                                        Genehmigen
                                      </label>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
