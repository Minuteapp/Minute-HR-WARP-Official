import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { toast } from "sonner";
import { 
  Workflow, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  ArrowRight,
  Loader2
} from "lucide-react";

interface FormState {
  workflow_type: '1-stage' | '2-stage' | '3-stage';
  auto_approval_enabled: boolean;
  auto_approval_threshold: number;
  sla_standard_hours: number;
  sla_standard_reminder_hours: number;
  sla_standard_escalation_hours: number;
  sla_urgent_hours: number;
  sla_urgent_reminder_hours: number;
  sla_urgent_escalation_hours: number;
  sla_emergency_hours: number;
  sla_emergency_reminder_hours: number;
  sla_emergency_escalation_hours: number;
  auto_delegation: boolean;
  escalation_chain: boolean;
  threshold_level_1: number;
  threshold_level_2: number;
  threshold_level_3: number;
}

export default function ApprovalWorkflowsTab() {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('business_travel');
  const [saving, setSaving] = useState(false);

  const [formState, setFormState] = useState<FormState>({
    workflow_type: '2-stage',
    auto_approval_enabled: true,
    auto_approval_threshold: 500,
    sla_standard_hours: 24,
    sla_standard_reminder_hours: 12,
    sla_standard_escalation_hours: 48,
    sla_urgent_hours: 4,
    sla_urgent_reminder_hours: 2,
    sla_urgent_escalation_hours: 8,
    sla_emergency_hours: 1,
    sla_emergency_reminder_hours: 0.5,
    sla_emergency_escalation_hours: 2,
    auto_delegation: false,
    escalation_chain: false,
    threshold_level_1: 500,
    threshold_level_2: 1500,
    threshold_level_3: 5000,
  });

  useEffect(() => {
    if (settings) {
      setFormState({
        workflow_type: getValue('workflow_type', '2-stage') as '1-stage' | '2-stage' | '3-stage',
        auto_approval_enabled: getValue('auto_approval_enabled', true) as boolean,
        auto_approval_threshold: getValue('auto_approval_threshold', 500) as number,
        sla_standard_hours: getValue('sla_standard_hours', 24) as number,
        sla_standard_reminder_hours: getValue('sla_standard_reminder_hours', 12) as number,
        sla_standard_escalation_hours: getValue('sla_standard_escalation_hours', 48) as number,
        sla_urgent_hours: getValue('sla_urgent_hours', 4) as number,
        sla_urgent_reminder_hours: getValue('sla_urgent_reminder_hours', 2) as number,
        sla_urgent_escalation_hours: getValue('sla_urgent_escalation_hours', 8) as number,
        sla_emergency_hours: getValue('sla_emergency_hours', 1) as number,
        sla_emergency_reminder_hours: getValue('sla_emergency_reminder_hours', 0.5) as number,
        sla_emergency_escalation_hours: getValue('sla_emergency_escalation_hours', 2) as number,
        auto_delegation: getValue('auto_delegation', false) as boolean,
        escalation_chain: getValue('escalation_chain', false) as boolean,
        threshold_level_1: getValue('threshold_level_1', 500) as number,
        threshold_level_2: getValue('threshold_level_2', 1500) as number,
        threshold_level_3: getValue('threshold_level_3', 5000) as number,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(formState);
      toast.success("Workflows gespeichert");
    } catch (error) {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  const workflowStages = [
    {
      stage: 1,
      role: 'Vorgesetzter',
      conditions: ['Alle Reisen', 'Budget-Prüfung'],
      sla: `${formState.sla_standard_hours}h`,
      escalation: `${formState.sla_standard_escalation_hours}h`
    },
    {
      stage: 2,
      role: 'HR/Travel',
      conditions: [`>${formState.threshold_level_2}€`, 'Visa erforderlich', 'Risikoländer'],
      sla: '48h',
      escalation: '72h'
    },
    {
      stage: 3,
      role: 'Finance/Compliance',
      conditions: [`>${formState.threshold_level_3}€`, 'Policy-Verstoß', 'Notfall'],
      sla: '72h',
      escalation: '120h'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workflow Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-sky-600" />
            Genehmigungsstufen definieren
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: '1-stage', label: '1-stufig', description: 'Nur Vorgesetzter' },
              { id: '2-stage', label: '2-stufig', description: 'Vorgesetzter + HR/Travel' },
              { id: '3-stage', label: '3-stufig', description: 'Inkl. Finance/Compliance' }
            ].map((stage) => (
              <div 
                key={stage.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  formState.workflow_type === stage.id 
                    ? 'border-sky-500 bg-sky-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormState(prev => ({ ...prev, workflow_type: stage.id as FormState['workflow_type'] }))}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <input 
                    type="radio" 
                    checked={formState.workflow_type === stage.id}
                    onChange={() => setFormState(prev => ({ ...prev, workflow_type: stage.id as FormState['workflow_type'] }))}
                  />
                  <Label className="font-medium">{stage.label}</Label>
                </div>
                <p className="text-sm text-muted-foreground">{stage.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-sky-600" />
            Workflow-Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflowStages.slice(0, formState.workflow_type === '1-stage' ? 1 : formState.workflow_type === '2-stage' ? 2 : 3).map((stage, index) => (
              <div key={stage.stage} className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-sky-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {stage.stage}
                  </div>
                </div>
                
                <div className="flex-1 grid grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Rolle</Label>
                    <p className="text-sm text-muted-foreground">{stage.role}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Bedingungen</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {stage.conditions.map((condition, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{condition}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">SLA</Label>
                    <p className="text-sm text-muted-foreground">{stage.sla}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Eskalation</Label>
                    <p className="text-sm text-muted-foreground">{stage.escalation}</p>
                  </div>
                </div>

                {index < workflowStages.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Dynamische Regeln
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="font-medium">Budget-Schwellen</Label>
              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">Stufe 1 ab</span>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number"
                      className="w-24"
                      value={formState.threshold_level_1}
                      onChange={(e) => setFormState(prev => ({...prev, threshold_level_1: Number(e.target.value)}))}
                    />
                    <span className="text-sm">€</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">Stufe 2 ab</span>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number"
                      className="w-24"
                      value={formState.threshold_level_2}
                      onChange={(e) => setFormState(prev => ({...prev, threshold_level_2: Number(e.target.value)}))}
                    />
                    <span className="text-sm">€</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">Stufe 3 ab</span>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number"
                      className="w-24"
                      value={formState.threshold_level_3}
                      onChange={(e) => setFormState(prev => ({...prev, threshold_level_3: Number(e.target.value)}))}
                    />
                    <span className="text-sm">€</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <Label className="font-medium">Risiko & Compliance</Label>
              <div className="space-y-3 mt-2">
                {[
                  { trigger: 'Policy-Verstoß', action: 'Zusätzliche Prüfung' },
                  { trigger: 'Kurzfristigkeit <48h', action: 'Manager + HR' },
                  { trigger: 'CO₂-Score >High', action: 'Nachhaltigkeits-Team' }
                ].map((rule, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{rule.trigger}</span>
                    <Badge variant="outline">{rule.action}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-Approval */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Auto-Genehmigung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Automatische Genehmigung aktivieren</Label>
              <p className="text-sm text-muted-foreground">Für Kleinstreisen unter definierter Schwelle</p>
            </div>
            <Switch
              checked={formState.auto_approval_enabled}
              onCheckedChange={(checked) => 
                setFormState(prev => ({...prev, auto_approval_enabled: checked}))
              }
            />
          </div>
          
          {formState.auto_approval_enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="auto-threshold">Schwellenwert (€)</Label>
                <Input 
                  id="auto-threshold"
                  type="number"
                  value={formState.auto_approval_threshold}
                  onChange={(e) => setFormState(prev => ({...prev, auto_approval_threshold: Number(e.target.value)}))}
                  placeholder="500"
                />
              </div>
              <div>
                <Label>Bedingungen</Label>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">Inland</Badge>
                  <Badge variant="secondary">Standard-Hotels</Badge>
                  <Badge variant="secondary">Keine Policy-Verstöße</Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delegation & Substitution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Vertretungslogik
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="font-medium">Automatische Vertretung</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="auto-delegation"
                    checked={formState.auto_delegation}
                    onCheckedChange={(checked) => setFormState(prev => ({...prev, auto_delegation: checked}))}
                  />
                  <Label htmlFor="auto-delegation">Bei Abwesenheit aktivieren</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="escalation-chain"
                    checked={formState.escalation_chain}
                    onCheckedChange={(checked) => setFormState(prev => ({...prev, escalation_chain: checked}))}
                  />
                  <Label htmlFor="escalation-chain">Eskalationskette nutzen</Label>
                </div>
              </div>
            </div>
            
            <div>
              <Label className="font-medium">Vertretungsregeln</Label>
              <div className="space-y-2 mt-2">
                <div className="p-3 border rounded text-sm">
                  <strong>Vorgesetzter:</strong> Nächsthöhere Führungsebene
                </div>
                <div className="p-3 border rounded text-sm">
                  <strong>HR:</strong> HR-Team-Kollegen
                </div>
                <div className="p-3 border rounded text-sm">
                  <strong>Finance:</strong> Finance-Manager
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SLA & Escalation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-red-600" />
            SLAs & Eskalation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-3">Standard</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>SLA:</span>
                    <Input 
                      type="number"
                      className="w-16"
                      value={formState.sla_standard_hours}
                      onChange={(e) => setFormState(prev => ({...prev, sla_standard_hours: Number(e.target.value)}))}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Erinnerung:</span>
                    <Input 
                      type="number"
                      className="w-16"
                      value={formState.sla_standard_reminder_hours}
                      onChange={(e) => setFormState(prev => ({...prev, sla_standard_reminder_hours: Number(e.target.value)}))}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Eskalation:</span>
                    <Input 
                      type="number"
                      className="w-16"
                      value={formState.sla_standard_escalation_hours}
                      onChange={(e) => setFormState(prev => ({...prev, sla_standard_escalation_hours: Number(e.target.value)}))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-3">Kurzfristig</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>SLA:</span>
                    <Input 
                      type="number"
                      className="w-16"
                      value={formState.sla_urgent_hours}
                      onChange={(e) => setFormState(prev => ({...prev, sla_urgent_hours: Number(e.target.value)}))}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Erinnerung:</span>
                    <Input 
                      type="number"
                      className="w-16"
                      value={formState.sla_urgent_reminder_hours}
                      onChange={(e) => setFormState(prev => ({...prev, sla_urgent_reminder_hours: Number(e.target.value)}))}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Eskalation:</span>
                    <Input 
                      type="number"
                      className="w-16"
                      value={formState.sla_urgent_escalation_hours}
                      onChange={(e) => setFormState(prev => ({...prev, sla_urgent_escalation_hours: Number(e.target.value)}))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-3">Notfall</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>SLA:</span>
                    <Input 
                      type="number"
                      className="w-16"
                      value={formState.sla_emergency_hours}
                      onChange={(e) => setFormState(prev => ({...prev, sla_emergency_hours: Number(e.target.value)}))}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Erinnerung:</span>
                    <Input 
                      type="number"
                      step="0.1"
                      className="w-16"
                      value={formState.sla_emergency_reminder_hours}
                      onChange={(e) => setFormState(prev => ({...prev, sla_emergency_reminder_hours: Number(e.target.value)}))}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Eskalation:</span>
                    <Input 
                      type="number"
                      className="w-16"
                      value={formState.sla_emergency_escalation_hours}
                      onChange={(e) => setFormState(prev => ({...prev, sla_emergency_escalation_hours: Number(e.target.value)}))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Save Configuration */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-sky-600 hover:bg-sky-700">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Workflow className="h-4 w-4 mr-2" />}
          Workflows speichern
        </Button>
      </div>
    </div>
  );
}
