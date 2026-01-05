
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, Cloud, Database, Webhook, Key, RefreshCw } from "lucide-react";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { useToast } from "@/hooks/use-toast";

interface IntegrationFormState {
  // Cloud-Speicher
  cloud_storage_enabled: boolean;
  primary_storage_provider: string;
  
  // AWS S3
  aws_s3_enabled: boolean;
  aws_s3_bucket: string;
  aws_s3_region: string;
  aws_s3_auto_sync: boolean;
  
  // Azure Blob
  azure_blob_enabled: boolean;
  azure_container: string;
  azure_auto_sync: boolean;
  
  // Google Cloud
  gcp_storage_enabled: boolean;
  gcp_bucket: string;
  gcp_auto_sync: boolean;
  
  // SharePoint / OneDrive
  sharepoint_enabled: boolean;
  sharepoint_site_url: string;
  sharepoint_document_library: string;
  sharepoint_auto_sync: boolean;
  
  // Google Drive
  google_drive_enabled: boolean;
  google_drive_folder_id: string;
  google_drive_auto_sync: boolean;
  
  // Dropbox Business
  dropbox_enabled: boolean;
  dropbox_folder: string;
  dropbox_auto_sync: boolean;
  
  // DMS-Integrationen
  docuware_enabled: boolean;
  docuware_cabinet: string;
  
  // DATEV
  datev_enabled: boolean;
  datev_auto_export: boolean;
  datev_export_format: string;
  
  // API & Webhooks
  api_enabled: boolean;
  api_rate_limit: number;
  webhook_enabled: boolean;
  webhook_url: string;
  webhook_secret: string;
  
  // Sync-Einstellungen
  sync_frequency: string;
  sync_on_upload: boolean;
  sync_on_update: boolean;
  sync_deletions: boolean;
  conflict_resolution: string;
}

