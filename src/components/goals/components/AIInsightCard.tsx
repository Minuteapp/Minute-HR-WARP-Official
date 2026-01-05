import { AIInsight } from '@/types/goals-statistics';
import { AlertCircle, Lightbulb, TrendingUp, Link2, Zap, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AIInsightCardProps {
  insight: AIInsight;
  onAction?: (insightId: string) => void;
}

export const AIInsightCard = ({ insight, onAction }: AIInsightCardProps) => {
  const typeConfig = {
    'warning': {
      icon: AlertCircle,
      label: 'Warnung',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      badgeColor: 'bg-yellow-100 text-yellow-700',
    },
    'recommendation': {
      icon: Lightbulb,
      label: 'Empfehlung',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    'forecast': {
      icon: TrendingUp,
      label: 'Prognose',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      badgeColor: 'bg-green-100 text-green-700',
    },
    'correlation': {
      icon: Link2,
      label: 'KPI-Korrelation',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      iconColor: 'text-purple-600',
      badgeColor: 'bg-purple-100 text-purple-700',
    },
    'new-goal': {
      icon: Target,
      label: 'Neue Zielempfehlung',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      iconColor: 'text-cyan-600',
      badgeColor: 'bg-cyan-100 text-cyan-700',
    },
    'capacity': {
      icon: Zap,
      label: 'Kapazitätsrisiko',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      iconColor: 'text-orange-600',
      badgeColor: 'bg-orange-100 text-orange-700',
    },
  };

  const config = typeConfig[insight.type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "rounded-xl p-6 shadow-sm border-2",
      config.bgColor,
      config.borderColor
    )}>
      <div className="flex items-start gap-3 mb-3">
        <Icon className={cn("h-5 w-5 mt-0.5", config.iconColor)} />
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-foreground">{insight.title}</h3>
            <Badge className={config.badgeColor}>
              {config.label} • {insight.confidence}%
            </Badge>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {insight.description}
      </p>

      <div className="bg-card/50 rounded-lg p-3 mb-4">
        <p className="text-xs font-semibold text-foreground mb-1">Empfohlene Aktion:</p>
        <p className="text-xs text-muted-foreground">{insight.action}</p>
      </div>

      {insight.actionable && (
        <Button
          onClick={() => onAction?.(insight.id)}
          className="w-full"
          size="sm"
        >
          Aktion durchführen →
        </Button>
      )}
    </div>
  );
};
