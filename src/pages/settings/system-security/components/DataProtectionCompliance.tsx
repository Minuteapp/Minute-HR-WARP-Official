import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  FileText, 
  Trash2, 
  Download, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  Globe,
  Lock,
  Eye,
  Clock,
  Settings
} from "lucide-react";

export default function DataProtectionCompliance() {
  const complianceStats = {
    gdprCompliance: 94,
    dataRetentionCompliant: 98,
    consentRate: 89,
    deletionRequests: 12,
    exportRequests: 45
  };

  const retentionRules = [
    {
      id: "RR001",
      dataType: "Mitarbeiterdaten",
      category: "Personaldaten",
      retentionPeriod: "10 Jahre",
      legalBasis: "Arbeitsrecht (DE)",
      autoDelete: true,
      nextCleanup: "2024-03-15"
    },
    {
      id: "RR002", 
      dataType: "Bewerbungsunterlagen",
      category: "Recruiting-Daten",
      retentionPeriod: "6 Monate",
      legalBasis: "DSGVO Art. 6",
      autoDelete: true,
      nextCleanup: "2024-02-01"
    },
    {
      id: "RR003",
      dataType: "Audit-Logs",
      category: "Sicherheitsdaten", 
      retentionPeriod: "7 Jahre",
      legalBasis: "HGB §257",
      autoDelete: false,
      nextCleanup: "-"
    }
  ];

  const gdprRights = [
    { right: "Recht auf Information", implementation: "Automatisch", status: "Aktiv" },
    { right: "Recht auf Berichtigung", implementation: "Self-Service Portal", status: "Aktiv" },
    { right: "Recht auf Löschung", implementation: "Workflow + Auto-Delete", status: "Aktiv" },
    { right: "Recht auf Datenportabilität", implementation: "Export-Funktion", status: "Aktiv" },
    { right: "Recht auf Widerspruch", implementation: "Opt-out System", status: "Aktiv" },
    { right: "Recht auf Einschränkung", implementation: "Daten-Markierung", status: "In Entwicklung" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DSGVO-Compliance</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStats.gdprCompliance}%</div>
            <Progress value={complianceStats.gdprCompliance} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aufbewahrung</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStats.dataRetentionCompliant}%</div>
            <p className="text-xs text-muted-foreground">Regelkonform</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Einwilligungsrate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStats.consentRate}%</div>
            <p className="text-xs text-muted-foreground">Aktive Zustimmungen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Löschanträge</CardTitle>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStats.deletionRequests}</div>
            <p className="text-xs text-muted-foreground">Offen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Datenexporte</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStats.exportRequests}</div>
            <p className="text-xs text-muted-foreground">Diesen Monat</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>DSGVO-Compliance</CardTitle>
            <CardDescription>
              Automatische Umsetzung der Datenschutz-Grundverordnung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">DSGVO-Anforderungen</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Automatische Datenlöschung</div>
                    <div className="text-sm text-muted-foreground">Nach Ablauf der Aufbewahrungsfrist</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Recht auf Vergessenwerden</div>
                    <div className="text-sm text-muted-foreground">Vollständige Datenlöschung auf Antrag</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Datenportabilität</div>
                    <div className="text-sm text-muted-foreground">Export in maschinenlesbarem Format</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Einwilligungs-Management</div>
                    <div className="text-sm text-muted-foreground">Granulare Zustimmungsverwaltung</div>
                  </div>
                  <Switch checked />
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-medium text-sm">DSGVO-Rechte Implementation</h5>
                {gdprRights.map((right, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{right.right}</div>
                      <div className="text-xs text-muted-foreground">{right.implementation}</div>
                    </div>
                    <Badge variant={right.status === 'Aktiv' ? 'outline' : 'secondary'}>
                      {right.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aufbewahrungsfristen</CardTitle>
            <CardDescription>
              Automatische Löschroutinen und gesetzeskonforme Datenspeicherung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Aktive Löschregeln</h4>
                <Button size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Neue Regel
                </Button>
              </div>
              
              <div className="space-y-3">
                {retentionRules.map((rule) => (
                  <div key={rule.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-medium">{rule.dataType}</div>
                        <div className="text-sm text-muted-foreground">{rule.category}</div>
                        <div className="text-xs text-blue-600 mt-1">
                          Rechtsgrundlage: {rule.legalBasis}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{rule.retentionPeriod}</Badge>
                        <Switch checked={rule.autoDelete} />
                      </div>
                    </div>
                    {rule.nextCleanup !== "-" && (
                      <div className="text-sm text-muted-foreground">
                        Nächste Bereinigung: {rule.nextCleanup}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>EU-CSRD Compliance</CardTitle>
            <CardDescription>
              Corporate Sustainability Reporting Directive - Nachhaltigkeitsberichterstattung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">CSRD-Anforderungen</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Automatische Sicherheitsprotokolle</div>
                    <div className="text-sm text-muted-foreground">Für Nachhaltigkeitsberichte erforderlich</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">ESG-Datensammlung</div>
                    <div className="text-sm text-muted-foreground">Environment, Social, Governance</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Digitale Taxonomie</div>
                    <div className="text-sm text-muted-foreground">EU-Taxonomie-konforme Klassifikation</div>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Prüfungssichere Archivierung</div>
                    <div className="text-sm text-muted-foreground">Unveränderliche Berichtsdaten</div>
                  </div>
                  <Switch checked />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reporting-period">Berichtszeitraum</Label>
                <Select defaultValue="yearly">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarterly">Quartalsweise</SelectItem>
                    <SelectItem value="yearly">Jährlich</SelectItem>
                    <SelectItem value="biannual">Halbjährlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export-Restriktionen</CardTitle>
            <CardDescription>
              Länderabhängige Datenschutzregeln und Transferbeschränkungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Datenexport-Regeln</h4>
              
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4" />
                    <span className="font-medium">🇪🇺 EU/EWR</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ✓ Freier Datenverkehr innerhalb EU/EWR<br/>
                    ✓ DSGVO-Schutzstandards<br/>
                    ✓ Keine zusätzlichen Beschränkungen
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4" />
                    <span className="font-medium">🇨🇭 Schweiz</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ✓ Angemessenheitsbeschluss<br/>
                    ⚠ Striktere lokale Datenschutzregeln<br/>
                    ⚠ Separate Speicherung erforderlich
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="font-medium">Drittländer</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ❌ Keine Transfers ohne Garantien<br/>
                    ⚠ Standardvertragsklauseln erforderlich<br/>
                    ⚠ Folgenabschätzung notwendig
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Automatische Geo-Blockierung</div>
                    <div className="text-sm text-muted-foreground">Transfers in unsichere Länder blockieren</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Transfer-Protokollierung</div>
                    <div className="text-sm text-muted-foreground">Alle Datenexporte dokumentieren</div>
                  </div>
                  <Switch checked />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Einwilligungs-Management</CardTitle>
          <CardDescription>
            Digitale Zustimmungsverwaltung und granulare Datennutzung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Aktive Einwilligungen</span>
                </div>
                <div className="text-2xl font-bold text-green-600">7,892</div>
                <div className="text-sm text-muted-foreground">Gültige Zustimmungen</div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium">Ausstehende Bestätigungen</span>
                </div>
                <div className="text-2xl font-bold text-yellow-600">234</div>
                <div className="text-sm text-muted-foreground">Benötigen Erneuerung</div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  <span className="font-medium">Widerrufene Einwilligungen</span>
                </div>
                <div className="text-2xl font-bold text-red-600">89</div>
                <div className="text-sm text-muted-foreground">Zurückgezogen</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">Einwilligungstypen</h4>
                {[
                  { type: "Datenverarbeitung (Grundlegend)", consent: 98, required: true },
                  { type: "Marketing & Newsletter", consent: 67, required: false },
                  { type: "Performance-Analytics", consent: 84, required: false },
                  { type: "Cookies (Nicht-essentiell)", consent: 76, required: false },
                  { type: "Biometrische Daten", consent: 45, required: false }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{item.type}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.required ? "Erforderlich" : "Optional"} - {item.consent}% Zustimmung
                      </div>
                    </div>
                    <Progress value={item.consent} className="w-20" />
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Öffentliche Sicherheit - Sonderrechte</h4>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm">
                    <AlertTriangle className="h-4 w-4 inline mr-2 text-yellow-600" />
                    <strong>Sicherheitskräfte/Polizei/Feuerwehr:</strong><br/>
                    • Erweiterte Datenverarbeitungsrechte<br/>
                    • Abweichende gesetzliche Pflichten<br/>
                    • Sonderregelungen bei Notfällen<br/>
                    • Eingeschränkte Löschpflichten
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Notfall-Datenzugriff</div>
                      <div className="text-xs text-muted-foreground">Für Einsatzkräfte aktiviert</div>
                    </div>
                    <Switch checked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Verlängerte Speicherfristen</div>
                      <div className="text-xs text-muted-foreground">Sicherheitsrelevante Daten</div>
                    </div>
                    <Switch checked />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="text-sm text-green-800">
                <Shield className="h-4 w-4 inline mr-2" />
                <strong>Compliance-Status:</strong> Alle Datenschutzmaßnahmen sind aktiv und DSGVO-konform 
                implementiert. Das System überwacht kontinuierlich die Einhaltung aller gesetzlichen 
                Anforderungen und führt automatische Löschroutinen durch.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}