import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OptimizationItem } from './OptimizationItem';
import { Skeleton } from '@/components/ui/skeleton';

export const OptimizationSuggestions: React.FC = () => {
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['budget-optimization-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_optimization_suggestions')
        .select('*')
        .order('savings_amount', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const totalSavings = suggestions?.reduce((sum, s) => sum + (Number(s.savings_amount) || 0), 0) || 0;

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `€ ${(value / 1000).toFixed(0)}k`;
    }
    return `€ ${value.toLocaleString('de-DE')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Automatische Kostenoptimierungsvorschläge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </>
        ) : suggestions && suggestions.length > 0 ? (
          <>
            {suggestions.map((suggestion) => (
              <OptimizationItem
                key={suggestion.id}
                title={suggestion.title}
                description={suggestion.description || ''}
                savingsAmount={Number(suggestion.savings_amount) || 0}
                savingsType={suggestion.savings_type || 'Einsparpotenzial'}
              />
            ))}
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="font-medium text-foreground">
                Gesamtes Optimierungspotenzial:
              </span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(totalSavings)} p.a.
              </span>
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            Keine Optimierungsvorschläge vorhanden.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
