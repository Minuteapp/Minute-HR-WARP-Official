
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Building2, Shield } from 'lucide-react';

interface SystemInfoCardsProps {
  performance?: {
    uptime: number;
    transactionsProcessed: number;
    avgResponseMs: number;
    activeUsers: number;
  };
  organization?: {
    costCenters: number;
    countries: number;
    locations: number;
    currencies: number;
    hierarchyLevels: number;
  };
  compliance?: {
    rate: number;
    policyViolations: number;
    aiAnomalies: number;
    countryRules: number;
  };
}

const SystemInfoCards = ({ performance, organization, compliance }: SystemInfoCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* System Performance */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Zap className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">Systemperformance</h4>
              <p className="text-2xl font-bold text-foreground mt-1">
                {performance?.uptime ? `${performance.uptime}% Uptime` : 'N/A'}
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• {performance?.transactionsProcessed?.toLocaleString() || 0} Transaktionen verarbeitet</li>
                <li>• Ø Response: {performance?.avgResponseMs || 0}ms</li>
                <li>• {performance?.activeUsers?.toLocaleString() || 0} aktive Nutzer</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Structure */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">Organisationsstruktur</h4>
              <p className="text-2xl font-bold text-foreground mt-1">
                {organization?.costCenters || 0} Kostenstellen
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• {organization?.countries || 0} Länder, {organization?.locations || 0} Standorte</li>
                <li>• {organization?.currencies || 0} Währungen aktiv</li>
                <li>• {organization?.hierarchyLevels || 0} hierarchische Ebenen</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Rate */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">Compliance-Rate</h4>
              <p className="text-2xl font-bold text-foreground mt-1">
                {compliance?.rate ? `${compliance.rate}%` : 'N/A'}
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• {compliance?.policyViolations || 0} Richtlinienverstöße</li>
                <li>• {compliance?.aiAnomalies || 0} KI-Anomalien</li>
                <li>• {compliance?.countryRules || 0} Länder-spezifische Regeln</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemInfoCards;
