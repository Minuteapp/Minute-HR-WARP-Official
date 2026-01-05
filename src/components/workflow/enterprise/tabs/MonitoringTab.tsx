import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MonitoringKPICards } from '../monitoring/MonitoringKPICards';
import { ExecutionLogsList } from '../monitoring/ExecutionLogsList';
import { ExecutionDetailsPanel } from '../monitoring/ExecutionDetailsPanel';
import { useToast } from '@/hooks/use-toast';

export const MonitoringTab = () => {
  const { toast } = useToast();
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: executions = [], isLoading, refetch } = useQuery({
    queryKey: ['workflow-executions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_executions')
        .select(`
          *,
          workflow:workflow_definitions(name)
        `)
        .order('started_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []).map(e => ({
        ...e,
        workflow_name: e.workflow?.name,
        status: e.status as 'running' | 'success' | 'error' | 'pending'
      }));
    },
  });

  const filteredExecutions = useMemo(() => {
    return executions.filter(e => {
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      if (searchQuery && !e.workflow_name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [executions, statusFilter, searchQuery]);

  const selectedExecution = executions.find(e => e.id === selectedExecutionId) || null;

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const kpis = useMemo(() => ({
    running: executions.filter(e => e.status === 'running').length,
    success: executions.filter(e => e.status === 'success' && new Date(e.started_at) > last24h).length,
    error: executions.filter(e => e.status === 'error').length,
    avgDuration: executions.length > 0 
      ? executions.reduce((sum, e) => sum + (e.duration_minutes || 0) * 60, 0) / executions.length 
      : 0
  }), [executions]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Logs & Monitoring</h2>
        <p className="text-sm text-muted-foreground">Workflow-Ausführungen überwachen</p>
      </div>

      <MonitoringKPICards
        runningCount={kpis.running}
        successCount={kpis.success}
        errorCount={kpis.error}
        avgDuration={kpis.avgDuration}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
        <ExecutionLogsList
          executions={filteredExecutions}
          isLoading={isLoading}
          selectedId={selectedExecutionId}
          onSelectExecution={setSelectedExecutionId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onRefresh={() => refetch()}
          onExport={() => toast({ title: "Export", description: "Logs werden exportiert..." })}
        />
        <ExecutionDetailsPanel execution={selectedExecution} />
      </div>
    </div>
  );
};
