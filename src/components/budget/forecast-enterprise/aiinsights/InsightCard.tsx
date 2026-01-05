import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Info, ChevronRight, Plus } from 'lucide-react';
import { InsightTypeBadge } from './InsightTypeBadge';
import { ConfidenceBar } from './ConfidenceBar';

interface InsightCardProps {
  title: string;
  type: 'warning' | 'opportunity' | 'info';
  confidence: number;
  description: string;
  impact?: string;
  recommendation?: string;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'warning': return AlertTriangle;
    case 'opportunity': return TrendingUp;
    default: return Info;
  }
};

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  type,
  confidence,
  description,
  impact,
  recommendation
}) => {
  const Icon = getIcon(type);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
              type === 'warning' ? 'bg-red-100' : 
              type === 'opportunity' ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              <Icon className={`h-5 w-5 ${
                type === 'warning' ? 'text-red-600' : 
                type === 'opportunity' ? 'text-green-600' : 'text-blue-600'
              }`} />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{title}</h4>
              <InsightTypeBadge type={type} />
            </div>
          </div>
          <div className="w-32">
            <p className="text-xs text-muted-foreground mb-1">Konfidenz</p>
            <ConfidenceBar value={confidence} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        
        {impact && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Auswirkung</p>
            <p className="text-sm font-medium">{impact}</p>
          </div>
        )}
        
        {recommendation && (
          <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
            <p className="text-xs text-primary mb-1">Empfehlung</p>
            <p className="text-sm">{recommendation}</p>
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="gap-1">
            Details <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" /> Aktion erstellen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
