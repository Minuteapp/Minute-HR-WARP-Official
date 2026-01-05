import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Settings, 
  Shield, 
  DollarSign, 
  Building2, 
  Bell,
  Puzzle,
  Zap,
  Globe,
  Save,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Info,
  Target,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useRewardSettings } from '@/hooks/useRewardSettings';
import { SettingsCategory, settingsCategoryLabels, payrollWorkflowSteps } from '@/types/reward-settings';

const SettingsTab: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('general');
  const { settings, permissions, integrations, updateSettings, updatePermission, isUpdating } = useRewardSettings();

  const categoryIcons: Record<SettingsCategory, React.ReactNode> = {
    general: <Settings className="h-5 w-5" />,
    permissions: <Shield className="h-5 w-5" />,
    budget: <DollarSign className="h-5 w-5" />,
    payroll: <Building2 className="h-5 w-5" />,
    notifications: <Bell className="h-5 w-5" />,
    integrations: <Puzzle className="h-5 w-5" />,
    automation: <Zap className="h-5 w-5" />,
    localization: <Globe className="h-5 w-5" />,
  };

  const categories: SettingsCategory[] = ['general', 'permissions', 'budget', 'payroll', 'notifications', 'integrations', 'automation', 'localization'];

  const renderContent = () => {
    switch (activeCategory) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Modul-Name</Label>
                <Input defaultValue={settings.module_name} className="mt-1" />
              </div>
              <div>
                <Label>Beschreibung</Label>
                <Textarea defaultValue={settings.module_description} className="mt-1" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Modul aktiv</p>
                  <p className="text-sm text-muted-foreground">Belohnungsmodul für alle Nutzer aktivieren</p>
                </div>
                <Switch defaultChecked={settings.is_module_active} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Peer-to-Peer Anerkennung</p>
                  <p className="text-sm text-muted-foreground">Mitarbeiter können sich gegenseitig Kudos senden</p>
                </div>
                <Switch defaultChecked={settings.is_peer_recognition_active} />
              </div>
            </div>
          </div>
        );

      case 'permissions':
        return (
          <div className="space-y-6">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-medium">Rolle</th>
                  <th className="text-center py-3 font-medium">Anzeigen</th>
                  <th className="text-center py-3 font-medium">Erstellen</th>
                  <th className="text-center py-3 font-medium">Genehmigen</th>
                  <th className="text-center py-3 font-medium">Verwalten</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm) => (
                  <tr key={perm.role} className="border-b">
                    <td className="py-3 font-medium">{perm.role}</td>
                    <td className="py-3 text-center">
                      <Checkbox defaultChecked={perm.can_view} />
                    </td>
                    <td className="py-3 text-center">
                      <Checkbox defaultChecked={perm.can_create} />
                    </td>
                    <td className="py-3 text-center">
                      <Checkbox defaultChecked={perm.can_approve} />
                    </td>
                    <td className="py-3 text-center">
                      <Checkbox defaultChecked={perm.can_manage} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'budget':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Jahresbudget (€)</Label>
                <Input type="number" defaultValue={settings.yearly_budget} className="mt-1" />
              </div>
              <div>
                <Label>Max. pro Mitarbeiter/Monat (€)</Label>
                <Input type="number" defaultValue={settings.max_reward_per_employee_monthly} className="mt-1" />
              </div>
              <div>
                <Label>Teamleiter-Genehmigungsschwelle (€)</Label>
                <Input type="number" defaultValue={settings.team_lead_approval_threshold} className="mt-1" />
              </div>
              <div>
                <Label>Budget-Warnung bei (%)</Label>
                <Input type="number" defaultValue={settings.budget_warning_threshold} className="mt-1" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Budget-Warnung aktivieren</p>
                <p className="text-sm text-muted-foreground">Benachrichtigung bei Schwellenwert-Überschreitung</p>
              </div>
              <Switch defaultChecked={settings.budget_warning_enabled} />
            </div>
          </div>
        );

      case 'payroll':
        return (
          <div className="space-y-6">
            {/* Verbindungsstatus */}
            <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">Minute HR Lohn & Gehalt</p>
                    <p className="text-sm text-green-600 dark:text-green-400">Automatische Synchronisation aktiv</p>
                  </div>
                </div>
                <Badge className="bg-green-600">Verbunden</Badge>
              </CardContent>
            </Card>

            {/* Workflow-Schritte */}
            <div>
              <h4 className="font-medium mb-4">Workflow zur Lohnabrechnung</h4>
              <div className="space-y-3">
                {payrollWorkflowSteps.map((step) => (
                  <div key={step.step} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{step.title}</p>
                      <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                      {step.details && (
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Konfiguration */}
            <div className="space-y-4">
              <h4 className="font-medium">Konfiguration</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Automatische Synchronisation</p>
                  <p className="text-sm text-muted-foreground">Belohnungen automatisch ans Lohnsystem übertragen</p>
                </div>
                <Switch defaultChecked={settings.auto_sync_enabled} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Standard-Lohnart</Label>
                  <Select defaultValue={settings.default_payment_type}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bonus">Bonus</SelectItem>
                      <SelectItem value="salary">Gehalt</SelectItem>
                      <SelectItem value="benefit">Sachbezug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Auszahlungszeitpunkt</Label>
                  <Select defaultValue={settings.payout_timing}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="next_payroll">Nächste Gehaltsabrechnung</SelectItem>
                      <SelectItem value="immediate">Sofort</SelectItem>
                      <SelectItem value="end_of_month">Monatsende</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Steueroptimierung aktivieren</p>
                  <p className="text-sm text-muted-foreground">Automatische Nutzung steuerfreier Freibeträge</p>
                </div>
                <Switch defaultChecked={settings.tax_optimization_enabled} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">E-Mail-Benachrichtigung an Mitarbeiter</p>
                  <p className="text-sm text-muted-foreground">Mitarbeiter über Auszahlung informieren</p>
                </div>
                <Switch defaultChecked={settings.email_notification_enabled} />
              </div>
            </div>

            {/* Wichtige Hinweise */}
            <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-2">Wichtige Hinweise:</p>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Nicht-finanzielle Belohnungen</strong> werden NICHT an die Lohnabrechnung übertragen</li>
                  <li>• <strong>Peer Recognition Kudos</strong> sind rein symbolisch und haben keinen monetären Wert</li>
                  <li>• <strong>Gutscheine als Sachbezug:</strong> Bis €50/Monat steuerfrei (§8 Abs. 2 EStG)</li>
                  <li>• <strong>Compliance:</strong> Alle Daten werden DSGVO-konform verarbeitet</li>
                  <li>• <strong>Mehrfach-Währungen:</strong> Automatische Umrechnung zum Tageskurs</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Beispielrechnung */}
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Beispielrechnung: Leistungsbonus €300
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Brutto-Belohnung:</span>
                    <span className="font-medium">€300,00</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>- Lohnsteuer (ca. 25%):</span>
                    <span>-€75,00</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>- Sozialversicherung (ca. 20%):</span>
                    <span>-€60,00</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Netto-Auszahlung:</span>
                    <span className="text-primary">€165,00</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  * Beispielhafte Berechnung. Tatsächliche Abzüge hängen von individuellen Faktoren ab.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground">Konfigurieren Sie, welche Benachrichtigungen gesendet werden sollen.</p>
            
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Neue Belohnung erhalten</p>
                      <p className="text-sm text-muted-foreground">E-Mail an Mitarbeiter bei neuer Belohnung</p>
                    </div>
                  </div>
                  <Switch defaultChecked={settings.notify_new_reward} />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium">Genehmigung erforderlich</p>
                      <p className="text-sm text-muted-foreground">Benachrichtigung an Vorgesetzte bei Genehmigungsanfragen</p>
                    </div>
                  </div>
                  <Switch defaultChecked={settings.notify_approval_required} />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium">Budget-Warnung</p>
                      <p className="text-sm text-muted-foreground">Warnung bei 80% Budget-Auslastung</p>
                    </div>
                  </div>
                  <Switch defaultChecked={settings.notify_budget_warning} />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Monatliche Reports</p>
                      <p className="text-sm text-muted-foreground">Zusammenfassung an HR-Abteilung</p>
                    </div>
                  </div>
                  <Switch defaultChecked={settings.notify_monthly_reports} />
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Modul-Integrationen</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Verbinden Sie das Belohnungsmodul mit anderen Minute-Modulen für automatische Workflows.
              </p>
            </div>

            <div className="grid gap-4">
              {integrations.map((integration) => (
                <Card key={integration.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {integration.integration_type === 'performance' && <TrendingUp className="h-5 w-5 text-primary" />}
                        {integration.integration_type === 'okr' && <Target className="h-5 w-5 text-primary" />}
                        {integration.integration_type === 'shift' && <Calendar className="h-5 w-5 text-primary" />}
                      </div>
                      <div>
                        <p className="font-medium">{integration.integration_name}</p>
                        <p className="text-sm text-muted-foreground">{integration.integration_description}</p>
                      </div>
                    </div>
                    <Badge variant={integration.is_connected ? 'default' : 'secondary'} className={integration.is_connected ? 'bg-green-600' : ''}>
                      {integration.is_connected ? 'Verbunden' : 'Nicht verbunden'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'automation':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Automatisierungseinstellungen</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Konfigurieren Sie KI-gestützte Automatisierungen für das Belohnungssystem.
              </p>
            </div>

            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium">KI-Empfehlungen aktivieren</p>
                    <p className="text-sm text-muted-foreground">Automatische Belohnungsvorschläge basierend auf Leistung</p>
                  </div>
                </div>
                <Switch defaultChecked={settings.ai_recommendations_enabled} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">Auto-Genehmigung aktivieren</p>
                      <p className="text-sm text-muted-foreground">Belohnungen unter Schwellenwert automatisch genehmigen</p>
                    </div>
                  </div>
                  <Switch defaultChecked={settings.auto_approval_enabled} />
                </div>
                <div className="pl-13 ml-13">
                  <Label className="text-sm">Schwellenwert (€)</Label>
                  <Input 
                    type="number" 
                    defaultValue={settings.auto_approval_threshold} 
                    className="mt-1 w-32"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Belohnungen bis zu diesem Betrag werden automatisch genehmigt
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">KI-Konfidenz Schwelle</p>
                    <p className="text-sm text-muted-foreground">Nur Empfehlungen ab diesem Konfidenzwert anzeigen</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Schwelle:</span>
                    <span className="font-medium">{settings.ai_confidence_threshold}%</span>
                  </div>
                  <Slider 
                    defaultValue={[settings.ai_confidence_threshold]} 
                    max={100} 
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'localization':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Lokalisierung & Compliance</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Konfigurieren Sie regionale Einstellungen und Compliance-Optionen.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Standardsprache</Label>
                <Select defaultValue={settings.default_language}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Währung</Label>
                <Select defaultValue={settings.default_currency}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="CHF">CHF (Fr.)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Steuerregion</Label>
                <Select defaultValue={settings.tax_region}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DE">Deutschland</SelectItem>
                    <SelectItem value="AT">Österreich</SelectItem>
                    <SelectItem value="CH">Schweiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">DSGVO-Compliance</p>
                    <p className="text-sm text-muted-foreground">Datenschutz-Richtlinien aktivieren</p>
                  </div>
                </div>
                <Switch defaultChecked={settings.gdpr_compliance_enabled} />
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Einstellungen</h2>
        <p className="text-muted-foreground">Konfigurieren Sie das Belohnungsmodul</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-3">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeCategory === cat 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {categoryIcons[cat]}
                    <span className="text-sm">{settingsCategoryLabels[cat]}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="col-span-9">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {categoryIcons[activeCategory]}
                {settingsCategoryLabels[activeCategory]}
              </CardTitle>
            </CardHeader>
            <CardContent>{renderContent()}</CardContent>
          </Card>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Zurücksetzen
            </Button>
            <Button disabled={isUpdating}>
              <Save className="h-4 w-4 mr-2" />
              Änderungen speichern
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;