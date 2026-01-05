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
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, LayoutDashboard, Plus, Edit, Trash2, Copy, 
  Building2, MapPin, Briefcase, ArrowRight, Eye, Lock
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  widget_count: number;
}

interface RoleAssignment {
  id: string;
  role: string;
  role_name: string;
  dashboard_template_id: string;
  dashboard_name: string;
  is_default: boolean;
  scope_type: 'company' | 'location' | 'department';
  scope_name?: string;
  allow_customization: boolean;
  allow_multiple_dashboards: boolean;
  allow_switching: boolean;
}

const defaultTemplates: DashboardTemplate[] = [
  { id: 't1', name: 'Standard-Dashboard', description: 'Basisansicht für alle Benutzer', widget_count: 6 },
  { id: 't2', name: 'Manager-Dashboard', description: 'Erweiterte Ansicht mit Teamübersicht', widget_count: 10 },
  { id: 't3', name: 'HR-Dashboard', description: 'Personalmanagement-Fokus', widget_count: 12 },
  { id: 't4', name: 'Executive-Dashboard', description: 'Strategische KPIs und Übersichten', widget_count: 8 },
];

const defaultAssignments: RoleAssignment[] = [
  { id: '1', role: 'employee', role_name: 'Mitarbeiter', dashboard_template_id: 't1', dashboard_name: 'Standard-Dashboard', is_default: true, scope_type: 'company', allow_customization: true, allow_multiple_dashboards: false, allow_switching: false },
  { id: '2', role: 'team_lead', role_name: 'Teamleiter', dashboard_template_id: 't2', dashboard_name: 'Manager-Dashboard', is_default: true, scope_type: 'company', allow_customization: true, allow_multiple_dashboards: true, allow_switching: true },
  { id: '3', role: 'hr_manager', role_name: 'HR-Manager', dashboard_template_id: 't3', dashboard_name: 'HR-Dashboard', is_default: true, scope_type: 'company', allow_customization: true, allow_multiple_dashboards: true, allow_switching: true },
  { id: '4', role: 'admin', role_name: 'Administrator', dashboard_template_id: 't2', dashboard_name: 'Manager-Dashboard', is_default: true, scope_type: 'company', allow_customization: true, allow_multiple_dashboards: true, allow_switching: true },
  { id: '5', role: 'superadmin', role_name: 'Superadmin', dashboard_template_id: 't4', dashboard_name: 'Executive-Dashboard', is_default: true, scope_type: 'company', allow_customization: true, allow_multiple_dashboards: true, allow_switching: true },
];

const scopeIcons = {
  company: Building2,
  location: MapPin,
  department: Briefcase,
};

export const DashboardRoleAssignment: React.FC = () => {
  const [assignments, setAssignments] = useState<RoleAssignment[]>(defaultAssignments);
  const [templates] = useState<DashboardTemplate[]>(defaultTemplates);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<RoleAssignment | null>(null);

  const handleToggle = (id: string, field: keyof RoleAssignment) => {
    setAssignments(items =>
      items.map(item =>
        item.id === id ? { ...item, [field]: !item[field] } : item
      )
    );
  };

  const handleTemplateChange = (id: string, templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setAssignments(items =>
        items.map(item =>
          item.id === id 
            ? { ...item, dashboard_template_id: templateId, dashboard_name: template.name }
            : item
        )
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Dashboard-Zuordnung nach Rollen</CardTitle>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Neue Zuordnung
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Dashboard-Zuordnung erstellen</DialogTitle>
                  <DialogDescription>
                    Weisen Sie einer Rolle ein Dashboard-Template zu
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label>Rolle</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Rolle auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Mitarbeiter</SelectItem>
                        <SelectItem value="team_lead">Teamleiter</SelectItem>
                        <SelectItem value="hr_manager">HR-Manager</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Dashboard-Template</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Template auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Geltungsbereich</Label>
                    <Select defaultValue="company">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="company">Gesamte Gesellschaft</SelectItem>
                        <SelectItem value="location">Bestimmter Standort</SelectItem>
                        <SelectItem value="department">Bestimmte Abteilung</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Personalisierung erlauben</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Mehrere Dashboards erlauben</Label>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Dashboard-Wechsel erlauben</Label>
                      <Switch />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={() => {
                    toast.success('Zuordnung erstellt');
                    setIsDialogOpen(false);
                  }}>
                    Erstellen
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            Definieren Sie, welche Dashboards für welche Rollen verfügbar sind
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rolle</TableHead>
                <TableHead>Dashboard</TableHead>
                <TableHead>Geltungsbereich</TableHead>
                <TableHead>Personalisierung</TableHead>
                <TableHead>Mehrere</TableHead>
                <TableHead>Wechsel</TableHead>
                <TableHead className="w-[100px]">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => {
                const ScopeIcon = scopeIcons[assignment.scope_type];
                return (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{assignment.role_name}</Badge>
                        {assignment.is_default && (
                          <Badge variant="secondary" className="text-xs">Standard</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={assignment.dashboard_template_id}
                        onValueChange={(v) => handleTemplateChange(assignment.id, v)}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map(template => (
                            <SelectItem key={template.id} value={template.id}>
                              <div className="flex items-center gap-2">
                                <LayoutDashboard className="h-4 w-4" />
                                {template.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <ScopeIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm capitalize">{assignment.scope_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={assignment.allow_customization}
                        onCheckedChange={() => handleToggle(assignment.id, 'allow_customization')}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={assignment.allow_multiple_dashboards}
                        onCheckedChange={() => handleToggle(assignment.id, 'allow_multiple_dashboards')}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={assignment.allow_switching}
                        onCheckedChange={() => handleToggle(assignment.id, 'allow_switching')}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
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

      {/* Dashboard-Vererbung */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            <CardTitle>Dashboard-Vererbung</CardTitle>
          </div>
          <CardDescription>
            Definieren Sie die Vererbungshierarchie für Dashboard-Einstellungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex flex-col items-center gap-2 p-4 border rounded-lg bg-background">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="font-medium">Gesellschaft</span>
              <Badge variant="secondary">Basis</Badge>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
            <div className="flex flex-col items-center gap-2 p-4 border rounded-lg bg-background">
              <MapPin className="h-8 w-8 text-primary" />
              <span className="font-medium">Standort</span>
              <Badge variant="outline">Überschreibbar</Badge>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
            <div className="flex flex-col items-center gap-2 p-4 border rounded-lg bg-background">
              <Briefcase className="h-8 w-8 text-primary" />
              <span className="font-medium">Abteilung</span>
              <Badge variant="outline">Überschreibbar</Badge>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
            <div className="flex flex-col items-center gap-2 p-4 border rounded-lg bg-background">
              <Users className="h-8 w-8 text-primary" />
              <span className="font-medium">Benutzer</span>
              <Badge variant="outline">Final</Badge>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch id="allow-override" defaultChecked />
              <Label htmlFor="allow-override">Standort-Überschreibung erlauben</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="allow-dept-override" defaultChecked />
              <Label htmlFor="allow-dept-override">Abteilungs-Überschreibung erlauben</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="allow-user-override" />
              <Label htmlFor="allow-user-override">Benutzer-Überschreibung erlauben</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template-Übersicht */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              <CardTitle>Dashboard-Templates</CardTitle>
            </div>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Neues Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <LayoutDashboard className="h-8 w-8 text-primary" />
                    <Badge variant="secondary">{template.widget_count} Widgets</Badge>
                  </div>
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      Vorschau
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardRoleAssignment;
