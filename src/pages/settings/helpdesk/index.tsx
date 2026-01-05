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
import { Headphones, Tags, Clock, AlertTriangle, Users, Plus, Trash2, ChevronLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";

interface HelpdeskFormState {
  // Konfiguration
  email_ticket_creation: boolean;
  self_service_portal: boolean;
  satisfaction_survey: boolean;
  ticket_prefix: string;
  default_priority: string;
  // SLA
  sla_critical_response_hours: number;
  sla_critical_resolution_hours: number;
  sla_high_response_hours: number;
  sla_high_resolution_hours: number;
  sla_medium_response_hours: number;
  sla_medium_resolution_hours: number;
  // Eskalation
  auto_escalation: boolean;
  manager_notification: boolean;
  escalation_minutes_before_sla: number;
  // Zuweisung
  auto_assignment: boolean;
  assignment_method: string;
  consider_availability: boolean;
  // Kategorien
  categories: Array<{ id: string; name: string; color: string }>;
}

export default function HelpdeskSettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading, saveSettings, getValue } = useEffectiveSettings('helpdesk');
  const [isSaving, setIsSaving] = useState(false);

  const [formState, setFormState] = useState<HelpdeskFormState>({
    email_ticket_creation: true,
    self_service_portal: true,
    satisfaction_survey: true,
    ticket_prefix: "TKT",
    default_priority: "mittel",
    sla_critical_response_hours: 1,
    sla_critical_resolution_hours: 4,
    sla_high_response_hours: 4,
    sla_high_resolution_hours: 24,
    sla_medium_response_hours: 24,
    sla_medium_resolution_hours: 72,
    auto_escalation: true,
    manager_notification: true,
    escalation_minutes_before_sla: 30,
    auto_assignment: true,
    assignment_method: "round-robin",
    consider_availability: true,
    categories: [
      { id: "1", name: "IT-Support", color: "#3b82f6" },
      { id: "2", name: "HR-Anfragen", color: "#8b5cf6" },
      { id: "3", name: "Facility", color: "#22c55e" },
      { id: "4", name: "Finanzen", color: "#f59e0b" },
    ],
  });

  useEffect(() => {
    if (!loading) {
      setFormState(prev => ({
        ...prev,
        email_ticket_creation: getValue('email_ticket_creation', prev.email_ticket_creation),
        self_service_portal: getValue('self_service_portal', prev.self_service_portal),
        satisfaction_survey: getValue('satisfaction_survey', prev.satisfaction_survey),
        ticket_prefix: getValue('ticket_prefix', prev.ticket_prefix),
        default_priority: getValue('default_priority', prev.default_priority),
        sla_critical_response_hours: getValue('sla_critical_response_hours', prev.sla_critical_response_hours),
        sla_critical_resolution_hours: getValue('sla_critical_resolution_hours', prev.sla_critical_resolution_hours),
        sla_high_response_hours: getValue('sla_high_response_hours', prev.sla_high_response_hours),
        sla_high_resolution_hours: getValue('sla_high_resolution_hours', prev.sla_high_resolution_hours),
        sla_medium_response_hours: getValue('sla_medium_response_hours', prev.sla_medium_response_hours),
        sla_medium_resolution_hours: getValue('sla_medium_resolution_hours', prev.sla_medium_resolution_hours),
        auto_escalation: getValue('auto_escalation', prev.auto_escalation),
        manager_notification: getValue('manager_notification', prev.manager_notification),
        escalation_minutes_before_sla: getValue('escalation_minutes_before_sla', prev.escalation_minutes_before_sla),
        auto_assignment: getValue('auto_assignment', prev.auto_assignment),
        assignment_method: getValue('assignment_method', prev.assignment_method),
        consider_availability: getValue('consider_availability', prev.consider_availability),
        categories: getValue('categories', prev.categories),
      }));
    }
  }, [loading, getValue]);

  const updateFormState = (key: keyof HelpdeskFormState, value: any) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const updateCategory = (id: string, field: 'name' | 'color', value: string) => {
    setFormState(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.id === id ? { ...cat, [field]: value } : cat
      ),
    }));
  };

  const addCategory = () => {
    const newId = String(Date.now());
    setFormState(prev => ({
      ...prev,
      categories: [...prev.categories, { id: newId, name: "Neue Kategorie", color: "#6b7280" }],
    }));
  };

  const removeCategory = (id: string) => {
    setFormState(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== id),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings(formState);
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Helpdesk-Einstellungen wurden erfolgreich aktualisiert.",
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
            <h1 className="text-2xl font-semibold">Helpdesk-Einstellungen</h1>
            <p className="text-sm text-muted-foreground">Konfigurieren Sie Tickets, SLAs und Eskalationen</p>
          </div>
        </div>
        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              Konfiguration
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tags className="h-4 w-4" />
              Kategorien
            </TabsTrigger>
            <TabsTrigger value="sla" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              SLA
            </TabsTrigger>
            <TabsTrigger value="escalation" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Eskalation
            </TabsTrigger>
            <TabsTrigger value="assignment" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Zuweisung
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Allgemeine Helpdesk-Einstellungen</CardTitle>
                <CardDescription>Grundlegende Konfiguration für das Ticketsystem</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>E-Mail-Ticket-Erstellung</Label>
                    <p className="text-sm text-muted-foreground">Erstelle Tickets aus eingehenden E-Mails</p>
                  </div>
                  <Switch 
                    checked={formState.email_ticket_creation}
                    onCheckedChange={(checked) => updateFormState('email_ticket_creation', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Self-Service-Portal</Label>
                    <p className="text-sm text-muted-foreground">Mitarbeiter können Tickets selbst erstellen</p>
                  </div>
                  <Switch 
                    checked={formState.self_service_portal}
                    onCheckedChange={(checked) => updateFormState('self_service_portal', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Ticket-Zufriedenheitsumfrage</Label>
                    <p className="text-sm text-muted-foreground">Frage nach Abschluss nach Feedback</p>
                  </div>
                  <Switch 
                    checked={formState.satisfaction_survey}
                    onCheckedChange={(checked) => updateFormState('satisfaction_survey', checked)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ticket-Präfix</Label>
                    <Input 
                      value={formState.ticket_prefix}
                      onChange={(e) => updateFormState('ticket_prefix', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Standard-Priorität</Label>
                    <Select 
                      value={formState.default_priority}
                      onValueChange={(value) => updateFormState('default_priority', value)}
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ticket-Kategorien</CardTitle>
                <CardDescription>Verwalten Sie die verfügbaren Kategorien</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formState.categories.map((category) => (
                  <div key={category.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <Input 
                      type="color" 
                      value={category.color}
                      onChange={(e) => updateCategory(category.id, 'color', e.target.value)}
                      className="w-12 h-8 p-0 border-0"
                    />
                    <Input 
                      value={category.name} 
                      className="flex-1"
                      onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                    />
                    <Badge style={{ backgroundColor: category.color, color: "white" }}>{category.name}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => removeCategory(category.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={addCategory}>
                  <Plus className="h-4 w-4 mr-2" />
                  Kategorie hinzufügen
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sla" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SLA-Konfiguration</CardTitle>
                <CardDescription>Definieren Sie Service Level Agreements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kritisch - Erste Reaktion</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="number" 
                        value={formState.sla_critical_response_hours}
                        onChange={(e) => updateFormState('sla_critical_response_hours', parseInt(e.target.value) || 0)}
                      />
                      <span className="flex items-center text-sm text-muted-foreground">Stunden</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Kritisch - Lösung</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="number" 
                        value={formState.sla_critical_resolution_hours}
                        onChange={(e) => updateFormState('sla_critical_resolution_hours', parseInt(e.target.value) || 0)}
                      />
                      <span className="flex items-center text-sm text-muted-foreground">Stunden</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hoch - Erste Reaktion</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="number" 
                        value={formState.sla_high_response_hours}
                        onChange={(e) => updateFormState('sla_high_response_hours', parseInt(e.target.value) || 0)}
                      />
                      <span className="flex items-center text-sm text-muted-foreground">Stunden</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Hoch - Lösung</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="number" 
                        value={formState.sla_high_resolution_hours}
                        onChange={(e) => updateFormState('sla_high_resolution_hours', parseInt(e.target.value) || 0)}
                      />
                      <span className="flex items-center text-sm text-muted-foreground">Stunden</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mittel - Erste Reaktion</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="number" 
                        value={formState.sla_medium_response_hours}
                        onChange={(e) => updateFormState('sla_medium_response_hours', parseInt(e.target.value) || 0)}
                      />
                      <span className="flex items-center text-sm text-muted-foreground">Stunden</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Mittel - Lösung</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="number" 
                        value={formState.sla_medium_resolution_hours}
                        onChange={(e) => updateFormState('sla_medium_resolution_hours', parseInt(e.target.value) || 0)}
                      />
                      <span className="flex items-center text-sm text-muted-foreground">Stunden</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="escalation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Eskalationsregeln</CardTitle>
                <CardDescription>Konfigurieren Sie automatische Eskalationen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Eskalation aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Eskaliere bei SLA-Verletzung</p>
                  </div>
                  <Switch 
                    checked={formState.auto_escalation}
                    onCheckedChange={(checked) => updateFormState('auto_escalation', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Manager-Benachrichtigung</Label>
                    <p className="text-sm text-muted-foreground">Informiere Manager bei Eskalation</p>
                  </div>
                  <Switch 
                    checked={formState.manager_notification}
                    onCheckedChange={(checked) => updateFormState('manager_notification', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Eskalation nach (Minuten vor SLA-Ende)</Label>
                  <Input 
                    type="number" 
                    value={formState.escalation_minutes_before_sla}
                    onChange={(e) => updateFormState('escalation_minutes_before_sla', parseInt(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Auto-Zuweisung</CardTitle>
                <CardDescription>Konfigurieren Sie die automatische Ticket-Zuweisung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Zuweisung aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Weise Tickets automatisch zu</p>
                  </div>
                  <Switch 
                    checked={formState.auto_assignment}
                    onCheckedChange={(checked) => updateFormState('auto_assignment', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Zuweisungsmethode</Label>
                  <Select 
                    value={formState.assignment_method}
                    onValueChange={(value) => updateFormState('assignment_method', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round-robin">Round Robin</SelectItem>
                      <SelectItem value="least-busy">Niedrigste Auslastung</SelectItem>
                      <SelectItem value="skill-based">Skill-basiert</SelectItem>
                      <SelectItem value="random">Zufällig</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Verfügbarkeit berücksichtigen</Label>
                    <p className="text-sm text-muted-foreground">Ignoriere abwesende Mitarbeiter</p>
                  </div>
                  <Switch 
                    checked={formState.consider_availability}
                    onCheckedChange={(checked) => updateFormState('consider_availability', checked)}
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