const DocumentIntegrationSettings = () => {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('documents');
  const { toast } = useToast();
  
  const [formState, setFormState] = useState<IntegrationFormState>({
    cloud_storage_enabled: false,
    primary_storage_provider: 'local',
    aws_s3_enabled: false,
    aws_s3_bucket: '',
    aws_s3_region: 'eu-central-1',
    aws_s3_auto_sync: false,
    azure_blob_enabled: false,
    azure_container: '',
    azure_auto_sync: false,
    gcp_storage_enabled: false,
    gcp_bucket: '',
    gcp_auto_sync: false,
    sharepoint_enabled: false,
    sharepoint_site_url: '',
    sharepoint_document_library: '',
    sharepoint_auto_sync: false,
    google_drive_enabled: false,
    google_drive_folder_id: '',
    google_drive_auto_sync: false,
    dropbox_enabled: false,
    dropbox_folder: '',
    dropbox_auto_sync: false,
    docuware_enabled: false,
    docuware_cabinet: '',
    datev_enabled: false,
    datev_auto_export: false,
    datev_export_format: 'xml',
    api_enabled: false,
    api_rate_limit: 100,
    webhook_enabled: false,
    webhook_url: '',
    webhook_secret: '',
    sync_frequency: 'hourly',
    sync_on_upload: true,
    sync_on_update: true,
    sync_deletions: false,
    conflict_resolution: 'newer_wins',
  });

  useEffect(() => {
    if (settings) {
      setFormState(prev => ({
        ...prev,
        cloud_storage_enabled: getValue('cloud_storage_enabled', false) as boolean,
        primary_storage_provider: getValue('primary_storage_provider', 'local') as string,
        aws_s3_enabled: getValue('aws_s3_enabled', false) as boolean,
        aws_s3_bucket: getValue('aws_s3_bucket', '') as string,
        aws_s3_region: getValue('aws_s3_region', 'eu-central-1') as string,
        aws_s3_auto_sync: getValue('aws_s3_auto_sync', false) as boolean,
        azure_blob_enabled: getValue('azure_blob_enabled', false) as boolean,
        azure_container: getValue('azure_container', '') as string,
        azure_auto_sync: getValue('azure_auto_sync', false) as boolean,
        gcp_storage_enabled: getValue('gcp_storage_enabled', false) as boolean,
        gcp_bucket: getValue('gcp_bucket', '') as string,
        gcp_auto_sync: getValue('gcp_auto_sync', false) as boolean,
        sharepoint_enabled: getValue('sharepoint_enabled', false) as boolean,
        sharepoint_site_url: getValue('sharepoint_site_url', '') as string,
        sharepoint_document_library: getValue('sharepoint_document_library', '') as string,
        sharepoint_auto_sync: getValue('sharepoint_auto_sync', false) as boolean,
        google_drive_enabled: getValue('google_drive_enabled', false) as boolean,
        google_drive_folder_id: getValue('google_drive_folder_id', '') as string,
        google_drive_auto_sync: getValue('google_drive_auto_sync', false) as boolean,
        dropbox_enabled: getValue('dropbox_enabled', false) as boolean,
        dropbox_folder: getValue('dropbox_folder', '') as string,
        dropbox_auto_sync: getValue('dropbox_auto_sync', false) as boolean,
        docuware_enabled: getValue('docuware_enabled', false) as boolean,
        docuware_cabinet: getValue('docuware_cabinet', '') as string,
        datev_enabled: getValue('datev_enabled', false) as boolean,
        datev_auto_export: getValue('datev_auto_export', false) as boolean,
        datev_export_format: getValue('datev_export_format', 'xml') as string,
        api_enabled: getValue('api_enabled', false) as boolean,
        api_rate_limit: getValue('api_rate_limit', 100) as number,
        webhook_enabled: getValue('webhook_enabled', false) as boolean,
        webhook_url: getValue('webhook_url', '') as string,
        webhook_secret: getValue('webhook_secret', '') as string,
        sync_frequency: getValue('sync_frequency', 'hourly') as string,
        sync_on_upload: getValue('sync_on_upload', true) as boolean,
        sync_on_update: getValue('sync_on_update', true) as boolean,
        sync_deletions: getValue('sync_deletions', false) as boolean,
        conflict_resolution: getValue('conflict_resolution', 'newer_wins') as string,
      }));
    }
  }, [settings]);

  const handleSave = async () => {
    await saveSettings(formState);
    toast({ title: "Integrations-Einstellungen gespeichert" });
  };

  const updateField = <K extends keyof IntegrationFormState>(field: K, value: IntegrationFormState[K]) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Cloud-Speicher */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Cloud-Speicher
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Cloud-Speicher aktivieren</Label>
            <Switch checked={formState.cloud_storage_enabled} onCheckedChange={(v) => updateField('cloud_storage_enabled', v)} />
          </div>
          <div className="space-y-2">
            <Label>Primärer Speicher</Label>
            <Select value={formState.primary_storage_provider} onValueChange={(v) => updateField('primary_storage_provider', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Lokal</SelectItem>
                <SelectItem value="aws_s3">AWS S3</SelectItem>
                <SelectItem value="azure">Azure Blob</SelectItem>
                <SelectItem value="gcp">Google Cloud Storage</SelectItem>
                <SelectItem value="sharepoint">SharePoint</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* AWS S3 */}
      <Card>
        <CardHeader>
          <CardTitle>AWS S3</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>AWS S3 aktivieren</Label>
            <Switch checked={formState.aws_s3_enabled} onCheckedChange={(v) => updateField('aws_s3_enabled', v)} />
          </div>
          {formState.aws_s3_enabled && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bucket-Name</Label>
                  <Input value={formState.aws_s3_bucket} onChange={(e) => updateField('aws_s3_bucket', e.target.value)} placeholder="my-bucket" />
                </div>
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Select value={formState.aws_s3_region} onValueChange={(v) => updateField('aws_s3_region', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eu-central-1">EU (Frankfurt)</SelectItem>
                      <SelectItem value="eu-west-1">EU (Irland)</SelectItem>
                      <SelectItem value="us-east-1">US East</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Automatische Synchronisation</Label>
                <Switch checked={formState.aws_s3_auto_sync} onCheckedChange={(v) => updateField('aws_s3_auto_sync', v)} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* SharePoint */}
      <Card>
        <CardHeader>
          <CardTitle>Microsoft SharePoint / OneDrive</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>SharePoint aktivieren</Label>
            <Switch checked={formState.sharepoint_enabled} onCheckedChange={(v) => updateField('sharepoint_enabled', v)} />
          </div>
          {formState.sharepoint_enabled && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Site URL</Label>
                  <Input value={formState.sharepoint_site_url} onChange={(e) => updateField('sharepoint_site_url', e.target.value)} placeholder="https://company.sharepoint.com/sites/hr" />
                </div>
                <div className="space-y-2">
                  <Label>Dokumentbibliothek</Label>
                  <Input value={formState.sharepoint_document_library} onChange={(e) => updateField('sharepoint_document_library', e.target.value)} placeholder="Documents" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Automatische Synchronisation</Label>
                <Switch checked={formState.sharepoint_auto_sync} onCheckedChange={(v) => updateField('sharepoint_auto_sync', v)} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Google Drive */}
      <Card>
        <CardHeader>
          <CardTitle>Google Drive</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Google Drive aktivieren</Label>
            <Switch checked={formState.google_drive_enabled} onCheckedChange={(v) => updateField('google_drive_enabled', v)} />
          </div>
          {formState.google_drive_enabled && (
            <>
              <div className="space-y-2">
                <Label>Ordner-ID</Label>
                <Input value={formState.google_drive_folder_id} onChange={(e) => updateField('google_drive_folder_id', e.target.value)} placeholder="1234567890abcdef" />
              </div>
              <div className="flex items-center justify-between">
                <Label>Automatische Synchronisation</Label>
                <Switch checked={formState.google_drive_auto_sync} onCheckedChange={(v) => updateField('google_drive_auto_sync', v)} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* DATEV */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            DATEV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>DATEV-Integration aktivieren</Label>
            <Switch checked={formState.datev_enabled} onCheckedChange={(v) => updateField('datev_enabled', v)} />
          </div>
          {formState.datev_enabled && (
            <>
              <div className="flex items-center justify-between">
                <Label>Automatischer Export</Label>
                <Switch checked={formState.datev_auto_export} onCheckedChange={(v) => updateField('datev_auto_export', v)} />
              </div>
              <div className="space-y-2">
                <Label>Export-Format</Label>
                <Select value={formState.datev_export_format} onValueChange={(v) => updateField('datev_export_format', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xml">XML</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="datev_connect">DATEV Connect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* API & Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            API & Webhooks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>REST API aktivieren</Label>
            <Switch checked={formState.api_enabled} onCheckedChange={(v) => updateField('api_enabled', v)} />
          </div>
          {formState.api_enabled && (
            <div className="space-y-2">
              <Label>Rate Limit (Anfragen/Minute)</Label>
              <Input type="number" value={formState.api_rate_limit} onChange={(e) => updateField('api_rate_limit', parseInt(e.target.value) || 100)} />
            </div>
          )}
          <div className="flex items-center justify-between">
            <Label>Webhooks aktivieren</Label>
            <Switch checked={formState.webhook_enabled} onCheckedChange={(v) => updateField('webhook_enabled', v)} />
          </div>
          {formState.webhook_enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input value={formState.webhook_url} onChange={(e) => updateField('webhook_url', e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Webhook Secret</Label>
                <Input type="password" value={formState.webhook_secret} onChange={(e) => updateField('webhook_secret', e.target.value)} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync-Einstellungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Synchronisation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sync-Häufigkeit</Label>
              <Select value={formState.sync_frequency} onValueChange={(v) => updateField('sync_frequency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Echtzeit</SelectItem>
                  <SelectItem value="hourly">Stündlich</SelectItem>
                  <SelectItem value="daily">Täglich</SelectItem>
                  <SelectItem value="manual">Manuell</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Konfliktlösung</Label>
              <Select value={formState.conflict_resolution} onValueChange={(v) => updateField('conflict_resolution', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newer_wins">Neuer gewinnt</SelectItem>
                  <SelectItem value="local_wins">Lokal gewinnt</SelectItem>
                  <SelectItem value="remote_wins">Remote gewinnt</SelectItem>
                  <SelectItem value="manual">Manuell</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <Label>Bei Upload synchronisieren</Label>
              <Switch checked={formState.sync_on_upload} onCheckedChange={(v) => updateField('sync_on_upload', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Bei Update synchronisieren</Label>
              <Switch checked={formState.sync_on_update} onCheckedChange={(v) => updateField('sync_on_update', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Löschungen synchronisieren</Label>
              <Switch checked={formState.sync_deletions} onCheckedChange={(v) => updateField('sync_deletions', v)} />
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

export default DocumentIntegrationSettings;
