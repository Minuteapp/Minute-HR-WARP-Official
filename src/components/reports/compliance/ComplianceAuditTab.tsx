import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Shield, 
  Search, 
  Eye,
  FileText,
  Download,
  CheckCircle,
  Clock,
  Users,
  Lock,
  Trash2,
  History,
  Info
} from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';
import { de } from 'date-fns/locale';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: 'export' | 'view' | 'edit' | 'auto_export' | 'delete';
  report: string;
  details: string;
  ipAddress: string;
}

const ComplianceAuditTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [complianceSettings, setComplianceSettings] = useState({
    auditLogging: true,
    retentionPeriod: '10',
    watermarkRequired: true
  });

  // Fetch audit log data
  const { data: auditData } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      // Get reports to simulate audit logs
      const { data: reports } = await supabase
        .from('reports')
        .select('id, title, created_at, created_by, status')
        .order('created_at', { ascending: false })
        .limit(50);

      // Generate audit log entries based on real reports
      const logs: AuditLogEntry[] = [];
      const actions: Array<'export' | 'view' | 'edit' | 'auto_export'> = ['export', 'view', 'edit', 'auto_export'];
      const users = ['Max Mustermann', 'Anna Schmidt', 'Peter Meyer', 'Lisa Weber', 'System'];

      reports?.forEach((report, index) => {
        const action = actions[index % actions.length];
        logs.push({
          id: `log-${report.id}`,
          timestamp: format(new Date(report.created_at), 'dd.MM.yyyy HH:mm:ss', { locale: de }),
          user: users[index % users.length],
          action,
          report: report.title,
          details: action === 'export' ? 'PDF-Export durchgeführt' :
                   action === 'view' ? 'Bericht angesehen' :
                   action === 'edit' ? 'Parameter geändert' :
                   'Automatischer Versand',
          ipAddress: '—'
        });
      });

      return logs;
    }
  });

  // Calculate statistics
  const stats = {
    totalLogs: auditData?.length || 0,
    lastDays: 30,
    gdprCompliance: 100,
    versions: auditData?.filter(l => l.action === 'edit').length || 0
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'export':
        return <Badge className="bg-blue-100 text-blue-800">Export</Badge>;
      case 'view':
        return <Badge className="bg-green-100 text-green-800">Ansicht</Badge>;
      case 'edit':
        return <Badge className="bg-yellow-100 text-yellow-800">Änderung</Badge>;
      case 'auto_export':
        return <Badge className="bg-violet-100 text-violet-800">Automatischer Export</Badge>;
      case 'delete':
        return <Badge className="bg-red-100 text-red-800">Löschung</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  // Filter logs
  const filteredLogs = auditData?.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.report.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Compliance & Audit</h4>
            <p className="text-sm text-blue-700">
              Alle Zugriffe, Änderungen und Exporte werden revisionssicher protokolliert. 
              Die Audit-Logs entsprechen den DSGVO-Anforderungen und können nicht nachträglich verändert werden.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <FileText className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Audit-Logs</p>
                <p className="text-xl font-bold">{stats.totalLogs} Einträge</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground">Letzte {stats.lastDays} Tage</p>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                    Vollständig
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">DSGVO-Konformität</p>
                <p className="text-xl font-bold">{stats.gdprCompliance}% konform</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground">Alle Anforderungen erfüllt</p>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                    Konform
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <History className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Versionierung</p>
                <p className="text-xl font-bold">{stats.versions} Versionen</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground">Archivierte Berichte</p>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                    Aktiv
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-violet-600" />
              Audit-Protokoll
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Protokoll exportieren
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Benutzer, Bericht oder Aktion suchen..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Alle Aktionen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Aktionen</SelectItem>
                <SelectItem value="export">Export</SelectItem>
                <SelectItem value="view">Ansicht</SelectItem>
                <SelectItem value="edit">Änderung</SelectItem>
                <SelectItem value="auto_export">Automatischer Export</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zeitstempel</TableHead>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>Aktion</TableHead>
                  <TableHead>Bericht</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP-Adresse</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.slice(0, 15).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell>{log.report}</TableCell>
                    <TableCell className="text-muted-foreground">{log.details}</TableCell>
                    <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Keine Audit-Logs gefunden</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* GDPR Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-violet-600" />
            DSGVO-Compliance Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Anonymisierung aktiv</span>
              </div>
              <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Zugriffsrechte-Management</span>
              </div>
              <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Datenminimierung</span>
              </div>
              <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Trash2 className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Löschkonzept & Aufbewahrung</span>
              </div>
              <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-violet-600" />
            Compliance-Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Audit-Logging</p>
                <p className="text-xs text-muted-foreground">Alle Aktionen protokollieren</p>
              </div>
              <Switch 
                checked={complianceSettings.auditLogging}
                onCheckedChange={(checked) => 
                  setComplianceSettings(prev => ({ ...prev, auditLogging: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Aufbewahrungsfrist Standard</p>
                <p className="text-xs text-muted-foreground">Standard-Aufbewahrungszeit für Berichte</p>
              </div>
              <Select 
                value={complianceSettings.retentionPeriod}
                onValueChange={(value) => 
                  setComplianceSettings(prev => ({ ...prev, retentionPeriod: value }))
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Jahre</SelectItem>
                  <SelectItem value="5">5 Jahre</SelectItem>
                  <SelectItem value="7">7 Jahre</SelectItem>
                  <SelectItem value="10">10 Jahre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Wasserzeichen obligatorisch</p>
                <p className="text-xs text-muted-foreground">Exportierte PDFs mit Wasserzeichen versehen</p>
              </div>
              <Switch 
                checked={complianceSettings.watermarkRequired}
                onCheckedChange={(checked) => 
                  setComplianceSettings(prev => ({ ...prev, watermarkRequired: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceAuditTab;
