import { Card, CardContent } from '@/components/ui/card';

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

interface RiskRegisterCardProps {
  risk: RiskItem;
}

const RiskRegisterCard = ({ risk }: RiskRegisterCardProps) => {
  const getSeverityBadge = (severity: string) => {
    const styles: Record<string, string> = {
      'critical': 'bg-red-500 text-white',
      'high': 'bg-red-100 text-red-600 border border-red-200',
      'medium': 'bg-yellow-100 text-yellow-600 border border-yellow-200',
      'low': 'bg-green-100 text-green-600 border border-green-200',
    };
    const labels: Record<string, string> = {
      'critical': 'Kritisch',
      'high': 'Hoch',
      'medium': 'Mittel',
      'low': 'Niedrig',
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${styles[severity]}`}>
        {labels[severity]}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'in-progress': 'bg-orange-100 text-orange-600 border border-orange-200',
      'identified': 'bg-blue-100 text-blue-600 border border-blue-200',
      'mitigated': 'bg-green-100 text-green-600 border border-green-200',
    };
    const labels: Record<string, string> = {
      'in-progress': 'In Bearbeitung',
      'identified': 'Identifiziert',
      'mitigated': 'Gemildert',
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <Card className="border border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">{risk.title}</h4>
          <div className="flex gap-2">
            {getSeverityBadge(risk.severity)}
            {getStatusBadge(risk.status)}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">{risk.description}</p>
        
        <div className="flex items-center gap-2 mb-3 text-sm">
          <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-700">
            {risk.projectName}
          </span>
          <span className="text-muted-foreground">Owner: {risk.owner}</span>
          <span className="text-muted-foreground">• Impact: {risk.impact}</span>
        </div>
        
        <div>
          <p className="text-xs text-muted-foreground mb-1">Mitigation Strategy:</p>
          <p className="text-sm">{risk.mitigationStrategy}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskRegisterCard;
