import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Smartphone, 
  MapPin, 
  Shield, 
  Wifi, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Globe,
  Trash2,
  MoreHorizontal
} from "lucide-react";

export default function DeviceLocationManagement() {
  const deviceStats = {
    registeredDevices: 8647,
    activeToday: 7234,
    blockedDevices: 23,
    suspiciousActivity: 12,
    geofenceViolations: 8
  };

  const registeredDevices = [
    {
      id: "DEV001",
      user: "Max Müller",
      device: "iPhone 14 Pro",
      type: "Smartphone",
      status: "Aktiv",
      lastSeen: "vor 2 Min.",
      location: "München, DE",
      risk: "Niedrig"
    },
    {
      id: "DEV002", 
      user: "Anna Schmidt",
      device: "Samsung Galaxy S23",
      type: "Smartphone", 
      status: "Aktiv",
      lastSeen: "vor 15 Min.",
      location: "Zürich, CH",
      risk: "Niedrig"
    },
    {
      id: "DEV003",
      user: "John Doe", 
      device: "iPad Air",
      type: "Tablet",
      status: "Verdächtig",
      lastSeen: "vor 3 Std.",
      location: "Unbekannt",
      risk: "Hoch"
    }
  ];

  const geofenceRules = [
    {
      id: "GF001",
      name: "Deutschland - Hauptstandorte", 
      countries: ["🇩🇪 Deutschland"],
      cities: ["München", "Berlin", "Hamburg"],
      status: "Aktiv",
      violations: 3
    },
    {
      id: "GF002",
      name: "Schweiz - Büros",
      countries: ["🇨🇭 Schweiz"], 
      cities: ["Zürich", "Basel", "Bern"],
      status: "Aktiv",
      violations: 2
    },
    {
      id: "GF003",
      name: "Österreich - Niederlassungen",
      countries: ["🇦🇹 Österreich"],
      cities: ["Wien", "Graz", "Salzburg"], 
      status: "Aktiv",
      violations: 1
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registrierte Geräte</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deviceStats.registeredDevices.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Alle Geräte im System</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heute aktiv</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deviceStats.activeToday.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Genutzte Geräte heute</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blockierte Geräte</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deviceStats.blockedDevices}</div>
            <p className="text-xs text-muted-foreground">Gesperrte Geräte</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verdächtige Aktivität</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deviceStats.suspiciousActivity}</div>
            <p className="text-xs text-muted-foreground">Anomalien erkannt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geofence-Verstöße</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deviceStats.geofenceViolations}</div>
            <p className="text-xs text-muted-foreground">Standort-Verletzungen</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Geräteregistrierung</CardTitle>
            <CardDescription>
              Verwaltung und Konfiguration von Mitarbeitergeräten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Registrierungsrichtlinien</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Automatische Geräte-Registrierung</div>
                    <div className="text-sm text-muted-foreground">Neue Geräte werden automatisch erfasst</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Administratorfreigabe erforderlich</div>
                    <div className="text-sm text-muted-foreground">Neue Geräte benötigen Freigabe</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Geräte-Fingerprinting</div>
                    <div className="text-sm text-muted-foreground">Eindeutige Hardware-Identifikation</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">MDM-Integration</div>
                    <div className="text-sm text-muted-foreground">Mobile Device Management</div>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-devices">Max. Geräte pro Mitarbeiter</Label>
                <Input id="max-devices" type="number" defaultValue="3" min="1" max="10" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="device-timeout">Geräte-Timeout (Tage)</Label>
                <Input id="device-timeout" type="number" defaultValue="90" min="7" max="365" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Smart Detection</CardTitle>
            <CardDescription>
              Intelligente Erkennung ungewöhnlicher Geräte und Aktivitäten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Erkennungsregeln</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Parallele Logins erkennen</div>
                    <div className="text-sm text-muted-foreground">Gleichzeitiges Login auf mehreren Geräten</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Unbekannte Browser</div>
                    <div className="text-sm text-muted-foreground">Login von neuem Browser/Gerät</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Standort-Anomalien</div>
                    <div className="text-sm text-muted-foreground">Login aus ungewöhnlichen Orten</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Automatische HR-Alerts</div>
                    <div className="text-sm text-muted-foreground">Benachrichtigung bei Anomalien</div>
                  </div>
                  <Switch checked />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="detection-sensitivity">Erkennungsempfindlichkeit</Label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Niedrig</SelectItem>
                    <SelectItem value="medium">Mittel</SelectItem>
                    <SelectItem value="high">Hoch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="text-sm text-yellow-800">
                  <AlertCircle className="h-4 w-4 inline mr-2" />
                  <strong>Aktive Überwachung:</strong> Das System überwacht kontinuierlich 
                  alle Gerätezugriffe und erkennt automatisch verdächtige Muster.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Geo-Fencing Konfiguration</CardTitle>
            <CardDescription>
              Standortbasierte Sicherheitsregeln und Zugriffsbeschränkungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Aktive Geofences</h4>
                <Button size="sm">Neue Zone hinzufügen</Button>
              </div>
              
              <div className="space-y-3">
                {geofenceRules.map((rule) => (
                  <div key={rule.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{rule.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {rule.countries.join(", ")}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          Städte: {rule.cities.join(", ")}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{rule.status}</Badge>
                        {rule.violations > 0 && (
                          <Badge variant="destructive">{rule.violations} Verstöße</Badge>
                        )}
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Außendienst-Ausnahmen</div>
                    <div className="text-sm text-muted-foreground">Definierte Rollen können außerhalb arbeiten</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Automatische IP-Blockierung</div>
                    <div className="text-sm text-muted-foreground">Verdächtige IPs automatisch sperren</div>
                  </div>
                  <Switch checked />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registrierte Geräte</CardTitle>
            <CardDescription>
              Übersicht aller im System registrierten Geräte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>Gerät</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Standort</TableHead>
                  <TableHead>Risiko</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registeredDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{device.user}</div>
                        <div className="text-xs text-muted-foreground">{device.lastSeen}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{device.device}</div>
                        <div className="text-xs text-muted-foreground">{device.type}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={device.status === 'Aktiv' ? 'outline' : 'destructive'}
                      >
                        {device.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{device.location}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={device.risk === 'Niedrig' ? 'outline' : 'destructive'}
                      >
                        {device.risk}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Standortabhängige Sicherheit</CardTitle>
          <CardDescription>
            Länderspezifische Sicherheitsregeln und gesetzliche Anforderungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-5 w-5" />
                <span className="font-medium">🇩🇪 Deutschland</span>
              </div>
              <div className="space-y-2 text-sm">
                <div>✓ DSGVO-konform</div>
                <div>✓ Betriebsrat berücksichtigt</div>
                <div>✓ Datenschutz-Folgenabschätzung</div>
                <div>✓ Mitarbeiterkontrolle beschränkt</div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-5 w-5" />
                <span className="font-medium">🇨🇭 Schweiz</span>
              </div>
              <div className="space-y-2 text-sm">
                <div>✓ Striktere Datenschutzregeln</div>
                <div>✓ Separate Datenspeicherung</div>
                <div>✓ Bankgeheimnis beachtet</div>
                <div>✓ Kantonale Besonderheiten</div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5" />
                <span className="font-medium">Öffentliche Sicherheit</span>
              </div>
              <div className="space-y-2 text-sm">
                <div>✓ Polizei/Feuerwehr-Sondergesetze</div>
                <div>✓ Erweiterte Überwachungsrechte</div>
                <div>✓ Notfall-Zugriffsmodi</div>
                <div>✓ Compliance für Behörden</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}