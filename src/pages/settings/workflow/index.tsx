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
  Settings, Layers, Play, Filter, UserCheck, Zap, AlertTriangle, Brain, 
  GitBranch, Shield, Activity, Plus, ChevronLeft, Save, Trash2, Edit, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  useWorkflowGlobalSettings,
  useUpdateWorkflowGlobalSettings,
  useWorkflowTriggers,
  useCreateWorkflowTrigger,
  useUpdateWorkflowTrigger,
  useDeleteWorkflowTrigger,
  useWorkflowConditions,
  useCreateWorkflowCondition,
  useDeleteWorkflowCondition,
  useWorkflowActions,
  useCreateWorkflowAction,
  useDeleteWorkflowAction,
  useWorkflowApproverRules,
  useCreateWorkflowApproverRule,
  useDeleteWorkflowApproverRule,
  useWorkflowPermissions,
  useUpsertWorkflowPermission
} from "@/hooks/useWorkflowSettings";
import type { 
  WorkflowGlobalSettings, 
  WorkflowTrigger, 
  WorkflowCondition, 
  WorkflowAction, 
  WorkflowApproverRule, 
  WorkflowPermission 
} from "@/types/workflow-settings";
import { 
  defaultWorkflowGlobalSettings, 
  workflowModuleLabels, 
  triggerEventLabels, 
  conditionTypeLabels, 
  actionTypeLabels, 
  approverTypeLabels,
  workflowRoleLabels
} from "@/types/workflow-settings";

const moduleOptions = Object.entries(workflowModuleLabels).map(([key, label]) => ({ key, label }));
const triggerEventOptions = Object.entries(triggerEventLabels).map(([key, label]) => ({ key, label }));
const conditionTypeOptions = Object.entries(conditionTypeLabels).map(([key, label]) => ({ key, label }));
const actionTypeOptions = Object.entries(actionTypeLabels).map(([key, label]) => ({ key, label }));
const approverTypeOptions = Object.entries(approverTypeLabels).map(([key, label]) => ({ key, label }));

