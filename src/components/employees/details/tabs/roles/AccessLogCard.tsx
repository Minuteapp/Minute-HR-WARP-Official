import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollText, Check, Edit, Eye, FileText, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useQueryClient } from '@tanstack/react-query';
import type { AccessLog } from '@/integrations/supabase/hooks/useEmployeeRoles';

interface AccessLogCardProps {
  logs: AccessLog[];
  employeeId: string;
}

const getCategoryIcon = (category?: string) => {
  switch (category) {
    case 'approve':
      return <Check className="h-4 w-4 text-green-600" />;
    case 'edit':
      return <Edit className="h-4 w-4 text-blue-600" />;
    case 'view':
      return <Eye className="h-4 w-4 text-blue-600" />;
    default:
      return <FileText className="h-4 w-4 text-gray-600" />;
  }
};

export const AccessLogCard = ({ logs, employeeId }: AccessLogCardProps) => {
  const queryClient = useQueryClient();
  
  // Auto-Refresh alle 30 Sekunden
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['access-logs', employeeId] });
    }, 30000);
    
    return () => clearInterval(interval);
  }, [employeeId, queryClient]);
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-blue-600" />
            Zugriffs-Log (letzte 24h)
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Keine Aktivitäten in den letzten 24 Stunden
            </p>
          ) : (
            <>
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 bg-muted rounded-lg mt-0.5">
                    {getCategoryIcon(log.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{log.action}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{log.module}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.timestamp), 'HH:mm', { locale: de })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                Vollständige Historie anzeigen
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
