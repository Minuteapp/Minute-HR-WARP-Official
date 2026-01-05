import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Mail, Shield, Trash2, MoreHorizontal, Key, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyId } from '@/hooks/useCompanyId';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Admin {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: string;
  created_at: string;
  phone?: string;
}

const ADMIN_ROLES = [
  { value: 'admin', label: 'Administrator', description: 'Vollzugriff auf alle Einstellungen' },
  { value: 'hr_admin', label: 'HR Administrator', description: 'Vollzugriff auf HR-Funktionen' },
  { value: 'hr_manager', label: 'HR Manager', description: 'Verwaltet HR-Aufgaben' },
];

export const AdminsTab: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { companyId: tenantCompanyId, isLoading: isTenantLoading } = useCompanyId();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  
  // Form states
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('admin');
  const [newAdminPhone, setNewAdminPhone] = useState('');

  // Load company ID and admins
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      if (isTenantLoading) return;

      if (!tenantCompanyId) {
        setCompanyId(null);
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Keine Firma ausgewählt",
          description: "Bitte wählen Sie zuerst eine Firma aus, um Administratoren zu verwalten."
        });
        return;
      }

      try {
        setCompanyId(tenantCompanyId);

        // Load admins (users with admin roles in user_roles table)
        const { data: adminRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select(`
            id,
            user_id,
            role,
            status,
            created_at,
            profiles:user_id (
              id,
              email,
              full_name,
              phone
            )
          `)
          .eq('company_id', tenantCompanyId)
          .in('role', ['admin', 'hr_admin', 'hr_manager', 'superadmin']);

        if (rolesError) {
          console.error('Error loading admins:', rolesError);
          toast({
            variant: "destructive",
            title: "Fehler",
            description: "Administratoren konnten nicht geladen werden."
          });
        } else {
          const mappedAdmins: Admin[] = (adminRoles || []).map((r: any) => ({
            id: r.id,
            user_id: r.user_id,
            email: r.profiles?.email || 'Unbekannt',
            full_name: r.profiles?.full_name,
            role: r.role,
            status: r.status || 'active',
            created_at: r.created_at,
            phone: r.profiles?.phone
          }));
          setAdmins(mappedAdmins);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id, tenantCompanyId, isTenantLoading, toast]);

  const handleAddAdmin = async () => {
    if (!newAdminEmail) return;

    if (!companyId) {
      toast({
        variant: "destructive",
        title: "Keine Firma ausgewählt",
        description: "Bitte wählen Sie zuerst eine Firma aus, bevor Sie einen Admin hinzufügen."
      });
      return;
    }

    setIsSaving(true);
    try {
      // First check if user exists in profiles
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', newAdminEmail.toLowerCase())
        .single();
        
      if (existingProfile) {
        // User exists - add role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: existingProfile.id,
            company_id: companyId,
            role: newAdminRole,
            status: 'active'
          });
          
        if (roleError) {
          if (roleError.code === '23505') {
            toast({
              variant: "destructive",
              title: "Fehler",
              description: "Dieser Benutzer hat bereits eine Rolle in diesem Unternehmen."
            });
          } else {
            throw roleError;
          }
          return;
        }
        
        toast({
          title: "Admin hinzugefügt",
          description: `${newAdminEmail} wurde als ${ADMIN_ROLES.find(r => r.value === newAdminRole)?.label} hinzugefügt.`
        });
      } else {
        // User doesn't exist - create invitation
        const { error: inviteError } = await supabase
          .from('admin_invitations')
          .insert({
            company_id: companyId,
            email: newAdminEmail.toLowerCase(),
            full_name: newAdminName || null,
            phone: newAdminPhone || null,
            status: 'pending'
          });
          
        if (inviteError) throw inviteError;
        
        // Send invitation email via edge function
        setIsInviting(true);
        const { data: company } = await supabase
          .from('companies')
          .select('name')
          .eq('id', companyId)
          .single();
          
        const { error: emailError } = await supabase.functions.invoke('send-admin-invitation', {
          body: {
            email: newAdminEmail,
            name: newAdminName || newAdminEmail,
            companyName: company?.name || 'Unternehmen',
            companyId: companyId
          }
        });
        
        if (emailError) {
          console.error('Email error:', emailError);
          toast({
            title: "Admin eingeladen",
            description: `Einladung wurde erstellt, aber E-Mail konnte nicht gesendet werden.`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Einladung gesendet",
            description: `Eine Einladungs-E-Mail wurde an ${newAdminEmail} gesendet.`
          });
        }
      }
      
      // Reset form and reload
      setNewAdminEmail('');
      setNewAdminName('');
      setNewAdminRole('admin');
      setNewAdminPhone('');
      setShowAddDialog(false);
      
      // Reload admins
      window.location.reload();
      
    } catch (error: any) {
      console.error('Error adding admin:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Admin konnte nicht hinzugefügt werden."
      });
    } finally {
      setIsSaving(false);
      setIsInviting(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;
    
    // Prevent self-deletion
    if (selectedAdmin.user_id === user?.id) {
      toast({
        variant: "destructive",
        title: "Nicht erlaubt",
        description: "Sie können sich nicht selbst entfernen."
      });
      setShowDeleteDialog(false);
      return;
    }
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', selectedAdmin.id);
        
      if (error) throw error;
      
      toast({
        title: "Admin entfernt",
        description: `${selectedAdmin.email} wurde als Administrator entfernt.`
      });
      
      setAdmins(prev => prev.filter(a => a.id !== selectedAdmin.id));
      setShowDeleteDialog(false);
      setSelectedAdmin(null);
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Admin konnte nicht entfernt werden."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResendInvitation = async (admin: Admin) => {
    if (!companyId) return;
    
    setIsInviting(true);
    try {
      const { data: company } = await supabase
        .from('companies')
        .select('name')
        .eq('id', companyId)
        .single();
        
      const { error } = await supabase.functions.invoke('send-admin-invitation', {
        body: {
          email: admin.email,
          name: admin.full_name || admin.email,
          companyName: company?.name || 'Unternehmen',
          companyId: companyId
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Einladung erneut gesendet",
        description: `Eine neue Einladungs-E-Mail wurde an ${admin.email} gesendet.`
      });
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Einladung konnte nicht gesendet werden."
      });
    } finally {
      setIsInviting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; className: string }> = {
      superadmin: { label: 'Super Admin', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
      admin: { label: 'Administrator', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
      hr_admin: { label: 'HR Admin', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
      hr_manager: { label: 'HR Manager', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
    };
    const config = roleConfig[role] || { label: role, className: 'bg-gray-100 text-gray-700' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Aktiv</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Ausstehend</Badge>;
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
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Administratoren
            </CardTitle>
            <CardDescription>
              Verwalten Sie die Administratoren Ihres Unternehmens
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Admin hinzufügen
          </Button>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Keine Administratoren gefunden</p>
              <p className="text-sm">Fügen Sie den ersten Administrator hinzu.</p>
              <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Ersten Admin hinzufügen
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>E-Mail</TableHead>
                    <TableHead>Rolle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">
                        {admin.full_name || '-'}
                      </TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>{getRoleBadge(admin.role)}</TableCell>
                      <TableCell>{getStatusBadge(admin.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleResendInvitation(admin)}>
                              <Mail className="mr-2 h-4 w-4" />
                              Zugangsdaten senden
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Entfernen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Admin Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Administrator hinzufügen</DialogTitle>
            <DialogDescription>
              Fügen Sie einen neuen Administrator hinzu. Falls die Person noch keinen Account hat, wird eine Einladung per E-Mail gesendet.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-Mail-Adresse *</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@unternehmen.de"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Max Mustermann"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                placeholder="+49 123 456789"
                value={newAdminPhone}
                onChange={(e) => setNewAdminPhone(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Rolle *</Label>
              <Select value={newAdminRole} onValueChange={setNewAdminRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Rolle auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div>
                        <div className="font-medium">{role.label}</div>
                        <div className="text-xs text-muted-foreground">{role.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleAddAdmin} 
              disabled={!companyId || !newAdminEmail || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isInviting ? 'Einladung wird gesendet...' : 'Speichern...'}
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Admin hinzufügen
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Administrator entfernen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie <strong>{selectedAdmin?.email}</strong> wirklich als Administrator entfernen? 
              Diese Person verliert alle Administratorrechte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAdmin}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Entfernen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
