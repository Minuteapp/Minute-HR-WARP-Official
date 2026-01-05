import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  CalendarDays, Settings, FileText, RotateCcw, Plus, ChevronLeft, Trash2, GripVertical,
  Clock, Coffee, DollarSign, Users, Award, Bell, Shield, Calendar, Loader2, Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";

interface ShiftPlanningFormState {
  // Schichtmodelle Tab
  flexible_shift_times: boolean;
  flexibility_before_minutes: number;
  flexibility_after_minutes: number;
  shift_splitting_allowed: boolean;
  auto_time_tracking: boolean;
  
  // Regeln Tab
  max_daily_hours: number;
  max_weekly_hours: number;
  min_rest_hours: number;
  max_shift_duration: number;
  auto_rule_check: boolean;
  block_violations: boolean;
  min_staffing_enabled: boolean;
  sunday_work_allowed: boolean;
  holiday_work_allowed: boolean;
  compensatory_rest_required: boolean;
  holiday_region: string;
  
  // Pausen Tab
  auto_break_calculation: boolean;
  warn_break_violations: boolean;
  paid_breaks: boolean;
  min_break_duration: number;
  max_break_duration: number;
  break_splitting_allowed: boolean;
  min_break_part_duration: number;
  fixed_break_times: boolean;
  
  // Überstunden Tab
  overtime_tracking_enabled: boolean;
  overtime_threshold_weekly: number;
  max_overtime_monthly: number;
  overtime_warning_enabled: boolean;
  overtime_warning_threshold: number;
  overtime_approval_required: boolean;
  overtime_approval_hours: number;
  pre_approval_required: boolean;
  post_approval_allowed: boolean;
  overtime_compensation_method: string;
  auto_overtime_reduction: boolean;
  overtime_expiry_months: number;
  
  // Zuschläge Tab
  night_bonus_enabled: boolean;
  night_bonus_percent: number;
  late_shift_bonus_percent: number;
  weekend_bonus_enabled: boolean;
  saturday_bonus_percent: number;
  sunday_bonus_percent: number;
  holiday_bonus_percent: number;
  special_holiday_bonus_percent: number;
  overtime_bonus_enabled: boolean;
  standard_overtime_bonus_percent: number;
  weekend_overtime_bonus_percent: number;
  cumulative_bonuses: boolean;
  
  // Qualifikationen Tab
  auto_qualification_check: boolean;
  block_missing_qualifications: boolean;
  warn_expiring_certs: boolean;
  cert_warning_days: number;
  
  // Verfügbarkeit Tab
  wish_schedule_enabled: boolean;
  blocked_days_enabled: boolean;
  max_blocked_days_monthly: number;
  consider_preferences: boolean;
  wish_lead_time_days: number;
  shift_swap_enabled: boolean;
  swap_approval_required: boolean;
  swap_qualification_check: boolean;
  min_swap_lead_time_hours: number;
  
  // Rotation Tab
  auto_rotation_enabled: boolean;
  rotation_cycle: string;
  forward_rotation: boolean;
  rotation_consider_preferences: boolean;
  fair_distribution_enabled: boolean;
  fair_distribution_tolerance: number;
  avoid_consecutive_night_shifts: boolean;
  max_consecutive_night_shifts: number;
}

const defaultFormState: ShiftPlanningFormState = {
  flexible_shift_times: false,
  flexibility_before_minutes: 15,
  flexibility_after_minutes: 15,
  shift_splitting_allowed: false,
  auto_time_tracking: true,
  max_daily_hours: 10,
  max_weekly_hours: 48,
  min_rest_hours: 11,
  max_shift_duration: 10,
  auto_rule_check: true,
  block_violations: true,
  min_staffing_enabled: true,
  sunday_work_allowed: true,
  holiday_work_allowed: true,
  compensatory_rest_required: true,
  holiday_region: 'de',
  auto_break_calculation: true,
  warn_break_violations: true,
  paid_breaks: false,
  min_break_duration: 15,
  max_break_duration: 60,
  break_splitting_allowed: true,
  min_break_part_duration: 15,
  fixed_break_times: false,
  overtime_tracking_enabled: true,
  overtime_threshold_weekly: 40,
  max_overtime_monthly: 30,
  overtime_warning_enabled: true,
  overtime_warning_threshold: 20,
  overtime_approval_required: true,
  overtime_approval_hours: 2,
  pre_approval_required: false,
  post_approval_allowed: true,
  overtime_compensation_method: 'both',
  auto_overtime_reduction: false,
  overtime_expiry_months: 12,
  night_bonus_enabled: true,
  night_bonus_percent: 25,
  late_shift_bonus_percent: 10,
  weekend_bonus_enabled: true,
  saturday_bonus_percent: 25,
  sunday_bonus_percent: 50,
  holiday_bonus_percent: 100,
  special_holiday_bonus_percent: 150,
  overtime_bonus_enabled: true,
  standard_overtime_bonus_percent: 25,
  weekend_overtime_bonus_percent: 50,
  cumulative_bonuses: true,
  auto_qualification_check: true,
  block_missing_qualifications: true,
  warn_expiring_certs: true,
  cert_warning_days: 30,
  wish_schedule_enabled: true,
  blocked_days_enabled: true,
  max_blocked_days_monthly: 5,
  consider_preferences: true,
  wish_lead_time_days: 14,
  shift_swap_enabled: true,
  swap_approval_required: true,
  swap_qualification_check: true,
  min_swap_lead_time_hours: 24,
  auto_rotation_enabled: false,
  rotation_cycle: '4weeks',
  forward_rotation: true,
  rotation_consider_preferences: true,
  fair_distribution_enabled: true,
  fair_distribution_tolerance: 10,
  avoid_consecutive_night_shifts: true,
  max_consecutive_night_shifts: 3,
};

