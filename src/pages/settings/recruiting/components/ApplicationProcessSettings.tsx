import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileUser, Save, Bot, Calendar, Star } from "lucide-react";

const ApplicationProcessSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileUser className="h-5 w-5" />
          Bewerbungsprozess
        </h2>
        <p className="text-sm text-muted-foreground">
          Konfiguration des Bewerbungsformulars, Scoring und Interview-Phasen
        </p>
      </div>

      <div className="grid gap-6">
        {/* Bewerbungsformular */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bewerbungsformular konfigurieren</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label className="font-medium">Pflichtfelder</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Vor- und Nachname</span>
                      <Switch defaultChecked disabled />
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">E-Mail-Adresse</span>
                      <Switch defaultChecked disabled />
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Telefonnummer</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Lebenslauf (PDF)</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Anschreiben</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Datenschutz-Einverständnis</span>
                      <Switch defaultChecked disabled />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="font-medium">Upload-Beschränkungen</Label>
                  <div className="mt-2 space-y-2">
                    <div>
                      <Label className="text-sm">Max. Dateigröße</Label>
                      <Select defaultValue="5">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 MB</SelectItem>
                          <SelectItem value="5">5 MB</SelectItem>
                          <SelectItem value="10">10 MB</SelectItem>
                          <SelectItem value="20">20 MB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">Erlaubte Dateitypen</Label>
                      <div className="grid grid-cols-2 gap-1 mt-1 text-xs">
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" defaultChecked />
                          <span>PDF</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" defaultChecked />
                          <span>DOC/DOCX</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" />
                          <span>JPG/PNG</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" />
                          <span>TXT</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="font-medium">Optionale Felder</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">LinkedIn-Profil</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">XING-Profil</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Portfolio/Website</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Gehaltsvorstellung</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Verfügbarkeit/Startdatum</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Arbeitszeitmodell-Präferenz</span>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="font-medium">Zusätzliche Angaben</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Motivation/Nachricht</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Referenzen</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Sprachkenntnisse</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Automatisches Bewerbungshandling */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Automatische Bestätigung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Eingangsbestätigung senden</Label>
                  <p className="text-sm text-muted-foreground">Sofort nach Bewerbung</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmation-template">E-Mail-Vorlage</Label>
                <Select defaultValue="standard">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard-Bestätigung</SelectItem>
                    <SelectItem value="personal">Persönliche Bestätigung</SelectItem>
                    <SelectItem value="detailed">Detaillierte Bestätigung</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Status-Updates senden</Label>
                  <p className="text-sm text-muted-foreground">Bei Prozess-Fortschritt</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auto-response-time">Antwortzeit-Versprechen</Label>
                <Select defaultValue="5">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Werktage</SelectItem>
                    <SelectItem value="5">5 Werktage</SelectItem>
                    <SelectItem value="10">10 Werktage</SelectItem>
                    <SelectItem value="custom">Individuell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-4 w-4" />
                Bewerbungs-Scoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatisches Scoring aktivieren</Label>
                  <p className="text-sm text-muted-foreground">KI-basierte Bewertung</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div>
                <Label className="font-medium">Bewertungskriterien</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Berufserfahrung</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">30%</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Fachliche Skills</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">25%</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Ausbildung/Studium</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">20%</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Soft Skills</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">15%</span>
                      <Switch />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Sprachkenntnisse</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">10%</span>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KI Pre-Screening */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-4 w-4" />
              KI-Powered Pre-Screening
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>CV-Analyse aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Automatische Lebenslauf-Auswertung</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Skill-Matching</Label>
                    <p className="text-sm text-muted-foreground">Abgleich mit Stellenanforderungen</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Duplikat-Erkennung</Label>
                    <p className="text-sm text-muted-foreground">Mehrfachbewerbungen identifizieren</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="font-medium">Mindest-Score für Weiteleitung</Label>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>70%</span>
                      <span>Empfohlen: 65-75%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      defaultValue="70" 
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">KI-Analyse Statistik</p>
                  <div className="text-xs text-muted-foreground mt-1">
                    <div>Durchschnittlicher Score: 73%</div>
                    <div>Automatisch weitergeleitet: 68%</div>
                    <div>False Positives: 12%</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="font-medium">Automatische Aktionen</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Auto-Ablehnung bei {'<'} 30%</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Priorität bei {'>'} 90%</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">HR-Benachrichtigung bei Top-Kandidaten</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">KI-Trainings-Modus</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Bewertungen werden zur Verbesserung der KI verwendet
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interview-Phasen */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Interview-Phasen definieren
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Phase 1</Badge>
                    <Label className="font-medium">Telefon-Interview</Label>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <Label className="text-xs">Dauer</Label>
                    <Input defaultValue="30 Min" />
                  </div>
                  <div>
                    <Label className="text-xs">Interviewer</Label>
                    <Select defaultValue="hr">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hr">HR Manager</SelectItem>
                        <SelectItem value="team">Teamleiter</SelectItem>
                        <SelectItem value="both">Beide</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Automatische Terminkoordination</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Phase 2</Badge>
                    <Label className="font-medium">Video-Interview</Label>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <Label className="text-xs">Dauer</Label>
                    <Input defaultValue="60 Min" />
                  </div>
                  <div>
                    <Label className="text-xs">Interviewer</Label>
                    <Select defaultValue="team">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hr">HR Manager</SelectItem>
                        <SelectItem value="team">Fachbereich</SelectItem>
                        <SelectItem value="both">HR + Fachbereich</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Video-Plattform</Label>
                    <Select defaultValue="teams">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teams">MS Teams</SelectItem>
                        <SelectItem value="zoom">Zoom</SelectItem>
                        <SelectItem value="google">Google Meet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Phase 3</Badge>
                    <Label className="font-medium">Vor-Ort Interview</Label>
                  </div>
                  <Switch />
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <Label className="text-xs">Dauer</Label>
                    <Input defaultValue="90 Min" />
                  </div>
                  <div>
                    <Label className="text-xs">Interviewer</Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="team">Nur Team</SelectItem>
                        <SelectItem value="management">+ Management</SelectItem>
                        <SelectItem value="all">Alle Stakeholder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Office-Tour inkludiert</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Optional</Badge>
                    <Label className="font-medium">Assessment/Testaufgabe</Label>
                  </div>
                  <Switch />
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <Label className="text-xs">Art</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coding">Coding Challenge</SelectItem>
                        <SelectItem value="case">Case Study</SelectItem>
                        <SelectItem value="presentation">Präsentation</SelectItem>
                        <SelectItem value="custom">Individuell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Zeitlimit</Label>
                    <Input placeholder="z.B. 2 Stunden" />
                  </div>
                  <div>
                    <Label className="text-xs">Vergütung</Label>
                    <Switch />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-muted rounded-lg">
              <Label className="text-sm font-medium">Kalender-Integration Einstellungen</Label>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span>Outlook-Synchronisation</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span>Google Calendar</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span>Apple iCal</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span>Automatische Erinnerungen</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Bewerbungsprozess-Einstellungen speichern
        </Button>
      </div>
    </div>
  );
};

export default ApplicationProcessSettings;