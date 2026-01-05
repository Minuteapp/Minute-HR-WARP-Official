
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { AddUserParams, EditUserParams } from './types';
import { logSecurityEvent, logRoleChange } from '@/utils/security/audit-logger';
import { isValidEmail, isValidRole, validateStringLength } from '@/utils/security/input-validation';

export const useUserMutations = (isSuperAdmin: boolean) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Add user mutation
  const addUserMutation = useMutation({
    mutationFn: async ({ email, password, role }: AddUserParams) => {
      // Input validation
      if (!isValidEmail(email)) {
        throw new Error('Ungültige E-Mail-Adresse.');
      }
      
      if (!validateStringLength(password, 8, 128)) {
        throw new Error('Passwort muss zwischen 8 und 128 Zeichen lang sein.');
      }
      
      if (!isValidRole(role)) {
        throw new Error('Ungültige Rolle angegeben.');
      }

      // Log security event
      await logSecurityEvent({
        action: 'user_creation_attempt',
        resourceType: 'user',
        resourceId: email,
        success: false, // Will be updated on success
        details: { targetRole: role, performedBy: 'current_user' }
      });
      
      // Nur Superadmins dürfen Superadmins erstellen
      if (!isSuperAdmin && role === 'superadmin') {
        await logSecurityEvent({
          action: 'unauthorized_superadmin_creation',
          resourceType: 'user',
          resourceId: email,
          success: false,
          riskLevel: 'high',
          details: { attemptedRole: role }
        });
        throw new Error('Nur Superadmins haben die Berechtigung, einen Superadmin zu erstellen.');
      }

      // Normale Admins dürfen nur Mitarbeiter und Moderatoren erstellen
      if (!isSuperAdmin && role === 'admin') {
        await logSecurityEvent({
          action: 'unauthorized_admin_creation',
          resourceType: 'user',
          resourceId: email,
          success: false,
          riskLevel: 'high',
          details: { attemptedRole: role }
        });
        throw new Error('Sie haben keine Berechtigung, einen Administrator zu erstellen.');
      }

      // Create the user in Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { 
          role,
          // Superadmins sollten niemals mit einer Firma verknüpft sein
          company_id: role === 'superadmin' ? null : undefined
        }
      });

      if (error) {
        await logSecurityEvent({
          action: 'user_creation_failed',
          resourceType: 'user',
          resourceId: email,
          success: false,
          details: { error: error.message, targetRole: role }
        });
        throw error;
      }

      // Log successful creation
      await logSecurityEvent({
        action: 'user_created',
        resourceType: 'user',
        resourceId: data.user?.id,
        success: true,
        details: { email, role, createdUserId: data.user?.id }
      });

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Benutzer erstellt",
        description: "Der Benutzer wurde erfolgreich erstellt."
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler beim Erstellen des Benutzers",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Edit user mutation
  const editUserMutation = useMutation({
    mutationFn: async ({ userId, newRole }: EditUserParams) => {
      // Input validation
      if (!isValidRole(newRole)) {
        throw new Error('Ungültige Rolle angegeben.');
      }

      // Prüfe den aktuellen Benutzer, um zu sehen, ob er mit einer Firma verknüpft ist
      const { data: userData, error: fetchError } = await supabase.auth.admin.getUserById(userId);
      
      if (fetchError) {
        await logSecurityEvent({
          action: 'user_role_change_failed',
          resourceType: 'user',
          resourceId: userId,
          success: false,
          details: { error: fetchError.message, targetRole: newRole }
        });
        throw fetchError;
      }
      
      const metadata = userData.user.user_metadata || {};
      const oldRole = metadata.role || 'employee';
      
      // Log role change attempt
      await logSecurityEvent({
        action: 'role_change_attempt',
        resourceType: 'user',
        resourceId: userId,
        success: false,
        details: { oldRole, newRole, targetUserId: userId }
      });
      
      // Nur Superadmins dürfen andere zu Superadmins machen
      if (!isSuperAdmin && newRole === 'superadmin') {
        await logSecurityEvent({
          action: 'unauthorized_role_elevation',
          resourceType: 'user',
          resourceId: userId,
          success: false,
          riskLevel: 'critical',
          details: { oldRole, attemptedRole: newRole, targetUserId: userId }
        });
        throw new Error('Nur Superadmins haben die Berechtigung, einen Benutzer zum Superadmin zu machen.');
      }

      // Normale Admins dürfen keine anderen Admins erstellen
      if (!isSuperAdmin && newRole === 'admin') {
        await logSecurityEvent({
          action: 'unauthorized_admin_promotion',
          resourceType: 'user',
          resourceId: userId,
          success: false,
          riskLevel: 'high',
          details: { oldRole, attemptedRole: newRole, targetUserId: userId }
        });
        throw new Error('Sie haben keine Berechtigung, einen Benutzer zum Administrator zu machen.');
      }
      
      // Update the user in Supabase Auth
      const { data, error } = await supabase.auth.admin.updateUserById(
        userId,
        { 
          user_metadata: { 
            ...metadata,
            role: newRole,
            // Wenn der Benutzer zum Superadmin wird, entferne die Firmenverknüpfung
            company_id: newRole === 'superadmin' ? null : metadata.company_id 
          } 
        }
      );

      if (error) {
        await logSecurityEvent({
          action: 'role_change_failed',
          resourceType: 'user',
          resourceId: userId,
          success: false,
          details: { error: error.message, oldRole, targetRole: newRole }
        });
        throw error;
      }

      // Log successful role change
      await logRoleChange(userId, oldRole, newRole);
      await logSecurityEvent({
        action: 'role_changed',
        resourceType: 'user',
        resourceId: userId,
        success: true,
        details: { oldRole, newRole, targetUserId: userId }
      });

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Benutzerrolle aktualisiert",
        description: "Die Rolle des Benutzers wurde erfolgreich aktualisiert."
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler beim Aktualisieren der Benutzerrolle",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Get the user to check their role
      const { data: userData, error: fetchError } = await supabase.auth.admin.getUserById(userId);
      
      if (fetchError) {
        await logSecurityEvent({
          action: 'user_deletion_failed',
          resourceType: 'user',
          resourceId: userId,
          success: false,
          details: { error: fetchError.message }
        });
        throw fetchError;
      }
      
      const userToDeleteRole = userData.user.user_metadata?.role || 'employee';
      const userEmail = userData.user.email;
      
      // Log deletion attempt
      await logSecurityEvent({
        action: 'user_deletion_attempt',
        resourceType: 'user',
        resourceId: userId,
        success: false,
        details: { targetRole: userToDeleteRole, targetEmail: userEmail }
      });
      
      // Check if current user can delete this user
      if (!isSuperAdmin && userToDeleteRole === 'superadmin') {
        await logSecurityEvent({
          action: 'unauthorized_superadmin_deletion',
          resourceType: 'user',
          resourceId: userId,
          success: false,
          riskLevel: 'critical',
          details: { targetRole: userToDeleteRole, targetEmail: userEmail }
        });
        throw new Error('Sie haben keine Berechtigung, einen Superadmin zu löschen.');
      }

      // Delete the user
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) {
        await logSecurityEvent({
          action: 'user_deletion_failed',
          resourceType: 'user',
          resourceId: userId,
          success: false,
          details: { error: error.message, targetRole: userToDeleteRole }
        });
        throw error;
      }

      // Log successful deletion
      await logSecurityEvent({
        action: 'user_deleted',
        resourceType: 'user',
        resourceId: userId,
        success: true,
        details: { deletedRole: userToDeleteRole, deletedEmail: userEmail }
      });

      return userId;
    },
    onSuccess: () => {
      toast({
        title: "Benutzer gelöscht",
        description: "Der Benutzer wurde erfolgreich gelöscht."
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler beim Löschen des Benutzers",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    addUserMutation,
    editUserMutation,
    deleteUserMutation
  };
};
