import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Car, 
  Languages, 
  Shield, 
  Cloud, 
  Target, 
  Heart,
  Award,
  Download,
  RefreshCw
} from "lucide-react";
import { CertificateWithStatus } from "@/integrations/supabase/hooks/useEmployeeCertificates";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface CertificateCardProps {
  certificate: CertificateWithStatus;
  isCompact?: boolean;
}

const getCategoryIcon = (category: string | null, name: string) => {
  if (category === 'license') return <Car className="h-5 w-5" />;
  if (category === 'safety') return <Heart className="h-5 w-5" />;
  if (category === 'compliance') return <Shield className="h-5 w-5" />;
  
  // Professional category - check name for specific icons
  if (name.toLowerCase().includes('aws') || name.toLowerCase().includes('cloud')) {
    return <Cloud className="h-5 w-5" />;
  }
  if (name.toLowerCase().includes('scrum') || name.toLowerCase().includes('agile')) {
    return <Target className="h-5 w-5" />;
  }
  if (name.toLowerCase().includes('english') || name.toLowerCase().includes('language') || name.toLowerCase().includes('toefl')) {
    return <Languages className="h-5 w-5" />;
  }
  
  return <Award className="h-5 w-5" />;
};

const getCategoryLabel = (category: string | null) => {
  const labels: Record<string, string> = {
    license: 'Lizenz',
    professional: 'Fachlich',
    compliance: 'Compliance',
    safety: 'Sicherheit',
  };
  return category ? labels[category] || 'Sonstiges' : 'Sonstiges';
};

const getStatusBadge = (status: CertificateWithStatus['status']) => {
  const variants = {
    valid: { variant: 'success' as const, label: 'Gültig' },
    expiring_soon: { variant: 'warning' as const, label: 'Läuft bald ab' },
    expired: { variant: 'destructive' as const, label: 'Abgelaufen' },
  };
  
  const config = variants[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const CertificateCard = ({ certificate, isCompact = false }: CertificateCardProps) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd.MM.yyyy', { locale: de });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            {getCategoryIcon(certificate.category, certificate.name)}
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header with Name and Status */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-semibold text-base">{certificate.name}</h4>
              {getStatusBadge(certificate.status)}
            </div>

            {/* Details */}
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="font-normal">
                  {getCategoryLabel(certificate.category)}
                </Badge>
                <span>•</span>
                <span>{certificate.provider}</span>
              </div>

              <div className="flex items-center gap-2">
                <span>Ausgestellt: {formatDate(certificate.issued_date)}</span>
                {certificate.expiry_date && (
                  <>
                    <span>•</span>
                    <span>Gültig bis: {formatDate(certificate.expiry_date)}</span>
                  </>
                )}
              </div>

              {certificate.score && (
                <div>Score: {certificate.score}</div>
              )}

              {certificate.certificate_number && (
                <div className="font-mono text-xs">{certificate.certificate_number}</div>
              )}

              {/* Validity Status */}
              {certificate.expiry_date ? (
                certificate.daysUntilExpiry !== null && certificate.daysUntilExpiry > 0 ? (
                  <div className="text-xs">
                    Noch {certificate.daysUntilExpiry} Tage gültig
                  </div>
                ) : null
              ) : (
                <div className="text-xs text-green-600">Unbegrenzt gültig</div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {!isCompact && (
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
