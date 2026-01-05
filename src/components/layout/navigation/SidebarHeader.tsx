import React from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { useTenantNavigation } from '@/hooks/useTenantNavigation';
import { getSuperAdminUrl } from '@/utils/tenant';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ isCollapsed, toggleCollapse }) => {
  const { tenantCompany } = useTenant();
  const { isInTenantMode, tenantCompanyName, clearTenantContext } = useTenantNavigation();
  const { user } = useAuth();

  // Prüfe ob der Benutzer ein SuperAdmin ist (nur dann "Zurück zu Admin" anzeigen)
  const { data: isSuperAdminUser } = useQuery({
    queryKey: ['is-superadmin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'superadmin')
        .maybeSingle();
      return !!data;
    },
    enabled: !!user?.id
  });

  // Zurück zu Admin Button nur anzeigen wenn:
  // 1. User ist SuperAdmin UND
  // 2. User ist gerade im Tenant-Modus (hat eine Firma ausgewählt)
  const showBackToAdminButton = isSuperAdminUser && (tenantCompany || tenantCompanyName || isInTenantMode);

  // Zurück zu Admin mit korrekter DB-Session-Bereinigung
  const handleBackToAdmin = async () => {
    console.log('[BackToAdmin] Button clicked', new Date().toISOString());
    try {
      // Aktive Impersonation-Session beenden falls vorhanden
      const { data: { user } } = await supabase.auth.getUser();
      console.log('[BackToAdmin] User fetched:', user?.id);
      if (user) {
        await supabase
          .from('impersonation_sessions')
          .update({ ended_at: new Date().toISOString(), status: 'ended' })
          .eq('superadmin_id', user.id)
          .eq('status', 'active');
        console.log('[BackToAdmin] Impersonation session ended');
      }
      
      // Tenant-Kontext bereinigen
      console.log('[BackToAdmin] Clearing tenant context...');
      await clearTenantContext();
      console.log('[BackToAdmin] Tenant context cleared, navigating...');
      
      // Zur Super-Admin URL navigieren (ohne Tenant-Parameter)
      window.location.assign(getSuperAdminUrl());
    } catch (error) {
      console.error('[BackToAdmin] Fehler:', error);
      window.location.assign(getSuperAdminUrl());
    }
  };

  return (
    <div className="border-b border-gray-200">
      {/* Zurück zu Admin Button - nur für SuperAdmins im Tenant-Modus */}
      {showBackToAdminButton && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBackToAdmin}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 w-full justify-start"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zu Admin
          </Button>
        </div>
      )}
      
      {/* Header mit Logo und Firmenname */}
      <div className="p-4 flex justify-between items-center">
        <div className={`flex flex-col ${isCollapsed ? 'items-center' : ''}`}>
          {isCollapsed ? (
            <span className="font-bold text-xl text-primary">M</span>
          ) : (
            <>
              <img src="/lovable-uploads/30ec8215-e67e-43c7-a4d7-b6f30eca644a.png" alt="Minute Logo" className="h-6" />
              {(tenantCompany || tenantCompanyName || isInTenantMode) && (
                <span className="text-xs text-gray-500 mt-1">
                  {tenantCompanyName || tenantCompany?.name || "Unbekannte Firma"}
                </span>
              )}
            </>
          )}
        </div>
        <button
          type="button"
          onClick={toggleCollapse}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};