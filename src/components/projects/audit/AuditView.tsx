import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter,
  FileSearch,
  History,
  User,
  Calendar,
  Download,
  Eye
} from 'lucide-react';

export const AuditView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const auditStats = [
    {
      label: 'Gesamt-Aktivitäten',
      value: '1.247',
      change: '+12%',
      icon: History,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Kritische Änderungen',
      value: '23',
      change: '-5%',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      label: 'Genehmigte Aktionen',
      value: '892',
      change: '+8%',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Ausstehende Reviews',
      value: '14',
      change: '+3',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ];

  const auditLogs = [
    {
      id: '1',
      timestamp: '06.11.2025 14:32',
      user: 'Max Mustermann',
      action: 'Projekt erstellt',
      project: 'Website Relaunch 2025',
      type: 'create',
      severity: 'info',
      details: 'Neues Projekt angelegt mit Budget €50.000'
    },
    {
      id: '2',
      timestamp: '06.11.2025 13:15',
      user: 'Anna Schmidt',
      action: 'Budget geändert',
      project: 'CRM Implementation',
      type: 'update',
      severity: 'warning',
      details: 'Budget von €80.000 auf €95.000 erhöht'
    },
    {
      id: '3',
      timestamp: '06.11.2025 11:48',
      user: 'Thomas Müller',
      action: 'Projekt gelöscht',
      project: 'Legacy System Migration',
      type: 'delete',
      severity: 'critical',
      details: 'Projekt permanent gelöscht'
    },
    {
      id: '4',
      timestamp: '06.11.2025 10:22',
      user: 'Sarah Weber',
      action: 'Status geändert',
      project: 'Mobile App Development',
      type: 'update',
      severity: 'info',
      details: 'Status von "Planung" zu "Aktiv" geändert'
    },
    {
      id: '5',
      timestamp: '06.11.2025 09:05',
      user: 'Michael Klein',
      action: 'Team-Mitglied hinzugefügt',
      project: 'Data Warehouse',
      type: 'update',
      severity: 'info',
      details: '3 neue Team-Mitglieder hinzugefügt'
    },
    {
      id: '6',
      timestamp: '05.11.2025 16:30',
      user: 'Lisa Bauer',
      action: 'Dokument hochgeladen',
      project: 'API Integration',
      type: 'create',
      severity: 'info',
      details: 'Vertragsdokument hochgeladen (2.3 MB)'
    }
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Kritisch</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500">Warnung</Badge>;
      case 'info':
        return <Badge variant="secondary">Info</Badge>;
      default:
        return <Badge variant="outline">Unbekannt</Badge>;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'create':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'update':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'delete':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <History className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            Audit Trail
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Vollständige Übersicht aller Projekt-Aktivitäten und Änderungen
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Aktivitäten</SelectItem>
              <SelectItem value="critical">Kritische</SelectItem>
              <SelectItem value="warning">Warnungen</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {auditStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    <p className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} vs. letzte Woche
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Benutzer, Projekt oder Aktion..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select defaultValue="7days">
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Heute</SelectItem>
                <SelectItem value="7days">Letzte 7 Tage</SelectItem>
                <SelectItem value="30days">Letzte 30 Tage</SelectItem>
                <SelectItem value="90days">Letzte 90 Tage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5" />
            Aktivitäts-Protokoll
          </CardTitle>
          <CardDescription>
            Chronologische Übersicht aller Projekt-Änderungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="p-2 bg-muted rounded-lg mt-1">
                  {getActionIcon(log.type)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{log.action}</p>
                        {getSeverityBadge(log.severity)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Projekt: <span className="font-medium">{log.project}</span>
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{log.details}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {log.user}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {log.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center mt-6">
            <Button variant="outline">
              Mehr laden
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Compliance & Datenschutz</p>
              <p className="text-sm text-blue-800 mt-1">
                Alle Audit-Logs werden gemäß DSGVO für 7 Jahre gespeichert und sind unveränderbar. 
                Export-Funktionen sind nur für autorisierte Administratoren verfügbar.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
