
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, Users, Link, Mail, Clock, Shield, ExternalLink, Copy } from "lucide-react";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { useToast } from "@/hooks/use-toast";

interface SharingFormState {
  // Freigabe-Optionen
  internal_sharing_enabled: boolean;
  external_sharing_enabled: boolean;
  public_link_enabled: boolean;
  email_sharing_enabled: boolean;
  
  // Berechtigungen
  default_share_permission: string;
  allow_download_on_share: boolean;
  allow_print_on_share: boolean;
  allow_copy_on_share: boolean;
  require_password_for_external: boolean;
  
  // Zeitliche Einschränkungen
  default_link_expiry_days: number;
  max_link_expiry_days: number;
  require_expiry_date: boolean;
  
  // Empfänger-Einschränkungen
  restrict_to_domain: boolean;
  allowed_domains: string;
  max_recipients_per_share: number;
  
  // Tracking & Audit
  track_share_access: boolean;
  notify_on_access: boolean;
  log_downloads: boolean;
  share_activity_reports: boolean;
  
  // Team-Freigabe
  team_folders_enabled: boolean;
  department_sharing: boolean;
  project_sharing: boolean;
  inherit_folder_permissions: boolean;
  
  // Wasserzeichen
  watermark_on_shared: boolean;
  watermark_text: string;
  include_recipient_info: boolean;
}

