import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RolePermissionMatrix } from './RolePermissionMatrix';
import AddUserDialog from './AddUserDialog';
import { UserDialog } from './UserDialog';
import { useUserActions } from '@/hooks/user-management/useUserActions';
import { InternalUser } from '@/hooks/user-management/types';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Crown, 
  Edit, 
  Trash2, 
  Search,
  UserCheck,
  UserX
} from 'lucide-react';

// Verwende InternalUser anstatt lokales Interface

interface RoleTemplate {
  id: string;
  role_name: string;
  display_name: string;
  description: string;
  base_template: string;
  is_system_role: boolean;
  permission_overrides: Record<string, any>;
}

const ROLE_COLORS = {
  superadmin: 'bg-purple-100 text-purple-800 border-purple-200',
  admin: 'bg-red-100 text-red-800 border-red-200',
  manager: 'bg-orange-100 text-orange-800 border-orange-200',
  employee: 'bg-gray-100 text-gray-800 border-gray-200'
};

const ROLE_ICONS = {
  superadmin: Crown,
  admin: Shield,
  manager: UserCheck,
  employee: UserX
};

const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: '1',
    role_name: 'superadmin',
    display_name: 'Super Administrator',
    description: 'Vollzugriff auf alle Funktionen',
    base_template: 'superadmin',
    is_system_role: true,
    permission_overrides: {}
  },
  {
    id: '2', 
    role_name: 'admin',
    display_name: 'Administrator',
    description: 'Administrative Aufgaben',
    base_template: 'admin',
    is_system_role: true,
    permission_overrides: {}
  },
  {
    id: '3',
    role_name: 'manager',
    display_name: 'Manager',
    description: 'Team- und Projektleitung',
    base_template: 'manager',
    is_system_role: false,
    permission_overrides: {}
  },
  {
    id: '4',
    role_name: 'employee',
    display_name: 'Mitarbeiter',
    description: 'Standard-Benutzerrechte',
    base_template: 'employee',
    is_system_role: false,
    permission_overrides: {}
  }
];

export const WorkingUserManagement = () => {
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [roleTemplates, setRoleTemplates] = useState<RoleTemplate[]>(ROLE_TEMPLATES);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<InternalUser | null>(null);
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      // Lade echte Benutzer aus user_roles Tabelle
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at');

      if (userRolesError) {
        console.log('UserRoles-Fehler:', userRolesError);
      }

      // Erstelle User-Objekte aus den Rollen-Daten
      const usersWithRoles: InternalUser[] = userRolesData?.map(roleData => ({
        id: roleData.user_id,
        email: `user-${roleData.user_id.slice(0, 8)}@company.com`,
        user_metadata: { 
          full_name: `Benutzer ${roleData.user_id.slice(0, 8)}` 
        },
        created_at: roleData.created_at || new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        role: roleData.role,
        status: 'active' as const
      })) || [];

        // No mock data fallback - show empty state
        setUsers([]);

    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
      toast({
        title: "Hinweis",
        description: "Keine Benutzer gefunden.",
        variant: "default"
      });
      
      // Show empty state instead of mock data
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // User actions mit echten Funktionen
  const { 
    handleAddUser, 
    handleEditUser, 
    handleDeleteUser, 
    handleEditClick 
  } = useUserActions(
    true, // isSuperAdmin - später aus Auth Context holen
    setOpenAddDialog,
    setOpenEditDialog,
    (user: any) => setSelectedUser(user),
    loadData
  );

  useEffect(() => {
    loadData();
  }, []);


  const getRoleIcon = (role?: string) => {
    if (!role) return UserX;
    const IconComponent = ROLE_ICONS[role as keyof typeof ROLE_ICONS] || UserX;
    return IconComponent;
  };

  const getRoleColor = (role?: string) => {
    return ROLE_COLORS[role as keyof typeof ROLE_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.user_metadata?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const uniqueRoles = [...new Set(users.map(u => u.role).filter(Boolean))];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Benutzerverwaltung</CardTitle>
          <CardDescription>Lädt...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Benutzerverwaltung</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Rechtematrix</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6" />
                <span>Benutzerverwaltung</span>
              </CardTitle>
              <CardDescription>
                Verwalte Benutzer und ihre Rollen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filter und Suche */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Benutzer suchen..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Rolle filtern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Rollen</SelectItem>
                      {uniqueRoles.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => setOpenAddDialog(true)}
                  className="bg-gradient-to-r from-primary to-primary/80"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Benutzer hinzufügen
                </Button>
              </div>

              {/* Benutzer-Liste */}
              <div className="space-y-4">
                {filteredUsers.map(user => {
                  const RoleIcon = getRoleIcon(user.role);
                  
                  return (
                    <Card key={user.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-white text-sm font-medium">
                            {user.user_metadata?.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{user.user_metadata?.full_name || 'Unbekannt'}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={`${getRoleColor(user.role)} flex items-center space-x-1`}>
                            <RoleIcon className="h-3 w-3" />
                            <span>{user.role}</span>
                          </Badge>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(user as any)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    Keine Benutzer gefunden.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <RolePermissionMatrix 
            roleTemplates={roleTemplates}
            users={users}
            onPermissionUpdate={(role, module, permissions) => {
              console.log('Permission update:', role, module, permissions);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Add User Dialog */}
      <AddUserDialog
        open={openAddDialog}
        onOpenChange={setOpenAddDialog}
        onAddUser={(userData) => handleAddUser(userData.email, 'defaultPassword', userData.role)}
      />

      {/* Edit User Dialog */}
      <UserDialog
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        onSave={(userData) => selectedUser && handleEditUser(selectedUser.id, userData.role || selectedUser.role || 'employee')}
        title="Benutzer bearbeiten"
        user={selectedUser as any}
        isSuperAdmin={true}
      />
    </div>
  );
};