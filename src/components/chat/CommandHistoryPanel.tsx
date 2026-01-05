import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface CommandExecution {
  id: string;
  command_id: string;
  user_id: string;
  executed_at: string;
  status: 'success' | 'failed' | 'pending';
  result_data: any;
  command?: {
    command_key: string;
    label: any;
    description: string;
  };
}

export const CommandHistoryPanel = () => {
  const [executions, setExecutions] = useState<CommandExecution[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('chat_command_executions')
        .select(`
          *,
          command:chat_commands(command_key, label, description)
        `)
        .eq('user_id', user.id)
        .order('executed_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setExecutions(data || []);
    } catch (error) {
      console.error('Error loading command history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">Lädt...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4" />
          <h3 className="font-semibold">Command-Historie</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Alle ausgeführten Slash-Commands
        </p>
      </div>

      <ScrollArea className="flex-1">
        {executions.length === 0 ? (
          <div className="p-8 text-center">
            <History className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Noch keine Commands ausgeführt
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {executions.map((execution) => (
              <div
                key={execution.id}
                className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(execution.status)}
                    <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                      {execution.command?.command_key || 'Unknown'}
                    </code>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(execution.executed_at), {
                      addSuffix: true,
                      locale: de,
                    })}
                  </span>
                </div>
                
                {execution.command?.description && (
                  <p className="text-xs text-muted-foreground mb-2">
                    {execution.command.description}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      execution.status === 'success'
                        ? 'default'
                        : execution.status === 'failed'
                        ? 'destructive'
                        : 'secondary'
                    }
                    className="text-xs"
                  >
                    {execution.status === 'success' && 'Erfolgreich'}
                    {execution.status === 'failed' && 'Fehlgeschlagen'}
                    {execution.status === 'pending' && 'In Bearbeitung'}
                  </Badge>
                </div>

                {execution.result_data && (
                  <details className="mt-2">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      Details anzeigen
                    </summary>
                    <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(execution.result_data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={loadHistory}
          className="w-full"
        >
          Aktualisieren
        </Button>
      </div>
    </div>
  );
};
