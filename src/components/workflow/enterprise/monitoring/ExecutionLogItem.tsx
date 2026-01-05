import React from 'react';
import { ExecutionStatusBadge } from './ExecutionStatusBadge';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ExecutionLogItemProps {
  execution: {
    id: string;
    workflow_name?: string;
    status: 'running' | 'success' | 'error' | 'pending';
    started_at: string;
    duration_minutes?: number | null;
    triggered_by?: string;
  };
  isSelected: boolean;
  onClick: () => void;
}

export const ExecutionLogItem = ({ execution, isSelected, onClick }: ExecutionLogItemProps) => {
  const startedAt = new Date(execution.started_at);
  const formattedDate = format(startedAt, 'dd.MM.yyyy', { locale: de });
  const formattedTime = format(startedAt, 'HH:mm:ss', { locale: de });

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-3 border-b cursor-pointer transition-colors hover:bg-muted/50',
        isSelected && 'bg-primary/5 border-l-2 border-l-primary'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm text-foreground truncate">
            {execution.workflow_name || 'Workflow'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formattedDate} {formattedTime}
            {execution.triggered_by && (
              <span> • von {execution.triggered_by}</span>
            )}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <ExecutionStatusBadge status={execution.status} />
          {execution.duration_minutes != null && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{(execution.duration_minutes * 60).toFixed(1)}s</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
