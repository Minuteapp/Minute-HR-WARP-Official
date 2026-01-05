import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Globe, Database, Mail, FileText, Loader2, Save } from "lucide-react";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { toast } from "sonner";

const SystemSettings = () => {
  const { settings, loading, saveSettings } = useEffectiveSettings('system');
  const [saving, setSaving] = useState(false);

  // Local state for form fields
  const [localSettings, setLocalSettings] = useState({
    language: 'de',
    timezone: 'Europe/Berlin',
    date_format: 'DD.MM.YYYY',
    time_format: 'HH:mm',
    first_day_of_week: 'monday',
    maintenance_mode: false,
    maintenance_message: 'System wird gewartet',
    debug_logging: false,
    log_retention_days: 90,
    auto_backup: true,
    backup_frequency: 'daily',
    backup_retention_days: 30,
    email_from_address: 'noreply@company.de',
    email_from_name: 'HR System',
    max_upload_size_mb: 25,
    allowed_file_types: 'pdf,doc,docx,xls,xlsx,jpg,png'
  });

  // Initialize from DB settings
  useEffect(() => {
    if (settings && Array.isArray(settings) && settings.length > 0) {
      const newSettings = { ...localSettings };
      settings.forEach((setting: any) => {
        const key = setting.key;
        if (key in newSettings) {
          const value = setting.effective_value ?? setting.default_value;
          if (typeof newSettings[key as keyof typeof newSettings] === 'boolean') {
            (newSettings as any)[key] = value === true || value === 'true';
          } else if (typeof newSettings[key as keyof typeof newSettings] === 'number') {
            (newSettings as any)[key] = Number(value) || 0;
          } else {
            (newSettings as any)[key] = String(value).replace(/^"|"$/g, '');
          }
        }
      });
      setLocalSettings(newSettings);
    }
  }, [settings]);

  const handleChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsToSave = Object.entries(localSettings).map(([key, value]) => ({
        key,
        value: typeof value === 'string' ? value : value
      }));
      await saveSettings(settingsToSave);
      toast.success('Systemeinstellungen gespeichert');
    } catch (error) {
      toast.error('Fehler beim Speichern der Einstellungen');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Systemeinstellungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="localization" className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full max-w-2xl">
              <TabsTrigger value="localization">Lokalisierung</TabsTrigger>
              <TabsTrigger value="maintenance">Wartung</TabsTrigger>
              <TabsTrigger value="backup">Backup</TabsTrigger>
              <TabsTrigger value="email">E-Mail</TabsTrigger>
              <TabsTrigger value="files">Dateien</TabsTrigger>
            </TabsList>

            <TabsContent value="localization" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Globe className="h-4 w-4" />
                    Lokalisierung & Format
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Sprache</Label>
                      <Select value={localSettings.language} onValueChange={(v) => handleChange('language', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="de">Deutsch</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Zeitzone</Label>
                      <Select value={localSettings.timezone} onValueChange={(v) => handleChange('timezone', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                          <SelectItem value="Europe/Vienna">Europe/Vienna</SelectItem>
                          <SelectItem value="Europe/Zurich">Europe/Zurich</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Datumsformat</Label>
                      <Select value={localSettings.date_format} onValueChange={(v) => handleChange('date_format', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Zeitformat</Label>
                      <Select value={localSettings.time_format} onValueChange={(v) => handleChange('time_format', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HH:mm">24-Stunden (HH:mm)</SelectItem>
                          <SelectItem value="hh:mm A">12-Stunden (hh:mm AM/PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Erster Wochentag</Label>
                      <Select value={localSettings.first_day_of_week} onValueChange={(v) => handleChange('first_day_of_week', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monday">Montag</SelectItem>
                          <SelectItem value="sunday">Sonntag</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Settings className="h-4 w-4" />
                    Wartung & Logging
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Wartungsmodus</Label>
                      <p className="text-sm text-muted-foreground">System für Benutzer sperren</p>
                    </div>
                    <Switch
                      checked={localSettings.maintenance_mode}
                      onCheckedChange={(v) => handleChange('maintenance_mode', v)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Wartungsnachricht</Label>
                    <Input
                      value={localSettings.maintenance_message}
                      onChange={(e) => handleChange('maintenance_message', e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Debug-Logging</Label>
                      <p className="text-sm text-muted-foreground">Erweiterte Protokollierung aktivieren</p>
                    </div>
                    <Switch
                      checked={localSettings.debug_logging}
                      onCheckedChange={(v) => handleChange('debug_logging', v)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Log-Aufbewahrung (Tage)</Label>
                    <Input
                      type="number"
                      value={localSettings.log_retention_days}
                      onChange={(e) => handleChange('log_retention_days', parseInt(e.target.value) || 90)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="backup" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Database className="h-4 w-4" />
                    Backup-Einstellungen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Automatisches Backup</Label>
                      <p className="text-sm text-muted-foreground">Regelmäßige Datensicherung</p>
                    </div>
                    <Switch
                      checked={localSettings.auto_backup}
                      onCheckedChange={(v) => handleChange('auto_backup', v)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Backup-Häufigkeit</Label>
                    <Select value={localSettings.backup_frequency} onValueChange={(v) => handleChange('backup_frequency', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Stündlich</SelectItem>
                        <SelectItem value="daily">Täglich</SelectItem>
                        <SelectItem value="weekly">Wöchentlich</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Backup-Aufbewahrung (Tage)</Label>
                    <Input
                      type="number"
                      value={localSettings.backup_retention_days}
                      onChange={(e) => handleChange('backup_retention_days', parseInt(e.target.value) || 30)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Mail className="h-4 w-4" />
                    E-Mail-Einstellungen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Absender E-Mail-Adresse</Label>
                    <Input
                      type="email"
                      value={localSettings.email_from_address}
                      onChange={(e) => handleChange('email_from_address', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Absender Name</Label>
                    <Input
                      value={localSettings.email_from_name}
                      onChange={(e) => handleChange('email_from_name', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" />
                    Datei-Einstellungen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Max. Upload-Größe (MB)</Label>
                    <Input
                      type="number"
                      value={localSettings.max_upload_size_mb}
                      onChange={(e) => handleChange('max_upload_size_mb', parseInt(e.target.value) || 25)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Erlaubte Dateitypen</Label>
                    <Input
                      value={localSettings.allowed_file_types}
                      onChange={(e) => handleChange('allowed_file_types', e.target.value)}
                      placeholder="pdf,doc,docx,xls,xlsx,jpg,png"
                    />
                    <p className="text-xs text-muted-foreground">Kommagetrennte Dateiendungen</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Einstellungen speichern
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
