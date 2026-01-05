import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Target, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";

interface PerformanceFormState {
  // Zielmethoden
  goal_method: string;
  okr_enabled: boolean;
  smart_enabled: boolean;
  kpi_enabled: boolean;
  mbo_enabled: boolean;
  // Feedback
  feedback_360_enabled: boolean;
  anonymous_feedback: boolean;
  peer_feedback: boolean;
  // Check-ins
  checkin_enabled: boolean;
  checkin_frequency: string;
  checkin_reminder: boolean;
  // Reviews
  formal_review_enabled: boolean;
  formal_review_frequency: string;
  self_assessment: boolean;
  // Anreize
  bonus_tracking: boolean;
  development_opportunities: boolean;
  recognition_program: boolean;
}

export default function PerformanceSettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading, saveSettings, getValue } = useEffectiveSettings('performance');
  const [isSaving, setIsSaving] = useState(false);

  const [formState, setFormState] = useState<PerformanceFormState>({
    goal_method: 'okr',
    okr_enabled: true,
    smart_enabled: true,
    kpi_enabled: true,
    mbo_enabled: false,
    feedback_360_enabled: true,
    anonymous_feedback: false,
    peer_feedback: true,
    checkin_enabled: true,
    checkin_frequency: 'weekly',
    checkin_reminder: true,
    formal_review_enabled: true,
    formal_review_frequency: 'biannual',
    self_assessment: true,
    bonus_tracking: false,
    development_opportunities: true,
    recognition_program: true,
  });

  useEffect(() => {
    if (!loading) {
      setFormState(prev => ({
        ...prev,
        goal_method: getValue('goal_method', prev.goal_method),
        okr_enabled: getValue('okr_enabled', prev.okr_enabled),
        smart_enabled: getValue('smart_enabled', prev.smart_enabled),
        kpi_enabled: getValue('kpi_enabled', prev.kpi_enabled),
        mbo_enabled: getValue('mbo_enabled', prev.mbo_enabled),
        feedback_360_enabled: getValue('feedback_360_enabled', prev.feedback_360_enabled),
        anonymous_feedback: getValue('anonymous_feedback', prev.anonymous_feedback),
        peer_feedback: getValue('peer_feedback', prev.peer_feedback),
        checkin_enabled: getValue('checkin_enabled', prev.checkin_enabled),
        checkin_frequency: getValue('checkin_frequency', prev.checkin_frequency),
        checkin_reminder: getValue('checkin_reminder', prev.checkin_reminder),
        formal_review_enabled: getValue('formal_review_enabled', prev.formal_review_enabled),
        formal_review_frequency: getValue('formal_review_frequency', prev.formal_review_frequency),
        self_assessment: getValue('self_assessment', prev.self_assessment),
        bonus_tracking: getValue('bonus_tracking', prev.bonus_tracking),
        development_opportunities: getValue('development_opportunities', prev.development_opportunities),
        recognition_program: getValue('recognition_program', prev.recognition_program),
      }));
    }
  }, [loading, getValue]);

  const updateFormState = (key: keyof PerformanceFormState, value: any) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings(formState);
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Performance-Einstellungen wurden erfolgreich aktualisiert.",
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
      <div className="w-full p-6 flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate("/settings")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Ziel- & Performance-Management</h1>
        </div>
      </div>

      <Tabs defaultValue="goals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="goals">Zielmethoden</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="incentives">Anreize</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Zielmethoden
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Standard-Zielmethode</Label>
                <Select 
                  value={formState.goal_method}
                  onValueChange={(value) => updateFormState('goal_method', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="okr">OKR - Objectives & Key Results</SelectItem>
                    <SelectItem value="smart">SMART - Zielkriterien</SelectItem>
                    <SelectItem value="kpi">KPI - Key Performance Indicators</SelectItem>
                    <SelectItem value="mbo">MBO - Management by Objectives</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>OKR aktivieren</Label>
                      <p className="text-sm text-muted-foreground">Objectives & Key Results</p>
                    </div>
                    <Switch 
                      checked={formState.okr_enabled}
                      onCheckedChange={(checked) => updateFormState('okr_enabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMART aktivieren</Label>
                      <p className="text-sm text-muted-foreground">SMART-Zielkriterien</p>
                    </div>
                    <Switch 
                      checked={formState.smart_enabled}
                      onCheckedChange={(checked) => updateFormState('smart_enabled', checked)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>KPI aktivieren</Label>
                      <p className="text-sm text-muted-foreground">Key Performance Indicators</p>
                    </div>
                    <Switch 
                      checked={formState.kpi_enabled}
                      onCheckedChange={(checked) => updateFormState('kpi_enabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>MBO aktivieren</Label>
                      <p className="text-sm text-muted-foreground">Management by Objectives</p>
                    </div>
                    <Switch 
                      checked={formState.mbo_enabled}
                      onCheckedChange={(checked) => updateFormState('mbo_enabled', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feedback-Einstellungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>360° Feedback</Label>
                  <p className="text-sm text-muted-foreground">Umfassende Bewertung durch alle Ebenen</p>
                </div>
                <Switch 
                  checked={formState.feedback_360_enabled}
                  onCheckedChange={(checked) => updateFormState('feedback_360_enabled', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Anonymes Feedback</Label>
                  <p className="text-sm text-muted-foreground">Feedback kann anonym gegeben werden</p>
                </div>
                <Switch 
                  checked={formState.anonymous_feedback}
                  onCheckedChange={(checked) => updateFormState('anonymous_feedback', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Peer-Feedback</Label>
                  <p className="text-sm text-muted-foreground">Kollegen können Feedback geben</p>
                </div>
                <Switch 
                  checked={formState.peer_feedback}
                  onCheckedChange={(checked) => updateFormState('peer_feedback', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Check-ins</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Regelmäßige Check-ins</Label>
                  <p className="text-sm text-muted-foreground">Kurze Gespräche zum Fortschritt</p>
                </div>
                <Switch 
                  checked={formState.checkin_enabled}
                  onCheckedChange={(checked) => updateFormState('checkin_enabled', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label>Check-in Häufigkeit</Label>
                <Select 
                  value={formState.checkin_frequency}
                  onValueChange={(value) => updateFormState('checkin_frequency', value)}
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
              <div className="flex items-center justify-between">
                <div>
                  <Label>Check-in Erinnerungen</Label>
                  <p className="text-sm text-muted-foreground">Automatische Erinnerungen senden</p>
                </div>
                <Switch 
                  checked={formState.checkin_reminder}
                  onCheckedChange={(checked) => updateFormState('checkin_reminder', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Formale Beurteilungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Formale Reviews aktivieren</Label>
                  <p className="text-sm text-muted-foreground">Strukturierte Leistungsbeurteilungen</p>
                </div>
                <Switch 
                  checked={formState.formal_review_enabled}
                  onCheckedChange={(checked) => updateFormState('formal_review_enabled', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label>Review-Häufigkeit</Label>
                <Select 
                  value={formState.formal_review_frequency}
                  onValueChange={(value) => updateFormState('formal_review_frequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarterly">Vierteljährlich</SelectItem>
                    <SelectItem value="biannual">Halbjährlich</SelectItem>
                    <SelectItem value="annual">Jährlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Selbstbewertung</Label>
                  <p className="text-sm text-muted-foreground">Mitarbeiter bewerten sich selbst</p>
                </div>
                <Switch 
                  checked={formState.self_assessment}
                  onCheckedChange={(checked) => updateFormState('self_assessment', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incentives" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Anreizsysteme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Bonus-Tracking</Label>
                  <p className="text-sm text-muted-foreground">Bonuszahlungen und finanzielle Anreize</p>
                </div>
                <Switch 
                  checked={formState.bonus_tracking}
                  onCheckedChange={(checked) => updateFormState('bonus_tracking', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Entwicklungschancen</Label>
                  <p className="text-sm text-muted-foreground">Weiterbildung und Karrierepfade</p>
                </div>
                <Switch 
                  checked={formState.development_opportunities}
                  onCheckedChange={(checked) => updateFormState('development_opportunities', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Anerkennungsprogramm</Label>
                  <p className="text-sm text-muted-foreground">Öffentliche Anerkennung und Auszeichnungen</p>
                </div>
                <Switch 
                  checked={formState.recognition_program}
                  onCheckedChange={(checked) => updateFormState('recognition_program', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
}
