import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, Search, Download, Filter, Shield, Users, 
  Key, UserCog, Settings, Clock, AlertTriangle, CheckCircle
} from 'lucide-react';

interface AuditEvent {
  id: string;
  event_type: string;
  user_id: string;
  user_name: string;
  target_type: string;
  target_id: string;
  target_name: string;
  action: string;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string;
  timestamp: string;
}

const EVENT_TYPES = [
  { value: 'all', label: 'Alle Ereignisse' },
  { value: 'role_change', label: 'Rollenänderungen' },
  { value: 'permission_change', label: 'Berechtigungsänderungen' },
  { value: 'user_create', label: 'Benutzer erstellt' },
  { value: 'user_delete', label: 'Benutzer gelöscht' },
  { value: 'user_suspend', label: 'Benutzer gesperrt' },
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'login', label: 'Anmeldungen' },
];

const getEventIcon = (type: string) => {
  switch (type) {
    case 'role_change': return <Shield className="h-4 w-4 text-blue-500" />;
    case 'permission_change': return <Key className="h-4 w-4 text-purple-500" />;
    case 'user_create': return <Users className="h-4 w-4 text-green-500" />;
    case 'user_delete': return <Users className="h-4 w-4 text-red-500" />;
    case 'user_suspend': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case 'impersonation': return <UserCog className="h-4 w-4 text-orange-500" />;
    case 'login': return <CheckCircle className="h-4 w-4 text-green-500" />;
    default: return <Settings className="h-4 w-4 text-gray-500" />;
  }
};

const getEventLabel = (type: string) => {
  const found = EVENT_TYPES.find(e => e.value === type);
  return found?.label || type;
};

export const AuditComplianceTab: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7days');

  useEffect(() => {
    loadAuditEvents();
  }, [eventTypeFilter, dateRange]);

  const loadAuditEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('permission_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Transform zu AuditEvents
      const auditEvents: AuditEvent[] = (data || []).map(log => ({
        id: log.id,
        event_type: log.action_type,
        user_id: log.performed_by || '',
        user_name: `Benutzer ${(log.performed_by || '').slice(0, 8)}`,
        target_type: 'permission',
        target_id: log.target_user_id || '',
        target_name: `Benutzer ${(log.target_user_id || '').slice(0, 8)}`,
        action: log.action_type,
        old_values: log.old_value as Record<string, any> | null,
        new_values: log.new_value as Record<string, any> | null,
        ip_address: 'Unbekannt',
        timestamp: log.created_at
      }));

      setEvents(auditEvents);
    } catch (error) {
      console.error('Fehler beim Laden der Audit-Events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.target_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = eventTypeFilter === 'all' || event.event_type === eventTypeFilter;
    
    return matchesSearch && matchesType;
  });

  const exportAuditLog = () => {
    const csv = [
      ['Zeitpunkt', 'Typ', 'Ausführender', 'Ziel', 'Aktion', 'IP-Adresse'].join(';'),
      ...filteredEvents.map(e => [
        new Date(e.timestamp).toLocaleString('de-DE'),
        getEventLabel(e.event_type),
        e.user_name,
        e.target_name,
        e.action,
        e.ip_address
      ].join(';'))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt-Ereignisse</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rollenänderungen</p>
                <p className="text-2xl font-bold text-blue-600">
                  {events.filter(e => e.event_type === 'role_change').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Berechtigungen</p>
                <p className="text-2xl font-bold text-purple-600">
                  {events.filter(e => e.event_type === 'permission_change').length}
                </p>
              </div>
              <Key className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Impersonations</p>
                <p className="text-2xl font-bold text-orange-600">
                  {events.filter(e => e.event_type === 'impersonation').length}
                </p>
              </div>
              <UserCog className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit-Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Audit-Protokoll
              </CardTitle>
              <CardDescription>
                Vollständige Historie aller Berechtigungs- und Benutzeränderungen
              </CardDescription>
            </div>
            <Button variant="outline" onClick={exportAuditLog}>
              <Download className="h-4 w-4 mr-2" />
              Exportieren
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Heute</SelectItem>
                <SelectItem value="7days">Letzte 7 Tage</SelectItem>
                <SelectItem value="30days">Letzte 30 Tage</SelectItem>
                <SelectItem value="90days">Letzte 90 Tage</SelectItem>
                <SelectItem value="all">Alle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabelle */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine Audit-Ereignisse</h3>
              <p className="text-muted-foreground">
                Es wurden noch keine Berechtigungs- oder Benutzeränderungen protokolliert.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Typ</TableHead>
                  <TableHead>Zeitpunkt</TableHead>
                  <TableHead>Ausführender</TableHead>
                  <TableHead>Ziel</TableHead>
                  <TableHead>Aktion</TableHead>
                  <TableHead>Änderungen</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map(event => (
                  <TableRow key={event.id}>
                    <TableCell>{getEventIcon(event.event_type)}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(event.timestamp).toLocaleString('de-DE')}
                    </TableCell>
                    <TableCell className="font-medium">{event.user_name}</TableCell>
                    <TableCell>{event.target_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{event.action}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {event.old_values && event.new_values ? (
                        <span className="text-xs text-muted-foreground">
                          {JSON.stringify(event.old_values)} → {JSON.stringify(event.new_values)}
                        </span>
                      ) : event.new_values ? (
                        <span className="text-xs text-muted-foreground">
                          {JSON.stringify(event.new_values)}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {event.ip_address}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
