import React, { useState, useEffect, useCallback } from 'react';
import { getDBLogs, clearDBLogs, getEffectiveCompanyId, type DBLogEntry } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, RefreshCw, Trash2, Database, ChevronDown, ChevronUp } from 'lucide-react';

interface DBDebugPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

export const DBDebugPanel: React.FC<DBDebugPanelProps> = ({ isVisible, onClose }) => {
  const [logs, setLogs] = useState<DBLogEntry[]>([]);
  const [effectiveCompanyId, setEffectiveCompanyId] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const refreshLogs = useCallback(() => {
    setLogs(getDBLogs());
  }, []);

  const loadCompanyId = useCallback(async () => {
    const id = await getEffectiveCompanyId();
    setEffectiveCompanyId(id);
  }, []);

  useEffect(() => {
    if (isVisible) {
      refreshLogs();
      loadCompanyId();
      const interval = setInterval(refreshLogs, 1000);
      return () => clearInterval(interval);
    }
  }, [isVisible, refreshLogs, loadCompanyId]);

  const handleClear = () => {
    clearDBLogs();
    refreshLogs();
  };

  const getStatusBadge = (status: DBLogEntry['status']) => {
    const variants: Record<DBLogEntry['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      success: { variant: 'default', label: 'OK' },
      error: { variant: 'destructive', label: 'Fehler' },
      empty: { variant: 'secondary', label: 'Leer' },
      rls_blocked: { variant: 'destructive', label: 'RLS' }
    };
    const config = variants[status];
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  const getOperationColor = (op: DBLogEntry['operation']) => {
    const colors: Record<string, string> = {
      SELECT: 'text-blue-500',
      INSERT: 'text-green-500',
      UPDATE: 'text-yellow-500',
      DELETE: 'text-red-500',
      RPC: 'text-purple-500'
    };
    return colors[op] || 'text-muted-foreground';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[420px] bg-background border border-border rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">DB Debug</span>
          <Badge variant="outline" className="text-xs">
            {logs.length} Requests
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={refreshLogs}>
            <RefreshCw className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleClear}>
            <Trash2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Tenant Context */}
          <div className="px-3 py-2 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Aktiver Tenant:</span>
              {effectiveCompanyId ? (
                <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">
                  {effectiveCompanyId.substring(0, 8)}...
                </code>
              ) : (
                <Badge variant="destructive" className="text-xs">Kein Tenant!</Badge>
              )}
            </div>
          </div>

          {/* Logs */}
          <ScrollArea className="h-[300px]">
            <div className="p-2 space-y-1">
              {logs.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Noch keine DB-Requests erfasst
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`text-xs p-2 rounded border ${
                      log.status === 'error' || log.status === 'rls_blocked'
                        ? 'border-destructive/50 bg-destructive/5'
                        : log.status === 'empty'
                        ? 'border-yellow-500/50 bg-yellow-500/5'
                        : 'border-border bg-muted/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`font-mono font-medium ${getOperationColor(log.operation)}`}>
                          {log.operation}
                        </span>
                        <span className="font-mono text-foreground truncate">{log.table}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getStatusBadge(log.status)}
                        <span className="text-muted-foreground">{log.rowCount} rows</span>
                        <span className="text-muted-foreground">{log.duration}ms</span>
                      </div>
                    </div>
                    {log.error && (
                      <div className="mt-1 text-destructive text-xs truncate">
                        {log.error}
                      </div>
                    )}
                    <div className="mt-1 text-muted-foreground text-[10px]">
                      {log.timestamp.toLocaleTimeString('de-DE')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Stats Footer */}
          <div className="px-3 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>
                Fehler: {logs.filter(l => l.status === 'error' || l.status === 'rls_blocked').length}
              </span>
              <span>
                Leer: {logs.filter(l => l.status === 'empty').length}
              </span>
              <span>
                OK: {logs.filter(l => l.status === 'success').length}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Hook für Keyboard Shortcut (Ctrl+Shift+D)
export const useDBDebugPanel = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isVisible,
    setIsVisible,
    toggle: () => setIsVisible(prev => !prev)
  };
};
