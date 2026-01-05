import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Map, Truck, FileText, DollarSign, Plus, ChevronLeft, Loader2, 
  Settings, Bell, Coins, Shield, CheckCircle 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";

interface GlobalMobilityFormState {
  // Allgemein
  enabled: boolean;
  // Umzug
  relocation_budget: number;
  temporary_housing_days: number;
  family_support: boolean;
  relocation_assistance: boolean;
  // Einsätze
  short_term_max_months: number;
  long_term_max_years: number;
  permanent_transfer_enabled: boolean;
  rotational_assignment_enabled: boolean;
  // Visa
  visa_expiry_warnings: boolean;
  warning_days_before_expiry: number;
  document_tracking: boolean;
  auto_renewal_reminders: boolean;
  // Steuern
  auto_tax_calculation: boolean;
  residence_tracking: boolean;
  tax_threshold_warning_days: number;
  tax_equalization: boolean;
  // Benachrichtigungen (NEU)
  notify_on_status_change: boolean;
  notify_before_assignment_end: boolean;
  assignment_end_reminder_days: number;
  // Zulagen (NEU)
  default_housing_allowance: number;
  default_cola_percentage: number;
  education_allowance_enabled: boolean;
  // Compliance (NEU)
  social_security_tracking: boolean;
  a1_certificate_required: boolean;
  // Genehmigungen (NEU)
  approval_required: boolean;
  approver_role: string;
}

