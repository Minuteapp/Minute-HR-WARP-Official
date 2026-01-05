import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Smartphone, Mail, Bell, MessageSquare, QrCode, MapPin } from "lucide-react";

export default function NotificationChannelsSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Push-Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Push-Benachrichtigungen aktivieren</Label>
              <p className="text-sm text-muted-foreground">Mobile App Benachrichtigungen</p>
            </div>
            <Switch />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stille Stunden (Von)</Label>
              <Input type="time" defaultValue="22:00" />
            </div>
            <div className="space-y-2">
              <Label>Stille Stunden (Bis)</Label>
              <Input type="time" defaultValue="07:00" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            E-Mail-Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>E-Mail-Benachrichtigungen aktivieren</Label>
              <p className="text-sm text-muted-foreground">SMTP-basierte E-Mails</p>
            </div>
            <Switch />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SMTP Server</Label>
              <Input placeholder="smtp.example.com" />
            </div>
            <div className="space-y-2">
              <Label>Port</Label>
              <Input placeholder="587" />
            </div>
            <div className="space-y-2">
              <Label>Benutzername</Label>
              <Input placeholder="noreply@unternehmen.de" />
            </div>
            <div className="space-y-2">
              <Label>Verschlüsselung</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tls">TLS</SelectItem>
                  <SelectItem value="ssl">SSL</SelectItem>
                  <SelectItem value="none">Keine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            In-App-Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Notification Center aktivieren</Label>
              <p className="text-sm text-muted-foreground">Interne Nachrichten-Zentrale</p>
            </div>
            <Switch />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Aufbewahrungsdauer (Tage)</Label>
              <Input placeholder="30" type="number" />
            </div>
            <div className="space-y-2">
              <Label>Max. Nachrichten pro Benutzer</Label>
              <Input placeholder="100" type="number" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            SMS-Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>SMS-Provider aktivieren</Label>
              <p className="text-sm text-muted-foreground">Kostenpflichtige SMS-Benachrichtigungen</p>
            </div>
            <Switch />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SMS Provider</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Provider wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twilio">Twilio</SelectItem>
                  <SelectItem value="messagebird">MessageBird</SelectItem>
                  <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>API-Schlüssel</Label>
              <Input placeholder="API Key eingeben" type="password" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            QR-Code Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>QR-Code Benachrichtigungen</Label>
              <p className="text-sm text-muted-foreground">Automatische Nachrichten bei Terminal-Scans</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Standortbasierte Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Geofencing aktivieren</Label>
              <p className="text-sm text-muted-foreground">Warnungen in Risikozonen</p>
            </div>
            <Switch />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Radius (Meter)</Label>
              <Input placeholder="100" type="number" />
            </div>
            <div className="space-y-2">
              <Label>Aktualisierungsintervall (Sekunden)</Label>
              <Input placeholder="30" type="number" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Zurücksetzen</Button>
        <Button>Einstellungen speichern</Button>
      </div>
    </div>
  );
}