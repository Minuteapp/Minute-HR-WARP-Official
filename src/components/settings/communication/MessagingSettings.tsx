import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, MessageSquare, FileUp, Bell, Clock, Save, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { toast } from "sonner";

const MessagingSettings = () => {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('communication');

  const handleSave = async () => {
    try {
      await saveSettings(settings);
      toast.success("Messaging-Einstellungen gespeichert");
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  const updateSetting = (key: string, value: any) => {
    if (settings) {
      settings[key] = value;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chat-Funktionen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat-Funktionen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Interner Chat aktivieren</Label>
              <p className="text-sm text-muted-foreground">1:1 Nachrichten zwischen Mitarbeitern</p>
            </div>
            <Switch 
              checked={getValue('internal_chat_enabled', true)}
              onCheckedChange={(checked) => updateSetting('internal_chat_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Gruppenchats aktivieren</Label>
              <p className="text-sm text-muted-foreground">Mehrteilnehmer-Unterhaltungen erlauben</p>
            </div>
            <Switch 
              checked={getValue('group_chat_enabled', true)}
              onCheckedChange={(checked) => updateSetting('group_chat_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Threads aktivieren</Label>
              <p className="text-sm text-muted-foreground">Antworten in separaten Threads</p>
            </div>
            <Switch 
              checked={getValue('threads_enabled', true)}
              onCheckedChange={(checked) => updateSetting('threads_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Erwähnungen (@mentions) aktivieren</Label>
              <p className="text-sm text-muted-foreground">Benutzer direkt in Nachrichten erwähnen</p>
            </div>
            <Switch 
              checked={getValue('mentions_enabled', true)}
              onCheckedChange={(checked) => updateSetting('mentions_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Datei-Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            Datei-Sharing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Datei-Sharing aktivieren</Label>
              <p className="text-sm text-muted-foreground">Dateien im Chat teilen</p>
            </div>
            <Switch 
              checked={getValue('file_sharing_enabled', true)}
              onCheckedChange={(checked) => updateSetting('file_sharing_enabled', checked)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-file-size">Maximale Dateigröße (MB)</Label>
              <Input 
                id="max-file-size" 
                type="number"
                value={getValue('max_file_size_mb', 25)}
                onChange={(e) => updateSetting('max_file_size_mb', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allowed-file-types">Erlaubte Dateitypen</Label>
              <Select 
                value={getValue('allowed_file_types', 'all')}
                onValueChange={(value) => updateSetting('allowed_file_types', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Dateitypen</SelectItem>
                  <SelectItem value="documents">Nur Dokumente</SelectItem>
                  <SelectItem value="images">Nur Bilder</SelectItem>
                  <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nachrichtenoptionen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Nachrichtenoptionen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Lesebestätigungen aktivieren</Label>
              <p className="text-sm text-muted-foreground">Anzeigen, wann Nachrichten gelesen wurden</p>
            </div>
            <Switch 
              checked={getValue('read_receipts_enabled', true)}
              onCheckedChange={(checked) => updateSetting('read_receipts_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Tipp-Indikatoren anzeigen</Label>
              <p className="text-sm text-muted-foreground">"schreibt..." Anzeige</p>
            </div>
            <Switch 
              checked={getValue('typing_indicators_enabled', true)}
              onCheckedChange={(checked) => updateSetting('typing_indicators_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Emoji-Reaktionen aktivieren</Label>
              <p className="text-sm text-muted-foreground">Auf Nachrichten mit Emojis reagieren</p>
            </div>
            <Switch 
              checked={getValue('emoji_reactions_enabled', true)}
              onCheckedChange={(checked) => updateSetting('emoji_reactions_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Nachrichten bearbeiten erlauben</Label>
              <p className="text-sm text-muted-foreground">Gesendete Nachrichten nachträglich ändern</p>
            </div>
            <Switch 
              checked={getValue('message_editing_enabled', true)}
              onCheckedChange={(checked) => updateSetting('message_editing_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Nachrichten löschen erlauben</Label>
              <p className="text-sm text-muted-foreground">Gesendete Nachrichten entfernen können</p>
            </div>
            <Switch 
              checked={getValue('message_deletion_enabled', true)}
              onCheckedChange={(checked) => updateSetting('message_deletion_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Aufbewahrung & Archivierung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Aufbewahrung & Archivierung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="retention-days">Nachrichtenaufbewahrung (Tage)</Label>
              <Input 
                id="retention-days" 
                type="number"
                value={getValue('message_retention_days', 365)}
                onChange={(e) => updateSetting('message_retention_days', parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">0 = Unbegrenzt</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="archive-after">Automatische Archivierung nach (Tagen)</Label>
              <Input 
                id="archive-after" 
                type="number"
                value={getValue('auto_archive_days', 90)}
                onChange={(e) => updateSetting('auto_archive_days', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Offline-Nachrichten aktivieren</Label>
              <p className="text-sm text-muted-foreground">Nachrichten auch offline speichern</p>
            </div>
            <Switch 
              checked={getValue('offline_messages_enabled', true)}
              onCheckedChange={(checked) => updateSetting('offline_messages_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Benachrichtigungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Messaging-Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Benachrichtigungstöne aktivieren</Label>
              <p className="text-sm text-muted-foreground">Akustische Signale bei neuen Nachrichten</p>
            </div>
            <Switch 
              checked={getValue('notification_sound_enabled', true)}
              onCheckedChange={(checked) => updateSetting('notification_sound_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Desktop-Benachrichtigungen</Label>
              <p className="text-sm text-muted-foreground">Push-Benachrichtigungen im Browser</p>
            </div>
            <Switch 
              checked={getValue('desktop_notifications_enabled', true)}
              onCheckedChange={(checked) => updateSetting('desktop_notifications_enabled', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quiet-hours">Ruhezeiten</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Von</Label>
                <Input 
                  type="time"
                  value={getValue('quiet_hours_start', '22:00')}
                  onChange={(e) => updateSetting('quiet_hours_start', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Bis</Label>
                <Input 
                  type="time"
                  value={getValue('quiet_hours_end', '07:00')}
                  onChange={(e) => updateSetting('quiet_hours_end', e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Speichern Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
};

export default MessagingSettings;
