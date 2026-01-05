import { useEmployeeCertificates } from "@/integrations/supabase/hooks/useEmployeeCertificates";
import { CertificateWarning } from "./certificates/CertificateWarning";
import { CertificateStats } from "./certificates/CertificateStats";
import { CertificatesList } from "./certificates/CertificatesList";
import { ComplianceSection } from "./certificates/ComplianceSection";
import { Skeleton } from "@/components/ui/skeleton";

export const CertificatesTab = ({ employeeId }: { employeeId: string }) => {
  const { data: certificates, isLoading } = useEmployeeCertificates(employeeId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!certificates) return null;

  const stats = {
    total: certificates.length,
    valid: certificates.filter(c => c.status === 'valid').length,
    expiringSoon: certificates.filter(c => c.status === 'expiring_soon').length,
    expired: certificates.filter(c => c.status === 'expired').length,
  };

  const expiringSoonCerts = certificates.filter(c => c.status === 'expiring_soon');
  const mainCertificates = certificates.filter(c => c.category !== 'compliance');
  const complianceCerts = certificates.filter(c => c.category === 'compliance');

  return (
    <div className="space-y-6">
      <CertificateWarning certificates={expiringSoonCerts} />
      <CertificateStats stats={stats} />
      <CertificatesList certificates={mainCertificates} employeeId={employeeId} />
      <ComplianceSection certificates={complianceCerts} />
    </div>
  );
};
