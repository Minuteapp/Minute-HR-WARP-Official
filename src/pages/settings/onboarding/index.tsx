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
  UserCheck, FileText, CheckSquare, GitBranch, Users, Plus, ChevronLeft, Trash2, GripVertical,
  Laptop, GraduationCap, Clock, Bell, Shield, Calendar, Building2, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";

interface OnboardingFormState {
  // Vorlagen
  auto_template_selection: boolean;
  templates_customizable: boolean;
  versioning_enabled: boolean;
  
  // Checklisten
  enforce_order: boolean;
  signature_required: boolean;
  due_reminders: boolean;
  reminder_days_before: number;
  escalation_enabled: boolean;
  
  // Dokumente
  digital_signature: boolean;
  auto_document_reminders: boolean;
  document_review: boolean;
  allowed_file_formats: string;
  max_file_size_mb: number;
  
  // Equipment
  auto_workplace_assign: boolean;
  auto_order_keys: boolean;
  equipment_lead_time_days: number;
  
  // Schulungen
  auto_assign_training: boolean;
  certificate_on_completion: boolean;
  require_passing: boolean;
  min_passing_score: number;
  progress_tracking: boolean;
  
  // Probezeit
  default_probation_months: number;
  min_probation_months: number;
  probation_milestones: boolean;
  probation_reminders: boolean;
  reminder_weeks_before: number;
  
  // Buddy
  buddy_system_enabled: boolean;
  auto_buddy_assignment: boolean;
  buddy_duration_weeks: number;
  buddy_must_confirm: boolean;
  min_buddy_tenure_months: number;
  buddy_training_required: boolean;
  max_buddees: number;
  prefer_same_department: boolean;
  
  // Workflows
  auto_start_onboarding: boolean;
  lead_time_days: number;
  follow_up_days: number;
  welcome_email_enabled: boolean;
  welcome_email_timing: string;
  notify_supervisor: boolean;
  notify_it: boolean;
  notify_reception: boolean;
  notify_team: boolean;
  progress_updates_to_hr: boolean;
  calendar_integration: boolean;
  slack_teams_announcement: boolean;
  ad_sync: boolean;
  datev_export: boolean;
}

