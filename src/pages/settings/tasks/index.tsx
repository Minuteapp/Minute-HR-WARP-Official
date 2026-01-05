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
import { 
  CheckSquare, Tags, GitBranch, FileText, Plus, Trash2, GripVertical, ChevronLeft,
  Clock, Link2, RotateCcw, Bell, Users, Eye, ListChecks, Kanban, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";

interface TasksFormState {
  auto_task_numbers: boolean;
  task_prefix: string;
  number_format: string;
  subtasks_enabled: boolean;
  max_nesting_depth: string;
  checklists_enabled: boolean;
  comments_enabled: boolean;
  attachments_enabled: boolean;
  max_attachment_size_mb: number;
  allowed_file_types: string;
  list_view: boolean;
  kanban_view: boolean;
  calendar_view: boolean;
  gantt_view: boolean;
  mindmap_view: boolean;
  default_view: string;
  priorities: Array<{ id: string; name: string; color: string }>;
  labels: Array<{ id: string; name: string; color: string }>;
  multiple_labels_allowed: boolean;
  users_can_create_labels: boolean;
  max_labels_per_task: number;
  statuses: Array<{ id: string; name: string; color: string }>;
  start_status: string;
  completed_status: string;
  restrict_status_transitions: boolean;
  time_estimation_enabled: boolean;
  time_estimation_required: boolean;
  estimation_unit: string;
  overrun_warning: boolean;
  time_tracking_enabled: boolean;
  timer_function: boolean;
  manual_time_entry: boolean;
  description_required: boolean;
  min_booking_interval: string;
  due_date_enabled: boolean;
  due_date_required: boolean;
  default_due_days: number;
  default_priority: string;
  due_reminders: boolean;
  reminder_hours_before: number;
  dependencies_enabled: boolean;
  blocking_dependencies: boolean;
  prevent_cyclic: boolean;
  auto_date_adjustment: boolean;
  finish_to_start: boolean;
  start_to_start: boolean;
  finish_to_finish: boolean;
  start_to_finish: boolean;
  recurring_tasks_enabled: boolean;
  auto_creation: boolean;
  creation_lead_days: number;
  only_when_previous_done: boolean;
  daily: boolean;
  weekly: boolean;
  monthly: boolean;
  yearly: boolean;
  custom: boolean;
  auto_assignment: boolean;
  approval_on_completion: boolean;
  notify_on_status_change: boolean;
  auto_status_on_overdue: boolean;
  notify_on_assign: boolean;
  notify_on_mention: boolean;
  notify_on_comment: boolean;
  notify_on_status: boolean;
  notify_on_overdue: boolean;
}

export default function TaskSettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getValue, saveSettings, loading } = useEffectiveSettings('tasks');
  const [isSaving, setIsSaving] = useState(false);

  const [formState, setFormState] = useState<TasksFormState>({
    auto_task_numbers: true,
    task_prefix: 'TASK',
    number_format: 'sequential',
    subtasks_enabled: true,
    max_nesting_depth: '3',
    checklists_enabled: true,
    comments_enabled: true,
    attachments_enabled: true,
    max_attachment_size_mb: 25,
    allowed_file_types: '*',
    list_view: true,
    kanban_view: true,
    calendar_view: true,
    gantt_view: true,
    mindmap_view: false,
    default_view: 'kanban',
    priorities: [
      { id: "1", name: "Kritisch", color: "#ef4444" },
      { id: "2", name: "Hoch", color: "#f97316" },
      { id: "3", name: "Mittel", color: "#eab308" },
      { id: "4", name: "Niedrig", color: "#22c55e" },
    ],
    labels: [
      { id: "1", name: "Bug", color: "#ef4444" },
      { id: "2", name: "Feature", color: "#3b82f6" },
      { id: "3", name: "Dokumentation", color: "#8b5cf6" },
      { id: "4", name: "Verbesserung", color: "#10b981" },
    ],
    multiple_labels_allowed: true,
    users_can_create_labels: false,
    max_labels_per_task: 5,
    statuses: [
      { id: "1", name: "Offen", color: "#6b7280" },
      { id: "2", name: "In Bearbeitung", color: "#3b82f6" },
      { id: "3", name: "In Review", color: "#f59e0b" },
      { id: "4", name: "Erledigt", color: "#22c55e" },
      { id: "5", name: "Blockiert", color: "#ef4444" },
    ],
    start_status: 'open',
    completed_status: 'done',
    restrict_status_transitions: false,
    time_estimation_enabled: true,
    time_estimation_required: false,
    estimation_unit: 'hours',
    overrun_warning: true,
    time_tracking_enabled: true,
    timer_function: true,
    manual_time_entry: true,
    description_required: false,
    min_booking_interval: '15',
    due_date_enabled: true,
    due_date_required: false,
    default_due_days: 7,
    default_priority: 'mittel',
    due_reminders: true,
    reminder_hours_before: 24,
    dependencies_enabled: true,
    blocking_dependencies: true,
    prevent_cyclic: true,
    auto_date_adjustment: true,
    finish_to_start: true,
    start_to_start: true,
    finish_to_finish: false,
    start_to_finish: false,
    recurring_tasks_enabled: true,
    auto_creation: true,
    creation_lead_days: 1,
    only_when_previous_done: true,
    daily: true,
    weekly: true,
    monthly: true,
    yearly: true,
    custom: true,
    auto_assignment: false,
    approval_on_completion: false,
    notify_on_status_change: true,
    auto_status_on_overdue: false,
    notify_on_assign: true,
    notify_on_mention: true,
    notify_on_comment: true,
    notify_on_status: true,
    notify_on_overdue: true,
  });

  useEffect(() => {
    if (!loading) {
      setFormState(prev => ({
        ...prev,
        auto_task_numbers: getValue('auto_task_numbers', prev.auto_task_numbers) as boolean,
        task_prefix: getValue('task_prefix', prev.task_prefix) as string,
        number_format: getValue('number_format', prev.number_format) as string,
        subtasks_enabled: getValue('subtasks_enabled', prev.subtasks_enabled) as boolean,
        max_nesting_depth: getValue('max_nesting_depth', prev.max_nesting_depth) as string,
        checklists_enabled: getValue('checklists_enabled', prev.checklists_enabled) as boolean,
        comments_enabled: getValue('comments_enabled', prev.comments_enabled) as boolean,
        attachments_enabled: getValue('attachments_enabled', prev.attachments_enabled) as boolean,
        max_attachment_size_mb: getValue('max_attachment_size_mb', prev.max_attachment_size_mb) as number,
        allowed_file_types: getValue('allowed_file_types', prev.allowed_file_types) as string,
        list_view: getValue('list_view', prev.list_view) as boolean,
        kanban_view: getValue('kanban_view', prev.kanban_view) as boolean,
        calendar_view: getValue('calendar_view', prev.calendar_view) as boolean,
        gantt_view: getValue('gantt_view', prev.gantt_view) as boolean,
        mindmap_view: getValue('mindmap_view', prev.mindmap_view) as boolean,
        default_view: getValue('default_view', prev.default_view) as string,
        priorities: getValue('priorities', prev.priorities) as typeof prev.priorities,
        labels: getValue('labels', prev.labels) as typeof prev.labels,
        multiple_labels_allowed: getValue('multiple_labels_allowed', prev.multiple_labels_allowed) as boolean,
        users_can_create_labels: getValue('users_can_create_labels', prev.users_can_create_labels) as boolean,
        max_labels_per_task: getValue('max_labels_per_task', prev.max_labels_per_task) as number,
        statuses: getValue('statuses', prev.statuses) as typeof prev.statuses,
        start_status: getValue('start_status', prev.start_status) as string,
        completed_status: getValue('completed_status', prev.completed_status) as string,
        restrict_status_transitions: getValue('restrict_status_transitions', prev.restrict_status_transitions) as boolean,
        time_estimation_enabled: getValue('time_estimation_enabled', prev.time_estimation_enabled) as boolean,
        time_estimation_required: getValue('time_estimation_required', prev.time_estimation_required) as boolean,
        estimation_unit: getValue('estimation_unit', prev.estimation_unit) as string,
        overrun_warning: getValue('overrun_warning', prev.overrun_warning) as boolean,
        time_tracking_enabled: getValue('time_tracking_enabled', prev.time_tracking_enabled) as boolean,
        timer_function: getValue('timer_function', prev.timer_function) as boolean,
        manual_time_entry: getValue('manual_time_entry', prev.manual_time_entry) as boolean,
        description_required: getValue('description_required', prev.description_required) as boolean,
        min_booking_interval: getValue('min_booking_interval', prev.min_booking_interval) as string,
        due_date_enabled: getValue('due_date_enabled', prev.due_date_enabled) as boolean,
        due_date_required: getValue('due_date_required', prev.due_date_required) as boolean,
        default_due_days: getValue('default_due_days', prev.default_due_days) as number,
        default_priority: getValue('default_priority', prev.default_priority) as string,
        due_reminders: getValue('due_reminders', prev.due_reminders) as boolean,
        reminder_hours_before: getValue('reminder_hours_before', prev.reminder_hours_before) as number,
        dependencies_enabled: getValue('dependencies_enabled', prev.dependencies_enabled) as boolean,
        blocking_dependencies: getValue('blocking_dependencies', prev.blocking_dependencies) as boolean,
        prevent_cyclic: getValue('prevent_cyclic', prev.prevent_cyclic) as boolean,
        auto_date_adjustment: getValue('auto_date_adjustment', prev.auto_date_adjustment) as boolean,
        finish_to_start: getValue('finish_to_start', prev.finish_to_start) as boolean,
        start_to_start: getValue('start_to_start', prev.start_to_start) as boolean,
        finish_to_finish: getValue('finish_to_finish', prev.finish_to_finish) as boolean,
        start_to_finish: getValue('start_to_finish', prev.start_to_finish) as boolean,
        recurring_tasks_enabled: getValue('recurring_tasks_enabled', prev.recurring_tasks_enabled) as boolean,
        auto_creation: getValue('auto_creation', prev.auto_creation) as boolean,
        creation_lead_days: getValue('creation_lead_days', prev.creation_lead_days) as number,
        only_when_previous_done: getValue('only_when_previous_done', prev.only_when_previous_done) as boolean,
        daily: getValue('daily', prev.daily) as boolean,
        weekly: getValue('weekly', prev.weekly) as boolean,
        monthly: getValue('monthly', prev.monthly) as boolean,
        yearly: getValue('yearly', prev.yearly) as boolean,
        custom: getValue('custom', prev.custom) as boolean,
        auto_assignment: getValue('auto_assignment', prev.auto_assignment) as boolean,
        approval_on_completion: getValue('approval_on_completion', prev.approval_on_completion) as boolean,
        notify_on_status_change: getValue('notify_on_status_change', prev.notify_on_status_change) as boolean,
        auto_status_on_overdue: getValue('auto_status_on_overdue', prev.auto_status_on_overdue) as boolean,
        notify_on_assign: getValue('notify_on_assign', prev.notify_on_assign) as boolean,
        notify_on_mention: getValue('notify_on_mention', prev.notify_on_mention) as boolean,
        notify_on_comment: getValue('notify_on_comment', prev.notify_on_comment) as boolean,
        notify_on_status: getValue('notify_on_status', prev.notify_on_status) as boolean,
        notify_on_overdue: getValue('notify_on_overdue', prev.notify_on_overdue) as boolean,
      }));
    }
  }, [loading, getValue]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings(formState);
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Aufgaben-Einstellungen wurden erfolgreich aktualisiert.",
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
            <h1 className="text-2xl font-semibold">Aufgaben-Einstellungen</h1>
            <p className="text-sm text-muted-foreground">Konfigurieren Sie Aufgaben, Prioritäten, Workflows und Automatisierungen</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Speichern
          </Button>
        </div>
        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="config" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden lg:inline">Allgemein</span>
            </TabsTrigger>
            <TabsTrigger value="priorities" className="flex items-center gap-2">
              <Tags className="h-4 w-4" />
              <span className="hidden lg:inline">Prioritäten</span>
            </TabsTrigger>
            <TabsTrigger value="statuses" className="flex items-center gap-2">
              <Kanban className="h-4 w-4" />
              <span className="hidden lg:inline">Status</span>
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden lg:inline">Zeit</span>
            </TabsTrigger>
            <TabsTrigger value="dependencies" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              <span className="hidden lg:inline">Abhängigkeiten</span>
            </TabsTrigger>
            <TabsTrigger value="recurring" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              <span className="hidden lg:inline">Wiederkehrend</span>
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <span className="hidden lg:inline">Workflows</span>
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
                <CardTitle>Aufgaben-Grundeinstellungen</CardTitle>
                <CardDescription>Grundlegende Konfiguration für das Aufgaben-Modul</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Aufgabennummern</Label>
                    <p className="text-sm text-muted-foreground">Generiere eindeutige IDs für jede Aufgabe</p>
                  </div>
                  <Switch 
                    checked={formState.auto_task_numbers} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, auto_task_numbers: checked }))} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Aufgaben-Präfix</Label>
                    <Input 
                      value={formState.task_prefix} 
                      onChange={(e) => setFormState(prev => ({ ...prev, task_prefix: e.target.value }))} 
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
                        <SelectItem value="date">Mit Datum (2024-001)</SelectItem>
                        <SelectItem value="random">Zufällig</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Unteraufgaben aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Hierarchische Aufgabenstrukturen erlauben</p>
                  </div>
                  <Switch 
                    checked={formState.subtasks_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, subtasks_enabled: checked }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximale Verschachtelungstiefe</Label>
                  <Select 
                    value={formState.max_nesting_depth} 
                    onValueChange={(value) => setFormState(prev => ({ ...prev, max_nesting_depth: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Ebene</SelectItem>
                      <SelectItem value="2">2 Ebenen</SelectItem>
                      <SelectItem value="3">3 Ebenen</SelectItem>
                      <SelectItem value="5">5 Ebenen</SelectItem>
                      <SelectItem value="unlimited">Unbegrenzt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Checklisten aktivieren</Label>
                    <p className="text-sm text-muted-foreground">To-Do-Listen innerhalb von Aufgaben</p>
                  </div>
                  <Switch 
                    checked={formState.checklists_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, checklists_enabled: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Kommentare aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Diskussionen zu Aufgaben ermöglichen</p>
                  </div>
                  <Switch 
                    checked={formState.comments_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, comments_enabled: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Anhänge aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Dateien an Aufgaben anhängen</p>
                  </div>
                  <Switch 
                    checked={formState.attachments_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, attachments_enabled: checked }))} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max. Anhangsgröße (MB)</Label>
                    <Input 
                      type="number" 
                      value={formState.max_attachment_size_mb} 
                      onChange={(e) => setFormState(prev => ({ ...prev, max_attachment_size_mb: parseInt(e.target.value) || 25 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Erlaubte Dateitypen</Label>
                    <Input 
                      value={formState.allowed_file_types} 
                      onChange={(e) => setFormState(prev => ({ ...prev, allowed_file_types: e.target.value }))}
                      placeholder="z.B. pdf,doc,jpg" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ansichten</CardTitle>
                <CardDescription>Verfügbare Darstellungen für Aufgaben</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Listen-Ansicht</Label>
                    <p className="text-sm text-muted-foreground">Klassische Tabellenansicht</p>
                  </div>
                  <Switch 
                    checked={formState.list_view} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, list_view: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Kanban-Board</Label>
                    <p className="text-sm text-muted-foreground">Spaltenbasierte Ansicht</p>
                  </div>
                  <Switch 
                    checked={formState.kanban_view} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, kanban_view: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Kalender-Ansicht</Label>
                    <p className="text-sm text-muted-foreground">Aufgaben im Kalender</p>
                  </div>
                  <Switch 
                    checked={formState.calendar_view} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, calendar_view: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Gantt-Diagramm</Label>
                    <p className="text-sm text-muted-foreground">Zeitstrahl-Darstellung</p>
                  </div>
                  <Switch 
                    checked={formState.gantt_view} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, gantt_view: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mind-Map-Ansicht</Label>
                    <p className="text-sm text-muted-foreground">Visuelle Aufgabenstruktur</p>
                  </div>
                  <Switch 
                    checked={formState.mindmap_view} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, mindmap_view: checked }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Standard-Ansicht</Label>
                  <Select 
                    value={formState.default_view} 
                    onValueChange={(value) => setFormState(prev => ({ ...prev, default_view: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="list">Liste</SelectItem>
                      <SelectItem value="kanban">Kanban</SelectItem>
                      <SelectItem value="calendar">Kalender</SelectItem>
                      <SelectItem value="gantt">Gantt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prioritäten & Labels */}
          <TabsContent value="priorities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Prioritäten</CardTitle>
                <CardDescription>Definieren Sie die verfügbaren Prioritätsstufen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formState.priorities.map((priority, index) => (
                  <div key={priority.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <Input 
                      type="color" 
                      value={priority.color} 
                      onChange={(e) => {
                        const newPriorities = [...formState.priorities];
                        newPriorities[index] = { ...priority, color: e.target.value };
                        setFormState(prev => ({ ...prev, priorities: newPriorities }));
                      }}
                      className="w-12 h-8 p-0 border-0" 
                    />
                    <Input 
                      value={priority.name} 
                      onChange={(e) => {
                        const newPriorities = [...formState.priorities];
                        newPriorities[index] = { ...priority, name: e.target.value };
                        setFormState(prev => ({ ...prev, priorities: newPriorities }));
                      }}
                      className="flex-1" 
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        const newPriorities = formState.priorities.filter((_, i) => i !== index);
                        setFormState(prev => ({ ...prev, priorities: newPriorities }));
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
                    const newPriority = { id: Date.now().toString(), name: 'Neue Priorität', color: '#6b7280' };
                    setFormState(prev => ({ ...prev, priorities: [...prev.priorities, newPriority] }));
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Priorität hinzufügen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Labels / Tags</CardTitle>
                <CardDescription>Verwalten Sie Labels zur Kategorisierung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formState.labels.map((label, index) => (
                  <div key={label.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <Input 
                      type="color" 
                      value={label.color} 
                      onChange={(e) => {
                        const newLabels = [...formState.labels];
                        newLabels[index] = { ...label, color: e.target.value };
                        setFormState(prev => ({ ...prev, labels: newLabels }));
                      }}
                      className="w-12 h-8 p-0 border-0" 
                    />
                    <Input 
                      value={label.name} 
                      onChange={(e) => {
                        const newLabels = [...formState.labels];
                        newLabels[index] = { ...label, name: e.target.value };
                        setFormState(prev => ({ ...prev, labels: newLabels }));
                      }}
                      className="flex-1" 
                    />
                    <Badge style={{ backgroundColor: label.color }}>{label.name}</Badge>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        const newLabels = formState.labels.filter((_, i) => i !== index);
                        setFormState(prev => ({ ...prev, labels: newLabels }));
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
                    const newLabel = { id: Date.now().toString(), name: 'Neues Label', color: '#6b7280' };
                    setFormState(prev => ({ ...prev, labels: [...prev.labels, newLabel] }));
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Label hinzufügen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Label-Einstellungen</CardTitle>
                <CardDescription>Regeln für Labels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mehrere Labels pro Aufgabe</Label>
                    <p className="text-sm text-muted-foreground">Mehrfachauswahl erlauben</p>
                  </div>
                  <Switch 
                    checked={formState.multiple_labels_allowed} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, multiple_labels_allowed: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Benutzer können Labels erstellen</Label>
                    <p className="text-sm text-muted-foreground">Neue Labels on-the-fly anlegen</p>
                  </div>
                  <Switch 
                    checked={formState.users_can_create_labels} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, users_can_create_labels: checked }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximale Labels pro Aufgabe</Label>
                  <Input 
                    type="number" 
                    value={formState.max_labels_per_task} 
                    onChange={(e) => setFormState(prev => ({ ...prev, max_labels_per_task: parseInt(e.target.value) || 5 }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Status-Einstellungen */}
          <TabsContent value="statuses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Aufgaben-Status</CardTitle>
                <CardDescription>Definieren Sie die verfügbaren Status für Aufgaben</CardDescription>
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
                <CardTitle>Status-Kategorien</CardTitle>
                <CardDescription>Gruppierung von Status für Berichte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Startet als</Label>
                  <Select 
                    value={formState.start_status} 
                    onValueChange={(value) => setFormState(prev => ({ ...prev, start_status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Offen</SelectItem>
                      <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Abgeschlossen-Status</Label>
                  <Select 
                    value={formState.completed_status} 
                    onValueChange={(value) => setFormState(prev => ({ ...prev, completed_status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="done">Erledigt</SelectItem>
                      <SelectItem value="closed">Geschlossen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Status-Übergänge einschränken</Label>
                    <p className="text-sm text-muted-foreground">Nur bestimmte Statuswechsel erlauben</p>
                  </div>
                  <Switch 
                    checked={formState.restrict_status_transitions} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, restrict_status_transitions: checked }))} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Zeitmanagement */}
          <TabsContent value="time" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Zeitschätzungen</CardTitle>
                <CardDescription>Einstellungen für Zeitschätzungen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Zeitschätzung aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Geschätzten Aufwand erfassen</p>
                  </div>
                  <Switch 
                    checked={formState.time_estimation_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, time_estimation_enabled: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Zeitschätzung erforderlich</Label>
                    <p className="text-sm text-muted-foreground">Pflichtfeld bei Aufgabenerstellung</p>
                  </div>
                  <Switch 
                    checked={formState.time_estimation_required} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, time_estimation_required: checked }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Schätzungseinheit</Label>
                  <Select 
                    value={formState.estimation_unit} 
                    onValueChange={(value) => setFormState(prev => ({ ...prev, estimation_unit: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minuten</SelectItem>
                      <SelectItem value="hours">Stunden</SelectItem>
                      <SelectItem value="days">Tage</SelectItem>
                      <SelectItem value="story_points">Story Points</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Warnung bei Überschreitung</Label>
                    <p className="text-sm text-muted-foreground">Benachrichtigung wenn geschätzte Zeit überschritten</p>
                  </div>
                  <Switch 
                    checked={formState.overrun_warning} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, overrun_warning: checked }))} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Zeiterfassung</CardTitle>
                <CardDescription>Tracking der tatsächlichen Arbeitszeit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Zeiterfassung aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Ermögliche Zeitbuchungen auf Aufgaben</p>
                  </div>
                  <Switch 
                    checked={formState.time_tracking_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, time_tracking_enabled: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Timer-Funktion</Label>
                    <p className="text-sm text-muted-foreground">Start/Stop-Timer für Zeiterfassung</p>
                  </div>
                  <Switch 
                    checked={formState.timer_function} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, timer_function: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Manuelle Zeiterfassung</Label>
                    <p className="text-sm text-muted-foreground">Nachträgliche Zeitbuchungen erlauben</p>
                  </div>
                  <Switch 
                    checked={formState.manual_time_entry} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, manual_time_entry: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Beschreibung erforderlich</Label>
                    <p className="text-sm text-muted-foreground">Kommentar bei Zeitbuchung</p>
                  </div>
                  <Switch 
                    checked={formState.description_required} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, description_required: checked }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Minimale Buchungseinheit (Minuten)</Label>
                  <Select 
                    value={formState.min_booking_interval} 
                    onValueChange={(value) => setFormState(prev => ({ ...prev, min_booking_interval: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Minute</SelectItem>
                      <SelectItem value="5">5 Minuten</SelectItem>
                      <SelectItem value="15">15 Minuten</SelectItem>
                      <SelectItem value="30">30 Minuten</SelectItem>
                      <SelectItem value="60">60 Minuten</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fälligkeiten</CardTitle>
                <CardDescription>Einstellungen für Aufgaben-Fristen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Fälligkeitsdatum aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Due-Dates für Aufgaben</p>
                  </div>
                  <Switch 
                    checked={formState.due_date_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, due_date_enabled: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Fälligkeit erforderlich</Label>
                    <p className="text-sm text-muted-foreground">Jede Aufgabe braucht eine Frist</p>
                  </div>
                  <Switch 
                    checked={formState.due_date_required} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, due_date_required: checked }))} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Standard-Frist (Tage)</Label>
                    <Input 
                      type="number" 
                      value={formState.default_due_days} 
                      onChange={(e) => setFormState(prev => ({ ...prev, default_due_days: parseInt(e.target.value) || 7 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Standard-Priorität</Label>
                    <Select 
                      value={formState.default_priority} 
                      onValueChange={(value) => setFormState(prev => ({ ...prev, default_priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kritisch">Kritisch</SelectItem>
                        <SelectItem value="hoch">Hoch</SelectItem>
                        <SelectItem value="mittel">Mittel</SelectItem>
                        <SelectItem value="niedrig">Niedrig</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Fälligkeits-Erinnerungen</Label>
                    <p className="text-sm text-muted-foreground">Benachrichtige vor Fälligkeit</p>
                  </div>
                  <Switch 
                    checked={formState.due_reminders} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, due_reminders: checked }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Erinnerung vor Fälligkeit (Stunden)</Label>
                  <Input 
                    type="number" 
                    value={formState.reminder_hours_before} 
                    onChange={(e) => setFormState(prev => ({ ...prev, reminder_hours_before: parseInt(e.target.value) || 24 }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Abhängigkeiten */}
          <TabsContent value="dependencies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Aufgaben-Abhängigkeiten</CardTitle>
                <CardDescription>Verknüpfungen zwischen Aufgaben</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Abhängigkeiten aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Aufgaben miteinander verknüpfen</p>
                  </div>
                  <Switch 
                    checked={formState.dependencies_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, dependencies_enabled: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Blockierende Abhängigkeiten</Label>
                    <p className="text-sm text-muted-foreground">Aufgabe kann nicht starten bis Vorgänger erledigt</p>
                  </div>
                  <Switch 
                    checked={formState.blocking_dependencies} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, blocking_dependencies: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Zyklische Abhängigkeiten verhindern</Label>
                    <p className="text-sm text-muted-foreground">Keine Ringschlüsse erlauben</p>
                  </div>
                  <Switch 
                    checked={formState.prevent_cyclic} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, prevent_cyclic: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Datumsanpassung</Label>
                    <p className="text-sm text-muted-foreground">Folgetermine bei Verzögerung verschieben</p>
                  </div>
                  <Switch 
                    checked={formState.auto_date_adjustment} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, auto_date_adjustment: checked }))} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Abhängigkeitstypen</CardTitle>
                <CardDescription>Verfügbare Verknüpfungsarten</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Ende-zu-Start (Finish-to-Start)</Label>
                    <p className="text-sm text-muted-foreground">B beginnt wenn A endet</p>
                  </div>
                  <Switch 
                    checked={formState.finish_to_start} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, finish_to_start: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Start-zu-Start (Start-to-Start)</Label>
                    <p className="text-sm text-muted-foreground">B beginnt wenn A beginnt</p>
                  </div>
                  <Switch 
                    checked={formState.start_to_start} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, start_to_start: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Ende-zu-Ende (Finish-to-Finish)</Label>
                    <p className="text-sm text-muted-foreground">B endet wenn A endet</p>
                  </div>
                  <Switch 
                    checked={formState.finish_to_finish} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, finish_to_finish: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Start-zu-Ende (Start-to-Finish)</Label>
                    <p className="text-sm text-muted-foreground">B endet wenn A startet</p>
                  </div>
                  <Switch 
                    checked={formState.start_to_finish} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, start_to_finish: checked }))} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wiederkehrende Aufgaben */}
          <TabsContent value="recurring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Wiederkehrende Aufgaben</CardTitle>
                <CardDescription>Automatisch wiederholende Aufgaben konfigurieren</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Wiederkehrende Aufgaben aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Aufgaben nach Zeitplan wiederholen</p>
                  </div>
                  <Switch 
                    checked={formState.recurring_tasks_enabled} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, recurring_tasks_enabled: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Erstellung</Label>
                    <p className="text-sm text-muted-foreground">Neue Instanz automatisch anlegen</p>
                  </div>
                  <Switch 
                    checked={formState.auto_creation} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, auto_creation: checked }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vorlaufzeit für Erstellung (Tage)</Label>
                  <Input 
                    type="number" 
                    value={formState.creation_lead_days} 
                    onChange={(e) => setFormState(prev => ({ ...prev, creation_lead_days: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Nur erstellen wenn Vorgänger erledigt</Label>
                    <p className="text-sm text-muted-foreground">Keine Dopplungen bei offenen Aufgaben</p>
                  </div>
                  <Switch 
                    checked={formState.only_when_previous_done} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, only_when_previous_done: checked }))} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wiederholungsmuster</CardTitle>
                <CardDescription>Verfügbare Wiederholungsoptionen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Täglich</Label>
                    <p className="text-sm text-muted-foreground">Jeden Tag wiederholen</p>
                  </div>
                  <Switch 
                    checked={formState.daily} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, daily: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Wöchentlich</Label>
                    <p className="text-sm text-muted-foreground">An bestimmten Wochentagen</p>
                  </div>
                  <Switch 
                    checked={formState.weekly} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, weekly: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Monatlich</Label>
                    <p className="text-sm text-muted-foreground">An bestimmtem Tag im Monat</p>
                  </div>
                  <Switch 
                    checked={formState.monthly} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, monthly: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Jährlich</Label>
                    <p className="text-sm text-muted-foreground">Einmal pro Jahr</p>
                  </div>
                  <Switch 
                    checked={formState.yearly} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, yearly: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Benutzerdefiniert</Label>
                    <p className="text-sm text-muted-foreground">Flexible Intervalle</p>
                  </div>
                  <Switch 
                    checked={formState.custom} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, custom: checked }))} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflows */}
          <TabsContent value="workflows" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Automatisierungen</CardTitle>
                <CardDescription>Automatische Aktionen bei Statusänderungen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Zuweisung</Label>
                    <p className="text-sm text-muted-foreground">Neue Aufgaben automatisch zuweisen</p>
                  </div>
                  <Switch 
                    checked={formState.auto_assignment} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, auto_assignment: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Genehmigung bei Abschluss</Label>
                    <p className="text-sm text-muted-foreground">Erfordere Genehmigung zum Schließen</p>
                  </div>
                  <Switch 
                    checked={formState.approval_on_completion} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, approval_on_completion: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Benachrichtigung bei Statusänderung</Label>
                    <p className="text-sm text-muted-foreground">Informiere alle Beteiligten</p>
                  </div>
                  <Switch 
                    checked={formState.notify_on_status_change} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, notify_on_status_change: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatischer Status bei Fristüberschreitung</Label>
                    <p className="text-sm text-muted-foreground">Status ändern wenn überfällig</p>
                  </div>
                  <Switch 
                    checked={formState.auto_status_on_overdue} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, auto_status_on_overdue: checked }))} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Benachrichtigungsregeln</CardTitle>
                <CardDescription>Wer wird wann benachrichtigt?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bei Zuweisung</Label>
                    <p className="text-sm text-muted-foreground">Zugewiesene Person informieren</p>
                  </div>
                  <Switch 
                    checked={formState.notify_on_assign} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, notify_on_assign: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bei Erwähnung (@mention)</Label>
                    <p className="text-sm text-muted-foreground">Bei @-Erwähnung in Kommentaren</p>
                  </div>
                  <Switch 
                    checked={formState.notify_on_mention} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, notify_on_mention: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bei neuem Kommentar</Label>
                    <p className="text-sm text-muted-foreground">Alle Beobachter informieren</p>
                  </div>
                  <Switch 
                    checked={formState.notify_on_comment} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, notify_on_comment: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bei Statusänderung</Label>
                    <p className="text-sm text-muted-foreground">Ersteller und Zugewiesene</p>
                  </div>
                  <Switch 
                    checked={formState.notify_on_status} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, notify_on_status: checked }))} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bei Überfälligkeit</Label>
                    <p className="text-sm text-muted-foreground">Eskalation bei Fristüberschreitung</p>
                  </div>
                  <Switch 
                    checked={formState.notify_on_overdue} 
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, notify_on_overdue: checked }))} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vorlagen */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Aufgaben-Vorlagen</CardTitle>
                <CardDescription>Wiederverwendbare Aufgabenstrukturen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Bug-Report</h4>
                    <Badge variant="secondary">5 Felder</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Vorlage für Fehlerberichte</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Feature-Request</h4>
                    <Badge variant="secondary">8 Felder</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Vorlage für neue Funktionen</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Onboarding-Aufgaben</h4>
                    <Badge variant="secondary">10 Unteraufgaben</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Checkliste für neue Mitarbeiter</p>
                </div>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Vorlage erstellen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Checklisten-Vorlagen</CardTitle>
                <CardDescription>Wiederverwendbare Checklisten</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Code-Review</h4>
                    <Badge variant="secondary">8 Punkte</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Prüfpunkte für Code-Reviews</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Deployment</h4>
                    <Badge variant="secondary">12 Punkte</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Checkliste für Releases</p>
                </div>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Checkliste erstellen
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
