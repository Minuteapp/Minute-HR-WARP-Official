import { useEffect } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { useRolePreview, UserRole } from './useRolePreview';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOriginalRole } from './useOriginalRole';

interface TenantRolePreviewState {
  canUseTenantRolePreview: boolean;
  availableRoles: UserRole[];
  currentPreviewRole: UserRole | null;
  isInTenantMode: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  switchToRole: (role: UserRole) => Promise<void>;
  exitPreview: () => Promise<void>;
  getRoleLabel: (role: UserRole) => string;
}

/**
 * Hook für SuperAdmins um im Tenant-Modus verschiedene Rollen zu testen
 * Kombiniert Tenant-Context mit Role-Preview-Funktionalität
 * 
 * WICHTIG: Verwendet useOriginalRole() um die ECHTE Rolle zu prüfen,
 * damit SuperAdmins auch während einer aktiven Preview den Switcher nutzen können.
 */
export const useTenantRolePreview = (): TenantRolePreviewState => {
  const { user } = useAuth();
  const { tenantCompany, isSuperAdmin: isSuperAdminFromTenant } = useTenant();
  const { isOriginalSuperAdmin, loading: originalRoleLoading } = useOriginalRole();
  const { 
    previewRole, 
    isLoading, 
    activateRolePreview, 
    deactivateRolePreview,
    getRoleLabel 
  } = useRolePreview();

  // KRITISCH: Verwende die ORIGINALE Rolle für die Berechtigungsprüfung
  // Damit bleibt der Switcher auch während eines aktiven Previews sichtbar
  const isSuperAdmin = isOriginalSuperAdmin || isSuperAdminFromTenant;

  console.log('🎭 useTenantRolePreview Hook CALLED:', {
    userEmail: user?.email,
    userId: user?.id,
    isSuperAdminFromTenant,
    isOriginalSuperAdmin,
    isSuperAdmin,
    tenantCompany: tenantCompany?.name,
    previewRole,
    isLoading,
    originalRoleLoading
  });

  // Prüfe ob Tenant-Role-Preview genutzt werden kann
  // SuperAdmin kann IMMER Role-Preview nutzen (eigene Entwicklung + Tenant-Modus)
  const isInTenantMode = !!tenantCompany;
  const canUseTenantRolePreview = isSuperAdmin; // SuperAdmin kann immer switchen
  
  console.log('🎯 canUseTenantRolePreview:', canUseTenantRolePreview, '(isOriginalSuperAdmin:', isOriginalSuperAdmin, ')');

  // Dynamisches Laden der verfügbaren Rollen
  const { data: availableRoles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ['company-available-roles', tenantCompany?.id, 'superadmin-mode'],
    queryFn: async () => {
      // Wenn im Tenant-Modus: Lade firmenspezifische Rollen
      if (tenantCompany?.id) {
        // 1. Prüfe zuerst ob es eine Rollenkonfiguration für die Firma gibt
        const { data: roleConfig, error: configError } = await supabase
          .from('company_role_configurations')
          .select('available_roles, role_labels')
          .eq('company_id', tenantCompany.id)
          .maybeSingle();
        
        if (configError && configError.code !== 'PGRST116') {
          console.error('Fehler beim Laden der Rollenkonfiguration:', configError);
        }
        
        // 2. Wenn Konfiguration vorhanden: Nutze diese
        if (roleConfig?.available_roles && roleConfig.available_roles.length > 0) {
          console.log('✅ Rollenkonfiguration für Firma gefunden:', roleConfig.available_roles);
          return roleConfig.available_roles as UserRole[];
        }
        
        // 3. Fallback: Lade aus user_roles Tabelle
        console.log('⚠️ Keine Rollenkonfiguration - Fallback zu user_roles');
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('company_id', tenantCompany.id)
          .neq('role', 'superadmin');
        
        if (error) {
          console.error('Fehler beim Laden der Rollen:', error);
          return ['admin', 'manager', 'hr', 'employee'] as UserRole[];
        }
        
        const uniqueRoles = [...new Set(data.map(r => r.role))];
        const mappedRoles = uniqueRoles.map(role => {
          if (role === 'hr_manager') return 'hr';
          return role;
        }) as UserRole[];
        
        return mappedRoles.length > 0 ? mappedRoles : ['admin', 'manager', 'hr', 'employee'] as UserRole[];
      }
      
      // Wenn NICHT im Tenant-Modus (eigene Entwicklungsumgebung):
      // Alle Standard-Rollen verfügbar machen
      console.log('🔧 SuperAdmin Rollen-Vorschau - alle Rollen verfügbar');
      return ['admin', 'manager', 'hr', 'employee'] as UserRole[];
    },
    enabled: canUseTenantRolePreview,
    staleTime: 5 * 60 * 1000, // 5 Minuten Cache
  });

  useEffect(() => {
    console.log('🎭 useTenantRolePreview State:', {
      isSuperAdmin,
      isInTenantMode,
      tenantCompany: tenantCompany?.name || 'Eigene Entwicklungsumgebung',
      canUseTenantRolePreview,
      currentPreviewRole: previewRole,
      availableRoles,
      mode: tenantCompany ? 'Tenant-Modus' : 'Entwicklungsmodus'
    });
  }, [isSuperAdmin, isInTenantMode, tenantCompany, canUseTenantRolePreview, previewRole, availableRoles]);

  // Wechsle zu einer bestimmten Rolle
  const switchToRole = async (role: UserRole) => {
    if (!canUseTenantRolePreview) {
      console.warn('Role-Preview nicht verfügbar');
      return;
    }

    const context = tenantCompany?.name || 'Entwicklungsumgebung';
    console.log(`🔄 Wechsle zu Rolle: ${role} in ${context}`);
    await activateRolePreview(role);
  };

  // Verlasse Preview-Modus (zurück zur normalen SuperAdmin-Ansicht)
  const exitPreview = async () => {
    console.log('🚪 Verlasse Role-Preview');
    await deactivateRolePreview();
  };

  return {
    canUseTenantRolePreview,
    availableRoles,
    currentPreviewRole: previewRole,
    isInTenantMode,
    isSuperAdmin,
    isLoading: isLoading || isLoadingRoles || originalRoleLoading,
    switchToRole,
    exitPreview,
    getRoleLabel
  };
};
