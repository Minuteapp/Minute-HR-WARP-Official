
import { TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  FileCheck, 
  Bot, 
  Link, 
  CheckCircle, 
  AlertTriangle,
  Settings,
  DollarSign
} from 'lucide-react';
import { ProjectFormData } from '@/hooks/projects/useProjectForm';

interface ResourcesTabProps {
  formData: ProjectFormData;
  onChange: (field: keyof ProjectFormData, value: any) => void;
  onBack: () => void;
  isSubmitting: boolean;
  isFormValid: boolean;
  mode: 'create' | 'edit';
  active: boolean;
  forceMount?: boolean;
}

export const ResourcesTab = ({ 
  formData, 
  onChange, 
  onBack, 
  isSubmitting, 
  isFormValid, 
  mode,
  active, 
  forceMount = false 
}: ResourcesTabProps) => {
  return (
    <TabsContent value="resources" className={active ? 'block' : 'hidden'} forceMount={forceMount ? true : undefined}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Ressourcen & Konfiguration
          </h3>
          <p className="text-sm text-gray-500">Konfigurieren Sie Budget, Compliance, Automatisierung und Verknüpfungen</p>
        </div>

        {/* Budget Grunddaten */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budget & Kostenstelle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => onChange('budget', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Währung</Label>
                <Select value={formData.currency} onValueChange={(value) => onChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                    <SelectItem value="GBP">Britisches Pfund (GBP)</SelectItem>
                    <SelectItem value="CHF">Schweizer Franken (CHF)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="costCenter">Kostenstelle</Label>
                <Input
                  id="costCenter"
                  value={formData.costCenter}
                  onChange={(e) => onChange('costCenter', e.target.value)}
                  placeholder="KS-001"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project_type">Projekttyp</Label>
              <Select value={formData.project_type} onValueChange={(value) => onChange('project_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="agile">Agil</SelectItem>
                  <SelectItem value="waterfall">Wasserfall</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Compliance & Risiko */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Compliance & Risikobewertung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compliance erforderlich</Label>
                <p className="text-sm text-gray-500">Projekt unterliegt besonderen Compliance-Anforderungen</p>
              </div>
              <Switch
                checked={formData.complianceRequired}
                onCheckedChange={(checked) => onChange('complianceRequired', checked)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Risikostufe</Label>
                <Select 
                  value={formData.riskLevel} 
                  onValueChange={(value) => onChange('riskLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Niedrig
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        Mittel
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Hoch
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dokumentation erforderlich</Label>
                  <p className="text-xs text-gray-500">Projektdokumentation ist Pflicht</p>
                </div>
                <Switch
                  checked={formData.documentationRequired}
                  onCheckedChange={(checked) => onChange('documentationRequired', checked)}
                />
              </div>
            </div>

            {formData.complianceRequired && (
              <div className="space-y-2">
                <Label>Compliance-Hinweise</Label>
                <Textarea
                  value={formData.complianceNotes}
                  onChange={(e) => onChange('complianceNotes', e.target.value)}
                  placeholder="Spezifische Compliance-Anforderungen beschreiben..."
                  rows={3}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Automatisierung */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Automatisierung & Integrationen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatisierte Berichte</Label>
                  <p className="text-sm text-gray-500">Regelmäßige Projektberichte automatisch generieren</p>
                </div>
                <Switch
                  checked={formData.enableAutomatedReporting}
                  onCheckedChange={(checked) => onChange('enableAutomatedReporting', checked)}
                />
              </div>

              {formData.enableAutomatedReporting && (
                <div className="space-y-2">
                  <Label>Berichtshäufigkeit</Label>
                  <Select 
                    value={formData.reportingFrequency} 
                    onValueChange={(value) => onChange('reportingFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Wöchentlich</SelectItem>
                      <SelectItem value="monthly">Monatlich</SelectItem>
                      <SelectItem value="quarterly">Quartalsweise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Slack-Integration</Label>
                    <p className="text-xs text-gray-500">Updates in Slack-Channels</p>
                  </div>
                  <Switch
                    checked={formData.enableSlackIntegration}
                    onCheckedChange={(checked) => onChange('enableSlackIntegration', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>E-Mail-Benachrichtigungen</Label>
                    <p className="text-xs text-gray-500">Wichtige Updates per E-Mail</p>
                  </div>
                  <Switch
                    checked={formData.enableEmailNotifications}
                    onCheckedChange={(checked) => onChange('enableEmailNotifications', checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Genehmigung */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Genehmigungsprozess
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Genehmigung erforderlich</Label>
                <p className="text-sm text-gray-500">Projekt muss vor Start genehmigt werden</p>
              </div>
              <Switch
                checked={formData.approvalRequired}
                onCheckedChange={(checked) => onChange('approvalRequired', checked)}
              />
            </div>

            {formData.approvalRequired && (
              <div className="space-y-2">
                <Label>Genehmigungsfrist</Label>
                <Input
                  type="date"
                  value={formData.approvalDeadline}
                  onChange={(e) => onChange('approvalDeadline', e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Template Option */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Template-Optionen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Als Vorlage speichern</Label>
                <p className="text-sm text-gray-500">Projekt als Vorlage für zukünftige Projekte speichern</p>
              </div>
              <Switch
                checked={formData.saveAsTemplate}
                onCheckedChange={(checked) => onChange('saveAsTemplate', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Zurück
          </Button>
          <Button 
            type="submit" 
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? 'Speichern...' : mode === 'create' ? 'Projekt erstellen' : 'Projekt aktualisieren'}
          </Button>
        </div>
      </div>
    </TabsContent>
  );
};
