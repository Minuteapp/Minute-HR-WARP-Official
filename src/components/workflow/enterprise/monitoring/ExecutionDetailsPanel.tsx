import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExecutionStatusBadge } from './ExecutionStatusBadge';
import { MousePointer, Clock, User, Calendar, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ExecutionDetailsPanelProps {
  execution: {
    id: string;
    workflow_name?: string;
    status: 'running' | 'success' | 'error' | 'pending';
    started_at: string;
    completed_at?: string | null;
    duration_minutes?: number | null;
    triggered_by?: string;
    error_message?: string | null;
    execution_data?: any;
  } | null;
}

export const ExecutionDetailsPanel = ({ execution }: ExecutionDetailsPanelProps) => {
  if (!execution) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-base">Ausführungs-Details</CardTitle>
          <CardDescription>Wähle ein Log aus</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <MousePointer className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Wähle ein Log aus der Liste, um Details anzuzeigen
          </p>
        </CardContent>
      </Card>
    );
  }

  const startedAt = new Date(execution.started_at);
  const completedAt = execution.completed_at ? new Date(execution.completed_at) : null;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{execution.workflow_name || 'Workflow'}</CardTitle>
            <CardDescription className="font-mono text-xs mt-1">
              ID: {execution.id.slice(0, 8)}...
            </CardDescription>
          </div>
          <ExecutionStatusBadge status={execution.status} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {/* Timing Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Gestartet</span>
            </div>
            <p className="text-sm font-medium">
              {format(startedAt, 'dd.MM.yyyy HH:mm:ss', { locale: de })}
            </p>
          </div>
          {completedAt && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Beendet</span>
              </div>
              <p className="text-sm font-medium">
                {format(completedAt, 'dd.MM.yyyy HH:mm:ss', { locale: de })}
              </p>
            </div>
          )}
        </div>

        {/* Duration */}
        {execution.duration_minutes != null && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Dauer</span>
            </div>
            <p className="text-sm font-medium">
              {(execution.duration_minutes * 60).toFixed(2)} Sekunden
            </p>
          </div>
        )}

        {/* Triggered By */}
        {execution.triggered_by && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>Ausgelöst von</span>
            </div>
            <p className="text-sm font-medium">{execution.triggered_by}</p>
          </div>
        )}

        {/* Error Message */}
        {execution.status === 'error' && execution.error_message && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Fehlermeldung</span>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-mono">
                {execution.error_message}
              </p>
            </div>
          </div>
        )}

        {/* Execution Data Preview */}
        {execution.execution_data && Object.keys(execution.execution_data).length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              <span>Ausführungsdaten</span>
            </div>
            <pre className="p-3 bg-muted rounded-lg text-xs font-mono overflow-auto max-h-40">
              {JSON.stringify(execution.execution_data, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
