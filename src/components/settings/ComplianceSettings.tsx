import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, FileCheck, AlertTriangle, Scale, Eye, Lock, Loader2 } from "lucide-react";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { toast } from "@/hooks/use-toast";

const ComplianceSettings = () => {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('compliance');
  const [isSaving, setIsSaving] = useState(false);
  
  const [formState, setFormState] = useState({
    // GDPR Settings
    gdpr_data_minimization: true,
    gdpr_purpose_limitation: true,
    gdpr_data_portability: true,
    gdpr_right_to_erasure: true,
    gdpr_dpo_required: true,
    gdpr_dpia_threshold: 'medium',
    // Audit Settings
    audit_log_enabled: true,
    audit_retention_days: 365,
    audit_include_read_access: false,
    audit_include_exports: true,
    audit_include_logins: true,
    audit_tamper_protection: true,
    // Consent Settings
    consent_management: true,
    consent_double_opt_in: true,
    consent_renewal_months: 12,
    consent_granular_options: true,
    consent_withdrawal_easy: true,
    // Data Protection
    data_retention_years: 10,
    data_anonymization_enabled: true,
    data_pseudonymization_enabled: true,
    data_export_allowed: true,
    data_encryption_at_rest: true,
    data_encryption_in_transit: true,
    // Whistleblower
    whistleblower_channel: false,
    whistleblower_anonymous_only: true,
    whistleblower_response_days: 7,
    whistleblower_investigation_days: 90,
    // Policy & Risk
    policy_acknowledgment: true,
    risk_assessment_interval_months: 6,
    risk_auto_assessment: true,
    risk_notification_threshold: 'medium',
  });

  useEffect(() => {
    if (settings && Array.isArray(settings) && settings.length > 0) {
      setFormState({
        gdpr_data_minimization: getValue('gdpr_data_minimization', true),
        gdpr_purpose_limitation: getValue('gdpr_purpose_limitation', true),
        gdpr_data_portability: getValue('gdpr_data_portability', true),
        gdpr_right_to_erasure: getValue('gdpr_right_to_erasure', true),
        gdpr_dpo_required: getValue('gdpr_dpo_required', true),
        gdpr_dpia_threshold: getValue('gdpr_dpia_threshold', 'medium'),
        audit_log_enabled: getValue('audit_log_enabled', true),
        audit_retention_days: getValue('audit_retention_days', 365),
        audit_include_read_access: getValue('audit_include_read_access', false),
        audit_include_exports: getValue('audit_include_exports', true),
        audit_include_logins: getValue('audit_include_logins', true),
        audit_tamper_protection: getValue('audit_tamper_protection', true),
        consent_management: getValue('consent_management', true),
        consent_double_opt_in: getValue('consent_double_opt_in', true),
        consent_renewal_months: getValue('consent_renewal_months', 12),
        consent_granular_options: getValue('consent_granular_options', true),
        consent_withdrawal_easy: getValue('consent_withdrawal_easy', true),
        data_retention_years: getValue('data_retention_years', 10),
        data_anonymization_enabled: getValue('data_anonymization_enabled', true),
        data_pseudonymization_enabled: getValue('data_pseudonymization_enabled', true),
        data_export_allowed: getValue('data_export_allowed', true),
        data_encryption_at_rest: getValue('data_encryption_at_rest', true),
        data_encryption_in_transit: getValue('data_encryption_in_transit', true),
        whistleblower_channel: getValue('whistleblower_channel', false),
        whistleblower_anonymous_only: getValue('whistleblower_anonymous_only', true),
        whistleblower_response_days: getValue('whistleblower_response_days', 7),
        whistleblower_investigation_days: getValue('whistleblower_investigation_days', 90),
        policy_acknowledgment: getValue('policy_acknowledgment', true),
        risk_assessment_interval_months: getValue('risk_assessment_interval_months', 6),
        risk_auto_assessment: getValue('risk_auto_assessment', true),
        risk_notification_threshold: getValue('risk_notification_threshold', 'medium'),
      });
    }
  }, [settings, getValue]);

  const handleToggle = (key: string, value: boolean) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const handleInputChange = (key: string, value: string | number) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings(formState);
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Compliance-Einstellungen wurden erfolgreich gespeichert.",
      });
    } catch (error) {
      toast({
        title: "Fehler beim Speichern",
        description: "Die Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid grid-cols-5 mb-6">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Übersicht
        </TabsTrigger>
        <TabsTrigger value="gdpr" className="flex items-center gap-2">
          <Scale className="h-4 w-4" />
          DSGVO
        </TabsTrigger>
        <TabsTrigger value="audit" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Audit
        </TabsTrigger>
        <TabsTrigger value="data" className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Datenschutz
        </TabsTrigger>
        <TabsTrigger value="whistleblower" className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Hinweisgeber
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Compliance-Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Hier werden die wichtigsten Compliance-Metriken und -Status angezeigt.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                <div className="text-sm text-muted-foreground">DSGVO-Status</div>
                <div className="text-xl font-semibold text-green-600">Konform</div>
              </div>
              <div className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950/20">
                <div className="text-sm text-muted-foreground">Arbeitsschutz</div>
                <div className="text-xl font-semibold text-yellow-600">Ausstehend</div>
              </div>
              <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
                <div className="text-sm text-muted-foreground">ISO 27001</div>
                <div className="text-xl font-semibold text-blue-600">In Prüfung</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Allgemeine Compliance-Einstellungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Richtlinien-Bestätigung</Label>
                <p className="text-sm text-muted-foreground">Mitarbeiter müssen Richtlinien bestätigen</p>
              </div>
              <Switch 
                checked={formState.policy_acknowledgment}
                onCheckedChange={(v) => handleToggle('policy_acknowledgment', v)}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="gdpr" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              DSGVO-Einstellungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Datenminimierung</Label>
                <p className="text-sm text-muted-foreground">Datenminimierungsprinzipien durchsetzen</p>
              </div>
              <Switch 
                checked={formState.gdpr_data_minimization}
                onCheckedChange={(v) => handleToggle('gdpr_data_minimization', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Zweckbindung</Label>
                <p className="text-sm text-muted-foreground">Zweckbindung durchsetzen</p>
              </div>
              <Switch 
                checked={formState.gdpr_purpose_limitation}
                onCheckedChange={(v) => handleToggle('gdpr_purpose_limitation', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Datenportabilität</Label>
                <p className="text-sm text-muted-foreground">Datenportabilitätsanfragen ermöglichen</p>
              </div>
              <Switch 
                checked={formState.gdpr_data_portability}
                onCheckedChange={(v) => handleToggle('gdpr_data_portability', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Recht auf Löschung</Label>
                <p className="text-sm text-muted-foreground">Löschanfragen ermöglichen</p>
              </div>
              <Switch 
                checked={formState.gdpr_right_to_erasure}
                onCheckedChange={(v) => handleToggle('gdpr_right_to_erasure', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Datenschutzbeauftragter erforderlich</Label>
                <p className="text-sm text-muted-foreground">DSB-Pflicht aktivieren</p>
              </div>
              <Switch 
                checked={formState.gdpr_dpo_required}
                onCheckedChange={(v) => handleToggle('gdpr_dpo_required', v)}
              />
            </div>
            <div className="space-y-2">
              <Label>DSFA-Schwellenwert</Label>
              <Select 
                value={formState.gdpr_dpia_threshold}
                onValueChange={(v) => handleInputChange('gdpr_dpia_threshold', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Risikoschwelle wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niedrig</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Einwilligungsverwaltung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Einwilligungsverwaltung aktiviert</Label>
                <p className="text-sm text-muted-foreground">Zentrale Verwaltung von Einwilligungen</p>
              </div>
              <Switch 
                checked={formState.consent_management}
                onCheckedChange={(v) => handleToggle('consent_management', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Double-Opt-In erforderlich</Label>
                <p className="text-sm text-muted-foreground">Bestätigung per E-Mail erforderlich</p>
              </div>
              <Switch 
                checked={formState.consent_double_opt_in}
                onCheckedChange={(v) => handleToggle('consent_double_opt_in', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Granulare Einwilligung</Label>
                <p className="text-sm text-muted-foreground">Detaillierte Einwilligungsoptionen</p>
              </div>
              <Switch 
                checked={formState.consent_granular_options}
                onCheckedChange={(v) => handleToggle('consent_granular_options', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Einfacher Widerruf</Label>
                <p className="text-sm text-muted-foreground">Einfachen Einwilligungswiderruf ermöglichen</p>
              </div>
              <Switch 
                checked={formState.consent_withdrawal_easy}
                onCheckedChange={(v) => handleToggle('consent_withdrawal_easy', v)}
              />
            </div>
            <div className="space-y-2">
              <Label>Einwilligungs-Erneuerung (Monate)</Label>
              <Input 
                type="number" 
                value={formState.consent_renewal_months}
                onChange={(e) => handleInputChange('consent_renewal_months', parseInt(e.target.value) || 12)}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="audit" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Audit-Log Konfiguration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Audit-Log aktiviert</Label>
                <p className="text-sm text-muted-foreground">Zentrale Protokollierung aktivieren</p>
              </div>
              <Switch 
                checked={formState.audit_log_enabled}
                onCheckedChange={(v) => handleToggle('audit_log_enabled', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Lesezugriffe protokollieren</Label>
                <p className="text-sm text-muted-foreground">Auch Lesezugriffe aufzeichnen</p>
              </div>
              <Switch 
                checked={formState.audit_include_read_access}
                onCheckedChange={(v) => handleToggle('audit_include_read_access', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Exporte protokollieren</Label>
                <p className="text-sm text-muted-foreground">Datenexporte aufzeichnen</p>
              </div>
              <Switch 
                checked={formState.audit_include_exports}
                onCheckedChange={(v) => handleToggle('audit_include_exports', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Anmeldungen protokollieren</Label>
                <p className="text-sm text-muted-foreground">Login-Versuche aufzeichnen</p>
              </div>
              <Switch 
                checked={formState.audit_include_logins}
                onCheckedChange={(v) => handleToggle('audit_include_logins', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Manipulationsschutz</Label>
                <p className="text-sm text-muted-foreground">Audit-Log Manipulationsschutz aktivieren</p>
              </div>
              <Switch 
                checked={formState.audit_tamper_protection}
                onCheckedChange={(v) => handleToggle('audit_tamper_protection', v)}
              />
            </div>
            <div className="space-y-2">
              <Label>Aufbewahrungsdauer (Tage)</Label>
              <Input 
                type="number" 
                value={formState.audit_retention_days}
                onChange={(e) => handleInputChange('audit_retention_days', parseInt(e.target.value) || 365)}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="data" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Datenschutz-Einstellungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Anonymisierung aktiviert</Label>
                <p className="text-sm text-muted-foreground">Datenanonymisierung aktivieren</p>
              </div>
              <Switch 
                checked={formState.data_anonymization_enabled}
                onCheckedChange={(v) => handleToggle('data_anonymization_enabled', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Pseudonymisierung aktiviert</Label>
                <p className="text-sm text-muted-foreground">Datenpseudonymisierung aktivieren</p>
              </div>
              <Switch 
                checked={formState.data_pseudonymization_enabled}
                onCheckedChange={(v) => handleToggle('data_pseudonymization_enabled', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Datenexport erlaubt</Label>
                <p className="text-sm text-muted-foreground">Datenexportanfragen erlauben</p>
              </div>
              <Switch 
                checked={formState.data_export_allowed}
                onCheckedChange={(v) => handleToggle('data_export_allowed', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Verschlüsselung at Rest</Label>
                <p className="text-sm text-muted-foreground">Daten im Ruhezustand verschlüsseln</p>
              </div>
              <Switch 
                checked={formState.data_encryption_at_rest}
                onCheckedChange={(v) => handleToggle('data_encryption_at_rest', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Verschlüsselung in Transit</Label>
                <p className="text-sm text-muted-foreground">Daten bei Übertragung verschlüsseln</p>
              </div>
              <Switch 
                checked={formState.data_encryption_in_transit}
                onCheckedChange={(v) => handleToggle('data_encryption_in_transit', v)}
              />
            </div>
            <div className="space-y-2">
              <Label>Aufbewahrungsdauer (Jahre)</Label>
              <Input 
                type="number" 
                value={formState.data_retention_years}
                onChange={(e) => handleInputChange('data_retention_years', parseInt(e.target.value) || 10)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risikobewertung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Automatische Risikobewertung</Label>
                <p className="text-sm text-muted-foreground">Regelmäßige automatische Bewertung</p>
              </div>
              <Switch 
                checked={formState.risk_auto_assessment}
                onCheckedChange={(v) => handleToggle('risk_auto_assessment', v)}
              />
            </div>
            <div className="space-y-2">
              <Label>Bewertungsintervall (Monate)</Label>
              <Input 
                type="number" 
                value={formState.risk_assessment_interval_months}
                onChange={(e) => handleInputChange('risk_assessment_interval_months', parseInt(e.target.value) || 6)}
              />
            </div>
            <div className="space-y-2">
              <Label>Benachrichtigungsschwelle</Label>
              <Select 
                value={formState.risk_notification_threshold}
                onValueChange={(v) => handleInputChange('risk_notification_threshold', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Schwellenwert wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niedrig</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                  <SelectItem value="critical">Kritisch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="whistleblower" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Hinweisgeberschutz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Hinweisgeberkanal aktiviert</Label>
                <p className="text-sm text-muted-foreground">Interner Meldekanal aktivieren</p>
              </div>
              <Switch 
                checked={formState.whistleblower_channel}
                onCheckedChange={(v) => handleToggle('whistleblower_channel', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Nur anonyme Meldungen</Label>
                <p className="text-sm text-muted-foreground">Nur anonyme Meldungen erlauben</p>
              </div>
              <Switch 
                checked={formState.whistleblower_anonymous_only}
                onCheckedChange={(v) => handleToggle('whistleblower_anonymous_only', v)}
              />
            </div>
            <div className="space-y-2">
              <Label>Antwortfrist (Tage)</Label>
              <Input 
                type="number" 
                value={formState.whistleblower_response_days}
                onChange={(e) => handleInputChange('whistleblower_response_days', parseInt(e.target.value) || 7)}
              />
            </div>
            <div className="space-y-2">
              <Label>Untersuchungsfrist (Tage)</Label>
              <Input 
                type="number" 
                value={formState.whistleblower_investigation_days}
                onChange={(e) => handleInputChange('whistleblower_investigation_days', parseInt(e.target.value) || 90)}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Einstellungen speichern
        </Button>
      </div>
    </Tabs>
  );
};

export default ComplianceSettings;
