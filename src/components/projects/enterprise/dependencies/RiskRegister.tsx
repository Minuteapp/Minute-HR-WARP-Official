import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RiskRegisterCard from './RiskRegisterCard';

interface RiskItem {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'in-progress' | 'identified' | 'mitigated';
  projectName: string;
  owner: string;
  impact: number;
  mitigationStrategy: string;
}

interface RiskRegisterProps {
  risks: RiskItem[];
}

const RiskRegister = ({ risks }: RiskRegisterProps) => {
  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Risiko-Register</CardTitle>
      </CardHeader>
      <CardContent>
        {risks.length > 0 ? (
          <div className="space-y-4">
            {risks.map((risk) => (
              <RiskRegisterCard key={risk.id} risk={risk} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Keine Risiken registriert
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RiskRegister;
