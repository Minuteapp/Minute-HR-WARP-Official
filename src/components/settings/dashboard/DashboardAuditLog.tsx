import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, Search, Calendar, User, Clock, 
  Download, Filter, Eye, Plus, Edit, Trash2,
  Settings, LayoutDashboard, ChevronDown, ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface AuditLogEntry {
  id: string;
  action: string;
  action_category: string;
  dashboard_name: string;
  widget_name?: string;
  performed_by: string;
  performed_at: Date;
  old_value: any;
  new_value: any;
  ip_address: string;
}

const defaultAuditLog: AuditLogEntry[] = [
  { 
    id: '1', action: 'widget_added', action_category: 'widget', 
    dashboard_name: 'Standard-Dashboard', widget_name: 'KPI Karte',
    performed_by: 'Max Mustermann', performed_at: new Date('2024-01-15T14:30:00'),
    old_value: null, new_value: { type: 'kpi_card', position: { x: 0, y: 0 } },
    ip_address: '192.168.1.100'
  },
  { 
    id: '2', action: 'layout_changed', action_category: 'layout', 
    dashboard_name: 'Standard-Dashboard', widget_name: undefined,
    performed_by: 'Anna Schmidt', performed_at: new Date('2024-01-15T13:15:00'),
    old_value: { cols: 3 }, new_value: { cols: 4 },
    ip_address: '192.168.1.101'
  },
  { 
    id: '3', action: 'widget_removed', action_category: 'widget', 
    dashboard_name: 'Manager-Dashboard', widget_name: 'Altes Widget',
    performed_by: 'Max Mustermann', performed_at: new Date('2024-01-15T11:45:00'),
    old_value: { type: 'old_widget' }, new_value: null,
    ip_address: '192.168.1.100'
  },
  { 
    id: '4', action: 'permission_changed', action_category: 'permission', 
    dashboard_name: 'HR-Dashboard', widget_name: 'Gehaltsdaten',
    performed_by: 'Admin User', performed_at: new Date('2024-01-14T16:20:00'),
    old_value: { roles: ['hr_manager'] }, new_value: { roles: ['hr_manager', 'admin'] },
    ip_address: '192.168.1.1'
  },
  { 
    id: '5', action: 'dashboard_published', action_category: 'version', 
    dashboard_name: 'Standard-Dashboard', widget_name: undefined,
    performed_by: 'Max Mustermann', performed_at: new Date('2024-01-14T10:00:00'),
    old_value: { version: 4 }, new_value: { version: 5, published: true },
    ip_address: '192.168.1.100'
  },
  { 
    id: '6', action: 'alert_configured', action_category: 'alert', 
    dashboard_name: 'Manager-Dashboard', widget_name: 'Überstunden-KPI',
    performed_by: 'Anna Schmidt', performed_at: new Date('2024-01-13T14:00:00'),
    old_value: null, new_value: { threshold_warning: 100, threshold_critical: 200 },
    ip_address: '192.168.1.101'
  },
  { 
    id: '7', action: 'role_assignment_changed', action_category: 'assignment', 
    dashboard_name: 'Executive-Dashboard', widget_name: undefined,
    performed_by: 'Superadmin', performed_at: new Date('2024-01-12T09:30:00'),
    old_value: { roles: ['superadmin'] }, new_value: { roles: ['superadmin', 'ceo'] },
    ip_address: '10.0.0.1'
  },
];

const actionLabels: Record<string, { label: string; icon: React.ComponentType<any>; color: string }> = {
  widget_added: { label: 'Widget hinzugefügt', icon: Plus, color: 'bg-green-500' },
  widget_removed: { label: 'Widget entfernt', icon: Trash2, color: 'bg-red-500' },
  widget_updated: { label: 'Widget aktualisiert', icon: Edit, color: 'bg-blue-500' },
  layout_changed: { label: 'Layout geändert', icon: LayoutDashboard, color: 'bg-purple-500' },
  permission_changed: { label: 'Berechtigung geändert', icon: Settings, color: 'bg-orange-500' },
  dashboard_published: { label: 'Dashboard veröffentlicht', icon: Eye, color: 'bg-green-600' },
  alert_configured: { label: 'Alert konfiguriert', icon: Settings, color: 'bg-yellow-500' },
  role_assignment_changed: { label: 'Rollenzuordnung geändert', icon: User, color: 'bg-indigo-500' },
};

