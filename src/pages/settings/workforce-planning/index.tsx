import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UsersRound, BarChart3, Award, Users, Plus, ChevronLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";

interface WorkforcePlanningFormState {
  // Kapazität
  default_daily_capacity_hours: number;
  planning_horizon_months: number;
  overload_warnings: boolean;
  utilization_threshold: number;
  // Skills
  skill_tracking: boolean;
  self_assessment: boolean;
  skill_levels: number;
  skill_gap_analysis: boolean;
  // Nachfolge
  succession_planning: boolean;
  readiness_tracking: boolean;
  development_plans: boolean;
  key_positions_tracking: boolean;
  // Headcount
  budget_integration: boolean;
  planning_cycles_per_year: number;
  approval_process: boolean;
  forecast_enabled: boolean;
}

export default function WorkforcePlanningSettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading, saveSettings, getValue } = useEffectiveSettings('workforce_planning');
  const [isSaving, setIsSaving] = useState(false);

  const [formState, setFormState] = useState<WorkforcePlanningFormState>({
    default_daily_capacity_hours: 8,
    planning_horizon_months: 12,
    overload_warnings: true,
    utilization_threshold: 100,
    skill_tracking: true,
    self_assessment: true,
    skill_levels: 5,
    skill_gap_analysis: true,
    succession_planning: true,
    readiness_tracking: true,
    development_plans: true,
    key_positions_tracking: true,
    budget_integration: false,
    planning_cycles_per_year: 4,
    approval_process: true,
    forecast_enabled: true,
  });

  useEffect(() => {
    if (!loading) {
      setFormState(prev => ({
        ...prev,
        default_daily_capacity_hours: getValue('default_daily_capacity_hours', prev.default_daily_capacity_hours),
        planning_horizon_months: getValue('planning_horizon_months', prev.planning_horizon_months),
        overload_warnings: getValue('overload_warnings', prev.overload_warnings),
        utilization_threshold: getValue('utilization_threshold', prev.utilization_threshold),
        skill_tracking: getValue('skill_tracking', prev.skill_tracking),
        self_assessment: getValue('self_assessment', prev.self_assessment),
        skill_levels: getValue('skill_levels', prev.skill_levels),
        skill_gap_analysis: getValue('skill_gap_analysis', prev.skill_gap_analysis),
        succession_planning: getValue('succession_planning', prev.succession_planning),
        readiness_tracking: getValue('readiness_tracking', prev.readiness_tracking),
        development_plans: getValue('development_plans', prev.development_plans),
        key_positions_tracking: getValue('key_positions_tracking', prev.key_positions_tracking),
        budget_integration: getValue('budget_integration', prev.budget_integration),
        planning_cycles_per_year: getValue('planning_cycles_per_year', prev.planning_cycles_per_year),
        approval_process: getValue('approval_process', prev.approval_process),
        forecast_enabled: getValue('forecast_enabled', prev.forecast_enabled),
      }));
    }
  }, [loading, getValue]);

  const updateFormState = (key: keyof WorkforcePlanningFormState, value: any) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings(formState);
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Workforce Planning-Einstellungen wurden erfolgreich aktualisiert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate("/settings")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Workforce Planning-Einstellungen</h1>
            <p className="text-sm text-muted-foreground">Konfigurieren Sie Kapazitäts- und Nachfolgeplanung</p>
          </div>
        </div>
        <Tabs defaultValue="capacity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="capacity" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Kapazität
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="succession" className="flex items-center gap-2">
              <UsersRound className="h-4 w-4" />
              Nachfolge
            </TabsTrigger>
            <TabsTrigger value="headcount" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Headcount
            </TabsTrigger>
          </TabsList>

          <TabsContent value="capacity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kapazitätsplanung</CardTitle>
                <CardDescription>Einstellungen für Ressourcenplanung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Standard-Kapazität pro Tag (Stunden)</Label>
                    <Input 
                      type="number" 
                      value={formState.default_daily_capacity_hours}
                      onChange={(e) => updateFormState('default_daily_capacity_hours', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Planungshorizont (Monate)</Label>
                    <Input 
                      type="number" 
                      value={formState.planning_horizon_months}
                      onChange={(e) => updateFormState('planning_horizon_months', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Überlastungs-Warnungen</Label>
                    <p className="text-sm text-muted-foreground">Bei Kapazitätsüberschreitung warnen</p>
                  </div>
                  <Switch 
                    checked={formState.overload_warnings}
                    onCheckedChange={(checked) => updateFormState('overload_warnings', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Auslastungs-Schwellenwert (%)</Label>
                  <Input 
                    type="number" 
                    value={formState.utilization_threshold}
                    onChange={(e) => updateFormState('utilization_threshold', parseInt(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Skill-Matrix</CardTitle>
                <CardDescription>Kompetenz-Tracking konfigurieren</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Skill-Tracking aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Kompetenzen der Mitarbeiter erfassen</p>
                  </div>
                  <Switch 
                    checked={formState.skill_tracking}
                    onCheckedChange={(checked) => updateFormState('skill_tracking', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Selbstbewertung erlauben</Label>
                    <p className="text-sm text-muted-foreground">Mitarbeiter bewerten eigene Skills</p>
                  </div>
                  <Switch 
                    checked={formState.self_assessment}
                    onCheckedChange={(checked) => updateFormState('self_assessment', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Skill-Stufen (Anzahl)</Label>
                  <Input 
                    type="number" 
                    value={formState.skill_levels}
                    onChange={(e) => updateFormState('skill_levels', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Skill-Gap-Analyse</Label>
                    <p className="text-sm text-muted-foreground">Kompetenzlücken identifizieren</p>
                  </div>
                  <Switch 
                    checked={formState.skill_gap_analysis}
                    onCheckedChange={(checked) => updateFormState('skill_gap_analysis', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="succession" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nachfolgeplanung</CardTitle>
                <CardDescription>Nachfolger für Schlüsselpositionen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Nachfolgeplanung aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Potenzielle Nachfolger identifizieren</p>
                  </div>
                  <Switch 
                    checked={formState.succession_planning}
                    onCheckedChange={(checked) => updateFormState('succession_planning', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bereitschafts-Tracking</Label>
                    <p className="text-sm text-muted-foreground">Bereitschaft der Nachfolger bewerten</p>
                  </div>
                  <Switch 
                    checked={formState.readiness_tracking}
                    onCheckedChange={(checked) => updateFormState('readiness_tracking', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Entwicklungspläne</Label>
                    <p className="text-sm text-muted-foreground">Entwicklungspläne erstellen</p>
                  </div>
                  <Switch 
                    checked={formState.development_plans}
                    onCheckedChange={(checked) => updateFormState('development_plans', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Schlüsselpositionen-Tracking</Label>
                    <p className="text-sm text-muted-foreground">Kritische Positionen identifizieren</p>
                  </div>
                  <Switch 
                    checked={formState.key_positions_tracking}
                    onCheckedChange={(checked) => updateFormState('key_positions_tracking', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="headcount" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Headcount-Planung</CardTitle>
                <CardDescription>Personalbedarfsplanung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Budget-Integration</Label>
                    <p className="text-sm text-muted-foreground">Mit Finanzbudget verknüpfen</p>
                  </div>
                  <Switch 
                    checked={formState.budget_integration}
                    onCheckedChange={(checked) => updateFormState('budget_integration', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Planungszyklen pro Jahr</Label>
                  <Input 
                    type="number" 
                    value={formState.planning_cycles_per_year}
                    onChange={(e) => updateFormState('planning_cycles_per_year', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Genehmigungsprozess</Label>
                    <p className="text-sm text-muted-foreground">Neue Stellen genehmigen lassen</p>
                  </div>
                  <Switch 
                    checked={formState.approval_process}
                    onCheckedChange={(checked) => updateFormState('approval_process', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Prognose aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Headcount-Prognosen erstellen</p>
                  </div>
                  <Switch 
                    checked={formState.forecast_enabled}
                    onCheckedChange={(checked) => updateFormState('forecast_enabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Einstellungen speichern
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
