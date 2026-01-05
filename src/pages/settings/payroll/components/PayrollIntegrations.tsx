import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, Save, RefreshCw, CheckCircle, AlertCircle, Settings } from "lucide-react";

const PayrollIntegrations: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Link className="h-5 w-5" />
          Integrationen
        </h2>
        <p className="text-sm text-muted-foreground">
          Anbindung an externe Lohnabrechnungssysteme und Buchhaltungssoftware
        </p>
      </div>

      <div className="grid gap-6">
        {/* Verfügbare Integrationen */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Verfügbare Integrationen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* DATEV */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-xs">D</span>
                    </div>
                    <div>
                      <Label className="font-medium">DATEV</Label>
                      <p className="text-xs text-muted-foreground">Deutschland</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Verbunden</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Automatischer Export</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Letzte Synchronisation: vor 2 Std.</span>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Konfigurieren
                </Button>
              </div>

              {/* SevDesk */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                      <span className="text-green-600 font-bold text-xs">S</span>
                    </div>
                    <div>
                      <Label className="font-medium">SevDesk</Label>
                      <p className="text-xs text-muted-foreground">Deutschland</p>
                    </div>
                  </div>
                  <Badge variant="outline">Verfügbar</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Automatischer Export</span>
                  <Switch />
                </div>
                <div className="text-xs text-muted-foreground">
                  Buchhaltung & Lohnabrechnung in einem System
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  Verbinden
                </Button>
              </div>

              {/* Personio */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-xs">P</span>
                    </div>
                    <div>
                      <Label className="font-medium">Personio</Label>
                      <p className="text-xs text-muted-foreground">HR-Suite</p>
                    </div>
                  </div>
                  <Badge variant="outline">Verfügbar</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Bidirektionale Sync</span>
                  <Switch />
                </div>
                <div className="text-xs text-muted-foreground">
                  Mitarbeiterdaten & Lohnabrechnung
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  Verbinden
                </Button>
              </div>

              {/* SAP SuccessFactors */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-xs">SAP</span>
                    </div>
                    <div>
                      <Label className="font-medium">SAP SuccessFactors</Label>
                      <p className="text-xs text-muted-foreground">Enterprise</p>
                    </div>
                  </div>
                  <Badge variant="destructive">Fehler</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enterprise-Integration</span>
                  <Switch />
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-xs text-red-600">Verbindung fehlgeschlagen</span>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Reparieren
                </Button>
              </div>

              {/* Lexware */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-xs">L</span>
                    </div>
                    <div>
                      <Label className="font-medium">Lexware</Label>
                      <p className="text-xs text-muted-foreground">Lohn & Gehalt</p>
                    </div>
                  </div>
                  <Badge variant="outline">Verfügbar</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Export-Integration</span>
                  <Switch />
                </div>
                <div className="text-xs text-muted-foreground">
                  CSV/XML Export für Lexware Lohn
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  Verbinden
                </Button>
              </div>

              {/* Custom API */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-gray-600 font-bold text-xs">API</span>
                    </div>
                    <div>
                      <Label className="font-medium">Custom API</Label>
                      <p className="text-xs text-muted-foreground">Individuelle Lösung</p>
                    </div>
                  </div>
                  <Badge variant="outline">Konfigurierbar</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">REST/GraphQL API</span>
                  <Switch />
                </div>
                <div className="text-xs text-muted-foreground">
                  Für individuelle Systemanbindungen
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  Konfigurieren
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DATEV Konfiguration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              DATEV Integration
              <Badge variant="secondary">Aktiv</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="datev-mandant">Mandanten-Nr.</Label>
                  <Input id="datev-mandant" defaultValue="12345" />
                </div>
                <div>
                  <Label htmlFor="datev-benutzer">Benutzername</Label>
                  <Input id="datev-benutzer" defaultValue="hr_export" />
                </div>
                <div>
                  <Label htmlFor="datev-passwort">Passwort</Label>
                  <Input id="datev-passwort" type="password" placeholder="••••••••" />
                </div>
                <div>
                  <Label>Exportformat</Label>
                  <Select defaultValue="ascii">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ascii">DATEV ASCII</SelectItem>
                      <SelectItem value="xml">DATEV XML</SelectItem>
                      <SelectItem value="csv">CSV (kompatibel)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatischer Export</Label>
                    <p className="text-sm text-muted-foreground">Monatlich am Monatsende</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div>
                  <Label>Export-Zeitpunkt</Label>
                  <Select defaultValue="end_month">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="end_month">Letzter Tag des Monats</SelectItem>
                      <SelectItem value="first_workday">Erster Arbeitstag des Folgemonats</SelectItem>
                      <SelectItem value="manual">Manuell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>E-Mail-Benachrichtigung</Label>
                    <p className="text-sm text-muted-foreground">Bei erfolgreichem Export</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium text-green-800">Verbindung aktiv</p>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Letzter Export: 15.01.2024 um 23:45 Uhr (142 Datensätze)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Verbindung testen
              </Button>
              <Button size="sm" variant="outline">
                Manueller Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Synchronisationsregeln */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Synchronisationsregeln</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label className="font-medium">Import-Einstellungen</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mitarbeiterstammdaten</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Steuerklassen</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Freibeträge</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Bankverbindungen</span>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Import-Häufigkeit</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Stündlich</SelectItem>
                      <SelectItem value="daily">Täglich</SelectItem>
                      <SelectItem value="weekly">Wöchentlich</SelectItem>
                      <SelectItem value="manual">Manuell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="font-medium">Export-Einstellungen</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Lohnabrechnungen</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Buchungsdaten</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Steuerreports</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sozialversicherung</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Konfliktbehandlung</Label>
                  <Select defaultValue="manual">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="external">Externes System hat Vorrang</SelectItem>
                      <SelectItem value="internal">Internes System hat Vorrang</SelectItem>
                      <SelectItem value="manual">Manuelle Auflösung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Webhook Konfiguration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Webhooks & Echtzeit-Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Eingehende Webhooks</Label>
                  <Switch defaultChecked />
                </div>
                <div>
                  <Label className="text-sm">Webhook-URL</Label>
                  <Input 
                    defaultValue="https://ihr-system.de/api/webhooks/payroll" 
                    readOnly 
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label className="text-sm">Secret Key</Label>
                  <div className="flex gap-2">
                    <Input type="password" defaultValue="••••••••••••••••" readOnly />
                    <Button size="sm" variant="outline">Neu generieren</Button>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Ausgehende Webhooks</Label>
                  <Switch />
                </div>
                <div>
                  <Label className="text-sm">Ziel-URL</Label>
                  <Input placeholder="https://external-system.com/webhook/payroll" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm">Authentifizierung</Label>
                    <Select defaultValue="bearer">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Keine</SelectItem>
                        <SelectItem value="bearer">Bearer Token</SelectItem>
                        <SelectItem value="basic">Basic Auth</SelectItem>
                        <SelectItem value="api_key">API Key</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Token/Key</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Integrationseinstellungen speichern
        </Button>
      </div>
    </div>
  );
};

export default PayrollIntegrations;