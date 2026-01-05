import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CriticalCostCenterItem } from './CriticalCostCenterItem';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const CriticalCostCenters = () => {
  const { data: costCenters = [] } = useQuery({
    queryKey: ['critical-cost-centers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cost_centers')
        .select('*')
        .order('deviation_percent', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
  });

  const hasData = costCenters.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Kritische Kostenstellen</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="space-y-3">
            {costCenters.map((center) => (
              <CriticalCostCenterItem
                key={center.id}
                name={center.name}
                responsible={center.responsible_person || '-'}
                deviationAmount={center.deviation_amount || 0}
                deviationPercent={center.deviation_percent || 0}
                status={center.status as 'critical' | 'warning' | 'under_budget' | 'normal'}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Keine Kostenstellen mit Abweichungen vorhanden
          </div>
        )}
      </CardContent>
    </Card>
  );
};
