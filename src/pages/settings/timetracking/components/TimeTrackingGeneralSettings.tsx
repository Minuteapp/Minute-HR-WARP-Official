import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePermissionContext } from "@/contexts/PermissionContext";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { useToast } from "@/hooks/use-toast";
import { Info, Loader2, Save } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SettingAffectedFeaturesInline, SettingAffectedFeaturesCard } from '@/components/settings/SettingAffectedFeaturesCard';

interface TimeTrackingFormState {
  manual_booking_allowed: boolean;
  break_tracking_mode: string;
  overtime_threshold_hours: number;
  max_daily_hours: number;
  require_approval: boolean;
  auto_break_calculation: boolean;
  break_after_6h_minutes: number;
  break_after_9h_minutes: number;
  paid_breaks: boolean;
  overtime_account_enabled: boolean;
  flextime_account_enabled: boolean;
  max_overtime_hours: number;
  flextime_range_hours: number;
  carryover_limit_hours: number;
  auto_holiday_import: boolean;
  weekend_work_allowed: boolean;
  shift_integration: boolean;
  night_bonus_percent: number;
  weekend_bonus_percent: number;
}

export default function TimeTrackingGeneralSettings() {
  const { hasPermission } = usePermissionContext();
  const { toast } = useToast();
  const canManage = hasPermission('timetracking', 'manage');
  
  // Settings-Driven Architecture: Lade Einstellungen aus Datenbank
  const { 
    settings, 
    loading, 
    isSaving,
    getValue, 
    isAllowed,
    getSetting,
    getRestrictionReason,
    saveSettings
  } = useEffectiveSettings('timetracking');

  // Lokaler State für Form-Felder
  const [formState, setFormState] = useState<TimeTrackingFormState>({
    manual_booking_allowed: true,
    break_tracking_mode: 'automatic',
    overtime_threshold_hours: 8,
    max_daily_hours: 10,
    require_approval: false,
    auto_break_calculation: true,
    break_after_6h_minutes: 30,
    break_after_9h_minutes: 45,
    paid_breaks: false,
    overtime_account_enabled: true,
    flextime_account_enabled: true,
    max_overtime_hours: 50,
    flextime_range_hours: 20,
    carryover_limit_hours: 40,
    auto_holiday_import: true,
    weekend_work_allowed: false,
    shift_integration: false,
    night_bonus_percent: 25,
    weekend_bonus_percent: 50,
  });

  // Sync Form-State mit geladenen Settings
  useEffect(() => {
    if (!loading && Object.keys(settings).length > 0) {
      setFormState({
        manual_booking_allowed: getValue('manual_booking_allowed', true),
        break_tracking_mode: getValue('break_tracking_mode', 'automatic'),
        overtime_threshold_hours: getValue('overtime_threshold_hours', 8),
        max_daily_hours: getValue('max_daily_hours', 10),
        require_approval: getValue('require_approval', false),
        auto_break_calculation: getValue('auto_break_calculation', true),
        break_after_6h_minutes: getValue('break_after_6h_minutes', 30),
        break_after_9h_minutes: getValue('break_after_9h_minutes', 45),
        paid_breaks: getValue('paid_breaks', false),
        overtime_account_enabled: getValue('overtime_account_enabled', true),
        flextime_account_enabled: getValue('flextime_account_enabled', true),
        max_overtime_hours: getValue('max_overtime_hours', 50),
        flextime_range_hours: getValue('flextime_range_hours', 20),
        carryover_limit_hours: getValue('carryover_limit_hours', 40),
        auto_holiday_import: getValue('auto_holiday_import', true),
        weekend_work_allowed: getValue('weekend_work_allowed', false),
        shift_integration: getValue('shift_integration', false),
        night_bonus_percent: getValue('night_bonus_percent', 25),
        weekend_bonus_percent: getValue('weekend_bonus_percent', 50),
      });
    }
  }, [loading, settings, getValue]);

  const updateFormField = <K extends keyof TimeTrackingFormState>(key: K, value: TimeTrackingFormState[K]) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const success = await saveSettings(formState);
      if (success) {
        toast({
          title: "Einstellungen gespeichert",
          description: "Die Zeiterfassungs-Einstellungen wurden erfolgreich in der Datenbank aktualisiert.",
        });
      } else {
        toast({
          title: "Fehler beim Speichern",
          description: "Die Einstellungen konnten nicht gespeichert werden.",
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

  // Hilfsfunktion für Setting-Indicator
  const SettingIndicator = ({ settingKey }: { settingKey: string }) => {
    const setting = getSetting(settingKey);
    if (!setting) return null;
    
    const levelColors: Record<string, string> = {
      global: 'bg-blue-100 text-blue-800',
      company: 'bg-green-100 text-green-800',
      location: 'bg-yellow-100 text-yellow-800',
      department: 'bg-orange-100 text-orange-800',
      team: 'bg-purple-100 text-purple-800',
      user: 'bg-pink-100 text-pink-800'
    };
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className={`ml-2 text-xs ${levelColors[setting.source.level] || ''}`}>
              <Info className="h-3 w-3 mr-1" />
              {setting.source.level}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Einstellung von: {setting.source.level}</p>
            {setting.isLocked && <p className="text-amber-500">Gesperrt</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="space-y-6">
      {/* Allgemeine Zeiterfassungseinstellungen */}
      <Card>
        <CardHeader>
          <CardTitle>Buchungsregeln</CardTitle>
          <CardDescription>
            Grundeinstellungen für die Zeiterfassung
            {loading && <Badge variant="outline" className="ml-2">Lädt...</Badge>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center">
                <Label htmlFor="manual-booking">Manuelle Nachbuchung erlaubt</Label>
                <SettingIndicator settingKey="manual_booking_allowed" />
                <SettingAffectedFeaturesInline module="timetracking" settingKey="manual_booking_allowed" className="ml-2" />
              </div>
              <p className="text-sm text-muted-foreground">
                Mitarbeiter können Zeiten manuell erfassen
              </p>
            </div>
            <Switch 
              id="manual-booking" 
              checked={formState.manual_booking_allowed}
              onCheckedChange={(checked) => updateFormField('manual_booking_allowed', checked)}
              disabled={!canManage} 
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center">
                <Label htmlFor="require-approval">Genehmigung erforderlich</Label>
                <SettingIndicator settingKey="require_approval" />
                <SettingAffectedFeaturesInline module="timetracking" settingKey="require_approval" className="ml-2" />
              </div>
              <p className="text-sm text-muted-foreground">
                Zeitbuchungen müssen genehmigt werden
              </p>
            </div>
            <Switch 
              id="require-approval" 
              checked={formState.require_approval}
              onCheckedChange={(checked) => updateFormField('require_approval', checked)}
              disabled={!canManage} 
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="break-mode">Pausen-Tracking-Modus</Label>
              <SettingIndicator settingKey="break_tracking_mode" />
            </div>
            <Select 
              value={formState.break_tracking_mode} 
              onValueChange={(v) => updateFormField('break_tracking_mode', v)}
              disabled={!canManage}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="automatic">Automatisch (gesetzlich)</SelectItem>
                <SelectItem value="manual">Manuell</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="disabled">Deaktiviert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Arbeitszeitmodelle */}
      <Card>
        <CardHeader>
          <CardTitle>Standard-Arbeitszeitmodelle</CardTitle>
          <CardDescription>
            Definition der verfügbaren Arbeitszeitmodelle für Mitarbeiter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default-model">Standard-Modell</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Arbeitszeitmodell wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="40h-week">40-Stunden-Woche</SelectItem>
                <SelectItem value="38h-week">38-Stunden-Woche</SelectItem>
                <SelectItem value="35h-week">35-Stunden-Woche</SelectItem>
                <SelectItem value="flextime">Gleitzeit</SelectItem>
                <SelectItem value="parttime">Teilzeit</SelectItem>
                <SelectItem value="shift">Schichtarbeit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Verfügbare Arbeitszeitmodelle</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge>40h-Vollzeit</Badge>
              <Badge>Teilzeit 20h</Badge>
              <Badge>Gleitzeit 38h</Badge>
              <Badge>Schichtdienst</Badge>
              <Badge>Homeoffice-Hybrid</Badge>
            </div>
            <Button variant="outline" size="sm" disabled={!canManage}>
              Modell hinzufügen
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="daily-hours">Regelarbeitszeit pro Tag (h)</Label>
                <SettingIndicator settingKey="overtime_threshold_hours" />
              </div>
              <Input
                id="daily-hours"
                type="number"
                value={formState.overtime_threshold_hours}
                onChange={(e) => updateFormField('overtime_threshold_hours', parseInt(e.target.value) || 8)}
                disabled={!canManage}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="max-daily">Max. Tagesarbeitszeit (h)</Label>
                <SettingIndicator settingKey="max_daily_hours" />
              </div>
              <Input
                id="max-daily"
                type="number"
                value={formState.max_daily_hours}
                onChange={(e) => updateFormField('max_daily_hours', parseInt(e.target.value) || 10)}
                disabled={!canManage}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pausenregelungen */}
      <Card>
        <CardHeader>
          <CardTitle>Pausenregelungen</CardTitle>
          <CardDescription>
            Konfiguration der gesetzlichen und betrieblichen Pausenzeiten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="automatic-breaks">Automatische Pausenberechnung</Label>
              <p className="text-sm text-muted-foreground">
                Pausen automatisch nach gesetzlichen Vorgaben berechnen
              </p>
            </div>
            <Switch id="automatic-breaks" defaultChecked disabled={!canManage} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="break-6h">Pause nach 6h (Min.)</Label>
              <Input
                id="break-6h"
                type="number"
                defaultValue={30}
                disabled={!canManage}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="break-9h">Pause nach 9h (Min.)</Label>
              <Input
                id="break-9h"
                type="number"
                defaultValue={45}
                disabled={!canManage}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="paid-breaks">Bezahlte Pausen</Label>
              <p className="text-sm text-muted-foreground">
                Pausen werden als Arbeitszeit gewertet
              </p>
            </div>
            <Switch id="paid-breaks" disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

      {/* Arbeitszeitkonten */}
      <Card>
        <CardHeader>
          <CardTitle>Arbeitszeitkonten</CardTitle>
          <CardDescription>
            Verwaltung von Überstunden- und Gleitzeitkonten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="overtime-account" defaultChecked disabled={!canManage} />
              <Label htmlFor="overtime-account">Überstundenkonto</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="flextime-account" defaultChecked disabled={!canManage} />
              <Label htmlFor="flextime-account">Gleitzeitkonto</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="overtime-limit">Max. Überstunden (h/Monat)</Label>
              <Input
                id="overtime-limit"
                type="number"
                defaultValue={50}
                disabled={!canManage}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flextime-range">Gleitzeit-Spanne (+/- h)</Label>
              <Input
                id="flextime-range"
                type="number"
                defaultValue={20}
                disabled={!canManage}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="carryover-limit">Übertragungsgrenze (h)</Label>
            <Input
              id="carryover-limit"
              type="number"
              defaultValue={40}
              disabled={!canManage}
            />
            <p className="text-sm text-muted-foreground">
              Maximale Stunden, die ins nächste Jahr übertragen werden können
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Feiertage */}
      <Card>
        <CardHeader>
          <CardTitle>Feiertage & Kalender</CardTitle>
          <CardDescription>
            Automatischer Import von Feiertagen nach Standorten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-holidays">Automatischer Feiertagsimport</Label>
              <p className="text-sm text-muted-foreground">
                Feiertage automatisch über API importieren
              </p>
            </div>
            <Switch id="auto-holidays" defaultChecked disabled={!canManage} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="holiday-region">Standard-Region</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Region für Feiertage wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="de-bw">Deutschland - Baden-Württemberg</SelectItem>
                <SelectItem value="de-by">Deutschland - Bayern</SelectItem>
                <SelectItem value="de-be">Deutschland - Berlin</SelectItem>
                <SelectItem value="de-br">Deutschland - Brandenburg</SelectItem>
                <SelectItem value="ch">Schweiz</SelectItem>
                <SelectItem value="at">Österreich</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekend-work">Wochenendarbeit erlaubt</Label>
              <p className="text-sm text-muted-foreground">
                Arbeit an Samstagen und Sonntagen genehmigen
              </p>
            </div>
            <Switch id="weekend-work" disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

      {/* Schichtmodelle */}
      <Card>
        <CardHeader>
          <CardTitle>Schichtmodelle</CardTitle>
          <CardDescription>
            Verknüpfung von Schichtplanung mit Zeiterfassung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="shift-integration">Schichtplan-Integration</Label>
              <p className="text-sm text-muted-foreground">
                Geplante Schichten mit Zeiterfassung abgleichen
              </p>
            </div>
            <Switch id="shift-integration" disabled={!canManage} />
          </div>

          <div className="space-y-2">
            <Label>Verfügbare Schichtmodelle</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="secondary">Frühschicht (06:00-14:00)</Badge>
              <Badge variant="secondary">Spätschicht (14:00-22:00)</Badge>
              <Badge variant="secondary">Nachtschicht (22:00-06:00)</Badge>
              <Badge variant="secondary">Bereitschaftsdienst</Badge>
            </div>
            <Button variant="outline" size="sm" disabled={!canManage}>
              Schichtmodell hinzufügen
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="night-bonus">Nachtzuschlag (%)</Label>
              <Input
                id="night-bonus"
                type="number"
                defaultValue={25}
                disabled={!canManage}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekend-bonus">Wochenendzuschlag (%)</Label>
              <Input
                id="weekend-bonus"
                type="number"
                defaultValue={50}
                disabled={!canManage}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modul-Übersicht der betroffenen Features */}
      <SettingAffectedFeaturesCard 
        module="timetracking" 
        settingName="Zeiterfassungs-Modul"
        affectedFeatures={[
          "Stempeluhr", 
          "Zeitbuchungen", 
          "Überstundenkonten",
          "Pausenregelungen",
          "Manager-Genehmigungen",
          "Payroll-Integration",
          "Mobile App"
        ]}
        enforcement={["ui", "api", "automation", "ai"]}
        riskLevel="high"
        showLegalRef
        legalReference="ArbZG § 3, § 4, § 16"
      />

      {/* Speichern-Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!canManage || isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
}