export default function ShiftPlanningSettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings, loading, isSaving, getValue, saveSettings } = useEffectiveSettings('shift_planning');
  const [formState, setFormState] = useState<ShiftPlanningFormState>(defaultFormState);
  
  const [shifts, setShifts] = useState([
    { id: "1", name: "Frühschicht", start: "06:00", end: "14:00", color: "#22c55e" },
    { id: "2", name: "Spätschicht", start: "14:00", end: "22:00", color: "#3b82f6" },
    { id: "3", name: "Nachtschicht", start: "22:00", end: "06:00", color: "#6366f1" },
    { id: "4", name: "Tagschicht", start: "08:00", end: "17:00", color: "#f59e0b" },
  ]);

  // Sync form state with database settings
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormState(prev => ({
        ...prev,
        flexible_shift_times: getValue('flexible_shift_times', prev.flexible_shift_times),
        flexibility_before_minutes: getValue('flexibility_before_minutes', prev.flexibility_before_minutes),
        flexibility_after_minutes: getValue('flexibility_after_minutes', prev.flexibility_after_minutes),
        shift_splitting_allowed: getValue('shift_splitting_allowed', prev.shift_splitting_allowed),
        auto_time_tracking: getValue('auto_time_tracking', prev.auto_time_tracking),
        max_daily_hours: getValue('max_daily_hours', prev.max_daily_hours),
        max_weekly_hours: getValue('max_weekly_hours', prev.max_weekly_hours),
        min_rest_hours: getValue('min_rest_hours', prev.min_rest_hours),
        max_shift_duration: getValue('max_shift_duration', prev.max_shift_duration),
        auto_rule_check: getValue('auto_rule_check', prev.auto_rule_check),
        block_violations: getValue('block_violations', prev.block_violations),
        min_staffing_enabled: getValue('min_staffing_enabled', prev.min_staffing_enabled),
        sunday_work_allowed: getValue('sunday_work_allowed', prev.sunday_work_allowed),
        holiday_work_allowed: getValue('holiday_work_allowed', prev.holiday_work_allowed),
        compensatory_rest_required: getValue('compensatory_rest_required', prev.compensatory_rest_required),
        holiday_region: getValue('holiday_region', prev.holiday_region),
        auto_break_calculation: getValue('auto_break_calculation', prev.auto_break_calculation),
        warn_break_violations: getValue('warn_break_violations', prev.warn_break_violations),
        paid_breaks: getValue('paid_breaks', prev.paid_breaks),
        min_break_duration: getValue('min_break_duration', prev.min_break_duration),
        max_break_duration: getValue('max_break_duration', prev.max_break_duration),
        break_splitting_allowed: getValue('break_splitting_allowed', prev.break_splitting_allowed),
        min_break_part_duration: getValue('min_break_part_duration', prev.min_break_part_duration),
        fixed_break_times: getValue('fixed_break_times', prev.fixed_break_times),
        overtime_tracking_enabled: getValue('overtime_tracking_enabled', prev.overtime_tracking_enabled),
        overtime_threshold_weekly: getValue('overtime_threshold_weekly', prev.overtime_threshold_weekly),
        max_overtime_monthly: getValue('max_overtime_monthly', prev.max_overtime_monthly),
        overtime_warning_enabled: getValue('overtime_warning_enabled', prev.overtime_warning_enabled),
        overtime_warning_threshold: getValue('overtime_warning_threshold', prev.overtime_warning_threshold),
        overtime_approval_required: getValue('overtime_approval_required', prev.overtime_approval_required),
        overtime_approval_hours: getValue('overtime_approval_hours', prev.overtime_approval_hours),
        pre_approval_required: getValue('pre_approval_required', prev.pre_approval_required),
        post_approval_allowed: getValue('post_approval_allowed', prev.post_approval_allowed),
        overtime_compensation_method: getValue('overtime_compensation_method', prev.overtime_compensation_method),
        auto_overtime_reduction: getValue('auto_overtime_reduction', prev.auto_overtime_reduction),
        overtime_expiry_months: getValue('overtime_expiry_months', prev.overtime_expiry_months),
        night_bonus_enabled: getValue('night_bonus_enabled', prev.night_bonus_enabled),
        night_bonus_percent: getValue('night_bonus_percent', prev.night_bonus_percent),
        late_shift_bonus_percent: getValue('late_shift_bonus_percent', prev.late_shift_bonus_percent),
        weekend_bonus_enabled: getValue('weekend_bonus_enabled', prev.weekend_bonus_enabled),
        saturday_bonus_percent: getValue('saturday_bonus_percent', prev.saturday_bonus_percent),
        sunday_bonus_percent: getValue('sunday_bonus_percent', prev.sunday_bonus_percent),
        holiday_bonus_percent: getValue('holiday_bonus_percent', prev.holiday_bonus_percent),
        special_holiday_bonus_percent: getValue('special_holiday_bonus_percent', prev.special_holiday_bonus_percent),
        overtime_bonus_enabled: getValue('overtime_bonus_enabled', prev.overtime_bonus_enabled),
        standard_overtime_bonus_percent: getValue('standard_overtime_bonus_percent', prev.standard_overtime_bonus_percent),
        weekend_overtime_bonus_percent: getValue('weekend_overtime_bonus_percent', prev.weekend_overtime_bonus_percent),
        cumulative_bonuses: getValue('cumulative_bonuses', prev.cumulative_bonuses),
        auto_qualification_check: getValue('auto_qualification_check', prev.auto_qualification_check),
        block_missing_qualifications: getValue('block_missing_qualifications', prev.block_missing_qualifications),
        warn_expiring_certs: getValue('warn_expiring_certs', prev.warn_expiring_certs),
        cert_warning_days: getValue('cert_warning_days', prev.cert_warning_days),
        wish_schedule_enabled: getValue('wish_schedule_enabled', prev.wish_schedule_enabled),
        blocked_days_enabled: getValue('blocked_days_enabled', prev.blocked_days_enabled),
        max_blocked_days_monthly: getValue('max_blocked_days_monthly', prev.max_blocked_days_monthly),
        consider_preferences: getValue('consider_preferences', prev.consider_preferences),
        wish_lead_time_days: getValue('wish_lead_time_days', prev.wish_lead_time_days),
        shift_swap_enabled: getValue('shift_swap_enabled', prev.shift_swap_enabled),
        swap_approval_required: getValue('swap_approval_required', prev.swap_approval_required),
        swap_qualification_check: getValue('swap_qualification_check', prev.swap_qualification_check),
        min_swap_lead_time_hours: getValue('min_swap_lead_time_hours', prev.min_swap_lead_time_hours),
        auto_rotation_enabled: getValue('auto_rotation_enabled', prev.auto_rotation_enabled),
        rotation_cycle: getValue('rotation_cycle', prev.rotation_cycle),
        forward_rotation: getValue('forward_rotation', prev.forward_rotation),
        rotation_consider_preferences: getValue('rotation_consider_preferences', prev.rotation_consider_preferences),
        fair_distribution_enabled: getValue('fair_distribution_enabled', prev.fair_distribution_enabled),
        fair_distribution_tolerance: getValue('fair_distribution_tolerance', prev.fair_distribution_tolerance),
        avoid_consecutive_night_shifts: getValue('avoid_consecutive_night_shifts', prev.avoid_consecutive_night_shifts),
        max_consecutive_night_shifts: getValue('max_consecutive_night_shifts', prev.max_consecutive_night_shifts),
      }));
    }
  }, [settings, getValue]);

  const updateFormField = <K extends keyof ShiftPlanningFormState>(key: K, value: ShiftPlanningFormState[K]) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const success = await saveSettings(formState);
      if (success) {
        toast({
          title: "Einstellungen gespeichert",
          description: "Die Schichtplanungs-Einstellungen wurden erfolgreich in der Datenbank aktualisiert.",
        });
      } else {
        toast({
          title: "Fehler beim Speichern",
          description: "Die Einstellungen konnten nicht gespeichert werden.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/settings")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">Schichtplanungs-Einstellungen</h1>
              <p className="text-sm text-muted-foreground">Konfigurieren Sie Schichtmodelle, Regeln und Zuschläge</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Einstellungen speichern
          </Button>
        </div>
        <Tabs defaultValue="models" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="models" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden lg:inline">Schichten</span>
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden lg:inline">Regeln</span>
            </TabsTrigger>
            <TabsTrigger value="breaks" className="flex items-center gap-2">
              <Coffee className="h-4 w-4" />
              <span className="hidden lg:inline">Pausen</span>
            </TabsTrigger>
            <TabsTrigger value="overtime" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden lg:inline">Überstunden</span>
            </TabsTrigger>
            <TabsTrigger value="bonuses" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden lg:inline">Zuschläge</span>
            </TabsTrigger>
            <TabsTrigger value="qualifications" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden lg:inline">Qualifikationen</span>
            </TabsTrigger>
            <TabsTrigger value="availability" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden lg:inline">Verfügbarkeit</span>
            </TabsTrigger>
            <TabsTrigger value="rotation" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              <span className="hidden lg:inline">Rotation</span>
            </TabsTrigger>
          </TabsList>

          {/* Schichtmodelle */}
          <TabsContent value="models" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Schichtmodelle</CardTitle>
                <CardDescription>Definieren Sie verschiedene Schichtarten</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {shifts.map((shift) => (
                  <div key={shift.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <Input type="color" value={shift.color} className="w-12 h-8 p-0 border-0" />
                    <Input value={shift.name} className="flex-1" />
                    <div className="flex items-center gap-2">
                      <Input type="time" value={shift.start} className="w-28" />
                      <span>-</span>
                      <Input type="time" value={shift.end} className="w-28" />
                    </div>
                    <Badge style={{ backgroundColor: shift.color, color: "white" }}>{shift.name}</Badge>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Neues Schichtmodell
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schicht-Grundeinstellungen</CardTitle>
                <CardDescription>Allgemeine Konfiguration für Schichten</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Flexible Schichtzeiten</Label>
                    <p className="text-sm text-muted-foreground">Mitarbeiter können Start/Ende anpassen</p>
                  </div>
                  <Switch 
                    checked={formState.flexible_shift_times}
                    onCheckedChange={(v) => updateFormField('flexible_shift_times', v)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Flexibilität vor Schichtbeginn (Min)</Label>
                    <Input 
                      type="number" 
                      value={formState.flexibility_before_minutes}
                      onChange={(e) => updateFormField('flexibility_before_minutes', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Flexibilität nach Schichtende (Min)</Label>
                    <Input 
                      type="number" 
                      value={formState.flexibility_after_minutes}
                      onChange={(e) => updateFormField('flexibility_after_minutes', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Schicht-Splitting erlauben</Label>
                    <p className="text-sm text-muted-foreground">Schichten aufteilen können</p>
                  </div>
                  <Switch 
                    checked={formState.shift_splitting_allowed}
                    onCheckedChange={(v) => updateFormField('shift_splitting_allowed', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Zeiterfassung</Label>
                    <p className="text-sm text-muted-foreground">Zeiten aus Schichtplan übernehmen</p>
                  </div>
                  <Switch 
                    checked={formState.auto_time_tracking}
                    onCheckedChange={(v) => updateFormField('auto_time_tracking', v)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Arbeitszeitregeln */}
          <TabsContent value="rules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gesetzliche Arbeitszeitregeln</CardTitle>
                <CardDescription>Arbeitszeitrechtliche Vorgaben nach ArbZG</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Maximale tägliche Arbeitszeit (Stunden)</Label>
                    <Input 
                      type="number" 
                      value={formState.max_daily_hours}
                      onChange={(e) => updateFormField('max_daily_hours', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximale wöchentliche Arbeitszeit (Stunden)</Label>
                    <Input 
                      type="number" 
                      value={formState.max_weekly_hours}
                      onChange={(e) => updateFormField('max_weekly_hours', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Minimale Ruhezeit zwischen Schichten (Stunden)</Label>
                    <Input 
                      type="number" 
                      value={formState.min_rest_hours}
                      onChange={(e) => updateFormField('min_rest_hours', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximale Schichtdauer (Stunden)</Label>
                    <Input 
                      type="number" 
                      value={formState.max_shift_duration}
                      onChange={(e) => updateFormField('max_shift_duration', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Regelprüfung</Label>
                    <p className="text-sm text-muted-foreground">Warnung bei Regelverstößen</p>
                  </div>
                  <Switch 
                    checked={formState.auto_rule_check}
                    onCheckedChange={(v) => updateFormField('auto_rule_check', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Verstöße blockieren</Label>
                    <p className="text-sm text-muted-foreground">Planung bei Verstößen verhindern</p>
                  </div>
                  <Switch 
                    checked={formState.block_violations}
                    onCheckedChange={(v) => updateFormField('block_violations', v)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mindestbesetzung</CardTitle>
                <CardDescription>Minimale Anzahl Mitarbeiter pro Schicht</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mindestbesetzung aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Warnung bei Unterbesetzung</p>
                  </div>
                  <Switch 
                    checked={formState.min_staffing_enabled}
                    onCheckedChange={(v) => updateFormField('min_staffing_enabled', v)}
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 border rounded-lg">
                    <span className="flex-1 font-medium">Frühschicht</span>
                    <Input type="number" defaultValue="3" className="w-20" />
                    <span className="text-sm text-muted-foreground">Mitarbeiter</span>
                  </div>
                  <div className="flex items-center gap-4 p-3 border rounded-lg">
                    <span className="flex-1 font-medium">Spätschicht</span>
                    <Input type="number" defaultValue="3" className="w-20" />
                    <span className="text-sm text-muted-foreground">Mitarbeiter</span>
                  </div>
                  <div className="flex items-center gap-4 p-3 border rounded-lg">
                    <span className="flex-1 font-medium">Nachtschicht</span>
                    <Input type="number" defaultValue="2" className="w-20" />
                    <span className="text-sm text-muted-foreground">Mitarbeiter</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wochenend- und Feiertagsarbeit</CardTitle>
                <CardDescription>Regelungen für besondere Tage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sonntagsarbeit erlauben</Label>
                    <p className="text-sm text-muted-foreground">Schichten an Sonntagen</p>
                  </div>
                  <Switch 
                    checked={formState.sunday_work_allowed}
                    onCheckedChange={(v) => updateFormField('sunday_work_allowed', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Feiertagsarbeit erlauben</Label>
                    <p className="text-sm text-muted-foreground">Schichten an Feiertagen</p>
                  </div>
                  <Switch 
                    checked={formState.holiday_work_allowed}
                    onCheckedChange={(v) => updateFormField('holiday_work_allowed', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Ausgleichsruhetag erforderlich</Label>
                    <p className="text-sm text-muted-foreground">Bei Sonntagsarbeit automatisch planen</p>
                  </div>
                  <Switch 
                    checked={formState.compensatory_rest_required}
                    onCheckedChange={(v) => updateFormField('compensatory_rest_required', v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Feiertag-Erkennung</Label>
                  <Select 
                    value={formState.holiday_region}
                    onValueChange={(v) => updateFormField('holiday_region', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="de">Deutschland (bundesweit)</SelectItem>
                      <SelectItem value="de-by">Bayern</SelectItem>
                      <SelectItem value="de-nw">NRW</SelectItem>
                      <SelectItem value="at">Österreich</SelectItem>
                      <SelectItem value="ch">Schweiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pausen */}
          <TabsContent value="breaks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gesetzliche Pausenregelungen</CardTitle>
                <CardDescription>Pausenpflichten nach ArbZG</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Ab 6 Stunden Arbeitszeit</span>
                      <Badge>30 Min Pause</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Mindestens 30 Minuten Pause erforderlich</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Ab 9 Stunden Arbeitszeit</span>
                      <Badge>45 Min Pause</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Mindestens 45 Minuten Pause erforderlich</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Pausenberechnung</Label>
                    <p className="text-sm text-muted-foreground">Pausen automatisch einplanen</p>
                  </div>
                  <Switch 
                    checked={formState.auto_break_calculation}
                    onCheckedChange={(v) => updateFormField('auto_break_calculation', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Pausenverstöße warnen</Label>
                    <p className="text-sm text-muted-foreground">Benachrichtigung bei fehlenden Pausen</p>
                  </div>
                  <Switch 
                    checked={formState.warn_break_violations}
                    onCheckedChange={(v) => updateFormField('warn_break_violations', v)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pauseneinstellungen</CardTitle>
                <CardDescription>Konfiguration der Pausenzeiten</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bezahlte Pausen</Label>
                    <p className="text-sm text-muted-foreground">Pausen als Arbeitszeit zählen</p>
                  </div>
                  <Switch 
                    checked={formState.paid_breaks}
                    onCheckedChange={(v) => updateFormField('paid_breaks', v)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mindestpausendauer (Min)</Label>
                    <Input 
                      type="number" 
                      value={formState.min_break_duration}
                      onChange={(e) => updateFormField('min_break_duration', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximale Pausendauer (Min)</Label>
                    <Input 
                      type="number" 
                      value={formState.max_break_duration}
                      onChange={(e) => updateFormField('max_break_duration', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Pausen splitten erlauben</Label>
                    <p className="text-sm text-muted-foreground">Pause in mehrere Teile aufteilen</p>
                  </div>
                  <Switch 
                    checked={formState.break_splitting_allowed}
                    onCheckedChange={(v) => updateFormField('break_splitting_allowed', v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Minimale Pausenteil-Dauer (Min)</Label>
                  <Input 
                    type="number" 
                    value={formState.min_break_part_duration}
                    onChange={(e) => updateFormField('min_break_part_duration', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Pausenzeiten festlegen</Label>
                    <p className="text-sm text-muted-foreground">Feste Pausenfenster definieren</p>
                  </div>
                  <Switch 
                    checked={formState.fixed_break_times}
                    onCheckedChange={(v) => updateFormField('fixed_break_times', v)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Überstunden */}
          <TabsContent value="overtime" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Überstunden-Regelungen</CardTitle>
                <CardDescription>Konfiguration für Mehrarbeit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Überstunden-Tracking aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Mehrarbeit erfassen und auswerten</p>
                  </div>
                  <Switch 
                    checked={formState.overtime_tracking_enabled}
                    onCheckedChange={(v) => updateFormField('overtime_tracking_enabled', v)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Überstunden ab (Stunden/Woche)</Label>
                    <Input 
                      type="number" 
                      value={formState.overtime_threshold_weekly}
                      onChange={(e) => updateFormField('overtime_threshold_weekly', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max. Überstunden pro Monat</Label>
                    <Input 
                      type="number" 
                      value={formState.max_overtime_monthly}
                      onChange={(e) => updateFormField('max_overtime_monthly', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Überstunden-Warnung</Label>
                    <p className="text-sm text-muted-foreground">Warnung bei hoher Mehrarbeit</p>
                  </div>
                  <Switch 
                    checked={formState.overtime_warning_enabled}
                    onCheckedChange={(v) => updateFormField('overtime_warning_enabled', v)}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Warnung ab Überstunden: {formState.overtime_warning_threshold} Stunden/Monat</Label>
                  <Slider 
                    value={[formState.overtime_warning_threshold]} 
                    onValueChange={(v) => updateFormField('overtime_warning_threshold', v[0])}
                    max={50} 
                    step={5} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Überstunden-Genehmigung</CardTitle>
                <CardDescription>Genehmigungsprozess für Mehrarbeit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Genehmigungspflicht</Label>
                    <p className="text-sm text-muted-foreground">Überstunden müssen genehmigt werden</p>
                  </div>
                  <Switch 
                    checked={formState.overtime_approval_required}
                    onCheckedChange={(v) => updateFormField('overtime_approval_required', v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Genehmigung erforderlich ab (Stunden)</Label>
                  <Input 
                    type="number" 
                    value={formState.overtime_approval_hours}
                    onChange={(e) => updateFormField('overtime_approval_hours', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Vorab-Genehmigung</Label>
                    <p className="text-sm text-muted-foreground">Überstunden vor Antritt genehmigen</p>
                  </div>
                  <Switch 
                    checked={formState.pre_approval_required}
                    onCheckedChange={(v) => updateFormField('pre_approval_required', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Nachträgliche Genehmigung erlauben</Label>
                    <p className="text-sm text-muted-foreground">Überstunden nach Leistung genehmigen</p>
                  </div>
                  <Switch 
                    checked={formState.post_approval_allowed}
                    onCheckedChange={(v) => updateFormField('post_approval_allowed', v)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Überstunden-Ausgleich</CardTitle>
                <CardDescription>Abbau von Mehrarbeit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Ausgleichsmethode</Label>
                  <Select 
                    value={formState.overtime_compensation_method}
                    onValueChange={(v) => updateFormField('overtime_compensation_method', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="time">Nur Freizeitausgleich</SelectItem>
                      <SelectItem value="pay">Nur Auszahlung</SelectItem>
                      <SelectItem value="both">Beides möglich</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatischer Abbau</Label>
                    <p className="text-sm text-muted-foreground">Überstunden automatisch in Freizeit umwandeln</p>
                  </div>
                  <Switch 
                    checked={formState.auto_overtime_reduction}
                    onCheckedChange={(v) => updateFormField('auto_overtime_reduction', v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Verfall nach Monaten</Label>
                  <Input 
                    type="number" 
                    value={formState.overtime_expiry_months}
                    onChange={(e) => updateFormField('overtime_expiry_months', parseInt(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Zuschläge */}
          <TabsContent value="bonuses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Schichtzuschläge</CardTitle>
                <CardDescription>Prozentuale Zuschläge für verschiedene Schichten</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Nachtarbeit-Zuschlag</Label>
                    <p className="text-sm text-muted-foreground">Zuschlag für Nachtschichten (22-06 Uhr)</p>
                  </div>
                  <Switch 
                    checked={formState.night_bonus_enabled}
                    onCheckedChange={(v) => updateFormField('night_bonus_enabled', v)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nachtarbeit Zuschlag (%)</Label>
                    <Input 
                      type="number" 
                      value={formState.night_bonus_percent}
                      onChange={(e) => updateFormField('night_bonus_percent', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Spätschicht Zuschlag (%)</Label>
                    <Input 
                      type="number" 
                      value={formState.late_shift_bonus_percent}
                      onChange={(e) => updateFormField('late_shift_bonus_percent', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wochenend- & Feiertagszuschläge</CardTitle>
                <CardDescription>Zuschläge für besondere Tage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Wochenend-Zuschläge aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Automatische Berechnung</p>
                  </div>
                  <Switch 
                    checked={formState.weekend_bonus_enabled}
                    onCheckedChange={(v) => updateFormField('weekend_bonus_enabled', v)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Samstag Zuschlag (%)</Label>
                    <Input 
                      type="number" 
                      value={formState.saturday_bonus_percent}
                      onChange={(e) => updateFormField('saturday_bonus_percent', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sonntag Zuschlag (%)</Label>
                    <Input 
                      type="number" 
                      value={formState.sunday_bonus_percent}
                      onChange={(e) => updateFormField('sunday_bonus_percent', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Feiertag Zuschlag (%)</Label>
                    <Input 
                      type="number" 
                      value={formState.holiday_bonus_percent}
                      onChange={(e) => updateFormField('holiday_bonus_percent', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Heiligabend/Silvester (%)</Label>
                    <Input 
                      type="number" 
                      value={formState.special_holiday_bonus_percent}
                      onChange={(e) => updateFormField('special_holiday_bonus_percent', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Überstunden-Zuschläge</CardTitle>
                <CardDescription>Zuschläge für Mehrarbeit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Überstunden-Zuschläge aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Zuschlag für Mehrarbeit</p>
                  </div>
                  <Switch 
                    checked={formState.overtime_bonus_enabled}
                    onCheckedChange={(v) => updateFormField('overtime_bonus_enabled', v)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Standard Überstunden (%)</Label>
                    <Input 
                      type="number" 
                      value={formState.standard_overtime_bonus_percent}
                      onChange={(e) => updateFormField('standard_overtime_bonus_percent', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Überstunden an Wochenende (%)</Label>
                    <Input 
                      type="number" 
                      value={formState.weekend_overtime_bonus_percent}
                      onChange={(e) => updateFormField('weekend_overtime_bonus_percent', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Zuschläge kumulieren</Label>
                    <p className="text-sm text-muted-foreground">Mehrere Zuschläge addieren</p>
                  </div>
                  <Switch 
                    checked={formState.cumulative_bonuses}
                    onCheckedChange={(v) => updateFormField('cumulative_bonuses', v)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Qualifikationen */}
          <TabsContent value="qualifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Qualifikationen & Skills</CardTitle>
                <CardDescription>Erforderliche Fähigkeiten für Schichten</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input value="Ersthelfer" className="flex-1" />
                  <Badge variant="secondary">Pflicht in jeder Schicht</Badge>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input value="Brandschutzhelfer" className="flex-1" />
                  <Badge variant="secondary">Pflicht in jeder Schicht</Badge>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input value="Schichtleiter" className="flex-1" />
                  <Badge variant="outline">Optional</Badge>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input value="Gabelstaplerschein" className="flex-1" />
                  <Badge variant="outline">Optional</Badge>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Qualifikation hinzufügen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Qualifikations-Prüfung</CardTitle>
                <CardDescription>Automatische Prüfung bei Schichtplanung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Qualifikationsprüfung</Label>
                    <p className="text-sm text-muted-foreground">Warnung bei fehlenden Qualifikationen</p>
                  </div>
                  <Switch 
                    checked={formState.auto_qualification_check}
                    onCheckedChange={(v) => updateFormField('auto_qualification_check', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Fehlende Qualifikationen blockieren</Label>
                    <p className="text-sm text-muted-foreground">Planung verhindern</p>
                  </div>
                  <Switch 
                    checked={formState.block_missing_qualifications}
                    onCheckedChange={(v) => updateFormField('block_missing_qualifications', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Ablaufende Zertifikate warnen</Label>
                    <p className="text-sm text-muted-foreground">Vor Ablauf von Qualifikationen warnen</p>
                  </div>
                  <Switch 
                    checked={formState.warn_expiring_certs}
                    onCheckedChange={(v) => updateFormField('warn_expiring_certs', v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Warnung vor Ablauf (Tage)</Label>
                  <Input 
                    type="number" 
                    value={formState.cert_warning_days}
                    onChange={(e) => updateFormField('cert_warning_days', parseInt(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verfügbarkeit */}
          <TabsContent value="availability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Verfügbarkeits-Einstellungen</CardTitle>
                <CardDescription>Mitarbeiter-Wünsche und Sperrtage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Wunsch-Dienstplan aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Mitarbeiter können Wünsche äußern</p>
                  </div>
                  <Switch 
                    checked={formState.wish_schedule_enabled}
                    onCheckedChange={(v) => updateFormField('wish_schedule_enabled', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sperrtage erlauben</Label>
                    <p className="text-sm text-muted-foreground">Mitarbeiter können Tage sperren</p>
                  </div>
                  <Switch 
                    checked={formState.blocked_days_enabled}
                    onCheckedChange={(v) => updateFormField('blocked_days_enabled', v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max. Sperrtage pro Monat</Label>
                  <Input 
                    type="number" 
                    value={formState.max_blocked_days_monthly}
                    onChange={(e) => updateFormField('max_blocked_days_monthly', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Präferenzen bei Planung berücksichtigen</Label>
                    <p className="text-sm text-muted-foreground">Automatische Berücksichtigung</p>
                  </div>
                  <Switch 
                    checked={formState.consider_preferences}
                    onCheckedChange={(v) => updateFormField('consider_preferences', v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vorlaufzeit für Wünsche (Tage)</Label>
                  <Input 
                    type="number" 
                    value={formState.wish_lead_time_days}
                    onChange={(e) => updateFormField('wish_lead_time_days', parseInt(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schichttausch</CardTitle>
                <CardDescription>Tausch von Schichten zwischen Mitarbeitern</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Schichttausch aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Mitarbeiter können Schichten tauschen</p>
                  </div>
                  <Switch 
                    checked={formState.shift_swap_enabled}
                    onCheckedChange={(v) => updateFormField('shift_swap_enabled', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Genehmigung erforderlich</Label>
                    <p className="text-sm text-muted-foreground">Vorgesetzter muss zustimmen</p>
                  </div>
                  <Switch 
                    checked={formState.swap_approval_required}
                    onCheckedChange={(v) => updateFormField('swap_approval_required', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Qualifikationen prüfen</Label>
                    <p className="text-sm text-muted-foreground">Tausch nur bei gleicher Qualifikation</p>
                  </div>
                  <Switch 
                    checked={formState.swap_qualification_check}
                    onCheckedChange={(v) => updateFormField('swap_qualification_check', v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mindestvorlauf für Tausch (Stunden)</Label>
                  <Input 
                    type="number" 
                    value={formState.min_swap_lead_time_hours}
                    onChange={(e) => updateFormField('min_swap_lead_time_hours', parseInt(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rotation */}
          <TabsContent value="rotation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rotationsmuster</CardTitle>
                <CardDescription>Automatische Schichtrotation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Rotation aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Schichten rotieren automatisch</p>
                  </div>
                  <Switch 
                    checked={formState.auto_rotation_enabled}
                    onCheckedChange={(v) => updateFormField('auto_rotation_enabled', v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rotationszyklus</Label>
                  <Select 
                    value={formState.rotation_cycle}
                    onValueChange={(v) => updateFormField('rotation_cycle', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1week">1 Woche</SelectItem>
                      <SelectItem value="2weeks">2 Wochen</SelectItem>
                      <SelectItem value="3weeks">3 Wochen</SelectItem>
                      <SelectItem value="4weeks">4 Wochen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Vorwärts-Rotation</Label>
                    <p className="text-sm text-muted-foreground">Früh → Spät → Nacht</p>
                  </div>
                  <Switch 
                    checked={formState.forward_rotation}
                    onCheckedChange={(v) => updateFormField('forward_rotation', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Präferenzen berücksichtigen</Label>
                    <p className="text-sm text-muted-foreground">Mitarbeiter-Wünsche einbeziehen</p>
                  </div>
                  <Switch 
                    checked={formState.rotation_consider_preferences}
                    onCheckedChange={(v) => updateFormField('rotation_consider_preferences', v)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fairness-Einstellungen</CardTitle>
                <CardDescription>Faire Verteilung der Schichten</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Faire Verteilung aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Gleichmäßige Schichtverteilung</p>
                  </div>
                  <Switch 
                    checked={formState.fair_distribution_enabled}
                    onCheckedChange={(v) => updateFormField('fair_distribution_enabled', v)}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Toleranz: {formState.fair_distribution_tolerance}% Abweichung erlaubt</Label>
                  <Slider 
                    value={[formState.fair_distribution_tolerance]} 
                    onValueChange={(v) => updateFormField('fair_distribution_tolerance', v[0])}
                    max={25} 
                    step={5} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Nachtschicht-Folgen vermeiden</Label>
                    <p className="text-sm text-muted-foreground">Maximale aufeinanderfolgende Nachtschichten begrenzen</p>
                  </div>
                  <Switch 
                    checked={formState.avoid_consecutive_night_shifts}
                    onCheckedChange={(v) => updateFormField('avoid_consecutive_night_shifts', v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max. aufeinanderfolgende Nachtschichten</Label>
                  <Input 
                    type="number" 
                    value={formState.max_consecutive_night_shifts}
                    onChange={(e) => updateFormField('max_consecutive_night_shifts', parseInt(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
