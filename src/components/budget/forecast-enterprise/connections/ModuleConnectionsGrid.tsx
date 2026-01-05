import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ModuleConnectionCard } from './ModuleConnectionCard';
import { Skeleton } from '@/components/ui/skeleton';

export const ModuleConnectionsGrid: React.FC = () => {
  const { data: connections, isLoading } = useQuery({
    queryKey: ['budget-module-connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_module_connections')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  if (!connections || connections.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Keine Modul-Verknüpfungen vorhanden.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {connections.map((connection) => (
        <ModuleConnectionCard
          key={connection.id}
          moduleName={connection.module_name}
          moduleType={connection.module_type}
          description={connection.description || ''}
          status={connection.status as 'active' | 'pending' | 'inactive'}
          linkedAmount={Number(connection.linked_amount) || 0}
          lastSync={connection.last_sync_at || undefined}
        />
      ))}
    </div>
  );
};
