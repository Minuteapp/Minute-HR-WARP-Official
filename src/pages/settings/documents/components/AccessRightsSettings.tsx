import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserCheck, Shield, User, Crown, Lock, Save } from "lucide-react";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { toast } from "@/hooks/use-toast";

interface FormState {
  // Mitarbeiter
  employee_access_own_docs: boolean;
  employee_upload_own_docs: boolean;
  employee_read_company_docs: boolean;
  employee_edit_docs: boolean;
  // Teamleiter
  teamlead_view_team_docs: boolean;
  teamlead_approve_docs: boolean;
  teamlead_upload_for_team: boolean;
  teamlead_expiry_warnings: boolean;
  // Manager
  manager_manage_department_docs: boolean;
  manager_view_performance_reports: boolean;
  manager_view_budget_docs: boolean;
  manager_compliance_monitoring: boolean;
  // HR-Manager
  hr_all_employee_docs: boolean;
  hr_workflow_config: boolean;
  hr_bulk_operations: boolean;
  hr_sensitive_data: boolean;
  // Admin
  admin_full_access: boolean;
  admin_manage_permissions: boolean;
  admin_system_config: boolean;
  admin_audit_compliance: boolean;
  // Feingranular
  read_permission: string;
  edit_permission: string;
  upload_permission: string;
  delete_permission: string;
  // Filter
  department_filter: string;
  location_filter: string;
  project_filter: string;
  confidentiality_filter: string;
}

