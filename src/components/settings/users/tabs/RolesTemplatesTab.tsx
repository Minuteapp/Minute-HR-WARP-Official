import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Crown, Shield, UserCheck, Users, Plus, Edit, Copy, 
  Trash2, Lock, Settings, Award, Briefcase, User
} from 'lucide-react';
import { RolePermissionViewDialog } from '../RolePermissionViewDialog';
import { RoleMenuPermissionEditor } from '../RoleMenuPermissionEditor';

interface RoleTemplate {
  id: string;
  role_name: string;
  display_name: string;
  description: string;
  base_template: string | null;
  is_system_role: boolean;
  permission_overrides: Record<string, any>;
  created_at: string;
}

// 4 Kunden-Rollen (vereinfacht)
const SYSTEM_ROLES = [
  { name: 'admin', display: 'Admin', icon: Shield, color: 'bg-red-100 text-red-800', description: 'Vollzugriff auf alle Funktionen' },
  { name: 'hr_admin', display: 'HR Admin', icon: Users, color: 'bg-blue-100 text-blue-800', description: 'Personalverwaltung und alle Mitarbeiterdaten' },
  { name: 'team_lead', display: 'Teamleiter', icon: UserCheck, color: 'bg-orange-100 text-orange-800', description: 'Eigene + Team-Daten' },
  { name: 'employee', display: 'Mitarbeiter', icon: User, color: 'bg-gray-100 text-gray-800', description: 'Nur eigene Daten' },
];

const ROLE_CATEGORIES = [
  { value: 'operational', label: 'Operativ' },
  { value: 'administrative', label: 'Administrativ' },
  { value: 'strategic', label: 'Strategisch' },
];

export const RolesTemplatesTab: React.FC = () => {
  const [roleTemplates, setRoleTemplates] = useState<RoleTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<{ id: string; name: string } | null>(null);
  const [newRole, setNewRole] = useState({
    role_name: '',
    display_name: '',
    description: '',
    base_template: '',
    category: 'operational'
  });
  const { toast } = useToast();

  const handleViewPermissions = (roleId: string, roleName: string) => {
    setSelectedRole({ id: roleId, name: roleName });
    setPermissionDialogOpen(true);
  };

  useEffect(() => {
    loadRoleTemplates();
  }, []);

  const loadRoleTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('role_templates')
        .select('*')
        .order('is_system_role', { ascending: false });

      if (error) throw error;
      setRoleTemplates(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Rollen:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      const { error } = await supabase
        .from('role_templates')
        .insert({
          role_name: newRole.role_name.toLowerCase().replace(/\s+/g, '_'),
          display_name: newRole.display_name,
          description: newRole.description,
          base_template: newRole.base_template || null,
          is_system_role: false,
          permission_overrides: {}
        });

      if (error) throw error;

      toast({
        title: "Rolle erstellt",
        description: `Die Rolle "${newRole.display_name}" wurde erfolgreich erstellt.`
      });

      setShowCreateDialog(false);
      setNewRole({ role_name: '', display_name: '', description: '', base_template: '', category: 'operational' });
      loadRoleTemplates();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const duplicateRole = async (template: RoleTemplate) => {
    try {
      const { error } = await supabase
        .from('role_templates')
        .insert({
          role_name: `${template.role_name}_copy`,
          display_name: `${template.display_name} (Kopie)`,
          description: template.description,
          base_template: template.role_name,
          is_system_role: false,
          permission_overrides: template.permission_overrides
        });

      if (error) throw error;

      toast({
        title: "Rolle kopiert",
        description: `Die Rolle wurde als Kopie erstellt.`
      });

      loadRoleTemplates();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');

  return (
    <div className="space-y-6">
      {/* Tabs für Rollen vs. Berechtigungen */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'roles' | 'permissions')}>
        <TabsList className="mb-4">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Rollen-Übersicht
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Menü-Berechtigungen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="permissions">
          <RoleMenuPermissionEditor />
        </TabsContent>

        <TabsContent value="roles">
          {/* System-Rollen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                System-Rollen (4 Kunden-Rollen)
              </CardTitle>
              <CardDescription>
                Admin, HR Admin, Teamleiter und Mitarbeiter - konfigurieren Sie die Berechtigungen im Tab "Menü-Berechtigungen"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {SYSTEM_ROLES.map(role => {
                  const Icon = role.icon;
                  return (
                    <div key={role.name} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${role.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium">{role.display}</h4>
                            <p className="text-xs text-muted-foreground">{role.name}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleViewPermissions(role.name, role.display)}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Rechte anzeigen
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

      {/* Benutzerdefinierte Rollen */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Benutzerdefinierte Rollen
              </CardTitle>
              <CardDescription>
                Eigene Rollen mit individuellen Berechtigungen
              </CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Neue Rolle erstellen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Neue Rolle erstellen</DialogTitle>
                  <DialogDescription>
                    Erstellen Sie eine neue benutzerdefinierte Rolle
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Anzeigename *</Label>
                    <Input
                      placeholder="z.B. Projektleiter"
                      value={newRole.display_name}
                      onChange={(e) => setNewRole({ ...newRole, display_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Technischer Name *</Label>
                    <Input
                      placeholder="z.B. project_manager"
                      value={newRole.role_name}
                      onChange={(e) => setNewRole({ ...newRole, role_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Beschreibung *</Label>
                    <Textarea
                      placeholder="Beschreiben Sie die Rolle und ihre Verantwortlichkeiten"
                      value={newRole.description}
                      onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Basiert auf Vorlage</Label>
                    <Select 
                      value={newRole.base_template} 
                      onValueChange={(val) => setNewRole({ ...newRole, base_template: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vorlage auswählen (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Keine Vorlage</SelectItem>
                        {SYSTEM_ROLES.map(role => (
                          <SelectItem key={role.name} value={role.name}>{role.display}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Kategorie</Label>
                    <Select 
                      value={newRole.category} 
                      onValueChange={(val) => setNewRole({ ...newRole, category: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Abbrechen
                  </Button>
                  <Button 
                    onClick={handleCreateRole}
                    disabled={!newRole.display_name || !newRole.role_name || !newRole.description}
                  >
                    Rolle erstellen
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Lädt...</p>
          ) : roleTemplates.filter(r => !r.is_system_role).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine benutzerdefinierten Rollen erstellt</p>
              <p className="text-sm">Klicken Sie auf "Neue Rolle erstellen", um zu beginnen</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roleTemplates.filter(r => !r.is_system_role).map(template => (
                <div key={template.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{template.display_name}</h4>
                      <p className="text-xs text-muted-foreground">{template.role_name}</p>
                    </div>
                    {template.base_template && (
                      <Badge variant="secondary" className="text-xs">
                        Basis: {template.base_template}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Bearbeiten
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => duplicateRole(template)}>
                      <Copy className="h-3 w-3 mr-1" />
                      Kopieren
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        </Card>
        </TabsContent>
      </Tabs>

      {/* Permission View Dialog */}
      {selectedRole && (
        <RolePermissionViewDialog
          open={permissionDialogOpen}
          onOpenChange={setPermissionDialogOpen}
          roleId={selectedRole.id}
          roleName={selectedRole.name}
        />
      )}
    </div>
  );
};
