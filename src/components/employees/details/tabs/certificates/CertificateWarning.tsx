import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { CertificateWithStatus } from "@/integrations/supabase/hooks/useEmployeeCertificates";

interface CertificateWarningProps {
  certificates: CertificateWithStatus[];
}

export const CertificateWarning = ({ certificates }: CertificateWarningProps) => {
  if (!certificates || certificates.length === 0) return null;

  return (
    <Alert className="bg-yellow-50 border-yellow-200">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">
        {certificates.length} Zertifikat{certificates.length > 1 ? 'e' : ''} läuft/laufen in den nächsten 6 Monaten ab
      </AlertTitle>
      <AlertDescription className="flex items-center gap-2 flex-wrap mt-2">
        {certificates.map(cert => (
          <Badge key={cert.id} variant="outline" className="bg-white">
            {cert.name} ({cert.daysUntilExpiry} Tage)
          </Badge>
        ))}
        <Button variant="link" className="h-auto p-0 text-yellow-800 hover:text-yellow-900">
          Verlängerungen planen →
        </Button>
      </AlertDescription>
    </Alert>
  );
};