export default function AccessRightsSettings() {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('documents');
  
  const [formState, setFormState] = useState<FormState>({
    employee_access_own_docs: true,
    employee_upload_own_docs: true,
    employee_read_company_docs: true,
    employee_edit_docs: false,
    teamlead_view_team_docs: true,
    teamlead_approve_docs: true,
    teamlead_upload_for_team: false,
    teamlead_expiry_warnings: true,
    manager_manage_department_docs: true,
    manager_view_performance_reports: true,
    manager_view_budget_docs: false,
    manager_compliance_monitoring: true,
    hr_all_employee_docs: true,
    hr_workflow_config: true,
    hr_bulk_operations: true,
    hr_sensitive_data: true,
    admin_full_access: true,
    admin_manage_permissions: true,
    admin_system_config: true,
    admin_audit_compliance: true,
    read_permission: 'own',
    edit_permission: 'own',
    upload_permission: 'own',
    delete_permission: 'none',
    department_filter: 'all',
    location_filter: 'all',
    project_filter: 'all',
    confidentiality_filter: 'internal',
  });

  useEffect(() => {
    if (settings) {
      setFormState({
        employee_access_own_docs: getValue('access_employee_access_own_docs', true) as boolean,
        employee_upload_own_docs: getValue('access_employee_upload_own_docs', true) as boolean,
        employee_read_company_docs: getValue('access_employee_read_company_docs', true) as boolean,
        employee_edit_docs: getValue('access_employee_edit_docs', false) as boolean,
        teamlead_view_team_docs: getValue('access_teamlead_view_team_docs', true) as boolean,
        teamlead_approve_docs: getValue('access_teamlead_approve_docs', true) as boolean,
        teamlead_upload_for_team: getValue('access_teamlead_upload_for_team', false) as boolean,
        teamlead_expiry_warnings: getValue('access_teamlead_expiry_warnings', true) as boolean,
        manager_manage_department_docs: getValue('access_manager_manage_department_docs', true) as boolean,
        manager_view_performance_reports: getValue('access_manager_view_performance_reports', true) as boolean,
        manager_view_budget_docs: getValue('access_manager_view_budget_docs', false) as boolean,
        manager_compliance_monitoring: getValue('access_manager_compliance_monitoring', true) as boolean,
        hr_all_employee_docs: getValue('access_hr_all_employee_docs', true) as boolean,
        hr_workflow_config: getValue('access_hr_workflow_config', true) as boolean,
        hr_bulk_operations: getValue('access_hr_bulk_operations', true) as boolean,
        hr_sensitive_data: getValue('access_hr_sensitive_data', true) as boolean,
        admin_full_access: getValue('access_admin_full_access', true) as boolean,
        admin_manage_permissions: getValue('access_admin_manage_permissions', true) as boolean,
        admin_system_config: getValue('access_admin_system_config', true) as boolean,
        admin_audit_compliance: getValue('access_admin_audit_compliance', true) as boolean,
        read_permission: getValue('access_read_permission', 'own') as string,
        edit_permission: getValue('access_edit_permission', 'own') as string,
        upload_permission: getValue('access_upload_permission', 'own') as string,
        delete_permission: getValue('access_delete_permission', 'none') as string,
        department_filter: getValue('access_department_filter', 'all') as string,
        location_filter: getValue('access_location_filter', 'all') as string,
        project_filter: getValue('access_project_filter', 'all') as string,
        confidentiality_filter: getValue('access_confidentiality_filter', 'internal') as string,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    const settingsToSave = Object.entries(formState).reduce((acc, [key, value]) => {
      acc[`access_${key}`] = value;
      return acc;
    }, {} as Record<string, any>);
    
    await saveSettings(settingsToSave);
    toast({ title: "Zugriffsrechte gespeichert" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Mitarbeiter
            <Badge variant="secondary">Basis-Zugriff</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Zugriff auf eigene Dokumente</Label>
                <p className="text-sm text-muted-foreground">Verträge, Lohnzettel, persönliche Zertifikate</p>
              </div>
              <Switch 
                checked={formState.employee_access_own_docs}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, employee_access_own_docs: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Upload eigener Dokumente</Label>
                <p className="text-sm text-muted-foreground">Krankmeldungen, Zeugnisse, Weiterbildungsnachweise</p>
              </div>
              <Switch 
                checked={formState.employee_upload_own_docs}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, employee_upload_own_docs: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Unternehmensdokumente lesen</Label>
                <p className="text-sm text-muted-foreground">Öffentliche Policies und Handbücher</p>
              </div>
              <Switch 
                checked={formState.employee_read_company_docs}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, employee_read_company_docs: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Dokumente bearbeiten</Label>
                <p className="text-sm text-muted-foreground">Nur eigene Dokumente im Entwurfsstatus</p>
              </div>
              <Switch 
                checked={formState.employee_edit_docs}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, employee_edit_docs: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Teamleiter
            <Badge variant="outline">Team-Berechtigung</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Team-relevante Dokumente einsehen</Label>
                <p className="text-sm text-muted-foreground">Zertifikate, Qualifikationen des Teams</p>
              </div>
              <Switch 
                checked={formState.teamlead_view_team_docs}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, teamlead_view_team_docs: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Dokumente genehmigen</Label>
                <p className="text-sm text-muted-foreground">Workflow-Freigaben für Teamdokumente</p>
              </div>
              <Switch 
                checked={formState.teamlead_approve_docs}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, teamlead_approve_docs: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Upload für Team</Label>
                <p className="text-sm text-muted-foreground">Dokumente für Teammitglieder hochladen</p>
              </div>
              <Switch 
                checked={formState.teamlead_upload_for_team}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, teamlead_upload_for_team: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Ablaufwarnung verwalten</Label>
                <p className="text-sm text-muted-foreground">Benachrichtigungen bei ablaufenden Zertifikaten</p>
              </div>
              <Switch 
                checked={formState.teamlead_expiry_warnings}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, teamlead_expiry_warnings: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Manager
            <Badge variant="outline">Abteilungs-Berechtigung</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Abteilungsdokumente verwalten</Label>
                <p className="text-sm text-muted-foreground">Vollzugriff auf alle Abteilungsdokumente</p>
              </div>
              <Switch 
                checked={formState.manager_manage_department_docs}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, manager_manage_department_docs: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Performance-Reports einsehen</Label>
                <p className="text-sm text-muted-foreground">Leistungsbeurteilungen und Entwicklungspläne</p>
              </div>
              <Switch 
                checked={formState.manager_view_performance_reports}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, manager_view_performance_reports: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Budget & Kostenstellen-Docs</Label>
                <p className="text-sm text-muted-foreground">Finanzrelevante Abteilungsdokumente</p>
              </div>
              <Switch 
                checked={formState.manager_view_budget_docs}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, manager_view_budget_docs: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Compliance-Überwachung</Label>
                <p className="text-sm text-muted-foreground">Zugriff auf Audit-Dokumente der Abteilung</p>
              </div>
              <Switch 
                checked={formState.manager_compliance_monitoring}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, manager_compliance_monitoring: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            HR Manager
            <Badge variant="destructive">HR-Vollzugriff</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Alle Mitarbeiterdokumente</Label>
                <p className="text-sm text-muted-foreground">Uneingeschränkter Zugriff auf Personaldokumente</p>
              </div>
              <Switch 
                checked={formState.hr_all_employee_docs}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, hr_all_employee_docs: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Workflow-Konfiguration</Label>
                <p className="text-sm text-muted-foreground">Genehmigungsprozesse und Freigaben definieren</p>
              </div>
              <Switch 
                checked={formState.hr_workflow_config}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, hr_workflow_config: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Massenoperationen</Label>
                <p className="text-sm text-muted-foreground">Bulk-Upload und -bearbeitung von Dokumenten</p>
              </div>
              <Switch 
                checked={formState.hr_bulk_operations}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, hr_bulk_operations: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Sensible Daten verwalten</Label>
                <p className="text-sm text-muted-foreground">Gehaltsabrechnungen, Krankmeldungen, Disziplinarmaßnahmen</p>
              </div>
              <Switch 
                checked={formState.hr_sensitive_data}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, hr_sensitive_data: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Admin
            <Badge variant="destructive">System-Administrator</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Vollzugriff auf alle Dokumente</Label>
                <p className="text-sm text-muted-foreground">Uneingeschränkter System-Zugriff</p>
              </div>
              <Switch 
                checked={formState.admin_full_access}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, admin_full_access: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Berechtigungen verwalten</Label>
                <p className="text-sm text-muted-foreground">Rollenbasierte Zugriffsrechte konfigurieren</p>
              </div>
              <Switch 
                checked={formState.admin_manage_permissions}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, admin_manage_permissions: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>System-Konfiguration</Label>
                <p className="text-sm text-muted-foreground">Speicherorte, Integrationen, globale Regeln</p>
              </div>
              <Switch 
                checked={formState.admin_system_config}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, admin_system_config: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Audit & Compliance</Label>
                <p className="text-sm text-muted-foreground">Vollständige Audit-Logs und Compliance-Berichte</p>
              </div>
              <Switch 
                checked={formState.admin_audit_compliance}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, admin_audit_compliance: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Feingranulare Rechte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">👁️ Leserecht</h4>
                <p className="text-sm text-muted-foreground">Dokument anzeigen und herunterladen</p>
                <Select 
                  value={formState.read_permission}
                  onValueChange={(value) => setFormState(prev => ({ ...prev, read_permission: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Berechtigung" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Keine</SelectItem>
                    <SelectItem value="own">Eigene</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="department">Abteilung</SelectItem>
                    <SelectItem value="all">Alle</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">✏️ Bearbeiten</h4>
                <p className="text-sm text-muted-foreground">Metadaten und Inhalt ändern</p>
                <Select 
                  value={formState.edit_permission}
                  onValueChange={(value) => setFormState(prev => ({ ...prev, edit_permission: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Berechtigung" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Keine</SelectItem>
                    <SelectItem value="own">Eigene</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="department">Abteilung</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">📤 Upload</h4>
                <p className="text-sm text-muted-foreground">Neue Dokumente hochladen</p>
                <Select 
                  value={formState.upload_permission}
                  onValueChange={(value) => setFormState(prev => ({ ...prev, upload_permission: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Berechtigung" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="own">Eigener Bereich</SelectItem>
                    <SelectItem value="team">Team-Bereich</SelectItem>
                    <SelectItem value="department">Abteilung</SelectItem>
                    <SelectItem value="all">Überall</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">🗑️ Löschen</h4>
                <p className="text-sm text-muted-foreground">Dokumente entfernen</p>
                <Select 
                  value={formState.delete_permission}
                  onValueChange={(value) => setFormState(prev => ({ ...prev, delete_permission: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Berechtigung" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Keine</SelectItem>
                    <SelectItem value="own">Eigene</SelectItem>
                    <SelectItem value="admin">Nur Admin</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sichtbarkeit nach Kategorien</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Abteilungsfilter</Label>
              <Select 
                value={formState.department_filter}
                onValueChange={(value) => setFormState(prev => ({ ...prev, department_filter: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nach Abteilung" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hr">Nur Personal</SelectItem>
                  <SelectItem value="finance">Nur Finanzen</SelectItem>
                  <SelectItem value="all">Alle Abteilungen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Standortfilter</Label>
              <Select 
                value={formState.location_filter}
                onValueChange={(value) => setFormState(prev => ({ ...prev, location_filter: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nach Standort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="berlin">Berlin</SelectItem>
                  <SelectItem value="hamburg">Hamburg</SelectItem>
                  <SelectItem value="all">Alle Standorte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Projektfilter</Label>
              <Select 
                value={formState.project_filter}
                onValueChange={(value) => setFormState(prev => ({ ...prev, project_filter: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nach Projekt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project1">Projekt Alpha</SelectItem>
                  <SelectItem value="project2">Projekt Beta</SelectItem>
                  <SelectItem value="all">Alle Projekte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Vertraulichkeitsstufe</Label>
              <Select 
                value={formState.confidentiality_filter}
                onValueChange={(value) => setFormState(prev => ({ ...prev, confidentiality_filter: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nach Vertraulichkeit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Öffentlich</SelectItem>
                  <SelectItem value="internal">Intern</SelectItem>
                  <SelectItem value="confidential">Vertraulich</SelectItem>
                  <SelectItem value="secret">Geheim</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Zurücksetzen</Button>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Speichern..." : "Berechtigungen speichern"}
        </Button>
      </div>
    </div>
  );
}
