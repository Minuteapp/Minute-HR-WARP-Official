import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { GitBranch, Users, Clock, Bell, AlertTriangle, CheckCircle, Settings, Plus } from "lucide-react";

export default function DocumentWorkflowsTab() {
  return (
    <div className="space-y-6">
      {/* Mehrstufige Freigaben */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Mehrstufige Freigabe-Workflows
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {[
              {
                name: 'Arbeitsvertrag',
                steps: ['HR-Manager', 'Rechtsabteilung', 'Geschäftsführer'],
                condition: 'Immer',
                status: 'Aktiv'
              },
              {
                name: 'Rechnung',
                steps: ['Sachbearbeiter', 'Abteilungsleiter'],
                condition: 'Betrag {\'>\'}€1.000',
                status: 'Aktiv'
              },
              {
                name: 'Spesenabrechnung',
                steps: ['Vorgesetzter', 'HR-Manager'],
                condition: 'Betrag {\'>\'}€500',
                status: 'Aktiv'
              },
              {
                name: 'Krankmeldung',
                steps: ['HR-Manager'],
                condition: '{\'>\'}3 Tage',
                status: 'Aktiv'
              },
              {
                name: 'Zertifikat',
                steps: ['Fachbereich', 'HR-Manager'],
                condition: 'Externe Zertifikate',
                status: 'Inaktiv'
              }
            ].map((workflow, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{workflow.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {workflow.condition}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={workflow.status === 'Aktiv' ? 'default' : 'secondary'}>
                      {workflow.status}
                    </Badge>
                    <Switch defaultChecked={workflow.status === 'Aktiv'} />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {workflow.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-center gap-2">
                      <div className="px-2 py-1 bg-muted rounded text-xs">
                        {step}
                      </div>
                      {stepIndex < workflow.steps.length - 1 && (
                        <div className="text-muted-foreground">→</div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Bearbeiten</Button>
                  <Button variant="ghost" size="sm">Duplizieren</Button>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Neuen Workflow erstellen
          </Button>
        </CardContent>
      </Card>

      {/* Workflow-Regeln */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Workflow-Regeln & Bedingungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="font-medium">Dokumenttyp-basierte Regeln</Label>
              <div className="space-y-2">
                {[
                  'Arbeitsvertrag → Legal-Prüfung',
                  'Rechnung → Betragsprüfung',
                  'Krankmeldung → HR-Workflow',
                  'Zertifikat → Fachbereich'
                ].map((rule) => (
                  <div key={rule} className="text-sm p-2 bg-muted rounded">
                    {rule}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-medium">Betrag-basierte Regeln</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input placeholder="0" className="w-20" />
                  <span className="text-sm">€ - </span>
                  <Input placeholder="100" className="w-20" />
                  <span className="text-sm">€</span>
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Aktion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-Genehmigung</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Input placeholder="100" className="w-20" />
                  <span className="text-sm">€ - </span>
                  <Input placeholder="1000" className="w-20" />
                  <span className="text-sm">€</span>
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Aktion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="hr">HR + Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{'>'}</span>
                  <Input placeholder="1000" className="w-20" />
                  <span className="text-sm">€</span>
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Aktion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Vollständiger Workflow</SelectItem>
                      <SelectItem value="ceo">CEO-Genehmigung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-medium">Abteilungs-spezifische Regeln</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm mb-2">IT-Abteilung</div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• Software-Lizenzen → IT-Leiter</div>
                  <div>• Hardware-Kauf → IT + Controlling</div>
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm mb-2">Vertrieb</div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• Reisekosten → Vertriebsleiter</div>
                  <div>• Kundenverträge → Legal</div>
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm mb-2">HR</div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• Arbeitsverträge → HR + Legal</div>
                  <div>• Weiterbildung → HR-Leiter</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delegation & Eskalation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Delegation & Eskalation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="font-medium">Abwesenheits-Vertretung</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Automatische Delegation</span>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Delegation nach (Tage)</Label>
                  <Input type="number" defaultValue="2" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Vertretungsregeln</Label>
                  <Select defaultValue="hierarchy">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hierarchy">Hierarchie-basiert</SelectItem>
                      <SelectItem value="manual">Manuell definiert</SelectItem>
                      <SelectItem value="team">Team-Rotation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-medium">Eskalations-Regeln</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Automatische Eskalation</span>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Eskalation nach (Stunden)</Label>
                  <Input type="number" defaultValue="24" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Eskalations-Stufen</Label>
                  <div className="text-xs space-y-1">
                    <div>1. Erinnerung → Genehmiger</div>
                    <div>2. Eskalation → Vorgesetzter</div>
                    <div>3. Critical → Management</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="font-medium mb-2">Aktuelle Vertretungen</div>
            <div className="space-y-2">
              {[
                { from: 'Max Mustermann (HR)', to: 'Anna Schmidt (HR)', reason: 'Urlaub bis 25.08.2024' },
                { from: 'Peter Weber (Legal)', to: 'Dr. Lisa Meyer (Legal)', reason: 'Konferenz bis 23.08.2024' }
              ].map((delegation, index) => (
                <div key={index} className="text-sm p-2 bg-muted rounded">
                  <div className="font-medium">{delegation.from} → {delegation.to}</div>
                  <div className="text-muted-foreground text-xs">{delegation.reason}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automatische Benachrichtigungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Automatische Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <Label className="font-medium">Push-Benachrichtigungen</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Neues Dokument</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Freigabe erforderlich</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Workflow abgeschlossen</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Erinnerungen</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-medium">E-Mail-Benachrichtigungen</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Täglich (Zusammenfassung)</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sofort (Critical)</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Wöchentlich (Report)</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Eskalationen</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-medium">In-App-Benachrichtigungen</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status-Änderungen</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Kommentare</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Deadlines</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">System-Meldungen</span>
                  <Switch />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-medium">Benachrichtigungsvorlagen</Label>
            <div className="space-y-2">
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm">Neue Freigabe erforderlich</div>
                <Textarea 
                  placeholder="Ein neues Dokument wartet auf Ihre Freigabe..."
                  className="mt-2 text-sm"
                  rows={2}
                />
              </div>
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm">Erinnerung überfällig</div>
                <Textarea 
                  placeholder="Die Freigabe für Dokument [TITEL] ist überfällig..."
                  className="mt-2 text-sm"
                  rows={2}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow-Status & Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Workflow-Status & Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3 text-center border rounded-lg">
              <div className="text-2xl font-bold text-green-600">23</div>
              <div className="text-sm text-muted-foreground">Abgeschlossen heute</div>
            </div>
            <div className="p-3 text-center border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">12</div>
              <div className="text-sm text-muted-foreground">In Bearbeitung</div>
            </div>
            <div className="p-3 text-center border rounded-lg">
              <div className="text-2xl font-bold text-red-600">3</div>
              <div className="text-sm text-muted-foreground">Überfällig</div>
            </div>
            <div className="p-3 text-center border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">1.2h</div>
              <div className="text-sm text-muted-foreground">Ø Bearbeitungszeit</div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-medium">Aktuelle Workflows</Label>
            <div className="space-y-2">
              {[
                {
                  document: 'Arbeitsvertrag_Schmidt.pdf',
                  step: 'Legal-Prüfung',
                  assignee: 'Dr. Meyer',
                  time: '2h überfällig',
                  status: 'critical'
                },
                {
                  document: 'Rechnung_2024-0892.pdf',
                  step: 'Manager-Freigabe',
                  assignee: 'M. Weber',
                  time: '4h verbleibend',
                  status: 'normal'
                },
                {
                  document: 'Spesenabrechnung_August.pdf',
                  step: 'HR-Prüfung',
                  assignee: 'A. Schmidt',
                  time: '1d verbleibend',
                  status: 'normal'
                }
              ].map((workflow, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{workflow.document}</div>
                    <div className="text-xs text-muted-foreground">
                      {workflow.step} → {workflow.assignee}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={workflow.status === 'critical' ? 'destructive' : 'default'}>
                      {workflow.time}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}