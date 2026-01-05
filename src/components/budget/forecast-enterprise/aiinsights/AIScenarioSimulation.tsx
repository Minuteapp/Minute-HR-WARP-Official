import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar, TrendingDown, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const AIScenarioSimulation: React.FC = () => {
  const examples = [
    {
      title: 'Einstellung um 1 Monat verschieben',
      impact: '-€ 48.000',
      icon: Calendar,
      description: 'Auswirkung auf Q1 Personalkosten'
    },
    {
      title: 'Marketing-Budget um 10% reduzieren',
      impact: '-€ 95.000',
      icon: TrendingDown,
      description: 'Jährliche Einsparung'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            KI-Szenario-Simulation
          </CardTitle>
          <Badge className="bg-primary/10 text-primary border-primary/20">
            Neu
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Simulieren Sie verschiedene Szenarien und sehen Sie sofort die finanziellen 
          Auswirkungen auf Ihr Budget.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {examples.map((example, index) => (
            <div 
              key={index}
              className="bg-muted/50 rounded-lg p-4 border hover:border-primary/30 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <example.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{example.title}</p>
                  <p className="text-xs text-muted-foreground">{example.description}</p>
                </div>
                <span className="text-lg font-bold text-green-600">{example.impact}</span>
              </div>
            </div>
          ))}
        </div>

        <Button className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Neue Simulation starten
        </Button>
      </CardContent>
    </Card>
  );
};
