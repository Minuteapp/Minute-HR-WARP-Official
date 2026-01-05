import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Save, Mail, Smartphone, Calendar } from "lucide-react";

const PayrollNotifications: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Benachrichtigungen
        </h2>
        <p className="text-sm text-muted-foreground">
          Konfiguration von Benachrichtigungen für Gehaltsabrechnungen und Termine
        </p>
      </div>

      <div className="grid gap-6">
        {/* Benachrichtigungsarten */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Benachrichtigungskanäle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <Label className="font-medium">E-Mail</Label>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Neue Gehaltsabrechnung</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bonuszahlungen</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Steueränderungen</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Abgabetermine</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-green-500" />
                  <Label className="font-medium">Push (App)</Label>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Neue Gehaltsabrechnung</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bonuszahlungen</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Steueränderungen</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Dringende Termine</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <Label className="font-medium">SMS</Label>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Kritische Termine</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Systemfehler</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Notfälle</span>
                    <Switch />
                  </div>
                </div>
                <div className="mt-2">
                  <Label className="text-xs">Notfall-Telefonnummer</Label>
                  <Input placeholder="+49 xxx xxxx" className="mt-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mitarbeiter-Benachrichtigungen */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mitarbeiter-Benachrichtigungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg space-y-3">
                  <Label className="font-medium">Neue Gehaltsabrechnung verfügbar</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Automatisch senden</span>
                      <Switch defaultChecked />
                    </div>
                    <div>
                      <Label className="text-sm">Zeitpunkt</Label>
                      <Select defaultValue="immediate">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Sofort nach Erstellung</SelectItem>
                          <SelectItem value="morning">8:00 Uhr am nächsten Tag</SelectItem>
                          <SelectItem value="manual">Manuell senden</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">E-Mail-Vorlage</Label>
                      <Textarea 
                        placeholder="Liebe/r [VORNAME], Ihre Gehaltsabrechnung für [MONAT] ist verfügbar..."
                        className="h-20"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <Label className="font-medium">Bonuszahlungen & Sonderzahlungen</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Bei Bonus-Auszahlung</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Urlaubsgeld</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Weihnachtsgeld</span>
                      <Switch defaultChecked />
                    </div>
                    <div>
                      <Label className="text-sm">Vorlaufzeit (Tage)</Label>
                      <Input defaultValue="3" type="number" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg space-y-3">
                  <Label className="font-medium">Steuerliche Änderungen</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Steuerklassen-Änderung</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Freibetrag-Änderung</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Kirchensteuer</span>
                      <Switch />
                    </div>
                    <div>
                      <Label className="text-sm">Benachrichtigung an</Label>
                      <Select defaultValue="employee">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">Nur Mitarbeiter</SelectItem>
                          <SelectItem value="hr">HR Manager</SelectItem>
                          <SelectItem value="both">Beide</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <Label className="font-medium">Self-Service Erinnerungen</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Steuerklassen-Update</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Bankdaten-Prüfung</span>
                      <Switch defaultChecked />
                    </div>
                    <div>
                      <Label className="text-sm">Erinnerungsintervall</Label>
                      <Select defaultValue="quarterly">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monatlich</SelectItem>
                          <SelectItem value="quarterly">Quartalsweise</SelectItem>
                          <SelectItem value="yearly">Jährlich</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* HR & Admin Benachrichtigungen */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">HR & Admin Benachrichtigungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg space-y-3">
                  <Label className="font-medium">Abgabetermine & Compliance</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Lohnsteuer-Anmeldung</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sozialversicherung</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Berufsgenossenschaft</span>
                      <Switch />
                    </div>
                    <div>
                      <Label className="text-sm">Vorlaufzeit (Tage)</Label>
                      <Input defaultValue="7" type="number" />
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <Label className="font-medium">Systemereignisse</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Fehlerhafte Berechnungen</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Integrations-Fehler</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Backup-Status</span>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg space-y-3">
                  <Label className="font-medium">Budget & Kostenüberwachung</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Budgetüberschreitung</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ungewöhnliche Ausgaben</span>
                      <Switch defaultChecked />
                    </div>
                    <div>
                      <Label className="text-sm">Schwellenwert (%)</Label>
                      <Input defaultValue="90" type="number" />
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <Label className="font-medium">Genehmigungsprozesse</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ausstehende Genehmigungen</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Überfällige Anträge</span>
                      <Switch defaultChecked />
                    </div>
                    <div>
                      <Label className="text-sm">Eskalations-Zeit (Stunden)</Label>
                      <Input defaultValue="48" type="number" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* E-Mail-Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">E-Mail-Vorlagen anpassen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Standard-Vorlage für neue Gehaltsabrechnung</Label>
                <Textarea 
                  className="mt-2"
                  rows={6}
                  defaultValue={`Liebe/r [VORNAME] [NACHNAME],

Ihre Gehaltsabrechnung für [MONAT] [JAHR] ist verfügbar.

Brutto-Gehalt: [BRUTTO_BETRAG]
Netto-Auszahlung: [NETTO_BETRAG]
Auszahlungsdatum: [AUSZAHLUNG_DATUM]

Sie können Ihre Abrechnung im Self-Service Portal einsehen.

Mit freundlichen Grüßen
Ihr HR-Team`}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Verfügbare Platzhalter: [VORNAME], [NACHNAME], [MONAT], [JAHR], [BRUTTO_BETRAG], [NETTO_BETRAG], [AUSZAHLUNG_DATUM]
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Benachrichtigungseinstellungen speichern
        </Button>
      </div>
    </div>
  );
};

export default PayrollNotifications;