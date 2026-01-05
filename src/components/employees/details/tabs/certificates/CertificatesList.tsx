import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CertificateWithStatus } from "@/integrations/supabase/hooks/useEmployeeCertificates";
import { CertificateCard } from "./CertificateCard";

interface CertificatesListProps {
  certificates: CertificateWithStatus[];
  employeeId: string;
}

export const CertificatesList = ({ certificates, employeeId }: CertificatesListProps) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Alle Zertifikate & Lizenzen</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neues Zertifikat
        </Button>
      </div>

      {/* Certificates List */}
      <div className="space-y-3">
        {certificates.length > 0 ? (
          certificates.map(cert => (
            <CertificateCard key={cert.id} certificate={cert} />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Keine Zertifikate vorhanden
          </div>
        )}
      </div>
    </div>
  );
};
