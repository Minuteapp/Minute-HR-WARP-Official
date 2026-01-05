import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { QrCode, Smartphone, Watch, Shield, AlertTriangle, RefreshCw, CheckCircle, XCircle } from "lucide-react";

export default function QRCodeSmartDetection() {
  const qrCodeStats = {
    totalCodes: 8687,
    activeToday: 8245,
    securityTokens: 8687,
    suspiciousAttempts: 12,
    blockedAttempts: 3
  };

  const detectionEvents = [
    { 
      id: "DT001", 
      employee: "Max Müller", 
      event: "Mehrfach-Scan erkannt", 
      time: "08:15", 
      location: "Terminal A1", 
      status: "blocked",
      details: "3 Scans in 30 Sekunden"
    },
    { 
      id: "DT002", 
      employee: "Anna Schmidt", 
      event: "Standort-Abweichung", 
      time: "07:45", 
      location: "Außerhalb Geofence", 
      status: "warning",
      details: "450m vom Terminal entfernt"
    },
    { 
      id: "DT003", 
      employee: "John Doe", 
      event: "Erfolgreiche Validierung", 
      time: "07:30", 
      location: "Terminal B2", 
      status: "success",
      details: "Alle Checks bestanden"
    }
  ];

  const qrDeviceTypes = [
    { type: "smartphone", name: "Smartphone-App", icon: Smartphone, users: 7800, active: true },
    { type: "smartwatch", name: "Smartwatch", icon: Watch, users: 245, active: true },
    { type: "badge", name: "QR-Badge (physisch)", icon: QrCode, users: 642, active: true }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR-Codes aktiv</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qrCodeStats.totalCodes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Ausgestellte Codes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heute genutzt</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qrCodeStats.activeToday.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Unterschiedliche Nutzer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sicherheitstokens</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qrCodeStats.securityTokens.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Verschlüsselt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verdächtige Versuche</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qrCodeStats.suspiciousAttempts}</div>
            <p className="text-xs text-muted-foreground">Heute erkannt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blockierte Scans</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qrCodeStats.blockedAttempts}</div>
            <p className="text-xs text-muted-foreground">Automatisch blockiert</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>QR-Code Konfiguration</CardTitle>
            <CardDescription>
              Einstellungen für QR-Code-Generierung und Sicherheitsfeatures
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">QR-Code Eigenschaften</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Eindeutige Mitarbeiter-QR-ID</div>
                    <div className="text-sm text-muted-foreground">Jeder Mitarbeiter erhält eine einmalige ID</div>
                  </div>
                  <Switch checked disabled />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Sicherheitstokens einbetten</div>
                    <div className="text-sm text-muted-foreground">Verschlüsselte Token zur Fälschungssicherheit</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Dynamische QR-Codes</div>
                    <div className="text-sm text-muted-foreground">Codes ändern sich täglich</div>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="token-expiry">Token-Gültigkeit (Stunden)</Label>
                <div className="space-y-2">
                  <Slider
                    id="token-expiry"
                    min={1}
                    max={24}
                    step={1}
                    defaultValue={[8]}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>1h</span>
                    <span>8h (aktuell)</span>
                    <span>24h</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code-format">QR-Code Format</Label>
                <Select defaultValue="encrypted">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Einfache Mitarbeiter-ID</SelectItem>
                    <SelectItem value="encrypted">Verschlüsselte ID + Token</SelectItem>
                    <SelectItem value="dynamic">Dynamisch mit Zeitstempel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Geräte-Unterstützung</h4>
              
              <div className="space-y-3">
                {qrDeviceTypes.map((device) => {
                  const IconComponent = device.icon;
                  return (
                    <div key={device.type} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{device.name}</div>
                          <div className="text-sm text-muted-foreground">{device.users.toLocaleString()} aktive Nutzer</div>
                        </div>
                      </div>
                      <Switch checked={device.active} />
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Smart Detection Einstellungen</CardTitle>
            <CardDescription>
              Intelligente Überwachung und automatische Missbrauchserkennung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Automatische Validierung</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Standort-Verifizierung</div>
                    <div className="text-sm text-muted-foreground">Überprüfung ob Mitarbeiter am richtigen Standort ist</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Zeitfenster-Prüfung</div>
                    <div className="text-sm text-muted-foreground">Scan nur zu erlaubten Arbeitszeiten</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Berechtigung-Check</div>
                    <div className="text-sm text-muted-foreground">Mitarbeiter hat Zugang zu diesem Terminal</div>
                  </div>
                  <Switch checked />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location-tolerance">Standort-Toleranz (Meter)</Label>
                <Input id="location-tolerance" type="number" defaultValue="50" min="10" max="500" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scan-cooldown">Scan-Cooldown (Sekunden)</Label>
                <Input id="scan-cooldown" type="number" defaultValue="30" min="10" max="300" />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Missbrauchserkennung</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Mehrfach-Scan Erkennung</div>
                    <div className="text-sm text-muted-foreground">Warnung bei wiederholten Scans</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Außerhalb Standort-Alarm</div>
                    <div className="text-sm text-muted-foreground">Benachrichtigung bei Scans außerhalb Geofence</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Automatische Blockierung</div>
                    <div className="text-sm text-muted-foreground">Verdächtige Codes temporär sperren</div>
                  </div>
                  <Switch checked />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-scans">Max. Scans pro Zeitraum</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" defaultValue="3" min="1" max="10" />
                  <Select defaultValue="30min">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15min">15 Minuten</SelectItem>
                      <SelectItem value="30min">30 Minuten</SelectItem>
                      <SelectItem value="1hour">1 Stunde</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Detection Events</CardTitle>
          <CardDescription>
            Echtzeitübersicht der Smart Detection Ereignisse und Sicherheitswarnungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Letzte Ereignisse</h4>
            <Button size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Aktualisieren
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mitarbeiter</TableHead>
                <TableHead>Ereignis</TableHead>
                <TableHead>Zeit</TableHead>
                <TableHead>Standort</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detectionEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.employee}</TableCell>
                  <TableCell>{event.event}</TableCell>
                  <TableCell>{event.time}</TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={
                        event.status === 'success' ? 'text-green-600' :
                        event.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                      }
                    >
                      {event.status === 'success' ? 'Erfolgreich' :
                       event.status === 'warning' ? 'Warnung' : 'Blockiert'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{event.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Erfolgreiche Scans</span>
              </div>
              <div className="text-2xl font-bold text-green-600">8,210</div>
              <p className="text-xs text-green-600">Heute</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Warnungen</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">23</div>
              <p className="text-xs text-yellow-600">Verdächtige Aktivitäten</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">Blockierungen</span>
              </div>
              <div className="text-2xl font-bold text-red-600">7</div>
              <p className="text-xs text-red-600">Automatisch verhindert</p>
            </Card>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="text-sm text-blue-800">
              <strong>Smart Detection Status:</strong> Alle Sicherheitsprüfungen sind aktiv. 
              Das System überwacht kontinuierlich QR-Code-Scans und erkennt automatisch 
              Missbrauchsversuche und Sicherheitsverletzungen. Bei kritischen Ereignissen 
              werden Administratoren sofort benachrichtigt.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}