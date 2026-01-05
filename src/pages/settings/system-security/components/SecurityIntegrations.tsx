import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, Settings, Shield, Database, Cloud, Key } from "lucide-react";

export default function SecurityIntegrations() {
  const identityProviders = [
    { id: "azure-ad", name: "Azure Active Directory", type: "SAML 2.0", status: "connected", users: 5420 },
    { id: "okta", name: "Okta", type: "SAML 2.0", status: "connected", users: 1250 },
    { id: "google", name: "Google Workspace", type: "OAuth 2.0", status: "connected", users: 890 },
    { id: "ldap", name: "LDAP Server", type: "LDAP", status: "disconnected", users: 0 }
  ];

  const siemSystems = [
    { id: "splunk", name: "Splunk Enterprise", type: "SIEM", status: "connected", events: "~2.5M/Tag" },
    { id: "sentinel", name: "Microsoft Sentinel", type: "Cloud SIEM", status: "connected", events: "~1.2M/Tag" },
    { id: "qradar", name: "IBM QRadar", type: "SIEM", status: "pending", events: "0" },
    { id: "elastic", name: "Elastic Security", type: "SIEM", status: "disconnected", events: "0" }
  ];

  const accessSystems = [
    { id: "hid", name: "HID Access Control", type: "RFID System", status: "connected", terminals: 24 },
    { id: "axis", name: "AXIS Door Control", type: "IP-basiert", status: "connected", terminals: 12 },
    { id: "biometric", name: "Biometric Scanners", type: "Fingerprint/Face", status: "connected", terminals: 8 },
    { id: "mobile-key", name: "Mobile Key System", type: "Smartphone App", status: "pending", terminals: 0 }
  ];

  const apiConnections = [
    { id: "sevdesk", name: "SevDesk", type: "Buchhaltung", status: "connected", lastSync: "vor 15 Min" },
    { id: "datev", name: "DATEV", type: "Lohnabrechnung", status: "connected", lastSync: "vor 2 Std" },
    { id: "sap", name: "SAP ERP", type: "Enterprise Resource Planning", status: "connected", lastSync: "vor 30 Min" },
    { id: "office365", name: "Microsoft 365", type: "Productivity Suite", status: "connected", lastSync: "Echtzeit" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Identitätsanbieter</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">3 aktiv verbunden</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SIEM-Systeme</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Aktive Verbindungen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zutrittssysteme</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">44</div>
            <p className="text-xs text-muted-foreground">Verbundene Terminals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API-Verbindungen</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Externe Systeme</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="identity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="identity">Identitätsanbieter</TabsTrigger>
          <TabsTrigger value="siem">SIEM-Systeme</TabsTrigger>
          <TabsTrigger value="access">Zutrittskontrolle</TabsTrigger>
          <TabsTrigger value="apis">API-Integrationen</TabsTrigger>
        </TabsList>

        <TabsContent value="identity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Identitätsanbieter-Integration</CardTitle>
              <CardDescription>
                Verbindung mit externen Identitätsmanagementsystemen für Single Sign-On
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Anbieter</TableHead>
                    <TableHead>Protokoll</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Benutzer</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {identityProviders.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell className="font-medium">{provider.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{provider.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={provider.status === 'connected' ? 'text-green-600' : 'text-gray-600'}
                        >
                          {provider.status === 'connected' ? 'Verbunden' : 'Getrennt'}
                        </Badge>
                      </TableCell>
                      <TableCell>{provider.users.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Link className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Neue Verbindung hinzufügen</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="provider-type">Anbieter-Typ</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Anbieter auswählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="saml">SAML 2.0 Provider</SelectItem>
                        <SelectItem value="oauth">OAuth 2.0 Provider</SelectItem>
                        <SelectItem value="ldap">LDAP Server</SelectItem>
                        <SelectItem value="oidc">OpenID Connect</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="provider-url">Provider URL</Label>
                    <Input id="provider-url" placeholder="https://example.com/sso" />
                  </div>

                  <Button className="w-full">Verbindung testen</Button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">SSO-Einstellungen</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-provisioning">Automatisches Provisioning</Label>
                      <Switch id="auto-provisioning" checked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="just-in-time">Just-in-Time Provisioning</Label>
                      <Switch id="just-in-time" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="force-sso">SSO erzwingen</Label>
                      <Switch id="force-sso" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default-role">Standard-Rolle für neue Benutzer</Label>
                    <Select defaultValue="employee">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Mitarbeiter</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="hr">HR Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="siem" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SIEM-System Integration</CardTitle>
              <CardDescription>
                Anbindung an Security Information and Event Management Systeme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>System</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Events/Tag</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {siemSystems.map((system) => (
                    <TableRow key={system.id}>
                      <TableCell className="font-medium">{system.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{system.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            system.status === 'connected' ? 'text-green-600' :
                            system.status === 'pending' ? 'text-yellow-600' : 'text-gray-600'
                          }
                        >
                          {system.status === 'connected' ? 'Verbunden' : 
                           system.status === 'pending' ? 'Ausstehend' : 'Getrennt'}
                        </Badge>
                      </TableCell>
                      <TableCell>{system.events}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Link className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Event-Weiterleitung konfigurieren</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-events">Login-Events</Label>
                      <Switch id="login-events" checked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="security-events">Security-Events</Label>
                      <Switch id="security-events" checked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="audit-events">Audit-Events</Label>
                      <Switch id="audit-events" checked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="system-events">System-Events</Label>
                      <Switch id="system-events" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-format">Event-Format</Label>
                    <Select defaultValue="syslog">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="syslog">Syslog</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="cef">CEF (Common Event Format)</SelectItem>
                        <SelectItem value="leef">LEEF (Log Event Extended Format)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">SIEM-Verbindung hinzufügen</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="siem-url">SIEM Endpoint URL</Label>
                    <Input id="siem-url" placeholder="https://siem.company.com/api" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siem-key">API Key</Label>
                    <Input id="siem-key" type="password" placeholder="API Schlüssel eingeben..." />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="batch-size">Batch-Größe</Label>
                    <Input id="batch-size" type="number" defaultValue="100" min="1" max="1000" />
                  </div>

                  <Button className="w-full">Verbindung testen</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Zutrittskontrollsysteme</CardTitle>
              <CardDescription>
                Integration mit physischen Zutrittskontroll- und Sicherheitssystemen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>System</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Terminals</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessSystems.map((system) => (
                    <TableRow key={system.id}>
                      <TableCell className="font-medium">{system.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{system.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            system.status === 'connected' ? 'text-green-600' :
                            system.status === 'pending' ? 'text-yellow-600' : 'text-gray-600'
                          }
                        >
                          {system.status === 'connected' ? 'Verbunden' : 
                           system.status === 'pending' ? 'Ausstehend' : 'Getrennt'}
                        </Badge>
                      </TableCell>
                      <TableCell>{system.terminals}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Link className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Zugriffssteuerung</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="real-time-sync">Echtzeit-Synchronisation</Label>
                      <Switch id="real-time-sync" checked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-disable">Automatische Deaktivierung bei Kündigung</Label>
                      <Switch id="auto-disable" checked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="visitor-management">Besucher-Management</Label>
                      <Switch id="visitor-management" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="anti-passback">Anti-Passback Schutz</Label>
                      <Switch id="anti-passback" checked />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="access-level">Standard-Zugriffsebene</Label>
                    <Select defaultValue="basic">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basis-Zugang</SelectItem>
                        <SelectItem value="extended">Erweiterte Bereiche</SelectItem>
                        <SelectItem value="full">Vollzugang</SelectItem>
                        <SelectItem value="restricted">Eingeschränkt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Biometrische Einstellungen</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="fingerprint">Fingerprint-Scanner</Label>
                      <Switch id="fingerprint" checked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="facial-recognition">Gesichtserkennung</Label>
                      <Switch id="facial-recognition" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="iris-scan">Iris-Scanner</Label>
                      <Switch id="iris-scan" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="biometric-threshold">Erkennungsgenauigkeit</Label>
                    <Select defaultValue="high">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Niedrig (schneller)</SelectItem>
                        <SelectItem value="medium">Mittel (ausgewogen)</SelectItem>
                        <SelectItem value="high">Hoch (sicherer)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full">Biometrische Daten erfassen</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API-Integrationen</CardTitle>
              <CardDescription>
                Anbindung an externe Systeme wie ERP, CRM und Buchhaltungssoftware
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>System</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Letzte Synchronisation</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiConnections.map((connection) => (
                    <TableRow key={connection.id}>
                      <TableCell className="font-medium">{connection.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{connection.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600">
                          Verbunden
                        </Badge>
                      </TableCell>
                      <TableCell>{connection.lastSync}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Link className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Neue API-Integration</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="api-system">System auswählen</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="System auswählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sage">Sage Buchhaltung</SelectItem>
                        <SelectItem value="lexware">Lexware</SelectItem>
                        <SelectItem value="salesforce">Salesforce CRM</SelectItem>
                        <SelectItem value="hubspot">HubSpot</SelectItem>
                        <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api-endpoint">API Endpoint</Label>
                    <Input id="api-endpoint" placeholder="https://api.example.com/v1" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api-auth">Authentifizierung</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Auth-Methode wählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bearer">Bearer Token</SelectItem>
                        <SelectItem value="basic">Basic Auth</SelectItem>
                        <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                        <SelectItem value="apikey">API Key</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full">API-Verbindung testen</Button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Synchronisation-Einstellungen</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-sync">Automatische Synchronisation</Label>
                      <Switch id="auto-sync" checked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bidirectional">Bidirektionale Synchronisation</Label>
                      <Switch id="bidirectional" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="conflict-resolution">Konfliktbehandlung</Label>
                      <Switch id="conflict-resolution" checked />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sync-interval">Synchronisations-Intervall</Label>
                    <Select defaultValue="hourly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Echtzeit</SelectItem>
                        <SelectItem value="15min">Alle 15 Minuten</SelectItem>
                        <SelectItem value="hourly">Stündlich</SelectItem>
                        <SelectItem value="daily">Täglich</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retry-attempts">Wiederholungsversuche</Label>
                    <Input id="retry-attempts" type="number" defaultValue="3" min="1" max="10" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}