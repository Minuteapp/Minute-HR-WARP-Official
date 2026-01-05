import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings2, Lock, Unlock, Eye, Plus, Edit, Download, 
  MessageSquare, CheckCircle, Search, BarChart3, PieChart,
  FileText, Calendar, Zap, Users, Bell, Target
} from 'lucide-react';
import { toast } from 'sonner';

interface WidgetAction {
  key: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
}

interface WidgetPermission {
  id: string;
  widget_id: string;
  widget_name: string;
  widget_icon: React.ComponentType<any>;
  is_mandatory: boolean;
  is_locked: boolean;
  allowed_actions: string[];
  drill_down_enabled: boolean;
  drill_down_roles: string[];
  requires_confirmation: boolean;
}

const widgetActions: WidgetAction[] = [
  { key: 'view', name: 'Anzeigen', icon: Eye, description: 'Widget kann angesehen werden' },
  { key: 'create', name: 'Erstellen', icon: Plus, description: 'Neue Einträge erstellen' },
  { key: 'edit', name: 'Bearbeiten', icon: Edit, description: 'Einträge bearbeiten' },
  { key: 'approve', name: 'Genehmigen', icon: CheckCircle, description: 'Genehmigungsaktionen' },
  { key: 'comment', name: 'Kommentieren', icon: MessageSquare, description: 'Kommentare hinzufügen' },
  { key: 'export', name: 'Exportieren', icon: Download, description: 'Daten exportieren' },
  { key: 'drill_down', name: 'Drill-Down', icon: Search, description: 'Details aufrufen' },
];

const defaultWidgetPermissions: WidgetPermission[] = [
  { id: '1', widget_id: 'kpi_card', widget_name: 'KPI Karte', widget_icon: BarChart3, is_mandatory: false, is_locked: false, allowed_actions: ['view', 'drill_down'], drill_down_enabled: true, drill_down_roles: ['admin', 'hr_manager'], requires_confirmation: false },
  { id: '2', widget_id: 'team_status', widget_name: 'Team-Status', widget_icon: Users, is_mandatory: true, is_locked: false, allowed_actions: ['view', 'drill_down', 'comment'], drill_down_enabled: true, drill_down_roles: ['team_lead', 'admin'], requires_confirmation: false },
  { id: '3', widget_id: 'calendar_summary', widget_name: 'Kalender-Übersicht', widget_icon: Calendar, is_mandatory: false, is_locked: false, allowed_actions: ['view', 'create', 'edit'], drill_down_enabled: true, drill_down_roles: ['all'], requires_confirmation: false },
  { id: '4', widget_id: 'quick_actions', widget_name: 'Schnellaktionen', widget_icon: Zap, is_mandatory: true, is_locked: true, allowed_actions: ['view', 'create', 'approve'], drill_down_enabled: false, drill_down_roles: [], requires_confirmation: true },
  { id: '5', widget_id: 'notification_feed', widget_name: 'Benachrichtigungen', widget_icon: Bell, is_mandatory: false, is_locked: false, allowed_actions: ['view', 'comment'], drill_down_enabled: true, drill_down_roles: ['all'], requires_confirmation: false },
  { id: '6', widget_id: 'bar_chart', widget_name: 'Balkendiagramm', widget_icon: BarChart3, is_mandatory: false, is_locked: false, allowed_actions: ['view', 'export', 'drill_down'], drill_down_enabled: true, drill_down_roles: ['admin', 'hr_manager', 'team_lead'], requires_confirmation: false },
  { id: '7', widget_id: 'favorites', widget_name: 'Favoriten', widget_icon: Target, is_mandatory: false, is_locked: false, allowed_actions: ['view', 'edit'], drill_down_enabled: false, drill_down_roles: [], requires_confirmation: false },
];

const allRoles = [
  { key: 'all', name: 'Alle Rollen' },
  { key: 'employee', name: 'Mitarbeiter' },
  { key: 'team_lead', name: 'Teamleiter' },
  { key: 'hr_manager', name: 'HR-Manager' },
  { key: 'admin', name: 'Administrator' },
  { key: 'superadmin', name: 'Superadmin' },
];

