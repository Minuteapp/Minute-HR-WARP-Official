import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  AlertTriangle, Bell, Plus, Edit, Trash2, 
  ArrowUp, ArrowDown, Equal, TrendingUp, Clock,
  Mail, MessageSquare, Smartphone, Save
} from 'lucide-react';
import { toast } from 'sonner';

interface KPIAlert {
  id: string;
  widget_id: string;
  kpi_key: string;
  kpi_name: string;
  threshold_warning: number | null;
  threshold_critical: number | null;
  comparison_operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq';
  display_mode: 'banner' | 'badge' | 'icon' | 'popup';
  escalation_enabled: boolean;
  escalation_roles: string[];
  escalation_delay_minutes: number;
  notification_channels: string[];
  is_active: boolean;
}

const defaultAlerts: KPIAlert[] = [
  { 
    id: '1', widget_id: 'kpi_card', kpi_key: 'absence_rate', kpi_name: 'Abwesenheitsquote', 
    threshold_warning: 10, threshold_critical: 15, comparison_operator: 'gt',
    display_mode: 'badge', escalation_enabled: true, escalation_roles: ['hr_manager', 'admin'],
    escalation_delay_minutes: 60, notification_channels: ['in_app', 'email'], is_active: true
  },
  { 
    id: '2', widget_id: 'kpi_card', kpi_key: 'overtime_hours', kpi_name: 'Überstunden gesamt', 
    threshold_warning: 100, threshold_critical: 200, comparison_operator: 'gt',
    display_mode: 'banner', escalation_enabled: true, escalation_roles: ['team_lead', 'hr_manager'],
    escalation_delay_minutes: 120, notification_channels: ['in_app'], is_active: true
  },
  { 
    id: '3', widget_id: 'bar_chart', kpi_key: 'vacation_remaining', kpi_name: 'Resturlaub', 
    threshold_warning: 5, threshold_critical: 2, comparison_operator: 'lt',
    display_mode: 'icon', escalation_enabled: false, escalation_roles: [],
    escalation_delay_minutes: 0, notification_channels: ['in_app'], is_active: true
  },
  { 
    id: '4', widget_id: 'team_status', kpi_key: 'pending_approvals', kpi_name: 'Offene Genehmigungen', 
    threshold_warning: 5, threshold_critical: 10, comparison_operator: 'gte',
    display_mode: 'badge', escalation_enabled: true, escalation_roles: ['admin'],
    escalation_delay_minutes: 30, notification_channels: ['in_app', 'push'], is_active: true
  },
];

const operatorLabels: Record<string, { label: string; icon: React.ComponentType<any> }> = {
  gt: { label: 'Größer als', icon: ArrowUp },
  gte: { label: 'Größer gleich', icon: ArrowUp },
  lt: { label: 'Kleiner als', icon: ArrowDown },
  lte: { label: 'Kleiner gleich', icon: ArrowDown },
  eq: { label: 'Gleich', icon: Equal },
  neq: { label: 'Ungleich', icon: Equal },
};

const displayModes: Record<string, string> = {
  banner: 'Banner',
  badge: 'Badge',
  icon: 'Icon',
  popup: 'Popup',
};

const notificationChannels = [
  { key: 'in_app', name: 'In-App', icon: Bell },
  { key: 'email', name: 'E-Mail', icon: Mail },
  { key: 'push', name: 'Push', icon: Smartphone },
  { key: 'sms', name: 'SMS', icon: MessageSquare },
];

const allRoles = [
  { key: 'employee', name: 'Mitarbeiter' },
  { key: 'team_lead', name: 'Teamleiter' },
  { key: 'hr_manager', name: 'HR-Manager' },
  { key: 'admin', name: 'Administrator' },
  { key: 'superadmin', name: 'Superadmin' },
];