const categoryLabels: Record<string, string> = {
  widget: 'Widget',
  layout: 'Layout',
  permission: 'Berechtigung',
  version: 'Version',
  alert: 'Alert',
  assignment: 'Zuordnung',
};

export const DashboardAuditLog: React.FC = () => {
  const [auditLog] = useState<AuditLogEntry[]>(defaultAuditLog);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const filteredLog = auditLog.filter(entry => {
    const matchesSearch = 
      entry.dashboard_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.performed_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.widget_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesCategory = categoryFilter === 'all' || entry.action_category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Dashboard-Änderungsprotokoll</CardTitle>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportieren
            </Button>
          </div>
          <CardDescription>
            Vollständiges Protokoll aller Dashboard-Änderungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Dashboard, Benutzer oder Widget..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Input type="date" className="w-[150px]" />
              <span className="text-muted-foreground">bis</span>
              <Input type="date" className="w-[150px]" />
            </div>
          </div>

          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30px]"></TableHead>
                  <TableHead>Zeitpunkt</TableHead>
                  <TableHead>Aktion</TableHead>
                  <TableHead>Dashboard</TableHead>
                  <TableHead>Element</TableHead>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>IP-Adresse</TableHead>
                  <TableHead className="w-[80px]">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLog.map((entry) => {
                  const actionInfo = actionLabels[entry.action] || { label: entry.action, icon: FileText, color: 'bg-gray-500' };
                  const ActionIcon = actionInfo.icon;
                  const isExpanded = expandedRows.has(entry.id);
                  
                  return (
                    <React.Fragment key={entry.id}>
                      <TableRow className="cursor-pointer" onClick={() => toggleRow(entry.id)}>
                        <TableCell>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {format(entry.performed_at, 'dd.MM.yyyy HH:mm', { locale: de })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded ${actionInfo.color}`}>
                              <ActionIcon className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-sm">{actionInfo.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{entry.dashboard_name}</Badge>
                        </TableCell>
                        <TableCell>
                          {entry.widget_name ? (
                            <span className="text-sm">{entry.widget_name}</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {entry.performed_by}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">
                            {entry.ip_address}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEntry(entry);
                              setIsDetailOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={8} className="bg-muted/30">
                            <div className="grid grid-cols-2 gap-4 p-4">
                              <div>
                                <Label className="text-xs text-muted-foreground">Vorheriger Wert</Label>
                                <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto max-h-24">
                                  {entry.old_value 
                                    ? JSON.stringify(entry.old_value, null, 2) 
                                    : 'null'}
                                </pre>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Neuer Wert</Label>
                                <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto max-h-24">
                                  {entry.new_value 
                                    ? JSON.stringify(entry.new_value, null, 2) 
                                    : 'null'}
                                </pre>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>

          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>{filteredLog.length} Einträge gefunden</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>Zurück</Button>
              <span>Seite 1 von 1</span>
              <Button variant="outline" size="sm" disabled>Weiter</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Änderungsdetails</DialogTitle>
            <DialogDescription>
              Vollständige Informationen zum Audit-Eintrag
            </DialogDescription>
          </DialogHeader>
          
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <Label className="text-xs text-muted-foreground">Zeitpunkt</Label>
                  <p className="font-medium">
                    {format(selectedEntry.performed_at, 'dd.MM.yyyy HH:mm:ss', { locale: de })}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <Label className="text-xs text-muted-foreground">Benutzer</Label>
                  <p className="font-medium">{selectedEntry.performed_by}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <Label className="text-xs text-muted-foreground">Dashboard</Label>
                  <p className="font-medium">{selectedEntry.dashboard_name}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <Label className="text-xs text-muted-foreground">IP-Adresse</Label>
                  <p className="font-medium">{selectedEntry.ip_address}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Vorheriger Wert</Label>
                  <pre className="text-xs bg-destructive/10 p-3 rounded border border-destructive/20 overflow-auto max-h-40">
                    {selectedEntry.old_value 
                      ? JSON.stringify(selectedEntry.old_value, null, 2) 
                      : 'null'}
                  </pre>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Neuer Wert</Label>
                  <pre className="text-xs bg-green-500/10 p-3 rounded border border-green-500/20 overflow-auto max-h-40">
                    {selectedEntry.new_value 
                      ? JSON.stringify(selectedEntry.new_value, null, 2) 
                      : 'null'}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardAuditLog;
