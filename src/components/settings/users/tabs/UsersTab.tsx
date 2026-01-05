import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, UserPlus, Search, Edit, Trash2, Shield, Crown, 
  UserCheck, UserX, MoreHorizontal, Lock, Unlock, Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RoleChangeDialog } from '../dialogs/RoleChangeDialog';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  created_at: string;
  last_sign_in_at?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'suspended';
  user_type?: 'employee' | 'external' | 'service_account' | 'system' | 'temporary';
}

const ROLE_COLORS: Record<string, string> = {
  superadmin: 'bg-purple-100 text-purple-800 border-purple-200',
  admin: 'bg-red-100 text-red-800 border-red-200',
  hr_admin: 'bg-blue-100 text-blue-800 border-blue-200',
  hr_manager: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  hr: 'bg-teal-100 text-teal-800 border-teal-200',
  manager: 'bg-orange-100 text-orange-800 border-orange-200',
  team_lead: 'bg-amber-100 text-amber-800 border-amber-200',
  finance_controller: 'bg-green-100 text-green-800 border-green-200',
  employee: 'bg-gray-100 text-gray-800 border-gray-200'
};

const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  hr_admin: 'HR Admin',
  hr_manager: 'HR Manager',
  hr: 'HR',
  manager: 'Manager',
  team_lead: 'Teamleiter',
  finance_controller: 'Finance Controller',
  employee: 'Mitarbeiter'
};

const ROLE_ICONS: Record<string, React.ElementType> = {
  superadmin: Crown,
  admin: Shield,
  hr_admin: Shield,
  hr_manager: UserCheck,
  hr: UserCheck,
  manager: UserCheck,
  team_lead: UserCheck,
  finance_controller: UserCheck,
  employee: UserX
};

const USER_TYPE_LABELS: Record<string, string> = {
  employee: 'Mitarbeiter',
  external: 'Externer',
  service_account: 'Service-Account',
  system: 'System',
  temporary: 'Temporär'
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktiv', color: 'bg-green-100 text-green-800' },
  inactive: { label: 'Inaktiv', color: 'bg-gray-100 text-gray-800' },
  suspended: { label: 'Gesperrt', color: 'bg-red-100 text-red-800' }
};

// Rollen die Benutzer verwalten dürfen
const CAN_MANAGE_USERS = ['superadmin', 'admin', 'hr_admin', 'hr_manager'];