export const DashboardAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<KPIAlert[]>(defaultAlerts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<KPIAlert | null>(null);

  const toggleActive = (id: string) => {
    setAlerts(items =>
      items.map(item =>
        item.id === id ? { ...item, is_active: !item.is_active } : item
      )
    );
  };

  const handleDelete = (id: string) => {
    setAlerts(items => items.filter(item => item.id !== id));
    toast.success('Alert gelöscht');
  };

  const getSeverityColor = (warning: number | null, critical: number | null) => {
    if (critical !== null) return 'text-destructive';
    if (warning !== null) return 'text-yellow-500';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <CardTitle>KPI-Alerts & Schwellenwerte</CardTitle>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingAlert(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Neuer Alert
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingAlert ? 'Alert bearbeiten' : 'Neuen Alert erstellen'}
                  </DialogTitle>
                  <DialogDescription>
                    Definieren Sie Schwellenwerte und Eskalationsregeln für KPIs
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>KPI-Name</Label>
                      <Input 
                        placeholder="z.B. Abwesenheitsquote" 
                        className="mt-1"
                        defaultValue={editingAlert?.kpi_name}
                      />
                    </div>
                    <div>
                      <Label>KPI-Schlüssel</Label>
                      <Input 
                        placeholder="z.B. absence_rate" 
                        className="mt-1"
                        defaultValue={editingAlert?.kpi_key}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Vergleichsoperator</Label>
                      <Select defaultValue={editingAlert?.comparison_operator || 'gt'}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(operatorLabels).map(([key, { label }]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Warnung bei</Label>
                      <Input 
                        type="number" 
                        placeholder="Wert"
                        className="mt-1"
                        defaultValue={editingAlert?.threshold_warning ?? ''}
                      />
                    </div>
                    <div>
                      <Label>Kritisch bei</Label>
                      <Input 
                        type="number" 
                        placeholder="Wert"
                        className="mt-1"
                        defaultValue={editingAlert?.threshold_critical ?? ''}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Anzeigemodus</Label>
                    <Select defaultValue={editingAlert?.display_mode || 'badge'}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(displayModes).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-base">Eskalation aktivieren</Label>
                      <Switch defaultChecked={editingAlert?.escalation_enabled ?? false} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Eskalation nach (Minuten)</Label>
                        <Input 
                          type="number" 
                          placeholder="60"
                          className="mt-1"
                          defaultValue={editingAlert?.escalation_delay_minutes ?? 60}
                        />
                      </div>
                      <div>
                        <Label>Eskalation an Rollen</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {allRoles.map((role) => (
                            <Badge
                              key={role.key}
                              variant={editingAlert?.escalation_roles.includes(role.key) ? 'default' : 'outline'}
                              className="cursor-pointer"
                            >
                              {role.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <Label className="text-base mb-3 block">Benachrichtigungskanäle</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {notificationChannels.map((channel) => {
                        const ChannelIcon = channel.icon;
                        const isActive = editingAlert?.notification_channels.includes(channel.key) ?? channel.key === 'in_app';
                        return (
                          <div 
                            key={channel.key}
                            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${
                              isActive ? 'border-primary bg-primary/5' : ''
                            }`}
                          >
                            <Checkbox checked={isActive} />
                            <ChannelIcon className="h-4 w-4" />
                            <span className="text-sm">{channel.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={() => {
                    toast.success(editingAlert ? 'Alert aktualisiert' : 'Alert erstellt');
                    setIsDialogOpen(false);
                  }}>
                    {editingAlert ? 'Speichern' : 'Erstellen'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            Definieren Sie Schwellenwerte für automatische Warnungen und Eskalationen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>KPI</TableHead>
                <TableHead>Bedingung</TableHead>
                <TableHead>Warnung</TableHead>
                <TableHead>Kritisch</TableHead>
                <TableHead>Anzeige</TableHead>
                <TableHead>Eskalation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => {
                const operator = operatorLabels[alert.comparison_operator];
                const OperatorIcon = operator.icon;
                return (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{alert.kpi_name}</span>
                        <p className="text-xs text-muted-foreground">{alert.kpi_key}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <OperatorIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{operator.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {alert.threshold_warning !== null ? (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                          {alert.threshold_warning}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {alert.threshold_critical !== null ? (
                        <Badge variant="destructive">
                          {alert.threshold_critical}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {displayModes[alert.display_mode]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {alert.escalation_enabled ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{alert.escalation_delay_minutes}min</span>
                          <Badge variant="outline" className="ml-1 text-xs">
                            {alert.escalation_roles.length} Rollen
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Deaktiviert</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={alert.is_active}
                        onCheckedChange={() => toggleActive(alert.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingAlert(alert);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(alert.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Benachrichtigungskanäle Übersicht */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Benachrichtigungskanäle</CardTitle>
          </div>
          <CardDescription>
            Globale Einstellungen für Alert-Benachrichtigungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {notificationChannels.map((channel) => {
              const ChannelIcon = channel.icon;
              const alertCount = alerts.filter(a => 
                a.is_active && a.notification_channels.includes(channel.key)
              ).length;
              return (
                <Card key={channel.key}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <ChannelIcon className="h-5 w-5 text-primary" />
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <h4 className="font-medium">{channel.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {alertCount} aktive Alerts
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => toast.success('Alert-Einstellungen gespeichert')}>
          <Save className="h-4 w-4 mr-2" />
          Alle Alerts speichern
        </Button>
      </div>
    </div>
  );
};

export default DashboardAlerts;
