import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Save, Users, Eye, Lock, Settings2 } from "lucide-react";

const RoleVisibility: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Sichtbarkeit & Rollen
        </h2>
        <p className="text-sm text-muted-foreground">
          Rollenbasierte Zugriffskontrolle (RBAC) für Lohn- und Gehaltsabrechnung
        </p>
      </div>

      <div className="grid gap-6">
        {/* Rollen-Übersicht */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rollen-Übersicht</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {/* Mitarbeiter */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <Label className="font-medium">Mitarbeiter</Label>
                    <Badge variant="secondary">Employee</Badge>
                  </div>
                  <Badge variant="outline">432 Nutzer</Badge>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Eigene Gehaltsabrechnung einsehen</span>
                    <Eye className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Gehaltshistorie (12 Monate)</span>
                    <Eye className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Steuerliche Dokumente</span>
                    <Eye className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Andere Gehälter einsehen</span>
                    <Lock className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Abrechnungen erstellen</span>
                    <Lock className="h-4 w-4 text-red-500" />
                  </div>
                </div>
              </div>

              {/* Teamleiter */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    <Label className="font-medium">Teamleiter</Label>
                    <Badge variant="secondary">Team Lead</Badge>
                  </div>
                  <Badge variant="outline">23 Nutzer</Badge>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Team-Budget-Übersicht (anonymisiert)</span>
                    <Eye className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Gehaltserhöhungen vorschlagen</span>
                    <Eye className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Bonus-Empfehlungen</span>
                    <Eye className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Einzelne Gehälter einsehen</span>
                    <Lock className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Steuereinstellungen</span>
                    <Lock className="h-4 w-4 text-red-500" />
                  </div>
                </div>
              </div>

              {/* Manager */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    <Label className="font-medium">Manager</Label>
                    <Badge variant="secondary">Manager</Badge>
                  </div>
                  <Badge variant="outline">8 Nutzer</Badge>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Aggregierte Gehaltsberichte</span>
                    <Eye className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Budgetplanung & -kontrolle</span>
                    <Eye className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Kostenstellenberichte</span>
                    <Eye className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Gehaltserhöhungen genehmigen</span>
                    <Eye className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Systemkonfiguration</span>
                    <Lock className="h-4 w-4 text-red-500" />
                  </div>
                </div>
              </div>

              {/* HR Manager */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-orange-500" />
                    <Label className="font-medium">HR Manager</Label>
                    <Badge variant="secondary">HR</Badge>
                  </div>
                  <Badge variant="outline">5 Nutzer</Badge>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Vollzugriff auf alle Gehälter</span>
                    <Eye className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Abrechnungen erstellen/bearbeiten</span>
                    <Eye className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Steuer- & Abzugsverwaltung</span>
                    <Eye className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Gehaltsstrukturen verwalten</span>
                    <Eye className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Integration mit externen Systemen</span>
                    <Eye className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Admin */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-500" />
                    <Label className="font-medium">Administrator</Label>
                    <Badge variant="destructive">Admin</Badge>
                  </div>
                  <Badge variant="outline">2 Nutzer</Badge>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Systemweite Kontrolle</span>
                    <Eye className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Rollen & Berechtigungen verwalten</span>
                    <Eye className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Audit-Protokolle einsehen</span>
                    <Eye className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>System-Integrationen</span>
                    <Eye className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Backup & Wartung</span>
                    <Eye className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Berechtigungsmatrix */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detaillierte Berechtigungsmatrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Funktion</th>
                    <th className="text-center p-2">Mitarbeiter</th>
                    <th className="text-center p-2">Teamleiter</th>
                    <th className="text-center p-2">Manager</th>
                    <th className="text-center p-2">HR</th>
                    <th className="text-center p-2">Admin</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  <tr className="border-b">
                    <td className="p-2 font-medium">Eigene Abrechnung einsehen</td>
                    <td className="text-center p-2"><Eye className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-2"><Eye className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-2"><Eye className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-2"><Eye className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-2"><Eye className="h-4 w-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Team-Gehälter einsehen</td>
                    <td className="text-center p-2"><Lock className="h-4 w-4 text-red-500 mx-auto" /></td>
                    <td className="text-center p-2"><Eye className="h-4 w-4 text-yellow-500 mx-auto" /></td>
                    <td className="text-center p-2"><Eye className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-2"><Eye className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-2"><Eye className="h-4 w-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Abrechnungen erstellen</td>
                    <td className="text-center p-2"><Lock className="h-4 w-4 text-red-500 mx-auto" /></td>
                    <td className="text-center p-2"><Lock className="h-4 w-4 text-red-500 mx-auto" /></td>
                    <td className="text-center p-2"><Lock className="h-4 w-4 text-red-500 mx-auto" /></td>
                    <td className="text-center p-2"><Eye className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-2"><Eye className="h-4 w-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Gehaltserhöhungen beantragen</td>
                    <td className="text-center p-2"><Lock className="h-4 w-4 text-red-500 mx-auto" /></td>
                    <td className="text-center p-2"><Eye className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-2"><Eye className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-2"><Eye className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-2"><Eye className="h-4 w-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Steuereinstellungen</td>
                    <td className="text-center p-2"><Lock className="h-4 w-4 text-red-500 mx-auto" /></td>
                    <td className="text-center p-2"><Lock className="h-4 w-4 text-red-500 mx-auto" /></td>
                    <td className="text-center p-2"><Lock className="h-4 w-4 text-red-500 mx-auto" /></td>
                    <td className="text-center p-2"><Eye className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-2"><Eye className="h-4 w-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Systemintegration</td>
                    <td className="text-center p-2"><Lock className="h-4 w-4 text-red-500 mx-auto" /></td>
                    <td className="text-center p-2"><Lock className="h-4 w-4 text-red-500 mx-auto" /></td>
                    <td className="text-center p-2"><Lock className="h-4 w-4 text-red-500 mx-auto" /></td>
                    <td className="text-center p-2"><Eye className="h-4 w-4 text-yellow-500 mx-auto" /></td>
                    <td className="text-center p-2"><Eye className="h-4 w-4 text-green-500 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3 text-green-500" />
                <span>Vollzugriff</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3 text-yellow-500" />
                <span>Eingeschränkt</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock className="h-3 w-3 text-red-500" />
                <span>Kein Zugriff</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Erweiterte Einstellungen */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Erweiterte Sicherheitseinstellungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Zwei-Faktor-Authentifizierung</Label>
                    <p className="text-sm text-muted-foreground">Für HR & Admin Rollen erforderlich</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">IP-Whitelist</Label>
                    <p className="text-sm text-muted-foreground">Zugriff nur von Büro-Netzwerk</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Sitzungs-Timeout</Label>
                    <p className="text-sm text-muted-foreground">Automatische Abmeldung</p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 Min</SelectItem>
                      <SelectItem value="30">30 Min</SelectItem>
                      <SelectItem value="60">1 Std</SelectItem>
                      <SelectItem value="240">4 Std</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Audit-Logging</Label>
                    <p className="text-sm text-muted-foreground">Alle Zugriffe protokollieren</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Datenexport begrenzen</Label>
                    <p className="text-sm text-muted-foreground">Max. 1000 Datensätze pro Export</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Wasserzeichen in PDFs</Label>
                    <p className="text-sm text-muted-foreground">Vertraulichkeits-Markierung</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Bildschirm-Aufnahme verhindern</Label>
                    <p className="text-sm text-muted-foreground">DRM-Schutz für sensible Daten</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Benachrichtigung bei Zugriff</Label>
                    <p className="text-sm text-muted-foreground">E-Mail bei Gehaltseinsicht</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Berechtigungseinstellungen speichern
        </Button>
      </div>
    </div>
  );
};

export default RoleVisibility;