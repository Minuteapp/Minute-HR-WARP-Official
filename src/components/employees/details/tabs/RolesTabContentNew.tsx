import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { Shield, Plus, Calendar, UserCog, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface RolesTabContentNewProps {
  employeeId: string;
}

const ROLE_LABELS: Record<string, string> = {
  'admin': 'Administrator',
  'hr_admin': 'HR-Administrator',
  'hr_manager': 'HR-Manager',
  'team_lead': 'Teamleiter',
  'manager': 'Manager',
  'employee': 'Mitarbeiter',
  'superadmin': 'Super-Administrator',
  'finance_controller': 'Finanz-Controller',
  'hr': 'HR'
};

const ASSIGNABLE_ROLES = [
  { value: 'admin', label: 'Administrator' },
  { value: 'hr_admin', label: 'HR-Administrator' },
  { value: 'team_lead', label: 'Teamleiter' },
  { value: 'manager', label: 'Manager' },
  { value: 'employee', label: 'Mitarbeiter' }
];

export const RolesTabContentNew: React.FC<RolesTabContentNewProps> = ({ employeeId }) => {
  const { canCreate, canEdit, canDelete } = useEnterprisePermissions();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  // Lade aktuelle Rollen des Mitarbeiters aus der Datenbank
  const { data: userRoles = [], isLoading } = useQuery({
    queryKey: ['user-roles', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', employeeId);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Lade die company_id des aktuellen Benutzers
  const { data: currentUserData } = useQuery({
    queryKey: ['current-user-company'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('user_roles')
        .select('company_id, role')
        .eq('user_id', user.id)
        .single();
      
      return data;
    }
  });

  // Mutation zum Hinzufügen einer Rolle
  const addRoleMutation = useMutation({
    mutationFn: async (role: string) => {
      if (!currentUserData?.company_id) {
        throw new Error('Keine Firma gefunden');
      }

      // Prüfen ob Rolle bereits existiert
      const existingRole = userRoles.find(r => r.role === role);
      if (existingRole) {
        throw new Error('Diese Rolle ist bereits zugewiesen');
      }

      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: employeeId,
          role: role as any,
          company_id: currentUserData.company_id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles', employeeId] });
      toast.success('Rolle erfolgreich zugewiesen');
      setDialogOpen(false);
      setSelectedRole('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Zuweisen der Rolle');
    }
  });

  // Mutation zum Entfernen einer Rolle
  const removeRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles', employeeId] });
      toast.success('Rolle erfolgreich entfernt');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Entfernen der Rolle');
    }
  });

  const handleAddRole = () => {
    if (!selectedRole) {
      toast.error('Bitte wählen Sie eine Rolle aus');
      return;
    }
    addRoleMutation.mutate(selectedRole);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'hr_admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'hr_manager': return 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400';
      case 'team_lead': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'manager': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400';
      case 'superadmin': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  // Filtere bereits zugewiesene Rollen aus der Auswahl
  const availableRoles = ASSIGNABLE_ROLES.filter(
    role => !userRoles.some(ur => ur.role === role.value)
  );

  // Prüfen ob der aktuelle Benutzer Admin ist
  const isAdmin = currentUserData?.role === 'admin' || currentUserData?.role === 'superadmin';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Rollen & Berechtigungen
        </h2>
        {isAdmin && availableRoles.length > 0 && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Rolle zuweisen
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{userRoles.length}</p>
              <p className="text-xs text-muted-foreground">Rollen zugewiesen</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {userRoles.length}
              </p>
              <p className="text-xs text-muted-foreground">Aktive Rollen</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {userRoles.filter(r => r.role === 'admin' || r.role === 'hr_admin' || r.role === 'superadmin').length}
              </p>
              <p className="text-xs text-muted-foreground">Admin-Rollen</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Zugewiesene Rollen
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userRoles.length > 0 ? (
            <div className="space-y-3">
              {userRoles.map((role) => (
                <div key={role.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Shield className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{ROLE_LABELS[role.role] || role.role}</span>
                      <Badge className={getRoleColor(role.role)}>
                        {ROLE_LABELS[role.role] || role.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Zugewiesen: {new Date(role.created_at).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                  {isAdmin && role.role !== 'employee' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Rolle entfernen?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Möchten Sie die Rolle "{ROLE_LABELS[role.role] || role.role}" wirklich entfernen? 
                            Der Mitarbeiter verliert alle damit verbundenen Berechtigungen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => removeRoleMutation.mutate(role.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Entfernen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Rollen zugewiesen</p>
              {isAdmin && (
                <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erste Rolle zuweisen
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rolle zuweisen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rolle auswählen</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Rolle wählen" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Die Rolle wird sofort aktiv und der Mitarbeiter erhält die entsprechenden Berechtigungen.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleAddRole} disabled={addRoleMutation.isPending || !selectedRole}>
              {addRoleMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Zuweisen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
