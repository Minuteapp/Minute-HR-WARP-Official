import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Monitor, Smartphone, QrCode, Shield, MapPin, Trash2, Plus, Wifi } from "lucide-react";

export default function DeviceSecurityTerminals() {
  const terminals = [
    { id: "T001", name: "Haupteingang Terminal", type: "QR-Scanner", location: "Büro Hamburg", status: "online", lastSync: "vor 2 Min" },
    { id: "T002", name: "Produktions-Terminal A", type: "Badge-Reader", location: "Werk München", status: "online", lastSync: "vor 1 Min" },
    { id: "T003", name: "Kantine Terminal", type: "Biometrisch", location: "Büro Berlin", status: "offline", lastSync: "vor 15 Min" },
    { id: "T004", name: "Lager Terminal", type: "QR-Scanner", location: "Lager Dresden", status: "online", lastSync: "vor 30 Sek" }
  ];

  const mobileDevices = [
    { id: "MD001", user: "Max Müller", device: "iPhone 14", platform: "iOS", registered: "15.01.2024", lastActive: "online" },
    { id: "MD002", user: "Anna Schmidt", device: "Samsung Galaxy S23", platform: "Android", registered: "12.01.2024", lastActive: "vor 2h" },
    { id: "MD003", user: "John Doe", device: "iPad Pro", platform: "iOS", registered: "10.01.2024", lastActive: "offline" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Terminals</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">3 offline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mobile Geräte</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,245</div>
            <p className="text-xs text-muted-foreground">Registrierte Geräte</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR-Scans heute</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,456</div>
            <p className="text-xs text-muted-foreground">+5% vs. gestern</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sicherheitsverletzungen</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Diese Woche</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Terminal-Verwaltung</CardTitle>
            <CardDescription>
              Verwaltung der Zeiterfassungs- und Zugangsterminals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Registrierte Terminals</h4>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Terminal hinzufügen
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Terminal</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {terminals.map((terminal) => (
                  <TableRow key={terminal.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{terminal.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {terminal.location}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{terminal.type}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={terminal.status === 'online' ? 'text-green-600' : 'text-red-600'}
                      >
                        {terminal.status === 'online' ? 'Online' : 'Offline'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Smart Detection Einstellungen</CardTitle>
            <CardDescription>
              Konfiguration der automatischen Erkennung und Validierung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">QR-Code Validierung</div>
                  <div className="text-sm text-muted-foreground">
                    Automatische Überprüfung der QR-Code Gültigkeit
                  </div>
                </div>
                <Switch checked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Standort-Abgleich</div>
                  <div className="text-sm text-muted-foreground">
                    Überprüfung ob Mitarbeiter am korrekten Standort ist
                  </div>
                </div>
                <Switch checked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Mitarbeiter-ID Erkennung</div>
                  <div className="text-sm text-muted-foreground">
                    Automatische Zuordnung zur Mitarbeiternummer
                  </div>
                </div>
                <Switch checked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Anomalie-Erkennung</div>
                  <div className="text-sm text-muted-foreground">
                    Verdächtige Aktivitäten automatisch melden
                  </div>
                </div>
                <Switch />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validation-timeout">Validierungs-Timeout (Sekunden)</Label>
              <Input id="validation-timeout" type="number" defaultValue="30" min="10" max="120" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-distance">Maximale Standort-Abweichung (Meter)</Label>
              <Input id="max-distance" type="number" defaultValue="50" min="10" max="500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mobile Device Management (MDM)</CardTitle>
            <CardDescription>
              Verwaltung registrierter mobiler Geräte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>Gerät</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mobileDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{device.user}</div>
                        <div className="text-sm text-muted-foreground">
                          Registriert: {device.registered}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{device.device}</div>
                        <div className="text-sm text-muted-foreground">{device.platform}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={device.lastActive === 'online' ? 'text-green-600' : 'text-gray-600'}
                      >
                        {device.lastActive}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Wifi className="h-4 w-4" />
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rollenbasierte Terminal-Zugriffe</CardTitle>
            <CardDescription>
              Zugangsrechte zu verschiedenen Bereichen konfigurieren
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
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="security">Sicherheitspersonal</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Mitarbeiter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Zugangsbereiche</Label>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <div className="font-medium">Hochsicherheitsbereich</div>
                    <div className="text-sm text-muted-foreground">Serverraum, Tresor</div>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <div className="font-medium">Produktionsbereich</div>
                    <div className="text-sm text-muted-foreground">Fertigungshallen</div>
                  </div>
                  <Switch checked />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <div className="font-medium">Bürobereiche</div>
                    <div className="text-sm text-muted-foreground">Normale Arbeitsplätze</div>
                  </div>
                  <Switch checked />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <div className="font-medium">Außenbereich</div>
                    <div className="text-sm text-muted-foreground">Parkplätze, Lager</div>
                  </div>
                  <Switch checked />
                </div>
              </div>
            </div>

            <Button className="w-full">Berechtigungen speichern</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}