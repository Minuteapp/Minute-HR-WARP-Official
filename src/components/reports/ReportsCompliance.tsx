
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Settings,
  Download,
  Search,
  FileText,
  Lock,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileOutput,
  Mail,
  MoreHorizontal
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ReportsCompliance = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  const auditLogs = [
    {
      id: 1,
      user: 'Markus Schmidt',
      action: 'export',
      report: 'Monatsabschluss April 2023',
      timestamp: '25.04.2023 14:32:45',
      details: 'PDF-Export, mit Firmenbranding'
    },
    {
      id: 2,
      user: 'Laura Meyer',
      action: 'view',
      report: 'Personalkostenübersicht Q1',
      timestamp: '25.04.2023 11:15:20',
      details: 'Ansicht aller Details, inkl. sensitive Daten'
    },
    {
      id: 3,
      user: 'Thomas Weber',
      action: 'share',
      report: 'Fluktuation nach Abteilungen',
      timestamp: '24.04.2023 16:45:12',
      details: 'Geteilt per E-Mail mit 3 Empfängern'
    },
    {
      id: 4,
      user: 'Sandra Klein',
      action: 'export',
      report: 'Gehaltsübersicht Führungskräfte',
      timestamp: '23.04.2023 09:21:35',
      details: 'Excel-Export, anonymisierte Daten'
    },
    {
      id: 5,
      user: 'Michael Bauer',
      action: 'modify',
      report: 'Projektkosten Q1 2023',
      timestamp: '23.04.2023 15:10:22',
      details: 'Filter angepasst, Kategorien geändert'
    },
  ];

  const dsgvoPolicies = [
    {
      id: 1,
      name: 'Personendaten-Anonymisierung',
      description: 'Automatische Anonymisierung persönlicher Daten in Exports',
      status: 'active',
      lastReviewed: '15.03.2023'
    },
    {
      id: 2,
      name: 'Export-Protokollierung',
      description: 'Protokollierung aller Export-Vorgänge inkl. Nutzer-Identifikation',
      status: 'active',
      lastReviewed: '22.02.2023'
    },
    {
      id: 3,
      name: 'Datenzugriffsbeschränkung',
      description: 'Rollenbasierte Zugriffsrechte auf sensible Berichte',
      status: 'active',
      lastReviewed: '10.04.2023'
    },
    {
      id: 4,
      name: 'Daten-Aufbewahrungsrichtlinie',
      description: 'Automatisches Löschen von Berichten nach definierter Zeit',
      status: 'pending',
      lastReviewed: '01.04.2023'
    },
    {
      id: 5,
      name: 'Daten-Freigabeprozess',
      description: 'Genehmigungsprozess für das Teilen von Berichten außerhalb der Organisation',
      status: 'inactive',
      lastReviewed: '05.01.2023'
    },
  ];

  const certifications = [
    {
      id: 1,
      name: 'DSGVO-Konformität',
      status: 'passed',
      date: '15.01.2023',
      validUntil: '15.01.2024',
      certifiedBy: 'Internal Audit'
    },
    {
      id: 2,
      name: 'ISO 27001',
      status: 'passed',
      date: '23.10.2022',
      validUntil: '23.10.2025',
      certifiedBy: 'TÜV Süd'
    },
    {
      id: 3,
      name: 'TISAX',
      status: 'pending',
      date: 'In Bearbeitung',
      validUntil: '-',
      certifiedBy: 'ENX Association'
    }
  ];

  const filteredLogs = auditLogs.filter(log => 
    log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.report.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const downloadAuditLog = () => {
    toast({
      title: "Audit-Log exportiert",
      description: "Das vollständige Audit-Log wurde als CSV heruntergeladen.",
    });
  };

  const reviewPolicy = (id: number) => {
    toast({
      title: "Richtlinienprüfung initiiert",
      description: "Die Richtlinie wurde zur Überprüfung markiert.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold">Compliance & Auditierung</h2>
          <p className="text-sm text-muted-foreground">
            Verfolgen und verwalten Sie die Compliance-Anforderungen und Audit-Protokolle Ihrer Berichte
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadAuditLog}>
            <Download className="h-4 w-4 mr-2" />
            Audit-Log exportieren
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Einstellungen
          </Button>
        </div>
      </div>

      <Tabs defaultValue="audit">
        <TabsList>
          <TabsTrigger value="audit">
            <FileText className="h-4 w-4 mr-2" />
            Audit-Log
          </TabsTrigger>
          <TabsTrigger value="policies">
            <Shield className="h-4 w-4 mr-2" />
            DSGVO-Richtlinien
          </TabsTrigger>
          <TabsTrigger value="certifications">
            <CheckCircle className="h-4 w-4 mr-2" />
            Zertifizierungen
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="audit" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Suche nach Benutzer, Bericht oder Aktion..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit-Protokoll</CardTitle>
              <CardDescription>
                Vollständiges Protokoll aller Berichtszugriffe, Exporte und Änderungen
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Benutzer</TableHead>
                    <TableHead>Aktion</TableHead>
                    <TableHead>Bericht</TableHead>
                    <TableHead>Zeitstempel</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>
                        {log.action === 'export' && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                            <FileOutput className="h-3 w-3 mr-1" /> Export
                          </Badge>
                        )}
                        {log.action === 'view' && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                            <Eye className="h-3 w-3 mr-1" /> Ansicht
                          </Badge>
                        )}
                        {log.action === 'share' && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                            <Mail className="h-3 w-3 mr-1" /> Geteilt
                          </Badge>
                        )}
                        {log.action === 'modify' && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                            <Settings className="h-3 w-3 mr-1" /> Bearbeitet
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{log.report}</TableCell>
                      <TableCell>{log.timestamp}</TableCell>
                      <TableCell>{log.details}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Optionen öffnen</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                            <DropdownMenuItem>Details anzeigen</DropdownMenuItem>
                            <DropdownMenuItem>Log exportieren</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Für Audit markieren</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between text-xs text-muted-foreground pt-4">
              <span>Zeige {filteredLogs.length} von {auditLogs.length} Einträgen</span>
              <span>Logs werden 365 Tage aufbewahrt</span>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="policies" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">DSGVO-Richtlinien</CardTitle>
              <CardDescription>
                Richtlinien zur Einhaltung der Datenschutzgrundverordnung für Berichte
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Richtlinie</TableHead>
                    <TableHead>Beschreibung</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Letzte Prüfung</TableHead>
                    <TableHead className="w-[100px]">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dsgvoPolicies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-medium">{policy.name}</TableCell>
                      <TableCell>{policy.description}</TableCell>
                      <TableCell>
                        {policy.status === 'active' && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <CheckCircle className="h-3 w-3 mr-1" /> Aktiv
                          </Badge>
                        )}
                        {policy.status === 'pending' && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                            <Clock className="h-3 w-3 mr-1" /> Ausstehend
                          </Badge>
                        )}
                        {policy.status === 'inactive' && (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800">
                            <XCircle className="h-3 w-3 mr-1" /> Inaktiv
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{policy.lastReviewed}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => reviewPolicy(policy.id)}
                          >
                            Prüfen
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="certifications" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {certifications.map((cert) => (
              <Card key={cert.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{cert.name}</CardTitle>
                    {cert.status === 'passed' ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" /> Bestanden
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700">
                        <Clock className="h-3 w-3 mr-1" /> Ausstehend
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Zertifiziert am:</span>
                      <span className="text-sm font-medium">{cert.date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Gültig bis:</span>
                      <span className="text-sm font-medium">{cert.validUntil}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Zertifiziert durch:</span>
                      <span className="text-sm font-medium">{cert.certifiedBy}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Zertifikat anzeigen
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            <Card className="flex flex-col items-center justify-center p-6 border-dashed border-2">
              <Lock className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium mb-1">Neue Zertifizierung</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Fügen Sie eine weitere Compliance-Zertifizierung hinzu
              </p>
              <Button>
                Zertifizierung hinzufügen
              </Button>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compliance-Status</CardTitle>
              <CardDescription>
                Zusammenfassung des aktuellen Compliance-Status der Berichtsumgebung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col p-4 rounded-lg border">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-medium">Datenschutz</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    DSGVO-konforme Berichtsverarbeitung mit automatischer Anonymisierung sensibler Daten.
                  </p>
                  <span className="text-xs mt-auto flex items-center text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" /> Konform
                  </span>
                </div>
                
                <div className="flex flex-col p-4 rounded-lg border">
                  <div className="flex items-center mb-2">
                    <Lock className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-medium">Datensicherheit</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Sichere Datenverarbeitung und Speicherung gemäß ISO 27001 Standards.
                  </p>
                  <span className="text-xs mt-auto flex items-center text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" /> Konform
                  </span>
                </div>
                
                <div className="flex flex-col p-4 rounded-lg border">
                  <div className="flex items-center mb-2">
                    <Eye className="h-5 w-5 text-amber-500 mr-2" />
                    <span className="font-medium">Audit-Trail</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Vollständige Protokollierung aller Aktionen zur Nachverfolgung und Prüfung.
                  </p>
                  <span className="text-xs mt-auto flex items-center text-amber-600">
                    <Clock className="h-3 w-3 mr-1" /> Teilweise konform
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsCompliance;
