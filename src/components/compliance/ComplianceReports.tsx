import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Download,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  Users,
  Clock,
  BarChart3,
  Filter,
  Eye
} from 'lucide-react';

interface ComplianceMetric {
  category: string;
  score: number;
  status: 'compliant' | 'warning' | 'violation';
  details: string;
  lastCheck: string;
}

const ComplianceReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedRegulation, setSelectedRegulation] = useState('all');
  const [reportType, setReportType] = useState('summary');

  const complianceMetrics: ComplianceMetric[] = [
    {
      category: 'DSGVO/GDPR Compliance',
      score: 95,
      status: 'compliant',
      details: '142 von 149 Anforderungen erfüllt',
      lastCheck: '2024-01-19 14:30'
    },
    {
      category: 'Arbeitszeitgesetz (ArbZG)',
      score: 88,
      status: 'warning',
      details: '3 Überstunden-Verletzungen im letzten Monat',
      lastCheck: '2024-01-19 12:15'
    },
    {
      category: 'Datenschutz-Audit',
      score: 92,
      status: 'compliant',
      details: 'Alle Systeme ordnungsgemäß protokolliert',
      lastCheck: '2024-01-19 09:45'
    },
    {
      category: 'Sicherheitsrichtlinien',
      score: 76,
      status: 'warning',
      details: '12 Benutzer ohne MFA, 4 veraltete Zugriffsrechte',
      lastCheck: '2024-01-19 16:20'
    },
    {
      category: 'Dokumentenaufbewahrung',
      score: 99,
      status: 'compliant',
      details: 'Alle Aufbewahrungsfristen eingehalten',
      lastCheck: '2024-01-19 11:30'
    }
  ];

  const auditTrail = [
    {
      timestamp: '2024-01-19 14:32:15',
      user: 'system@company.com',
      action: 'Policy Enforcement Check',
      module: 'timetracking',
      result: 'passed',
      details: 'All active policies validated'
    },
    {
      timestamp: '2024-01-19 14:30:42',
      user: 'admin@company.com', 
      action: 'Policy Updated',
      module: 'security',
      result: 'success',
      details: 'MFA requirement enabled for documents module'
    },
    {
      timestamp: '2024-01-19 14:28:18',
      user: 'max.mueller@company.com',
      action: 'Access Denied',
      module: 'documents',
      result: 'blocked',
      details: 'Missing QR code scan for document access'
    },
    {
      timestamp: '2024-01-19 14:25:33',
      user: 'hr.manager@company.com',
      action: 'Data Export',
      module: 'hr',
      result: 'logged',
      details: 'Employee data exported with approval'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-100 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200'; 
      case 'violation': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const generateReport = () => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const filename = `compliance-report-${reportType}-${timestamp}.pdf`;
    console.log(`Generating report: ${filename}`);
    alert(`Compliance-Bericht wird generiert: ${filename}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Compliance & Audit</h1>
          <p className="text-muted-foreground">
            Überwachung der Einhaltung aller gesetzlichen und unternehmensinternen Bestimmungen
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">Zusammenfassung</SelectItem>
              <SelectItem value="detailed">Detailliert</SelectItem>
              <SelectItem value="audit">Vollständiger Audit</SelectItem>
              <SelectItem value="gdpr">DSGVO-Spezial</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={generateReport}>
            <Download className="h-4 w-4 mr-2" />
            Bericht generieren
          </Button>
        </div>
      </div>

      {/* Compliance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt-Compliance</p>
                <p className="text-3xl font-bold text-green-600">91%</p>
                <p className="text-xs text-muted-foreground">
                  +3% seit letztem Quartal
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Offene Probleme</p>
                <p className="text-3xl font-bold text-yellow-600">7</p>
                <p className="text-xs text-muted-foreground">
                  3 kritisch, 4 nicht-kritisch
                </p>
              </div>
              <div className="rounded-full bg-yellow-100 p-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Audit-Einträge</p>
                <p className="text-3xl font-bold">2,847</p>
                <p className="text-xs text-muted-foreground">
                  Letzte 30 Tage
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="gdpr">DSGVO/GDPR</TabsTrigger>
          <TabsTrigger value="labor">Arbeitsrecht</TabsTrigger>
          <TabsTrigger value="security">Sicherheit</TabsTrigger>
          <TabsTrigger value="audit">Audit-Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Compliance Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Compliance-Bereiche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{metric.category}</span>
                        <Badge className={getStatusColor(metric.status)}>
                          {metric.status === 'compliant' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {metric.status === 'warning' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {metric.status === 'compliant' ? 'Konform' : 'Warnung'}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold">{metric.score}%</span>
                        <p className="text-xs text-muted-foreground">
                          Letzter Check: {new Date(metric.lastCheck).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <Progress value={metric.score} className="h-2" />
                    
                    <p className="text-sm text-muted-foreground">{metric.details}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Critical Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Kritische Compliance-Probleme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Alert className="border-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-800">3 MFA-Verletzungen erkannt</AlertTitle>
                  <AlertDescription className="text-red-700">
                    Benutzer ohne Multi-Faktor-Authentifizierung greifen auf sensible Dokumente zu.
                    <Button variant="link" className="p-0 h-auto text-red-700 underline ml-1">
                      Details anzeigen
                    </Button>
                  </AlertDescription>
                </Alert>

                <Alert className="border-yellow-200">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800">Arbeitszeitüberschreitungen</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    4 Mitarbeiter haben die tägliche Arbeitszeit von 10 Stunden überschritten.
                    <Button variant="link" className="p-0 h-auto text-yellow-700 underline ml-1">
                      Report generieren
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gdpr" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>DSGVO-Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Datenverarbeitungsaktivitäten</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-sm">Einwilligungsmanagement</span>
                        <Badge className="bg-green-100 text-green-800">✓ Konform</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-sm">Automatische Datenlöschung</span>
                        <Badge className="bg-green-100 text-green-800">✓ Aktiv</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-sm">Recht auf Vergessenwerden</span>
                        <Badge className="bg-green-100 text-green-800">✓ Implementiert</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Technische Maßnahmen</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-sm">Verschlüsselung</span>
                        <Badge className="bg-green-100 text-green-800">AES-256</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-sm">Zugriffskontrolle</span>
                        <Badge className="bg-green-100 text-green-800">RBAC aktiv</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-sm">Audit-Logging</span>
                        <Badge className="bg-green-100 text-green-800">Vollständig</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Arbeitsrecht-Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">🇩🇪 Deutschland (ArbZG)</h4>
                    <Progress value={88} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      3 Überstunden-Verletzungen
                    </p>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-2">🇦🇹 Österreich (AZG)</h4>
                    <Progress value={95} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Alle Bestimmungen eingehalten
                    </p>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-2">🇨🇭 Schweiz (ArG)</h4>
                    <Progress value={92} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      1 Pausenverletzung
                    </p>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sicherheits-Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Authentifizierung & Zugriff</h4>
                  <div className="space-y-2">
                    {[
                      { check: 'MFA für Admin-Accounts', status: 'pass', details: '100% abgedeckt' },
                      { check: 'Starke Passwort-Richtlinien', status: 'pass', details: 'Alle Konten konform' },
                      { check: 'Regelmäßige Zugriffs-Reviews', status: 'warning', details: '4 überfällige Reviews' },
                      { check: 'Session-Timeouts', status: 'pass', details: 'Automatisch nach 30 Min' }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <span className="text-sm font-medium">{item.check}</span>
                          <p className="text-xs text-muted-foreground">{item.details}</p>
                        </div>
                        <Badge 
                          className={item.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                        >
                          {item.status === 'pass' ? '✓' : '⚠'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Daten & Infrastruktur</h4>
                  <div className="space-y-2">
                    {[
                      { check: 'Datenverschlüsselung', status: 'pass', details: 'End-to-End verschlüsselt' },
                      { check: 'Backup-Verifizierung', status: 'pass', details: 'Täglich getestet' },
                      { check: 'Penetrationstests', status: 'pass', details: 'Letzter Test: Dez 2023' },
                      { check: 'Vulnerability Scans', status: 'warning', details: '2 mittlere Probleme' }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <span className="text-sm font-medium">{item.check}</span>
                          <p className="text-xs text-muted-foreground">{item.details}</p>
                        </div>
                        <Badge 
                          className={item.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                        >
                          {item.status === 'pass' ? '✓' : '⚠'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          {/* Live Audit Trail */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live Audit-Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filter */}
                <div className="flex gap-4">
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hour">Letzte Stunde</SelectItem>
                      <SelectItem value="day">Heute</SelectItem>
                      <SelectItem value="week">Diese Woche</SelectItem>
                      <SelectItem value="month">Diesen Monat</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input placeholder="Nach Benutzer oder Aktion suchen..." className="flex-1" />
                  
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>

                {/* Audit Entries */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {auditTrail.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                        <span className="text-sm font-medium">{entry.user}</span>
                        <Badge variant="outline">{entry.action}</Badge>
                        <Badge variant="secondary">{entry.module}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground max-w-xs truncate">
                          {entry.details}
                        </span>
                        <Badge 
                          variant={
                            entry.result === 'success' || entry.result === 'passed' || entry.result === 'logged' ? 'default' : 
                            entry.result === 'blocked' ? 'destructive' : 'secondary'
                          }
                        >
                          {entry.result}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceReports;