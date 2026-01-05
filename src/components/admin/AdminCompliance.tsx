import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Download,
  Upload,
  Search,
  Filter,
  Calendar,
  Database,
  Trash2,
  Eye,
  Lock,
  Globe,
  Users,
  Building
} from "lucide-react";
import { useState } from "react";

export const AdminCompliance = () => {
  const [selectedAuditType, setSelectedAuditType] = useState("all");

  // Placeholder für echte Daten
  const complianceOverview = {
    gdprCompliance: 0,
    auditsPending: 0,
    auditsCompleted: 0,
    dataRequestsPending: 0,
    dataRequestsCompleted: 0,
    lastFullAudit: "-",
    nextScheduledAudit: "-",
    riskLevel: "unbekannt"
  };

  const auditLogs: any[] = [];

  const dataRequests: any[] = [];

  const complianceChecklist: any[] = [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success text-success-foreground">Erledigt</Badge>;
      case "in_progress":
        return <Badge className="bg-primary text-primary-foreground">In Bearbeitung</Badge>;
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">Ausstehend</Badge>;
      case "pending_approval":
        return <Badge className="bg-warning text-warning-foreground">Genehmigung ausstehend</Badge>;
      case "overdue":
        return <Badge variant="destructive">Überfällig</Badge>;
      case "genehmigt":
        return <Badge className="bg-success text-success-foreground">Genehmigt</Badge>;
      case "durchgeführt":
        return <Badge className="bg-success text-success-foreground">Durchgeführt</Badge>;
      case "erfolgreich":
        return <Badge className="bg-success text-success-foreground">Erfolgreich</Badge>;
      default:
        return <Badge variant="secondary">Unbekannt</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "low":
        return <Badge className="bg-success text-success-foreground">Niedrig</Badge>;
      case "medium":
        return <Badge className="bg-warning text-warning-foreground">Mittel</Badge>;
      case "high":
        return <Badge variant="destructive">Hoch</Badge>;
      default:
        return <Badge variant="secondary">-</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DSGVO Compliance</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceOverview.gdprCompliance}%</div>
            <Progress value={complianceOverview.gdprCompliance} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offene Audits</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceOverview.auditsPending}</div>
            <p className="text-xs text-muted-foreground">
              {complianceOverview.auditsCompleted} abgeschlossen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Datenanfragen</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceOverview.dataRequestsPending}</div>
            <p className="text-xs text-muted-foreground">
              {complianceOverview.dataRequestsCompleted} bearbeitet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nächstes Audit</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{complianceOverview.nextScheduledAudit}</div>
            <p className="text-xs text-muted-foreground">
              Letztes: {complianceOverview.lastFullAudit}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Tabs */}
      <Tabs defaultValue="audit" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="requests">Datenanfragen</TabsTrigger>
            <TabsTrigger value="checklist">Compliance Checklist</TabsTrigger>
            <TabsTrigger value="reports">Reports & Export</TabsTrigger>
            <TabsTrigger value="settings">DSGVO Settings</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs & Aktivitätsverfolgung</CardTitle>
              <CardDescription>
                Vollständige Protokollierung aller sicherheitsrelevanten Aktivitäten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input placeholder="Logs durchsuchen..." />
                  </div>
                  <Button variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Suchen
                  </Button>
                </div>

                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{log.action}</span>
                            {getStatusBadge(log.status)}
                            {getRiskBadge(log.riskLevel)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {log.target}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {log.timestamp}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Benutzer:</span>
                          <div>{log.user}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">IP-Adresse:</span>
                          <div className="font-mono">{log.ipAddress}</div>
                        </div>
                        <div className="col-span-2 flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>DSGVO Datenanfragen</CardTitle>
              <CardDescription>
                Verwaltung von Auskunfts-, Lösch- und Berichtigungsanfragen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{request.requestId}</span>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {request.type} • {request.company}
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        {request.status === "completed" ? (
                          <div>Abgeschlossen: {request.completedDate}</div>
                        ) : (
                          <div>Fällig: {request.dueDate}</div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">Antragsteller:</span>
                        <div>{request.requester}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Antragstyp:</span>
                        <div>{request.type}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Antragsdatum:</span>
                        <div>{request.requestDate}</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <span className="text-muted-foreground text-sm">Betroffene Datentypen:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {request.dataTypes.map((dataType) => (
                          <Badge key={dataType} variant="outline" className="text-xs">
                            {dataType}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                      {request.status === "pending_approval" && (
                        <Button size="sm">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Genehmigen
                        </Button>
                      )}
                      {request.status === "in_progress" && (
                        <Button size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Daten bereitstellen
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Checklist</CardTitle>
              <CardDescription>
                Übersicht aller erforderlichen Compliance-Maßnahmen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {complianceChecklist.map((category) => (
                  <div key={category.category}>
                    <h3 className="font-semibold mb-3">{category.category}</h3>
                    <div className="space-y-2">
                      {category.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {item.status === "completed" ? (
                              <CheckCircle className="h-4 w-4 text-success" />
                            ) : item.status === "overdue" ? (
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            ) : (
                              <Clock className="h-4 w-4 text-warning" />
                            )}
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.dueDate && (
                              <span className="text-xs text-muted-foreground">
                                Fällig: {item.dueDate}
                              </span>
                            )}
                            {getStatusBadge(item.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Reports</CardTitle>
                <CardDescription>Automatisierte Berichte und Exports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">DSGVO Compliance Report</span>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Vollständiger Überblick über alle Compliance-Aspekte
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Audit Log Export</span>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Alle Audit-Logs der letzten 12 Monate
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Datenanfragen Report</span>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Übersicht aller bearbeiteten Datenanfragen
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dokumenten-Upload</CardTitle>
                <CardDescription>Compliance-Dokumente verwalten</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Dokumente hier ablegen oder
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Dateien auswählen
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Vorhandene Dokumente:</h4>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm p-2 border rounded">
                        <span>Datenschutzerklärung_2024.pdf</span>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-sm p-2 border rounded">
                        <span>Auftragsverarbeitung_Template.pdf</span>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>DSGVO Grundeinstellungen</CardTitle>
                <CardDescription>Globale Datenschutz-Konfiguration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dpoContact">Datenschutzbeauftragter</Label>
                    <Input id="dpoContact" placeholder="dpo@yourcompany.com" />
                  </div>

                  <div>
                    <Label htmlFor="dataRetention">Standard Aufbewahrungsdauer (Monate)</Label>
                    <Input id="dataRetention" type="number" defaultValue="24" />
                  </div>

                  <div>
                    <Label htmlFor="deletionNotice">Löschfrist (Tage nach Kündigung)</Label>
                    <Input id="deletionNotice" type="number" defaultValue="30" />
                  </div>

                  <div className="space-y-3">
                    <Label>Automatisierte Prozesse</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="autoDelete" defaultChecked />
                        <Label htmlFor="autoDelete">Automatische Löschung nach Ablauf</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="auditNotifications" defaultChecked />
                        <Label htmlFor="auditNotifications">Audit-Benachrichtigungen</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="consentTracking" defaultChecked />
                        <Label htmlFor="consentTracking">Einverständnis-Tracking</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Betroffenenrechte</CardTitle>
                <CardDescription>Konfiguration der DSGVO-Betroffenenrechte</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="responseTime">Standard Bearbeitungszeit (Tage)</Label>
                    <Input id="responseTime" type="number" defaultValue="30" />
                  </div>

                  <div className="space-y-3">
                    <Label>Verfügbare Anfrage-Typen</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="dataAccess" defaultChecked />
                        <Label htmlFor="dataAccess">Datenauskunft (Art. 15)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="dataCorrection" defaultChecked />
                        <Label htmlFor="dataCorrection">Datenberichtigung (Art. 16)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="dataDeletion" defaultChecked />
                        <Label htmlFor="dataDeletion">Datenlöschung (Art. 17)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="dataPortability" defaultChecked />
                        <Label htmlFor="dataPortability">Datenübertragbarkeit (Art. 20)</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="requestEmail">Anfrage-E-Mail</Label>
                    <Input id="requestEmail" placeholder="gdpr@yourcompany.com" />
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