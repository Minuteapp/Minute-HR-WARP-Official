
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { 
  Search, 
  ClipboardList, 
  Mail, 
  Bell, 
  Smartphone, 
  Check, 
  X, 
  Clock, 
  AlertTriangle,
  Loader2,
  RefreshCw,
  Download
} from "lucide-react";

const STATUS_CONFIG = {
  pending: { label: 'Ausstehend', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  sent: { label: 'Gesendet', color: 'bg-blue-100 text-blue-800', icon: Mail },
  delivered: { label: 'Zugestellt', color: 'bg-green-100 text-green-800', icon: Check },
  read: { label: 'Gelesen', color: 'bg-emerald-100 text-emerald-800', icon: Check },
  failed: { label: 'Fehlgeschlagen', color: 'bg-red-100 text-red-800', icon: X },
  escalated: { label: 'Eskaliert', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle }
};

const CHANNEL_ICONS = {
  'in-app': Bell,
  'email': Mail,
  'push': Smartphone,
  'sms': Smartphone,
  'slack': Mail,
  'teams': Mail
};

export default function AuditTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  const { data: auditLogs, isLoading, refetch } = useQuery({
    queryKey: ['notification-audit-log', statusFilter, channelFilter],
    queryFn: async () => {
      let query = supabase
        .from('notification_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (channelFilter !== 'all') {
        query = query.eq('channel', channelFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['notification-audit-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_audit_log')
        .select('status, channel');
      if (error) throw error;

      const statusCounts = data?.reduce((acc, log) => {
        acc[log.status] = (acc[log.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const channelCounts = data?.reduce((acc, log) => {
        if (log.channel) {
          acc[log.channel] = (acc[log.channel] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      return { statusCounts, channelCounts, total: data?.length || 0 };
    }
  });

  const filteredLogs = auditLogs?.filter(log => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.event_type?.toLowerCase().includes(searchLower) ||
      log.subject?.toLowerCase().includes(searchLower) ||
      log.recipient_email?.toLowerCase().includes(searchLower)
    );
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Zugestellt</p>
                <p className="text-2xl font-bold text-green-600">
                  {(stats?.statusCounts?.delivered || 0) + (stats?.statusCounts?.read || 0)}
                </p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fehlgeschlagen</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats?.statusCounts?.failed || 0}
                </p>
              </div>
              <X className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Eskaliert</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats?.statusCounts?.escalated || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Benachrichtigungs-Audit</CardTitle>
              <CardDescription>
                Vollständige Historie aller gesendeten Benachrichtigungen
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Aktualisieren
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportieren
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suchen nach Event, Betreff oder Empfänger..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Kanal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kanäle</SelectItem>
                <SelectItem value="in-app">In-App</SelectItem>
                <SelectItem value="email">E-Mail</SelectItem>
                <SelectItem value="push">Push</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="slack">Slack</SelectItem>
                <SelectItem value="teams">Teams</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Audit-Einträge gefunden</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zeitpunkt</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Empfänger</TableHead>
                    <TableHead>Kanal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Eskalation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const statusConfig = STATUS_CONFIG[log.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                    const StatusIcon = statusConfig.icon;
                    const ChannelIcon = CHANNEL_ICONS[log.channel as keyof typeof CHANNEL_ICONS] || Bell;

                    return (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {log.created_at && format(new Date(log.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <Badge variant="outline" className="text-xs">{log.event_type}</Badge>
                            {log.subject && (
                              <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                                {log.subject}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.recipient_email || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <ChannelIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{log.channel}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusConfig.color} flex items-center gap-1 w-fit`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.escalation_level && log.escalation_level > 0 ? (
                            <Badge variant="secondary">Stufe {log.escalation_level}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
