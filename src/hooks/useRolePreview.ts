import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

export type UserRole = 'admin' | 'hr_admin' | 'team_lead' | 'employee';

interface RolePreviewSession {
  preview_role: UserRole;
  original_role: UserRole;
  is_preview_active: boolean;
}

export const useRolePreview = () => {
  const [previewRole, setPreviewRole] = useState<UserRole | null>(null);
  const [originalRole, setOriginalRole] = useState<UserRole>('employee');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Lade aktuelle Preview-Session
  useEffect(() => {
    if (!user?.id) return;

    const loadPreviewSession = async () => {
      try {
        const { data, error } = await supabase
          .from('user_role_preview_sessions')
          .select('preview_role, original_role, is_preview_active')
          .eq('user_id', user.id)
          .eq('is_preview_active', true)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Fehler beim Laden der Preview-Session:', error);
          return;
        }

        if (data) {
          setPreviewRole(data.preview_role as UserRole);
          setOriginalRole(data.original_role as UserRole);
        } else {
          // Keine aktive Preview-Session
          setPreviewRole(null);
          
          // Hole originale Rolle
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (roleData) {
            setOriginalRole(roleData.role as UserRole);
          }
        }
      } catch (err) {
        console.error('Fehler beim Laden der Preview-Session:', err);
      }
    };

    loadPreviewSession();
  }, [user?.id]);

  // Aktiviere Role Preview
  const activateRolePreview = async (targetRole: UserRole) => {
    if (!user?.id) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Kein Benutzer angemeldet',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('set_role_preview', {
        p_preview_role: targetRole,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; preview_role?: string; original_role?: string };

      if (!result.success) {
        throw new Error(result.error || 'Fehler beim Aktivieren des Role Preview');
      }

      setPreviewRole(targetRole);
      setOriginalRole(result.original_role as UserRole || originalRole);

      toast({
        title: '🎭 Role Preview aktiviert',
        description: `Du siehst jetzt die Ansicht eines ${getRoleLabel(targetRole)}-Users`,
      });

      // Force Reload der Seite für vollständige Permission-Aktualisierung
      window.location.reload();
    } catch (err) {
      console.error('Fehler beim Aktivieren des Role Preview:', err);
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: err instanceof Error ? err.message : 'Fehler beim Aktivieren des Role Preview',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Deaktiviere Role Preview
  const deactivateRolePreview = async () => {
    if (!user?.id) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('clear_role_preview');

      if (error) throw error;

      const result = data as { success: boolean; error?: string };

      if (!result.success) {
        throw new Error(result.error || 'Fehler beim Deaktivieren des Role Preview');
      }

      setPreviewRole(null);

      toast({
        title: '✅ Zurück zur Admin-Ansicht',
        description: 'Du siehst jetzt wieder deine normale Ansicht',
      });

      // Force Reload der Seite
      window.location.reload();
    } catch (err) {
      console.error('Fehler beim Deaktivieren des Role Preview:', err);
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: err instanceof Error ? err.message : 'Fehler beim Deaktivieren des Role Preview',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Hilfsfunktion: Rolle zu deutschem Label
  const getRoleLabel = (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
      admin: 'Admin',
      hr_admin: 'HR-Admin',
      team_lead: 'Teamleiter',
      employee: 'Mitarbeiter',
    };
    return labels[role] || role;
  };

  return {
    previewRole,
    originalRole,
    isPreviewActive: !!previewRole,
    isLoading,
    activateRolePreview,
    deactivateRolePreview,
    getRoleLabel,
  };
};
