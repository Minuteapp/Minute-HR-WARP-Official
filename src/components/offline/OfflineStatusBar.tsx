import React from 'react';
import { useOfflineManager } from '@/hooks/useOfflineManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  Loader2, 
  RefreshCw, 
  Clock, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfflineStatusBarProps {
  className?: string;
  showDetails?: boolean;
}

export const OfflineStatusBar: React.FC<OfflineStatusBarProps> = ({ 
  className,
  showDetails = true 
}) => {
  const { 
    isOnline, 
    isSyncing, 
    pendingOperations, 
    conflicts, 
    lastSync, 
    manualSync 
  } = useOfflineManager();

  const getStatusColor = () => {
    if (!isOnline) return 'text-destructive';
    if (isSyncing) return 'text-warning';
    if (conflicts > 0) return 'text-warning';
    if (pendingOperations > 0) return 'text-warning';
    return 'text-success';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />;
    if (isSyncing) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (conflicts > 0) return <AlertTriangle className="h-4 w-4" />;
    if (pendingOperations > 0) return <Clock className="h-4 w-4" />;
    return <Wifi className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isSyncing) return 'Synchronisiere...';
    if (conflicts > 0) return `${conflicts} Konflikte`;
    if (pendingOperations > 0) return `${pendingOperations} ausstehend`;
    return 'Online';
  };

  const formatLastSync = () => {
    if (!lastSync) return 'Nie';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'Gerade eben';
    if (diffMinutes < 60) return `vor ${diffMinutes}m`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `vor ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `vor ${diffDays}d`;
  };

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-2 bg-background/95 backdrop-blur border-b",
      className
    )}>
      {/* Status Icon & Text */}
      <div className={cn("flex items-center gap-2", getStatusColor())}>
        {getStatusIcon()}
        <span className="text-sm font-medium">
          {getStatusText()}
        </span>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="flex items-center gap-2">
          {/* Pending Operations Badge */}
          {pendingOperations > 0 && (
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {pendingOperations} ausstehend
            </Badge>
          )}

          {/* Conflicts Badge */}
          {conflicts > 0 && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {conflicts} Konflikte
            </Badge>
          )}

          {/* Last Sync */}
          {lastSync && (
            <span className="text-xs text-muted-foreground">
              Letzte Sync: {formatLastSync()}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Manual Sync Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={manualSync}
          disabled={!isOnline || isSyncing}
          className="h-8 px-3"
        >
          <RefreshCw className={cn(
            "h-4 w-4",
            isSyncing && "animate-spin"
          )} />
          {isSyncing ? 'Sync...' : 'Sync'}
        </Button>

        {/* Status Indicator */}
        <div className={cn(
          "w-2 h-2 rounded-full",
          isOnline ? "bg-success animate-pulse" : "bg-destructive"
        )} />
      </div>
    </div>
  );
};