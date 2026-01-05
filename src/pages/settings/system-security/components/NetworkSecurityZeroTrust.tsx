import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  Wifi, 
  Lock, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe,
  Clock,
  Settings,
  Plus,
  Trash2
} from "lucide-react";

export default function NetworkSecurityZeroTrust() {
  const securityStats = {
    verifiedConnections: 8234,
    blockedAttempts: 187,
    vpnConnections: 456,
    suspiciousIPs: 23,
    activeWhitelist: 1247
  };

  const ipWhitelist = [
    {
      id: "IP001",
      range: "192.168.1.0/24",
      description: "München Hauptbüro",
      location: "München, DE",
      status: "Aktiv",
      connections: 1234
    },
    {
      id: "IP002", 
      range: "10.0.0.0/16",
      description: "Zürich Niederlassung",
      location: "Zürich, CH",
      status: "Aktiv", 
      connections: 456
    },
    {
      id: "IP003",
      range: "172.16.0.0/12",
      description: "Wien Büro",
      location: "Wien, AT",
      status: "Aktiv",
      connections: 234
    }
  ];

  const suspiciousActivities = [
    {
      id: "SA001",
      type: "Massenhafte Datenexporte",
      source: "203.45.67.89",
      user: "Unbekannt", 
      time: "14:23",
      risk: "Hoch",
      status: "Blockiert"
    },
    {
      id: "SA002",
      type: "Ungewöhnliche API-Calls",
      source: "157.230.45.12",
      user: "Max Müller",
      time: "13:45",
      risk: "Mittel",
      status: "Überwacht"
    },
    {
      id: "SA003", 
      type: "Parallele Logins",
      source: "Multiple IPs",
      user: "Anna Schmidt",
      time: "12:30",
      risk: "Niedrig", 
      status: "Geprüft"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verifizierte Verbindungen</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.verifiedConnections.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Heute erfolgreich</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blockierte Versuche</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.blockedAttempts}</div>
            <p className="text-xs text-muted-foreground">Automatisch verhindert</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VPN-Verbindungen</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.vpnConnections}</div>
            <p className="text-xs text-muted-foreground">Aktive VPN-Nutzer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verdächtige IPs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.suspiciousIPs}</div>
            <p className="text-xs text-muted-foreground">Unter Beobachtung</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Whitelist-Einträge</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.activeWhitelist.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Zugelassene IPs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Zero Trust Architektur</CardTitle>
            <CardDescription>
              Kontinuierliche Verifikation aller Verbindungen und Zugriffe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Zero Trust Prinzipien</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Niemals vertrauen, immer verifizieren</div>
                    <div className="text-sm text-muted-foreground">Jede Verbindung wird validiert</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Kontinuierliche Authentifizierung</div>
                    <div className="text-sm text-muted-foreground">Laufende Session-Überprüfung</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Least Privilege Access</div>
                    <div className="text-sm text-muted-foreground">Minimale erforderliche Berechtigungen</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Mikro-Segmentierung</div>
                    <div className="text-sm text-muted-foreground">Isolation kritischer Ressourcen</div>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-interval">Verifikationsintervall (Minuten)</Label>
                <Input id="verification-interval" type="number" defaultValue="15" min="5" max="60" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="risk-tolerance">Risiko-Toleranz</Label>
                <Select defaultValue="low">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="very-low">Sehr niedrig</SelectItem>
                    <SelectItem value="low">Niedrig</SelectItem>
                    <SelectItem value="medium">Mittel</SelectItem>
                    <SelectItem value="high">Hoch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>IP-Whitelist & Blacklist</CardTitle>
            <CardDescription>
              Verwaltung zugelassener und gesperrter IP-Adressen und Netzwerke
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Zugelassene Netzwerke</h4>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  IP hinzufügen
                </Button>
              </div>
              
              <div className="space-y-3">
                {ipWhitelist.map((ip) => (
                  <div key={ip.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-medium">{ip.range}</div>
                        <div className="text-sm text-muted-foreground">{ip.description}</div>
                        <div className="text-xs text-blue-600 mt-1">{ip.location}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{ip.status}</Badge>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ip.connections} aktive Verbindungen
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Automatische IP-Blockierung</div>
                    <div className="text-sm text-muted-foreground">Verdächtige IPs automatisch sperren</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Geo-IP-Blocking</div>
                    <div className="text-sm text-muted-foreground">Bestimmte Länder blockieren</div>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>VPN-Erkennung & Management</CardTitle>
            <CardDescription>
              Kontrolle und Überwachung von VPN-Verbindungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">VPN-Richtlinien</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Unternehmens-VPN zwingend</div>
                    <div className="text-sm text-muted-foreground">Nur autorisierte VPNs erlaubt</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Öffentliche VPNs blockieren</div>
                    <div className="text-sm text-muted-foreground">Kommerzielle VPN-Anbieter sperren</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">VPN-Anomalie-Erkennung</div>
                    <div className="text-sm text-muted-foreground">Ungewöhnliche VPN-Nutzung erkennen</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Außendienst-Ausnahmen</div>
                    <div className="text-sm text-muted-foreground">Reisende Mitarbeiter berücksichtigen</div>
                  </div>
                  <Switch checked />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vpn-providers">Zugelassene VPN-Anbieter</Label>
                <div className="space-y-2">
                  {["Unternehmens-VPN", "NordLayer Business", "ExpressVPN Business"].map((provider, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{provider}</span>
                      <Switch checked={index === 0} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Intrusion Detection System</CardTitle>
            <CardDescription>
              Automatische Erkennung und Abwehr von Sicherheitsbedrohungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Erkennungsregeln</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Massenhafte Datenexporte</div>
                    <div className="text-sm text-muted-foreground">Erkennung großer Datenmengen</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Brute-Force-Angriffe</div>
                    <div className="text-sm text-muted-foreground">Wiederholte Login-Versuche</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">SQL-Injection-Versuche</div>
                    <div className="text-sm text-muted-foreground">Datenbank-Angriffsmuster</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Port-Scanning</div>
                    <div className="text-sm text-muted-foreground">Netzwerk-Reconnaissance</div>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="detection-sensitivity">Erkennungsempfindlichkeit</Label>
                <Select defaultValue="high">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Niedrig</SelectItem>
                    <SelectItem value="medium">Mittel</SelectItem>
                    <SelectItem value="high">Hoch</SelectItem>
                    <SelectItem value="paranoid">Paranoid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="response-action">Automatische Antwort</Label>
                <Select defaultValue="block">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="log">Nur protokollieren</SelectItem>
                    <SelectItem value="warn">Warnen</SelectItem>
                    <SelectItem value="block">Blockieren</SelectItem>
                    <SelectItem value="quarantine">Isolieren</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Sicherheitsereignisse</CardTitle>
          <CardDescription>
            Echtzeitüberwachung verdächtiger Aktivitäten und Sicherheitsvorfälle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Aktuelle Bedrohungen</h4>
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Alle anzeigen
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Art der Bedrohung</TableHead>
                  <TableHead>Quelle</TableHead>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>Zeit</TableHead>
                  <TableHead>Risiko</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suspiciousActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.type}</TableCell>
                    <TableCell className="font-mono text-sm">{activity.source}</TableCell>
                    <TableCell>{activity.user}</TableCell>
                    <TableCell>{activity.time}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          activity.risk === 'Hoch' ? 'destructive' : 
                          activity.risk === 'Mittel' ? 'secondary' : 'outline'
                        }
                      >
                        {activity.risk}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          activity.status === 'Blockiert' ? 'destructive' : 'outline'
                        }
                      >
                        {activity.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Sicher</span>
                </div>
                <div className="text-2xl font-bold text-green-600">8,234</div>
                <p className="text-xs text-green-600">Verifizierte Zugriffe</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Unter Beobachtung</span>
                </div>
                <div className="text-2xl font-bold text-yellow-600">23</div>
                <p className="text-xs text-yellow-600">Verdächtige IPs</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">Blockiert</span>
                </div>
                <div className="text-2xl font-bold text-red-600">187</div>
                <p className="text-xs text-red-600">Bedrohungen abgewehrt</p>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="text-sm text-green-800">
                <Shield className="h-4 w-4 inline mr-2" />
                <strong>Zero Trust Status:</strong> Alle Sicherheitssysteme sind aktiv und funktionieren 
                ordnungsgemäß. Das Netzwerk wird kontinuierlich überwacht und alle Verbindungen 
                werden automatisch verifiziert. Verdächtige Aktivitäten werden sofort erkannt und blockiert.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}