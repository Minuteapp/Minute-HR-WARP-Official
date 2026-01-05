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
  FolderKanban, FileText, ListOrdered, BarChart3, Plus, Trash2, GripVertical, ChevronLeft,
  Users, Shield, DollarSign, AlertTriangle, Calendar, Target, Layers, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";

interface ProjectsFormState {
  auto_project_numbers: boolean;
  project_prefix: string;
  number_format: string;
  hierarchy_enabled: boolean;
  max_hierarchy_depth: string;
  milestones_required: boolean;
  goals_required: boolean;
  categorization_enabled: boolean;
  project_types: Array<{ id: string; name: string }>;
  statuses: Array<{ id: string; name: string; color: string }>;
  phases: Array<{ id: string; name: string; color: string }>;
  health_indicators_enabled: boolean;
  auto_health_calculation: boolean;
  budget_tracking_enabled: boolean;
  default_currency: string;
  decimal_places: string;
  budget_required: boolean;
  hourly_rates_enabled: boolean;
  cost_types: Array<{ id: string; name: string }>;
  budget_warnings_enabled: boolean;
  budget_warning_threshold: number;
  block_over_budget: boolean;
  auto_escalation: boolean;
  resource_planning_enabled: boolean;
  allow_overbooking: boolean;
  overbooking_warning: boolean;
  default_weekly_hours: number;
  planning_interval: string;
  roles: Array<{ name: string; rate: number }>;
  capacity_view_enabled: boolean;
  color_coding: boolean;
  underutilized_threshold: number;
  overutilized_threshold: number;
  risk_management_enabled: boolean;
  risk_register_required: boolean;
  periodic_risk_assessment: boolean;
  assessment_interval: string;
  risk_categories: Array<{ id: string; name: string }>;
  risk_matrix_enabled: boolean;
  probability_scale: string;
  impact_scale: string;
  default_visibility: string;
  leader_can_change_visibility: boolean;
  management_sees_all: boolean;
  timeline_view: boolean;
  show_dependencies: boolean;
  show_milestones: boolean;
  default_timeframe: string;
  show_progress: boolean;
  critical_path: boolean;
  portfolio_view: boolean;
  budget_summary: boolean;
  resource_overview: boolean;
  risk_heatmap: boolean;
}

