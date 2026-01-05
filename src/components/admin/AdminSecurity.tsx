import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Key, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Globe,
  Lock,
  Eye,
  FileText,
  Activity,
  Users,
  Database,
  Network,
  Ban,
  RotateCcw,
  Settings
} from "lucide-react";
import { useState } from "react";

export const AdminSecurity = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");

  // Placeholder für echte Daten
  const securityMetrics = {
    totalLoginAttempts: 0,
    failedLogins: 0,
    active2FA: 0,
    totalUsers: 0,
    suspiciousActivity: 0,
    lastSecurityAudit: "-",
    systemUptime: 0,
    dataBreachRisk: "unbekannt"
  };

  const recentSecurityEvents: any[] = [];

  const activeApiKeys: any[] = [];

  const companySecurityStatus: any[] = [];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive">Hoch</Badge>;
      case "medium":
        return <Badge className="bg-warning text-warning-foreground">Mittel</Badge>;
      case "low":
        return <Badge className="bg-success text-success-foreground">Niedrig</Badge>;
      default:
        return <Badge variant="secondary">Unbekannt</Badge>;
    }
  };

  const getSecurityStatusBadge = (status: string) => {
    switch (status) {
      case "secure":
        return <Badge className="bg-success text-success-foreground">Sicher</Badge>;
      case "at_risk":
        return <Badge variant="destructive">Risiko</Badge>;
      case "monitoring":
        return <Badge className="bg-warning text-warning-foreground">Überwachung</Badge>;
      default:
        return <Badge variant="secondary">Unbekannt</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Login-Erfolgsrate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(((securityMetrics.totalLoginAttempts - securityMetrics.failedLogins) / securityMetrics.totalLoginAttempts) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {securityMetrics.failedLogins} fehlgeschlagene Versuche
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">2FA Adoption</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((securityMetrics.active2FA / securityMetrics.totalUsers) * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {securityMetrics.active2FA} von {securityMetrics.totalUsers} Benutzer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verdächtige Aktivitäten</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics.suspiciousActivity}</div>
            <p className="text-xs text-muted-foreground">
              Letzte 24 Stunden
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics.systemUptime}%</div>
            <p className="text-xs text-muted-foreground">
              Letzte 30 Tage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="api">API Management</TabsTrigger>
          <TabsTrigger value="companies">Firmensicherheit</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sicherheitsstatus</CardTitle>
                <CardDescription>Aktuelle Bedrohungslage und Empfehlungen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Firewall Status</span>
                    </div>
                    <Badge className="bg-success text-success-foreground">Aktiv</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">SSL Zertifikate</span>
                    </div>
                    <Badge className="bg-success text-success-foreground">Gültig</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <span className="text-sm">Schwache Passwörter</span>
                    </div>
                    <Badge className="bg-warning text-warning-foreground">12 gefunden</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Letztes Security Audit</span>
                    </div>
                    <span className="text-sm">{securityMetrics.lastSecurityAudit}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Handlungsempfehlungen</CardTitle>
                <CardDescription>Prioritäre Sicherheitsmaßnahmen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border-l-4 border-l-destructive bg-destructive/5 rounded">
                    <p className="text-sm font-medium">2FA für alle Admins aktivieren</p>
                    <p className="text-xs text-muted-foreground">
                      15 Administrator-Accounts ohne 2FA gefunden
                    </p>
                  </div>

                  <div className="p-3 border-l-4 border-l-warning bg-warning/5 rounded">
                    <p className="text-sm font-medium">Passwort-Richtlinien verschärfen</p>
                    <p className="text-xs text-muted-foreground">
                      12 Benutzer mit schwachen Passwörtern
                    </p>
                  </div>

                  <div className="p-3 border-l-4 border-l-primary bg-primary/5 rounded">
                    <p className="text-sm font-medium">IP-Whitelisting für sensible Daten</p>
                    <p className="text-xs text-muted-foreground">
                      Zusätzliche Sicherheitsebene für kritische Operationen
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Aktuelle Security Events</CardTitle>
              <CardDescription>
                Überwachung verdächtiger Aktivitäten und Sicherheitsereignisse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSecurityEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">{event.description}</div>
                        {getSeverityBadge(event.severity)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {event.timestamp}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">IP-Adresse:</span>
                        <div className="font-mono">{event.ip}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Benutzer:</span>
                        <div>{event.userEmail}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Aktion:</span>
                        <div>{event.action}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Ban className="h-3 w-3 mr-1" />
                          Sperren
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API-Schlüssel Management</CardTitle>
              <CardDescription>
                Übersicht und Verwaltung aller aktiven API-Zugriffe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeApiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-medium">{apiKey.name}</div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {apiKey.keyPrefix}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-success text-success-foreground mb-1">
                          {apiKey.status}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          Letzte Nutzung: {apiKey.lastUsed}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Berechtigungen:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {apiKey.permissions.map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Requests heute:</span>
                        <div className="font-medium">{apiKey.requestsToday.toLocaleString()}</div>
                      </div>
                      <div className="col-span-2 flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Regenerieren
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Ban className="h-3 w-3 mr-1" />
                          Deaktivieren
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies">
          <Card>
            <CardHeader>
              <CardTitle>Firmensicherheit</CardTitle>
              <CardDescription>
                Sicherheitsstatus aller Mandanten im Überblick
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {companySecurityStatus.map((company) => (
                  <div key={company.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{company.name}</h3>
                          {getSecurityStatusBadge(company.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Letztes Audit: {company.lastAudit}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium mb-1">
                          Risk Score: {company.riskScore}/100
                        </div>
                        <Progress 
                          value={100 - company.riskScore} 
                          className="w-20" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">2FA Adoption:</span>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(company.users2FA / company.totalUsers) * 100} 
                            className="flex-1" 
                          />
                          <span className="text-xs">{company.users2FA}/{company.totalUsers}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-muted-foreground">SSO:</span>
                        <div className="flex items-center gap-1">
                          {company.ssoEnabled ? (
                            <CheckCircle className="h-3 w-3 text-success" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 text-warning" />
                          )}
                          <span className="text-xs">
                            {company.ssoEnabled ? "Aktiv" : "Inaktiv"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-muted-foreground">IP Whitelist:</span>
                        <div className="flex items-center gap-1">
                          {company.ipWhitelist ? (
                            <CheckCircle className="h-3 w-3 text-success" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 text-warning" />
                          )}
                          <span className="text-xs">
                            {company.ipWhitelist ? "Aktiv" : "Inaktiv"}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-2 flex gap-2">
                        <Button variant="outline" size="sm">
                          <FileText className="h-3 w-3 mr-1" />
                          Audit starten
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3 mr-1" />
                          Einstellungen
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Passwort-Richtlinien</CardTitle>
                <CardDescription>Globale Sicherheitsstandards für alle Benutzer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="minLength">Mindestlänge</Label>
                    <Input id="minLength" type="number" defaultValue="8" />
                  </div>

                  <div className="space-y-3">
                    <Label>Anforderungen</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="requireUppercase" defaultChecked />
                        <Label htmlFor="requireUppercase">Großbuchstaben erforderlich</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="requireNumbers" defaultChecked />
                        <Label htmlFor="requireNumbers">Zahlen erforderlich</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="requireSymbols" defaultChecked />
                        <Label htmlFor="requireSymbols">Sonderzeichen erforderlich</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="passwordExpiry">Passwort-Gültigkeit (Tage)</Label>
                    <Input id="passwordExpiry" type="number" defaultValue="90" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session-Management</CardTitle>
                <CardDescription>Konfiguration von Benutzersitzungen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (Minuten)</Label>
                    <Input id="sessionTimeout" type="number" defaultValue="60" />
                  </div>

                  <div>
                    <Label htmlFor="maxConcurrentSessions">Max. gleichzeitige Sessions</Label>
                    <Input id="maxConcurrentSessions" type="number" defaultValue="3" />
                  </div>

                  <div className="space-y-3">
                    <Label>Erweiterte Einstellungen</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="requireReauth" defaultChecked />
                        <Label htmlFor="requireReauth">Re-Authentifizierung für kritische Aktionen</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="logAllSessions" defaultChecked />
                        <Label htmlFor="logAllSessions">Alle Sessions protokollieren</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="geoBlocking" />
                        <Label htmlFor="geoBlocking">Geo-Blocking aktivieren</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};