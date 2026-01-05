import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save, Globe, Palette, Shield } from "lucide-react";
import { SettingAffectedFeaturesInline, SettingAffectedFeaturesCard } from '@/components/settings/SettingAffectedFeaturesCard';

const RecruitingGeneralSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Allgemeine Recruiting-Einstellungen
        </h2>
        <p className="text-sm text-muted-foreground">
          Grundlegende Konfiguration für Recruiting und Stellenausschreibungen
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sprache & Layout */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Sprache & Layout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-language">Standard-Sprache</Label>
              <Select defaultValue="de">
                <SelectTrigger>
                  <SelectValue placeholder="Sprache auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="it">Italiano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <Label>Mehrsprachige Stellenausschreibungen</Label>
                  <SettingAffectedFeaturesInline module="recruiting" settingKey="multilingual_enabled" />
                </div>
                <p className="text-sm text-muted-foreground">Automatische Übersetzung aktivieren</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-format">Datumsformat</Label>
              <Select defaultValue="dd.mm.yyyy">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd.mm.yyyy">DD.MM.YYYY</SelectItem>
                  <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Zeitzone</Label>
              <Select defaultValue="europe/berlin">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="europe/berlin">Europe/Berlin</SelectItem>
                  <SelectItem value="europe/london">Europe/London</SelectItem>
                  <SelectItem value="america/new_york">America/New_York</SelectItem>
                  <SelectItem value="asia/tokyo">Asia/Tokyo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Corporate Design */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Corporate Design
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Firmenlogo für Karriereseite</Label>
              <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Logo hochladen (max. 2MB)</p>
                <Button size="sm" variant="outline" className="mt-2">
                  Datei auswählen
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand-colors">Markenfarben</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Primär</Label>
                  <Input type="color" defaultValue="#3b82f6" className="h-10" />
                </div>
                <div>
                  <Label className="text-xs">Sekundär</Label>
                  <Input type="color" defaultValue="#64748b" className="h-10" />
                </div>
                <div>
                  <Label className="text-xs">Akzent</Label>
                  <Input type="color" defaultValue="#10b981" className="h-10" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="career-page-layout">Karriereseiten-Layout</Label>
              <Select defaultValue="modern">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern & Clean</SelectItem>
                  <SelectItem value="corporate">Corporate Professional</SelectItem>
                  <SelectItem value="creative">Creative & Bold</SelectItem>
                  <SelectItem value="minimal">Minimal & Simple</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Karriereseiten-URL</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-sm">
                  https://
                </span>
                <Input 
                  defaultValue="ihr-unternehmen.de/karriere" 
                  className="rounded-l-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobprofil-Vorlagen */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jobprofil-Vorlagen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-medium">Software-Entwickler</Label>
                  <Switch defaultChecked />
                </div>
                <p className="text-sm text-muted-foreground">
                  Vorlage für Entwicklerpositionen mit technischen Skills
                </p>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-medium">Marketing Manager</Label>
                  <Switch defaultChecked />
                </div>
                <p className="text-sm text-muted-foreground">
                  Vorlage für Marketing- und Kommunikationspositionen
                </p>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-medium">Vertriebsmitarbeiter</Label>
                  <Switch />
                </div>
                <p className="text-sm text-muted-foreground">
                  Vorlage für Sales- und Vertriebspositionen
                </p>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-medium">Projektmanager</Label>
                  <Switch />
                </div>
                <p className="text-sm text-muted-foreground">
                  Vorlage für Projektmanagement-Positionen
                </p>
              </div>
            </div>

            <Button size="sm" variant="outline" className="w-full">
              Neue Vorlage erstellen
            </Button>
          </CardContent>
        </Card>

        {/* DSGVO & Datenschutz */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              DSGVO & Datenschutz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <Label>Bewerbungen anonymisieren</Label>
                  <SettingAffectedFeaturesInline module="recruiting" settingKey="anonymize_applications" />
                </div>
                <p className="text-sm text-muted-foreground">Namen und Fotos ausblenden</p>
              </div>
              <Switch />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data-retention">Speicherdauer Bewerbungsdaten</Label>
              <Select defaultValue="12">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 Monate</SelectItem>
                  <SelectItem value="12">12 Monate</SelectItem>
                  <SelectItem value="24">24 Monate</SelectItem>
                  <SelectItem value="36">36 Monate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deletion-notice">Löschfrist-Benachrichtigung</Label>
              <Select defaultValue="30">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="14">14 Tage vorher</SelectItem>
                  <SelectItem value="30">30 Tage vorher</SelectItem>
                  <SelectItem value="60">60 Tage vorher</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <Label>Automatische Löschung</Label>
                  <SettingAffectedFeaturesInline module="recruiting" settingKey="auto_delete_after_retention" />
                </div>
                <p className="text-sm text-muted-foreground">Nach Ablauf der Speicherdauer</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label>Datenschutzerklärung</Label>
              <Textarea 
                placeholder="Link zur Datenschutzerklärung oder Text für Bewerbungsformular..."
                className="h-20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Bewerbungseinstellungen */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bewerbungseinstellungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="application-view">Bewerbungsansicht</Label>
              <Select defaultValue="full">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Vollständige Ansicht</SelectItem>
                  <SelectItem value="anonymized">Anonymisierte Ansicht</SelectItem>
                  <SelectItem value="selective">Selektive Ansicht</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Kandidatenpool aktivieren</Label>
                <p className="text-sm text-muted-foreground">Für zukünftige Positionen</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatische Bestätigung</Label>
                <p className="text-sm text-muted-foreground">E-Mail nach Bewerbungseingang</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="application-limit">Max. Bewerbungen pro Position</Label>
              <Input 
                type="number" 
                defaultValue="100" 
                placeholder="0 = unbegrenzt"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Referenzen erlauben</Label>
                <p className="text-sm text-muted-foreground">Mitarbeiter können Kandidaten empfehlen</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* System-Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">System-Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Onboarding-Integration</Label>
                <p className="text-sm text-muted-foreground">Automatischer Übergang nach Einstellung</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Performance-Modul verknüpfen</Label>
                <p className="text-sm text-muted-foreground">Bewerber → Mitarbeiterziele</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Kalender-Integration</Label>
                <p className="text-sm text-muted-foreground">Für Interview-Termine</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Backup-Häufigkeit</Label>
              <Select defaultValue="daily">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Stündlich</SelectItem>
                  <SelectItem value="daily">Täglich</SelectItem>
                  <SelectItem value="weekly">Wöchentlich</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modul-Übersicht */}
      <SettingAffectedFeaturesCard 
        module="recruiting" 
        settingName="Recruiting-Modul"
        affectedFeatures={[
          "Stellenausschreibungen", 
          "Bewerbermanagement", 
          "Karriereportal",
          "Interview-Planung",
          "Onboarding-Integration",
          "Reports & Analytics"
        ]}
        enforcement={["ui", "api", "automation"]}
        riskLevel="medium"
        showLegalRef
        legalReference="AGG, DSGVO Art. 6"
      />

      <div className="flex justify-end">
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
};

export default RecruitingGeneralSettings;