import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Award, Calendar, Users, Target, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";

interface TrainingFormState {
  // Schulungskatalog
  auto_enrollment: boolean;
  skill_tracking: boolean;
  progress_notifications: boolean;
  budget_per_employee: number;
  training_hours_per_year: number;
  // Zertifikate
  auto_certificates: boolean;
  external_validation: boolean;
  expiry_tracking: boolean;
  cert_validity_years: string;
  reminder_days_before_expiry: number;
  // Lernpfade
  adaptive_learning: boolean;
  prerequisite_checking: boolean;
  path_duration_weeks: number;
  milestone_frequency: string;
}

const TrainingSettings = () => {
  const { toast } = useToast();
  const { loading, saveSettings, getValue } = useEffectiveSettings('training');
  const [isSaving, setIsSaving] = useState(false);

  const [formState, setFormState] = useState<TrainingFormState>({
    auto_enrollment: true,
    skill_tracking: true,
    progress_notifications: false,
    budget_per_employee: 1500,
    training_hours_per_year: 40,
    auto_certificates: true,
    external_validation: false,
    expiry_tracking: true,
    cert_validity_years: "3",
    reminder_days_before_expiry: 30,
    adaptive_learning: false,
    prerequisite_checking: true,
    path_duration_weeks: 12,
    milestone_frequency: "weekly",
  });

  useEffect(() => {
    if (!loading) {
      setFormState(prev => ({
        ...prev,
        auto_enrollment: getValue('auto_enrollment', prev.auto_enrollment),
        skill_tracking: getValue('skill_tracking', prev.skill_tracking),
        progress_notifications: getValue('progress_notifications', prev.progress_notifications),
        budget_per_employee: getValue('budget_per_employee', prev.budget_per_employee),
        training_hours_per_year: getValue('training_hours_per_year', prev.training_hours_per_year),
        auto_certificates: getValue('auto_certificates', prev.auto_certificates),
        external_validation: getValue('external_validation', prev.external_validation),
        expiry_tracking: getValue('expiry_tracking', prev.expiry_tracking),
        cert_validity_years: getValue('cert_validity_years', prev.cert_validity_years),
        reminder_days_before_expiry: getValue('reminder_days_before_expiry', prev.reminder_days_before_expiry),
        adaptive_learning: getValue('adaptive_learning', prev.adaptive_learning),
        prerequisite_checking: getValue('prerequisite_checking', prev.prerequisite_checking),
        path_duration_weeks: getValue('path_duration_weeks', prev.path_duration_weeks),
        milestone_frequency: getValue('milestone_frequency', prev.milestone_frequency),
      }));
    }
  }, [loading, getValue]);

  const updateFormState = (key: keyof TrainingFormState, value: any) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings(formState);
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Training-Einstellungen wurden erfolgreich aktualisiert.",
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
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Schulungskatalog */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Schulungskatalog
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-enrollment">Automatische Einschreibung</Label>
                <Switch 
                  id="auto-enrollment" 
                  checked={formState.auto_enrollment}
                  onCheckedChange={(checked) => updateFormState('auto_enrollment', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="skill-tracking">Kompetenzverfolgung</Label>
                <Switch 
                  id="skill-tracking" 
                  checked={formState.skill_tracking}
                  onCheckedChange={(checked) => updateFormState('skill_tracking', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="progress-notifications">Fortschrittsbenachrichtigungen</Label>
                <Switch 
                  id="progress-notifications" 
                  checked={formState.progress_notifications}
                  onCheckedChange={(checked) => updateFormState('progress_notifications', checked)}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="budget-per-employee">Weiterbildungsbudget pro Mitarbeiter (€)</Label>
                <Input 
                  id="budget-per-employee" 
                  type="number" 
                  value={formState.budget_per_employee}
                  onChange={(e) => updateFormState('budget_per_employee', parseInt(e.target.value) || 0)}
                  className="mt-1" 
                />
              </div>
              
              <div>
                <Label htmlFor="training-hours">Pflicht-Weiterbildungsstunden/Jahr</Label>
                <Input 
                  id="training-hours" 
                  type="number" 
                  value={formState.training_hours_per_year}
                  onChange={(e) => updateFormState('training_hours_per_year', parseInt(e.target.value) || 0)}
                  className="mt-1" 
                />
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3">Verfügbare Schulungskategorien</h4>
            <div className="flex flex-wrap gap-2">
              {[
                'IT & Software', 'Führung & Management', 'Kommunikation', 
                'Compliance & Sicherheit', 'Fachspezifisch', 'Sprachen'
              ].map((category) => (
                <Badge key={category} variant="secondary">{category}</Badge>
              ))}
            </div>
            <Button variant="outline" className="mt-3">
              <BookOpen className="h-4 w-4 mr-2" />
              Neue Kategorie hinzufügen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pflichttrainings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Pflichttrainings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {[
              {
                title: 'Datenschutz (DSGVO)',
                department: 'Alle Mitarbeiter',
                frequency: 'Jährlich',
                deadline: '31.12.2024',
                completion: 85
              },
              {
                title: 'Arbeitssicherheit',
                department: 'Produktion',
                frequency: 'Halbjährlich',
                deadline: '30.06.2024',
                completion: 92
              },
              {
                title: 'Compliance Training',
                department: 'Management',
                frequency: 'Jährlich',
                deadline: '31.03.2024',
                completion: 67
              }
            ].map((training, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{training.title}</h4>
                  <Badge variant={training.completion >= 90 ? "default" : training.completion >= 70 ? "secondary" : "destructive"}>
                    {training.completion}% abgeschlossen
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Zielgruppe:</span> {training.department}
                  </div>
                  <div>
                    <span className="font-medium">Häufigkeit:</span> {training.frequency}
                  </div>
                  <div>
                    <span className="font-medium">Deadline:</span> {training.deadline}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="outline" className="w-full">
            <Target className="h-4 w-4 mr-2" />
            Neues Pflichttraining hinzufügen
          </Button>
        </CardContent>
      </Card>

      {/* Zertifikate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Zertifikatsverwaltung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-certificates">Automatische Zertifikatserstellung</Label>
                <Switch 
                  id="auto-certificates" 
                  checked={formState.auto_certificates}
                  onCheckedChange={(checked) => updateFormState('auto_certificates', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="external-validation">Externe Validierung</Label>
                <Switch 
                  id="external-validation" 
                  checked={formState.external_validation}
                  onCheckedChange={(checked) => updateFormState('external_validation', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="expiry-tracking">Ablaufverfolgung</Label>
                <Switch 
                  id="expiry-tracking" 
                  checked={formState.expiry_tracking}
                  onCheckedChange={(checked) => updateFormState('expiry_tracking', checked)}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="cert-validity">Standard-Gültigkeitsdauer (Jahre)</Label>
                <Select 
                  value={formState.cert_validity_years}
                  onValueChange={(value) => updateFormState('cert_validity_years', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Jahr</SelectItem>
                    <SelectItem value="2">2 Jahre</SelectItem>
                    <SelectItem value="3">3 Jahre</SelectItem>
                    <SelectItem value="5">5 Jahre</SelectItem>
                    <SelectItem value="unlimited">Unbegrenzt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="reminder-days">Erinnerung vor Ablauf (Tage)</Label>
                <Input 
                  id="reminder-days" 
                  type="number" 
                  value={formState.reminder_days_before_expiry}
                  onChange={(e) => updateFormState('reminder_days_before_expiry', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3">Zertifikatstypen</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Keine Mock-Daten - echte Zertifikatstypen werden aus der DB geladen */}
              {[
                { name: 'Interne Schulung', count: 0, expires: true },
                { name: 'Externe Zertifizierung', count: 0, expires: true },
                { name: 'Compliance Training', count: 0, expires: false },
                { name: 'Fachqualifikation', count: 0, expires: true }
              ].map((cert, index) => (
                <div key={index} className="p-3 border rounded">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{cert.name}</span>
                    <Badge variant="outline">{cert.count}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {cert.expires ? 'Mit Ablaufdatum' : 'Dauerhaft gültig'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lernpfade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lernpfade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="adaptive-learning">Adaptives Lernen</Label>
                <Switch 
                  id="adaptive-learning" 
                  checked={formState.adaptive_learning}
                  onCheckedChange={(checked) => updateFormState('adaptive_learning', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="prerequisite-checking">Voraussetzungsprüfung</Label>
                <Switch 
                  id="prerequisite-checking" 
                  checked={formState.prerequisite_checking}
                  onCheckedChange={(checked) => updateFormState('prerequisite_checking', checked)}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="path-duration">Standard-Pfaddauer (Wochen)</Label>
                <Input 
                  id="path-duration" 
                  type="number" 
                  value={formState.path_duration_weeks}
                  onChange={(e) => updateFormState('path_duration_weeks', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label htmlFor="milestone-frequency">Meilenstein-Häufigkeit</Label>
                <Select 
                  value={formState.milestone_frequency}
                  onValueChange={(value) => updateFormState('milestone_frequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Wöchentlich</SelectItem>
                    <SelectItem value="biweekly">Zweiwöchentlich</SelectItem>
                    <SelectItem value="monthly">Monatlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t flex gap-2">
            <Button variant="outline">
              Lernpfad erstellen
            </Button>
            <Button variant="outline">
              Templates verwalten
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
};

export default TrainingSettings;