const DocumentSharingSettings = () => {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('documents');
  const { toast } = useToast();
  
  const [formState, setFormState] = useState<SharingFormState>({
    internal_sharing_enabled: true,
    external_sharing_enabled: false,
    public_link_enabled: false,
    email_sharing_enabled: true,
    default_share_permission: 'view',
    allow_download_on_share: true,
    allow_print_on_share: true,
    allow_copy_on_share: false,
    require_password_for_external: true,
    default_link_expiry_days: 7,
    max_link_expiry_days: 30,
    require_expiry_date: true,
    restrict_to_domain: false,
    allowed_domains: '',
    max_recipients_per_share: 10,
    track_share_access: true,
    notify_on_access: false,
    log_downloads: true,
    share_activity_reports: true,
    team_folders_enabled: true,
    department_sharing: true,
    project_sharing: true,
    inherit_folder_permissions: true,
    watermark_on_shared: false,
    watermark_text: 'Vertraulich',
    include_recipient_info: false,
  });

  useEffect(() => {
    if (settings) {
      setFormState(prev => ({
        ...prev,
        internal_sharing_enabled: getValue('internal_sharing_enabled', true) as boolean,
        external_sharing_enabled: getValue('external_sharing_enabled', false) as boolean,
        public_link_enabled: getValue('public_link_enabled', false) as boolean,
        email_sharing_enabled: getValue('email_sharing_enabled', true) as boolean,
        default_share_permission: getValue('default_share_permission', 'view') as string,
        allow_download_on_share: getValue('allow_download_on_share', true) as boolean,
        allow_print_on_share: getValue('allow_print_on_share', true) as boolean,
        allow_copy_on_share: getValue('allow_copy_on_share', false) as boolean,
        require_password_for_external: getValue('require_password_for_external', true) as boolean,
        default_link_expiry_days: getValue('default_link_expiry_days', 7) as number,
        max_link_expiry_days: getValue('max_link_expiry_days', 30) as number,
        require_expiry_date: getValue('require_expiry_date', true) as boolean,
        restrict_to_domain: getValue('restrict_to_domain', false) as boolean,
        allowed_domains: getValue('allowed_domains', '') as string,
        max_recipients_per_share: getValue('max_recipients_per_share', 10) as number,
        track_share_access: getValue('track_share_access', true) as boolean,
        notify_on_access: getValue('notify_on_access', false) as boolean,
        log_downloads: getValue('log_downloads', true) as boolean,
        share_activity_reports: getValue('share_activity_reports', true) as boolean,
        team_folders_enabled: getValue('team_folders_enabled', true) as boolean,
        department_sharing: getValue('department_sharing', true) as boolean,
        project_sharing: getValue('project_sharing', true) as boolean,
        inherit_folder_permissions: getValue('inherit_folder_permissions', true) as boolean,
        watermark_on_shared: getValue('watermark_on_shared', false) as boolean,
        watermark_text: getValue('watermark_text', 'Vertraulich') as string,
        include_recipient_info: getValue('include_recipient_info', false) as boolean,
      }));
    }
  }, [settings]);

  const handleSave = async () => {
    await saveSettings(formState);
    toast({ title: "Freigabe-Einstellungen gespeichert" });
  };

  const updateField = <K extends keyof SharingFormState>(field: K, value: SharingFormState[K]) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Freigabe-Optionen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Freigabe-Optionen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <Label>Interne Freigabe</Label>
              </div>
              <Switch checked={formState.internal_sharing_enabled} onCheckedChange={(v) => updateField('internal_sharing_enabled', v)} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <Label>Externe Freigabe</Label>
              </div>
              <Switch checked={formState.external_sharing_enabled} onCheckedChange={(v) => updateField('external_sharing_enabled', v)} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Link className="h-4 w-4 text-muted-foreground" />
                <Label>Öffentliche Links</Label>
              </div>
              <Switch checked={formState.public_link_enabled} onCheckedChange={(v) => updateField('public_link_enabled', v)} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Label>E-Mail-Freigabe</Label>
              </div>
              <Switch checked={formState.email_sharing_enabled} onCheckedChange={(v) => updateField('email_sharing_enabled', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Berechtigungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Standard-Berechtigungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Standard-Berechtigung bei Freigabe</Label>
            <Select value={formState.default_share_permission} onValueChange={(v) => updateField('default_share_permission', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="view">Nur Ansehen</SelectItem>
                <SelectItem value="comment">Ansehen & Kommentieren</SelectItem>
                <SelectItem value="edit">Bearbeiten</SelectItem>
                <SelectItem value="full">Vollzugriff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Download erlauben</Label>
              <Switch checked={formState.allow_download_on_share} onCheckedChange={(v) => updateField('allow_download_on_share', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Drucken erlauben</Label>
              <Switch checked={formState.allow_print_on_share} onCheckedChange={(v) => updateField('allow_print_on_share', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Kopieren erlauben</Label>
              <Switch checked={formState.allow_copy_on_share} onCheckedChange={(v) => updateField('allow_copy_on_share', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Passwort für externe Links</Label>
              <Switch checked={formState.require_password_for_external} onCheckedChange={(v) => updateField('require_password_for_external', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zeitliche Einschränkungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Link-Ablauf
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Standard-Ablauf (Tage)</Label>
              <Input type="number" value={formState.default_link_expiry_days} onChange={(e) => updateField('default_link_expiry_days', parseInt(e.target.value) || 7)} />
            </div>
            <div className="space-y-2">
              <Label>Maximaler Ablauf (Tage)</Label>
              <Input type="number" value={formState.max_link_expiry_days} onChange={(e) => updateField('max_link_expiry_days', parseInt(e.target.value) || 30)} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Ablaufdatum erforderlich</Label>
            <Switch checked={formState.require_expiry_date} onCheckedChange={(v) => updateField('require_expiry_date', v)} />
          </div>
        </CardContent>
      </Card>

      {/* Empfänger-Einschränkungen */}
      <Card>
        <CardHeader>
          <CardTitle>Empfänger-Einschränkungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Auf bestimmte Domains beschränken</Label>
            <Switch checked={formState.restrict_to_domain} onCheckedChange={(v) => updateField('restrict_to_domain', v)} />
          </div>
          {formState.restrict_to_domain && (
            <div className="space-y-2">
              <Label>Erlaubte Domains (kommagetrennt)</Label>
              <Input value={formState.allowed_domains} onChange={(e) => updateField('allowed_domains', e.target.value)} placeholder="beispiel.de, partner.com" />
            </div>
          )}
          <div className="space-y-2">
            <Label>Max. Empfänger pro Freigabe</Label>
            <Input type="number" value={formState.max_recipients_per_share} onChange={(e) => updateField('max_recipients_per_share', parseInt(e.target.value) || 10)} />
          </div>
        </CardContent>
      </Card>

      {/* Tracking & Audit */}
      <Card>
        <CardHeader>
          <CardTitle>Tracking & Protokollierung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Zugriffe protokollieren</Label>
              <Switch checked={formState.track_share_access} onCheckedChange={(v) => updateField('track_share_access', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Bei Zugriff benachrichtigen</Label>
              <Switch checked={formState.notify_on_access} onCheckedChange={(v) => updateField('notify_on_access', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Downloads protokollieren</Label>
              <Switch checked={formState.log_downloads} onCheckedChange={(v) => updateField('log_downloads', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Aktivitätsberichte</Label>
              <Switch checked={formState.share_activity_reports} onCheckedChange={(v) => updateField('share_activity_reports', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team-Freigabe */}
      <Card>
        <CardHeader>
          <CardTitle>Team-Freigabe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Team-Ordner aktivieren</Label>
              <Switch checked={formState.team_folders_enabled} onCheckedChange={(v) => updateField('team_folders_enabled', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Abteilungs-Freigabe</Label>
              <Switch checked={formState.department_sharing} onCheckedChange={(v) => updateField('department_sharing', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Projekt-Freigabe</Label>
              <Switch checked={formState.project_sharing} onCheckedChange={(v) => updateField('project_sharing', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Ordner-Berechtigungen vererben</Label>
              <Switch checked={formState.inherit_folder_permissions} onCheckedChange={(v) => updateField('inherit_folder_permissions', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wasserzeichen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Wasserzeichen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Wasserzeichen bei freigegebenen Dokumenten</Label>
            <Switch checked={formState.watermark_on_shared} onCheckedChange={(v) => updateField('watermark_on_shared', v)} />
          </div>
          {formState.watermark_on_shared && (
            <>
              <div className="space-y-2">
                <Label>Wasserzeichen-Text</Label>
                <Input value={formState.watermark_text} onChange={(e) => updateField('watermark_text', e.target.value)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Empfänger-Info einblenden</Label>
                <Switch checked={formState.include_recipient_info} onCheckedChange={(v) => updateField('include_recipient_info', v)} />
              </div>
            </>
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

export default DocumentSharingSettings;
