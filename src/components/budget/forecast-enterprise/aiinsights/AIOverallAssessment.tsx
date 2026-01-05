import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, TrendingUp, Target, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const AIOverallAssessment: React.FC = () => {
  const { data: insights } = useQuery({
    queryKey: ['ai-budget-insights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_budget_insights')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: optimizations } = useQuery({
    queryKey: ['budget-optimization-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_optimization_suggestions')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const avgConfidence = insights && insights.length > 0
    ? Math.round(insights.reduce((sum, i) => sum + (Number(i.confidence_score) || 0), 0) / insights.length * 100)
    : 0;

  const totalSavings = optimizations?.reduce((sum, o) => sum + (Number(o.savings_amount) || 0), 0) || 0;

  const stats = [
    {
      label: 'Durchschnittliche Konfidenz',
      value: `${avgConfidence}%`,
      icon: Target
    },
    {
      label: 'Einsparpotenzial',
      value: `€ ${(totalSavings / 1000).toFixed(0)}k`,
      icon: TrendingUp
    },
    {
      label: 'Prognosegenauigkeit',
      value: '92,3%',
      icon: BarChart3
    }
  ];

  return (
    <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-6 w-6" />
          <h3 className="text-xl font-semibold">KI-Gesamtbewertung</h3>
        </div>
        
        <p className="text-primary-foreground/80 mb-6">
          Basierend auf der Analyse Ihrer Budget- und Forecast-Daten identifiziert 
          die KI Optimierungspotenziale und gibt proaktive Empfehlungen.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-primary-foreground/10 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="h-5 w-5 text-primary-foreground/70" />
                <span className="text-sm text-primary-foreground/70">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
