import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Monitor, Smartphone, QrCode, CreditCard, Fingerprint, MapPin, Users, Plus, Settings, Trash2, Wifi, WifiOff } from "lucide-react";

export default function TerminalDeviceManagement() {
  const terminals = [
    { 
      id: "T001", 
      name: "Haupteingang Hamburg", 
      type: "QR-Scanner", 
      location: "Hamburg - Bürogebäude A", 
      status: "online", 
      employees: 450, 
      dailyScans: 892,
      lastSync: "vor 2 Min"
    },
    { 
      id: "T002", 
      name: "Produktionshalle München", 
      type: "RFID-Terminal", 
      location: "München - Werk 1", 
      status: "online", 
      employees: 280, 
      dailyScans: 560,
      lastSync: "vor 1 Min"
    },
    { 
      id: "T003", 
      name: "Biometric Scanner Berlin", 
      type: "Fingerprint", 
      location: "Berlin - Sicherheitsbereich", 
      status: "offline", 
      employees: 25, 
      dailyScans: 0,
      lastSync: "vor 15 Min"
    },
    { 
      id: "T004", 
      name: "Mobile Terminal Dresden", 
      type: "Tablet-App", 
      location: "Dresden - Lager", 
      status: "online", 
      employees: 120, 
      dailyScans: 240,
      lastSync: "vor 30 Sek"
    }
  ];

  const mobileDevices = [
    { id: "MD001", user: "Max Müller", device: "iPhone 14 Pro", os: "iOS 17.2", registered: "15.01.2024", lastActive: "online", company: true },
    { id: "MD002", user: "Anna Schmidt", device: "Samsung Galaxy S24", os: "Android 14", registered: "12.01.2024", lastActive: "vor 2h", company: false },
    { id: "MD003", user: "John Doe", device: "iPad Air", os: "iOS 17.1", registered: "10.01.2024", lastActive: "vor 5h", company: true },
    { id: "MD004", user: "Sarah Weber", device: "Pixel 8", os: "Android 14", registered: "08.01.2024", lastActive: "offline", company: false }
  ];

  const employeeGroups = [
    { id: "admin", name: "Administratoren", terminals: ["T001", "T002", "T003", "T004"], employees: 12 },
    { id: "production", name: "Produktionsmitarbeiter", terminals: ["T002", "T004"], employees: 280 },
    { id: "office", name: "Büromitarbeiter", terminals: ["T001"], employees: 450 },
    { id: "security", name: "Sicherheitspersonal", terminals: ["T003"], employees: 25 }
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
            <div className="text-2xl font-bold">{terminals.filter(t => t.status === 'online').length}</div>
            <p className="text-xs text-muted-foreground">von {terminals.length} gesamt</p>
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
            <CardTitle className="text-sm font-medium">Heute: Scans</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {terminals.reduce((sum, terminal) => sum + terminal.dailyScans, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">QR & RFID Scans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zugewiesene Mitarbeiter</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {terminals.reduce((sum, terminal) => sum + terminal.employees, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Berechtigt</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Zeiterfassungsterminals</CardTitle>
            <CardDescription>
              Verwaltung und Konfiguration der Zeiterfassungsterminals an verschiedenen Standorten
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
                  <TableHead>Heute</TableHead>
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
                    <TableCell>
                      <Badge variant="outline">{terminal.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {terminal.status === 'online' ? (
                          <Wifi className="h-4 w-4 text-green-600" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-red-600" />
                        )}
                        <Badge 
                          variant="outline" 
                          className={terminal.status === 'online' ? 'text-green-600' : 'text-red-600'}
                        >
                          {terminal.status === 'online' ? 'Online' : 'Offline'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{terminal.dailyScans} Scans</div>
                        <div className="text-muted-foreground">{terminal.employees} Mitarbeiter</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
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
            <CardTitle>Terminal-Konfiguration</CardTitle>
            <CardDescription>
              Einstellungen für neue Terminals und Gerätezuordnung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium">Neues Terminal hinzufügen</h4>
              
              <div className="space-y-2">
                <Label htmlFor="terminal-name">Terminal-Name</Label>
                <Input id="terminal-name" placeholder="z.B. Eingang Ost" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="terminal-type">Terminal-Typ</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Typ auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qr">QR-Code Scanner</SelectItem>
                    <SelectItem value="rfid">RFID Badge-Reader</SelectItem>
                    <SelectItem value="biometric">Biometrisches Terminal</SelectItem>
                    <SelectItem value="tablet">Tablet-App</SelectItem>
                    <SelectItem value="phone">Smartphone-App</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="terminal-location">Standort</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Standort auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hamburg">Hamburg - Bürogebäude A</SelectItem>
                    <SelectItem value="munich">München - Werk 1</SelectItem>
                    <SelectItem value="berlin">Berlin - Sicherheitsbereich</SelectItem>
                    <SelectItem value="dresden">Dresden - Lager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="terminal-ip">IP-Adresse</Label>
                <Input id="terminal-ip" placeholder="192.168.1.100" />
              </div>

              <Button className="w-full">Terminal registrieren</Button>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Terminal-Einstellungen</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-sync">Automatische Synchronisation</Label>
                  <Switch id="auto-sync" checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="offline-mode">Offline-Modus unterstützen</Label>
                  <Switch id="offline-mode" checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="audio-feedback">Audio-Feedback</Label>
                  <Switch id="audio-feedback" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sync-interval">Synchronisations-Intervall (Sekunden)</Label>
                <Input id="sync-interval" type="number" defaultValue="30" min="10" max="300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mobile Device Management</CardTitle>
            <CardDescription>
              Verwaltung registrierter Smartphones und Tablets für die mobile Zeiterfassung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Registrierte Geräte (Auszug)</h4>
              <Button size="sm" variant="outline">
                Alle anzeigen
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>Gerät</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Firmengerät</TableHead>
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
                        <div className="font-medium flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          {device.device}
                        </div>
                        <div className="text-sm text-muted-foreground">{device.os}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={
                          device.lastActive === 'online' ? 'text-green-600' :
                          device.lastActive === 'offline' ? 'text-red-600' : 'text-yellow-600'
                        }
                      >
                        {device.lastActive}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={device.company ? 'text-blue-600' : 'text-gray-600'}>
                        {device.company ? 'Ja' : 'Privat'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
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

            <div className="space-y-4">
              <h4 className="font-medium">MDM-Einstellungen</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="device-registration">Geräte-Registrierung erforderlich</Label>
                  <Switch id="device-registration" checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="remote-wipe">Remote-Wipe bei Verlust</Label>
                  <Switch id="remote-wipe" checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="app-updates">Automatische App-Updates</Label>
                  <Switch id="app-updates" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mitarbeitergruppen & Terminal-Zuordnung</CardTitle>
            <CardDescription>
              Verwaltung welche Mitarbeitergruppen auf welche Terminals zugreifen können
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {employeeGroups.map((group) => (
                <div key={group.id} className="p-4 border rounded-md">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium">{group.name}</div>
                      <div className="text-sm text-muted-foreground">{group.employees} Mitarbeiter</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Bearbeiten
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Zugewiesene Terminals:</Label>
                    <div className="flex flex-wrap gap-2">
                      {group.terminals.map((terminalId) => {
                        const terminal = terminals.find(t => t.id === terminalId);
                        return (
                          <Badge key={terminalId} variant="outline" className="text-xs">
                            {terminal?.name || terminalId}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Neue Mitarbeitergruppe</h4>
              
              <div className="space-y-2">
                <Label htmlFor="group-name">Gruppenname</Label>
                <Input id="group-name" placeholder="z.B. Schichtleiter" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="group-terminals">Zugewiesene Terminals</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Terminals auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {terminals.map((terminal) => (
                      <SelectItem key={terminal.id} value={terminal.id}>
                        {terminal.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full">Gruppe erstellen</Button>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-sm text-blue-800">
                <strong>Smart Detection:</strong> Terminals überprüfen automatisch die 
                Mitarbeiter-ID, den Standort und die Berechtigung. Bei Unstimmigkeiten 
                wird der Zugriff verweigert und ein Sicherheitsprotokoll erstellt.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}