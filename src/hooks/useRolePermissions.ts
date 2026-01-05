
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Ein Hook, um die Berechtigungen eines Benutzers basierend auf seiner Rolle zu prüfen
 */
export const useRolePermissions = () => {
  const { user } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canManageUsers, setCanManageUsers] = useState(false);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  
  useEffect(() => {
    if (!user) {
      setIsSuperAdmin(false);
      setIsAdmin(false);
      setCanManageUsers(false);
      setUserPermissions([]);
      return;
    }
    
    const checkUserRoles = async () => {
      try {
        // 1. PRÜFE ZUERST ROLE PREVIEW (nur für Superadmins)
        const { data: previewData } = await supabase
          .from('user_role_preview_sessions')
          .select('preview_role, original_role, is_preview_active')
          .eq('user_id', user.id)
          .eq('is_preview_active', true)
          .maybeSingle();
        
        let effectiveRole = '';
        let actualRole = '';
        
        // 2. HOLE TATSÄCHLICHE ROLLE
        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role, company_id')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error && error.code !== 'PGRST116') {
          console.error("Fehler beim Abrufen der Benutzerrolle:", error);
        }
        
        actualRole = roleData?.role?.toLowerCase() || '';
        
        // 2.5 PRÜFE IMPERSONATION SESSION
        const { data: impersonationData } = await supabase
          .from('impersonation_sessions')
          .select('target_user_id, mode')
          .eq('superadmin_id', user.id)
          .eq('status', 'active')
          .gt('expires_at', new Date().toISOString())
          .maybeSingle();
        
        // 3. BESTIMME EFFEKTIVE ROLLE (Priorität: Impersonation > Preview > Actual)
        if (impersonationData?.target_user_id) {
          // Lade Rolle des Zielnutzers bei aktiver Impersonation
          const { data: targetRoleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', impersonationData.target_user_id)
            .maybeSingle();
          
          if (targetRoleData?.role) {
            effectiveRole = targetRoleData.role.toLowerCase();
            console.log('👤 Impersonation aktiv: Verwende Rolle des Zielnutzers:', effectiveRole);
          } else {
            // Fallback auf 'mitarbeiter' wenn keine Rolle gefunden
            effectiveRole = 'mitarbeiter';
            console.log('👤 Impersonation aktiv: Zielnutzer hat keine Rolle, verwende mitarbeiter');
          }
        } else if (previewData?.is_preview_active) {
          effectiveRole = previewData.preview_role.toLowerCase();
          console.log('🎭 Role Preview aktiv:', effectiveRole, '(Original:', actualRole, ')');
        } else {
          effectiveRole = actualRole;
        }
        
        const databaseRole = effectiveRole;
        
        // SICHERHEITSKRITISCH: NUR Datenbankprüfung
        const isSuperAdminSecure = databaseRole === 'superadmin';
        
        if (isSuperAdminSecure) {
          setIsSuperAdmin(true);
          setIsAdmin(true);
          setCanManageUsers(true);
          setUserPermissions(['*', 'manage:goals:personal', 'manage:goals:team', 'manage:goals:company']);
          return;
        }
        
        // Admin-Prüfung
        if (databaseRole === 'admin') {
          setIsSuperAdmin(false);
          setIsAdmin(true);
          setCanManageUsers(true);
          
          const { data: permissionData } = await supabase
            .from('role_permissions')
            .select('permission_name')
            .eq('role_name', 'admin');
            
          setUserPermissions(permissionData?.map(p => p.permission_name) || [
            'access:users', 
            'access:settings', 
            'manage:employees', 
            'manage:projects', 
            'view:reports',
            'manage:departments',
            'access:billing',
            'manage:goals:team',
            'manage:goals:company',
            // Abwesenheits-Permissions
            'absence:view_all',
            'absence:approve',
            'absence:reject',
            'absence:manage_settings',
            'absence:create',
            'absence:edit',
            'absence:delete',
            'absence:export'
          ]);
          
          return;
        }
        
        // Für reguläre Benutzer
        setIsSuperAdmin(false);
        setIsAdmin(false);
        
        const isManager = databaseRole === 'manager' || databaseRole === 'hr_manager';
        setCanManageUsers(isManager);
        
        const { data: permissionData } = await supabase
          .from('role_permissions')
          .select('permission_name')
          .eq('role_name', roleData?.role || 'user');
          
        setUserPermissions(permissionData?.map(p => p.permission_name) || [
          'access:dashboard', 
          'view:projects', 
          'create:tasks', 
          'edit:own_profile',
          'manage:goals:personal'
        ]);
        
      } catch (error) {
        console.error('Error checking user roles:', error);
        setIsSuperAdmin(false);
        setIsAdmin(false);
        setCanManageUsers(false);
        setUserPermissions([]);
      }
    };

    checkUserRoles();
  }, [user]);
  
  /**
   * Prüft, ob der Benutzer eine bestimmte Berechtigung hat
   */
  const hasPermission = (permission: string) => {
    // Super-Admin hat alle Berechtigungen
    if (isSuperAdmin || userPermissions.includes('*')) {
      return true;
    }
    
    // Prüfen, ob die spezifische Berechtigung vorhanden ist
    return userPermissions.includes(permission);
  };
  
  return { isSuperAdmin, isAdmin, canManageUsers, hasPermission };
};
