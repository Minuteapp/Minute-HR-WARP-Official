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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Power, RefreshCw, FileEdit, Vote, Trophy, Rocket, Brain, Shield, BarChart3,
  Plus, ChevronLeft, Save, Trash2, Edit, GripVertical, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  useInnovationHubSettings, 
  useUpdateInnovationHubSettings,
  useInnovationChallenges,
  useCreateInnovationChallenge,
  useUpdateInnovationChallenge,
  useDeleteInnovationChallenge,
  useInnovationEvaluationCriteria,
  useCreateEvaluationCriterion,
  useUpdateEvaluationCriterion,
  useDeleteEvaluationCriterion,
  useInnovationPermissions,
  useUpsertInnovationPermission
} from "@/hooks/useInnovationSettings";
import type { 
  InnovationHubSettings, 
  InnovationChallenge, 
  InnovationEvaluationCriterion, 
  InnovationPermission 
} from "@/types/innovation-settings";
import { defaultInnovationHubSettings, innovationRoleLabels } from "@/types/innovation-settings";

const ideaTypes = [
  { key: 'open_ideas', label: 'Offene Ideen' },
  { key: 'strategic', label: 'Strategische Initiativen' },
  { key: 'process', label: 'Prozessverbesserungen' },
  { key: 'product', label: 'Produkt-/Service-Ideen' },
  { key: 'esg', label: 'ESG- & Nachhaltigkeitsideen' }
];