export default function GlobalMobilitySettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading, saveSettings, getValue } = useEffectiveSettings('global_mobility');
  const [isSaving, setIsSaving] = useState(false);

  const [formState, setFormState] = useState<GlobalMobilityFormState>({
    enabled: true,
    relocation_budget: 10000,
    temporary_housing_days: 30,
    family_support: true,
    relocation_assistance: true,
    short_term_max_months: 6,
    long_term_max_years: 3,
    permanent_transfer_enabled: true,
    rotational_assignment_enabled: false,
    visa_expiry_warnings: true,
    warning_days_before_expiry: 90,
    document_tracking: true,
    auto_renewal_reminders: true,
    auto_tax_calculation: false,
    residence_tracking: true,
    tax_threshold_warning_days: 150,
    tax_equalization: false,
    notify_on_status_change: true,
    notify_before_assignment_end: true,
    assignment_end_reminder_days: 30,
    default_housing_allowance: 2000,
    default_cola_percentage: 15,
    education_allowance_enabled: false,
    social_security_tracking: true,
    a1_certificate_required: true,
    approval_required: true,
    approver_role: 'hr_manager',
  });

  useEffect(() => {
    if (!loading) {
      setFormState(prev => ({
        ...prev,
        enabled: getValue('enabled', prev.enabled),
        relocation_budget: getValue('relocation_budget', prev.relocation_budget),
        temporary_housing_days: getValue('temporary_housing_days', prev.temporary_housing_days),
        family_support: getValue('family_support', prev.family_support),
        relocation_assistance: getValue('relocation_assistance', prev.relocation_assistance),
        short_term_max_months: getValue('short_term_max_months', prev.short_term_max_months),
        long_term_max_years: getValue('long_term_max_years', prev.long_term_max_years),
        permanent_transfer_enabled: getValue('permanent_transfer_enabled', prev.permanent_transfer_enabled),
        rotational_assignment_enabled: getValue('rotational_assignment_enabled', prev.rotational_assignment_enabled),
        visa_expiry_warnings: getValue('visa_expiry_warnings', prev.visa_expiry_warnings),
        warning_days_before_expiry: getValue('warning_days_before_expiry', prev.warning_days_before_expiry),
        document_tracking: getValue('document_tracking', prev.document_tracking),
        auto_renewal_reminders: getValue('auto_renewal_reminders', prev.auto_renewal_reminders),
        auto_tax_calculation: getValue('auto_tax_calculation', prev.auto_tax_calculation),
        residence_tracking: getValue('residence_tracking', prev.residence_tracking),
        tax_threshold_warning_days: getValue('tax_threshold_warning_days', prev.tax_threshold_warning_days),
        tax_equalization: getValue('tax_equalization', prev.tax_equalization),
        notify_on_status_change: getValue('notify_on_status_change', prev.notify_on_status_change),
        notify_before_assignment_end: getValue('notify_before_assignment_end', prev.notify_before_assignment_end),
        assignment_end_reminder_days: getValue('assignment_end_reminder_days', prev.assignment_end_reminder_days),
        default_housing_allowance: getValue('default_housing_allowance', prev.default_housing_allowance),
        default_cola_percentage: getValue('default_cola_percentage', prev.default_cola_percentage),
        education_allowance_enabled: getValue('education_allowance_enabled', prev.education_allowance_enabled),
        social_security_tracking: getValue('social_security_tracking', prev.social_security_tracking),
        a1_certificate_required: getValue('a1_certificate_required', prev.a1_certificate_required),
        approval_required: getValue('approval_required', prev.approval_required),
        approver_role: getValue('approver_role', prev.approver_role),
      }));
    }
  }, [loading, getValue]);

  const updateFormState = (key: keyof GlobalMobilityFormState, value: any) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings(formState);
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Global Mobility-Einstellungen wurden erfolgreich aktualisiert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate("/settings")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">Global Mobility-Einstellungen</h1>
            <p className="text-sm text-muted-foreground">Konfigurieren Sie Umzüge, Visa und Compliance</p>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="module-enabled">Modul aktiv</Label>
            <Switch 
              id="module-enabled"
              checked={formState.enabled}
              onCheckedChange={(checked) => updateFormState('enabled', checked)}
            />
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Allgemein
            </TabsTrigger>
            <TabsTrigger value="relocation" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Umzug
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Einsätze
            </TabsTrigger>
            <TabsTrigger value="visa" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Visa
            </TabsTrigger>
            <TabsTrigger value="tax" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Steuern
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Benachrichtigungen
            </TabsTrigger>
            <TabsTrigger value="allowances" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Zulagen
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Compliance
            </TabsTrigger>
          </TabsList>

          {/* Allgemein Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Allgemeine Einstellungen</CardTitle>
                <CardDescription>Grundlegende Konfiguration des Global Mobility Moduls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Genehmigung erforderlich</Label>
                    <p className="text-sm text-muted-foreground">Mobility-Anträge müssen genehmigt werden</p>
                  </div>
                  <Switch 
                    checked={formState.approval_required}
                    onCheckedChange={(checked) => updateFormState('approval_required', checked)}
                  />
                </div>
                {formState.approval_required && (
                  <div className="space-y-2">
                    <Label>Standard-Genehmiger-Rolle</Label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={formState.approver_role}
                      onChange={(e) => updateFormState('approver_role', e.target.value)}
                    >
                      <option value="hr_manager">HR Manager</option>
                      <option value="department_head">Abteilungsleiter</option>
                      <option value="cfo">CFO</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Umzug Tab */}
          <TabsContent value="relocation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Umzugsrichtlinien</CardTitle>
                <CardDescription>Richtlinien für Mitarbeiter-Umzüge</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Standard-Umzugsbudget (€)</Label>
                    <Input 
                      type="number" 
                      value={formState.relocation_budget}
                      onChange={(e) => updateFormState('relocation_budget', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Temporäre Unterkunft (Tage)</Label>
                    <Input 
                      type="number" 
                      value={formState.temporary_housing_days}
                      onChange={(e) => updateFormState('temporary_housing_days', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Familienunterstützung</Label>
                    <p className="text-sm text-muted-foreground">Umzugskosten für Familienmitglieder</p>
                  </div>
                  <Switch 
                    checked={formState.family_support}
                    onCheckedChange={(checked) => updateFormState('family_support', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Umzugsunterstützung</Label>
                    <p className="text-sm text-muted-foreground">Professionelle Umzugshilfe bereitstellen</p>
                  </div>
                  <Switch 
                    checked={formState.relocation_assistance}
                    onCheckedChange={(checked) => updateFormState('relocation_assistance', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Einsätze Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Einsatzarten</CardTitle>
                <CardDescription>Typen von internationalen Einsätzen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kurzzeiteinsatz - Max. Monate</Label>
                    <Input 
                      type="number" 
                      value={formState.short_term_max_months}
                      onChange={(e) => updateFormState('short_term_max_months', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Langzeiteinsatz - Max. Jahre</Label>
                    <Input 
                      type="number" 
                      value={formState.long_term_max_years}
                      onChange={(e) => updateFormState('long_term_max_years', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Permanenter Transfer</Label>
                    <p className="text-sm text-muted-foreground">Dauerhafte Versetzungen ermöglichen</p>
                  </div>
                  <Switch 
                    checked={formState.permanent_transfer_enabled}
                    onCheckedChange={(checked) => updateFormState('permanent_transfer_enabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="flex items-center gap-2">
                      Rotationseinsätze
                      <Badge variant="secondary">Erweitert</Badge>
                    </Label>
                    <p className="text-sm text-muted-foreground">Wechselnde Einsatzorte ermöglichen</p>
                  </div>
                  <Switch 
                    checked={formState.rotational_assignment_enabled}
                    onCheckedChange={(checked) => updateFormState('rotational_assignment_enabled', checked)}
                  />
                </div>
                <div className="space-y-4 pt-4 border-t">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">Kurzzeiteinsatz</h4>
                    <p className="text-sm text-muted-foreground">Bis zu {formState.short_term_max_months} Monate</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">Langzeiteinsatz</h4>
                    <p className="text-sm text-muted-foreground">{formState.short_term_max_months} Monate bis {formState.long_term_max_years} Jahre</p>
                  </div>
                  {formState.permanent_transfer_enabled && (
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium">Permanenter Transfer</h4>
                      <p className="text-sm text-muted-foreground">Dauerhafte Versetzung</p>
                    </div>
                  )}
                  {formState.rotational_assignment_enabled && (
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium">Rotationseinsatz</h4>
                      <p className="text-sm text-muted-foreground">Wechselnde Einsatzorte</p>
                    </div>
                  )}
                </div>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Einsatzart hinzufügen
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visa Tab */}
          <TabsContent value="visa" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visa-Management</CardTitle>
                <CardDescription>Einstellungen für Visa-Verwaltung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Ablauf-Warnungen</Label>
                    <p className="text-sm text-muted-foreground">Warnung vor Visa-Ablauf</p>
                  </div>
                  <Switch 
                    checked={formState.visa_expiry_warnings}
                    onCheckedChange={(checked) => updateFormState('visa_expiry_warnings', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Warnung vor Ablauf (Tage)</Label>
                  <Input 
                    type="number" 
                    value={formState.warning_days_before_expiry}
                    onChange={(e) => updateFormState('warning_days_before_expiry', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Dokumenten-Tracking</Label>
                    <p className="text-sm text-muted-foreground">Status aller Dokumente verfolgen</p>
                  </div>
                  <Switch 
                    checked={formState.document_tracking}
                    onCheckedChange={(checked) => updateFormState('document_tracking', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Verlängerungs-Erinnerungen</Label>
                    <p className="text-sm text-muted-foreground">Erinnerungen für Visa-Verlängerung</p>
                  </div>
                  <Switch 
                    checked={formState.auto_renewal_reminders}
                    onCheckedChange={(checked) => updateFormState('auto_renewal_reminders', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Steuern Tab */}
          <TabsContent value="tax" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Steuer-Compliance</CardTitle>
                <CardDescription>Steuerliche Anforderungen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Steuerberechnung</Label>
                    <p className="text-sm text-muted-foreground">Steuern je nach Aufenthaltsort</p>
                  </div>
                  <Switch 
                    checked={formState.auto_tax_calculation}
                    onCheckedChange={(checked) => updateFormState('auto_tax_calculation', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Aufenthalts-Tracking</Label>
                    <p className="text-sm text-muted-foreground">Tage pro Land verfolgen</p>
                  </div>
                  <Switch 
                    checked={formState.residence_tracking}
                    onCheckedChange={(checked) => updateFormState('residence_tracking', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Warnung bei Schwellenwert (Tage)</Label>
                  <Input 
                    type="number" 
                    value={formState.tax_threshold_warning_days}
                    onChange={(e) => updateFormState('tax_threshold_warning_days', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Steuerausgleich</Label>
                    <p className="text-sm text-muted-foreground">Tax Equalization für Expatriates</p>
                  </div>
                  <Switch 
                    checked={formState.tax_equalization}
                    onCheckedChange={(checked) => updateFormState('tax_equalization', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Benachrichtigungen Tab (NEU) */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Benachrichtigungen</CardTitle>
                <CardDescription>Automatische Benachrichtigungen konfigurieren</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bei Statusänderung benachrichtigen</Label>
                    <p className="text-sm text-muted-foreground">E-Mail bei Änderung des Einsatzstatus</p>
                  </div>
                  <Switch 
                    checked={formState.notify_on_status_change}
                    onCheckedChange={(checked) => updateFormState('notify_on_status_change', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Vor Einsatzende erinnern</Label>
                    <p className="text-sm text-muted-foreground">Automatische Erinnerung vor Einsatzende</p>
                  </div>
                  <Switch 
                    checked={formState.notify_before_assignment_end}
                    onCheckedChange={(checked) => updateFormState('notify_before_assignment_end', checked)}
                  />
                </div>
                {formState.notify_before_assignment_end && (
                  <div className="space-y-2">
                    <Label>Erinnerung vor Einsatzende (Tage)</Label>
                    <Input 
                      type="number" 
                      value={formState.assignment_end_reminder_days}
                      onChange={(e) => updateFormState('assignment_end_reminder_days', parseInt(e.target.value) || 0)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Zulagen Tab (NEU) */}
          <TabsContent value="allowances" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Zulagen-Einstellungen</CardTitle>
                <CardDescription>Standard-Zulagen für Auslandseinsätze</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Standard Housing Allowance (€)</Label>
                    <Input 
                      type="number" 
                      value={formState.default_housing_allowance}
                      onChange={(e) => updateFormState('default_housing_allowance', parseInt(e.target.value) || 0)}
                    />
                    <p className="text-xs text-muted-foreground">Monatliche Wohnungszulage</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Standard COLA (%)</Label>
                    <Input 
                      type="number" 
                      value={formState.default_cola_percentage}
                      onChange={(e) => updateFormState('default_cola_percentage', parseInt(e.target.value) || 0)}
                    />
                    <p className="text-xs text-muted-foreground">Cost of Living Adjustment</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="flex items-center gap-2">
                      Bildungszulage
                      <Badge variant="secondary">Erweitert</Badge>
                    </Label>
                    <p className="text-sm text-muted-foreground">Schulgebühren für Kinder übernehmen</p>
                  </div>
                  <Switch 
                    checked={formState.education_allowance_enabled}
                    onCheckedChange={(checked) => updateFormState('education_allowance_enabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab (NEU) */}
          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance-Einstellungen</CardTitle>
                <CardDescription>Rechtliche und regulatorische Anforderungen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sozialversicherungs-Tracking</Label>
                    <p className="text-sm text-muted-foreground">Sozialversicherungspflichten pro Land verfolgen</p>
                  </div>
                  <Switch 
                    checked={formState.social_security_tracking}
                    onCheckedChange={(checked) => updateFormState('social_security_tracking', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="flex items-center gap-2">
                      A1-Bescheinigung erforderlich
                      <Badge variant="outline">EU</Badge>
                    </Label>
                    <p className="text-sm text-muted-foreground">A1-Bescheinigung für EU-Einsätze verpflichtend</p>
                  </div>
                  <Switch 
                    checked={formState.a1_certificate_required}
                    onCheckedChange={(checked) => updateFormState('a1_certificate_required', checked)}
                  />
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Compliance-Status</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Alle erforderlichen Compliance-Einstellungen sind konfiguriert.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Einstellungen speichern
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
