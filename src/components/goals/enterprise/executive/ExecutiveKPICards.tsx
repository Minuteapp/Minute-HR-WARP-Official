import { Card, CardContent } from "@/components/ui/card";
import { Target, TrendingUp, AlertTriangle, Clock, Link2Off } from "lucide-react";

interface ExecutiveKPICardsProps {
  companyGoals: number;
  avgProgress: number;
  criticalCount: number;
  delayedCount: number;
  unlinkedCount: number;
}

export const ExecutiveKPICards = ({
  companyGoals,
  avgProgress,
  criticalCount,
  delayedCount,
  unlinkedCount
}: ExecutiveKPICardsProps) => {
  const kpis = [
    {
      icon: Target,
      value: companyGoals,
      label: 'Unternehmensziele',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: TrendingUp,
      value: `${avgProgress}%`,
      label: 'Zielerreichung',
      sublabel: 'Ø aller Ziele',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: AlertTriangle,
      value: criticalCount,
      label: 'Kritisch',
      sublabel: 'Hohes Risiko',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      icon: Clock,
      value: delayedCount,
      label: 'Verzögert',
      sublabel: 'At-Risk/Delayed',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: Link2Off,
      value: unlinkedCount,
      label: 'Unverknüpft',
      sublabel: 'Ohne Projekte',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ];

  return (
    <div className="grid grid-cols-5 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                {kpi.sublabel && (
                  <p className="text-xs text-muted-foreground">{kpi.sublabel}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
