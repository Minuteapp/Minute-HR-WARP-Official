import { useTenant } from '@/contexts/TenantContext';

/**
 * Hook um die aktuelle Company-ID zu erhalten
 * Verwendet den TenantContext um die ID der aktuellen Firma zu ermitteln
 */
export const useCompanyId = () => {
  const { tenantCompany } = useTenant();
  
  return {
    companyId: tenantCompany?.id || null,
    companyName: tenantCompany?.name || null,
    isLoading: !tenantCompany
  };
};
