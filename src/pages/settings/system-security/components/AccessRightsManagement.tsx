import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Edit, Trash2, Shield } from "lucide-react";

export default function AccessRightsManagement() {
  const userGroups = [
    { id: "1", name: "Admin", members: 5, permissions: "Vollzugriff", color: "red" },
    { id: "2", name: "HR Manager", members: 12, permissions: "HR-Module", color: "blue" },
    { id: "3", name: "Manager", members: 45, permissions: "Abteilungs-Management", color: "green" },
    { id: "4", name: "Teamleiter", members: 120, permissions: "Team-Verwaltung", color: "yellow" },
    { id: "5", name: "Mitarbeiter", members: 8500, permissions: "Basis-Zugriff", color: "gray" }
  ];

  const modules = [
    "Zeiterfassung", "Abwesenheiten", "Dokumente", "Schichtplanung", 
    "Recruiting", "Compliance", "Reporting", "Nachhaltigkeit"
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benutzergruppen</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Aktive Rollen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamte Benutzer</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,682</div>
            <p className="text-xs text-muted-foreground">Registrierte Mitarbeiter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benutzerdefinierte Rollen</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Spezielle Rollen</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Benutzergruppen verwalten</CardTitle>
            <CardDescription>
              Zentrale Verwaltung aller Benutzerrollen und Berechtigungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rolle</TableHead>
                  <TableHead>Mitglieder</TableHead>
                  <TableHead>Berechtigungen</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{group.name}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>{group.members.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {group.permissions}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Neue Rolle erstellen
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Granulare Rechtevergabe</CardTitle>
            <CardDescription>
              Detaillierte Berechtigungen pro Modul konfigurieren
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role-select">Rolle auswählen</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Rolle wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {userGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Modul-Berechtigungen</Label>
              {modules.map((module) => (
                <div key={module} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <div className="font-medium">{module}</div>
                    <div className="text-sm text-muted-foreground">
                      Zugriff auf {module}-Modul
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch id={`${module}-view`} />
                      <Label htmlFor={`${module}-view`} className="text-sm">Ansehen</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id={`${module}-edit`} />
                      <Label htmlFor={`${module}-edit`} className="text-sm">Bearbeiten</Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dynamische Rollen nach Standort</CardTitle>
            <CardDescription>
              Unterschiedliche Berechtigungen je nach Land/Region
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="country-select">Land/Region</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Land auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">🇩🇪 Deutschland</SelectItem>
                  <SelectItem value="ch">🇨🇭 Schweiz</SelectItem>
                  <SelectItem value="at">🇦🇹 Österreich</SelectItem>
                  <SelectItem value="us">🇺🇸 USA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Länderspezifische Anpassungen</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="overtime-rules">Überstunden-Regeln</Label>
                  <Switch id="overtime-rules" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="vacation-rules">Urlaubsregeln</Label>
                  <Switch id="vacation-rules" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="data-protection">Datenschutz-Level</Label>
                  <Switch id="data-protection" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delegation & Vertretungen</CardTitle>
            <CardDescription>
              Temporäre Rechteübertragung bei Abwesenheit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delegate-from">Rechte übertragen von</Label>
              <Input id="delegate-from" placeholder="Mitarbeiter suchen..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delegate-to">Rechte übertragen an</Label>
              <Input id="delegate-to" placeholder="Vertreter suchen..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Von</Label>
                <Input id="start-date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Bis</Label>
                <Input id="end-date" type="date" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Zu übertragende Berechtigungen</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="delegate-approval" />
                  <Label htmlFor="delegate-approval">Genehmigungsrechte</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="delegate-reports" />
                  <Label htmlFor="delegate-reports">Berichtserstellung</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="delegate-admin" />
                  <Label htmlFor="delegate-admin">Administrative Funktionen</Label>
                </div>
              </div>
            </div>

            <Button className="w-full">Delegation erstellen</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}