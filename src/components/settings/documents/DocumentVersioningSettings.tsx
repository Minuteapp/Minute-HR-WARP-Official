
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitBranch, History, Eye, Lock, Trash2, FileText } from "lucide-react";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { useToast } from "@/hooks/use-toast";

interface VersioningFormState {
  // Allgemeine Versionierung
  versioning_enabled: boolean;
  auto_versioning: boolean;
  version_on_save: boolean;
  
  // Versionsanzahl
  max_versions: number;
  keep_all_major_versions: boolean;
  minor_versions_to_keep: number;
  
  // Versionsnummerierung
  version_numbering_scheme: string;
  auto_increment_major: boolean;
  
  // Was wird versioniert
  version_content: boolean;
  version_metadata: boolean;
  version_permissions: boolean;
  version_comments: boolean;
  
  // Vergleich & Diff
  diff_view_enabled: boolean;
  visual_diff: boolean;
  text_diff: boolean;
  metadata_diff: boolean;
  
  // Wiederherstellung
  restore_enabled: boolean;
  restore_creates_new_version: boolean;
  require_restore_reason: boolean;
  
  // Löschung alter Versionen
  auto_cleanup_enabled: boolean;
  cleanup_after_days: number;
  protect_major_versions: boolean;
  
  // Berechtigungen
  who_can_view_versions: string;
  who_can_restore_versions: string;
  who_can_delete_versions: string;
  
  // Benachrichtigungen
  notify_on_new_version: boolean;
  notify_on_restore: boolean;
  
  // Änderungsverfolgung
  track_changes_enabled: boolean;
  track_author: boolean;
  track_timestamp: boolean;
  track_ip_address: boolean;
  require_change_comment: boolean;
}

