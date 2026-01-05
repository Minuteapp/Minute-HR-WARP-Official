import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Clock, Users } from 'lucide-react';

interface AISuggestionCardProps {
  suggestion: {
    id: string;
    title: string;
    description: string | null;
    impact: string | null;
    category: string | null;
    modules: string[] | null;
    confidence_percent: number | null;
    time_savings_hours: number | null;
    estimated_usage_monthly: number | null;
  };
}

export const AISuggestionCard: React.FC<AISuggestionCardProps> = ({ suggestion }) => {
  const getImpactBadge = (impact: string | null) => {
    switch (impact) {
      case 'very_high':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Sehr Hoch Impact</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Hoch Impact</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Mittel Impact</Badge>;
      default:
        return <Badge variant="secondary">Niedrig Impact</Badge>;
    }
  };

  const getCategoryBadge = (category: string | null) => {
    if (!category) return null;
    
    const categoryColors: Record<string, string> = {
      'Compliance': 'bg-blue-100 text-blue-700',
      'Optimierung': 'bg-green-100 text-green-700',
      'Prozess': 'bg-purple-100 text-purple-700',
      'Risiko-Management': 'bg-red-100 text-red-700',
    };

    return (
      <Badge className={`${categoryColors[category] || 'bg-gray-100 text-gray-700'} hover:bg-opacity-100`}>
        {category}
      </Badge>
    );
  };

  const confidence = suggestion.confidence_percent || 0;
  const timeSavings = Number(suggestion.time_savings_hours) || 0;
  const estimatedUsage = suggestion.estimated_usage_monthly || 0;

  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-foreground">{suggestion.title}</h4>
              {getImpactBadge(suggestion.impact)}
              {getCategoryBadge(suggestion.category)}
            </div>
            {suggestion.description && (
              <p className="text-sm text-muted-foreground">{suggestion.description}</p>
            )}
          </div>
        </div>

        {/* Module Tags */}
        {suggestion.modules && suggestion.modules.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {suggestion.modules.map((module) => (
              <Badge key={module} variant="outline" className="text-xs">
                {module}
              </Badge>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Konfidenz</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={confidence} className="flex-1 h-2" />
              <span className="text-sm font-medium text-foreground">{confidence}%</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Zeitersparnis</span>
            </div>
            <p className="text-sm font-medium text-foreground">{timeSavings} Std/Monat</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Geschätzte Nutzung</span>
            </div>
            <p className="text-sm font-medium text-foreground">{estimatedUsage}x/Monat</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button className="bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4 mr-2" />
            Generieren
          </Button>
          <Button variant="outline">Details</Button>
        </div>
      </CardContent>
    </Card>
  );
};
