
import { Card, CardContent } from '@/components/ui/card';
import { Lock } from 'lucide-react';

const ComplianceInfoBox = () => {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-lg">Compliance & Datenschutz</h3>
            <p className="text-muted-foreground mt-2">
              Die Archivierung erfolgt gemäß <strong className="text-foreground">§ 147 AO (Abgabenordnung)</strong> und{' '}
              <strong className="text-foreground">§ 257 HGB (Handelsgesetzbuch)</strong>. Die Verarbeitung 
              personenbezogener Daten entspricht der <strong className="text-foreground">DSGVO</strong>. 
              Archivierte Belege werden auf zertifizierten Servern in Deutschland gespeichert.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceInfoBox;
