import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePermissionContext } from "@/contexts/PermissionContext";
import { QrCode, Smartphone, CreditCard, Fingerprint, Calendar, Wifi } from "lucide-react";

export default function RecordingMethodsSettings() {
  const { hasPermission } = usePermissionContext();
  const canManage = hasPermission('timetracking', 'manage');

  return (
    <div className="space-y-6">
      {/* QR-Code Check-in/out */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR-Code Check-in/out
          </CardTitle>
          <CardDescription>
            Mitarbeiter scannen QR-Codes beim Betreten/Verlassen des Unternehmens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="qr-enabled">QR-Code Erfassung aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                QR-Code basierte Zeiterfassung für Standorte
              </p>
            </div>
            <Switch id="qr-enabled" disabled={!canManage} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qr-rotation">QR-Code Rotation</Label>
              <Select disabled={!canManage}>
                <SelectTrigger>
                  <SelectValue placeholder="Rotationsintervall..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Täglich</SelectItem>
                  <SelectItem value="shift">Pro Schicht</SelectItem>
                  <SelectItem value="hourly">Stündlich</SelectItem>
                  <SelectItem value="static">Statisch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qr-locations">Anzahl Standorte</Label>
              <Input
                id="qr-locations"
                type="number"
                placeholder="5"
                disabled={!canManage}
              />
            </div>
          </div>

          <Button variant="outline" disabled={!canManage}>
            QR-Codes generieren
          </Button>
        </CardContent>
      </Card>

      {/* Smartphone-App mit GPS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Smartphone-App mit GPS
          </CardTitle>
          <CardDescription>
            Standortbasierte Zeiterfassung über mobile Anwendung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="gps-enabled">GPS-Erfassung aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Zeiterfassung nur an autorisierten Standorten
              </p>
            </div>
            <Switch id="gps-enabled" disabled={!canManage} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gps-radius">Erfassungsradius (m)</Label>
              <Input
                id="gps-radius"
                type="number"
                placeholder="100"
                disabled={!canManage}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gps-accuracy">GPS-Genauigkeit (m)</Label>
              <Input
                id="gps-accuracy"
                type="number"
                placeholder="10"
                disabled={!canManage}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="gps-privacy">Datenschutz-Modus</Label>
              <p className="text-sm text-muted-foreground">
                Standortdaten nur für Validierung, nicht dauerhaft speichern
              </p>
            </div>
            <Switch id="gps-privacy" defaultChecked disabled={!canManage} />
          </div>

          <div className="space-y-2">
            <Label>Autorisierte Standorte</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge>Hauptsitz München</Badge>
              <Badge>Filiale Berlin</Badge>
              <Badge>Werk Hamburg</Badge>
            </div>
            <Button variant="outline" size="sm" disabled={!canManage}>
              Standort hinzufügen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mitarbeiter-ID-Terminal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Mitarbeiter-ID-Terminal
          </CardTitle>
          <CardDescription>
            Klassische Terminal-Erfassung mit Karten und Chips
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="terminal-enabled">Terminal-Erfassung aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Stechuhr-Funktion mit ID-Karten
              </p>
            </div>
            <Switch id="terminal-enabled" disabled={!canManage} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="nfc-support" disabled={!canManage} />
              <Label htmlFor="nfc-support">NFC-Unterstützung</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="rfid-support" disabled={!canManage} />
              <Label htmlFor="rfid-support">RFID-Unterstützung</Label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="offline-mode">Offline-Modus</Label>
              <p className="text-sm text-muted-foreground">
                Synchronisation sobald Internet verfügbar
              </p>
            </div>
            <Switch id="offline-mode" defaultChecked disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

      {/* Biometrische Erfassung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            Biometrische Erfassung
          </CardTitle>
          <CardDescription>
            Fingerabdruck und Gesichtserkennung (DSGVO-konform)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="biometric-enabled">Biometrische Erfassung</Label>
              <p className="text-sm text-muted-foreground">
                Fingerabdruck oder Gesichtserkennung aktivieren
              </p>
            </div>
            <Switch id="biometric-enabled" disabled={!canManage} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="fingerprint" disabled={!canManage} />
              <Label htmlFor="fingerprint">Fingerabdruck</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="face-recognition" disabled={!canManage} />
              <Label htmlFor="face-recognition">Gesichtserkennung</Label>
            </div>
          </div>

          <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
            <h4 className="font-medium text-orange-800 mb-1">DSGVO-Hinweis</h4>
            <p className="text-sm text-orange-700">
              Biometrische Daten sind besondere Kategorien personenbezogener Daten. 
              Einverständniserklärung der Mitarbeiter erforderlich.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Automatische Erfassung via Schichtplanung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Automatische Erfassung via Schichtplanung
          </CardTitle>
          <CardDescription>
            Geplante Arbeitszeiten werden automatisch erfasst
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-scheduling">Automatische Schichterfassung</Label>
              <p className="text-sm text-muted-foreground">
                Geplante Schichtzeiten automatisch als Arbeitszeit buchen
              </p>
            </div>
            <Switch id="auto-scheduling" disabled={!canManage} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deviation-handling">Behandlung von Abweichungen</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Abweichungsmodus wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="log-only">Nur protokollieren</SelectItem>
                <SelectItem value="require-approval">Genehmigung erforderlich</SelectItem>
                <SelectItem value="auto-adjust">Automatisch anpassen</SelectItem>
                <SelectItem value="notify">Benachrichtigung senden</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tolerance-early">Toleranz früh (Min.)</Label>
              <Input
                id="tolerance-early"
                type="number"
                placeholder="15"
                disabled={!canManage}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tolerance-late">Toleranz spät (Min.)</Label>
              <Input
                id="tolerance-late"
                type="number"
                placeholder="15"
                disabled={!canManage}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}