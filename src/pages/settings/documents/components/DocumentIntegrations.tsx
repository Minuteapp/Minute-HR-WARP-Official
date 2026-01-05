import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plug, DollarSign, Users, FileText, Cloud, Building, Save } from "lucide-react";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { toast } from "@/hooks/use-toast";

interface FormState {
  sevdesk_enabled: boolean;
  datev_enabled: boolean;
  lexoffice_enabled: boolean;
  auto_archive_sick_notes: boolean;
  recruiting_integration: boolean;
  onboarding_workflow: boolean;
  sap_hr_enabled: boolean;
  sap_hr_url: string;
  ms365_enabled: boolean;
  ms365_tenant_id: string;
  google_workspace_enabled: boolean;
  google_workspace_domain: string;
  slack_enabled: boolean;
  slack_webhook_url: string;
  sevdesk_export: boolean;
  datev_export: boolean;
  sap_export: boolean;
  cloud_export: boolean;
  rest_api_enabled: boolean;
  webhook_support: boolean;
  api_rate_limit: number;
  aws_s3_enabled: boolean;
  aws_s3_bucket: string;
  azure_blob_enabled: boolean;
  azure_container: string;
  gcp_enabled: boolean;
  gcp_project_id: string;
}

export default function DocumentIntegrations() {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('documents');
  
  const [formState, setFormState] = useState<FormState>({
    sevdesk_enabled: true,
    datev_enabled: false,
    lexoffice_enabled: false,
    auto_archive_sick_notes: true,
    recruiting_integration: true,
    onboarding_workflow: false,
    sap_hr_enabled: false,
    sap_hr_url: '',
    ms365_enabled: true,
    ms365_tenant_id: '',
    google_workspace_enabled: false,
    google_workspace_domain: '',
    slack_enabled: false,
    slack_webhook_url: '',
    sevdesk_export: false,
    datev_export: false,
    sap_export: false,
    cloud_export: false,
    rest_api_enabled: true,
    webhook_support: false,
    api_rate_limit: 1000,
    aws_s3_enabled: false,
    aws_s3_bucket: '',
    azure_blob_enabled: false,
    azure_container: '',
    gcp_enabled: false,
    gcp_project_id: '',
  });

  useEffect(() => {
    if (settings) {
      setFormState({
        sevdesk_enabled: getValue('integrations_sevdesk_enabled', true) as boolean,
        datev_enabled: getValue('integrations_datev_enabled', false) as boolean,
        lexoffice_enabled: getValue('integrations_lexoffice_enabled', false) as boolean,
        auto_archive_sick_notes: getValue('integrations_auto_archive_sick_notes', true) as boolean,
        recruiting_integration: getValue('integrations_recruiting_integration', true) as boolean,
        onboarding_workflow: getValue('integrations_onboarding_workflow', false) as boolean,
        sap_hr_enabled: getValue('integrations_sap_hr_enabled', false) as boolean,
        sap_hr_url: getValue('integrations_sap_hr_url', '') as string,
        ms365_enabled: getValue('integrations_ms365_enabled', true) as boolean,
        ms365_tenant_id: getValue('integrations_ms365_tenant_id', '') as string,
        google_workspace_enabled: getValue('integrations_google_workspace_enabled', false) as boolean,
        google_workspace_domain: getValue('integrations_google_workspace_domain', '') as string,
        slack_enabled: getValue('integrations_slack_enabled', false) as boolean,
        slack_webhook_url: getValue('integrations_slack_webhook_url', '') as string,
        sevdesk_export: getValue('integrations_sevdesk_export', false) as boolean,
        datev_export: getValue('integrations_datev_export', false) as boolean,
        sap_export: getValue('integrations_sap_export', false) as boolean,
        cloud_export: getValue('integrations_cloud_export', false) as boolean,
        rest_api_enabled: getValue('integrations_rest_api_enabled', true) as boolean,
        webhook_support: getValue('integrations_webhook_support', false) as boolean,
        api_rate_limit: getValue('integrations_api_rate_limit', 1000) as number,
        aws_s3_enabled: getValue('integrations_aws_s3_enabled', false) as boolean,
        aws_s3_bucket: getValue('integrations_aws_s3_bucket', '') as string,
        azure_blob_enabled: getValue('integrations_azure_blob_enabled', false) as boolean,
        azure_container: getValue('integrations_azure_container', '') as string,
        gcp_enabled: getValue('integrations_gcp_enabled', false) as boolean,
        gcp_project_id: getValue('integrations_gcp_project_id', '') as string,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    const settingsToSave = Object.entries(formState).reduce((acc, [key, value]) => {
      acc[`integrations_${key}`] = value;
      return acc;
    }, {} as Record<string, any>);
    
    await saveSettings(settingsToSave);
    toast({ title: "Integrationen-Einstellungen gespeichert" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Lohn & Gehalt Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">SevDesk</h4>
                  <Badge variant={formState.sevdesk_enabled ? "secondary" : "outline"}>
                    {formState.sevdesk_enabled ? "Verbunden" : "Nicht verbunden"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Automatische Lohnzettel-Archivierung</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Switch 
                      checked={formState.sevdesk_enabled}
                      onCheckedChange={(checked) => setFormState(prev => ({ ...prev, sevdesk_enabled: checked }))}
                    />
                    <Button variant="outline" size="sm">Konfigurieren</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">DATEV</h4>
                  <Badge variant={formState.datev_enabled ? "secondary" : "outline"}>
                    {formState.datev_enabled ? "Verbunden" : "Nicht verbunden"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Steuerberater-Software Integration</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Switch 
                      checked={formState.datev_enabled}
                      onCheckedChange={(checked) => setFormState(prev => ({ ...prev, datev_enabled: checked }))}
                    />
                    <Button variant="outline" size="sm">Verbinden</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Lexoffice</h4>
                  <Badge variant={formState.lexoffice_enabled ? "secondary" : "outline"}>
                    {formState.lexoffice_enabled ? "Verbunden" : "Verfügbar"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Cloud-Buchhaltung Anbindung</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Switch 
                      checked={formState.lexoffice_enabled}
                      onCheckedChange={(checked) => setFormState(prev => ({ ...prev, lexoffice_enabled: checked }))}
                    />
                    <Button variant="outline" size="sm">OAuth</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Abwesenheiten & Recruiting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Krankmeldungen automatisch archivieren</Label>
                <p className="text-sm text-muted-foreground">Aus dem Abwesenheitsmodul direkt ins Dokumentenarchiv</p>
              </div>
              <Switch 
                checked={formState.auto_archive_sick_notes}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, auto_archive_sick_notes: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Recruiting-Integration</Label>
                <p className="text-sm text-muted-foreground">Bewerbungsunterlagen in Mitarbeiterakte übernehmen</p>
              </div>
              <Switch 
                checked={formState.recruiting_integration}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, recruiting_integration: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Onboarding-Workflow</Label>
                <p className="text-sm text-muted-foreground">Automatische Dokumentenerstellung für neue Mitarbeiter</p>
              </div>
              <Switch 
                checked={formState.onboarding_workflow}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, onboarding_workflow: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Enterprise-Systeme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">SAP HR</h4>
                  <Badge variant="outline">Enterprise</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">SAP SuccessFactors Integration</p>
                <div className="space-y-2">
                  <Input 
                    placeholder="SAP-System URL" 
                    value={formState.sap_hr_url}
                    onChange={(e) => setFormState(prev => ({ ...prev, sap_hr_url: e.target.value }))}
                  />
                  <div className="flex items-center justify-between">
                    <Switch 
                      checked={formState.sap_hr_enabled}
                      onCheckedChange={(checked) => setFormState(prev => ({ ...prev, sap_hr_enabled: checked }))}
                    />
                    <Button variant="outline" size="sm">Testen</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Microsoft 365</h4>
                  <Badge variant={formState.ms365_enabled ? "secondary" : "outline"}>
                    {formState.ms365_enabled ? "Aktiv" : "Inaktiv"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">SharePoint & OneDrive Sync</p>
                <div className="space-y-2">
                  <Input 
                    placeholder="Tenant ID" 
                    value={formState.ms365_tenant_id}
                    onChange={(e) => setFormState(prev => ({ ...prev, ms365_tenant_id: e.target.value }))}
                  />
                  <div className="flex items-center justify-between">
                    <Switch 
                      checked={formState.ms365_enabled}
                      onCheckedChange={(checked) => setFormState(prev => ({ ...prev, ms365_enabled: checked }))}
                    />
                    <Button variant="outline" size="sm">OAuth</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Google Workspace</h4>
                  <Badge variant="outline">Verfügbar</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Google Drive Integration</p>
                <div className="space-y-2">
                  <Input 
                    placeholder="Workspace Domain" 
                    value={formState.google_workspace_domain}
                    onChange={(e) => setFormState(prev => ({ ...prev, google_workspace_domain: e.target.value }))}
                  />
                  <div className="flex items-center justify-between">
                    <Switch 
                      checked={formState.google_workspace_enabled}
                      onCheckedChange={(checked) => setFormState(prev => ({ ...prev, google_workspace_enabled: checked }))}
                    />
                    <Button variant="outline" size="sm">Autorisieren</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Slack</h4>
                  <Badge variant="outline">Beta</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Dokument-Benachrichtigungen</p>
                <div className="space-y-2">
                  <Input 
                    placeholder="Slack Webhook URL" 
                    value={formState.slack_webhook_url}
                    onChange={(e) => setFormState(prev => ({ ...prev, slack_webhook_url: e.target.value }))}
                  />
                  <div className="flex items-center justify-between">
                    <Switch 
                      checked={formState.slack_enabled}
                      onCheckedChange={(checked) => setFormState(prev => ({ ...prev, slack_enabled: checked }))}
                    />
                    <Button variant="outline" size="sm">Webhook</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export-Schnittstellen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">📊 SevDesk</h4>
                <p className="text-sm text-muted-foreground mb-2">Buchhaltungsbelege</p>
                <div className="flex items-center justify-between">
                  <Switch 
                    checked={formState.sevdesk_export}
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, sevdesk_export: checked }))}
                  />
                  <Button variant="outline" size="sm">API</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">📋 DATEV</h4>
                <p className="text-sm text-muted-foreground mb-2">Steuerberatung</p>
                <div className="flex items-center justify-between">
                  <Switch 
                    checked={formState.datev_export}
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, datev_export: checked }))}
                  />
                  <Button variant="outline" size="sm">Export</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">⚙️ SAP</h4>
                <p className="text-sm text-muted-foreground mb-2">ERP-Integration</p>
                <div className="flex items-center justify-between">
                  <Switch 
                    checked={formState.sap_export}
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, sap_export: checked }))}
                  />
                  <Button variant="outline" size="sm">RFC</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">☁️ Cloud</h4>
                <p className="text-sm text-muted-foreground mb-2">Generischer Export</p>
                <div className="flex items-center justify-between">
                  <Switch 
                    checked={formState.cloud_export}
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, cloud_export: checked }))}
                  />
                  <Button variant="outline" size="sm">REST</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            API für Drittsysteme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>REST API aktivieren</Label>
                <p className="text-sm text-muted-foreground">Externe Systeme können Dokumente hochladen/abrufen</p>
              </div>
              <Switch 
                checked={formState.rest_api_enabled}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, rest_api_enabled: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Webhook-Unterstützung</Label>
                <p className="text-sm text-muted-foreground">Benachrichtigungen an externe Systeme senden</p>
              </div>
              <Switch 
                checked={formState.webhook_support}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, webhook_support: checked }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>API Endpoint</Label>
              <Input value="https://api.unternehmen.de/documents" readOnly />
            </div>
            <div className="space-y-2">
              <Label>API Version</Label>
              <Input value="v2.1" readOnly />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex gap-2">
                <Input value="••••••••••••••••" type="password" readOnly />
                <Button variant="outline" size="sm">Regenerieren</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Rate Limit</Label>
              <Input 
                type="number"
                value={formState.api_rate_limit}
                onChange={(e) => setFormState(prev => ({ ...prev, api_rate_limit: parseInt(e.target.value) || 1000 }))}
                placeholder="1000 Requests/Stunde" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            Cloud-Storage Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">☁️ AWS S3</h4>
                <p className="text-sm text-muted-foreground mb-2">Skalierbare Cloud-Speicherung</p>
                <div className="space-y-2">
                  <Input 
                    placeholder="Bucket Name" 
                    value={formState.aws_s3_bucket}
                    onChange={(e) => setFormState(prev => ({ ...prev, aws_s3_bucket: e.target.value }))}
                  />
                  <Switch 
                    checked={formState.aws_s3_enabled}
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, aws_s3_enabled: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">📂 Azure Blob</h4>
                <p className="text-sm text-muted-foreground mb-2">Microsoft Cloud Storage</p>
                <div className="space-y-2">
                  <Input 
                    placeholder="Container Name" 
                    value={formState.azure_container}
                    onChange={(e) => setFormState(prev => ({ ...prev, azure_container: e.target.value }))}
                  />
                  <Switch 
                    checked={formState.azure_blob_enabled}
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, azure_blob_enabled: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">🌩️ Google Cloud</h4>
                <p className="text-sm text-muted-foreground mb-2">Google Storage Buckets</p>
                <div className="space-y-2">
                  <Input 
                    placeholder="Project ID" 
                    value={formState.gcp_project_id}
                    onChange={(e) => setFormState(prev => ({ ...prev, gcp_project_id: e.target.value }))}
                  />
                  <Switch 
                    checked={formState.gcp_enabled}
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, gcp_enabled: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Alle Verbindungen testen</Button>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Speichern..." : "Integrationen speichern"}
        </Button>
      </div>
    </div>
  );
}
