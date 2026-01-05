import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plug, 
  Shield, 
  QrCode, 
  Fingerprint, 
  Key, 
  Wifi,
  Database,
  Cloud,
  Settings,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  Lock
} from "lucide-react";

export default function ExternalIntegrations() {
  const integrationStats = {
    totalIntegrations: 28,
    activeConnections: 24,
    failedConnections: 2,
    secureConnections: 26,
    apiCalls24h: 45678
  };

  const payrollIntegrations = [
    {
      id: "PI001",
      name: "SevDesk",
      type: "Lohnabrechnung",
      status: "Aktiv", 
      lastSync: "vor 15 Min.",
      employees: 2456,
      security: "OAuth 2.0 + SSL",
      dataFlow: "Zeiterfassung → SevDesk"
    },
    {
      id: "PI002",
      name: "DATEV",
      type: "Lohnabrechnung",
      status: "Aktiv",
      lastSync: "vor 2 Std.",
      employees: 1234,
      security: "DATEV Connect + Verschlüsselung", 
      dataFlow: "HR-Daten → DATEV"
    },
    {
      id: "PI003",
      name: "SAP SuccessFactors",
      type: "HR-System",
      status: "Fehler",
      lastSync: "vor 1 Tag",
      employees: 0,
      security: "SAML 2.0",
      dataFlow: "Bidirektional"
    }
  ];

  const iotTerminals = [
    {
      id: "IOT001", 
      name: "Haupteingang München",
      type: "QR-Code Scanner",
      location: "München HQ, Eingang A",
      status: "Online",
      lastPing: "vor 30 Sek.",
      security: "WPA3 + Zertifikat",
      scansToday: 456
    },
    {
      id: "IOT002",
      name: "Zeiterfassung Produktion",
      type: "RFID + Fingerprint",
      location: "München HQ, Halle 3", 
      status: "Online",
      lastPing: "vor 1 Min.",
      security: "VPN + Hardware-Verschlüsselung",
      scansToday: 234
    },
    {
      id: "IOT003",
      name: "Mobile Zeiterfassung",
      type: "Tablet + Gesichtserkennung",
      location: "Baustelle Berlin",
      status: "Offline",
      lastPing: "vor 4 Std.",
      security: "LTE + AES-256",
      scansToday: 0
    }
  ];

  const siemIntegrations = [
    { name: "Microsoft Sentinel", status: "Konfiguriert", events: "23,456/Tag", risk: "Niedrig" },
    { name: "Splunk", status: "Nicht konfiguriert", events: "0", risk: "-" },
    { name: "Elastic SIEM", status: "Test", events: "1,234/Tag", risk: "Mittel" },
    { name: "IBM QRadar", status: "Nicht konfiguriert", events: "0", risk: "-" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt-Integrationen</CardTitle>
            <Plug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrationStats.totalIntegrations}</div>
            <p className="text-xs text-muted-foreground">Konfigurierte Systeme</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Verbindungen</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrationStats.activeConnections}</div>
            <p className="text-xs text-muted-foreground">Funktionsfähig</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fehlgeschlagen</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrationStats.failedConnections}</div>
            <p className="text-xs text-muted-foreground">Benötigen Aufmerksamkeit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sichere Verbindungen</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrationStats.secureConnections}</div>
            <p className="text-xs text-muted-foreground">SSL/TLS verschlüsselt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API-Calls (24h)</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrationStats.apiCalls24h.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Erfolgreiche Anfragen</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll & ERP Integrationen</CardTitle>
          <CardDescription>
            Sichere Anbindung an SevDesk, DATEV, SAP und andere Lohnabrechnung-/HR-Systeme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>System</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Letzte Sync</TableHead>
                <TableHead>Mitarbeiter</TableHead>
                <TableHead>Sicherheit</TableHead>
                <TableHead>Datenfluss</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollIntegrations.map((integration) => (
                <TableRow key={integration.id}>
                  <TableCell>
                    <div className="font-medium">{integration.name}</div>
                  </TableCell>
                  <TableCell>{integration.type}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={integration.status === 'Aktiv' ? 'outline' : 'destructive'}
                    >
                      {integration.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{integration.lastSync}</TableCell>
                  <TableCell className="text-right">{integration.employees.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      <span className="text-xs">{integration.security}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{integration.dataFlow}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
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
            <CardTitle>IoT-Terminals & Geräte</CardTitle>
            <CardDescription>
              Zeiterfassung und Zutrittskontrolle mit QR-Code, RFID und biometrischer Erkennung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {iotTerminals.map((terminal) => (
                <div key={terminal.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {terminal.type.includes('QR') && <QrCode className="h-4 w-4" />}
                      {terminal.type.includes('Fingerprint') && <Fingerprint className="h-4 w-4" />}
                      {terminal.type.includes('Gesicht') && <Eye className="h-4 w-4" />}
                      <div>
                        <div className="font-medium">{terminal.name}</div>
                        <div className="text-sm text-muted-foreground">{terminal.type}</div>
                      </div>
                    </div>
                    <Badge 
                      variant={terminal.status === 'Online' ? 'outline' : 'destructive'}
                    >
                      {terminal.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    📍 {terminal.location}
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Scans heute: <strong>{terminal.scansToday}</strong></span>
                    <span>Letzter Ping: {terminal.lastPing}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Shield className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">{terminal.security}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-sm text-blue-800">
                <QrCode className="h-4 w-4 inline mr-2" />
                <strong>Smart Detection:</strong> Alle Terminals prüfen automatisch QR-Codes, 
                Mitarbeiter-IDs und Standortberechtigungen. Verdächtige Zugriffe werden sofort 
                gemeldet und blockiert.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SIEM-Systeme Integration</CardTitle>
            <CardDescription>
              Anbindung an Security Information and Event Management Systeme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {siemIntegrations.map((siem, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Cloud className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{siem.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Events: {siem.events}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={siem.status === 'Konfiguriert' ? 'outline' : 'secondary'}>
                      {siem.status}
                    </Badge>
                    {siem.risk !== '-' && (
                      <Badge 
                        variant={siem.risk === 'Niedrig' ? 'outline' : 'secondary'}
                      >
                        {siem.risk}
                      </Badge>
                    )}
                    <Button size="sm" variant="outline">
                      {siem.status === 'Nicht konfiguriert' ? 'Einrichten' : 'Konfigurieren'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 mt-6">
              <h4 className="font-medium">SIEM-Konfiguration</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Automatische Log-Weiterleitung</div>
                    <div className="text-sm text-muted-foreground">Sicherheitsereignisse an SIEM</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Echzeit-Streaming</div>
                    <div className="text-sm text-muted-foreground">Live-Events ohne Verzögerung</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Strukturierte Logs (SIEM)</div>
                    <div className="text-sm text-muted-foreground">CEF/LEEF-Format für bessere Analyse</div>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Bidirektionale Kommunikation</div>
                    <div className="text-sm text-muted-foreground">SIEM kann Aktionen auslösen</div>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siem-priority">Event-Priorität</Label>
                <Select defaultValue="high">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Events</SelectItem>
                    <SelectItem value="medium">Mittel und höher</SelectItem>
                    <SelectItem value="high">Nur hohe Priorität</SelectItem>
                    <SelectItem value="critical">Nur kritische Events</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Zutrittskontrollsysteme</CardTitle>
            <CardDescription>
              Integration mit RFID, biometrischen Terminals und physischen Sicherheitssystemen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Unterstützte Systeme</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5" />
                    <div>
                      <div className="font-medium">RFID-Kartensystem</div>
                      <div className="text-sm text-muted-foreground">Mifare Classic, DESFire</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Aktiv</Badge>
                    <Switch checked />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Fingerprint className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Biometrische Terminals</div>
                      <div className="text-sm text-muted-foreground">Fingerprint + Gesichtserkennung</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Aktiv</Badge>
                    <Switch checked />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <QrCode className="h-5 w-5" />
                    <div>
                      <div className="font-medium">QR-Code Terminals</div>
                      <div className="text-sm text-muted-foreground">Mobile und stationäre Scanner</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Aktiv</Badge>
                    <Switch checked />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Wifi className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Bluetooth-Beacons</div>
                      <div className="text-sm text-muted-foreground">Proximität-basierte Erkennung</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Test</Badge>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="access-timeout">Zugriff-Timeout (Sekunden)</Label>
                <Input id="access-timeout" type="number" defaultValue="10" min="5" max="60" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API für externe Systeme</CardTitle>
            <CardDescription>
              Sichere Schnittstellen für Drittsysteme und Custom-Integrationen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">API-Konfiguration</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">RESTful API</div>
                    <div className="text-sm text-muted-foreground">Standard REST-Endpunkte</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">GraphQL API</div>
                    <div className="text-sm text-muted-foreground">Flexible Datenabfrage</div>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Webhook-Support</div>
                    <div className="text-sm text-muted-foregrund">Ereignis-basierte Benachrichtigungen</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Rate Limiting</div>
                    <div className="text-sm text-muted-foreground">API-Missbrauch verhindern</div>
                  </div>
                  <Switch checked />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-version">API-Version</Label>
                <Select defaultValue="v2">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="v1">Version 1.0 (Deprecated)</SelectItem>
                    <SelectItem value="v2">Version 2.0 (Aktuell)</SelectItem>
                    <SelectItem value="v3-beta">Version 3.0 (Beta)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-method">Authentifizierungsmethode</Label>
                <Select defaultValue="oauth">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api-key">API-Key</SelectItem>
                    <SelectItem value="oauth">OAuth 2.0</SelectItem>
                    <SelectItem value="jwt">JWT Token</SelectItem>
                    <SelectItem value="mutual-tls">Mutual TLS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-green-50 border border-green-200 rounded">
                  <div className="text-lg font-bold text-green-600">45,678</div>
                  <div className="text-xs text-green-600">API-Calls heute</div>
                </div>
                <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-lg font-bold text-blue-600">24</div>
                  <div className="text-xs text-blue-600">Aktive API-Keys</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Health Monitor</CardTitle>
          <CardDescription>
            Überwachung der Systemverfügbarkeit und Performance aller externen Integrationen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Operational</span>
              </div>
              <div className="text-2xl font-bold text-green-600">24</div>
              <p className="text-xs text-green-600">Systeme online</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Degraded</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">2</div>
              <p className="text-xs text-yellow-600">Langsame Antworten</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">Down</span>
              </div>
              <div className="text-2xl font-bold text-red-600">2</div>
              <p className="text-xs text-red-600">Offline/Fehler</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Maintenance</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">0</div>
              <p className="text-xs text-blue-600">Geplante Wartung</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="text-sm text-green-800">
              <Shield className="h-4 w-4 inline mr-2" />
              <strong>Integration-Status:</strong> Alle kritischen Systeme sind operational. 
              Die Sicherheitsintegrationen funktionieren ordnungsgemäß und überwachen 
              kontinuierlich alle externen Verbindungen. API-Rate-Limits werden eingehalten.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}