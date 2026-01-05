
import { Card, CardContent } from '@/components/ui/card';
import { Info, ExternalLink } from 'lucide-react';

const PoliciesLimitsSection = () => {
  return (
    <Card className="bg-purple-50 border-purple-100">
      <CardContent className="flex items-start gap-4 py-6">
        <div className="p-3 bg-purple-100 rounded-lg">
          <Info className="h-6 w-6 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-2">
            Richtlinien & Limits
          </h3>
          <p className="text-muted-foreground mb-4">
            Die detaillierten Richtlinien und Ausgabenlimits können im separaten "Richtlinien" Tab konfiguriert werden.
            Dort finden Sie alle Optionen für Betragsgrezen, Kategorie-Beschränkungen und Genehmigungsregeln.
          </p>
          <a 
            href="#" 
            className="inline-flex items-center gap-2 text-purple-600 font-medium hover:text-purple-700"
          >
            Zum Richtlinien-Tab
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default PoliciesLimitsSection;
