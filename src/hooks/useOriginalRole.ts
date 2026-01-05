import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook der die ORIGINALE Rolle des Benutzers zurückgibt,
 * OHNE Role-Preview Berücksichtigung.
 * Wird für SuperAdminRoute verwendet, damit SuperAdmins
 * immer auf das Admin-Modul zugreifen können.
 * 
 * Verwendet eine 3-stufige Fallback-Kette:
 * 1. Direkte DB-Abfrage (user_roles Tabelle)
 * 2. RPC-Funktion (umgeht RLS-Probleme)
 * 3. User Metadata (als letzter Fallback)
 */
export const useOriginalRole = () => {
  const { user, session } = useAuth();
  const [originalRole, setOriginalRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // KRITISCH: Warte auf vollständige Authentifizierung (Session UND User)
    if (!session) {
      console.log('🔄 useOriginalRole: Warte auf Session...');
      setOriginalRole(null);
      setLoading(true);
      return;
    }
    
    if (!user) {
      console.log('🔄 useOriginalRole: Session vorhanden, aber kein User');
      setOriginalRole(null);
      setLoading(false);
      return;
    }
    
    const fetchOriginalRole = async () => {
      try {
        console.log('🔍 useOriginalRole: Hole originale Rolle für:', user.email, 'User-ID:', user.id);
        
        // ========== METHODE 1: Direkte Datenbankabfrage ==========
        const { data: roleData, error: dbError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (!dbError && roleData?.role) {
          const role = roleData.role.toLowerCase();
          console.log('✅ useOriginalRole: DB-Abfrage erfolgreich, Rolle:', role);
          setOriginalRole(role);
          setLoading(false);
          return;
        }
        
        if (dbError) {
          console.warn('⚠️ useOriginalRole: DB-Abfrage fehlgeschlagen:', dbError.message);
        } else {
          console.warn('⚠️ useOriginalRole: Keine Rolle in DB gefunden');
        }
        
        // ========== METHODE 2: RPC-Funktion (umgeht RLS) ==========
        console.log('🔄 useOriginalRole: Versuche RPC-Funktion...');
        const { data: rpcRole, error: rpcError } = await supabase
          .rpc('get_user_original_role', { p_user_id: user.id });
          
        if (!rpcError && rpcRole) {
          const role = rpcRole.toLowerCase();
          console.log('✅ useOriginalRole: RPC-Funktion erfolgreich, Rolle:', role);
          setOriginalRole(role);
          setLoading(false);
          return;
        }
        
        if (rpcError) {
          console.warn('⚠️ useOriginalRole: RPC-Funktion fehlgeschlagen:', rpcError.message);
        }
        
        // ========== METHODE 3: User Metadata (letzter Fallback) ==========
        const metaRole = user.user_metadata?.role;
        if (metaRole) {
          const role = String(metaRole).toLowerCase();
          console.log('⚠️ useOriginalRole: Fallback auf user_metadata, Rolle:', role);
          setOriginalRole(role);
          setLoading(false);
          return;
        }
        
        console.error('❌ useOriginalRole: Keine Rolle gefunden in allen 3 Methoden');
        setOriginalRole(null);
        setLoading(false);
        
      } catch (error) {
        console.error('❌ useOriginalRole: Unerwarteter Fehler:', error);
        setOriginalRole(null);
        setLoading(false);
      }
    };

    fetchOriginalRole();
  }, [user, session]); // KRITISCH: Abhängigkeit von session UND user
  
  const isOriginalSuperAdmin = originalRole === 'superadmin';
  
  console.log('📊 useOriginalRole Status:', { originalRole, isOriginalSuperAdmin, loading });
  
  return { 
    originalRole, 
    isOriginalSuperAdmin,
    loading 
  };
};
