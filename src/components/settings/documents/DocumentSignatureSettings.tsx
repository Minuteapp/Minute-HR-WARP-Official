
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PenTool, Shield, Clock, Users, FileCheck, Key } from "lucide-react";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { useToast } from "@/hooks/use-toast";

interface SignatureFormState {
  // Signatur-Optionen
  digital_signatures_enabled: boolean;
  signature_level: string;
  qualified_signatures_enabled: boolean;
  
  // Anbieter
  signature_provider: string;
  provider_api_configured: boolean;
  
  // Signatur-Typen
  allow_drawn_signature: boolean;
  allow_typed_signature: boolean;
  allow_uploaded_signature: boolean;
  allow_biometric_signature: boolean;
  
  // Validierung
  signature_validation_enabled: boolean;
  certificate_validation: boolean;
  timestamp_validation: boolean;
  
  // Workflow
  multi_signature_enabled: boolean;
  sequential_signing: boolean;
  parallel_signing: boolean;
  signature_order_enforced: boolean;
  
  // Benachrichtigungen
  notify_on_signature_request: boolean;
  notify_on_signature_complete: boolean;
  reminder_enabled: boolean;
  reminder_interval_days: number;
  
  // Ablauf
  signature_request_expiry_days: number;
  auto_decline_on_expiry: boolean;
  
  // Audit
  signature_audit_trail: boolean;
  store_signature_evidence: boolean;
  evidence_retention_years: number;
  
  // Berechtigungen
  who_can_request_signatures: string;
  who_can_sign: string;
  external_signers_allowed: boolean;
  
  // Dokumenttypen
  contracts_require_signature: boolean;
  policies_require_signature: boolean;
  forms_require_signature: boolean;
}

