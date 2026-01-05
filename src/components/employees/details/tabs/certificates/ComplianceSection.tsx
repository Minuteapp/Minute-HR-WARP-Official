import { CertificateWithStatus } from "@/integrations/supabase/hooks/useEmployeeCertificates";
import { CertificateCard } from "./CertificateCard";

interface ComplianceSectionProps {
  certificates: CertificateWithStatus[];
}

export const ComplianceSection = ({ certificates }: ComplianceSectionProps) => {
  if (!certificates || certificates.length === 0) return null;

  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-lg font-semibold">Pflichtschulungen (Compliance)</h3>
      <div className="space-y-3">
        {certificates.map(cert => (
          <CertificateCard key={cert.id} certificate={cert} isCompact />
        ))}
      </div>
    </div>
  );
};
