import { useTenant } from '@/contexts/TenantContext';
import { getSuperAdminUrl } from '@/utils/tenant';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export const useTenantNavigation = () => {
  const { tenantCompany, isSuperAdmin, refetchTenant } = useTenant();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Vereinfachte Logik - nur TenantContext verwenden
  const isInTenantMode = !!tenantCompany;

  // Prüfe auf abgelaufene Sessions und bereinige diese automatisch
  useEffect(() => {
    const checkSessionExpiry = async () => {
      if (!user?.id || !isInTenantMode) return;

      try {
        const { data: session } = await supabase
          .from('active_tenant_sessions')
          .select('expires_at, is_active')
          .eq('session_user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (session && session.expires_at) {
          const expiresAt = new Date(session.expires_at);
          const now = new Date();
          
          if (expiresAt < now) {
            // Session ist abgelaufen - bereinigen
            console.log('Tenant session expired, clearing...');
            await supabase.rpc('clear_tenant_context_with_user_id', {
              p_user_id: user.id
            });
            queryClient.clear();
            
            toast({
              variant: "destructive",
              title: "Session abgelaufen",
              description: "Ihre Tenant-Session ist abgelaufen. Bitte wählen Sie erneut einen Tenant.",
            });
            
            // Seite neu laden um den State zu aktualisieren
            window.location.href = getSuperAdminUrl();
          }
        }
      } catch (error) {
        console.error('Error checking session expiry:', error);
      }
    };

    checkSessionExpiry();
  }, [user?.id, isInTenantMode, queryClient, toast]);

  const clearTenantContext = async () => {
    try {
      if (!user?.id) {
        throw new Error('Benutzer nicht authentifiziert');
      }
      
      // CRITICAL: Clear React Query cache to prevent cross-tenant data leakage
      queryClient.clear();
      
      // Tenant-Session in der DB löschen
      const { error } = await supabase.rpc('clear_tenant_context_with_user_id', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error clearing tenant context:', error);
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Konnte Tenant-Kontext nicht verlassen",
        });
        return;
      }

      toast({
        title: "Tenant-Modus deaktiviert",
        description: "Sie sind zurück im Admin-Modus.",
      });
      
      // Tenant-Context neu laden
      window.location.href = getSuperAdminUrl();
      
    } catch (error) {
      console.error('Error in clearTenantContext:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
      });
    }
  };

  const navigateToSuperAdmin = async () => {
    // CRITICAL: Clear React Query cache before navigation
    queryClient.clear();
    
    if (isInTenantMode) {
      await clearTenantContext();
    } else {
      window.location.href = getSuperAdminUrl();
    }
  };

  return {
    navigateToSuperAdmin,
    clearTenantContext,
    isInTenantView: isInTenantMode,
    tenantCompany,
    isSuperAdmin,
    isInTenantMode,
    tenantCompanyName: tenantCompany?.name || null
  };
};