export default function WorkflowSettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Hooks for data fetching
  const { data: globalSettings, isLoading: isLoadingSettings } = useWorkflowGlobalSettings();
  const { data: triggers = [], isLoading: isLoadingTriggers } = useWorkflowTriggers();
  const { data: conditions = [] } = useWorkflowConditions();
  const { data: actions = [] } = useWorkflowActions();
  const { data: approverRules = [] } = useWorkflowApproverRules();
  const { data: permissions = [], isLoading: isLoadingPermissions } = useWorkflowPermissions();
  
  // Mutations
  const updateGlobalSettings = useUpdateWorkflowGlobalSettings();
  const createTrigger = useCreateWorkflowTrigger();
  const updateTriggerMutation = useUpdateWorkflowTrigger();
  const deleteTriggerMutation = useDeleteWorkflowTrigger();
  const createCondition = useCreateWorkflowCondition();
  const deleteConditionMutation = useDeleteWorkflowCondition();
  const createAction = useCreateWorkflowAction();
  const deleteActionMutation = useDeleteWorkflowAction();
  const createApproverRule = useCreateWorkflowApproverRule();
  const deleteApproverRuleMutation = useDeleteWorkflowApproverRule();
  const upsertPermission = useUpsertWorkflowPermission();

  const [formData, setFormData] = useState<Partial<WorkflowGlobalSettings>>(defaultWorkflowGlobalSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<WorkflowTrigger | null>(null);
  const [conditionDialogOpen, setConditionDialogOpen] = useState(false);
  const [editingCondition, setEditingCondition] = useState<WorkflowCondition | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<WorkflowAction | null>(null);
  const [approverDialogOpen, setApproverDialogOpen] = useState(false);
  const [editingApprover, setEditingApprover] = useState<WorkflowApproverRule | null>(null);
  const [localPermissions, setLocalPermissions] = useState<Partial<WorkflowPermission>[]>([]);

  const isLoading = isLoadingSettings || isLoadingTriggers || isLoadingPermissions;

  useEffect(() => {
    if (globalSettings) {
      setFormData({ ...defaultWorkflowGlobalSettings, ...globalSettings });
    }
  }, [globalSettings]);

  useEffect(() => {
    if (permissions.length > 0) {
      setLocalPermissions(permissions);
    } else {
      setLocalPermissions([
        { role_type: 'employee', can_trigger: true, can_view_own: true, can_view_team: false, can_view_all: false, can_approve: false, can_reject: false, can_delegate: false, can_escalate: false, can_cancel: false, can_configure: false, can_create_templates: false, can_override: false, can_simulate: false, can_audit: false },
        { role_type: 'team_lead', can_trigger: true, can_view_own: true, can_view_team: true, can_view_all: false, can_approve: true, can_reject: true, can_delegate: true, can_escalate: true, can_cancel: false, can_configure: false, can_create_templates: false, can_override: false, can_simulate: false, can_audit: false },
        { role_type: 'hr', can_trigger: true, can_view_own: true, can_view_team: true, can_view_all: true, can_approve: true, can_reject: true, can_delegate: true, can_escalate: true, can_cancel: true, can_configure: true, can_create_templates: true, can_override: false, can_simulate: true, can_audit: true },
        { role_type: 'finance', can_trigger: true, can_view_own: true, can_view_team: true, can_view_all: true, can_approve: true, can_reject: true, can_delegate: true, can_escalate: true, can_cancel: true, can_configure: true, can_create_templates: true, can_override: false, can_simulate: true, can_audit: true },
        { role_type: 'admin', can_trigger: true, can_view_own: true, can_view_team: true, can_view_all: true, can_approve: true, can_reject: true, can_delegate: true, can_escalate: true, can_cancel: true, can_configure: true, can_create_templates: true, can_override: true, can_simulate: true, can_audit: true },
        { role_type: 'superadmin', can_trigger: true, can_view_own: true, can_view_team: true, can_view_all: true, can_approve: true, can_reject: true, can_delegate: true, can_escalate: true, can_cancel: true, can_configure: true, can_create_templates: true, can_override: true, can_simulate: true, can_audit: true }
      ]);
    }
  }, [permissions]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateGlobalSettings.mutateAsync({ id: globalSettings?.id, settings: formData });
      // Save permissions
      for (const perm of localPermissions) {
        if (perm.role_type) {
          await upsertPermission.mutateAsync(perm);
        }
      }
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Workflow-Einstellungen wurden erfolgreich aktualisiert.",
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

  const handleModuleToggle = (key: string) => {
    const current = formData.enabled_modules || [];
    if (key === 'all') {
      setFormData({ ...formData, enabled_modules: ['all'] });
    } else {
      const filtered = current.filter(m => m !== 'all');
      if (filtered.includes(key)) {
        setFormData({ ...formData, enabled_modules: filtered.filter(m => m !== key) });
      } else {
        setFormData({ ...formData, enabled_modules: [...filtered, key] });
      }
    }
  };

  const handleSaveTrigger = async (trigger: Partial<WorkflowTrigger>) => {
    try {
      if (editingTrigger?.id) {
        await updateTriggerMutation.mutateAsync({ id: editingTrigger.id, trigger });
      } else {
        await createTrigger.mutateAsync(trigger);
      }
      setTriggerDialogOpen(false);
      setEditingTrigger(null);
      toast({ title: "Trigger gespeichert" });
    } catch (error) {
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  const handleDeleteTrigger = async (id: string) => {
    try {
      await deleteTriggerMutation.mutateAsync(id);
      toast({ title: "Trigger gelöscht" });
    } catch (error) {
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  const handleSaveCondition = async (condition: Partial<WorkflowCondition>) => {
    try {
      await createCondition.mutateAsync(condition);
      setConditionDialogOpen(false);
      setEditingCondition(null);
      toast({ title: "Bedingung gespeichert" });
    } catch (error) {
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  const handleDeleteCondition = async (id: string) => {
    try {
      await deleteConditionMutation.mutateAsync(id);
      toast({ title: "Bedingung gelöscht" });
    } catch (error) {
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  const handleSaveAction = async (action: Partial<WorkflowAction>) => {
    try {
      await createAction.mutateAsync(action);
      setActionDialogOpen(false);
      setEditingAction(null);
      toast({ title: "Aktion gespeichert" });
    } catch (error) {
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  const handleDeleteAction = async (id: string) => {
    try {
      await deleteActionMutation.mutateAsync(id);
      toast({ title: "Aktion gelöscht" });
    } catch (error) {
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  const handleSaveApprover = async (approver: Partial<WorkflowApproverRule>) => {
    try {
      await createApproverRule.mutateAsync(approver);
      setApproverDialogOpen(false);
      setEditingApprover(null);
      toast({ title: "Genehmiger gespeichert" });
    } catch (error) {
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  const handleDeleteApprover = async (id: string) => {
    try {
      await deleteApproverRuleMutation.mutateAsync(id);
      toast({ title: "Genehmiger gelöscht" });
    } catch (error) {
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  const updatePermission = (roleType: string, field: keyof WorkflowPermission, value: boolean) => {
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
              <h1 className="text-2xl font-semibold">Workflow-Einstellungen</h1>
              <p className="text-sm text-muted-foreground">Enterprise Automatisierungen & Genehmigungsketten</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Speichern
          </Button>
        </div>

        <Tabs defaultValue="basics" className="space-y-6">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-auto min-w-full">
              <TabsTrigger value="basics" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Grundlagen
              </TabsTrigger>
              <TabsTrigger value="types" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Typen
              </TabsTrigger>
              <TabsTrigger value="triggers" className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Trigger
              </TabsTrigger>
              <TabsTrigger value="conditions" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Bedingungen
              </TabsTrigger>
              <TabsTrigger value="approvers" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Genehmiger
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Aktionen
              </TabsTrigger>
              <TabsTrigger value="escalation" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Eskalation
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                KI
              </TabsTrigger>
              <TabsTrigger value="versioning" className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Versionierung
              </TabsTrigger>
              <TabsTrigger value="permissions" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Rechte
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Monitoring
              </TabsTrigger>
            </TabsList>
          </ScrollArea>

          {/* Tab 1: Grundlagen */}
          <TabsContent value="basics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow-Grundlagen</CardTitle>
                <CardDescription>Globale Einstellungen für das Workflow-System</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Workflows global aktiv</Label>
                    <p className="text-sm text-muted-foreground">Aktiviert das gesamte Workflow-System</p>
                  </div>
                  <Switch 
                    checked={formData.workflows_enabled} 
                    onCheckedChange={(checked) => setFormData({ ...formData, workflows_enabled: checked })}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Aktivierte Module</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {moduleOptions.map((module) => (
                      <div key={module.key} className="flex items-center space-x-2">
                        <Checkbox 
                          id={module.key}
                          checked={(formData.enabled_modules as string[])?.includes(module.key) || (formData.enabled_modules as string[])?.includes('all')}
                          onCheckedChange={() => handleModuleToggle(module.key)}
                        />
                        <Label htmlFor={module.key} className="font-normal">{module.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sandbox-Modus</Label>
                    <p className="text-sm text-muted-foreground">Test-Workflows ohne echte Aktionen</p>
                  </div>
                  <Switch 
                    checked={formData.sandbox_mode} 
                    onCheckedChange={(checked) => setFormData({ ...formData, sandbox_mode: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Typen */}
          <TabsContent value="types" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow-Typen</CardTitle>
                <CardDescription>Vordefinierte und benutzerdefinierte Workflow-Typen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">Genehmigungsworkflow</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Mehrstufige Genehmigungsprozesse</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Filter className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">Prüfworkflow</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Validierung und Qualitätsprüfung</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">Eskalationsworkflow</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Automatische Eskalation bei Verzögerung</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">Automationsworkflow</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Vollautomatische Prozesse</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Trigger */}
          <TabsContent value="triggers" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Workflow-Trigger</CardTitle>
                  <CardDescription>Ereignisse die Workflows starten</CardDescription>
                </div>
                <Button onClick={() => { setEditingTrigger(null); setTriggerDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Trigger hinzufügen
                </Button>
              </CardHeader>
              <CardContent>
                {triggers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Noch keine Trigger konfiguriert</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Modul</TableHead>
                        <TableHead>Ereignis</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {triggers.map((trigger) => (
                        <TableRow key={trigger.id}>
                          <TableCell className="font-medium">{trigger.name}</TableCell>
                          <TableCell>{workflowModuleLabels[trigger.module] || trigger.module}</TableCell>
                          <TableCell>{triggerEventLabels[trigger.trigger_event] || trigger.trigger_event}</TableCell>
                          <TableCell>
                            <Badge variant={trigger.is_active ? "default" : "secondary"}>
                              {trigger.is_active ? "Aktiv" : "Inaktiv"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => { setEditingTrigger(trigger); setTriggerDialogOpen(true); }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteTrigger(trigger.id)}>
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

          {/* Tab 4: Bedingungen */}
          <TabsContent value="conditions" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Workflow-Bedingungen</CardTitle>
                  <CardDescription>Wenn-Logik für Workflow-Entscheidungen</CardDescription>
                </div>
                <Button onClick={() => { setEditingCondition(null); setConditionDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Bedingung hinzufügen
                </Button>
              </CardHeader>
              <CardContent>
                {conditions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Noch keine Bedingungen konfiguriert</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Typ</TableHead>
                        <TableHead>Operator</TableHead>
                        <TableHead>Wert</TableHead>
                        <TableHead>Logik</TableHead>
                        <TableHead className="w-[100px]">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {conditions.map((condition) => (
                        <TableRow key={condition.id}>
                          <TableCell className="font-medium">{conditionTypeLabels[condition.condition_type] || condition.condition_type}</TableCell>
                          <TableCell>{condition.operator}</TableCell>
                          <TableCell><code className="text-xs">{JSON.stringify(condition.value)}</code></TableCell>
                          <TableCell><Badge variant="outline">{condition.logic_operator}</Badge></TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => { setEditingCondition(condition); setConditionDialogOpen(true); }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteCondition(condition.id)}>
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

          {/* Tab 5: Genehmiger */}
          <TabsContent value="approvers" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Genehmigungsketten</CardTitle>
                  <CardDescription>Wer genehmigt in welcher Reihenfolge</CardDescription>
                </div>
                <Button onClick={() => { setEditingApprover(null); setApproverDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Genehmiger hinzufügen
                </Button>
              </CardHeader>
              <CardContent>
                {approverRules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Noch keine Genehmiger konfiguriert</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Schritt</TableHead>
                        <TableHead>Typ</TableHead>
                        <TableHead>Rolle</TableHead>
                        <TableHead>Modus</TableHead>
                        <TableHead>Delegation</TableHead>
                        <TableHead className="w-[100px]">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approverRules.sort((a, b) => (a.step_number || 1) - (b.step_number || 1)).map((approver) => (
                        <TableRow key={approver.id}>
                          <TableCell className="font-medium">Schritt {approver.step_number}</TableCell>
                          <TableCell>{approverTypeLabels[approver.approver_type] || approver.approver_type}</TableCell>
                          <TableCell>{approver.approver_role || '-'}</TableCell>
                          <TableCell><Badge variant="outline">{approver.approval_mode}</Badge></TableCell>
                          <TableCell>{approver.can_delegate ? 'Ja' : 'Nein'}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => { setEditingApprover(approver); setApproverDialogOpen(true); }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteApprover(approver.id)}>
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

          {/* Tab 6: Aktionen */}
          <TabsContent value="actions" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Workflow-Aktionen</CardTitle>
                  <CardDescription>Was passiert bei Workflow-Ereignissen</CardDescription>
                </div>
                <Button onClick={() => { setEditingAction(null); setActionDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Aktion hinzufügen
                </Button>
              </CardHeader>
              <CardContent>
                {actions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Noch keine Aktionen konfiguriert</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Typ</TableHead>
                        <TableHead>Konfiguration</TableHead>
                        <TableHead>Ausführung bei</TableHead>
                        <TableHead className="w-[100px]">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {actions.map((action) => (
                        <TableRow key={action.id}>
                          <TableCell className="font-medium">{actionTypeLabels[action.action_type] || action.action_type}</TableCell>
                          <TableCell><code className="text-xs">{JSON.stringify(action.action_config)}</code></TableCell>
                          <TableCell><Badge variant="outline">{action.execute_on}</Badge></TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => { setEditingAction(action); setActionDialogOpen(true); }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteAction(action.id)}>
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

          {/* Tab 7: Eskalation */}
          <TabsContent value="escalation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Zeit & Eskalation</CardTitle>
                <CardDescription>Zeitlimits und automatische Eskalation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Standard-Timeout (Stunden)</Label>
                    <Input 
                      type="number" 
                      value={formData.default_timeout_hours} 
                      onChange={(e) => setFormData({ ...formData, default_timeout_hours: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Eskalationsstufen</Label>
                    <Input 
                      type="number" 
                      value={formData.escalation_levels} 
                      onChange={(e) => setFormData({ ...formData, escalation_levels: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Erinnerungen vor Timeout (Stunden)</Label>
                  <Input 
                    value={(formData.reminder_before_hours as number[])?.join(', ')} 
                    onChange={(e) => setFormData({ ...formData, reminder_before_hours: e.target.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v)) })}
                    placeholder="24, 48"
                  />
                  <p className="text-xs text-muted-foreground">Kommagetrennte Stundenwerte</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Automatischer Abbruch nach (Tage)</Label>
                    <Input 
                      type="number" 
                      value={formData.auto_cancel_after_days || ''} 
                      onChange={(e) => setFormData({ ...formData, auto_cancel_after_days: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="Leer = nie"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Automatischer Abschluss nach (Tage)</Label>
                    <Input 
                      type="number" 
                      value={formData.auto_complete_after_days || ''} 
                      onChange={(e) => setFormData({ ...formData, auto_complete_after_days: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="Leer = nie"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 8: KI */}
          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>KI im Workflow</CardTitle>
                <CardDescription>Optionale KI-Unterstützung für Workflows</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Vorschlag optimaler Genehmiger</Label>
                    <p className="text-sm text-muted-foreground">KI schlägt den besten Genehmiger vor</p>
                  </div>
                  <Switch 
                    checked={formData.ai_approver_suggestion} 
                    onCheckedChange={(checked) => setFormData({ ...formData, ai_approver_suggestion: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Risikoerkennung</Label>
                    <p className="text-sm text-muted-foreground">Automatische Risikobewertung</p>
                  </div>
                  <Switch 
                    checked={formData.ai_risk_detection} 
                    onCheckedChange={(checked) => setFormData({ ...formData, ai_risk_detection: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Entscheidungsempfehlung</Label>
                    <p className="text-sm text-muted-foreground">KI gibt Genehmigungsempfehlung</p>
                  </div>
                  <Switch 
                    checked={formData.ai_decision_recommendation} 
                    onCheckedChange={(checked) => setFormData({ ...formData, ai_decision_recommendation: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 9: Versionierung */}
          <TabsContent value="versioning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Versionierung & Simulation</CardTitle>
                <CardDescription>Workflow-Versionen und Testmodus</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Versionierung aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Workflow-Änderungen werden versioniert</p>
                  </div>
                  <Switch 
                    checked={formData.enable_versioning} 
                    onCheckedChange={(checked) => setFormData({ ...formData, enable_versioning: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Simulation erlauben</Label>
                    <p className="text-sm text-muted-foreground">"Was passiert, wenn..." testen</p>
                  </div>
                  <Switch 
                    checked={formData.enable_simulation} 
                    onCheckedChange={(checked) => setFormData({ ...formData, enable_simulation: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Rollback erlauben</Label>
                    <p className="text-sm text-muted-foreground">Zu früheren Versionen zurückkehren</p>
                  </div>
                  <Switch 
                    checked={formData.allow_rollback} 
                    onCheckedChange={(checked) => setFormData({ ...formData, allow_rollback: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 10: Rechte */}
          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Berechtigungsmatrix</CardTitle>
                <CardDescription>Rollenbasierte Zugriffsrechte für Workflows</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rolle</TableHead>
                      <TableHead className="text-center">Auslösen</TableHead>
                      <TableHead className="text-center">Genehmigen</TableHead>
                      <TableHead className="text-center">Konfigurieren</TableHead>
                      <TableHead className="text-center">Überschreiben</TableHead>
                      <TableHead className="text-center">Audit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localPermissions.map((perm) => (
                      <TableRow key={perm.role_type}>
                        <TableCell className="font-medium">{workflowRoleLabels[perm.role_type || ''] || perm.role_type}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox checked={perm.can_trigger} onCheckedChange={(c) => updatePermission(perm.role_type || '', 'can_trigger', !!c)} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox checked={perm.can_approve} onCheckedChange={(c) => updatePermission(perm.role_type || '', 'can_approve', !!c)} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox checked={perm.can_configure} onCheckedChange={(c) => updatePermission(perm.role_type || '', 'can_configure', !!c)} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox checked={perm.can_override} onCheckedChange={(c) => updatePermission(perm.role_type || '', 'can_override', !!c)} />
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

          {/* Tab 11: Monitoring */}
          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow-Monitoring</CardTitle>
                <CardDescription>Übersicht über laufende Prozesse</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <h4 className="text-2xl font-bold">0</h4>
                    <p className="text-sm text-muted-foreground">Laufende Workflows</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h4 className="text-2xl font-bold">0</h4>
                    <p className="text-sm text-muted-foreground">Wartend auf Genehmigung</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h4 className="text-2xl font-bold">0</h4>
                    <p className="text-sm text-muted-foreground">Eskaliert</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h4 className="text-2xl font-bold">-</h4>
                    <p className="text-sm text-muted-foreground">Ø Durchlaufzeit</p>
                  </div>
                </div>

                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Keine aktiven Workflows</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Trigger Dialog */}
        <Dialog open={triggerDialogOpen} onOpenChange={setTriggerDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTrigger ? 'Trigger bearbeiten' : 'Neuer Trigger'}</DialogTitle>
              <DialogDescription>Workflow-Trigger konfigurieren</DialogDescription>
            </DialogHeader>
            <TriggerForm 
              trigger={editingTrigger}
              onSave={handleSaveTrigger}
              onCancel={() => setTriggerDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Condition Dialog */}
        <Dialog open={conditionDialogOpen} onOpenChange={setConditionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCondition ? 'Bedingung bearbeiten' : 'Neue Bedingung'}</DialogTitle>
              <DialogDescription>Workflow-Bedingung konfigurieren</DialogDescription>
            </DialogHeader>
            <ConditionForm 
              condition={editingCondition}
              onSave={handleSaveCondition}
              onCancel={() => setConditionDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Action Dialog */}
        <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAction ? 'Aktion bearbeiten' : 'Neue Aktion'}</DialogTitle>
              <DialogDescription>Workflow-Aktion konfigurieren</DialogDescription>
            </DialogHeader>
            <ActionForm 
              action={editingAction}
              onSave={handleSaveAction}
              onCancel={() => setActionDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Approver Dialog */}
        <Dialog open={approverDialogOpen} onOpenChange={setApproverDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingApprover ? 'Genehmiger bearbeiten' : 'Neuer Genehmiger'}</DialogTitle>
              <DialogDescription>Genehmigungsregel konfigurieren</DialogDescription>
            </DialogHeader>
            <ApproverForm 
              approver={editingApprover}
              onSave={handleSaveApprover}
              onCancel={() => setApproverDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}

function TriggerForm({ trigger, onSave, onCancel }: { trigger: WorkflowTrigger | null; onSave: (t: Partial<WorkflowTrigger>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState<Partial<WorkflowTrigger>>(trigger || {
    name: '',
    description: '',
    module: 'absence',
    trigger_event: 'created',
    is_active: true
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Beschreibung</Label>
        <Textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Modul</Label>
        <Select value={formData.module} onValueChange={(v) => setFormData({ ...formData, module: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(workflowModuleLabels).filter(([k]) => k !== 'all').map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Ereignis</Label>
        <Select value={formData.trigger_event} onValueChange={(v) => setFormData({ ...formData, trigger_event: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {triggerEventOptions.map((e) => (
              <SelectItem key={e.key} value={e.key}>{e.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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

function ConditionForm({ condition, onSave, onCancel }: { condition: WorkflowCondition | null; onSave: (c: Partial<WorkflowCondition>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState<Partial<WorkflowCondition>>(condition || {
    condition_type: 'role',
    operator: 'equals',
    value: {},
    logic_operator: 'AND',
    sort_order: 0
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Bedingungstyp</Label>
        <Select value={formData.condition_type} onValueChange={(v) => setFormData({ ...formData, condition_type: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {conditionTypeOptions.map((c) => (
              <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Operator</Label>
        <Select value={formData.operator} onValueChange={(v) => setFormData({ ...formData, operator: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="equals">Gleich</SelectItem>
            <SelectItem value="not_equals">Ungleich</SelectItem>
            <SelectItem value="greater_than">Größer als</SelectItem>
            <SelectItem value="less_than">Kleiner als</SelectItem>
            <SelectItem value="contains">Enthält</SelectItem>
            <SelectItem value="in">In Liste</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Wert (JSON)</Label>
        <Textarea 
          value={JSON.stringify(formData.value, null, 2)} 
          onChange={(e) => {
            try {
              setFormData({ ...formData, value: JSON.parse(e.target.value) });
            } catch {}
          }}
          placeholder='{"value": "manager"}'
        />
      </div>
      <div className="space-y-2">
        <Label>Logik-Operator</Label>
        <Select 
          value={formData.logic_operator} 
          onValueChange={(v: 'AND' | 'OR') => setFormData({ ...formData, logic_operator: v })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="AND">UND</SelectItem>
            <SelectItem value="OR">ODER</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Abbrechen</Button>
        <Button onClick={() => onSave(formData)}>Speichern</Button>
      </DialogFooter>
    </div>
  );
}

function ActionForm({ action, onSave, onCancel }: { action: WorkflowAction | null; onSave: (a: Partial<WorkflowAction>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState<Partial<WorkflowAction>>(action || {
    action_type: 'change_status',
    action_config: {},
    execute_on: 'approval',
    sort_order: 0
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Aktionstyp</Label>
        <Select value={formData.action_type} onValueChange={(v) => setFormData({ ...formData, action_type: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {actionTypeOptions.map((a) => (
              <SelectItem key={a.key} value={a.key}>{a.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Konfiguration (JSON)</Label>
        <Textarea 
          value={JSON.stringify(formData.action_config, null, 2)} 
          onChange={(e) => {
            try {
              setFormData({ ...formData, action_config: JSON.parse(e.target.value) });
            } catch {}
          }}
          placeholder='{"status": "approved"}'
        />
      </div>
      <div className="space-y-2">
        <Label>Ausführen bei</Label>
        <Select 
          value={formData.execute_on} 
          onValueChange={(v: 'approval' | 'rejection' | 'timeout' | 'escalation' | 'always' | 'condition_met') => setFormData({ ...formData, execute_on: v })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="approval">Genehmigung</SelectItem>
            <SelectItem value="rejection">Ablehnung</SelectItem>
            <SelectItem value="timeout">Timeout</SelectItem>
            <SelectItem value="escalation">Eskalation</SelectItem>
            <SelectItem value="always">Immer</SelectItem>
            <SelectItem value="condition_met">Bedingung erfüllt</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Abbrechen</Button>
        <Button onClick={() => onSave(formData)}>Speichern</Button>
      </DialogFooter>
    </div>
  );
}

function ApproverForm({ approver, onSave, onCancel }: { approver: WorkflowApproverRule | null; onSave: (a: Partial<WorkflowApproverRule>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState<Partial<WorkflowApproverRule>>(approver || {
    approver_type: 'direct_manager',
    approver_role: '',
    step_number: 1,
    approval_mode: 'sequential',
    can_delegate: true
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Schritt-Nummer</Label>
        <Input type="number" value={formData.step_number} onChange={(e) => setFormData({ ...formData, step_number: parseInt(e.target.value) })} />
      </div>
      <div className="space-y-2">
        <Label>Genehmiger-Typ</Label>
        <Select value={formData.approver_type} onValueChange={(v) => setFormData({ ...formData, approver_type: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {approverTypeOptions.map((a) => (
              <SelectItem key={a.key} value={a.key}>{a.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {formData.approver_type === 'role_based' && (
        <div className="space-y-2">
          <Label>Rolle</Label>
          <Input value={formData.approver_role || ''} onChange={(e) => setFormData({ ...formData, approver_role: e.target.value })} />
        </div>
      )}
      <div className="space-y-2">
        <Label>Genehmigungsmodus</Label>
        <Select 
          value={formData.approval_mode} 
          onValueChange={(v: 'sequential' | 'parallel' | 'any_one' | 'all_required' | 'majority') => setFormData({ ...formData, approval_mode: v })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="sequential">Sequenziell</SelectItem>
            <SelectItem value="parallel">Parallel</SelectItem>
            <SelectItem value="any_one">Einer genügt</SelectItem>
            <SelectItem value="all_required">Alle erforderlich</SelectItem>
            <SelectItem value="majority">Mehrheit</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="delegate" checked={formData.can_delegate} onCheckedChange={(c) => setFormData({ ...formData, can_delegate: !!c })} />
        <Label htmlFor="delegate">Delegation erlaubt</Label>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Abbrechen</Button>
        <Button onClick={() => onSave(formData)}>Speichern</Button>
      </DialogFooter>
    </div>
  );
}
