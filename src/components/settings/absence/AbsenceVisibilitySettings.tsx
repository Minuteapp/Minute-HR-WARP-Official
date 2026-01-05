import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Eye, 
  EyeOff, 
  Shield, 
  Users, 
  UserCheck, 
  Building, 
  Save,
  Settings2,
  FileText,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRolePermissions } from "@/hooks/useRolePermissions";

interface RolePermission {
  role: string;
  displayName: string;
  canView: string;
  canEdit: boolean;
  canApprove: boolean;
  canExport: boolean;
  canViewReasons: boolean;
}

export const AbsenceVisibilitySettings = () => {
  const { toast } = useToast();
  const { hasPermission } = useRolePermissions();
  
  const canEdit = hasPermission('absence_settings');

  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([
    {
      role: 'employee',
      displayName: 'Mitarbeiter',
      canView: 'own',
      canEdit: false,
      canApprove: false,
      canExport: false,
      canViewReasons: false,
    },
    {
      role: 'team_lead',
      displayName: 'Teamleiter',
      canView: 'team',
      canEdit: false,
      canApprove: true,
      canExport: true,
      canViewReasons: false,
    },
    {
      role: 'manager',
      displayName: 'Manager',
      canView: 'department',
      canEdit: false,
      canApprove: true,
      canExport: true,
      canViewReasons: true,
    },
    {
      role: 'hr',
      displayName: 'HR Manager',
      canView: 'all',
      canEdit: true,
      canApprove: true,
      canExport: true,
      canViewReasons: true,
    },
    {
      role: 'admin',
      displayName: 'Administrator',
      canView: 'all',
      canEdit: true,
      canApprove: true,
      canExport: true,
      canViewReasons: true,
    },
  ]);

  const handleSave = () => {
    toast({
      title: "Sichtbarkeitseinstellungen gespeichert",
      description: "Die Sichtbarkeits- und Rolleneinstellungen wurden erfolgreich aktualisiert.",
    });
  };

  const updateRolePermission = (role: string, field: keyof RolePermission, value: any) => {
    setRolePermissions(prev => prev.map(permission => 
      permission.role === role 
        ? { ...permission, [field]: value }
        : permission
    ));
  };

  const getViewScopeLabel = (scope: string) => {
    const labels: Record<string, string> = {
      own: 'Nur eigene',
      team: 'Team',
      department: 'Abteilung',
      location: 'Standort',
      all: 'Alle',
    };
    return labels[scope] || scope;
  };

  const getViewScopeColor = (scope: string) => {
    const colors: Record<string, string> = {
      own: 'bg-blue-500',
      team: 'bg-green-500',
      department: 'bg-orange-500',
      location: 'bg-purple-500',
      all: 'bg-red-500',
    };
    return colors[scope] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Eye className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Sichtbarkeit & Rollen</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Rollenbasierte Berechtigungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rolle</TableHead>
                  <TableHead>Sichtbarkeit</TableHead>
                  <TableHead>Bearbeiten</TableHead>
                  <TableHead>Genehmigen</TableHead>
                  <TableHead>Export</TableHead>
                  <TableHead>Gründe sehen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rolePermissions.map((permission) => (
                  <TableRow key={permission.role}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {permission.displayName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={permission.canView}
                        onValueChange={(value) => updateRolePermission(permission.role, 'canView', value)}
                        disabled={!canEdit}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="own">Nur eigene</SelectItem>
                          <SelectItem value="team">Team</SelectItem>
                          <SelectItem value="department">Abteilung</SelectItem>
                          <SelectItem value="location">Standort</SelectItem>
                          <SelectItem value="all">Alle</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={permission.canEdit}
                        onCheckedChange={(checked) => updateRolePermission(permission.role, 'canEdit', checked)}
                        disabled={!canEdit}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={permission.canApprove}
                        onCheckedChange={(checked) => updateRolePermission(permission.role, 'canApprove', checked)}
                        disabled={!canEdit}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={permission.canExport}
                        onCheckedChange={(checked) => updateRolePermission(permission.role, 'canExport', checked)}
                        disabled={!canEdit}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={permission.canViewReasons}
                        onCheckedChange={(checked) => updateRolePermission(permission.role, 'canViewReasons', checked)}
                        disabled={!canEdit}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EyeOff className="h-4 w-4" />
            Datenschutz & Anonymisierung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Abwesenheitsgründe anonymisieren</Label>
                <p className="text-sm text-muted-foreground">
                  Sensible Gründe (z.B. Krankheit) werden für niedrigere Rollen anonymisiert
                </p>
              </div>
              <Switch disabled={!canEdit} defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Medizinische Daten schützen</Label>
                <p className="text-sm text-muted-foreground">
                  Krankheitsdaten werden nur für HR und medizinisches Personal sichtbar
                </p>
              </div>
              <Switch disabled={!canEdit} defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Automatische Anonymisierung nach Zeit</Label>
                <p className="text-sm text-muted-foreground">
                  Abwesenheitsdaten werden nach festgelegter Zeit automatisch anonymisiert
                </p>
              </div>
              <Switch disabled={!canEdit} />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Anonymisierung nach (Monaten)</Label>
              <Select disabled={!canEdit}>
                <SelectTrigger>
                  <SelectValue placeholder="Zeitraum wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 Monate</SelectItem>
                  <SelectItem value="24">24 Monate</SelectItem>
                  <SelectItem value="36">36 Monate</SelectItem>
                  <SelectItem value="60">60 Monate</SelectItem>
                  <SelectItem value="never">Niemals</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Löschung nach (Jahren)</Label>
              <Select disabled={!canEdit}>
                <SelectTrigger>
                  <SelectValue placeholder="Zeitraum wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Jahre</SelectItem>
                  <SelectItem value="10">10 Jahre</SelectItem>
                  <SelectItem value="15">15 Jahre</SelectItem>
                  <SelectItem value="never">Niemals</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Audit & Protokollierung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Audit-Protokoll aktiviert</Label>
                <p className="text-sm text-muted-foreground">
                  Alle Änderungen werden protokolliert und sind nachverfolgbar
                </p>
              </div>
              <Switch disabled={!canEdit} defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Zugriffs-Protokoll</Label>
                <p className="text-sm text-muted-foreground">
                  Alle Zugriffe auf Abwesenheitsdaten werden protokolliert
                </p>
              </div>
              <Switch disabled={!canEdit} defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Änderungshistorie anzeigen</Label>
                <p className="text-sm text-muted-foreground">
                  Benutzer können die Historie ihrer Anträge einsehen
                </p>
              </div>
              <Switch disabled={!canEdit} defaultChecked />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Protokoll-Aufbewahrung (Jahre)</Label>
              <Select disabled={!canEdit}>
                <SelectTrigger>
                  <SelectValue placeholder="Zeitraum wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Jahre</SelectItem>
                  <SelectItem value="5">5 Jahre</SelectItem>
                  <SelectItem value="7">7 Jahre</SelectItem>
                  <SelectItem value="10">10 Jahre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Audit-Berichtshäufigkeit</Label>
              <Select disabled={!canEdit}>
                <SelectTrigger>
                  <SelectValue placeholder="Häufigkeit wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Wöchentlich</SelectItem>
                  <SelectItem value="monthly">Monatlich</SelectItem>
                  <SelectItem value="quarterly">Quartalsweise</SelectItem>
                  <SelectItem value="annually">Jährlich</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Sicherheitseinstellungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Zwei-Faktor-Authentifizierung für HR</Label>
              <p className="text-sm text-muted-foreground">
                HR-Mitarbeiter müssen 2FA für Zugriff auf Abwesenheitsdaten verwenden
              </p>
            </div>
            <Switch disabled={!canEdit} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>IP-Beschränkung</Label>
              <p className="text-sm text-muted-foreground">
                Zugriff nur von bestimmten IP-Adressen/Netzwerken erlauben
              </p>
            </div>
            <Switch disabled={!canEdit} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Session-Timeout</Label>
              <p className="text-sm text-muted-foreground">
                Automatische Abmeldung nach Inaktivität
              </p>
            </div>
            <Switch disabled={!canEdit} defaultChecked />
          </div>

          <div className="space-y-2">
            <Label>Timeout-Dauer (Minuten)</Label>
            <Select disabled={!canEdit}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Dauer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 Min</SelectItem>
                <SelectItem value="30">30 Min</SelectItem>
                <SelectItem value="60">60 Min</SelectItem>
                <SelectItem value="120">120 Min</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {canEdit && (
        <div className="flex justify-end">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Einstellungen speichern
          </Button>
        </div>
      )}
    </div>
  );
};