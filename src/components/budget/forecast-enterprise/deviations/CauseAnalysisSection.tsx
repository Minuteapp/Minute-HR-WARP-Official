import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CauseAnalysisItem } from './CauseAnalysisItem';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const CauseAnalysisSection = () => {
  const { data: deviations } = useQuery({
    queryKey: ['top-deviations-with-causes'],
    queryFn: async () => {
      // Get top 3 deviations by absolute deviation amount
      const { data: deviationData, error: devError } = await supabase
        .from('budget_deviations')
        .select('id, category, deviation_amount, deviation_percent')
        .order('deviation_amount', { ascending: false })
        .limit(3);
      
      if (devError) throw devError;
      
      if (!deviationData || deviationData.length === 0) return [];

      // Get causes for these deviations
      const deviationIds = deviationData.map(d => d.id);
      const { data: causesData, error: causesError } = await supabase
        .from('deviation_causes')
        .select('*')
        .in('deviation_id', deviationIds);
      
      if (causesError) throw causesError;

      // Combine deviations with their causes
      return deviationData.map(deviation => ({
        ...deviation,
        severity: Math.abs(deviation.deviation_percent || 0) > 10 ? 'critical' : 'warning',
        causes: (causesData || []).filter(c => c.deviation_id === deviation.id)
      }));
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ursachenanalyse – Top-3 Abweichungen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {deviations && deviations.length > 0 ? (
          deviations.map((deviation) => (
            <CauseAnalysisItem
              key={deviation.id}
              category={deviation.category}
              deviationPercent={deviation.deviation_percent || 0}
              deviationAmount={deviation.deviation_amount || 0}
              severity={deviation.severity as 'critical' | 'warning'}
              causes={deviation.causes.map(c => ({
                description: c.cause_description,
                impact_amount: c.impact_amount || 0
              }))}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Keine Abweichungen mit Ursachenanalyse verfügbar
          </div>
        )}
      </CardContent>
    </Card>
  );
};