export const WidgetPermissions: React.FC = () => {
  const [permissions, setPermissions] = useState<WidgetPermission[]>(defaultWidgetPermissions);
  const [selectedWidget, setSelectedWidget] = useState<WidgetPermission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleAction = (widgetId: string, actionKey: string) => {
    setPermissions(perms =>
      perms.map(p => {
        if (p.id === widgetId) {
          const actions = p.allowed_actions.includes(actionKey)
            ? p.allowed_actions.filter(a => a !== actionKey)
            : [...p.allowed_actions, actionKey];
          return { ...p, allowed_actions: actions };
        }
        return p;
      })
    );
  };

  const toggleBoolean = (widgetId: string, field: 'is_mandatory' | 'is_locked' | 'drill_down_enabled' | 'requires_confirmation') => {
    setPermissions(perms =>
      perms.map(p =>
        p.id === widgetId ? { ...p, [field]: !p[field] } : p
      )
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <CardTitle>Widget-Berechtigungen</CardTitle>
          </div>
          <CardDescription>
            Konfigurieren Sie Aktionen und Sichtbarkeit für jedes Widget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Widget</TableHead>
                  <TableHead>Pflicht</TableHead>
                  <TableHead>Gesperrt</TableHead>
                  <TableHead>Erlaubte Aktionen</TableHead>
                  <TableHead>Drill-Down</TableHead>
                  <TableHead>Bestätigung</TableHead>
                  <TableHead className="w-[80px]">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((perm) => {
                  const WidgetIcon = perm.widget_icon;
                  return (
                    <TableRow key={perm.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <WidgetIcon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{perm.widget_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={perm.is_mandatory}
                          onCheckedChange={() => toggleBoolean(perm.id, 'is_mandatory')}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={perm.is_locked}
                          onCheckedChange={() => toggleBoolean(perm.id, 'is_locked')}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {widgetActions.map((action) => {
                            const isActive = perm.allowed_actions.includes(action.key);
                            const ActionIcon = action.icon;
                            return (
                              <Badge
                                key={action.key}
                                variant={isActive ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => toggleAction(perm.id, action.key)}
                              >
                                <ActionIcon className="h-3 w-3 mr-1" />
                                {action.name}
                              </Badge>
                            );
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={perm.drill_down_enabled}
                            onCheckedChange={() => toggleBoolean(perm.id, 'drill_down_enabled')}
                          />
                          {perm.drill_down_enabled && (
                            <Badge variant="secondary" className="text-xs">
                              {perm.drill_down_roles.includes('all') 
                                ? 'Alle' 
                                : `${perm.drill_down_roles.length} Rollen`}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={perm.requires_confirmation}
                          onCheckedChange={() => toggleBoolean(perm.id, 'requires_confirmation')}
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setSelectedWidget(perm);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Detaillierte Widget-Konfiguration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedWidget && (
                <>
                  <selectedWidget.widget_icon className="h-5 w-5" />
                  {selectedWidget.widget_name} - Detailkonfiguration
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Konfigurieren Sie alle Berechtigungen und Einstellungen für dieses Widget
            </DialogDescription>
          </DialogHeader>
          
          {selectedWidget && (
            <Tabs defaultValue="actions" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="actions">Aktionen</TabsTrigger>
                <TabsTrigger value="visibility">Sichtbarkeit</TabsTrigger>
                <TabsTrigger value="drilldown">Drill-Down</TabsTrigger>
              </TabsList>
              
              <TabsContent value="actions" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  {widgetActions.map((action) => {
                    const ActionIcon = action.icon;
                    const isActive = selectedWidget.allowed_actions.includes(action.key);
                    return (
                      <div 
                        key={action.key}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isActive ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                        }`}
                        onClick={() => toggleAction(selectedWidget.id, action.key)}
                      >
                        <Checkbox checked={isActive} />
                        <ActionIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{action.name}</p>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="visibility" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Pflicht-Widget</p>
                        <p className="text-sm text-muted-foreground">
                          Benutzer können dieses Widget nicht ausblenden
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={selectedWidget.is_mandatory}
                      onCheckedChange={() => toggleBoolean(selectedWidget.id, 'is_mandatory')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Unlock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Layout gesperrt</p>
                        <p className="text-sm text-muted-foreground">
                          Position und Größe können nicht geändert werden
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={selectedWidget.is_locked}
                      onCheckedChange={() => toggleBoolean(selectedWidget.id, 'is_locked')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Bestätigung erforderlich</p>
                        <p className="text-sm text-muted-foreground">
                          Kritische Aktionen erfordern eine Bestätigung
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={selectedWidget.requires_confirmation}
                      onCheckedChange={() => toggleBoolean(selectedWidget.id, 'requires_confirmation')}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="drilldown" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Search className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Drill-Down aktivieren</p>
                        <p className="text-sm text-muted-foreground">
                          Benutzer können Details aufrufen
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={selectedWidget.drill_down_enabled}
                      onCheckedChange={() => toggleBoolean(selectedWidget.id, 'drill_down_enabled')}
                    />
                  </div>
                  
                  {selectedWidget.drill_down_enabled && (
                    <div className="p-4 border rounded-lg">
                      <Label className="mb-3 block">Drill-Down erlaubt für Rollen:</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {allRoles.map((role) => (
                          <div 
                            key={role.key}
                            className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${
                              selectedWidget.drill_down_roles.includes(role.key) 
                                ? 'border-primary bg-primary/5' 
                                : ''
                            }`}
                          >
                            <Checkbox 
                              checked={selectedWidget.drill_down_roles.includes(role.key)}
                            />
                            <span className="text-sm">{role.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={() => {
              toast.success('Widget-Berechtigungen gespeichert');
              setIsDialogOpen(false);
            }}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WidgetPermissions;
