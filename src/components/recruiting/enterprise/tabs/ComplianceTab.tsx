import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import ComplianceHeader from '../compliance/ComplianceHeader';
import ComplianceKPICards from '../compliance/ComplianceKPICards';
import GDPRCountrySettings from '../compliance/GDPRCountrySettings';
import CandidatesWithoutConsent from '../compliance/CandidatesWithoutConsent';
import AuditLogsList from '../compliance/AuditLogsList';
import AIComplianceInfo from '../compliance/AIComplianceInfo';

const ComplianceTab = () => {
  const { tenantCompany } = useTenant();

  const { data: candidates = [] } = useQuery({
    queryKey: ['compliance-candidates', tenantCompany?.id],
    queryFn: async () => {
      if (!tenantCompany?.id) return [];
      const { data, error } = await supabase.from('candidates').select('id, gdpr_consent, gdpr_retention_until').eq('company_id', tenantCompany.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantCompany?.id
  });

  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const withConsentCount = candidates.filter((c: any) => c.gdpr_consent).length;
  const expiringCount = candidates.filter((c: any) => c.gdpr_retention_until && new Date(c.gdpr_retention_until) > now && new Date(c.gdpr_retention_until) <= in30Days).length;
  const expiredCount = candidates.filter((c: any) => c.gdpr_retention_until && new Date(c.gdpr_retention_until) < now).length;

  return (
    <div>
      <ComplianceHeader />
      <ComplianceKPICards totalCount={candidates.length} withConsentCount={withConsentCount} expiringCount={expiringCount} expiredCount={expiredCount} />
      
      <div className="grid grid-cols-2 gap-6 mb-6">
        <GDPRCountrySettings />
        <CandidatesWithoutConsent />
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <AuditLogsList />
        <AIComplianceInfo />
      </div>
    </div>
  );
};

export default ComplianceTab;