const DocumentVersioningSettings = () => {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('documents');
  const { toast } = useToast();
  
  const [formState, setFormState] = useState<VersioningFormState>({
    versioning_enabled: true,
    auto_versioning: true,
    version_on_save: true,
    max_versions: 50,
    keep_all_major_versions: true,
    minor_versions_to_keep: 10,
    version_numbering_scheme: 'semantic',
    auto_increment_major: false,
    version_content: true,
    version_metadata: true,
    version_permissions: false,
    version_comments: true,
    diff_view_enabled: true,
    visual_diff: true,
    text_diff: true,
    metadata_diff: true,
    restore_enabled: true,
    restore_creates_new_version: true,
    require_restore_reason: true,
    auto_cleanup_enabled: false,
    cleanup_after_days: 365,
    protect_major_versions: true,
    who_can_view_versions: 'all',
    who_can_restore_versions: 'managers',
    who_can_delete_versions: 'admins',
    notify_on_new_version: false,
    notify_on_restore: true,
    track_changes_enabled: true,
    track_author: true,
    track_timestamp: true,
    track_ip_address: false,
    require_change_comment: false,
  });

  useEffect(() => {
    if (settings) {
      setFormState(prev => ({
        ...prev,
        versioning_enabled: getValue('versioning_enabled', true) as boolean,
        auto_versioning: getValue('auto_versioning', true) as boolean,
        version_on_save: getValue('version_on_save', true) as boolean,
        max_versions: getValue('max_versions', 50) as number,
        keep_all_major_versions: getValue('keep_all_major_versions', true) as boolean,
        minor_versions_to_keep: getValue('minor_versions_to_keep', 10) as number,
        version_numbering_scheme: getValue('version_numbering_scheme', 'semantic') as string,
        auto_increment_major: getValue('auto_increment_major', false) as boolean,
        version_content: getValue('version_content', true) as boolean,
        version_metadata: getValue('version_metadata', true) as boolean,
        version_permissions: getValue('version_permissions', false) as boolean,
        version_comments: getValue('version_comments', true) as boolean,
        diff_view_enabled: getValue('diff_view_enabled', true) as boolean,
        visual_diff: getValue('visual_diff', true) as boolean,
        text_diff: getValue('text_diff', true) as boolean,
        metadata_diff: getValue('metadata_diff', true) as boolean,
        restore_enabled: getValue('restore_enabled', true) as boolean,
        restore_creates_new_version: getValue('restore_creates_new_version', true) as boolean,
        require_restore_reason: getValue('require_restore_reason', true) as boolean,
        auto_cleanup_enabled: getValue('auto_cleanup_enabled', false) as boolean,
        cleanup_after_days: getValue('cleanup_after_days', 365) as number,
        protect_major_versions: getValue('protect_major_versions', true) as boolean,
        who_can_view_versions: getValue('who_can_view_versions', 'all') as string,
        who_can_restore_versions: getValue('who_can_restore_versions', 'managers') as string,
        who_can_delete_versions: getValue('who_can_delete_versions', 'admins') as string,
        notify_on_new_version: getValue('notify_on_new_version', false) as boolean,
        notify_on_restore: getValue('notify_on_restore', true) as boolean,
        track_changes_enabled: getValue('track_changes_enabled', true) as boolean,
        track_author: getValue('track_author', true) as boolean,
        track_timestamp: getValue('track_timestamp', true) as boolean,
        track_ip_address: getValue('track_ip_address', false) as boolean,
        require_change_comment: getValue('require_change_comment', false) as boolean,
      }));
    }
  }, [settings]);

  const handleSave = async () => {
    await saveSettings(formState);
    toast({ title: "Versionierungs-Einstellungen gespeichert" });
  };

  const updateField = <K extends keyof VersioningFormState>(field: K, value: VersioningFormState[K]) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Allgemeine Versionierung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Versionierung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Versionierung aktivieren</Label>
            <Switch checked={formState.versioning_enabled} onCheckedChange={(v) => updateField('versioning_enabled', v)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Automatische Versionierung</Label>
              <Switch checked={formState.auto_versioning} onCheckedChange={(v) => updateField('auto_versioning', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Version bei jedem Speichern</Label>
              <Switch checked={formState.version_on_save} onCheckedChange={(v) => updateField('version_on_save', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Versionsanzahl */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Versions-Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Maximale Versionen</Label>
              <Input type="number" value={formState.max_versions} onChange={(e) => updateField('max_versions', parseInt(e.target.value) || 50)} />
            </div>
            <div className="space-y-2">
              <Label>Minor-Versionen behalten</Label>
              <Input type="number" value={formState.minor_versions_to_keep} onChange={(e) => updateField('minor_versions_to_keep', parseInt(e.target.value) || 10)} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Alle Major-Versionen behalten</Label>
            <Switch checked={formState.keep_all_major_versions} onCheckedChange={(v) => updateField('keep_all_major_versions', v)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Versionsnummerierung</Label>
              <Select value={formState.version_numbering_scheme} onValueChange={(v) => updateField('version_numbering_scheme', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Einfach (1, 2, 3...)</SelectItem>
                  <SelectItem value="semantic">Semantisch (1.0, 1.1, 2.0...)</SelectItem>
                  <SelectItem value="date">Datum-basiert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Auto-Inkrement Major-Version</Label>
              <Switch checked={formState.auto_increment_major} onCheckedChange={(v) => updateField('auto_increment_major', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Was wird versioniert */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Versionierte Elemente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label>Inhalt</Label>
              <Switch checked={formState.version_content} onCheckedChange={(v) => updateField('version_content', v)} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label>Metadaten</Label>
              <Switch checked={formState.version_metadata} onCheckedChange={(v) => updateField('version_metadata', v)} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label>Berechtigungen</Label>
              <Switch checked={formState.version_permissions} onCheckedChange={(v) => updateField('version_permissions', v)} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label>Kommentare</Label>
              <Switch checked={formState.version_comments} onCheckedChange={(v) => updateField('version_comments', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vergleich & Diff */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Versionsvergleich
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Diff-Ansicht aktivieren</Label>
            <Switch checked={formState.diff_view_enabled} onCheckedChange={(v) => updateField('diff_view_enabled', v)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label>Visueller Diff</Label>
              <Switch checked={formState.visual_diff} onCheckedChange={(v) => updateField('visual_diff', v)} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label>Text-Diff</Label>
              <Switch checked={formState.text_diff} onCheckedChange={(v) => updateField('text_diff', v)} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label>Metadaten-Diff</Label>
              <Switch checked={formState.metadata_diff} onCheckedChange={(v) => updateField('metadata_diff', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wiederherstellung */}
      <Card>
        <CardHeader>
          <CardTitle>Wiederherstellung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Wiederherstellung aktivieren</Label>
            <Switch checked={formState.restore_enabled} onCheckedChange={(v) => updateField('restore_enabled', v)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Wiederherstellung erstellt neue Version</Label>
              <Switch checked={formState.restore_creates_new_version} onCheckedChange={(v) => updateField('restore_creates_new_version', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Begründung erforderlich</Label>
              <Switch checked={formState.require_restore_reason} onCheckedChange={(v) => updateField('require_restore_reason', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Löschung alter Versionen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Automatische Bereinigung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Automatische Bereinigung aktivieren</Label>
            <Switch checked={formState.auto_cleanup_enabled} onCheckedChange={(v) => updateField('auto_cleanup_enabled', v)} />
          </div>
          {formState.auto_cleanup_enabled && (
            <>
              <div className="space-y-2">
                <Label>Bereinigung nach (Tagen)</Label>
                <Input type="number" value={formState.cleanup_after_days} onChange={(e) => updateField('cleanup_after_days', parseInt(e.target.value) || 365)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Major-Versionen schützen</Label>
                <Switch checked={formState.protect_major_versions} onCheckedChange={(v) => updateField('protect_major_versions', v)} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Berechtigungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Berechtigungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Versionen ansehen</Label>
              <Select value={formState.who_can_view_versions} onValueChange={(v) => updateField('who_can_view_versions', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="editors">Bearbeiter</SelectItem>
                  <SelectItem value="managers">Manager</SelectItem>
                  <SelectItem value="admins">Nur Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Versionen wiederherstellen</Label>
              <Select value={formState.who_can_restore_versions} onValueChange={(v) => updateField('who_can_restore_versions', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="editors">Bearbeiter</SelectItem>
                  <SelectItem value="managers">Manager</SelectItem>
                  <SelectItem value="admins">Nur Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Versionen löschen</Label>
              <Select value={formState.who_can_delete_versions} onValueChange={(v) => updateField('who_can_delete_versions', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="managers">Manager</SelectItem>
                  <SelectItem value="admins">Nur Admins</SelectItem>
                  <SelectItem value="none">Niemand</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benachrichtigungen */}
      <Card>
        <CardHeader>
          <CardTitle>Benachrichtigungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Bei neuer Version benachrichtigen</Label>
              <Switch checked={formState.notify_on_new_version} onCheckedChange={(v) => updateField('notify_on_new_version', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Bei Wiederherstellung benachrichtigen</Label>
              <Switch checked={formState.notify_on_restore} onCheckedChange={(v) => updateField('notify_on_restore', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Änderungsverfolgung */}
      <Card>
        <CardHeader>
          <CardTitle>Änderungsverfolgung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Änderungsverfolgung aktivieren</Label>
            <Switch checked={formState.track_changes_enabled} onCheckedChange={(v) => updateField('track_changes_enabled', v)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Autor erfassen</Label>
              <Switch checked={formState.track_author} onCheckedChange={(v) => updateField('track_author', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Zeitstempel erfassen</Label>
              <Switch checked={formState.track_timestamp} onCheckedChange={(v) => updateField('track_timestamp', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>IP-Adresse erfassen</Label>
              <Switch checked={formState.track_ip_address} onCheckedChange={(v) => updateField('track_ip_address', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Änderungskommentar erforderlich</Label>
              <Switch checked={formState.require_change_comment} onCheckedChange={(v) => updateField('require_change_comment', v)} />
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

export default DocumentVersioningSettings;
