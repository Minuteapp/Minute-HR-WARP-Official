import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Save, Plus, Share2, Euro, Eye } from "lucide-react";

const JobPostingSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Stellenanzeigen-Verwaltung
        </h2>
        <p className="text-sm text-muted-foreground">
          Konfiguration von Stellenausschreibungen, Templates und Veröffentlichung
        </p>
      </div>

      <div className="grid gap-6">
        {/* Stellenanzeigen-Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Templates für Stellenausschreibungen
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Template erstellen
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">Software-Entwickler Template</Label>
                    <Badge variant="secondary">Aktiv</Badge>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="text-sm text-muted-foreground">
                  Standardvorlage für Entwicklerpositionen mit technischen Requirements
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="font-medium">Pflichtfelder:</span> 7
                  </div>
                  <div>
                    <span className="font-medium">Optionale Felder:</span> 4
                  </div>
                  <div>
                    <span className="font-medium">Verwendet:</span> 12x
                  </div>
                </div>
                <Button size="sm" variant="outline">Template bearbeiten</Button>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">Marketing Manager Template</Label>
                    <Badge variant="outline">Entwurf</Badge>
                  </div>
                  <Switch />
                </div>
                <div className="text-sm text-muted-foreground">
                  Vorlage für Marketing- und Kommunikationspositionen
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="font-medium">Pflichtfelder:</span> 5
                  </div>
                  <div>
                    <span className="font-medium">Optionale Felder:</span> 6
                  </div>
                  <div>
                    <span className="font-medium">Verwendet:</span> 3x
                  </div>
                </div>
                <Button size="sm" variant="outline">Template bearbeiten</Button>
              </div>
            </div>

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <Label className="font-medium">Template-Pflichtfelder konfigurieren</Label>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span>Stellentitel</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span>Abteilung</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span>Standort</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span>Anstellungsart</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span>Gehaltsbereich</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span>Benefits</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Veröffentlichungseinstellungen */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Veröffentlichungseinstellungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="publication-mode">Veröffentlichungsmodus</Label>
                <Select defaultValue="manual">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Automatisch</SelectItem>
                    <SelectItem value="manual">Manuell</SelectItem>
                    <SelectItem value="scheduled">Geplant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-duration">Standard-Laufzeit</Label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="14">14 Tage</SelectItem>
                    <SelectItem value="30">30 Tage</SelectItem>
                    <SelectItem value="60">60 Tage</SelectItem>
                    <SelectItem value="90">90 Tage</SelectItem>
                    <SelectItem value="unlimited">Unbegrenzt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatische Verlängerung</Label>
                  <p className="text-sm text-muted-foreground">Bei wenigen Bewerbungen</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Standard-Sichtbarkeit</Label>
                <Select defaultValue="public">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Öffentlich</SelectItem>
                    <SelectItem value="internal">Nur intern</SelectItem>
                    <SelectItem value="network">Netzwerk</SelectItem>
                    <SelectItem value="confidential">Vertraulich</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SEO-Optimierung</Label>
                  <p className="text-sm text-muted-foreground">Für bessere Sichtbarkeit</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Multiposting-Kanäle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">L</span>
                    </div>
                    <span className="font-medium">LinkedIn</span>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs font-bold">S</span>
                    </div>
                    <span className="font-medium">StepStone</span>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">I</span>
                    </div>
                    <span className="font-medium">Indeed</span>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-600 text-xs font-bold">X</span>
                    </div>
                    <span className="font-medium">XING</span>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-xs font-bold">M</span>
                    </div>
                    <span className="font-medium">Monster</span>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Multiposting-Kosten</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Geschätzte Kosten pro Stellenanzeige: ~150-300€
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget-Verwaltung */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Budget-Verwaltung für Stellenanzeigen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="monthly-budget">Monatsbudget</Label>
                  <Input type="number" defaultValue="2000" placeholder="€" />
                </div>
                
                <div>
                  <Label htmlFor="cost-per-posting">Kosten pro Anzeige</Label>
                  <Input type="number" defaultValue="200" placeholder="€" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Budget-Alarme</Label>
                    <p className="text-sm text-muted-foreground">Bei 80% Verbrauch</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Verbrauchtes Budget (Januar)</Label>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>1.450€ / 2.000€</span>
                      <span>72.5%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '72.5%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <p className="text-sm font-medium">Aktive Kampagnen</p>
                  <div className="text-xs text-muted-foreground mt-1">
                    <div>LinkedIn: 450€</div>
                    <div>StepStone: 600€</div>
                    <div>XING: 400€</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Erfolgreichste Kanäle</p>
                  <div className="text-xs text-green-700 mt-1">
                    <div>1. LinkedIn (45% Bewerbungen)</div>
                    <div>2. StepStone (32% Bewerbungen)</div>
                    <div>3. XING (23% Bewerbungen)</div>
                  </div>
                </div>

                <div>
                  <Label>Cost-per-Application</Label>
                  <div className="text-sm text-muted-foreground mt-1">
                    <div>Durchschnitt: 23€</div>
                    <div>Bester Kanal: 18€ (LinkedIn)</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interne vs. Externe Ausschreibungen */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Ausschreibungsarten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg space-y-3">
                  <Label className="font-medium">Interne Ausschreibungen</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mitarbeiter-Zugang aktiviert</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Vorlaufzeit für interne Bewerbungen</Label>
                    <Select defaultValue="7">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Tage</SelectItem>
                        <SelectItem value="7">7 Tage</SelectItem>
                        <SelectItem value="14">14 Tage</SelectItem>
                        <SelectItem value="30">30 Tage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Automatische E-Mail an relevante Mitarbeiter</span>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Interne Bewerbungsstatistik</p>
                  <div className="text-xs text-muted-foreground mt-1">
                    <div>Erfolgsquote intern: 78%</div>
                    <div>Ø Zeit bis Besetzung: 12 Tage</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg space-y-3">
                  <Label className="font-medium">Externe Ausschreibungen</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Öffentliche Karriereseite</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Standard-Veröffentlichungsmodus</Label>
                    <Select defaultValue="immediate">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Sofort extern</SelectItem>
                        <SelectItem value="internal_first">Erst intern, dann extern</SelectItem>
                        <SelectItem value="manual">Manuell freigeben</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Social Media Sharing</span>
                    <Switch />
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Externe Bewerbungsstatistik</p>
                  <div className="text-xs text-muted-foreground mt-1">
                    <div>Ø Bewerbungen pro Anzeige: 47</div>
                    <div>Ø Zeit bis Besetzung: 45 Tage</div>
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
          Stellenanzeigen-Einstellungen speichern
        </Button>
      </div>
    </div>
  );
};

export default JobPostingSettings;