export default function OnboardingSettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings, loading, isSaving, getValue, saveSettings } = useEffectiveSettings('onboarding');
  
  const [formState, setFormState] = useState<OnboardingFormState>({
    // Vorlagen
    auto_template_selection: true,
    templates_customizable: true,
    versioning_enabled: true,
    
    // Checklisten
    enforce_order: false,
    signature_required: true,
    due_reminders: true,
    reminder_days_before: 3,
    escalation_enabled: true,
    
    // Dokumente
    digital_signature: true,
    auto_document_reminders: true,
    document_review: true,
    allowed_file_formats: "pdf,jpg,png",
    max_file_size_mb: 10,
    
    // Equipment
    auto_workplace_assign: true,
    auto_order_keys: true,
    equipment_lead_time_days: 10,
    
    // Schulungen
    auto_assign_training: true,
    certificate_on_completion: true,
    require_passing: true,
    min_passing_score: 70,
    progress_tracking: true,
    
    // Probezeit
    default_probation_months: 6,
    min_probation_months: 3,
    probation_milestones: true,
    probation_reminders: true,
    reminder_weeks_before: 4,
    
    // Buddy
    buddy_system_enabled: true,
    auto_buddy_assignment: false,
    buddy_duration_weeks: 12,
    buddy_must_confirm: true,
    min_buddy_tenure_months: 6,
    buddy_training_required: true,
    max_buddees: 2,
    prefer_same_department: true,
    
    // Workflows
    auto_start_onboarding: true,
    lead_time_days: 10,
    follow_up_days: 90,
    welcome_email_enabled: true,
    welcome_email_timing: "3days",
    notify_supervisor: true,
    notify_it: true,
    notify_reception: true,
    notify_team: true,
    progress_updates_to_hr: true,
    calendar_integration: true,
    slack_teams_announcement: true,
    ad_sync: true,
    datev_export: true,
  });

  const [checklists, setChecklists] = useState([
    { id: "1", name: "IT-Setup", items: 8, mandatory: true },
    { id: "2", name: "HR-Dokumente", items: 12, mandatory: true },
    { id: "3", name: "Team-Einführung", items: 5, mandatory: false },
    { id: "4", name: "Sicherheitsunterweisung", items: 6, mandatory: true },
  ]);

  // Sync form state with settings from database
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormState(prev => ({
        ...prev,
        auto_template_selection: getValue('auto_template_selection', prev.auto_template_selection),
        templates_customizable: getValue('templates_customizable', prev.templates_customizable),
        versioning_enabled: getValue('versioning_enabled', prev.versioning_enabled),
        enforce_order: getValue('enforce_order', prev.enforce_order),
        signature_required: getValue('signature_required', prev.signature_required),
        due_reminders: getValue('due_reminders', prev.due_reminders),
        reminder_days_before: getValue('reminder_days_before', prev.reminder_days_before),
        escalation_enabled: getValue('escalation_enabled', prev.escalation_enabled),
        digital_signature: getValue('digital_signature', prev.digital_signature),
        auto_document_reminders: getValue('auto_document_reminders', prev.auto_document_reminders),
        document_review: getValue('document_review', prev.document_review),
        allowed_file_formats: getValue('allowed_file_formats', prev.allowed_file_formats),
        max_file_size_mb: getValue('max_file_size_mb', prev.max_file_size_mb),
        auto_workplace_assign: getValue('auto_workplace_assign', prev.auto_workplace_assign),
        auto_order_keys: getValue('auto_order_keys', prev.auto_order_keys),
        equipment_lead_time_days: getValue('equipment_lead_time_days', prev.equipment_lead_time_days),
        auto_assign_training: getValue('auto_assign_training', prev.auto_assign_training),
        certificate_on_completion: getValue('certificate_on_completion', prev.certificate_on_completion),
        require_passing: getValue('require_passing', prev.require_passing),
        min_passing_score: getValue('min_passing_score', prev.min_passing_score),
        progress_tracking: getValue('progress_tracking', prev.progress_tracking),
        default_probation_months: getValue('default_probation_months', prev.default_probation_months),
        min_probation_months: getValue('min_probation_months', prev.min_probation_months),
        probation_milestones: getValue('probation_milestones', prev.probation_milestones),
        probation_reminders: getValue('probation_reminders', prev.probation_reminders),
        reminder_weeks_before: getValue('reminder_weeks_before', prev.reminder_weeks_before),
        buddy_system_enabled: getValue('buddy_system_enabled', prev.buddy_system_enabled),
        auto_buddy_assignment: getValue('auto_buddy_assignment', prev.auto_buddy_assignment),
        buddy_duration_weeks: getValue('buddy_duration_weeks', prev.buddy_duration_weeks),
        buddy_must_confirm: getValue('buddy_must_confirm', prev.buddy_must_confirm),
        min_buddy_tenure_months: getValue('min_buddy_tenure_months', prev.min_buddy_tenure_months),
        buddy_training_required: getValue('buddy_training_required', prev.buddy_training_required),
        max_buddees: getValue('max_buddees', prev.max_buddees),
        prefer_same_department: getValue('prefer_same_department', prev.prefer_same_department),
        auto_start_onboarding: getValue('auto_start_onboarding', prev.auto_start_onboarding),
        lead_time_days: getValue('lead_time_days', prev.lead_time_days),
        follow_up_days: getValue('follow_up_days', prev.follow_up_days),
        welcome_email_enabled: getValue('welcome_email_enabled', prev.welcome_email_enabled),
        welcome_email_timing: getValue('welcome_email_timing', prev.welcome_email_timing),
        notify_supervisor: getValue('notify_supervisor', prev.notify_supervisor),
        notify_it: getValue('notify_it', prev.notify_it),
        notify_reception: getValue('notify_reception', prev.notify_reception),
        notify_team: getValue('notify_team', prev.notify_team),
        progress_updates_to_hr: getValue('progress_updates_to_hr', prev.progress_updates_to_hr),
        calendar_integration: getValue('calendar_integration', prev.calendar_integration),
        slack_teams_announcement: getValue('slack_teams_announcement', prev.slack_teams_announcement),
        ad_sync: getValue('ad_sync', prev.ad_sync),
        datev_export: getValue('datev_export', prev.datev_export),
      }));
    }
  }, [settings, getValue]);

  const updateFormField = <K extends keyof OnboardingFormState>(field: K, value: OnboardingFormState[K]) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const success = await saveSettings(formState);
      if (success) {
        toast({
          title: "Einstellungen gespeichert",
          description: "Die Onboarding-Einstellungen wurden erfolgreich aktualisiert.",
        });
      } else {
        toast({
          title: "Fehler beim Speichern",
          description: "Die Einstellungen konnten nicht gespeichert werden.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving onboarding settings:', error);
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
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate("/settings")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Onboarding-Einstellungen</h1>
            <p className="text-sm text-muted-foreground">Konfigurieren Sie Vorlagen, Checklisten, Equipment und Schulungen</p>
          </div>
        </div>
        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden lg:inline">Vorlagen</span>
            </TabsTrigger>
            <TabsTrigger value="checklists" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden lg:inline">Checklisten</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden lg:inline">Dokumente</span>
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <Laptop className="h-4 w-4" />
              <span className="hidden lg:inline">Equipment</span>
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden lg:inline">Schulungen</span>
            </TabsTrigger>
            <TabsTrigger value="probation" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden lg:inline">Probezeit</span>
            </TabsTrigger>
            <TabsTrigger value="buddy" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden lg:inline">Buddy</span>
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <span className="hidden lg:inline">Workflows</span>
            </TabsTrigger>
          </TabsList>

          {/* Vorlagen */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding-Vorlagen</CardTitle>
                <CardDescription>Erstellen Sie Vorlagen für verschiedene Rollen und Abteilungen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Standard-Onboarding</h4>
                    <Badge>Standard</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Allgemeine Vorlage für alle Mitarbeiter</p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">4 Checklisten</Badge>
                    <Badge variant="secondary">3 Schulungen</Badge>
                    <Badge variant="secondary">14 Tage</Badge>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">IT-Mitarbeiter Onboarding</h4>
                    <Badge variant="outline">Benutzerdefiniert</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Erweitertes Onboarding für IT-Abteilung</p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">6 Checklisten</Badge>
                    <Badge variant="secondary">5 Schulungen</Badge>
                    <Badge variant="secondary">21 Tage</Badge>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Führungskraft Onboarding</h4>
                    <Badge variant="outline">Benutzerdefiniert</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Onboarding für leitende Positionen</p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">8 Checklisten</Badge>
                    <Badge variant="secondary">7 Schulungen</Badge>
                    <Badge variant="secondary">30 Tage</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Neue Vorlage erstellen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vorlagen-Einstellungen</CardTitle>
                <CardDescription>Allgemeine Einstellungen für Onboarding-Vorlagen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Vorlagenauswahl</Label>
                    <p className="text-sm text-muted-foreground">Vorlage basierend auf Position/Abteilung</p>
                  </div>
                  <Switch 
                    checked={formState.auto_template_selection}
                    onCheckedChange={(v) => updateFormField('auto_template_selection', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Vorlagen anpassbar</Label>
                    <p className="text-sm text-muted-foreground">HR kann Vorlagen pro Mitarbeiter anpassen</p>
                  </div>
                  <Switch 
                    checked={formState.templates_customizable}
                    onCheckedChange={(v) => updateFormField('templates_customizable', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Versionierung</Label>
                    <p className="text-sm text-muted-foreground">Änderungshistorie für Vorlagen</p>
                  </div>
                  <Switch 
                    checked={formState.versioning_enabled}
                    onCheckedChange={(v) => updateFormField('versioning_enabled', v)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Checklisten */}
          <TabsContent value="checklists" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding-Checklisten</CardTitle>
                <CardDescription>Standard-Aufgaben für neue Mitarbeiter</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {checklists.map((checklist) => (
                  <div key={checklist.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <div className="flex-1">
                      <h4 className="font-medium">{checklist.name}</h4>
                      <p className="text-sm text-muted-foreground">{checklist.items} Aufgaben</p>
                    </div>
                    {checklist.mandatory && <Badge>Pflicht</Badge>}
                    <Button variant="outline" size="sm">Bearbeiten</Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Checkliste hinzufügen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Checklisten-Einstellungen</CardTitle>
                <CardDescription>Regeln für Onboarding-Checklisten</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Reihenfolge erzwingen</Label>
                    <p className="text-sm text-muted-foreground">Aufgaben müssen in Reihenfolge erledigt werden</p>
                  </div>
                  <Switch 
                    checked={formState.enforce_order}
                    onCheckedChange={(v) => updateFormField('enforce_order', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Unterschrift erforderlich</Label>
                    <p className="text-sm text-muted-foreground">Mitarbeiter muss Erledigungen bestätigen</p>
                  </div>
                  <Switch 
                    checked={formState.signature_required}
                    onCheckedChange={(v) => updateFormField('signature_required', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Fälligkeits-Erinnerungen</Label>
                    <p className="text-sm text-muted-foreground">Automatische Erinnerungen an offene Aufgaben</p>
                  </div>
                  <Switch 
                    checked={formState.due_reminders}
                    onCheckedChange={(v) => updateFormField('due_reminders', v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Erinnerung vor Fälligkeit (Tage)</Label>
                  <Input 
                    type="number" 
                    value={formState.reminder_days_before}
                    onChange={(e) => updateFormField('reminder_days_before', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Eskalation bei Überfälligkeit</Label>
                    <p className="text-sm text-muted-foreground">HR bei überfälligen Aufgaben informieren</p>
                  </div>
                  <Switch 
                    checked={formState.escalation_enabled}
                    onCheckedChange={(v) => updateFormField('escalation_enabled', v)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dokumente */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Erforderliche Dokumente</CardTitle>
                <CardDescription>Unterlagen, die neue Mitarbeiter einreichen müssen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input value="Personalausweis / Reisepass" className="flex-1" readOnly />
                  <Badge>Pflicht</Badge>
                  <Input type="number" defaultValue="0" className="w-20" />
                  <span className="text-sm text-muted-foreground">Tage vor Start</span>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input value="Sozialversicherungsnachweis" className="flex-1" readOnly />
                  <Badge>Pflicht</Badge>
                  <Input type="number" defaultValue="7" className="w-20" />
                  <span className="text-sm text-muted-foreground">Tage nach Start</span>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input value="Steuer-ID" className="flex-1" readOnly />
                  <Badge>Pflicht</Badge>
                  <Input type="number" defaultValue="7" className="w-20" />
                  <span className="text-sm text-muted-foreground">Tage nach Start</span>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input value="Bankverbindung" className="flex-1" readOnly />
                  <Badge>Pflicht</Badge>
                  <Input type="number" defaultValue="0" className="w-20" />
                  <span className="text-sm text-muted-foreground">Tage vor Start</span>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input value="Arbeitszeugnisse" className="flex-1" readOnly />
                  <Badge variant="outline">Optional</Badge>
                  <Input type="number" defaultValue="30" className="w-20" />
                  <span className="text-sm text-muted-foreground">Tage nach Start</span>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Dokument hinzufügen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dokument-Einstellungen</CardTitle>
                <CardDescription>Einstellungen für Dokumentenverwaltung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Digitale Unterschrift</Label>
                    <p className="text-sm text-muted-foreground">Dokumente digital unterschreiben</p>
                  </div>
                  <Switch 
                    checked={formState.digital_signature}
                    onCheckedChange={(v) => updateFormField('digital_signature', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Erinnerungen</Label>
                    <p className="text-sm text-muted-foreground">Bei fehlenden Dokumenten erinnern</p>
                  </div>
                  <Switch 
                    checked={formState.auto_document_reminders}
                    onCheckedChange={(v) => updateFormField('auto_document_reminders', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Dokumentenprüfung</Label>
                    <p className="text-sm text-muted-foreground">HR prüft hochgeladene Dokumente</p>
                  </div>
                  <Switch 
                    checked={formState.document_review}
                    onCheckedChange={(v) => updateFormField('document_review', v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Erlaubte Dateiformate</Label>
                  <Input 
                    value={formState.allowed_file_formats}
                    onChange={(e) => updateFormField('allowed_file_formats', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max. Dateigröße (MB)</Label>
                  <Input 
                    type="number" 
                    value={formState.max_file_size_mb}
                    onChange={(e) => updateFormField('max_file_size_mb', parseInt(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Equipment */}
          <TabsContent value="equipment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Standard-Equipment</CardTitle>
                <CardDescription>Hardware und Ausstattung für neue Mitarbeiter</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input value="Laptop" className="flex-1" readOnly />
                  <Badge>Standard</Badge>
                  <Select defaultValue="5">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Am Starttag</SelectItem>
                      <SelectItem value="5">5 Tage vorher</SelectItem>
                      <SelectItem value="10">10 Tage vorher</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input value="Monitor" className="flex-1" readOnly />
                  <Badge>Standard</Badge>
                  <Select defaultValue="0">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Am Starttag</SelectItem>
                      <SelectItem value="5">5 Tage vorher</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input value="Headset" className="flex-1" readOnly />
                  <Badge>Standard</Badge>
                  <Select defaultValue="0">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Am Starttag</SelectItem>
                      <SelectItem value="5">5 Tage vorher</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input value="Diensthandy" className="flex-1" readOnly />
                  <Badge variant="outline">Auf Anfrage</Badge>
                  <Select defaultValue="0">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Am Starttag</SelectItem>
                      <SelectItem value="5">5 Tage vorher</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Equipment hinzufügen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Software & Zugänge</CardTitle>
                <CardDescription>Standard-Lizenzen und Systemzugänge</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input value="Microsoft 365" className="flex-1" readOnly />
                  <Badge>Standard</Badge>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input value="Slack / Teams" className="flex-1" readOnly />
                  <Badge>Standard</Badge>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input value="VPN-Zugang" className="flex-1" readOnly />
                  <Badge>Standard</Badge>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input value="Drucker-Zugang" className="flex-1" readOnly />
                  <Badge>Standard</Badge>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Software/Zugang hinzufügen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Arbeitsplatz</CardTitle>
                <CardDescription>Einstellungen für Arbeitsplatz-Setup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Arbeitsplatz automatisch zuweisen</Label>
                    <p className="text-sm text-muted-foreground">Freien Platz im Team zuweisen</p>
                  </div>
                  <Switch 
                    checked={formState.auto_workplace_assign}
                    onCheckedChange={(v) => updateFormField('auto_workplace_assign', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Schlüssel/Zugangsmedien bestellen</Label>
                    <p className="text-sm text-muted-foreground">Automatische Bestellung</p>
                  </div>
                  <Switch 
                    checked={formState.auto_order_keys}
                    onCheckedChange={(v) => updateFormField('auto_order_keys', v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vorlaufzeit für Bestellungen (Tage)</Label>
                  <Input 
                    type="number" 
                    value={formState.equipment_lead_time_days}
                    onChange={(e) => updateFormField('equipment_lead_time_days', parseInt(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schulungen */}
          <TabsContent value="training" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pflichtschulungen</CardTitle>
                <CardDescription>Schulungen, die alle neuen Mitarbeiter absolvieren müssen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Sicherheitsunterweisung</h4>
                    <Badge>Pflicht</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Arbeitssicherheit und Erste Hilfe</p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">E-Learning</Badge>
                    <Badge variant="secondary">45 Min</Badge>
                    <Badge variant="secondary">Innerhalb 7 Tage</Badge>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Datenschutz (DSGVO)</h4>
                    <Badge>Pflicht</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Umgang mit personenbezogenen Daten</p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">E-Learning</Badge>
                    <Badge variant="secondary">60 Min</Badge>
                    <Badge variant="secondary">Innerhalb 14 Tage</Badge>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Compliance-Grundlagen</h4>
                    <Badge>Pflicht</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Unternehmensrichtlinien und Ethik</p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">E-Learning</Badge>
                    <Badge variant="secondary">30 Min</Badge>
                    <Badge variant="secondary">Innerhalb 30 Tage</Badge>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">IT-Sicherheit</h4>
                    <Badge>Pflicht</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Passwörter, Phishing, sichere Nutzung</p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">E-Learning</Badge>
                    <Badge variant="secondary">30 Min</Badge>
                    <Badge variant="secondary">Innerhalb 14 Tage</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Schulung hinzufügen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schulungs-Einstellungen</CardTitle>
                <CardDescription>Allgemeine Einstellungen für Schulungen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Zuweisung</Label>
                    <p className="text-sm text-muted-foreground">Pflichtschulungen automatisch zuweisen</p>
                  </div>
                  <Switch 
                    checked={formState.auto_assign_training}
                    onCheckedChange={(v) => updateFormField('auto_assign_training', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Zertifikat nach Abschluss</Label>
                    <p className="text-sm text-muted-foreground">Teilnahmebescheinigung generieren</p>
                  </div>
                  <Switch 
                    checked={formState.certificate_on_completion}
                    onCheckedChange={(v) => updateFormField('certificate_on_completion', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Wiederholung bei Nichtbestehen</Label>
                    <p className="text-sm text-muted-foreground">Quiz muss bestanden werden</p>
                  </div>
                  <Switch 
                    checked={formState.require_passing}
                    onCheckedChange={(v) => updateFormField('require_passing', v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mindest-Punktzahl zum Bestehen (%)</Label>
                  <Input 
                    type="number" 
                    value={formState.min_passing_score}
                    onChange={(e) => updateFormField('min_passing_score', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Fortschritts-Tracking</Label>
                    <p className="text-sm text-muted-foreground">Fortschritt für HR sichtbar</p>
                  </div>
                  <Switch 
                    checked={formState.progress_tracking}
                    onCheckedChange={(v) => updateFormField('progress_tracking', v)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Probezeit */}
          <TabsContent value="probation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Probezeit-Einstellungen</CardTitle>
                <CardDescription>Konfiguration für die Probezeit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Standard-Probezeit (Monate)</Label>
                    <Input 
                      type="number" 
                      value={formState.default_probation_months}
                      onChange={(e) => updateFormField('default_probation_months', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mindest-Probezeit (Monate)</Label>
                    <Input 
                      type="number" 
                      value={formState.min_probation_months}
                      onChange={(e) => updateFormField('min_probation_months', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Probezeit-Meilensteine</Label>
                    <p className="text-sm text-muted-foreground">Regelmäßige Checkpoints</p>
                  </div>
                  <Switch 
                    checked={formState.probation_milestones}
                    onCheckedChange={(v) => updateFormField('probation_milestones', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Erinnerungen</Label>
                    <p className="text-sm text-muted-foreground">Vor Ablauf der Probezeit</p>
                  </div>
                  <Switch 
                    checked={formState.probation_reminders}
                    onCheckedChange={(v) => updateFormField('probation_reminders', v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Erinnerung vor Ablauf (Wochen)</Label>
                  <Input 
                    type="number" 
                    value={formState.reminder_weeks_before}
                    onChange={(e) => updateFormField('reminder_weeks_before', parseInt(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Probezeit-Gespräche</CardTitle>
                <CardDescription>Meilensteine und Bewertungen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">30-Tage-Gespräch</h4>
                    <Badge variant="secondary">Nach 1 Monat</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Erstes Feedback-Gespräch</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">90-Tage-Gespräch</h4>
                    <Badge variant="secondary">Nach 3 Monaten</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Halbzeit-Bewertung</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Probezeit-Abschlussgespräch</h4>
                    <Badge>Vor Ablauf</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Finale Entscheidung zur Übernahme</p>
                </div>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Meilenstein hinzufügen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bewertungskriterien</CardTitle>
                <CardDescription>Kriterien für Probezeit-Bewertungen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input value="Fachliche Kompetenz" className="flex-1" readOnly />
                  <Input type="number" defaultValue="30" className="w-20" />
                  <span className="text-sm text-muted-foreground">% Gewichtung</span>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input value="Teamfähigkeit" className="flex-1" readOnly />
                  <Input type="number" defaultValue="25" className="w-20" />
                  <span className="text-sm text-muted-foreground">% Gewichtung</span>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input value="Eigeninitiative" className="flex-1" readOnly />
                  <Input type="number" defaultValue="20" className="w-20" />
                  <span className="text-sm text-muted-foreground">% Gewichtung</span>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input value="Zuverlässigkeit" className="flex-1" readOnly />
                  <Input type="number" defaultValue="25" className="w-20" />
                  <span className="text-sm text-muted-foreground">% Gewichtung</span>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Kriterium hinzufügen
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Buddy-System */}
          <TabsContent value="buddy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Buddy-System</CardTitle>
                <CardDescription>Patenschafts-Programm für neue Mitarbeiter</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Buddy-System aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Jedem Neuen einen Buddy zuweisen</p>
                  </div>
                  <Switch 
                    checked={formState.buddy_system_enabled}
                    onCheckedChange={(v) => updateFormField('buddy_system_enabled', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Zuweisung</Label>
                    <p className="text-sm text-muted-foreground">Buddy aus gleichem Team</p>
                  </div>
                  <Switch 
                    checked={formState.auto_buddy_assignment}
                    onCheckedChange={(v) => updateFormField('auto_buddy_assignment', v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Buddy-Zeitraum (Wochen)</Label>
                  <Input 
                    type="number" 
                    value={formState.buddy_duration_weeks}
                    onChange={(e) => updateFormField('buddy_duration_weeks', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Buddy muss bestätigen</Label>
                    <p className="text-sm text-muted-foreground">Buddy muss Zuweisung akzeptieren</p>
                  </div>
                  <Switch 
                    checked={formState.buddy_must_confirm}
                    onCheckedChange={(v) => updateFormField('buddy_must_confirm', v)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Buddy-Anforderungen</CardTitle>
                <CardDescription>Wer kann Buddy werden?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Mindest-Betriebszugehörigkeit (Monate)</Label>
                  <Input 
                    type="number" 
                    value={formState.min_buddy_tenure_months}
                    onChange={(e) => updateFormField('min_buddy_tenure_months', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Buddy-Schulung erforderlich</Label>
                    <p className="text-sm text-muted-foreground">Buddy muss Schulung absolviert haben</p>
                  </div>
                  <Switch 
                    checked={formState.buddy_training_required}
                    onCheckedChange={(v) => updateFormField('buddy_training_required', v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max. Buddees gleichzeitig</Label>
                  <Input 
                    type="number" 
                    value={formState.max_buddees}
                    onChange={(e) => updateFormField('max_buddees', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Gleiche Abteilung bevorzugen</Label>
                    <p className="text-sm text-muted-foreground">Buddy sollte aus selber Abteilung sein</p>
                  </div>
                  <Switch 
                    checked={formState.prefer_same_department}
                    onCheckedChange={(v) => updateFormField('prefer_same_department', v)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Buddy-Aufgaben</CardTitle>
                <CardDescription>Checkliste für Buddies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input value="Gemeinsames Mittagessen in der ersten Woche" className="flex-1" readOnly />
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input value="Büro-Rundgang und Vorstellungsrunde" className="flex-1" readOnly />
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input value="Wöchentliches Check-in Gespräch" className="flex-1" readOnly />
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input value="Feedback an HR nach 30 Tagen" className="flex-1" readOnly />
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Aufgabe hinzufügen
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflows */}
          <TabsContent value="workflows" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding-Automatisierung</CardTitle>
                <CardDescription>Automatische Prozesse beim Onboarding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatischer Start</Label>
                    <p className="text-sm text-muted-foreground">Starte Onboarding bei Einstellung</p>
                  </div>
                  <Switch 
                    checked={formState.auto_start_onboarding}
                    onCheckedChange={(v) => updateFormField('auto_start_onboarding', v)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vorlaufzeit (Tage vor Start)</Label>
                    <Input 
                      type="number" 
                      value={formState.lead_time_days}
                      onChange={(e) => updateFormField('lead_time_days', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nachlaufzeit (Tage nach Start)</Label>
                    <Input 
                      type="number" 
                      value={formState.follow_up_days}
                      onChange={(e) => updateFormField('follow_up_days', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Willkommens-E-Mail</Label>
                    <p className="text-sm text-muted-foreground">Automatische Begrüßungs-E-Mail</p>
                  </div>
                  <Switch 
                    checked={formState.welcome_email_enabled}
                    onCheckedChange={(v) => updateFormField('welcome_email_enabled', v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Willkommens-E-Mail versenden</Label>
                  <Select 
                    value={formState.welcome_email_timing}
                    onValueChange={(v) => updateFormField('welcome_email_timing', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediately">Sofort nach Zusage</SelectItem>
                      <SelectItem value="1week">1 Woche vor Start</SelectItem>
                      <SelectItem value="3days">3 Tage vor Start</SelectItem>
                      <SelectItem value="1day">1 Tag vor Start</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Benachrichtigungen</CardTitle>
                <CardDescription>Wer wird wann informiert?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Vorgesetzten informieren</Label>
                    <p className="text-sm text-muted-foreground">Bei Start eines neuen Mitarbeiters</p>
                  </div>
                  <Switch 
                    checked={formState.notify_supervisor}
                    onCheckedChange={(v) => updateFormField('notify_supervisor', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>IT informieren</Label>
                    <p className="text-sm text-muted-foreground">Für Equipment-Vorbereitung</p>
                  </div>
                  <Switch 
                    checked={formState.notify_it}
                    onCheckedChange={(v) => updateFormField('notify_it', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Empfang informieren</Label>
                    <p className="text-sm text-muted-foreground">Für Begrüßung am ersten Tag</p>
                  </div>
                  <Switch 
                    checked={formState.notify_reception}
                    onCheckedChange={(v) => updateFormField('notify_reception', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Team informieren</Label>
                    <p className="text-sm text-muted-foreground">Teamankündigung vor Start</p>
                  </div>
                  <Switch 
                    checked={formState.notify_team}
                    onCheckedChange={(v) => updateFormField('notify_team', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Fortschritts-Updates an HR</Label>
                    <p className="text-sm text-muted-foreground">Regelmäßige Status-Updates</p>
                  </div>
                  <Switch 
                    checked={formState.progress_updates_to_hr}
                    onCheckedChange={(v) => updateFormField('progress_updates_to_hr', v)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integrationen</CardTitle>
                <CardDescription>Verbindungen zu anderen Systemen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Kalender-Integration</Label>
                    <p className="text-sm text-muted-foreground">Termine automatisch in Kalender</p>
                  </div>
                  <Switch 
                    checked={formState.calendar_integration}
                    onCheckedChange={(v) => updateFormField('calendar_integration', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Slack/Teams-Ankündigung</Label>
                    <p className="text-sm text-muted-foreground">Neue Mitarbeiter im Team vorstellen</p>
                  </div>
                  <Switch 
                    checked={formState.slack_teams_announcement}
                    onCheckedChange={(v) => updateFormField('slack_teams_announcement', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Active Directory Sync</Label>
                    <p className="text-sm text-muted-foreground">Benutzer automatisch anlegen</p>
                  </div>
                  <Switch 
                    checked={formState.ad_sync}
                    onCheckedChange={(v) => updateFormField('ad_sync', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>DATEV-Export</Label>
                    <p className="text-sm text-muted-foreground">Stammdaten an Lohnbuchhaltung</p>
                  </div>
                  <Switch 
                    checked={formState.datev_export}
                    onCheckedChange={(v) => updateFormField('datev_export', v)}
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
