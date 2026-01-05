import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AuditLogItem } from './AuditLogItem';
import { Skeleton } from '@/components/ui/skeleton';

export const AuditLogSection: React.FC = () => {
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['budget-audit-logs-recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: totalCount } = useQuery({
    queryKey: ['budget-audit-logs-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('budget_audit_logs')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Änderungsprotokoll (Letzte Aktivitäten)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </>
        ) : auditLogs && auditLogs.length > 0 ? (
          <>
            {auditLogs.map((log) => (
              <AuditLogItem
                key={log.id}
                actionType={log.action_type}
                actionDescription={log.action_description || ''}
                targetName={log.target_name || ''}
                targetType={log.target_type || ''}
                performedBy={log.performed_by || 'System'}
                performedByRole={log.performed_by_role || ''}
                createdAt={log.created_at || new Date().toISOString()}
              />
            ))}
            <Button variant="link" className="w-full gap-1 text-primary">
              Alle Protokolleinträge anzeigen ({totalCount} Einträge)
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            Keine Protokolleinträge vorhanden.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