export default function InnovationSettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Hooks for data fetching
  const { data: settings, isLoading: isLoadingSettings } = useInnovationHubSettings();
  const { data: challenges = [], isLoading: isLoadingChallenges } = useInnovationChallenges();
  const { data: criteria = [], isLoading: isLoadingCriteria } = useInnovationEvaluationCriteria();
  const { data: permissions = [], isLoading: isLoadingPermissions } = useInnovationPermissions();
  
  // Mutations
  const updateSettings = useUpdateInnovationHubSettings();
  const createChallenge = useCreateInnovationChallenge();
  const updateChallengeMutation = useUpdateInnovationChallenge();
  const deleteChallengeMutation = useDeleteInnovationChallenge();
  const createCriteria = useCreateEvaluationCriterion();
  const updateCriteriaMutation = useUpdateEvaluationCriterion();
  const deleteCriteriaMutation = useDeleteEvaluationCriterion();
  const upsertPermission = useUpsertInnovationPermission();

  const [formData, setFormData] = useState<Partial<InnovationHubSettings>>(defaultInnovationHubSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<InnovationChallenge | null>(null);
  const [criteriaDialogOpen, setCriteriaDialogOpen] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<InnovationEvaluationCriterion | null>(null);
  const [localPermissions, setLocalPermissions] = useState<Partial<InnovationPermission>[]>([]);

  const isLoading = isLoadingSettings || isLoadingChallenges || isLoadingCriteria || isLoadingPermissions;

  useEffect(() => {
    if (settings) {
      setFormData({ ...defaultInnovationHubSettings, ...settings });
    }
  }, [settings]);

  useEffect(() => {
    if (permissions.length > 0) {
      setLocalPermissions(permissions);
    } else {
      // Initialize default permissions
      setLocalPermissions([
        { role_type: 'employee', can_submit: true, can_comment: true, can_view_all: false, can_vote: true, can_evaluate: false, can_decide: false, can_manage_challenges: false, can_configure: false, can_export: false, can_audit: false },
        { role_type: 'team_lead', can_submit: true, can_comment: true, can_view_all: true, can_vote: true, can_evaluate: true, can_decide: false, can_manage_challenges: false, can_configure: false, can_export: true, can_audit: false },
        { role_type: 'innovation_board', can_submit: true, can_comment: true, can_view_all: true, can_vote: true, can_evaluate: true, can_decide: true, can_manage_challenges: true, can_configure: false, can_export: true, can_audit: true },
        { role_type: 'hr', can_submit: true, can_comment: true, can_view_all: true, can_vote: true, can_evaluate: true, can_decide: false, can_manage_challenges: true, can_configure: true, can_export: true, can_audit: true },
        { role_type: 'admin', can_submit: true, can_comment: true, can_view_all: true, can_vote: true, can_evaluate: true, can_decide: true, can_manage_challenges: true, can_configure: true, can_export: true, can_audit: true },
        { role_type: 'superadmin', can_submit: true, can_comment: true, can_view_all: true, can_vote: true, can_evaluate: true, can_decide: true, can_manage_challenges: true, can_configure: true, can_export: true, can_audit: true }
      ]);
    }
  }, [permissions]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings.mutateAsync({ id: settings?.id, settings: formData });
      // Save permissions
      for (const perm of localPermissions) {
        if (perm.role_type) {
          await upsertPermission.mutateAsync(perm);
        }
      }
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Innovation-Einstellungen wurden erfolgreich aktualisiert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleIdeaTypeToggle = (key: string) => {
    const current = formData.enabled_idea_types || [];
    if (current.includes(key)) {
      setFormData({ ...formData, enabled_idea_types: current.filter(t => t !== key) });
    } else {
      setFormData({ ...formData, enabled_idea_types: [...current, key] });
    }
  };

  const handleSaveChallenge = async (challenge: Partial<InnovationChallenge>) => {
    try {
      if (editingChallenge?.id) {
        await updateChallengeMutation.mutateAsync({ id: editingChallenge.id, challenge });
      } else {
        await createChallenge.mutateAsync(challenge);
      }
      setChallengeDialogOpen(false);
      setEditingChallenge(null);
      toast({ title: "Challenge gespeichert" });
    } catch (error) {
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  const handleDeleteChallenge = async (id: string) => {
    try {
      await deleteChallengeMutation.mutateAsync(id);
      toast({ title: "Challenge gelöscht" });
    } catch (error) {
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  const handleSaveCriteria = async (criteriaData: Partial<InnovationEvaluationCriterion>) => {
    try {
      if (editingCriteria?.id) {
        await updateCriteriaMutation.mutateAsync({ id: editingCriteria.id, criterion: criteriaData });
      } else {
        await createCriteria.mutateAsync(criteriaData);
      }
      setCriteriaDialogOpen(false);
      setEditingCriteria(null);
      toast({ title: "Bewertungskriterium gespeichert" });
    } catch (error) {
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  const handleDeleteCriteria = async (id: string) => {
    try {
      await deleteCriteriaMutation.mutateAsync(id);
      toast({ title: "Kriterium gelöscht" });
    } catch (error) {
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  const updatePermission = (roleType: string, field: keyof InnovationPermission, value: boolean) => {
    setLocalPermissions(prev => 
      prev.map(p => p.role_type === roleType ? { ...p, [field]: value } : p)
    );
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
              <h1 className="text-2xl font-semibold">Innovation-Einstellungen</h1>
              <p className="text-sm text-muted-foreground">Enterprise Innovationsmanagement & Governance</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Speichern
          </Button>
        </div>

        <Tabs defaultValue="activation" className="space-y-6">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-auto min-w-full">
              <TabsTrigger value="activation" className="flex items-center gap-2">
                <Power className="h-4 w-4" />
                Aktivierung
              </TabsTrigger>
              <TabsTrigger value="lifecycle" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Lifecycle
              </TabsTrigger>
              <TabsTrigger value="submission" className="flex items-center gap-2">
                <FileEdit className="h-4 w-4" />
                Einreichung
              </TabsTrigger>
              <TabsTrigger value="evaluation" className="flex items-center gap-2">
                <Vote className="h-4 w-4" />
                Bewertung
              </TabsTrigger>
              <TabsTrigger value="challenges" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Challenges
              </TabsTrigger>
              <TabsTrigger value="implementation" className="flex items-center gap-2">
                <Rocket className="h-4 w-4" />
                Umsetzung
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                KI
              </TabsTrigger>
              <TabsTrigger value="permissions" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Rechte
              </TabsTrigger>
              <TabsTrigger value="reporting" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Reporting
              </TabsTrigger>
            </TabsList>
          </ScrollArea>

          {/* Tab 1: Aktivierung */}
          <TabsContent value="activation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Innovation Hub Aktivierung</CardTitle>
                <CardDescription>Grundeinstellungen für das Innovationsmanagement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Innovation Hub aktiv</Label>
                    <p className="text-sm text-muted-foreground">Aktiviert das gesamte Innovationsmanagement</p>
                  </div>
                  <Switch 
                    checked={formData.hub_enabled} 
                    onCheckedChange={(checked) => setFormData({ ...formData, hub_enabled: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gültigkeitsbereich</Label>
                  <Select 
                    value={formData.scope} 
                    onValueChange={(value: 'company' | 'subsidiaries' | 'locations') => setFormData({ ...formData, scope: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company">Gesamtes Unternehmen</SelectItem>
                      <SelectItem value="subsidiaries">Einzelne Gesellschaften</SelectItem>
                      <SelectItem value="locations">Ausgewählte Standorte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Aktivierte Innovationsarten</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {ideaTypes.map((type) => (
                      <div key={type.key} className="flex items-center space-x-2">
                        <Checkbox 
                          id={type.key}
                          checked={formData.enabled_idea_types?.includes(type.key)}
                          onCheckedChange={() => handleIdeaTypeToggle(type.key)}
                        />
                        <Label htmlFor={type.key} className="font-normal">{type.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Lifecycle */}
          <TabsContent value="lifecycle" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status-Modell & Lifecycle</CardTitle>
                <CardDescription>Konfigurieren Sie den Ideen-Lebenszyklus</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Status-Modell</Label>
                  <div className="flex flex-wrap gap-2">
                    {(formData.status_model as any[])?.map((status, idx) => (
                      <Badge key={idx} variant="outline" className="flex items-center gap-1">
                        <GripVertical className="h-3 w-3 cursor-move" />
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                        {status.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Pflicht-Statusreihenfolge</Label>
                    <p className="text-sm text-muted-foreground">Status muss der Reihenfolge folgen</p>
                  </div>
                  <Switch 
                    checked={formData.require_status_order} 
                    onCheckedChange={(checked) => setFormData({ ...formData, require_status_order: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mindestverweildauer pro Status (Tage)</Label>
                  <Input 
                    type="number" 
                    value={formData.min_days_per_status} 
                    onChange={(e) => setFormData({ ...formData, min_days_per_status: parseInt(e.target.value) })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Einreichung */}
          <TabsContent value="submission" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Einreichungsregeln</CardTitle>
                <CardDescription>Wer darf Ideen einreichen und welche Felder sind erforderlich</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Wer darf Ideen einreichen</Label>
                  <Select 
                    value={(formData.submission_roles as string[])?.[0] || 'all'}
                    onValueChange={(value) => setFormData({ ...formData, submission_roles: [value] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Mitarbeitenden</SelectItem>
                      <SelectItem value="selected_roles">Ausgewählte Rollen</SelectItem>
                      <SelectItem value="teams">Bestimmte Teams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Pflichtfelder</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {['title', 'description', 'category', 'benefit', 'effort', 'attachments'].map((field) => (
                      <div key={field} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`field-${field}`}
                          checked={(formData.required_fields as string[])?.includes(field)}
                          onCheckedChange={(checked) => {
                            const current = formData.required_fields as string[] || [];
                            setFormData({
                              ...formData,
                              required_fields: checked 
                                ? [...current, field]
                                : current.filter(f => f !== field)
                            });
                          }}
                        />
                        <Label htmlFor={`field-${field}`} className="font-normal capitalize">{field}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Anonyme Einreichung erlaubt</Label>
                    <p className="text-sm text-muted-foreground">Mitarbeiter können anonym einreichen</p>
                  </div>
                  <Switch 
                    checked={formData.allow_anonymous} 
                    onCheckedChange={(checked) => setFormData({ ...formData, allow_anonymous: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Team-Einreichungen erlaubt</Label>
                    <p className="text-sm text-muted-foreground">Ideen können als Team eingereicht werden</p>
                  </div>
                  <Switch 
                    checked={formData.allow_team_submissions} 
                    onCheckedChange={(checked) => setFormData({ ...formData, allow_team_submissions: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Anhänge erlaubt</Label>
                    <p className="text-sm text-muted-foreground">Dateien können angehängt werden</p>
                  </div>
                  <Switch 
                    checked={formData.allow_attachments} 
                    onCheckedChange={(checked) => setFormData({ ...formData, allow_attachments: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Bewertung */}
          <TabsContent value="evaluation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bewertungsmodell</CardTitle>
                <CardDescription>Konfigurieren Sie die Ideenbewertung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Bewertungsmodell</Label>
                  <Select 
                    value={formData.evaluation_model}
                    onValueChange={(value: 'points' | 'voting' | 'expert' | 'ai' | 'combined') => setFormData({ ...formData, evaluation_model: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="points">Punktebewertung</SelectItem>
                      <SelectItem value="voting">Voting (Likes/Stimmen)</SelectItem>
                      <SelectItem value="expert">Expertenbewertung</SelectItem>
                      <SelectItem value="ai">KI-Bewertung</SelectItem>
                      <SelectItem value="combined">Kombiniert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Mindestscore für Genehmigung (%)</Label>
                  <Input 
                    type="number" 
                    value={formData.min_score_for_approval} 
                    onChange={(e) => setFormData({ ...formData, min_score_for_approval: parseInt(e.target.value) })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>KI-Vorbewertung aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Automatische Erstbewertung durch KI</p>
                  </div>
                  <Switch 
                    checked={formData.ai_pre_evaluation} 
                    onCheckedChange={(checked) => setFormData({ ...formData, ai_pre_evaluation: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Bewertungskriterien</CardTitle>
                  <CardDescription>Kriterien für die Ideenbewertung</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setEditingCriteria(null); setCriteriaDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Kriterium hinzufügen
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Gewichtung</TableHead>
                      <TableHead>Skala</TableHead>
                      <TableHead>Aktiv</TableHead>
                      <TableHead className="w-[100px]">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {criteria.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>{c.weight}%</TableCell>
                        <TableCell>{c.scale_min} - {c.scale_max}</TableCell>
                        <TableCell>
                          <Badge variant={c.is_active ? "default" : "secondary"}>
                            {c.is_active ? "Aktiv" : "Inaktiv"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => { setEditingCriteria(c); setCriteriaDialogOpen(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteCriteria(c.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: Challenges */}
          <TabsContent value="challenges" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Innovation Challenges</CardTitle>
                  <CardDescription>Wettbewerbe und Herausforderungen verwalten</CardDescription>
                </div>
                <Button onClick={() => { setEditingChallenge(null); setChallengeDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Challenge erstellen
                </Button>
              </CardHeader>
              <CardContent>
                {challenges.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Noch keine Challenges erstellt</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titel</TableHead>
                        <TableHead>Zeitraum</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Belohnung</TableHead>
                        <TableHead className="w-[100px]">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {challenges.map((challenge) => (
                        <TableRow key={challenge.id}>
                          <TableCell className="font-medium">{challenge.title}</TableCell>
                          <TableCell>{challenge.start_date} - {challenge.end_date}</TableCell>
                          <TableCell>
                            <Badge variant={challenge.status === 'active' ? "default" : "secondary"}>
                              {challenge.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{challenge.reward_description || '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => { setEditingChallenge(challenge); setChallengeDialogOpen(true); }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteChallenge(challenge.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 6: Umsetzung */}
          <TabsContent value="implementation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Umsetzung & Übergabe</CardTitle>
                <CardDescription>Automatische Aktionen bei genehmigten Ideen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatisch Projekt erstellen</Label>
                    <p className="text-sm text-muted-foreground">Genehmigte Idee wird zum Projekt</p>
                  </div>
                  <Switch 
                    checked={formData.auto_create_project} 
                    onCheckedChange={(checked) => setFormData({ ...formData, auto_create_project: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatisch Aufgaben generieren</Label>
                    <p className="text-sm text-muted-foreground">Standard-Aufgaben werden erstellt</p>
                  </div>
                  <Switch 
                    checked={formData.auto_create_tasks} 
                    onCheckedChange={(checked) => setFormData({ ...formData, auto_create_tasks: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Budgetfreigabe erforderlich</Label>
                    <p className="text-sm text-muted-foreground">Budget muss separat genehmigt werden</p>
                  </div>
                  <Switch 
                    checked={formData.require_budget_approval} 
                    onCheckedChange={(checked) => setFormData({ ...formData, require_budget_approval: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Verantwortliche automatisch zuweisen</Label>
                    <p className="text-sm text-muted-foreground">Basierend auf Ideen-Einreicher</p>
                  </div>
                  <Switch 
                    checked={formData.auto_assign_responsible} 
                    onCheckedChange={(checked) => setFormData({ ...formData, auto_assign_responsible: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 7: KI */}
          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>KI-Unterstützung</CardTitle>
                <CardDescription>Optionale KI-Features für das Innovationsmanagement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Clustering ähnlicher Ideen</Label>
                    <p className="text-sm text-muted-foreground">Automatisches Gruppieren verwandter Ideen</p>
                  </div>
                  <Switch 
                    checked={formData.ai_clustering} 
                    onCheckedChange={(checked) => setFormData({ ...formData, ai_clustering: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Duplikaterkennung</Label>
                    <p className="text-sm text-muted-foreground">Warnung bei ähnlichen bestehenden Ideen</p>
                  </div>
                  <Switch 
                    checked={formData.ai_duplicate_detection} 
                    onCheckedChange={(checked) => setFormData({ ...formData, ai_duplicate_detection: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Impact-Prognosen</Label>
                    <p className="text-sm text-muted-foreground">KI schätzt potentiellen Nutzen</p>
                  </div>
                  <Switch 
                    checked={formData.ai_impact_prediction} 
                    onCheckedChange={(checked) => setFormData({ ...formData, ai_impact_prediction: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 8: Rechte */}
          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Berechtigungsmatrix</CardTitle>
                <CardDescription>Rollenbasierte Zugriffsrechte für das Innovationsmanagement</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rolle</TableHead>
                      <TableHead className="text-center">Einreichen</TableHead>
                      <TableHead className="text-center">Kommentieren</TableHead>
                      <TableHead className="text-center">Bewerten</TableHead>
                      <TableHead className="text-center">Entscheiden</TableHead>
                      <TableHead className="text-center">Konfigurieren</TableHead>
                      <TableHead className="text-center">Exportieren</TableHead>
                      <TableHead className="text-center">Audit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localPermissions.map((perm) => (
                      <TableRow key={perm.role_type}>
                        <TableCell className="font-medium">{innovationRoleLabels[perm.role_type || ''] || perm.role_type}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox checked={perm.can_submit} onCheckedChange={(c) => updatePermission(perm.role_type || '', 'can_submit', !!c)} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox checked={perm.can_comment} onCheckedChange={(c) => updatePermission(perm.role_type || '', 'can_comment', !!c)} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox checked={perm.can_evaluate} onCheckedChange={(c) => updatePermission(perm.role_type || '', 'can_evaluate', !!c)} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox checked={perm.can_decide} onCheckedChange={(c) => updatePermission(perm.role_type || '', 'can_decide', !!c)} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox checked={perm.can_configure} onCheckedChange={(c) => updatePermission(perm.role_type || '', 'can_configure', !!c)} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox checked={perm.can_export} onCheckedChange={(c) => updatePermission(perm.role_type || '', 'can_export', !!c)} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox checked={perm.can_audit} onCheckedChange={(c) => updatePermission(perm.role_type || '', 'can_audit', !!c)} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 9: Reporting */}
          <TabsContent value="reporting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reporting & KPIs</CardTitle>
                <CardDescription>Konfigurieren Sie die Innovation-Metriken</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Anzahl Ideen</h4>
                    <p className="text-sm text-muted-foreground">Eingereichte Ideen pro Zeitraum</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Umsetzungsquote</h4>
                    <p className="text-sm text-muted-foreground">Anteil umgesetzter Ideen</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Time-to-Decision</h4>
                    <p className="text-sm text-muted-foreground">Durchschnittliche Entscheidungszeit</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Beteiligungsquote</h4>
                    <p className="text-sm text-muted-foreground">Anteil aktiver Mitarbeiter</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Challenge Dialog */}
        <Dialog open={challengeDialogOpen} onOpenChange={setChallengeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingChallenge ? 'Challenge bearbeiten' : 'Neue Challenge'}</DialogTitle>
              <DialogDescription>Erstellen Sie eine Innovation Challenge</DialogDescription>
            </DialogHeader>
            <ChallengeForm 
              challenge={editingChallenge}
              onSave={handleSaveChallenge}
              onCancel={() => setChallengeDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Criteria Dialog */}
        <Dialog open={criteriaDialogOpen} onOpenChange={setCriteriaDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCriteria ? 'Kriterium bearbeiten' : 'Neues Kriterium'}</DialogTitle>
              <DialogDescription>Bewertungskriterium konfigurieren</DialogDescription>
            </DialogHeader>
            <CriteriaForm 
              criteria={editingCriteria}
              onSave={handleSaveCriteria}
              onCancel={() => setCriteriaDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}

function ChallengeForm({ challenge, onSave, onCancel }: { challenge: InnovationChallenge | null; onSave: (c: Partial<InnovationChallenge>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState<Partial<InnovationChallenge>>(challenge || {
    title: '',
    description: '',
    goal: '',
    start_date: '',
    end_date: '',
    reward_type: 'recognition',
    reward_description: '',
    allow_multiple_submissions: true,
    allow_team_challenges: false,
    status: 'draft'
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Titel</Label>
        <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Beschreibung</Label>
        <Textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Startdatum</Label>
          <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Enddatum</Label>
          <Input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Belohnungstyp</Label>
        <Select 
          value={formData.reward_type || 'recognition'} 
          onValueChange={(v: 'monetary' | 'recognition' | 'time_off' | 'custom') => setFormData({ ...formData, reward_type: v })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="monetary">Monetär</SelectItem>
            <SelectItem value="recognition">Anerkennung</SelectItem>
            <SelectItem value="time_off">Freizeit</SelectItem>
            <SelectItem value="custom">Individuell</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Belohnung Beschreibung</Label>
        <Input value={formData.reward_description || ''} onChange={(e) => setFormData({ ...formData, reward_description: e.target.value })} />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Abbrechen</Button>
        <Button onClick={() => onSave(formData)}>Speichern</Button>
      </DialogFooter>
    </div>
  );
}

function CriteriaForm({ criteria, onSave, onCancel }: { criteria: InnovationEvaluationCriterion | null; onSave: (c: Partial<InnovationEvaluationCriterion>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState<Partial<InnovationEvaluationCriterion>>(criteria || {
    name: '',
    key: '',
    description: '',
    weight: 10,
    scale_min: 1,
    scale_max: 5,
    is_active: true,
    sort_order: 0
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })} />
      </div>
      <div className="space-y-2">
        <Label>Beschreibung</Label>
        <Textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Gewichtung (%)</Label>
          <Input type="number" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <Label>Skala Min</Label>
          <Input type="number" value={formData.scale_min} onChange={(e) => setFormData({ ...formData, scale_min: parseInt(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <Label>Skala Max</Label>
          <Input type="number" value={formData.scale_max} onChange={(e) => setFormData({ ...formData, scale_max: parseInt(e.target.value) })} />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="active" checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: !!c })} />
        <Label htmlFor="active">Aktiv</Label>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Abbrechen</Button>
        <Button onClick={() => onSave(formData)}>Speichern</Button>
      </DialogFooter>
    </div>
  );
}
