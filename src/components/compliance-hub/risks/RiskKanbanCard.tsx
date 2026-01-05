// Compliance Hub - Kompakte Risiko-Karte für Kanban
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, TrendingUp } from 'lucide-react';
import { ComplianceRisk } from './RiskCard';

interface RiskKanbanCardProps {
  risk: ComplianceRisk;
}

const severityBadgeConfig = {
  critical: { letter: 'K', className: 'bg-red-500 text-white' },
  high: { letter: 'H', className: 'bg-orange-500 text-white' },
  medium: { letter: 'M', className: 'bg-yellow-500 text-white' },
  low: { letter: 'N', className: 'bg-green-500 text-white' }
};

export const RiskKanbanCard: React.FC<RiskKanbanCardProps> = ({ risk }) => {
  const severityBadge = severityBadgeConfig[risk.severity];

  return (
    <Card className="bg-card cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${severityBadge.className}`}>
            {severityBadge.letter}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-foreground truncate">{risk.title}</h4>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {risk.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{risk.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>Score: {risk.riskScore}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
