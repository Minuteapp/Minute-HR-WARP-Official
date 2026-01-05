
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Archive, Clock, Trash2, Shield, AlertTriangle, FileCheck } from "lucide-react";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { useToast } from "@/hooks/use-toast";

interface RetentionFormState {
  // Allgemeine Aufbewahrung
  default_retention_years: number;
  auto_archive_enabled: boolean;
  archive_after_days: number;
  
  // Dokumenttyp-spezifische Aufbewahrung
  salary_statements_years: number;
  contracts_years: number;
  sick_notes_years: number;
  certificates_years: number;
  applications_years: number;
  performance_reviews_years: number;
  training_docs_years: number;
  tax_documents_years: number;
  
  // DSGVO-Löschung
  dsgvo_auto_delete: boolean;
  deletion_warning_days: number;
  require_deletion_approval: boolean;
  deletion_documentation: boolean;
  
  // Archivierungsregeln
  archive_format: string;
  compression_enabled: boolean;
  archive_location: string;
  
  // GoBD-Compliance
  gobd_compliance_enabled: boolean;
  tamper_protection: boolean;
  audit_trail_retention_years: number;
  
  // Lösch-Workflow
  deletion_schedule: string;
  notify_before_deletion: boolean;
  notification_days_before: number;
  allow_retention_extension: boolean;
  max_extension_years: number;
  
  // Ausnahmen
  legal_hold_enabled: boolean;
  exclude_active_employees: boolean;
  exclude_pending_litigation: boolean;
}

