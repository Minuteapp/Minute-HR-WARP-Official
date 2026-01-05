import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface WidgetDataSource {
  id: string;
  source_name: string;
  source_module: string;
  query_config: Record<string, any>;
  cache_ttl_seconds: number;
  requires_roles: string[];
  is_active: boolean;
}

export const useWidgetData = (dataSourceId: string | undefined, refreshInterval?: number) => {
  return useQuery({
    queryKey: ['widget-data', dataSourceId],
    queryFn: async () => {
      if (!dataSourceId) return null;

      // 1. Hole Data Source Config
      const { data: dataSource, error: dsError } = await supabase
        .from('dashboard_data_sources')
        .select('*')
        .eq('id', dataSourceId)
        .single();

      if (dsError) throw dsError;
      if (!dataSource) return null;

      // 2. Simulierte Daten für MVP (später durch echte API-Calls ersetzen)
      const mockData = generateMockData(dataSource);
      
      return mockData;
    },
    enabled: !!dataSourceId,
    refetchInterval: refreshInterval ? refreshInterval * 1000 : false,
    staleTime: 60000, // 1 minute default cache
  });
};

// Empty data generator - returns empty state instead of mock data
function generateMockData(dataSource: WidgetDataSource): any {
  const { query_config } = dataSource;
  const metric = query_config?.metric;

  // Return empty data based on metric type
  if (metric?.includes('hours') || metric?.includes('time')) {
    return {
      value: 0,
      label: 'Stunden',
      trend: { value: '0%', direction: 'neutral' as const }
    };
  }

  if (metric?.includes('coverage') || metric?.includes('percent')) {
    return {
      value: 0,
      label: '%',
      trend: { value: '0%', direction: 'neutral' as const }
    };
  }

  if (metric?.includes('count') || metric?.includes('tickets')) {
    return {
      value: 0,
      label: 'Anzahl',
      trend: { value: '0', direction: 'neutral' as const }
    };
  }

  // Default empty data
  return {
    value: 0,
    label: 'Wert',
    items: []
  };
}
