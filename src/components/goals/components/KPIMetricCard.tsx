import { KPIMetric } from '@/types/goals-statistics';
import { ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface KPIMetricCardProps {
  metric: KPIMetric;
}

export const KPIMetricCard = ({ metric }: KPIMetricCardProps) => {
  const TrendIcon = metric.trend === 'up' ? ArrowUp : metric.trend === 'down' ? ArrowDown : ArrowRight;
  
  const trendColor = 
    metric.status === 'on-track' ? 'text-green-600' :
    metric.status === 'at-risk' ? 'text-yellow-600' :
    'text-red-600';

  return (
    <div className="py-3 border-b last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <p className="font-medium text-foreground">{metric.name}</p>
          <p className="text-xs text-muted-foreground">Ziel: {metric.targetValue} {metric.unit}</p>
        </div>
        <div className="text-right flex items-center gap-2">
          <p className="text-xl font-bold text-foreground">{metric.currentValue} {metric.unit}</p>
          <TrendIcon className={cn("h-4 w-4", trendColor)} />
        </div>
      </div>
      <Progress value={metric.progress} className="h-1.5" />
    </div>
  );
};
