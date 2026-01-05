import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UpdateChainItem } from './UpdateChainItem';
import { Skeleton } from '@/components/ui/skeleton';

export const UpdateChainsList: React.FC = () => {
  const { data: chains, isLoading } = useQuery({
    queryKey: ['budget-update-chains'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_update_chains')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          Automatische Aktualisierungskette
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </>
        ) : chains && chains.length > 0 ? (
          chains.map((chain) => (
            <UpdateChainItem
              key={chain.id}
              triggerSource={chain.trigger_source}
              triggerDescription={chain.trigger_description || ''}
              resultAction={chain.result_action}
              resultDescription={chain.result_description || ''}
            />
          ))
        ) : (
          <p className="text-center text-muted-foreground py-4">
            Keine Aktualisierungsketten konfiguriert.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