const DocumentSignatureSettings = () => {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('documents');
  const { toast } = useToast();
  
  const [formState, setFormState] = useState<SignatureFormState>({
    digital_signatures_enabled: true,
    signature_level: 'advanced',
    qualified_signatures_enabled: false,
    signature_provider: 'internal',
    provider_api_configured: false,
    allow_drawn_signature: true,
    allow_typed_signature: true,
    allow_uploaded_signature: true,
    allow_biometric_signature: false,
    signature_validation_enabled: true,
    certificate_validation: true,
    timestamp_validation: true,
    multi_signature_enabled: true,
    sequential_signing: true,
    parallel_signing: true,
    signature_order_enforced: false,
    notify_on_signature_request: true,
    notify_on_signature_complete: true,
    reminder_enabled: true,
    reminder_interval_days: 3,
    signature_request_expiry_days: 14,
    auto_decline_on_expiry: true,
    signature_audit_trail: true,
    store_signature_evidence: true,
    evidence_retention_years: 10,
    who_can_request_signatures: 'managers',
    who_can_sign: 'all',
    external_signers_allowed: true,
    contracts_require_signature: true,
    policies_require_signature: true,
    forms_require_signature: false,
  });

  useEffect(() => {
    if (settings) {
      setFormState(prev => ({
        ...prev,
        digital_signatures_enabled: getValue('digital_signatures_enabled', true) as boolean,
        signature_level: getValue('signature_level', 'advanced') as string,
        qualified_signatures_enabled: getValue('qualified_signatures_enabled', false) as boolean,
        signature_provider: getValue('signature_provider', 'internal') as string,
        provider_api_configured: getValue('provider_api_configured', false) as boolean,
        allow_drawn_signature: getValue('allow_drawn_signature', true) as boolean,
        allow_typed_signature: getValue('allow_typed_signature', true) as boolean,
        allow_uploaded_signature: getValue('allow_uploaded_signature', true) as boolean,
        allow_biometric_signature: getValue('allow_biometric_signature', false) as boolean,
        signature_validation_enabled: getValue('signature_validation_enabled', true) as boolean,
        certificate_validation: getValue('certificate_validation', true) as boolean,
        timestamp_validation: getValue('timestamp_validation', true) as boolean,
        multi_signature_enabled: getValue('multi_signature_enabled', true) as boolean,
        sequential_signing: getValue('sequential_signing', true) as boolean,
        parallel_signing: getValue('parallel_signing', true) as boolean,
        signature_order_enforced: getValue('signature_order_enforced', false) as boolean,
        notify_on_signature_request: getValue('notify_on_signature_request', true) as boolean,
        notify_on_signature_complete: getValue('notify_on_signature_complete', true) as boolean,
        reminder_enabled: getValue('reminder_enabled', true) as boolean,
        reminder_interval_days: getValue('reminder_interval_days', 3) as number,
        signature_request_expiry_days: getValue('signature_request_expiry_days', 14) as number,
        auto_decline_on_expiry: getValue('auto_decline_on_expiry', true) as boolean,
        signature_audit_trail: getValue('signature_audit_trail', true) as boolean,
        store_signature_evidence: getValue('store_signature_evidence', true) as boolean,
        evidence_retention_years: getValue('evidence_retention_years', 10) as number,
        who_can_request_signatures: getValue('who_can_request_signatures', 'managers') as string,
        who_can_sign: getValue('who_can_sign', 'all') as string,
        external_signers_allowed: getValue('external_signers_allowed', true) as boolean,
        contracts_require_signature: getValue('contracts_require_signature', true) as boolean,
        policies_require_signature: getValue('policies_require_signature', true) as boolean,
        forms_require_signature: getValue('forms_require_signature', false) as boolean,
      }));
    }
  }, [settings]);

  const handleSave = async () => {
    await saveSettings(formState);
    toast({ title: "Signatur-Einstellungen gespeichert" });
  };

  const updateField = <K extends keyof SignatureFormState>(field: K, value: SignatureFormState[K]) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Signatur-Optionen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Digitale Signaturen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Digitale Signaturen aktivieren</Label>
            <Switch checked={formState.digital_signatures_enabled} onCheckedChange={(v) => updateField('digital_signatures_enabled', v)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Signatur-Level</Label>
              <Select value={formState.signature_level} onValueChange={(v) => updateField('signature_level', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Einfach</SelectItem>
                  <SelectItem value="advanced">Fortgeschritten (AdES)</SelectItem>
                  <SelectItem value="qualified">Qualifiziert (QES)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Signatur-Anbieter</Label>
              <Select value={formState.signature_provider} onValueChange={(v) => updateField('signature_provider', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Intern</SelectItem>
                  <SelectItem value="docusign">DocuSign</SelectItem>
                  <SelectItem value="adobe_sign">Adobe Sign</SelectItem>
                  <SelectItem value="swisscom">Swisscom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Qualifizierte Signaturen (QES) aktivieren</Label>
            <Switch checked={formState.qualified_signatures_enabled} onCheckedChange={(v) => updateField('qualified_signatures_enabled', v)} />
          </div>
        </CardContent>
      </Card>

      {/* Signatur-Typen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Signatur-Typen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label>Gezeichnete Signatur</Label>
              <Switch checked={formState.allow_drawn_signature} onCheckedChange={(v) => updateField('allow_drawn_signature', v)} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label>Getippte Signatur</Label>
              <Switch checked={formState.allow_typed_signature} onCheckedChange={(v) => updateField('allow_typed_signature', v)} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label>Hochgeladene Signatur</Label>
              <Switch checked={formState.allow_uploaded_signature} onCheckedChange={(v) => updateField('allow_uploaded_signature', v)} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label>Biometrische Signatur</Label>
              <Switch checked={formState.allow_biometric_signature} onCheckedChange={(v) => updateField('allow_biometric_signature', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validierung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Validierung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Signatur-Validierung aktivieren</Label>
            <Switch checked={formState.signature_validation_enabled} onCheckedChange={(v) => updateField('signature_validation_enabled', v)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Zertifikat-Validierung</Label>
              <Switch checked={formState.certificate_validation} onCheckedChange={(v) => updateField('certificate_validation', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Zeitstempel-Validierung</Label>
              <Switch checked={formState.timestamp_validation} onCheckedChange={(v) => updateField('timestamp_validation', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Signatur-Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Mehrfach-Signaturen aktivieren</Label>
            <Switch checked={formState.multi_signature_enabled} onCheckedChange={(v) => updateField('multi_signature_enabled', v)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Sequenzielles Signieren</Label>
              <Switch checked={formState.sequential_signing} onCheckedChange={(v) => updateField('sequential_signing', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Paralleles Signieren</Label>
              <Switch checked={formState.parallel_signing} onCheckedChange={(v) => updateField('parallel_signing', v)} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Signatur-Reihenfolge erzwingen</Label>
            <Switch checked={formState.signature_order_enforced} onCheckedChange={(v) => updateField('signature_order_enforced', v)} />
          </div>
        </CardContent>
      </Card>

      {/* Benachrichtigungen & Ablauf */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Benachrichtigungen & Ablauf
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Bei Signatur-Anfrage benachrichtigen</Label>
              <Switch checked={formState.notify_on_signature_request} onCheckedChange={(v) => updateField('notify_on_signature_request', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Bei Abschluss benachrichtigen</Label>
              <Switch checked={formState.notify_on_signature_complete} onCheckedChange={(v) => updateField('notify_on_signature_complete', v)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Erinnerungen aktivieren</Label>
              <Switch checked={formState.reminder_enabled} onCheckedChange={(v) => updateField('reminder_enabled', v)} />
            </div>
            <div className="space-y-2">
              <Label>Erinnerungsintervall (Tage)</Label>
              <Input type="number" value={formState.reminder_interval_days} onChange={(e) => updateField('reminder_interval_days', parseInt(e.target.value) || 3)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ablauf Signatur-Anfrage (Tage)</Label>
              <Input type="number" value={formState.signature_request_expiry_days} onChange={(e) => updateField('signature_request_expiry_days', parseInt(e.target.value) || 14)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Bei Ablauf automatisch ablehnen</Label>
              <Switch checked={formState.auto_decline_on_expiry} onCheckedChange={(v) => updateField('auto_decline_on_expiry', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Audit & Nachweis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Signatur-Audit-Trail</Label>
              <Switch checked={formState.signature_audit_trail} onCheckedChange={(v) => updateField('signature_audit_trail', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Signatur-Nachweis speichern</Label>
              <Switch checked={formState.store_signature_evidence} onCheckedChange={(v) => updateField('store_signature_evidence', v)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Nachweis-Aufbewahrung (Jahre)</Label>
            <Input type="number" value={formState.evidence_retention_years} onChange={(e) => updateField('evidence_retention_years', parseInt(e.target.value) || 10)} />
          </div>
        </CardContent>
      </Card>

      {/* Berechtigungen */}
      <Card>
        <CardHeader>
          <CardTitle>Berechtigungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Wer kann Signaturen anfordern?</Label>
              <Select value={formState.who_can_request_signatures} onValueChange={(v) => updateField('who_can_request_signatures', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Mitarbeiter</SelectItem>
                  <SelectItem value="managers">Nur Manager</SelectItem>
                  <SelectItem value="hr">Nur HR</SelectItem>
                  <SelectItem value="admins">Nur Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Wer kann signieren?</Label>
              <Select value={formState.who_can_sign} onValueChange={(v) => updateField('who_can_sign', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Mitarbeiter</SelectItem>
                  <SelectItem value="verified">Nur verifizierte Benutzer</SelectItem>
                  <SelectItem value="managers">Nur Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Externe Unterzeichner erlauben</Label>
            <Switch checked={formState.external_signers_allowed} onCheckedChange={(v) => updateField('external_signers_allowed', v)} />
          </div>
        </CardContent>
      </Card>

      {/* Dokumenttypen */}
      <Card>
        <CardHeader>
          <CardTitle>Signatur-Pflicht nach Dokumenttyp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label>Verträge</Label>
              <Switch checked={formState.contracts_require_signature} onCheckedChange={(v) => updateField('contracts_require_signature', v)} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label>Richtlinien</Label>
              <Switch checked={formState.policies_require_signature} onCheckedChange={(v) => updateField('policies_require_signature', v)} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label>Formulare</Label>
              <Switch checked={formState.forms_require_signature} onCheckedChange={(v) => updateField('forms_require_signature', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Speichern..." : "Einstellungen speichern"}
        </Button>
      </div>
    </div>
  );
};

export default DocumentSignatureSettings;
