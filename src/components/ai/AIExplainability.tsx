import React from 'react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  HelpCircle, 
  Info, 
  Database, 
  Clock, 
  Zap,
  ChevronRight
} from 'lucide-react';

export interface AIDecisionReasoning {
  summary: string;
  factors: Array<{
    name: string;
    weight: number;
    value: string;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
  dataSources: string[];
  confidenceScore: number;
  modelUsed: string;
  processingTime?: number;
  timestamp: string;
}

interface AIExplainabilityProps {
  reasoning: AIDecisionReasoning;
  variant?: 'tooltip' | 'dialog' | 'inline';
  className?: string;
}

export const AIExplainability: React.FC<AIExplainabilityProps> = ({
  reasoning,
  variant = 'tooltip',
  className = '',
}) => {
  const renderConfidenceBadge = () => {
    const color = 
      reasoning.confidenceScore >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
      reasoning.confidenceScore >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    
    return (
      <Badge className={color}>
        {reasoning.confidenceScore}% Konfidenz
      </Badge>
    );
  };

  const renderFactorImpact = (impact: 'positive' | 'negative' | 'neutral') => {
    switch (impact) {
      case 'positive':
        return <span className="text-green-600">+</span>;
      case 'negative':
        return <span className="text-red-600">−</span>;
      default:
        return <span className="text-muted-foreground">○</span>;
    }
  };

  const detailedContent = (
    <div className="space-y-4">
      {/* Header mit Konfidenz */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <span className="font-medium">KI-Entscheidungsanalyse</span>
        </div>
        {renderConfidenceBadge()}
      </div>

      {/* Zusammenfassung */}
      <div className="p-3 bg-muted rounded-lg">
        <p className="text-sm">{reasoning.summary}</p>
      </div>

      {/* Faktoren */}
      {reasoning.factors.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Entscheidungsfaktoren</h4>
          <div className="space-y-2">
            {reasoning.factors.map((factor, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 border rounded-lg text-sm"
              >
                <div className="flex items-center gap-2">
                  {renderFactorImpact(factor.impact)}
                  <span>{factor.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{factor.value}</span>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(factor.weight * 100)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Datenquellen */}
      <div>
        <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
          <Database className="h-4 w-4" />
          Verwendete Datenquellen
        </h4>
        <div className="flex flex-wrap gap-1">
          {reasoning.dataSources.map((source, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {source}
            </Badge>
          ))}
        </div>
      </div>

      {/* Metadaten */}
      <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {reasoning.modelUsed}
          </span>
          {reasoning.processingTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {reasoning.processingTime}ms
            </span>
          )}
        </div>
        <span>{new Date(reasoning.timestamp).toLocaleString('de-DE')}</span>
      </div>
    </div>
  );

  const shortContent = (
    <div className="space-y-2 max-w-sm">
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">KI-Erklärung</span>
        {renderConfidenceBadge()}
      </div>
      <p className="text-sm text-muted-foreground">{reasoning.summary}</p>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Database className="h-3 w-3" />
        <span>{reasoning.dataSources.length} Datenquellen</span>
      </div>
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className={`p-4 border rounded-lg bg-card ${className}`}>
        {detailedContent}
      </div>
    );
  }

  if (variant === 'dialog') {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className={className}>
            <HelpCircle className="h-4 w-4 mr-1" />
            Erklärung
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              KI-Entscheidungserklärung
            </DialogTitle>
            <DialogDescription>
              So kam diese KI-Empfehlung zustande
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {detailedContent}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  // Tooltip variant (default)
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className={`h-6 w-6 ${className}`}>
            <Info className="h-4 w-4 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="p-3">
          {shortContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Hilfsfunktion zum Erstellen eines Reasoning-Objekts
export const createAIReasoning = (
  summary: string,
  factors: AIDecisionReasoning['factors'] = [],
  dataSources: string[] = [],
  confidenceScore: number = 75,
  modelUsed: string = 'gpt-4o-mini'
): AIDecisionReasoning => ({
  summary,
  factors,
  dataSources,
  confidenceScore,
  modelUsed,
  timestamp: new Date().toISOString(),
});

export default AIExplainability;
