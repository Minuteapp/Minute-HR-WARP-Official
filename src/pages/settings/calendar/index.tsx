import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, RefreshCw, PartyPopper, CalendarCheck, Bell, CheckCircle, Clock, Eye, Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CalendarSettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("sync");

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Calendar className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Kalender-Einstellungen</h1>
                <p className="text-sm text-muted-foreground">
                  Synchronisation, Feiertage, Buchungsregeln und mehr
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 lg:grid-cols-9 gap-2">
            <TabsTrigger value="sync" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden lg:inline">Sync</span>
            </TabsTrigger>
            <TabsTrigger value="holidays" className="flex items-center gap-2">
              <PartyPopper className="h-4 w-4" />
              <span className="hidden lg:inline">Feiertage</span>
            </TabsTrigger>
            <TabsTrigger value="event-types" className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              <span className="hidden lg:inline">Terminarten</span>
            </TabsTrigger>
            <TabsTrigger value="booking-rules" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden lg:inline">Buchung</span>
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden lg:inline">Erinnerungen</span>
            </TabsTrigger>
            <TabsTrigger value="approvals" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden lg:inline">Genehmigung</span>
            </TabsTrigger>
            <TabsTrigger value="scheduling" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden lg:inline">Planung</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden lg:inline">Datenschutz</span>
            </TabsTrigger>
            <TabsTrigger value="views" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden lg:inline">Ansichten</span>
            </TabsTrigger>
          </TabsList>

          {/* Synchronisation */}
          <TabsContent value="sync" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Kalender-Synchronisation
                </CardTitle>
                <CardDescription>
                  Verbinden Sie externe Kalender und konfigurieren Sie die Synchronisation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Google Calendar</h4>
                          <p className="text-sm text-muted-foreground">Nicht verbunden</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Verbinden</Button>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Microsoft Outlook</h4>
                          <p className="text-sm text-muted-foreground">Nicht verbunden</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Verbinden</Button>
                    </div>
                  </Card>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Automatische Synchronisation</Label>
                      <p className="text-sm text-muted-foreground">Kalender automatisch synchronisieren</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sync-Intervall</Label>
                      <p className="text-sm text-muted-foreground">Wie oft soll synchronisiert werden?</p>
                    </div>
                    <Select defaultValue="15">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">Alle 5 Min.</SelectItem>
                        <SelectItem value="15">Alle 15 Min.</SelectItem>
                        <SelectItem value="30">Alle 30 Min.</SelectItem>
                        <SelectItem value="60">Stündlich</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feiertage */}
          <TabsContent value="holidays" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PartyPopper className="h-5 w-5" />
                  Feiertage & freie Tage
                </CardTitle>
                <CardDescription>
                  Gesetzliche Feiertage und Betriebsferien verwalten
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Land/Region</Label>
                    <p className="text-sm text-muted-foreground">Gesetzliche Feiertage automatisch laden</p>
                  </div>
                  <Select defaultValue="de">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="de">Deutschland</SelectItem>
                      <SelectItem value="at">Österreich</SelectItem>
                      <SelectItem value="ch">Schweiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bundesland</Label>
                    <p className="text-sm text-muted-foreground">Regionale Feiertage berücksichtigen</p>
                  </div>
                  <Select defaultValue="by">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="by">Bayern</SelectItem>
                      <SelectItem value="bw">Baden-Württemberg</SelectItem>
                      <SelectItem value="be">Berlin</SelectItem>
                      <SelectItem value="nw">Nordrhein-Westfalen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Feiertage im Kalender anzeigen</Label>
                    <p className="text-sm text-muted-foreground">Feiertage werden im Kalender markiert</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Terminarten */}
          <TabsContent value="event-types" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5" />
                  Terminarten
                </CardTitle>
                <CardDescription>
                  Definieren Sie verschiedene Terminarten mit Farben und Eigenschaften
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {[
                    { name: "Meeting", color: "bg-blue-500", duration: "60 Min." },
                    { name: "Telefonat", color: "bg-green-500", duration: "30 Min." },
                    { name: "Workshop", color: "bg-purple-500", duration: "120 Min." },
                    { name: "Kundentermin", color: "bg-orange-500", duration: "90 Min." }
                  ].map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${type.color}`} />
                        <div>
                          <p className="font-medium">{type.name}</p>
                          <p className="text-sm text-muted-foreground">Standard: {type.duration}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Bearbeiten</Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full">
                  Neue Terminart hinzufügen
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Buchungsregeln */}
          <TabsContent value="booking-rules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Buchungsregeln
                </CardTitle>
                <CardDescription>
                  Regeln für die Terminbuchung und Verfügbarkeit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Minimale Vorlaufzeit</Label>
                    <Select defaultValue="24">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Stunde</SelectItem>
                        <SelectItem value="4">4 Stunden</SelectItem>
                        <SelectItem value="24">1 Tag</SelectItem>
                        <SelectItem value="48">2 Tage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Maximale Vorausbuchung</Label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">1 Woche</SelectItem>
                        <SelectItem value="14">2 Wochen</SelectItem>
                        <SelectItem value="30">1 Monat</SelectItem>
                        <SelectItem value="90">3 Monate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Pufferzeit zwischen Terminen</Label>
                    <p className="text-sm text-muted-foreground">Automatische Pause nach jedem Termin</p>
                  </div>
                  <Select defaultValue="15">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Keine</SelectItem>
                      <SelectItem value="5">5 Min.</SelectItem>
                      <SelectItem value="15">15 Min.</SelectItem>
                      <SelectItem value="30">30 Min.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Erinnerungen */}
          <TabsContent value="reminders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Erinnerungen
                </CardTitle>
                <CardDescription>
                  Standard-Erinnerungen für Termine konfigurieren
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>E-Mail-Erinnerungen</Label>
                    <p className="text-sm text-muted-foreground">Erinnerungen per E-Mail senden</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push-Benachrichtigungen</Label>
                    <p className="text-sm text-muted-foreground">Browser-Benachrichtigungen aktivieren</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label>Standard-Erinnerungszeit</Label>
                  <Select defaultValue="15">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Minuten vorher</SelectItem>
                      <SelectItem value="15">15 Minuten vorher</SelectItem>
                      <SelectItem value="30">30 Minuten vorher</SelectItem>
                      <SelectItem value="60">1 Stunde vorher</SelectItem>
                      <SelectItem value="1440">1 Tag vorher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Genehmigungen */}
          <TabsContent value="approvals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Termingenehigung
                </CardTitle>
                <CardDescription>
                  Genehmigungsworkflows für bestimmte Terminarten
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Genehmigung erforderlich</Label>
                    <p className="text-sm text-muted-foreground">Termine müssen genehmigt werden</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Genehmigung</Label>
                    <p className="text-sm text-muted-foreground">Termine automatisch nach Frist genehmigen</p>
                  </div>
                  <Switch />
                </div>
                <div className="space-y-2">
                  <Label>Standard-Genehmiger</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Genehmiger auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Direkter Vorgesetzter</SelectItem>
                      <SelectItem value="hr">HR-Abteilung</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Zeitplanung */}
          <TabsContent value="scheduling" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Zeitplanung
                </CardTitle>
                <CardDescription>
                  Arbeitszeiten und Verfügbarkeitsregeln
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Arbeitsbeginn</Label>
                    <Input type="time" defaultValue="09:00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Arbeitsende</Label>
                    <Input type="time" defaultValue="18:00" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Wochenenden ausschließen</Label>
                    <p className="text-sm text-muted-foreground">Samstag und Sonntag nicht buchbar</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mittagspause blockieren</Label>
                    <p className="text-sm text-muted-foreground">Standardzeit: 12:00 - 13:00 Uhr</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Datenschutz */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Datenschutz
                </CardTitle>
                <CardDescription>
                  Sichtbarkeit und Datenschutzeinstellungen für Kalendereinträge
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Standard-Sichtbarkeit</Label>
                  <Select defaultValue="busy">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Öffentlich (Details sichtbar)</SelectItem>
                      <SelectItem value="busy">Nur als "Beschäftigt" anzeigen</SelectItem>
                      <SelectItem value="private">Privat (nicht sichtbar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Termindetails für Kollegen</Label>
                    <p className="text-sm text-muted-foreground">Kollegen können Termindetails sehen</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Externe Teilnehmer anzeigen</Label>
                    <p className="text-sm text-muted-foreground">Namen externer Teilnehmer sichtbar</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ansichten */}
          <TabsContent value="views" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Ansichtsoptionen
                </CardTitle>
                <CardDescription>
                  Standard-Kalenderansichten und Darstellung konfigurieren
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Standard-Ansicht</Label>
                  <Select defaultValue="week">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Tagesansicht</SelectItem>
                      <SelectItem value="week">Wochenansicht</SelectItem>
                      <SelectItem value="month">Monatsansicht</SelectItem>
                      <SelectItem value="agenda">Agenda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Wochenbeginn</Label>
                  <Select defaultValue="monday">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday">Montag</SelectItem>
                      <SelectItem value="sunday">Sonntag</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Wochenenden anzeigen</Label>
                    <p className="text-sm text-muted-foreground">Samstag und Sonntag im Kalender anzeigen</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Kalenderwochen anzeigen</Label>
                    <p className="text-sm text-muted-foreground">Wochennummern im Kalender</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CalendarSettingsPage;
