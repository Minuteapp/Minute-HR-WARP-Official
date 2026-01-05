import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExecutionLogItem } from './ExecutionLogItem';
import { RefreshCw, Download, Search, Activity } from 'lucide-react';

interface Execution {
  id: string;
  workflow_name?: string;
  status: 'running' | 'success' | 'error' | 'pending';
  started_at: string;
  duration_minutes?: number | null;
  triggered_by?: string;
}

interface ExecutionLogsListProps {
  executions: Execution[];
  isLoading: boolean;
  selectedId: string | null;
  onSelectExecution: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onRefresh: () => void;
  onExport: () => void;
}

export const ExecutionLogsList = ({
  executions,
  isLoading,
  selectedId,
  onSelectExecution,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  onExport
}: ExecutionLogsListProps) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Ausführungsprotokoll</CardTitle>
            <CardDescription>Realtime-Überwachung aller Workflows</CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onExport}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Logs durchsuchen..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-24 h-9">
              <SelectValue placeholder="Alle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="running">Laufend</SelectItem>
              <SelectItem value="success">Erfolgreich</SelectItem>
              <SelectItem value="error">Fehler</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : executions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Keine Ausführungen gefunden</p>
          </div>
        ) : (
          <div>
            {executions.map((execution) => (
              <ExecutionLogItem
                key={execution.id}
                execution={execution}
                isSelected={selectedId === execution.id}
                onClick={() => onSelectExecution(execution.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
