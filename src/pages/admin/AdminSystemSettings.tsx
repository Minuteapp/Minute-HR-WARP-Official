import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Database, Bell, Globe, DollarSign, Check } from "lucide-react";

export default function AdminSystemSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">System-Einstellungen</h1>
            <Badge variant="secondary">Vorschau</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Globale Konfiguration • Standardwerte • Benachrichtigungen
          </p>
        </div>
      </div>

      {/* Globale Einstellungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            Globale Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Standard-Währung</Label>
              <Select defaultValue="eur">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="gbp">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rechnungsintervall (Standard)</Label>
              <Select defaultValue="monthly">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monatlich</SelectItem>
                  <SelectItem value="quarterly">Vierteljährlich</SelectItem>
                  <SelectItem value="yearly">Jährlich</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Stripe API-Key (Live)</Label>
            <Input
              type="password"
              placeholder="sk_live_..."
              defaultValue="sk_live_..."
            />
            <p className="text-xs text-muted-foreground">
              Aktuell im Dummy-Modus. Fügen Sie Ihren Stripe API-Key hinzu für Live-Zahlungen.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>DSGVO-Region</Label>
              <Select defaultValue="eu">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eu">EU (Deutschland)</SelectItem>
                  <SelectItem value="us">USA</SelectItem>
                  <SelectItem value="uk">UK</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Standard-Admin-Rolle</Label>
              <Select defaultValue="admin">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Firmen-Admin</SelectItem>
                  <SelectItem value="subadmin">Sub-Admin</SelectItem>
                  <SelectItem value="billing">Billing-Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Einstellungen speichern
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mandanten-Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Mandanten-Limits (Standard)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Max. Mitarbeiter</Label>
              <Input type="number" defaultValue="1000" />
            </div>

            <div className="space-y-2">
              <Label>Max. Speicher (MB)</Label>
              <Input type="number" defaultValue="50000" />
            </div>

            <div className="space-y-2">
              <Label>Backup-Frequenz</Label>
              <Select defaultValue="daily">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Täglich</SelectItem>
                  <SelectItem value="weekly">Wöchentlich</SelectItem>
                  <SelectItem value="monthly">Monatlich</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Inaktive-Mandanten-Benachrichtigung (Tage)</Label>
            <div className="flex items-center gap-4">
              <Input type="number" defaultValue="30" className="max-w-[200px]" />
              <Badge variant="secondary">Vorschau</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Automatische E-Mail an Mandanten nach X Tagen Inaktivität
            </p>
          </div>
        </CardContent>
      </Card>

      {/* E-Mail-Benachrichtigungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-600" />
            E-Mail-Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <h4 className="font-medium">Neuer Mandant angelegt</h4>
              <p className="text-sm text-muted-foreground">
                Benachrichtigung an Superadmin bei neuem Mandanten
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <h4 className="font-medium">Zahlungsfehler</h4>
              <p className="text-sm text-muted-foreground">
                Benachrichtigung bei fehlgeschlagenen Zahlungen
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <h4 className="font-medium">Inaktive Mandanten</h4>
              <p className="text-sm text-muted-foreground">
                Wöchentliche Übersicht über inaktive Mandanten
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="font-medium">System-Alarme</h4>
              <p className="text-sm text-muted-foreground">
                Kritische Systemfehler und Warnungen
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex justify-end pt-2">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Benachrichtigungen speichern
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modul-Konfiguration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-green-600" />
            Modul-Konfiguration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Definieren Sie, welche Module standardmäßig für neue Mandanten aktiviert werden.
          </p>
          <div className="grid grid-cols-3 gap-6">
            <div className="flex items-center justify-between">
              <span className="text-sm">Mitarbeiterverwaltung</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Zeiterfassung</span>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Abwesenheiten</span>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Lohnabrechnung</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Schichtplanung</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Dokumente</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Berichtswesen</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">KI-Analysen</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Mobile App</span>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preisstruktur */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-600" />
            Preisstruktur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {/* Trial */}
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Trial</h3>
                <div className="text-2xl font-bold mb-4">€0 / Monat</div>
                <p className="text-sm text-muted-foreground mb-4">14 Tage kostenlos</p>
              </CardContent>
            </Card>

            {/* Basic */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Basic</h3>
                <div className="text-2xl font-bold mb-4">€49 / Monat</div>
                <p className="text-sm text-muted-foreground mb-4">Bis 50 Mitarbeiter</p>
              </CardContent>
            </Card>

            {/* Premium */}
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Premium</h3>
                <div className="text-2xl font-bold mb-4">€99 / Monat</div>
                <p className="text-sm text-muted-foreground mb-4">Bis 250 Mitarbeiter</p>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Enterprise</h3>
                <div className="text-2xl font-bold mb-4">€199 / Monat</div>
                <p className="text-sm text-muted-foreground mb-4">Unbegrenzt</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
