import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";
import { Employee } from "@/types/employee.types";
import { Badge } from "@/components/ui/badge";

interface CertificatesSectionProps {
  employee: Employee | null;
}

export const CertificatesSection = ({ employee }: CertificatesSectionProps) => {
  // No mock data - certificates should be loaded from database
  const certificates: Array<{ name: string; organization: string; date: string }> = [];

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Award className="h-4 w-4" />
          Zertifikate & Lizenzen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {certificates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Keine Zertifikate vorhanden
          </p>
        ) : (
          certificates.map((cert, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Award className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{cert.name}</h4>
                <p className="text-xs text-muted-foreground">{cert.organization} • {cert.date}</p>
              </div>
              <Badge variant="default" className="bg-black text-white flex-shrink-0">
                Gültig
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
