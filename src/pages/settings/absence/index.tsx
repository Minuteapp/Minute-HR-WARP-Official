import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Calendar, FileText, Clock, Users, Bell, Settings2, Shield, Loader2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useEffectiveSettings } from '@/hooks/useEffectiveSettings';
import { useToast } from '@/hooks/use-toast';
import { AbsenceNotificationDashboard } from '@/components/absence/AbsenceNotificationDashboard';
import { SettingAffectedFeaturesInline, SettingAffectedFeaturesCard } from '@/components/settings/SettingAffectedFeaturesCard';
import { SettingsPermissionGuard } from '@/components/settings/SettingsPermissionGuard';

interface AbsenceFormState {
  self_request_allowed: boolean;
  min_advance_days: number;
  max_days_per_request: number;
  require_approval: boolean;
  document_required: boolean;
  document_required_after_days: number;
  half_day_allowed: boolean;
  hourly_booking_allowed: boolean;
  default_vacation_days: number;
  vacation_carryover_allowed: boolean;
  max_carryover_days: number;
  pro_rata_calculation: boolean;
  return_notification_required: boolean;
  auto_notify_manager: boolean;
}

export default function AbsenceSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Settings-Driven Architecture: Lade Einstellungen aus Datenbank
  const { 
    settings, 
    loading, 
    isSaving,
    getValue, 
    isAllowed,
    saveSettings
  } = useEffectiveSettings('absence');

  // Lokaler State für Form-Felder
  const [formState, setFormState] = useState<AbsenceFormState>({
    self_request_allowed: true,
    min_advance_days: 1,
    max_days_per_request: 30,
    require_approval: true,
    document_required: false,
    document_required_after_days: 3,
    half_day_allowed: true,
    hourly_booking_allowed: false,
    default_vacation_days: 30,
    vacation_carryover_allowed: true,
    max_carryover_days: 10,
    pro_rata_calculation: true,
    return_notification_required: false,
    auto_notify_manager: true,
  });

  // Sync Form-State mit geladenen Settings
  useEffect(() => {
    if (!loading && Object.keys(settings).length > 0) {
      setFormState({
        self_request_allowed: getValue('self_request_allowed', true),
        min_advance_days: getValue('min_advance_days', 1),
        max_days_per_request: getValue('max_days_per_request', 30),
        require_approval: getValue('require_approval', true),
        document_required: getValue('document_required', false),
        document_required_after_days: getValue('document_required_after_days', 3),
        half_day_allowed: getValue('half_day_allowed', true),
        hourly_booking_allowed: getValue('hourly_booking_allowed', false),
        default_vacation_days: getValue('default_vacation_days', 30),
        vacation_carryover_allowed: getValue('vacation_carryover_allowed', true),
        max_carryover_days: getValue('max_carryover_days', 10),
        pro_rata_calculation: getValue('pro_rata_calculation', true),
        return_notification_required: getValue('return_notification_required', false),
        auto_notify_manager: getValue('auto_notify_manager', true),
      });
    }
  }, [loading, settings, getValue]);

  const updateFormField = <K extends keyof AbsenceFormState>(key: K, value: AbsenceFormState[K]) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const success = await saveSettings(formState);
      if (success) {
        toast({
          title: "Einstellungen gespeichert",
          description: "Die Abwesenheits-Einstellungen wurden erfolgreich in der Datenbank aktualisiert.",
        });
      } else {
        toast({
          title: "Fehler beim Speichern",
          description: "Die Einstellungen konnten nicht gespeichert werden. Bitte versuchen Sie es erneut.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    }
  };

  return (
    <SettingsPermissionGuard moduleId="absence">
      <div className="w-full p-6 space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Zurück zu Einstellungen
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Abwesenheits-Management</h1>
            <p className="text-muted-foreground mt-2">
              Konfiguration von Abwesenheitsarten, Genehmigungsprozessen und Urlaubsregeln
            </p>
          </div>
        </div>

        <div className="bg-background rounded-lg border">
          <Tabs defaultValue="general" className="w-full">
            <ScrollArea className="w-full">
            <TabsList className="inline-flex w-max p-1">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Allgemein
              </TabsTrigger>
              <TabsTrigger value="types" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Abwesenheitsarten
              </TabsTrigger>
              <TabsTrigger value="vacation" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Urlaubsregeln
              </TabsTrigger>
              <TabsTrigger value="sick" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Krankmeldungen
              </TabsTrigger>
              <TabsTrigger value="approval" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Genehmigungen
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Benachrichtigungen
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Compliance
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <div className="mt-6 px-6 pb-6">
            {/* Allgemeine Einstellungen */}
            <TabsContent value="general" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Grundeinstellungen</CardTitle>
                  <CardDescription>
                    Allgemeine Konfiguration für das Abwesenheits-Modul
                    {loading && <Badge variant="outline" className="ml-2">Lädt...</Badge>}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label>Selbstantrag erlaubt</Label>
                        <SettingAffectedFeaturesInline module="absence" settingKey="self_request_allowed" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Mitarbeiter können selbst Abwesenheiten beantragen
                      </p>
                    </div>
                    <Switch 
                      checked={formState.self_request_allowed} 
                      onCheckedChange={(checked) => updateFormField('self_request_allowed', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label>Genehmigung erforderlich</Label>
                        <SettingAffectedFeaturesInline module="absence" settingKey="require_approval" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Abwesenheitsanträge müssen genehmigt werden
                      </p>
                    </div>
                    <Switch 
                      checked={formState.require_approval}
                      onCheckedChange={(checked) => updateFormField('require_approval', checked)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Mindestvorlaufzeit (Tage)</Label>
                      <Input 
                        type="number" 
                        value={formState.min_advance_days} 
                        onChange={(e) => updateFormField('min_advance_days', parseInt(e.target.value) || 0)}
                        min={0} 
                      />
                      <p className="text-xs text-muted-foreground">
                        Mindestanzahl Tage vor Abwesenheitsbeginn
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Maximale Tage pro Antrag</Label>
                      <Input 
                        type="number" 
                        value={formState.max_days_per_request}
                        onChange={(e) => updateFormField('max_days_per_request', parseInt(e.target.value) || 1)}
                        min={1} 
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximale Dauer eines einzelnen Antrags
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label>Halbtags-Buchungen erlaubt</Label>
                        <SettingAffectedFeaturesInline module="absence" settingKey="half_day_allowed" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Halbe Urlaubstage können gebucht werden
                      </p>
                    </div>
                    <Switch 
                      checked={formState.half_day_allowed}
                      onCheckedChange={(checked) => updateFormField('half_day_allowed', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label>Stundenweise Buchung erlaubt</Label>
                        <SettingAffectedFeaturesInline module="absence" settingKey="hourly_booking_allowed" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Abwesenheiten können stundengenau erfasst werden
                      </p>
                    </div>
                    <Switch 
                      checked={formState.hourly_booking_allowed}
                      onCheckedChange={(checked) => updateFormField('hourly_booking_allowed', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Modul-Übersicht der betroffenen Features */}
              <SettingAffectedFeaturesCard 
                module="absence" 
                settingName="Abwesenheits-Modul"
                affectedFeatures={[
                  "Abwesenheitsanträge", 
                  "Urlaubsplanung", 
                  "Kalender-Integration",
                  "Manager-Dashboard",
                  "Mobile App",
                  "Payroll-Export"
                ]}
                enforcement={["ui", "api", "automation", "ai"]}
                riskLevel="medium"
                showLegalRef
                legalReference="BUrlG, ArbZG"
              />
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Einstellungen speichern
                </Button>
              </div>
            </TabsContent>

            {/* Abwesenheitsarten */}
            <TabsContent value="types" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Abwesenheitsarten verwalten</CardTitle>
                  <CardDescription>
                    Definieren Sie die verfügbaren Abwesenheitstypen in Ihrem Unternehmen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: 'Urlaub', color: '#22c55e', icon: '🏖️', active: true },
                    { name: 'Krankheit', color: '#ef4444', icon: '🤒', active: true },
                    { name: 'Homeoffice', color: '#3b82f6', icon: '🏠', active: true },
                    { name: 'Fortbildung', color: '#8b5cf6', icon: '📚', active: true },
                    { name: 'Sonderurlaub', color: '#f59e0b', icon: '⭐', active: true },
                    { name: 'Elternzeit', color: '#ec4899', icon: '👶', active: true },
                    { name: 'Unbezahlter Urlaub', color: '#6b7280', icon: '📅', active: false },
                  ].map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: type.color }}
                        />
                        <span className="text-xl">{type.icon}</span>
                        <span className="font-medium">{type.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={type.active ? "default" : "secondary"}>
                          {type.active ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
                        <Button variant="outline" size="sm">Bearbeiten</Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-4">
                    + Neue Abwesenheitsart hinzufügen
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Urlaubsregeln */}
            <TabsContent value="vacation" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Urlaubsanspruch</CardTitle>
                  <CardDescription>
                    Konfigurieren Sie den jährlichen Urlaubsanspruch und Übertragungsregeln
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Standard-Urlaubstage pro Jahr</Label>
                      <Input type="number" defaultValue={30} />
                    </div>
                    <div className="space-y-2">
                      <Label>Urlaubsjahr beginnt am</Label>
                      <Select defaultValue="january">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="january">1. Januar</SelectItem>
                          <SelectItem value="april">1. April</SelectItem>
                          <SelectItem value="hire">Einstellungsdatum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Resturlaub-Übertrag erlaubt</Label>
                      <p className="text-sm text-muted-foreground">
                        Nicht genommener Urlaub kann ins nächste Jahr übertragen werden
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Maximaler Übertrag (Tage)</Label>
                      <Input type="number" defaultValue={10} />
                    </div>
                    <div className="space-y-2">
                      <Label>Verfall des Übertrags bis</Label>
                      <Select defaultValue="march">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="march">31. März</SelectItem>
                          <SelectItem value="june">30. Juni</SelectItem>
                          <SelectItem value="september">30. September</SelectItem>
                          <SelectItem value="never">Kein Verfall</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Pro-rata-Berechnung</Label>
                      <p className="text-sm text-muted-foreground">
                        Anteiliger Urlaubsanspruch bei Ein-/Austritt während des Jahres
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sperrzeiten</CardTitle>
                  <CardDescription>
                    Definieren Sie Zeiträume, in denen kein Urlaub genommen werden kann
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      Keine Sperrzeiten konfiguriert. Fügen Sie Zeiträume hinzu, in denen 
                      Urlaub nur eingeschränkt oder gar nicht beantragt werden kann.
                    </p>
                  </div>
                  <Button variant="outline">+ Sperrzeit hinzufügen</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Krankmeldungen */}
            <TabsContent value="sick" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Krankmeldungsregeln</CardTitle>
                  <CardDescription>
                    Konfigurieren Sie Regeln für Krankmeldungen und Attestpflicht
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Ärztliches Attest erforderlich</Label>
                      <p className="text-sm text-muted-foreground">
                        Ab einer bestimmten Krankheitsdauer
                      </p>
                    </div>
                    <Switch 
                      checked={formState.document_required}
                      onCheckedChange={(checked) => updateFormField('document_required', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Attest erforderlich ab Tag</Label>
                    <Select 
                      value={String(formState.document_required_after_days)}
                      onValueChange={(v) => updateFormField('document_required_after_days', parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1. Tag</SelectItem>
                        <SelectItem value="2">2. Tag</SelectItem>
                        <SelectItem value="3">3. Tag</SelectItem>
                        <SelectItem value="4">4. Tag</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Rückkehr-Meldung erforderlich</Label>
                      <p className="text-sm text-muted-foreground">
                        Mitarbeiter müssen ihre Genesung aktiv melden
                      </p>
                    </div>
                    <Switch 
                      checked={formState.return_notification_required}
                      onCheckedChange={(checked) => updateFormField('return_notification_required', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Automatische Benachrichtigung an Vorgesetzten</Label>
                      <p className="text-sm text-muted-foreground">
                        Direkte Benachrichtigung bei Krankmeldung
                      </p>
                    </div>
                    <Switch 
                      checked={formState.auto_notify_manager}
                      onCheckedChange={(checked) => updateFormField('auto_notify_manager', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Lohnfortzahlung anzeigen</Label>
                      <p className="text-sm text-muted-foreground">
                        Information über Lohnfortzahlungszeitraum einblenden
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Genehmigungen */}
            <TabsContent value="approval" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Genehmigungsworkflow</CardTitle>
                  <CardDescription>
                    Konfigurieren Sie den Genehmigungsprozess für Abwesenheitsanträge
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Standard-Genehmiger</Label>
                    <Select defaultValue="manager">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manager">Direkter Vorgesetzter</SelectItem>
                        <SelectItem value="hr">HR-Abteilung</SelectItem>
                        <SelectItem value="team_lead">Teamleiter</SelectItem>
                        <SelectItem value="department_head">Abteilungsleiter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Mehrstufige Genehmigung</Label>
                      <p className="text-sm text-muted-foreground">
                        Anträge müssen mehrere Genehmigungsstufen durchlaufen
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-Genehmigung aktivieren</Label>
                      <p className="text-sm text-muted-foreground">
                        Kurze Abwesenheiten automatisch genehmigen
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="space-y-2">
                    <Label>Auto-Genehmigung bis (Tage)</Label>
                    <Input type="number" defaultValue={1} disabled />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Vertretungsregelung erforderlich</Label>
                      <p className="text-sm text-muted-foreground">
                        Vertreter muss vor Genehmigung benannt werden
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="space-y-2">
                    <Label>Eskalation nach (Stunden)</Label>
                    <Input type="number" defaultValue={48} />
                    <p className="text-xs text-muted-foreground">
                      Antrag eskaliert wenn innerhalb dieser Zeit nicht bearbeitet
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team-Kapazitätsregeln</CardTitle>
                  <CardDescription>
                    Regeln zur Vermeidung von Unterbesetzung
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Kapazitätsprüfung aktivieren</Label>
                      <p className="text-sm text-muted-foreground">
                        Warnung bei zu vielen gleichzeitigen Abwesenheiten
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label>Maximale gleichzeitige Abwesenheiten (%)</Label>
                    <Input type="number" defaultValue={30} />
                    <p className="text-xs text-muted-foreground">
                      Prozentsatz des Teams, der gleichzeitig abwesend sein darf
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Benachrichtigungen */}
            <TabsContent value="notifications" className="mt-0">
              <AbsenceNotificationDashboard />
            </TabsContent>

            {/* Compliance */}
            <TabsContent value="compliance" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance & Audit</CardTitle>
                  <CardDescription>
                    Rechtliche Anforderungen und Dokumentation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Audit-Trail aktivieren</Label>
                      <p className="text-sm text-muted-foreground">
                        Alle Änderungen an Abwesenheiten protokollieren
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>DSGVO-konform speichern</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatische Löschung nach Aufbewahrungsfrist
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label>Aufbewahrungsfrist (Jahre)</Label>
                    <Input type="number" defaultValue={10} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Export für Lohnbuchhaltung</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatischer Export genehmigter Abwesenheiten
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label>Export-Format</Label>
                    <Select defaultValue="csv">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xml">XML</SelectItem>
                        <SelectItem value="datev">DATEV</SelectItem>
                        <SelectItem value="api">API-Integration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
        </div>
      </div>
    </SettingsPermissionGuard>
  );
}
