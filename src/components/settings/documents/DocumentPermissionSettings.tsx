
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, Users, Shield, Eye, Edit, Download, Trash2, Upload } from "lucide-react";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { useToast } from "@/hooks/use-toast";

interface PermissionFormState {
  // Basis-Berechtigungen
  default_permission_level: string;
  inherit_folder_permissions: boolean;
  
  // Mitarbeiter-Rechte
  employee_view_own_docs: boolean;
  employee_upload_own_docs: boolean;
  employee_edit_own_docs: boolean;
  employee_delete_own_docs: boolean;
  employee_view_company_docs: boolean;
  employee_download_company_docs: boolean;
  
  // Teamleiter-Rechte
  teamlead_view_team_docs: boolean;
  teamlead_upload_team_docs: boolean;
  teamlead_edit_team_docs: boolean;
  teamlead_delete_team_docs: boolean;
  teamlead_approve_docs: boolean;
  
  // Manager-Rechte
  manager_view_department_docs: boolean;
  manager_upload_department_docs: boolean;
  manager_edit_department_docs: boolean;
  manager_delete_department_docs: boolean;
  manager_manage_permissions: boolean;
  
  // HR-Rechte
  hr_view_all_employee_docs: boolean;
  hr_upload_employee_docs: boolean;
  hr_edit_employee_docs: boolean;
  hr_delete_employee_docs: boolean;
  hr_bulk_operations: boolean;
  hr_sensitive_docs_access: boolean;
  
  // Admin-Rechte
  admin_full_access: boolean;
  admin_manage_all_permissions: boolean;
  admin_view_audit_logs: boolean;
  admin_system_config: boolean;
  
  // Sensible Dokumente
  sensitive_docs_restricted: boolean;
  salary_docs_restriction: string;
  medical_docs_restriction: string;
  performance_docs_restriction: string;
  disciplinary_docs_restriction: string;
  
  // Zugriffskontrolle
  require_2fa_for_sensitive: boolean;
  ip_restriction_enabled: boolean;
  allowed_ip_ranges: string;
  time_based_access: boolean;
  access_start_hour: number;
  access_end_hour: number;
  
  // Download-Kontrolle
  download_logging: boolean;
  download_watermark: boolean;
  download_approval_required: boolean;
  max_downloads_per_day: number;
  
  // Externe Zugriffe
  external_access_enabled: boolean;
  external_require_login: boolean;
  external_expire_after_days: number;
}

