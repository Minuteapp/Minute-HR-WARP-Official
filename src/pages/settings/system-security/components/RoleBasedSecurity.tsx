import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Shield, 
  Clock, 
  Key, 
  UserCheck,
  UserX,
  Settings,
  Plus,
  MoreHorizontal,
  Crown,
  UserCog
} from "lucide-react";

export default function RoleBasedSecurity() {
  const roleStats = {
    totalRoles: 12,
    activeUsers: 8647,
    adminUsers: 15,
    temporaryRoles: 28,
    expiredRoles: 7
  };

  const systemRoles = [
    {
      id: "admin",
      name: "Administrator", 
      description: "Vollzugriff auf alle System- und Sicherheitseinstellungen",
      users: 15,
      permissions: ["Alle Module", "Benutzerverwaltung", "Systemkonfiguration", "Audit-Logs"],
      color: "red",
      systemRole: true
    },
    {
      id: "hr-manager",
      name: "HR Manager",
      description: "Zugriff auf Mitarbeiterdaten und Personalprozesse",
      users: 45,
      permissions: ["Mitarbeiterdaten", "Abwesenheiten", "Recruiting", "Berichte"],
      color: "blue",
      systemRole: true
    },
    {
      id: "manager", 
      name: "Manager/Teamleiter",
      description: "Zugriff auf eigene Abteilung und Teams",
      users: 234,
      permissions: ["Team-Management", "Genehmigungen", "Team-Berichte"],
      color: "green",
      systemRole: true
    },
    {
      id: "employee",
      name: "Mitarbeiter",
      description: "Standard-Mitarbeiterzugriff auf eigene Daten",
      users: 7890,
      permissions: ["Eigene Daten", "Zeiterfassung", "Urlaubsantrag"],
      color: "gray",
      systemRole: true
    },
    {
      id: "external",
      name: "Externe Partner",
      description: "Eingeschränkter Gastzugriff für externe Mitarbeiter",
      users: 143,
      permissions: ["Projekt-Zugriff", "Zeiterfassung", "Dokumente (begrenzt)"],
      color: "orange",
      systemRole: false
    }
  ];

  const dynamicRoles = [
    {
      id: "proj-lead-2024",
      name: "Projektleiter Q1 2024",
      description: "Temporäre Projektleitung für Digitalisierungsinitiative",
      assignedTo: "Sarah Weber",
      validUntil: "2024-03-31",
      status: "Aktiv",
      permissions: ["Projekt-Dashboard", "Budget-Übersicht", "Team-Koordination"]
    },
    {
      id: "compliance-officer", 
      name: "Compliance Officer",
      description: "Sonderrolle für DSGVO und Audit-Tätigkeiten",
      assignedTo: "Dr. Michael Klein",
      validUntil: "2024-12-31", 
      status: "Aktiv",
      permissions: ["Audit-Logs", "Compliance-Berichte", "Datenschutz-Tools"]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt-Rollen</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.totalRoles}</div>
            <p className="text-xs text-muted-foreground">System- und Custom-Rollen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Benutzer</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Mit zugewiesenen Rollen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administratoren</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.adminUsers}</div>
            <p className="text-xs text-muted-foreground">System-Administratoren</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temporäre Rollen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.temporaryRoles}</div>
            <p className="text-xs text-muted-foreground">Zeitlich begrenzte Rechte</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abgelaufene Rollen</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.expiredRoles}</div>
            <p className="text-xs text-muted-foreground">Benötigen Bereinigung</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System-Rollen Übersicht</CardTitle>
          <CardDescription>
            Vordefinierte Rollen mit standardisierten Berechtigungen und Zugriffsstufen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rolle</TableHead>
                <TableHead>Benutzer</TableHead>
                <TableHead>Hauptberechtigungen</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systemRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {role.name}
                        {role.systemRole && <Shield className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div className="text-sm text-muted-foreground">{role.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-right">
                      <div className="font-medium">{role.users.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Zugewiesen</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 2).map((permission, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                      {role.permissions.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{role.permissions.length - 2} weitere
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.systemRole ? "outline" : "secondary"}>
                      {role.systemRole ? "System" : "Custom"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dynamische Rollen</CardTitle>
            <CardDescription>
              Zeitlich begrenzte und projektbasierte Rollenzuweisungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Aktive temporäre Rollen</h4>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Neue Rolle
              </Button>
            </div>

            <div className="space-y-3">
              {dynamicRoles.map((role) => (
                <div key={role.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="font-medium">{role.name}</div>
                      <div className="text-sm text-muted-foreground">{role.description}</div>
                      <div className="text-xs text-blue-600 mt-1">
                        Zugewiesen an: {role.assignedTo}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{role.status}</Badge>
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-sm text-muted-foreground">
                      Gültig bis: {role.validUntil}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 2).map((permission, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rollen-Verwaltung</CardTitle>
            <CardDescription>
              Konfiguration und Delegation von Benutzerrollen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Rollenverwaltungsregeln</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Selbst-Delegation erlauben</div>
                    <div className="text-sm text-muted-foreground">Manager können temporäre Rechte übertragen</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Automatische Rollenerneuerung</div>
                    <div className="text-sm text-muted-foreground">Projektbasierte Rollen verlängern</div>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Rollenvererbung</div>
                    <div className="text-sm text-muted-foreground">Abteilungsrechte an Untergruppen</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Abwesenheits-Delegation</div>
                    <div className="text-sm text-muted-foreground">Temporäre Rechtübertragung bei Urlaub</div>
                  </div>
                  <Switch checked />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-delegation-days">Max. Delegationsdauer (Tage)</Label>
                <Input id="max-delegation-days" type="number" defaultValue="30" min="1" max="365" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auto-cleanup">Automatische Bereinigung</Label>
                <Select defaultValue="weekly">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Täglich</SelectItem>
                    <SelectItem value="weekly">Wöchentlich</SelectItem>
                    <SelectItem value="monthly">Monatlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Berechtigungsmatrix</CardTitle>
          <CardDescription>
            Granulare Rechtevergabe pro Modul und rollenspezifische Sichtbarkeit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {[
                {
                  role: "Admin",
                  permissions: {
                    "Zeiterfassung": "Vollzugriff",
                    "Abwesenheiten": "Vollzugriff", 
                    "Berichte": "Alle Daten",
                    "Systemconfig": "Vollzugriff"
                  },
                  color: "red"
                },
                {
                  role: "HR Manager", 
                  permissions: {
                    "Zeiterfassung": "Alle lesen",
                    "Abwesenheiten": "Genehmigen",
                    "Berichte": "HR-Daten",
                    "Systemconfig": "Kein Zugriff"
                  },
                  color: "blue"
                },
                {
                  role: "Manager",
                  permissions: {
                    "Zeiterfassung": "Team lesen",
                    "Abwesenheiten": "Team genehmigen", 
                    "Berichte": "Team-Daten",
                    "Systemconfig": "Kein Zugriff"
                  },
                  color: "green"
                },
                {
                  role: "Mitarbeiter",
                  permissions: {
                    "Zeiterfassung": "Eigene Daten",
                    "Abwesenheiten": "Beantragen",
                    "Berichte": "Eigene Daten",
                    "Systemconfig": "Kein Zugriff"
                  },
                  color: "gray"
                }
              ].map((roleMatrix, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="font-medium mb-3 flex items-center gap-2">
                    <UserCog className="h-4 w-4" />
                    {roleMatrix.role}
                  </div>
                  <div className="space-y-2 text-sm">
                    {Object.entries(roleMatrix.permissions).map(([module, permission], permIndex) => (
                      <div key={permIndex} className="flex justify-between">
                        <span className="text-muted-foreground">{module}:</span>
                        <Badge variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-sm text-blue-800">
                <Shield className="h-4 w-4 inline mr-2" />
                <strong>RBAC-Status:</strong> Das rollenbasierte Zugriffskontrollsystem ist aktiv und 
                überwacht alle Modulzugriffe. Berechtigungen werden automatisch durchgesetzt und 
                regelmäßig auditiert. Temporäre Rollen werden automatisch nach Ablauf entfernt.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}