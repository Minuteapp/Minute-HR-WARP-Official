import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Server, Send, Shield, Save, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { toast } from "sonner";

const EmailConfiguration = () => {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('communication');

  const handleSave = async () => {
    try {
      await saveSettings(settings);
      toast.success("E-Mail-Konfiguration gespeichert");
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
      {/* SMTP-Server Konfiguration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            SMTP-Server Konfiguration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-server">SMTP-Server</Label>
              <Input 
                id="smtp-server" 
                placeholder="smtp.example.com"
                value={getValue('smtp_server', '')}
                onChange={(e) => updateSetting('smtp_server', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-port">SMTP-Port</Label>
              <Input 
                id="smtp-port" 
                type="number"
                placeholder="587"
                value={getValue('smtp_port', 587)}
                onChange={(e) => updateSetting('smtp_port', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-username">SMTP-Benutzername</Label>
              <Input 
                id="smtp-username" 
                placeholder="user@example.com"
                value={getValue('smtp_username', '')}
                onChange={(e) => updateSetting('smtp_username', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-password">SMTP-Passwort</Label>
              <Input 
                id="smtp-password" 
                type="password"
                placeholder="••••••••"
                value={getValue('smtp_password', '')}
                onChange={(e) => updateSetting('smtp_password', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SSL/TLS verwenden</Label>
              <p className="text-sm text-muted-foreground">Verschlüsselte Verbindung zum Mailserver</p>
            </div>
            <Switch 
              checked={getValue('smtp_use_ssl', true)}
              onCheckedChange={(checked) => updateSetting('smtp_use_ssl', checked)}
            />
          </div>

          <Button variant="outline" className="w-full">
            Verbindung testen
          </Button>
        </CardContent>
      </Card>

      {/* Absender-Konfiguration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Absender-Konfiguration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sender-email">Absender E-Mail</Label>
              <Input 
                id="sender-email" 
                type="email"
                placeholder="noreply@ihr-unternehmen.de"
                value={getValue('sender_email', '')}
                onChange={(e) => updateSetting('sender_email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sender-name">Absender Name</Label>
              <Input 
                id="sender-name" 
                placeholder="Ihr Unternehmen"
                value={getValue('sender_name', '')}
                onChange={(e) => updateSetting('sender_name', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reply-to">Antwort-Adresse (Reply-To)</Label>
            <Input 
              id="reply-to" 
              type="email"
              placeholder="support@ihr-unternehmen.de"
              value={getValue('reply_to_email', '')}
              onChange={(e) => updateSetting('reply_to_email', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-footer">E-Mail-Signatur / Footer</Label>
            <Textarea 
              id="email-footer"
              placeholder="Ihre E-Mail-Signatur hier eingeben..."
              value={getValue('email_footer_text', '')}
              onChange={(e) => updateSetting('email_footer_text', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* E-Mail Funktionen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            E-Mail Funktionen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>E-Mail-Signatur aktivieren</Label>
              <p className="text-sm text-muted-foreground">Automatische Signatur am Ende jeder E-Mail</p>
            </div>
            <Switch 
              checked={getValue('email_signature_enabled', true)}
              onCheckedChange={(checked) => updateSetting('email_signature_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>E-Mail-Tracking aktivieren</Label>
              <p className="text-sm text-muted-foreground">Öffnungsraten und Klicks verfolgen</p>
            </div>
            <Switch 
              checked={getValue('email_tracking_enabled', false)}
              onCheckedChange={(checked) => updateSetting('email_tracking_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Abmelde-Link einfügen</Label>
              <p className="text-sm text-muted-foreground">DSGVO-konformer Unsubscribe-Link</p>
            </div>
            <Switch 
              checked={getValue('unsubscribe_link_enabled', true)}
              onCheckedChange={(checked) => updateSetting('unsubscribe_link_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Bounce-Handling aktivieren</Label>
              <p className="text-sm text-muted-foreground">Nicht zustellbare E-Mails automatisch verarbeiten</p>
            </div>
            <Switch 
              checked={getValue('bounce_handling_enabled', true)}
              onCheckedChange={(checked) => updateSetting('bounce_handling_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sicherheit & Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sicherheit & Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="daily-limit">Tägliches E-Mail-Limit</Label>
              <Input 
                id="daily-limit" 
                type="number"
                placeholder="1000"
                value={getValue('daily_email_limit', 1000)}
                onChange={(e) => updateSetting('daily_email_limit', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate-limit">Rate-Limit (E-Mails/Minute)</Label>
              <Input 
                id="rate-limit" 
                type="number"
                placeholder="10"
                value={getValue('email_rate_limit', 10)}
                onChange={(e) => updateSetting('email_rate_limit', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="encryption">E-Mail-Verschlüsselung</Label>
            <Select 
              value={getValue('email_encryption', 'tls')}
              onValueChange={(value) => updateSetting('email_encryption', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Verschlüsselung auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine</SelectItem>
                <SelectItem value="tls">TLS</SelectItem>
                <SelectItem value="ssl">SSL</SelectItem>
                <SelectItem value="starttls">STARTTLS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SPF/DKIM Validierung</Label>
              <p className="text-sm text-muted-foreground">E-Mail-Authentifizierung aktivieren</p>
            </div>
            <Switch 
              checked={getValue('spf_dkim_enabled', true)}
              onCheckedChange={(checked) => updateSetting('spf_dkim_enabled', checked)}
            />
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

export default EmailConfiguration;