const DocumentPermissionSettings = () => {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('documents');
  const { toast } = useToast();
  
  const [formState, setFormState] = useState<PermissionFormState>({
    default_permission_level: 'view',
    inherit_folder_permissions: true,
    employee_view_own_docs: true,
    employee_upload_own_docs: true,
    employee_edit_own_docs: false,
    employee_delete_own_docs: false,
    employee_view_company_docs: true,
    employee_download_company_docs: true,
    teamlead_view_team_docs: true,
    teamlead_upload_team_docs: true,
    teamlead_edit_team_docs: true,
    teamlead_delete_team_docs: false,
    teamlead_approve_docs: true,
    manager_view_department_docs: true,
    manager_upload_department_docs: true,
    manager_edit_department_docs: true,
    manager_delete_department_docs: true,
    manager_manage_permissions: true,
    hr_view_all_employee_docs: true,
    hr_upload_employee_docs: true,
    hr_edit_employee_docs: true,
    hr_delete_employee_docs: true,
    hr_bulk_operations: true,
    hr_sensitive_docs_access: true,
    admin_full_access: true,
    admin_manage_all_permissions: true,
    admin_view_audit_logs: true,
    admin_system_config: true,
    sensitive_docs_restricted: true,
    salary_docs_restriction: 'hr_only',
    medical_docs_restriction: 'hr_only',
    performance_docs_restriction: 'manager_up',
    disciplinary_docs_restriction: 'hr_only',
    require_2fa_for_sensitive: true,
    ip_restriction_enabled: false,
    allowed_ip_ranges: '',
    time_based_access: false,
    access_start_hour: 8,
    access_end_hour: 18,
    download_logging: true,
    download_watermark: false,
    download_approval_required: false,
    max_downloads_per_day: 100,
    external_access_enabled: false,
    external_require_login: true,
    external_expire_after_days: 7,
  });

  useEffect(() => {
    if (settings) {
      setFormState(prev => ({
        ...prev,
        default_permission_level: getValue('default_permission_level', 'view') as string,
        inherit_folder_permissions: getValue('inherit_folder_permissions', true) as boolean,
        employee_view_own_docs: getValue('employee_view_own_docs', true) as boolean,
        employee_upload_own_docs: getValue('employee_upload_own_docs', true) as boolean,
        employee_edit_own_docs: getValue('employee_edit_own_docs', false) as boolean,
        employee_delete_own_docs: getValue('employee_delete_own_docs', false) as boolean,
        employee_view_company_docs: getValue('employee_view_company_docs', true) as boolean,
        employee_download_company_docs: getValue('employee_download_company_docs', true) as boolean,
        teamlead_view_team_docs: getValue('teamlead_view_team_docs', true) as boolean,
        teamlead_upload_team_docs: getValue('teamlead_upload_team_docs', true) as boolean,
        teamlead_edit_team_docs: getValue('teamlead_edit_team_docs', true) as boolean,
        teamlead_delete_team_docs: getValue('teamlead_delete_team_docs', false) as boolean,
        teamlead_approve_docs: getValue('teamlead_approve_docs', true) as boolean,
        manager_view_department_docs: getValue('manager_view_department_docs', true) as boolean,
        manager_upload_department_docs: getValue('manager_upload_department_docs', true) as boolean,
        manager_edit_department_docs: getValue('manager_edit_department_docs', true) as boolean,
        manager_delete_department_docs: getValue('manager_delete_department_docs', true) as boolean,
        manager_manage_permissions: getValue('manager_manage_permissions', true) as boolean,
        hr_view_all_employee_docs: getValue('hr_view_all_employee_docs', true) as boolean,
        hr_upload_employee_docs: getValue('hr_upload_employee_docs', true) as boolean,
        hr_edit_employee_docs: getValue('hr_edit_employee_docs', true) as boolean,
        hr_delete_employee_docs: getValue('hr_delete_employee_docs', true) as boolean,
        hr_bulk_operations: getValue('hr_bulk_operations', true) as boolean,
        hr_sensitive_docs_access: getValue('hr_sensitive_docs_access', true) as boolean,
        admin_full_access: getValue('admin_full_access', true) as boolean,
        admin_manage_all_permissions: getValue('admin_manage_all_permissions', true) as boolean,
        admin_view_audit_logs: getValue('admin_view_audit_logs', true) as boolean,
        admin_system_config: getValue('admin_system_config', true) as boolean,
        sensitive_docs_restricted: getValue('sensitive_docs_restricted', true) as boolean,
        salary_docs_restriction: getValue('salary_docs_restriction', 'hr_only') as string,
        medical_docs_restriction: getValue('medical_docs_restriction', 'hr_only') as string,
        performance_docs_restriction: getValue('performance_docs_restriction', 'manager_up') as string,
        disciplinary_docs_restriction: getValue('disciplinary_docs_restriction', 'hr_only') as string,
        require_2fa_for_sensitive: getValue('require_2fa_for_sensitive', true) as boolean,
        ip_restriction_enabled: getValue('ip_restriction_enabled', false) as boolean,
        allowed_ip_ranges: getValue('allowed_ip_ranges', '') as string,
        time_based_access: getValue('time_based_access', false) as boolean,
        access_start_hour: getValue('access_start_hour', 8) as number,
        access_end_hour: getValue('access_end_hour', 18) as number,
        download_logging: getValue('download_logging', true) as boolean,
        download_watermark: getValue('download_watermark', false) as boolean,
        download_approval_required: getValue('download_approval_required', false) as boolean,
        max_downloads_per_day: getValue('max_downloads_per_day', 100) as number,
        external_access_enabled: getValue('external_access_enabled', false) as boolean,
        external_require_login: getValue('external_require_login', true) as boolean,
        external_expire_after_days: getValue('external_expire_after_days', 7) as number,
      }));
    }
  }, [settings]);

  const handleSave = async () => {
    await saveSettings(formState);
    toast({ title: "Berechtigungs-Einstellungen gespeichert" });
  };

  const updateField = <K extends keyof PermissionFormState>(field: K, value: PermissionFormState[K]) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Basis-Berechtigungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Basis-Berechtigungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Standard-Berechtigungsstufe</Label>
            <Select value={formState.default_permission_level} onValueChange={(v) => updateField('default_permission_level', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Zugriff</SelectItem>
                <SelectItem value="view">Nur Ansehen</SelectItem>
                <SelectItem value="download">Ansehen & Download</SelectItem>
                <SelectItem value="edit">Bearbeiten</SelectItem>
                <SelectItem value="full">Vollzugriff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label>Ordner-Berechtigungen vererben</Label>
            <Switch checked={formState.inherit_folder_permissions} onCheckedChange={(v) => updateField('inherit_folder_permissions', v)} />
          </div>
        </CardContent>
      </Card>

      {/* Mitarbeiter-Rechte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Mitarbeiter-Rechte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <Label>Eigene Dokumente ansehen</Label>
              </div>
              <Switch checked={formState.employee_view_own_docs} onCheckedChange={(v) => updateField('employee_view_own_docs', v)} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <Label>Dokumente hochladen</Label>
              </div>
              <Switch checked={formState.employee_upload_own_docs} onCheckedChange={(v) => updateField('employee_upload_own_docs', v)} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                <Label>Eigene bearbeiten</Label>
              </div>
              <Switch checked={formState.employee_edit_own_docs} onCheckedChange={(v) => updateField('employee_edit_own_docs', v)} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                <Label>Eigene löschen</Label>
              </div>
              <Switch checked={formState.employee_delete_own_docs} onCheckedChange={(v) => updateField('employee_delete_own_docs', v)} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <Label>Firmendokumente ansehen</Label>
              </div>
              <Switch checked={formState.employee_view_company_docs} onCheckedChange={(v) => updateField('employee_view_company_docs', v)} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <Label>Firmendokumente downloaden</Label>
              </div>
              <Switch checked={formState.employee_download_company_docs} onCheckedChange={(v) => updateField('employee_download_company_docs', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teamleiter-Rechte */}
      <Card>
        <CardHeader>
          <CardTitle>Teamleiter-Rechte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label>Team-Dokumente ansehen</Label>
              <Switch checked={formState.teamlead_view_team_docs} onCheckedChange={(v) => updateField('teamlead_view_team_docs', v)} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label>Für Team hochladen</Label>
              <Switch checked={formState.teamlead_upload_team_docs} onCheckedChange={(v) => updateField('teamlead_upload_team_docs', v)} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label>Team-Dokumente bearbeiten</Label>
              <Switch checked={formState.teamlead_edit_team_docs} onCheckedChange={(v) => updateField('teamlead_edit_team_docs', v)} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label>Team-Dokumente löschen</Label>
              <Switch checked={formState.teamlead_delete_team_docs} onCheckedChange={(v) => updateField('teamlead_delete_team_docs', v)} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label>Dokumente genehmigen</Label>
              <Switch checked={formState.teamlead_approve_docs} onCheckedChange={(v) => updateField('teamlead_approve_docs', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sensible Dokumente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sensible Dokumente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Einschränkungen für sensible Dokumente</Label>
            <Switch checked={formState.sensitive_docs_restricted} onCheckedChange={(v) => updateField('sensitive_docs_restricted', v)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Gehaltsunterlagen</Label>
              <Select value={formState.salary_docs_restriction} onValueChange={(v) => updateField('salary_docs_restriction', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner_only">Nur Eigentümer</SelectItem>
                  <SelectItem value="hr_only">Nur HR</SelectItem>
                  <SelectItem value="manager_up">Manager aufwärts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Medizinische Dokumente</Label>
              <Select value={formState.medical_docs_restriction} onValueChange={(v) => updateField('medical_docs_restriction', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner_only">Nur Eigentümer</SelectItem>
                  <SelectItem value="hr_only">Nur HR</SelectItem>
                  <SelectItem value="manager_up">Manager aufwärts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Leistungsbeurteilungen</Label>
              <Select value={formState.performance_docs_restriction} onValueChange={(v) => updateField('performance_docs_restriction', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner_only">Nur Eigentümer</SelectItem>
                  <SelectItem value="hr_only">Nur HR</SelectItem>
                  <SelectItem value="manager_up">Manager aufwärts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Disziplinarische Dokumente</Label>
              <Select value={formState.disciplinary_docs_restriction} onValueChange={(v) => updateField('disciplinary_docs_restriction', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner_only">Nur Eigentümer</SelectItem>
                  <SelectItem value="hr_only">Nur HR</SelectItem>
                  <SelectItem value="manager_up">Manager aufwärts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>2FA für sensible Dokumente erforderlich</Label>
            <Switch checked={formState.require_2fa_for_sensitive} onCheckedChange={(v) => updateField('require_2fa_for_sensitive', v)} />
          </div>
        </CardContent>
      </Card>

      {/* Zugriffskontrolle */}
      <Card>
        <CardHeader>
          <CardTitle>Zugriffskontrolle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>IP-Einschränkung aktivieren</Label>
            <Switch checked={formState.ip_restriction_enabled} onCheckedChange={(v) => updateField('ip_restriction_enabled', v)} />
          </div>
          {formState.ip_restriction_enabled && (
            <div className="space-y-2">
              <Label>Erlaubte IP-Bereiche (kommagetrennt)</Label>
              <Input value={formState.allowed_ip_ranges} onChange={(e) => updateField('allowed_ip_ranges', e.target.value)} placeholder="192.168.1.0/24, 10.0.0.0/8" />
            </div>
          )}
          <div className="flex items-center justify-between">
            <Label>Zeitbasierter Zugriff</Label>
            <Switch checked={formState.time_based_access} onCheckedChange={(v) => updateField('time_based_access', v)} />
          </div>
          {formState.time_based_access && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Startzeit (Stunde)</Label>
                <Input type="number" min={0} max={23} value={formState.access_start_hour} onChange={(e) => updateField('access_start_hour', parseInt(e.target.value) || 8)} />
              </div>
              <div className="space-y-2">
                <Label>Endzeit (Stunde)</Label>
                <Input type="number" min={0} max={23} value={formState.access_end_hour} onChange={(e) => updateField('access_end_hour', parseInt(e.target.value) || 18)} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Download-Kontrolle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download-Kontrolle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Downloads protokollieren</Label>
              <Switch checked={formState.download_logging} onCheckedChange={(v) => updateField('download_logging', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Wasserzeichen bei Download</Label>
              <Switch checked={formState.download_watermark} onCheckedChange={(v) => updateField('download_watermark', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Genehmigung für Download erforderlich</Label>
              <Switch checked={formState.download_approval_required} onCheckedChange={(v) => updateField('download_approval_required', v)} />
            </div>
            <div className="space-y-2">
              <Label>Max. Downloads pro Tag</Label>
              <Input type="number" value={formState.max_downloads_per_day} onChange={(e) => updateField('max_downloads_per_day', parseInt(e.target.value) || 100)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Externe Zugriffe */}
      <Card>
        <CardHeader>
          <CardTitle>Externe Zugriffe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Externe Zugriffe erlauben</Label>
            <Switch checked={formState.external_access_enabled} onCheckedChange={(v) => updateField('external_access_enabled', v)} />
          </div>
          {formState.external_access_enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label>Login erforderlich</Label>
                <Switch checked={formState.external_require_login} onCheckedChange={(v) => updateField('external_require_login', v)} />
              </div>
              <div className="space-y-2">
                <Label>Ablauf nach (Tagen)</Label>
                <Input type="number" value={formState.external_expire_after_days} onChange={(e) => updateField('external_expire_after_days', parseInt(e.target.value) || 7)} />
              </div>
            </div>
          )}
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

export default DocumentPermissionSettings;
