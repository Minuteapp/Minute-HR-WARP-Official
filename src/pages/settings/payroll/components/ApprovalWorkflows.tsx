import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Save, Plus, Users, AlertCircle, Loader2 } from "lucide-react";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { useToast } from "@/hooks/use-toast";

interface ApprovalWorkflowsFormState {
  salary_increase_workflow: boolean;
  special_payments_workflow: boolean;
  bonus_payments_workflow: boolean;
  auto_approve_small_amounts: boolean;
  budget_check_enabled: boolean;
  kpi_based_approval: boolean;
  default_processing_time: string;
  reminder_interval: string;
  email_notifications: boolean;
  push_notifications: boolean;
  cc_supervisor_on_delay: boolean;
}

const defaultFormState: ApprovalWorkflowsFormState = {
  salary_increase_workflow: true,
  special_payments_workflow: true,
  bonus_payments_workflow: true,
  auto_approve_small_amounts: true,
  budget_check_enabled: true,
  kpi_based_approval: false,
  default_processing_time: '7',
  reminder_interval: '3',
  email_notifications: true,
  push_notifications: true,
  cc_supervisor_on_delay: false,
};

const ApprovalWorkflows: React.FC = () => {
  const { toast } = useToast();
  const { settings, loading, isSaving, getValue, saveSettings } = useEffectiveSettings('payroll_workflows');
  const [formState, setFormState] = useState<ApprovalWorkflowsFormState>(defaultFormState);

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormState(prev => ({
        ...prev,
        salary_increase_workflow: getValue('salary_increase_workflow', prev.salary_increase_workflow),
        special_payments_workflow: getValue('special_payments_workflow', prev.special_payments_workflow),
        bonus_payments_workflow: getValue('bonus_payments_workflow', prev.bonus_payments_workflow),
        auto_approve_small_amounts: getValue('auto_approve_small_amounts', prev.auto_approve_small_amounts),
        budget_check_enabled: getValue('budget_check_enabled', prev.budget_check_enabled),
        kpi_based_approval: getValue('kpi_based_approval', prev.kpi_based_approval),
        default_processing_time: getValue('default_processing_time', prev.default_processing_time),
        reminder_interval: getValue('reminder_interval', prev.reminder_interval),
        email_notifications: getValue('email_notifications', prev.email_notifications),
        push_notifications: getValue('push_notifications', prev.push_notifications),
        cc_supervisor_on_delay: getValue('cc_supervisor_on_delay', prev.cc_supervisor_on_delay),
      }));
    }
  }, [settings, getValue]);

  const updateFormField = <K extends keyof ApprovalWorkflowsFormState>(key: K, value: ApprovalWorkflowsFormState[K]) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const success = await saveSettings(formState);
      if (success) {
        toast({
          title: "Einstellungen gespeichert",
          description: "Die Workflow-Einstellungen wurden erfolgreich in der Datenbank aktualisiert.",
        });
      } else {
        toast({
          title: "Fehler beim Speichern",
          description: "Die Einstellungen konnten nicht gespeichert werden.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Genehmigungsworkflows
        </h2>
        <p className="text-sm text-muted-foreground">
          Mehrstufige Genehmigungsprozesse für Gehaltsänderungen und Abrechnungen
        </p>
      </div>

      <div className="grid gap-6">
        {/* Workflow-Übersicht */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Aktive Workflows
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Workflow erstellen
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">Gehaltserhöhungen</h4>
                    <Badge variant="secondary">3-stufig</Badge>
                    <Badge variant="outline">Aktiv</Badge>
                  </div>
                  <Switch 
                    checked={formState.salary_increase_workflow}
                    onCheckedChange={(v) => updateFormField('salary_increase_workflow', v)}
                  />
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Teamleiter → HR → Admin</span>
                  </div>
                  <div>max. 14 Tage</div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Badge variant="outline" className="text-xs">Automatisch bei {'>'}5%</Badge>
                  <Badge variant="outline" className="text-xs">E-Mail-Benachrichtigung</Badge>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">Sonderzahlungen</h4>
                    <Badge variant="secondary">2-stufig</Badge>
                    <Badge variant="outline">Aktiv</Badge>
                  </div>
                  <Switch 
                    checked={formState.special_payments_workflow}
                    onCheckedChange={(v) => updateFormField('special_payments_workflow', v)}
                  />
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>HR → Finance</span>
                  </div>
                  <div>max. 7 Tage</div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Badge variant="outline" className="text-xs">Ab 1.000€</Badge>
                  <Badge variant="outline" className="text-xs">Budget-Prüfung</Badge>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">Bonus-Auszahlungen</h4>
                    <Badge variant="secondary">1-stufig</Badge>
                    <Badge variant="outline">Aktiv</Badge>
                  </div>
                  <Switch 
                    checked={formState.bonus_payments_workflow}
                    onCheckedChange={(v) => updateFormField('bonus_payments_workflow', v)}
                  />
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>HR Manager</span>
                  </div>
                  <div>max. 3 Tage</div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Badge variant="outline" className="text-xs">Automatisch bei KPI-Erreichen</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow-Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Standard-Genehmigungsebenen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="font-medium">1. Ebene - Teamleiter</Label>
                    <p className="text-sm text-muted-foreground">Erstprüfung & Befürwortung</p>
                  </div>
                  <Badge variant="outline">Aktiv</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="font-medium">2. Ebene - HR Manager</Label>
                    <p className="text-sm text-muted-foreground">Fachliche Prüfung</p>
                  </div>
                  <Badge variant="outline">Aktiv</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="font-medium">3. Ebene - Admin/Finance</Label>
                    <p className="text-sm text-muted-foreground">Budget & finale Freigabe</p>
                  </div>
                  <Badge variant="outline">Aktiv</Badge>
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <Label className="text-sm font-medium">Eskalationsregeln</Label>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div>• Auto-Eskalation nach 7 Tagen ohne Antwort</div>
                  <div>• E-Mail-Erinnerung nach 3 Tagen</div>
                  <div>• CC an nächste Ebene nach 5 Tagen</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Automatisierungsregeln</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Auto-Genehmigung Kleinbeträge</Label>
                    <Switch 
                      checked={formState.auto_approve_small_amounts}
                      onCheckedChange={(v) => updateFormField('auto_approve_small_amounts', v)}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Automatische Genehmigung bei Änderungen unter 50€/Monat
                  </div>
                </div>

                <div className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Budget-Prüfung</Label>
                    <Switch 
                      checked={formState.budget_check_enabled}
                      onCheckedChange={(v) => updateFormField('budget_check_enabled', v)}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Automatische Ablehnung bei Budgetüberschreitung
                  </div>
                </div>

                <div className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">KPI-basierte Genehmigung</Label>
                    <Switch 
                      checked={formState.kpi_based_approval}
                      onCheckedChange={(v) => updateFormField('kpi_based_approval', v)}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Auto-Genehmigung bei erreichten Leistungszielen
                  </div>
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <Label className="text-sm font-medium">Schwellenwerte</Label>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="font-medium">Gehaltserhöhung:</div>
                    <div className="text-muted-foreground">{'<'}5%: 1-stufig</div>
                    <div className="text-muted-foreground">{'>'} 5%: 3-stufig</div>
                  </div>
                  <div>
                    <div className="font-medium">Sonderzahlung:</div>
                    <div className="text-muted-foreground">{'<'}1.000€: 1-stufig</div>
                    <div className="text-muted-foreground">{'>'} 1.000€: 2-stufig</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benachrichtigungen & Fristen */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Benachrichtigungen & Fristen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label className="font-medium">Standard-Bearbeitungszeit</Label>
                  <Select 
                    value={formState.default_processing_time}
                    onValueChange={(v) => updateFormField('default_processing_time', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Tage</SelectItem>
                      <SelectItem value="7">7 Tage</SelectItem>
                      <SelectItem value="14">14 Tage</SelectItem>
                      <SelectItem value="30">30 Tage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="font-medium">Erinnerungsintervall</Label>
                  <Select 
                    value={formState.reminder_interval}
                    onValueChange={(v) => updateFormField('reminder_interval', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Täglich</SelectItem>
                      <SelectItem value="3">Alle 3 Tage</SelectItem>
                      <SelectItem value="7">Wöchentlich</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">E-Mail-Benachrichtigungen</Label>
                    <p className="text-sm text-muted-foreground">Bei neuen Anträgen</p>
                  </div>
                  <Switch 
                    checked={formState.email_notifications}
                    onCheckedChange={(v) => updateFormField('email_notifications', v)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Push-Benachrichtigungen</Label>
                    <p className="text-sm text-muted-foreground">In der App</p>
                  </div>
                  <Switch 
                    checked={formState.push_notifications}
                    onCheckedChange={(v) => updateFormField('push_notifications', v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">CC an Vorgesetzten</Label>
                    <p className="text-sm text-muted-foreground">Bei Verzögerungen</p>
                  </div>
                  <Switch 
                    checked={formState.cc_supervisor_on_delay}
                    onCheckedChange={(v) => updateFormField('cc_supervisor_on_delay', v)}
                  />
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm font-medium text-yellow-800">Ausstehende Genehmigungen</p>
                  </div>
                  <p className="text-xs text-yellow-700 mt-1">
                    Aktuell 3 Anträge über der definierten Bearbeitungszeit
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Workflow-Einstellungen speichern
        </Button>
      </div>
    </div>
  );
};

export default ApprovalWorkflows;
