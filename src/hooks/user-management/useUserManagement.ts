import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@/types/user.types';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin, isSuperAdmin } = useRolePermissions();
  const { tenantCompany } = useTenant();

  // Lade Benutzerdaten aus der Datenbank
  useEffect(() => {
    const fetchUsers = async () => {
      if (!tenantCompany?.id) {
        setUsers([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Lade Benutzer aus profiles mit user_roles für die aktuelle Firma
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select(`
            user_id,
            role,
            profiles:user_id (
              id,
              email,
              full_name,
              avatar_url
            )
          `)
          .eq('company_id', tenantCompany.id);

        if (rolesError) {
          console.error('Error fetching users:', rolesError);
          throw rolesError;
        }

        // Transformiere zu User-Format
        const transformedUsers: User[] = (userRoles || [])
          .filter(ur => ur.profiles)
          .map(ur => ({
            id: ur.user_id,
            email: (ur.profiles as any)?.email || '',
            name: (ur.profiles as any)?.full_name || '',
            role: ur.role || 'user',
            active: true,
            lastLogin: null,
            created: new Date().toISOString()
          }));

        setUsers(transformedUsers);
        setError(null);
      } catch (err: any) {
        setError(err instanceof Error ? err : new Error('Unbekannter Fehler beim Laden der Benutzer'));
        toast({
          variant: 'destructive',
          title: 'Fehler',
          description: 'Benutzer konnten nicht geladen werden.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [toast, tenantCompany?.id]);

  // Filtere Benutzer basierend auf Suchanfrage
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = users.filter(
        user => 
          user.name?.toLowerCase().includes(query) || 
          user.email.toLowerCase().includes(query) ||
          user.role?.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchQuery]);

  // Benutzer hinzufügen
  const handleAddUser = useCallback(async (newUser: Omit<User, 'id'>) => {
    try {
      setIsLoading(true);
      
      // Mock-API-Aufruf mit Verzögerung
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userWithId: User = {
        ...newUser,
        id: uuidv4(),
      };
      
      setUsers(prev => [...prev, userWithId]);
      
      toast({
        title: 'Benutzer erstellt',
        description: `Benutzer ${newUser.name || newUser.email} wurde erfolgreich angelegt.`,
      });
      
      setOpenAddDialog(false);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Benutzer konnte nicht erstellt werden.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Benutzer bearbeiten
  const handleEditUser = useCallback(async (updatedUser: User) => {
    try {
      setIsLoading(true);
      
      // Mock-API-Aufruf mit Verzögerung
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prev => 
        prev.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        )
      );
      
      toast({
        title: 'Benutzer aktualisiert',
        description: `Benutzer ${updatedUser.name || updatedUser.email} wurde erfolgreich aktualisiert.`,
      });
      
      setOpenEditDialog(false);
      setSelectedUser(null);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Benutzer konnte nicht aktualisiert werden.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Benutzer löschen
  const handleDeleteUser = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      
      // Mock-API-Aufruf mit Verzögerung
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      toast({
        title: 'Benutzer gelöscht',
        description: 'Der Benutzer wurde erfolgreich gelöscht.',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Benutzer konnte nicht gelöscht werden.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Benutzer zum Bearbeiten auswählen
  const handleEditClick = useCallback((user: User) => {
    setSelectedUser(user);
    setOpenEditDialog(true);
  }, []);

  return {
    users: filteredUsers,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    openAddDialog,
    setOpenAddDialog,
    openEditDialog,
    setOpenEditDialog,
    selectedUser,
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
    handleEditClick,
    isAdmin,
    isSuperAdmin
  };
};
