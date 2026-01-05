import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Search, User, Calendar, Edit, Trash, Plus } from 'lucide-react';

const CalendarHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['calendar-audit-log', searchQuery, actionFilter],
    queryFn: async () => {
      let query = supabase
        .from('calendar_audit_log')
        .select(`
          *,
          calendar_events (title, type)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'INSERT': return <Plus className="h-4 w-4" />;
      case 'UPDATE': return <Edit className="h-4 w-4" />;
      case 'DELETE': return <Trash className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT': return 'bg-green-500/10 text-green-600';
      case 'UPDATE': return 'bg-blue-500/10 text-blue-600';
      case 'DELETE': return 'bg-red-500/10 text-red-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  const filteredLogs = auditLogs?.filter(log => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      log.calendar_events?.title?.toLowerCase().includes(searchLower) ||
      log.action?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Historie & Audit-Log</h2>
        <p className="text-muted-foreground">
          Vollständige Aufzeichnung aller Kalender-Änderungen
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Terminen oder Aktionen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Aktionen</SelectItem>
                <SelectItem value="INSERT">Erstellt</SelectItem>
                <SelectItem value="UPDATE">Bearbeitet</SelectItem>
                <SelectItem value="DELETE">Gelöscht</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Lädt Audit-Log...
            </div>
          ) : filteredLogs && filteredLogs.length > 0 ? (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className={`p-2 rounded-full ${getActionColor(log.action)}`}>
                    {getActionIcon(log.action)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {log.calendar_events?.title || 'Termin'}
                      </span>
                      <Badge variant="outline">
                        {log.calendar_events?.type || 'unknown'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {log.action === 'INSERT' && 'Termin erstellt'}
                      {log.action === 'UPDATE' && 'Termin bearbeitet'}
                      {log.action === 'DELETE' && 'Termin gelöscht'}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {log.created_at && format(new Date(log.created_at), 'PPp', { locale: de })}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-1">
                      <User className="h-3 w-3" />
                      {log.performed_by || 'System'}
                    </div>
                  </div>

                  {log.changes_json && (
                    <div className="text-xs text-muted-foreground">
                      <details className="cursor-pointer">
                        <summary>Details</summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-[10px] overflow-auto max-w-md">
                          {JSON.stringify(log.changes_json, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Keine Einträge gefunden</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarHistory;