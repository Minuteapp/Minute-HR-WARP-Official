import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface TenantContextType {
  tenantCompanyId: string | null;
  tenantCompanyName: string | null;
  isInTenantMode: boolean;
  isAuthLoading: boolean;
  setTenantContext: (companyId: string, companyName: string, navigateTo?: string) => Promise<void>;
  clearTenantContext: () => Promise<void>;
}

export const useTenantContext = (): TenantContextType => {
  const [tenantCompanyId, setTenantCompanyId] = useState<string | null>(null);
  const [tenantCompanyName, setTenantCompanyName] = useState<string | null>(null);
  const [isInTenantMode, setIsInTenantMode] = useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const setTenantContext = useCallback(async (companyId: string, companyName: string, navigateTo?: string) => {
    try {
      console.log('🚀 Starting setTenantContext:', { 
        companyId, 
        companyName, 
        navigateTo,
        userId: user?.id,
        userEmail: user?.email,
        authLoading
      });
      
      // Warte auf Auth wenn noch am Laden
      if (authLoading) {
        console.log('⏳ Auth noch am Laden, warte...');
        toast({
          title: "Bitte warten",
          description: "Authentifizierung wird geladen...",
        });
        return;
      }
      
      if (!user?.id) {
        console.error('❌ User nicht verfügbar nach Auth-Laden!');
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Benutzer nicht authentifiziert. Bitte melden Sie sich erneut an.",
        });
        return;
      }
      
      console.log('📞 Calling RPC set_tenant_context_with_user_id...');
      const { data, error } = await supabase.rpc('set_tenant_context_with_user_id', {
        p_company_id: companyId,
        p_user_id: user.id
      });

      console.log('📊 RPC Response:', { 
        success: data?.success, 
        error: error?.message || data?.error,
        fullData: data,
        fullError: error 
      });

      if (error || !data?.success) {
        const errorMsg = error?.message || data?.error || 'Unbekannter Fehler';
        console.error('❌ Tenant-Session konnte nicht erstellt werden:', errorMsg);
        toast({
          variant: "destructive",
          title: "Fehler beim Wechseln",
          description: errorMsg,
        });
        return;
      }

      console.log('✅ Tenant context erfolgreich gesetzt');
      
      // State SOFORT aktualisieren
      setTenantCompanyId(companyId);
      setTenantCompanyName(companyName);
      setIsInTenantMode(true);
      
      toast({
        title: "Tenant-Modus aktiviert",
        description: `Sie arbeiten jetzt im Kontext von: ${companyName}`,
      });
      
      // Warte um sicherzustellen dass DB-Transaktion committed ist
      console.log('⏳ Waiting for DB commit...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigation
      if (navigateTo) {
        console.log('🔄 Navigating to:', navigateTo);
        window.location.assign(navigateTo);
      } else {
        console.log('✅ Tenant-Modus aktiv, keine Navigation erforderlich');
      }
      
    } catch (error) {
      console.error('💥 Exception in setTenantContext:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
      });
    }
  }, [toast, user, authLoading]);

  const clearTenantContext = useCallback(async () => {
    try {
      console.log('🧹 Clearing tenant context');
      console.log('👤 Current user for clear:', user);
      
      if (!user?.id) {
        throw new Error('Benutzer nicht authentifiziert');
      }
      
      // Verwende die neue Funktion mit expliziter User-ID
      const { data, error } = await supabase.rpc('clear_tenant_context_with_user_id', {
        p_user_id: user.id
      });

      if (error || !data?.success) {
        const errorMsg = error?.message || data?.error || 'Unbekannter Fehler';
        console.error('Error clearing tenant context:', errorMsg);
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Konnte Tenant-Kontext nicht verlassen: " + errorMsg,
        });
        return;
      }

      // Aktualisiere lokalen State
      setTenantCompanyId(null);
      setTenantCompanyName(null);
      setIsInTenantMode(false);
      
      toast({
        title: "Tenant-Modus deaktiviert",
        description: "Sie sind zurück im Admin-Modus.",
      });
      
      console.log('Tenant context cleared successfully');
      
      // KEINE automatische Navigation hier - der Caller entscheidet
      
    } catch (error) {
      console.error('Error in clearTenantContext:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
      });
    }
  }, [toast, user]);

  return {
    tenantCompanyId,
    tenantCompanyName,
    isInTenantMode,
    isAuthLoading: authLoading,
    setTenantContext,
    clearTenantContext
  };
};