import { useState, useEffect } from 'react';
import { KPIMetric } from '@/types/goals-statistics';
import { goalsStatisticsService } from '@/services/goalsStatisticsService';
import { ArrowUp, ArrowDown, ArrowRight, BarChart3 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export const OKRKPITab = () => {
  const [metrics, setMetrics] = useState<KPIMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await goalsStatisticsService.getKPIMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Fehler beim Laden der KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">KPI-Übersicht</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((metric) => {
          const TrendIcon = 
            metric.trend === 'up' ? ArrowUp : 
            metric.trend === 'down' ? ArrowDown : 
            ArrowRight;
          
          const trendColor = 
            metric.status === 'on-track' ? 'text-green-600' :
            metric.status === 'at-risk' ? 'text-yellow-600' :
            'text-red-600';

          const bgColor = 
            metric.status === 'on-track' ? 'bg-green-50' :
            metric.status === 'at-risk' ? 'bg-yellow-50' :
            'bg-red-50';

          return (
            <div key={metric.id} className={cn("rounded-xl p-6 shadow-sm border", bgColor)}>
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">{metric.name}</h3>
                <TrendIcon className={cn("h-5 w-5", trendColor)} />
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-4xl font-bold text-foreground">
                  {metric.currentValue} {metric.unit}
                </p>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Ziel: {metric.targetValue} {metric.unit}
              </p>

              <Progress value={metric.progress} className="h-3 mb-2" />
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Fortschritt</span>
                <span className="font-semibold text-foreground">{metric.progress}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
