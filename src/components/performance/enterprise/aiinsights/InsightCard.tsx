import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Lightbulb, TrendingUp, Info } from 'lucide-react';
import { InsightPriorityBadge } from './InsightPriorityBadge';
import { InsightTypeBadge } from './InsightTypeBadge';
import { InsightRecommendation } from './InsightRecommendation';

interface InsightCardProps {
  insight: {
    id: string;
    priority: 'high' | 'medium' | 'info';
    insight_type: 'warning' | 'pattern' | 'suggestion' | 'summary';
    title: string;
    description: string | null;
    recommendation: string | null;
  };
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const getIcon = () => {
    switch (insight.insight_type) {
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'pattern':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'suggestion':
        return <Lightbulb className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1">{getIcon()}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <InsightPriorityBadge priority={insight.priority} />
              <InsightTypeBadge type={insight.insight_type} />
            </div>
            <h4 className="font-semibold text-foreground mb-1">{insight.title}</h4>
            {insight.description && (
              <p className="text-sm text-muted-foreground">{insight.description}</p>
            )}
            {insight.recommendation && (
              <InsightRecommendation recommendation={insight.recommendation} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
