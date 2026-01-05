import { PulseKPICard } from '../shared/PulseKPICard';
import { TrendKPI } from '@/hooks/usePulseTrends';

interface TrendKPICardsProps {
  kpis: TrendKPI[];
}

export const TrendKPICards = ({ kpis }: TrendKPICardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <PulseKPICard
          key={index}
          icon={kpi.icon}
          label={kpi.label}
          value={kpi.value}
          subtitle={kpi.subtitle}
          trend={kpi.trend}
          color={kpi.color}
        />
      ))}
    </div>
  );
};