const DocumentRetentionSettings = () => {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('documents');
  const { toast } = useToast();
  
  const [formState, setFormState] = useState<RetentionFormState>({
    default_retention_years: 10,
    auto_archive_enabled: true,
    archive_after_days: 365,
    salary_statements_years: 10,
    contracts_years: 10,
    sick_notes_years: 5,
    certificates_years: 10,
    applications_years: 6,
    performance_reviews_years: 5,
    training_docs_years: 3,
    tax_documents_years: 10,
    dsgvo_auto_delete: true,
    deletion_warning_days: 30,
    require_deletion_approval: true,
    deletion_documentation: true,
    archive_format: 'pdf_a',
    compression_enabled: true,
    archive_location: 'primary',
    gobd_compliance_enabled: true,
    tamper_protection: true,
    audit_trail_retention_years: 10,
    deletion_schedule: 'monthly',
    notify_before_deletion: true,
    notification_days_before: 30,
    allow_retention_extension: true,
    max_extension_years: 5,
    legal_hold_enabled: true,
    exclude_active_employees: true,
    exclude_pending_litigation: true,
  });

  useEffect(() => {
    if (settings) {
      setFormState(prev => ({
        ...prev,
        default_retention_years: getValue('default_retention_years', 10) as number,
        auto_archive_enabled: getValue('auto_archive_enabled', true) as boolean,
        archive_after_days: getValue('archive_after_days', 365) as number,
        salary_statements_years: getValue('salary_statements_years', 10) as number,
        contracts_years: getValue('contracts_years', 10) as number,
        sick_notes_years: getValue('sick_notes_years', 5) as number,
        certificates_years: getValue('certificates_years', 10) as number,
        applications_years: getValue('applications_years', 6) as number,
        performance_reviews_years: getValue('performance_reviews_years', 5) as number,
        training_docs_years: getValue('training_docs_years', 3) as number,
        tax_documents_years: getValue('tax_documents_years', 10) as number,
        dsgvo_auto_delete: getValue('dsgvo_auto_delete', true) as boolean,
        deletion_warning_days: getValue('deletion_warning_days', 30) as number,
        require_deletion_approval: getValue('require_deletion_approval', true) as boolean,
        deletion_documentation: getValue('deletion_documentation', true) as boolean,
        archive_format: getValue('archive_format', 'pdf_a') as string,
        compression_enabled: getValue('compression_enabled', true) as boolean,
        archive_location: getValue('archive_location', 'primary') as string,
        gobd_compliance_enabled: getValue('gobd_compliance_enabled', true) as boolean,
        tamper_protection: getValue('tamper_protection', true) as boolean,
        audit_trail_retention_years: getValue('audit_trail_retention_years', 10) as number,
        deletion_schedule: getValue('deletion_schedule', 'monthly') as string,
        notify_before_deletion: getValue('notify_before_deletion', true) as boolean,
        notification_days_before: getValue('notification_days_before', 30) as number,
        allow_retention_extension: getValue('allow_retention_extension', true) as boolean,
        max_extension_years: getValue('max_extension_years', 5) as number,
        legal_hold_enabled: getValue('legal_hold_enabled', true) as boolean,
        exclude_active_employees: getValue('exclude_active_employees', true) as boolean,
        exclude_pending_litigation: getValue('exclude_pending_litigation', true) as boolean,
      }));
    }
  }, [settings]);

  const handleSave = async () => {
    await saveSettings(formState);
    toast({ title: "Aufbewahrungseinstellungen gespeichert" });
  };

  const updateField = <K extends keyof RetentionFormState>(field: K, value: RetentionFormState[K]) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Allgemeine Aufbewahrung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Allgemeine Aufbewahrung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Standard-Aufbewahrungsfrist (Jahre)</Label>
              <Input type="number" value={formState.default_retention_years} onChange={(e) => updateField('default_retention_years', parseInt(e.target.value) || 10)} />
            </div>
            <div className="space-y-2">
              <Label>Archivierung nach (Tagen)</Label>
              <Input type="number" value={formState.archive_after_days} onChange={(e) => updateField('archive_after_days', parseInt(e.target.value) || 365)} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Automatische Archivierung aktivieren</Label>
            <Switch checked={formState.auto_archive_enabled} onCheckedChange={(v) => updateField('auto_archive_enabled', v)} />
          </div>
        </CardContent>
      </Card>

      {/* Dokumenttyp-spezifische Aufbewahrung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Aufbewahrungsfristen nach Dokumenttyp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Gehaltsabrechnungen</Label>
              <div className="flex items-center gap-2">
                <Input type="number" value={formState.salary_statements_years} onChange={(e) => updateField('salary_statements_years', parseInt(e.target.value) || 10)} className="w-20" />
                <span className="text-sm text-muted-foreground">Jahre</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Verträge</Label>
              <div className="flex items-center gap-2">
                <Input type="number" value={formState.contracts_years} onChange={(e) => updateField('contracts_years', parseInt(e.target.value) || 10)} className="w-20" />
                <span className="text-sm text-muted-foreground">Jahre</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Krankmeldungen</Label>
              <div className="flex items-center gap-2">
                <Input type="number" value={formState.sick_notes_years} onChange={(e) => updateField('sick_notes_years', parseInt(e.target.value) || 5)} className="w-20" />
                <span className="text-sm text-muted-foreground">Jahre</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Zertifikate</Label>
              <div className="flex items-center gap-2">
                <Input type="number" value={formState.certificates_years} onChange={(e) => updateField('certificates_years', parseInt(e.target.value) || 10)} className="w-20" />
                <span className="text-sm text-muted-foreground">Jahre</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Bewerbungsunterlagen</Label>
              <div className="flex items-center gap-2">
                <Input type="number" value={formState.applications_years} onChange={(e) => updateField('applications_years', parseInt(e.target.value) || 6)} className="w-20" />
                <span className="text-sm text-muted-foreground">Monate</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Leistungsbeurteilungen</Label>
              <div className="flex items-center gap-2">
                <Input type="number" value={formState.performance_reviews_years} onChange={(e) => updateField('performance_reviews_years', parseInt(e.target.value) || 5)} className="w-20" />
                <span className="text-sm text-muted-foreground">Jahre</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Schulungsdokumente</Label>
              <div className="flex items-center gap-2">
                <Input type="number" value={formState.training_docs_years} onChange={(e) => updateField('training_docs_years', parseInt(e.target.value) || 3)} className="w-20" />
                <span className="text-sm text-muted-foreground">Jahre</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Steuerunterlagen</Label>
              <div className="flex items-center gap-2">
                <Input type="number" value={formState.tax_documents_years} onChange={(e) => updateField('tax_documents_years', parseInt(e.target.value) || 10)} className="w-20" />
                <span className="text-sm text-muted-foreground">Jahre</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DSGVO-Löschung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            DSGVO-konforme Löschung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Automatische DSGVO-Löschung</Label>
            <Switch checked={formState.dsgvo_auto_delete} onCheckedChange={(v) => updateField('dsgvo_auto_delete', v)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vorwarnung vor Löschung (Tage)</Label>
              <Input type="number" value={formState.deletion_warning_days} onChange={(e) => updateField('deletion_warning_days', parseInt(e.target.value) || 30)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Genehmigung erforderlich</Label>
              <Switch checked={formState.require_deletion_approval} onCheckedChange={(v) => updateField('require_deletion_approval', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Löschung dokumentieren</Label>
              <Switch checked={formState.deletion_documentation} onCheckedChange={(v) => updateField('deletion_documentation', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Archivierungsregeln */}
      <Card>
        <CardHeader>
          <CardTitle>Archivierungsregeln</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Archivformat</Label>
              <Select value={formState.archive_format} onValueChange={(v) => updateField('archive_format', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf_a">PDF/A (Langzeitarchivierung)</SelectItem>
                  <SelectItem value="original">Original-Format</SelectItem>
                  <SelectItem value="tiff">TIFF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Archiv-Speicherort</Label>
              <Select value={formState.archive_location} onValueChange={(v) => updateField('archive_location', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primärer Speicher</SelectItem>
                  <SelectItem value="cold">Cold Storage</SelectItem>
                  <SelectItem value="external">Externer Archivdienst</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Komprimierung aktivieren</Label>
            <Switch checked={formState.compression_enabled} onCheckedChange={(v) => updateField('compression_enabled', v)} />
          </div>
        </CardContent>
      </Card>

      {/* GoBD-Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            GoBD-Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>GoBD-Compliance aktivieren</Label>
            <Switch checked={formState.gobd_compliance_enabled} onCheckedChange={(v) => updateField('gobd_compliance_enabled', v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Manipulationsschutz</Label>
            <Switch checked={formState.tamper_protection} onCheckedChange={(v) => updateField('tamper_protection', v)} />
          </div>
          <div className="space-y-2">
            <Label>Audit-Trail Aufbewahrung (Jahre)</Label>
            <Input type="number" value={formState.audit_trail_retention_years} onChange={(e) => updateField('audit_trail_retention_years', parseInt(e.target.value) || 10)} />
          </div>
        </CardContent>
      </Card>

      {/* Lösch-Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Lösch-Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Löschzeitplan</Label>
            <Select value={formState.deletion_schedule} onValueChange={(v) => updateField('deletion_schedule', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Täglich</SelectItem>
                <SelectItem value="weekly">Wöchentlich</SelectItem>
                <SelectItem value="monthly">Monatlich</SelectItem>
                <SelectItem value="quarterly">Quartalsweise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Vor Löschung benachrichtigen</Label>
              <Switch checked={formState.notify_before_deletion} onCheckedChange={(v) => updateField('notify_before_deletion', v)} />
            </div>
            <div className="space-y-2">
              <Label>Tage vor Löschung</Label>
              <Input type="number" value={formState.notification_days_before} onChange={(e) => updateField('notification_days_before', parseInt(e.target.value) || 30)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Aufbewahrungsverlängerung erlauben</Label>
              <Switch checked={formState.allow_retention_extension} onCheckedChange={(v) => updateField('allow_retention_extension', v)} />
            </div>
            {formState.allow_retention_extension && (
              <div className="space-y-2">
                <Label>Max. Verlängerung (Jahre)</Label>
                <Input type="number" value={formState.max_extension_years} onChange={(e) => updateField('max_extension_years', parseInt(e.target.value) || 5)} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ausnahmen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Lösch-Ausnahmen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Legal Hold aktivieren</Label>
            <Switch checked={formState.legal_hold_enabled} onCheckedChange={(v) => updateField('legal_hold_enabled', v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Aktive Mitarbeiter ausschließen</Label>
            <Switch checked={formState.exclude_active_employees} onCheckedChange={(v) => updateField('exclude_active_employees', v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Laufende Rechtsstreitigkeiten ausschließen</Label>
            <Switch checked={formState.exclude_pending_litigation} onCheckedChange={(v) => updateField('exclude_pending_litigation', v)} />
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

export default DocumentRetentionSettings;
