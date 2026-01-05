import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCertificatesData } from '@/hooks/employee-tabs/useCertificatesData';
import { Award, AlertTriangle, Calendar, FileText } from 'lucide-react';

interface CertificatesTabContentProps {
  employeeId: string;
}

export const CertificatesTabContent: React.FC<CertificatesTabContentProps> = ({ employeeId }) => {
  const { certificates, statistics, byCategory, isLoading } = useCertificatesData(employeeId);

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Lade Zertifikate...</div>;
  }

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const threeMonths = new Date();
    threeMonths.setMonth(now.getMonth() + 3);
    return expiry > now && expiry <= threeMonths;
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Statistiken */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{statistics.total}</p>
              <p className="text-xs text-muted-foreground">Gesamt</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{statistics.active}</p>
              <p className="text-xs text-muted-foreground">Aktiv</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{statistics.expiringSoon}</p>
              <p className="text-xs text-muted-foreground">Läuft bald ab</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{statistics.expired}</p>
              <p className="text-xs text-muted-foreground">Abgelaufen</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zertifikate nach Kategorie */}
      {Object.entries(byCategory).map(([category, certs]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              {category}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(certs as any[]).map((cert) => (
                <div key={cert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium">{cert.certificate_name}</h5>
                      {isExpired(cert.expiry_date) && (
                        <Badge variant="destructive" className="text-xs">
                          Abgelaufen
                        </Badge>
                      )}
                      {isExpiringSoon(cert.expiry_date) && !isExpired(cert.expiry_date) && (
                        <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Läuft bald ab
                        </Badge>
                      )}
                    </div>
                    
                    {cert.issuing_organization && (
                      <p className="text-sm text-muted-foreground">
                        Ausgestellt von: {cert.issuing_organization}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Ausgestellt: {new Date(cert.issue_date).toLocaleDateString('de-DE')}
                      </div>
                      {cert.expiry_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Gültig bis: {new Date(cert.expiry_date).toLocaleDateString('de-DE')}
                        </div>
                      )}
                    </div>
                    
                    {cert.certificate_number && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Zertifikatsnummer: {cert.certificate_number}
                      </p>
                    )}
                  </div>
                  
                  {cert.file_url && (
                    <a 
                      href={cert.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      <FileText className="h-5 w-5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {certificates.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Keine Zertifikate vorhanden
          </CardContent>
        </Card>
      )}
    </div>
  );
};