export default function ProjectSettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getValue, saveSettings, loading } = useEffectiveSettings('projects');
  const [isSaving, setIsSaving] = useState(false);

  const [formState, setFormState] = useState<ProjectsFormState>({
    auto_project_numbers: true,
    project_prefix: 'PRJ',
    number_format: 'year',
    hierarchy_enabled: true,
    max_hierarchy_depth: '3',
    milestones_required: false,
    goals_required: true,
    categorization_enabled: true,
    project_types: [
      { id: '1', name: 'Internes Projekt' },
      { id: '2', name: 'Kundenprojekt' },
      { id: '3', name: 'F&E-Projekt' },
      { id: '4', name: 'Strategisches Projekt' }
    ],
    statuses: [
      { id: "1", name: "Planung", color: "#6366f1" },
      { id: "2", name: "In Bearbeitung", color: "#3b82f6" },
      { id: "3", name: "Review", color: "#f59e0b" },
      { id: "4", name: "Abgeschlossen", color: "#22c55e" },
      { id: "5", name: "Pausiert", color: "#6b7280" },
    ],
    phases: [
      { id: "1", name: "Initiierung", color: "#8b5cf6" },
      { id: "2", name: "Planung", color: "#3b82f6" },
      { id: "3", name: "Durchführung", color: "#22c55e" },
      { id: "4", name: "Kontrolle", color: "#f59e0b" },
      { id: "5", name: "Abschluss", color: "#6b7280" },
    ],
    health_indicators_enabled: true,
    auto_health_calculation: true,
    budget_tracking_enabled: true,
    default_currency: 'eur',
    decimal_places: '2',
    budget_required: false,
    hourly_rates_enabled: true,
    cost_types: [
      { id: '1', name: 'Personalkosten' },
      { id: '2', name: 'Externe Dienstleister' },
      { id: '3', name: 'Lizenzen & Software' },
      { id: '4', name: 'Hardware' },
      { id: '5', name: 'Reisekosten' }
    ],
    budget_warnings_enabled: true,
    budget_warning_threshold: 80,
    block_over_budget: false,
    auto_escalation: true,
    resource_planning_enabled: true,
    allow_overbooking: false,
    overbooking_warning: true,
    default_weekly_hours: 40,
    planning_interval: 'week',
    roles: [
      { name: 'Projektleiter', rate: 120 },
      { name: 'Senior Entwickler', rate: 95 },
      { name: 'Entwickler', rate: 75 },
      { name: 'Designer', rate: 80 }
    ],
    capacity_view_enabled: true,
    color_coding: true,
    underutilized_threshold: 70,
    overutilized_threshold: 100,
    risk_management_enabled: true,
    risk_register_required: false,
    periodic_risk_assessment: true,
    assessment_interval: 'monthly',
    risk_categories: [
      { id: '1', name: 'Technisches Risiko' },
      { id: '2', name: 'Ressourcenrisiko' },
      { id: '3', name: 'Zeitrisiko' },
      { id: '4', name: 'Budgetrisiko' },
      { id: '5', name: 'Externes Risiko' }
    ],
    risk_matrix_enabled: true,
    probability_scale: '5',
    impact_scale: '5',
    default_visibility: 'team',
    leader_can_change_visibility: true,
    management_sees_all: true,
    timeline_view: true,
    show_dependencies: true,
    show_milestones: true,
    default_timeframe: 'quarter',
    show_progress: true,
    critical_path: true,
    portfolio_view: true,
    budget_summary: true,
    resource_overview: true,
    risk_heatmap: true
  });

  useEffect(() => {
    if (!loading) {
      setFormState(prev => ({
        ...prev,
        auto_project_numbers: getValue('auto_project_numbers', prev.auto_project_numbers) as boolean,
        project_prefix: getValue('project_prefix', prev.project_prefix) as string,
        number_format: getValue('number_format', prev.number_format) as string,
        hierarchy_enabled: getValue('hierarchy_enabled', prev.hierarchy_enabled) as boolean,
        max_hierarchy_depth: getValue('max_hierarchy_depth', prev.max_hierarchy_depth) as string,
        milestones_required: getValue('milestones_required', prev.milestones_required) as boolean,
        goals_required: getValue('goals_required', prev.goals_required) as boolean,
        categorization_enabled: getValue('categorization_enabled', prev.categorization_enabled) as boolean,
        project_types: getValue('project_types', prev.project_types) as typeof prev.project_types,
        statuses: getValue('statuses', prev.statuses) as typeof prev.statuses,
        phases: getValue('phases', prev.phases) as typeof prev.phases,
        health_indicators_enabled: getValue('health_indicators_enabled', prev.health_indicators_enabled) as boolean,
        auto_health_calculation: getValue('auto_health_calculation', prev.auto_health_calculation) as boolean,
        budget_tracking_enabled: getValue('budget_tracking_enabled', prev.budget_tracking_enabled) as boolean,
        default_currency: getValue('default_currency', prev.default_currency) as string,
        decimal_places: getValue('decimal_places', prev.decimal_places) as string,
        budget_required: getValue('budget_required', prev.budget_required) as boolean,
        hourly_rates_enabled: getValue('hourly_rates_enabled', prev.hourly_rates_enabled) as boolean,
        cost_types: getValue('cost_types', prev.cost_types) as typeof prev.cost_types,
        budget_warnings_enabled: getValue('budget_warnings_enabled', prev.budget_warnings_enabled) as boolean,
        budget_warning_threshold: getValue('budget_warning_threshold', prev.budget_warning_threshold) as number,
        block_over_budget: getValue('block_over_budget', prev.block_over_budget) as boolean,
        auto_escalation: getValue('auto_escalation', prev.auto_escalation) as boolean,
        resource_planning_enabled: getValue('resource_planning_enabled', prev.resource_planning_enabled) as boolean,
        allow_overbooking: getValue('allow_overbooking', prev.allow_overbooking) as boolean,
        overbooking_warning: getValue('overbooking_warning', prev.overbooking_warning) as boolean,
        default_weekly_hours: getValue('default_weekly_hours', prev.default_weekly_hours) as number,
        planning_interval: getValue('planning_interval', prev.planning_interval) as string,
        roles: getValue('roles', prev.roles) as typeof prev.roles,
        capacity_view_enabled: getValue('capacity_view_enabled', prev.capacity_view_enabled) as boolean,
        color_coding: getValue('color_coding', prev.color_coding) as boolean,
        underutilized_threshold: getValue('underutilized_threshold', prev.underutilized_threshold) as number,
        overutilized_threshold: getValue('overutilized_threshold', prev.overutilized_threshold) as number,
        risk_management_enabled: getValue('risk_management_enabled', prev.risk_management_enabled) as boolean,
        risk_register_required: getValue('risk_register_required', prev.risk_register_required) as boolean,
        periodic_risk_assessment: getValue('periodic_risk_assessment', prev.periodic_risk_assessment) as boolean,
        assessment_interval: getValue('assessment_interval', prev.assessment_interval) as string,
        risk_categories: getValue('risk_categories', prev.risk_categories) as typeof prev.risk_categories,
        risk_matrix_enabled: getValue('risk_matrix_enabled', prev.risk_matrix_enabled) as boolean,
        probability_scale: getValue('probability_scale', prev.probability_scale) as string,
        impact_scale: getValue('impact_scale', prev.impact_scale) as string,
        default_visibility: getValue('default_visibility', prev.default_visibility) as string,
        leader_can_change_visibility: getValue('leader_can_change_visibility', prev.leader_can_change_visibility) as boolean,
        management_sees_all: getValue('management_sees_all', prev.management_sees_all) as boolean,
        timeline_view: getValue('timeline_view', prev.timeline_view) as boolean,
        show_dependencies: getValue('show_dependencies', prev.show_dependencies) as boolean,
        show_milestones: getValue('show_milestones', prev.show_milestones) as boolean,
        default_timeframe: getValue('default_timeframe', prev.default_timeframe) as string,
        show_progress: getValue('show_progress', prev.show_progress) as boolean,
        critical_path: getValue('critical_path', prev.critical_path) as boolean,
        portfolio_view: getValue('portfolio_view', prev.portfolio_view) as boolean,
        budget_summary: getValue('budget_summary', prev.budget_summary) as boolean,
        resource_overview: getValue('resource_overview', prev.resource_overview) as boolean,
        risk_heatmap: getValue('risk_heatmap', prev.risk_heatmap) as boolean,
      }));
    }
  }, [loading, getValue]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings(formState);
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Projekt-Einstellungen wurden erfolgreich aktualisiert.",
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
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">Projekt- & Roadmap-Einstellungen</h1>
            <p className="text-sm text-muted-foreground">Konfigurieren Sie Projekte, Budgets, Risiken und Berechtigungen</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Speichern
          </Button>
        </div>
        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="config" className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />
              <span className="hidden lg:inline">Allgemein</span>
            </TabsTrigger>
            <TabsTrigger value="statuses" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span className="hidden lg:inline">Status</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden lg:inline">Budget</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden lg:inline">Ressourcen</span>
            </TabsTrigger>
            <TabsTrigger value="risks" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden lg:inline">Risiken</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden lg:inline">Berechtigungen</span>
            </TabsTrigger>
            <TabsTrigger value="roadmaps" className="flex items-center gap-2">
              <ListOrdered className="h-4 w-4" />
              <span className="hidden lg:inline">Roadmaps</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden lg:inline">Vorlagen</span>
            </TabsTrigger>
          </TabsList>

          {/* Allgemeine Einstellungen */}
          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Projekt-Grundeinstellungen</CardTitle>
                <CardDescription>Grundlegende Konfiguration für das Projekt-Modul</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Projektnummern</Label>
                    <p className="text-sm text-muted-foreground">Generiere eindeutige IDs für jedes Projekt</p>
                  </div>
                  <Switch 
                    checked={formState.auto_project_numbers} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, auto_project_numbers: checked }))} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Projekt-Präfix</Label>
                    <Input 
                      value={formState.project_prefix} 
                      onChange={(e) => setFormState(prev => ({ ...prev, project_prefix: e.target.value }))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nummern-Format</Label>
                    <Select 
                      value={formState.number_format} 
                      onValueChange={(value) => setFormState(prev => ({ ...prev, number_format: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sequential">Fortlaufend (001, 002...)</SelectItem>
                        <SelectItem value="year">Mit Jahr (2024-001)</SelectItem>
                        <SelectItem value="department">Mit Abteilung (IT-001)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Projekt-Hierarchie aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Projekte mit Unterprojekten</p>
                  </div>
                  <Switch 
                    checked={formState.hierarchy_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, hierarchy_enabled: checked }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximale Hierarchie-Tiefe</Label>
                  <Select 
                    value={formState.max_hierarchy_depth} 
                    onValueChange={(value) => setFormState(prev => ({ ...prev, max_hierarchy_depth: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Ebenen</SelectItem>
                      <SelectItem value="3">3 Ebenen</SelectItem>
                      <SelectItem value="5">5 Ebenen</SelectItem>
                      <SelectItem value="unlimited">Unbegrenzt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Meilensteine erforderlich</Label>
                    <p className="text-sm text-muted-foreground">Projekte müssen Meilensteine haben</p>
                  </div>
                  <Switch 
                    checked={formState.milestones_required} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, milestones_required: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Projektziele erforderlich</Label>
                    <p className="text-sm text-muted-foreground">Ziele und KPIs definieren</p>
                  </div>
                  <Switch 
                    checked={formState.goals_required} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, goals_required: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Projektkategorisierung</Label>
                    <p className="text-sm text-muted-foreground">Projekte nach Typ kategorisieren</p>
                  </div>
                  <Switch 
                    checked={formState.categorization_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, categorization_enabled: checked }))} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Projekt-Typen</CardTitle>
                <CardDescription>Verfügbare Projektarten</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formState.project_types.map((type, index) => (
                  <div key={type.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <Input 
                      value={type.name} 
                      onChange={(e) => {
                        const newTypes = [...formState.project_types];
                        newTypes[index] = { ...type, name: e.target.value };
                        setFormState(prev => ({ ...prev, project_types: newTypes }));
                      }}
                      className="flex-1" 
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        const newTypes = formState.project_types.filter((_, i) => i !== index);
                        setFormState(prev => ({ ...prev, project_types: newTypes }));
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const newType = { id: Date.now().toString(), name: 'Neuer Projekttyp' };
                    setFormState(prev => ({ ...prev, project_types: [...prev.project_types, newType] }));
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Projekttyp hinzufügen
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Status & Phasen */}
          <TabsContent value="statuses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Projekt-Status</CardTitle>
                <CardDescription>Definieren Sie die verfügbaren Status für Projekte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formState.statuses.map((status, index) => (
                  <div key={status.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <Input 
                      type="color" 
                      value={status.color} 
                      onChange={(e) => {
                        const newStatuses = [...formState.statuses];
                        newStatuses[index] = { ...status, color: e.target.value };
                        setFormState(prev => ({ ...prev, statuses: newStatuses }));
                      }}
                      className="w-12 h-8 p-0 border-0" 
                    />
                    <Input 
                      value={status.name} 
                      onChange={(e) => {
                        const newStatuses = [...formState.statuses];
                        newStatuses[index] = { ...status, name: e.target.value };
                        setFormState(prev => ({ ...prev, statuses: newStatuses }));
                      }}
                      className="flex-1" 
                    />
                    <Badge style={{ backgroundColor: status.color, color: "white" }}>{status.name}</Badge>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        const newStatuses = formState.statuses.filter((_, i) => i !== index);
                        setFormState(prev => ({ ...prev, statuses: newStatuses }));
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const newStatus = { id: Date.now().toString(), name: 'Neuer Status', color: '#6b7280' };
                    setFormState(prev => ({ ...prev, statuses: [...prev.statuses, newStatus] }));
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Status hinzufügen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Projekt-Phasen</CardTitle>
                <CardDescription>Phasen für Projektablauf</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formState.phases.map((phase, index) => (
                  <div key={phase.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <Input 
                      type="color" 
                      value={phase.color} 
                      onChange={(e) => {
                        const newPhases = [...formState.phases];
                        newPhases[index] = { ...phase, color: e.target.value };
                        setFormState(prev => ({ ...prev, phases: newPhases }));
                      }}
                      className="w-12 h-8 p-0 border-0" 
                    />
                    <Input 
                      value={phase.name} 
                      onChange={(e) => {
                        const newPhases = [...formState.phases];
                        newPhases[index] = { ...phase, name: e.target.value };
                        setFormState(prev => ({ ...prev, phases: newPhases }));
                      }}
                      className="flex-1" 
                    />
                    <Badge style={{ backgroundColor: phase.color, color: "white" }}>{phase.name}</Badge>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        const newPhases = formState.phases.filter((_, i) => i !== index);
                        setFormState(prev => ({ ...prev, phases: newPhases }));
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const newPhase = { id: Date.now().toString(), name: 'Neue Phase', color: '#6b7280' };
                    setFormState(prev => ({ ...prev, phases: [...prev.phases, newPhase] }));
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Phase hinzufügen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gesundheitsindikatoren</CardTitle>
                <CardDescription>Ampelstatus für Projekte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Gesundheitsindikatoren aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Ampel-Status für Projekte</p>
                  </div>
                  <Switch 
                    checked={formState.health_indicators_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, health_indicators_enabled: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Berechnung</Label>
                    <p className="text-sm text-muted-foreground">Status aus Metriken ableiten</p>
                  </div>
                  <Switch 
                    checked={formState.auto_health_calculation} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, auto_health_calculation: checked }))} 
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 border rounded-lg text-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2" />
                    <span className="text-sm font-medium">Grün</span>
                    <p className="text-xs text-muted-foreground">Im Plan</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-2" />
                    <span className="text-sm font-medium">Gelb</span>
                    <p className="text-xs text-muted-foreground">Risiko</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2" />
                    <span className="text-sm font-medium">Rot</span>
                    <p className="text-xs text-muted-foreground">Kritisch</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budget */}
          <TabsContent value="budget" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget-Grundeinstellungen</CardTitle>
                <CardDescription>Finanzielle Projektkonfiguration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Budget-Tracking aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Verfolge Budgets und Kosten pro Projekt</p>
                  </div>
                  <Switch 
                    checked={formState.budget_tracking_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, budget_tracking_enabled: checked }))} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Standard-Währung</Label>
                    <Select 
                      value={formState.default_currency} 
                      onValueChange={(value) => setFormState(prev => ({ ...prev, default_currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="chf">CHF</SelectItem>
                        <SelectItem value="gbp">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Dezimalstellen</Label>
                    <Select 
                      value={formState.decimal_places} 
                      onValueChange={(value) => setFormState(prev => ({ ...prev, decimal_places: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Keine</SelectItem>
                        <SelectItem value="2">2 Stellen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Budget erforderlich</Label>
                    <p className="text-sm text-muted-foreground">Jedes Projekt braucht ein Budget</p>
                  </div>
                  <Switch 
                    checked={formState.budget_required} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, budget_required: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Stundensätze aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Kosten aus Zeiterfassung berechnen</p>
                  </div>
                  <Switch 
                    checked={formState.hourly_rates_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, hourly_rates_enabled: checked }))} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kostenarten</CardTitle>
                <CardDescription>Kategorien für Projektkosten</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formState.cost_types.map((type, index) => (
                  <div key={type.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <Input 
                      value={type.name} 
                      onChange={(e) => {
                        const newTypes = [...formState.cost_types];
                        newTypes[index] = { ...type, name: e.target.value };
                        setFormState(prev => ({ ...prev, cost_types: newTypes }));
                      }}
                      className="flex-1" 
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        const newTypes = formState.cost_types.filter((_, i) => i !== index);
                        setFormState(prev => ({ ...prev, cost_types: newTypes }));
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const newType = { id: Date.now().toString(), name: 'Neue Kostenart' };
                    setFormState(prev => ({ ...prev, cost_types: [...prev.cost_types, newType] }));
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Kostenart hinzufügen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget-Warnungen</CardTitle>
                <CardDescription>Benachrichtigungen bei Budget-Problemen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Budget-Warnungen aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Benachrichtige bei Budget-Annäherung</p>
                  </div>
                  <Switch 
                    checked={formState.budget_warnings_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, budget_warnings_enabled: checked }))} 
                  />
                </div>
                <div className="space-y-3">
                  <Label>Warnung bei Erreichung von: {formState.budget_warning_threshold}%</Label>
                  <Slider 
                    value={[formState.budget_warning_threshold]} 
                    onValueChange={([value]) => setFormState(prev => ({ ...prev, budget_warning_threshold: value }))}
                    max={100} 
                    step={5} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Überschreitung blockieren</Label>
                    <p className="text-sm text-muted-foreground">Keine weiteren Buchungen erlauben</p>
                  </div>
                  <Switch 
                    checked={formState.block_over_budget} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, block_over_budget: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Eskalation</Label>
                    <p className="text-sm text-muted-foreground">Management bei Überschreitung informieren</p>
                  </div>
                  <Switch 
                    checked={formState.auto_escalation} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, auto_escalation: checked }))} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ressourcen */}
          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ressourcenplanung</CardTitle>
                <CardDescription>Mitarbeiter-Kapazitäten verwalten</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Ressourcenplanung aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Plane Mitarbeiter-Kapazitäten</p>
                  </div>
                  <Switch 
                    checked={formState.resource_planning_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, resource_planning_enabled: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Überbuchung erlauben</Label>
                    <p className="text-sm text-muted-foreground">Mitarbeiter über 100% planen</p>
                  </div>
                  <Switch 
                    checked={formState.allow_overbooking} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, allow_overbooking: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Überbuchung-Warnung</Label>
                    <p className="text-sm text-muted-foreground">Warnung bei Überauslastung</p>
                  </div>
                  <Switch 
                    checked={formState.overbooking_warning} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, overbooking_warning: checked }))} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Standard-Wochenstunden</Label>
                    <Input 
                      type="number" 
                      value={formState.default_weekly_hours} 
                      onChange={(e) => setFormState(prev => ({ ...prev, default_weekly_hours: parseInt(e.target.value) || 40 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Planungsintervall</Label>
                    <Select 
                      value={formState.planning_interval} 
                      onValueChange={(value) => setFormState(prev => ({ ...prev, planning_interval: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Täglich</SelectItem>
                        <SelectItem value="week">Wöchentlich</SelectItem>
                        <SelectItem value="month">Monatlich</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rollen & Skills</CardTitle>
                <CardDescription>Projekt-Rollen definieren</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formState.roles.map((role, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                    <Input 
                      value={role.name} 
                      onChange={(e) => {
                        const newRoles = [...formState.roles];
                        newRoles[index] = { ...role, name: e.target.value };
                        setFormState(prev => ({ ...prev, roles: newRoles }));
                      }}
                      className="flex-1" 
                    />
                    <Input 
                      type="number" 
                      value={role.rate} 
                      onChange={(e) => {
                        const newRoles = [...formState.roles];
                        newRoles[index] = { ...role, rate: parseInt(e.target.value) || 0 };
                        setFormState(prev => ({ ...prev, roles: newRoles }));
                      }}
                      className="w-24" 
                    />
                    <span className="text-sm text-muted-foreground">€/h</span>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        const newRoles = formState.roles.filter((_, i) => i !== index);
                        setFormState(prev => ({ ...prev, roles: newRoles }));
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const newRole = { name: 'Neue Rolle', rate: 50 };
                    setFormState(prev => ({ ...prev, roles: [...prev.roles, newRole] }));
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Rolle hinzufügen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kapazitätsansicht</CardTitle>
                <CardDescription>Darstellung der Ressourcenauslastung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Kapazitätsübersicht aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Zeige Auslastung aller Mitarbeiter</p>
                  </div>
                  <Switch 
                    checked={formState.capacity_view_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, capacity_view_enabled: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Farbkodierung</Label>
                    <p className="text-sm text-muted-foreground">Ampel für Auslastungsgrade</p>
                  </div>
                  <Switch 
                    checked={formState.color_coding} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, color_coding: checked }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unterausgelastet unter (%)</Label>
                  <Input 
                    type="number" 
                    value={formState.underutilized_threshold} 
                    onChange={(e) => setFormState(prev => ({ ...prev, underutilized_threshold: parseInt(e.target.value) || 70 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Überausgelastet ab (%)</Label>
                  <Input 
                    type="number" 
                    value={formState.overutilized_threshold} 
                    onChange={(e) => setFormState(prev => ({ ...prev, overutilized_threshold: parseInt(e.target.value) || 100 }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risikomanagement */}
          <TabsContent value="risks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Risikomanagement</CardTitle>
                <CardDescription>Projektrisiken erfassen und bewerten</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Risikomanagement aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Risiken pro Projekt erfassen</p>
                  </div>
                  <Switch 
                    checked={formState.risk_management_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, risk_management_enabled: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Risikoregister erforderlich</Label>
                    <p className="text-sm text-muted-foreground">Mindestens ein Risiko pro Projekt</p>
                  </div>
                  <Switch 
                    checked={formState.risk_register_required} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, risk_register_required: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Regelmäßige Risikobewertung</Label>
                    <p className="text-sm text-muted-foreground">Erinnerung zur Überprüfung</p>
                  </div>
                  <Switch 
                    checked={formState.periodic_risk_assessment} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, periodic_risk_assessment: checked }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bewertungsintervall</Label>
                  <Select 
                    value={formState.assessment_interval} 
                    onValueChange={(value) => setFormState(prev => ({ ...prev, assessment_interval: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Wöchentlich</SelectItem>
                      <SelectItem value="biweekly">Alle 2 Wochen</SelectItem>
                      <SelectItem value="monthly">Monatlich</SelectItem>
                      <SelectItem value="quarterly">Quartalsweise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risikokategorien</CardTitle>
                <CardDescription>Typen von Projektrisiken</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formState.risk_categories.map((cat, index) => (
                  <div key={cat.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <Input 
                      value={cat.name} 
                      onChange={(e) => {
                        const newCats = [...formState.risk_categories];
                        newCats[index] = { ...cat, name: e.target.value };
                        setFormState(prev => ({ ...prev, risk_categories: newCats }));
                      }}
                      className="flex-1" 
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        const newCats = formState.risk_categories.filter((_, i) => i !== index);
                        setFormState(prev => ({ ...prev, risk_categories: newCats }));
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const newCat = { id: Date.now().toString(), name: 'Neue Risikokategorie' };
                    setFormState(prev => ({ ...prev, risk_categories: [...prev.risk_categories, newCat] }));
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Risikokategorie hinzufügen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risikobewertung</CardTitle>
                <CardDescription>Matrix für Eintrittswahrscheinlichkeit und Auswirkung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Risikomatrix aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Visuelle Darstellung der Risiken</p>
                  </div>
                  <Switch 
                    checked={formState.risk_matrix_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, risk_matrix_enabled: checked }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Wahrscheinlichkeits-Skala</Label>
                  <Select 
                    value={formState.probability_scale} 
                    onValueChange={(value) => setFormState(prev => ({ ...prev, probability_scale: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3-stufig (Niedrig, Mittel, Hoch)</SelectItem>
                      <SelectItem value="5">5-stufig (1-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Auswirkungs-Skala</Label>
                  <Select 
                    value={formState.impact_scale} 
                    onValueChange={(value) => setFormState(prev => ({ ...prev, impact_scale: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3-stufig (Gering, Mittel, Schwer)</SelectItem>
                      <SelectItem value="5">5-stufig (1-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Berechtigungen */}
          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sichtbarkeit</CardTitle>
                <CardDescription>Wer kann Projekte sehen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Standard-Sichtbarkeit</Label>
                  <Select 
                    value={formState.default_visibility} 
                    onValueChange={(value) => setFormState(prev => ({ ...prev, default_visibility: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Privat (nur Mitglieder)</SelectItem>
                      <SelectItem value="team">Team (Abteilung)</SelectItem>
                      <SelectItem value="company">Unternehmensweit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Projektleiter kann Sichtbarkeit ändern</Label>
                    <p className="text-sm text-muted-foreground">Zugriffsrechte selbst verwalten</p>
                  </div>
                  <Switch 
                    checked={formState.leader_can_change_visibility} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, leader_can_change_visibility: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Management sieht alle Projekte</Label>
                    <p className="text-sm text-muted-foreground">Übersicht für Führungskräfte</p>
                  </div>
                  <Switch 
                    checked={formState.management_sees_all} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, management_sees_all: checked }))} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roadmaps */}
          <TabsContent value="roadmaps" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Roadmap-Ansichten</CardTitle>
                <CardDescription>Zeitplan-Darstellung für Projekte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Timeline-Ansicht</Label>
                    <p className="text-sm text-muted-foreground">Gantt-artige Darstellung</p>
                  </div>
                  <Switch 
                    checked={formState.timeline_view} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, timeline_view: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Abhängigkeiten anzeigen</Label>
                    <p className="text-sm text-muted-foreground">Verknüpfungen zwischen Projekten</p>
                  </div>
                  <Switch 
                    checked={formState.show_dependencies} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, show_dependencies: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Meilensteine anzeigen</Label>
                    <p className="text-sm text-muted-foreground">Wichtige Termine markieren</p>
                  </div>
                  <Switch 
                    checked={formState.show_milestones} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, show_milestones: checked }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Standard-Zeitraum</Label>
                  <Select 
                    value={formState.default_timeframe} 
                    onValueChange={(value) => setFormState(prev => ({ ...prev, default_timeframe: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Monat</SelectItem>
                      <SelectItem value="quarter">Quartal</SelectItem>
                      <SelectItem value="year">Jahr</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Fortschritt anzeigen</Label>
                    <p className="text-sm text-muted-foreground">Prozentuale Fertigstellung</p>
                  </div>
                  <Switch 
                    checked={formState.show_progress} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, show_progress: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Kritischer Pfad</Label>
                    <p className="text-sm text-muted-foreground">Engpässe hervorheben</p>
                  </div>
                  <Switch 
                    checked={formState.critical_path} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, critical_path: checked }))} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portfolio-Übersicht</CardTitle>
                <CardDescription>Aggregierte Ansicht aller Projekte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Portfolio-Ansicht</Label>
                    <p className="text-sm text-muted-foreground">Alle Projekte auf einen Blick</p>
                  </div>
                  <Switch 
                    checked={formState.portfolio_view} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, portfolio_view: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Budget-Zusammenfassung</Label>
                    <p className="text-sm text-muted-foreground">Finanzielle Übersicht</p>
                  </div>
                  <Switch 
                    checked={formState.budget_summary} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, budget_summary: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Ressourcen-Übersicht</Label>
                    <p className="text-sm text-muted-foreground">Team-Auslastung über alle Projekte</p>
                  </div>
                  <Switch 
                    checked={formState.resource_overview} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, resource_overview: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Risiko-Heatmap</Label>
                    <p className="text-sm text-muted-foreground">Risiken im Überblick</p>
                  </div>
                  <Switch 
                    checked={formState.risk_heatmap} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, risk_heatmap: checked }))} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vorlagen */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Projekt-Vorlagen</CardTitle>
                <CardDescription>Wiederverwendbare Projektstrukturen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Standard-Projekt</h4>
                    <Badge variant="secondary">5 Meilensteine</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Basisvorlage für normale Projekte</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Agiles Projekt</h4>
                    <Badge variant="secondary">Sprints</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Vorlage für Scrum/Kanban-Projekte</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Kundenprojekt</h4>
                    <Badge variant="secondary">8 Phasen</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Vorlage für externe Aufträge</p>
                </div>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Vorlage erstellen
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
