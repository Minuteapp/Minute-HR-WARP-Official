import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserX, FileText, MessageSquare, Package, BookOpen, Plus, ChevronLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";

interface OffboardingFormState {
  // Exit-Interviews
  exit_interviews_enabled: boolean;
  anonymous_feedback: boolean;
  interview_days_before: number;
  
  // Rückgabe-Prozess
  auto_return_checklist: boolean;
  auto_disable_access: boolean;
  badge_deactivation: boolean;
  
  // Wissenstransfer
  knowledge_transfer_required: boolean;
  handover_days: number;
  successor_assignment: boolean;
}

export default function OffboardingSettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings, loading, isSaving, getValue, saveSettings } = useEffectiveSettings('offboarding');
  
  const [formState, setFormState] = useState<OffboardingFormState>({
    // Exit-Interviews
    exit_interviews_enabled: true,
    anonymous_feedback: true,
    interview_days_before: 7,
    
    // Rückgabe-Prozess
    auto_return_checklist: true,
    auto_disable_access: true,
    badge_deactivation: true,
    
    // Wissenstransfer
    knowledge_transfer_required: true,
    handover_days: 14,
    successor_assignment: true,
  });

  // Sync form state with settings from database
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormState(prev => ({
        ...prev,
        exit_interviews_enabled: getValue('exit_interviews_enabled', prev.exit_interviews_enabled),
        anonymous_feedback: getValue('anonymous_feedback', prev.anonymous_feedback),
        interview_days_before: getValue('interview_days_before', prev.interview_days_before),
        auto_return_checklist: getValue('auto_return_checklist', prev.auto_return_checklist),
        auto_disable_access: getValue('auto_disable_access', prev.auto_disable_access),
        badge_deactivation: getValue('badge_deactivation', prev.badge_deactivation),
        knowledge_transfer_required: getValue('knowledge_transfer_required', prev.knowledge_transfer_required),
        handover_days: getValue('handover_days', prev.handover_days),
        successor_assignment: getValue('successor_assignment', prev.successor_assignment),
      }));
    }
  }, [settings, getValue]);

  const updateFormField = <K extends keyof OffboardingFormState>(field: K, value: OffboardingFormState[K]) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const success = await saveSettings(formState);
      if (success) {
        toast({
          title: "Einstellungen gespeichert",
          description: "Die Offboarding-Einstellungen wurden erfolgreich aktualisiert.",
        });
      } else {
        toast({
          title: "Fehler beim Speichern",
          description: "Die Einstellungen konnten nicht gespeichert werden.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving offboarding settings:', error);
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
            <h1 className="text-2xl font-semibold">Offboarding-Einstellungen</h1>
            <p className="text-sm text-muted-foreground">Konfigurieren Sie Exit-Prozesse und Übergaben</p>
          </div>
        </div>
        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Vorlagen
            </TabsTrigger>
            <TabsTrigger value="exit" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Exit-Interviews
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Rückgabe
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Wissenstransfer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Offboarding-Vorlagen</CardTitle>
                <CardDescription>Standardprozesse für verschiedene Austrittsarten</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Noch keine Vorlagen erstellt</p>
                  <Button variant="outline" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Vorlage erstellen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Exit-Interview-Einstellungen</CardTitle>
                <CardDescription>Konfiguration für Austrittsgespräche</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Exit-Interviews aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Automatisch Gespräch einplanen</p>
                  </div>
                  <Switch 
                    checked={formState.exit_interviews_enabled}
                    onCheckedChange={(v) => updateFormField('exit_interviews_enabled', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Anonyme Rückmeldung</Label>
                    <p className="text-sm text-muted-foreground">Optionales anonymes Feedback</p>
                  </div>
                  <Switch 
                    checked={formState.anonymous_feedback}
                    onCheckedChange={(v) => updateFormField('anonymous_feedback', v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Interview-Zeitpunkt (Tage vor Austritt)</Label>
                  <Input 
                    type="number" 
                    value={formState.interview_days_before}
                    onChange={(e) => updateFormField('interview_days_before', parseInt(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rückgabe-Prozess</CardTitle>
                <CardDescription>Equipment und Zugänge</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Rückgabe-Checkliste</Label>
                    <p className="text-sm text-muted-foreground">Basierend auf zugewiesenen Assets</p>
                  </div>
                  <Switch 
                    checked={formState.auto_return_checklist}
                    onCheckedChange={(v) => updateFormField('auto_return_checklist', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>IT-Zugänge automatisch sperren</Label>
                    <p className="text-sm text-muted-foreground">Am letzten Arbeitstag</p>
                  </div>
                  <Switch 
                    checked={formState.auto_disable_access}
                    onCheckedChange={(v) => updateFormField('auto_disable_access', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Badge-Deaktivierung</Label>
                    <p className="text-sm text-muted-foreground">Zutrittskarten automatisch sperren</p>
                  </div>
                  <Switch 
                    checked={formState.badge_deactivation}
                    onCheckedChange={(v) => updateFormField('badge_deactivation', v)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Wissenstransfer</CardTitle>
                <CardDescription>Übergabe von Wissen und Verantwortlichkeiten</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Wissenstransfer erforderlich</Label>
                    <p className="text-sm text-muted-foreground">Dokumentation vor Austritt</p>
                  </div>
                  <Switch 
                    checked={formState.knowledge_transfer_required}
                    onCheckedChange={(v) => updateFormField('knowledge_transfer_required', v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vorlaufzeit für Übergabe (Tage)</Label>
                  <Input 
                    type="number" 
                    value={formState.handover_days}
                    onChange={(e) => updateFormField('handover_days', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Nachfolger-Zuweisung</Label>
                    <p className="text-sm text-muted-foreground">Verantwortlichkeiten übertragen</p>
                  </div>
                  <Switch 
                    checked={formState.successor_assignment}
                    onCheckedChange={(v) => updateFormField('successor_assignment', v)}
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
