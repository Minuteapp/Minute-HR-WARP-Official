import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Play, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExecutionStatusBadgeProps {
  status: 'running' | 'success' | 'error' | 'pending';
}

export const ExecutionStatusBadge = ({ status }: ExecutionStatusBadgeProps) => {
  const config = {
    running: {
      label: 'Laufend',
      icon: Play,
      className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50'
    },
    success: {
      label: 'Erfolgreich',
      icon: CheckCircle,
      className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-50'
    },
    error: {
      label: 'Fehler',
      icon: XCircle,
      className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50'
    },
    pending: {
      label: 'Ausstehend',
      icon: Clock,
      className: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-50'
    }
  };

  const { label, icon: Icon, className } = config[status];

  return (
    <Badge variant="outline" className={cn('text-xs font-medium gap-1', className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};
