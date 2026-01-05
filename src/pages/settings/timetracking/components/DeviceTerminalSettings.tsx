import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePermissionContext } from "@/contexts/PermissionContext";
import { Monitor, Wifi, WifiOff, Clock, Settings } from "lucide-react";

export default function DeviceTerminalSettings() {
  const { hasPermission } = usePermissionContext();
  const canManage = hasPermission('timetracking', 'manage');

  return (
    <div className="space-y-6">
      {/* Registrierte Terminals */}
      <Card>
        <CardHeader>
          <CardTitle>Registrierte Terminals</CardTitle>
          <CardDescription>
            Verwaltung aller registrierten Zeiterfassungsterminals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Terminal 1 */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Monitor className="h-5 w-5" />
                  <div>
                    <h4 className="font-medium">Terminal Haupteingang</h4>
                    <p className="text-sm text-muted-foreground">ID: TER-001 | IP: 192.168.1.100</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-green-500" />
                  <Badge variant="secondary">Online</Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Letzter Sync:</span>
                  <p>Vor 2 Minuten</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Standort:</span>
                  <p>München Hauptsitz</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Typ:</span>
                  <p>NFC/RFID</p>
                </div>
              </div>
            </div>

            {/* Terminal 2 */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Monitor className="h-5 w-5" />
                  <div>
                    <h4 className="font-medium">Terminal Werk A</h4>
                    <p className="text-sm text-muted-foreground">ID: TER-002 | IP: 192.168.2.50</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <Badge variant="destructive">Offline</Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Letzter Sync:</span>
                  <p>Vor 45 Minuten</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Standort:</span>
                  <p>Berlin Werk</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Typ:</span>
                  <p>Biometrisch</p>
                </div>
              </div>
            </div>

            {/* Terminal 3 */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Monitor className="h-5 w-5" />
                  <div>
                    <h4 className="font-medium">Terminal Kantine</h4>
                    <p className="text-sm text-muted-foreground">ID: TER-003 | IP: 192.168.1.105</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-green-500" />
                  <Badge variant="secondary">Online</Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Letzter Sync:</span>
                  <p>Vor 1 Minute</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Standort:</span>
                  <p>München Hauptsitz</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Typ:</span>
                  <p>QR-Code</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button disabled={!canManage}>Neues Terminal hinzufügen</Button>
            <Button variant="outline" disabled={!canManage}>Alle synchronisieren</Button>
          </div>
        </CardContent>
      </Card>

      {/* Terminal-Konfiguration */}
      <Card>
        <CardHeader>
          <CardTitle>Terminal-Konfiguration</CardTitle>
          <CardDescription>
            Globale Einstellungen für alle Terminals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sync-interval">Synchronisationsintervall (Min.)</Label>
              <Input
                id="sync-interval"
                type="number"
                placeholder="5"
                disabled={!canManage}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offline-buffer">Offline-Puffer (Tage)</Label>
              <Input
                id="offline-buffer"
                type="number"
                placeholder="7"
                disabled={!canManage}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-discovery">Automatische Erkennung</Label>
              <p className="text-sm text-muted-foreground">
                Neue Terminals automatisch im Netzwerk erkennen
              </p>
            </div>
            <Switch id="auto-discovery" disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="remote-config">Remote-Konfiguration</Label>
              <p className="text-sm text-muted-foreground">
                Terminals können zentral konfiguriert werden
              </p>
            </div>
            <Switch id="remote-config" defaultChecked disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

      {/* Hardware-Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Hardware-Integration</CardTitle>
          <CardDescription>
            API-Integration für Hardware-Hersteller
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Unterstützte Hardware</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">dormakaba</h4>
                  <Badge variant="secondary">Aktiv</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Zutrittskontrolle & Zeiterfassung</p>
              </div>
              
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">ISGUS</h4>
                  <Badge>Konfiguriert</Badge>
                </div>
                <p className="text-sm text-muted-foreground">ZEUS Zeiterfassungsterminals</p>
              </div>
              
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">SAP Terminals</h4>
                  <Badge variant="outline">Verfügbar</Badge>
                </div>
                <p className="text-sm text-muted-foreground">SAP-kompatible Terminals</p>
              </div>
              
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">HID Global</h4>
                  <Badge variant="outline">Verfügbar</Badge>
                </div>
                <p className="text-sm text-muted-foreground">RFID/NFC Lesegeräte</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-endpoint">API-Endpunkt</Label>
            <Input
              id="api-endpoint"
              placeholder="https://api.ihre-domain.de/timetracking"
              disabled={!canManage}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hardware-vendor">Hardware-Hersteller</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Hersteller wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dormakaba">dormakaba</SelectItem>
                <SelectItem value="isgus">ISGUS</SelectItem>
                <SelectItem value="sap">SAP</SelectItem>
                <SelectItem value="hid">HID Global</SelectItem>
                <SelectItem value="bosch">Bosch Security</SelectItem>
                <SelectItem value="custom">Benutzerdefiniert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" disabled={!canManage}>
            Hardware-Integration testen
          </Button>
        </CardContent>
      </Card>

      {/* Standort-Management */}
      <Card>
        <CardHeader>
          <CardTitle>Standort-Management</CardTitle>
          <CardDescription>
            Verwaltung von Terminals nach Standorten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">München Hauptsitz</h4>
                <Badge>3 Terminals</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Adresse:</span>
                  <p>Musterstraße 1, 80331 München</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Zeitzone:</span>
                  <p>Europe/Berlin</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="text-green-600">Alle online</p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Berlin Werk</h4>
                <Badge variant="destructive">1 Offline</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Adresse:</span>
                  <p>Industriestraße 10, 10115 Berlin</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Zeitzone:</span>
                  <p>Europe/Berlin</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="text-red-600">Terminal-002 offline</p>
                </div>
              </div>
            </div>
          </div>

          <Button disabled={!canManage}>Neuen Standort hinzufügen</Button>
        </CardContent>
      </Card>

      {/* Sicherheit & Wartung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Sicherheit & Wartung
          </CardTitle>
          <CardDescription>
            Sicherheitseinstellungen und Wartungsoptionen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="encryption">Datenübertragung verschlüsseln</Label>
              <p className="text-sm text-muted-foreground">
                TLS 1.3 Verschlüsselung für alle Terminal-Verbindungen
              </p>
            </div>
            <Switch id="encryption" defaultChecked disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="certificate-auth">Zertifikat-Authentifizierung</Label>
              <p className="text-sm text-muted-foreground">
                Terminals müssen gültige Zertifikate verwenden
              </p>
            </div>
            <Switch id="certificate-auth" disabled={!canManage} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maintenance-window">Wartungsfenster</Label>
              <Select disabled={!canManage}>
                <SelectTrigger>
                  <SelectValue placeholder="Zeitfenster wählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="night">02:00-04:00 Uhr</SelectItem>
                  <SelectItem value="weekend">Wochenende</SelectItem>
                  <SelectItem value="manual">Manuell</SelectItem>
                  <SelectItem value="never">Nie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="firmware-updates">Firmware-Updates</Label>
              <Select disabled={!canManage}>
                <SelectTrigger>
                  <SelectValue placeholder="Update-Modus..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Automatisch</SelectItem>
                  <SelectItem value="staged">Stufenweise</SelectItem>
                  <SelectItem value="manual">Manuell</SelectItem>
                  <SelectItem value="never">Deaktiviert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" disabled={!canManage}>
              Wartung planen
            </Button>
            <Button variant="outline" disabled={!canManage}>
              Diagnose ausführen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}