export const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  
  // Dialog States
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { toast } = useToast();
  const { tenantCompany, jwtUserRole } = useTenant();
  const { user: currentUser } = useAuth();

  // Aktuelle Benutzerrolle ermitteln
  const currentUserRole = jwtUserRole || 'employee';
  const canManageUsers = CAN_MANAGE_USERS.includes(currentUserRole);

  useEffect(() => {
    loadUsers();
  }, [tenantCompany?.id]);

  const loadUsers = async () => {
    if (!tenantCompany?.id) return;
    
    setLoading(true);
    try {
      // Lade user_roles mit Profildaten
      const { data: userRolesData, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          created_at,
          profiles:user_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('company_id', tenantCompany.id);

      if (error) throw error;

      const usersWithRoles: User[] = userRolesData?.map(roleData => {
        const profile = roleData.profiles as any;
        return {
          id: roleData.user_id,
          email: profile?.email || `user-${roleData.user_id.slice(0, 8)}@company.com`,
          user_metadata: { 
            full_name: profile?.full_name || `Benutzer ${roleData.user_id.slice(0, 8)}`,
            avatar_url: profile?.avatar_url
          },
          created_at: roleData.created_at || new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          role: roleData.role,
          status: 'active' as const,
          user_type: 'employee' as const
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Fehler beim Laden:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuspend = async (user: User) => {
    if (!tenantCompany?.id) return;
    
    setActionLoading(true);
    try {
      const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
      
      // Hier könnte ein status-Feld in user_roles oder einer separaten Tabelle aktualisiert werden
      // Für jetzt simulieren wir es lokal
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, status: newStatus } : u
      ));

      toast({
        title: newStatus === 'suspended' ? 'Benutzer gesperrt' : 'Benutzer entsperrt',
        description: `${user.user_metadata?.full_name || user.email} wurde ${newStatus === 'suspended' ? 'gesperrt' : 'entsperrt'}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message || 'Aktion fehlgeschlagen.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser || !tenantCompany?.id) return;
    
    // Verhindere Selbstlöschung
    if (selectedUser.id === currentUser?.id) {
      toast({
        title: 'Nicht erlaubt',
        description: 'Sie können sich nicht selbst löschen.',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.id)
        .eq('company_id', tenantCompany.id);

      if (error) throw error;

      toast({
        title: 'Benutzer entfernt',
        description: `${selectedUser.user_metadata?.full_name || selectedUser.email} wurde aus dem Unternehmen entfernt.`,
      });

      setShowDeleteDialog(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message || 'Benutzer konnte nicht entfernt werden.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.user_metadata?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesType = userTypeFilter === 'all' || user.user_type === userTypeFilter;
    
    return matchesSearch && matchesRole && matchesStatus && matchesType;
  });

  const uniqueRoles = [...new Set(users.map(u => u.role).filter(Boolean))];

  const getRoleIcon = (role?: string) => {
    if (!role) return UserX;
    return ROLE_ICONS[role] || UserX;
  };

  const getRoleColor = (role?: string) => {
    return ROLE_COLORS[role || ''] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRoleLabel = (role?: string) => {
    return ROLE_LABELS[role || ''] || role || 'Unbekannt';
  };

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Benutzer ({users.length})
          </CardTitle>
          <CardDescription>
            Verwalten Sie alle Benutzer, ihre Rollen und Zugriffsrechte
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter-Leiste */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Benutzer suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Rolle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Rollen</SelectItem>
                {uniqueRoles.map(role => (
                  <SelectItem key={role} value={role!}>{getRoleLabel(role)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="inactive">Inaktiv</SelectItem>
                <SelectItem value="suspended">Gesperrt</SelectItem>
              </SelectContent>
            </Select>

            <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Benutzertyp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Typen</SelectItem>
                <SelectItem value="employee">Mitarbeiter</SelectItem>
                <SelectItem value="external">Externe</SelectItem>
                <SelectItem value="service_account">Service-Accounts</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="temporary">Temporär</SelectItem>
              </SelectContent>
            </Select>

            {canManageUsers && (
              <Button className="ml-auto">
                <UserPlus className="h-4 w-4 mr-2" />
                Benutzer hinzufügen
              </Button>
            )}
          </div>

          {/* Benutzer-Tabelle */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Letzte Anmeldung</TableHead>
                  {canManageUsers && <TableHead className="w-[80px]">Aktionen</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canManageUsers ? 6 : 5} className="text-center py-8 text-muted-foreground">
                      Keine Benutzer gefunden
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map(user => {
                    const RoleIcon = getRoleIcon(user.role);
                    const statusInfo = STATUS_LABELS[user.status || 'active'];
                    const isCurrentUser = user.id === currentUser?.id;
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                              {user.user_metadata?.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {user.user_metadata?.full_name || 'Unbekannt'}
                                {isCurrentUser && (
                                  <Badge variant="outline" className="text-xs">Sie</Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {USER_TYPE_LABELS[user.user_type || 'employee']}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getRoleColor(user.role)} flex items-center gap-1 w-fit`}>
                            <RoleIcon className="h-3 w-3" />
                            <span>{getRoleLabel(user.role)}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {user.last_sign_in_at 
                              ? new Date(user.last_sign_in_at).toLocaleDateString('de-DE') 
                              : 'Nie'}
                          </span>
                        </TableCell>
                        {canManageUsers && (
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                  setSelectedUser(user);
                                  // Details Dialog - noch nicht implementiert
                                }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Details anzeigen
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedUser(user);
                                  setShowRoleDialog(true);
                                }}>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Rolle ändern
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleToggleSuspend(user)}
                                  disabled={isCurrentUser || actionLoading}
                                >
                                  {user.status === 'suspended' ? (
                                    <>
                                      <Unlock className="h-4 w-4 mr-2" />
                                      Entsperren
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="h-4 w-4 mr-2" />
                                      Sperren
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowDeleteDialog(true);
                                  }}
                                  disabled={isCurrentUser}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Entfernen
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Role Change Dialog */}
      <RoleChangeDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        user={selectedUser}
        currentUserRole={currentUserRole}
        onSuccess={loadUsers}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Benutzer entfernen?</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie <strong>{selectedUser?.user_metadata?.full_name || selectedUser?.email}</strong> aus 
              dem Unternehmen entfernen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? 'Entfernen...' : 'Entfernen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
