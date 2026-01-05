import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Switch } from "../../ui/switch";
import { Textarea } from "../../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Plus, Workflow, Users, Clock, CheckCircle, XCircle, AlertCircle, Edit, ArrowRight, Settings, UserCheck } from "lucide-react";

interface User {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface ExpenseWorkflowProps {
  user: User;
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'validation' | 'notification' | 'automation';
  approverRole?: string;
  approverIds?: string[];
  condition?: string;
  action?: string;
  order: number;
  isRequired: boolean;
  timeoutDays?: number;
}

interface ApprovalRule {
  id: string;
  name: string;
  description: string;
  conditions: {
    amountThreshold?: number;
    categories?: string[];
    departments?: string[];
    requiresReceipt?: boolean;
  };
  workflow: WorkflowStep[];
  isActive: boolean;
  priority: number;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  type: 'simple' | 'department' | 'amount_based' | 'multi_level';
  steps: WorkflowStep[];
}

const defaultWorkflowTemplates: WorkflowTemplate[] = [
  {
    id: '1',
    name: 'Standard Genehmigung',
    description: 'Einfache Genehmigung durch direkten Vorgesetzten',
    type: 'simple',
    steps: [
      { id: '1', name: 'Vorgesetzter Genehmigung', type: 'approval', approverRole: 'supervisor', order: 1, isRequired: true, timeoutDays: 3 },
      { id: '2', name: 'HR Benachrichtigung', type: 'notification', order: 2, isRequired: false }
    ]
  },
  {
    id: '2',
    name: 'Abteilungs-basiert',
    description: 'Genehmigung basierend auf Abteilungsrichtlinien',
    type: 'department',
    steps: [
      { id: '1', name: 'Abteilungsleiter', type: 'approval', approverRole: 'department_head', order: 1, isRequired: true, timeoutDays: 2 },
      { id: '2', name: 'Compliance Check', type: 'validation', order: 2, isRequired: true },
      { id: '3', name: 'Buchhaltung', type: 'approval', approverRole: 'finance', order: 3, isRequired: true, timeoutDays: 5 }
    ]
  },
  {
    id: '3',
    name: 'Betrags-basiert',
    description: 'Mehrstufige Genehmigung basierend auf Ausgabenhöhe',
    type: 'amount_based',
    steps: [
      { id: '1', name: 'Automatische Validierung', type: 'validation', condition: 'amount < 100', order: 1, isRequired: true },
      { id: '2', name: 'Vorgesetzter (100-1000€)', type: 'approval', condition: 'amount >= 100 && amount < 1000', approverRole: 'supervisor', order: 2, isRequired: true, timeoutDays: 3 },
      { id: '3', name: 'Geschäftsführung (>1000€)', type: 'approval', condition: 'amount >= 1000', approverRole: 'management', order: 3, isRequired: true, timeoutDays: 7 }
    ]
  }
];

const defaultApprovalRules: ApprovalRule[] = [
  {
    id: '1',
    name: 'Standard Reisekosten',
    description: 'Standard-Workflow für normale Reisekosten',
    conditions: {
      amountThreshold: 500,
      categories: ['travel', 'accommodation', 'meals'],
      requiresReceipt: true
    },
    workflow: defaultWorkflowTemplates[0].steps,
    isActive: true,
    priority: 1
  },
  {
    id: '2',
    name: 'Hohe Ausgaben',
    description: 'Spezial-Workflow für Ausgaben über 1000€',
    conditions: {
      amountThreshold: 1000
    },
    workflow: defaultWorkflowTemplates[2].steps,
    isActive: true,
    priority: 2
  },
  {
    id: '3',
    name: 'Training & Weiterbildung',
    description: 'Workflow für Weiterbildungskosten',
    conditions: {
      categories: ['training'],
      requiresReceipt: true
    },
    workflow: defaultWorkflowTemplates[1].steps,
    isActive: true,
    priority: 3
  }
];

export function ExpenseWorkflow({ user }: ExpenseWorkflowProps) {
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>(defaultApprovalRules);
  const [workflowTemplates, setWorkflowTemplates] = useState<WorkflowTemplate[]>(defaultWorkflowTemplates);
  const [selectedRule, setSelectedRule] = useState<ApprovalRule | null>(null);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'templates' | 'monitoring'>('rules');

  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    amountThreshold: 0,
    categories: [] as string[],
    departments: [] as string[],
    requiresReceipt: false,
    templateId: ''
  });

  const getStepIcon = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'approval':
        return <UserCheck className="h-4 w-4" />;
      case 'validation':
        return <CheckCircle className="h-4 w-4" />;
      case 'notification':
        return <AlertCircle className="h-4 w-4" />;
      case 'automation':
        return <Settings className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStepTypeLabel = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'approval':
        return 'Genehmigung';
      case 'validation':
        return 'Validierung';
      case 'notification':
        return 'Benachrichtigung';
      case 'automation':
        return 'Automatisierung';
      default:
        return type;
    }
  };

  const handleCreateRule = () => {
    const selectedTemplate = workflowTemplates.find(t => t.id === newRule.templateId);
    if (!selectedTemplate) return;

    const rule: ApprovalRule = {
      id: Date.now().toString(),
      name: newRule.name,
      description: newRule.description,
      conditions: {
        amountThreshold: newRule.amountThreshold || undefined,
        categories: newRule.categories.length > 0 ? newRule.categories : undefined,
        departments: newRule.departments.length > 0 ? newRule.departments : undefined,
        requiresReceipt: newRule.requiresReceipt || undefined
      },
      workflow: selectedTemplate.steps,
      isActive: true,
      priority: approvalRules.length + 1
    };

    setApprovalRules([...approvalRules, rule]);
    setIsRuleDialogOpen(false);
    setNewRule({
      name: '',
      description: '',
      amountThreshold: 0,
      categories: [],
      departments: [],
      requiresReceipt: false,
      templateId: ''
    });
  };

  const toggleRuleStatus = (id: string) => {
    setApprovalRules(approvalRules.map(rule =>
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const mockWorkflowStatus: any[] = [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Spesen-Workflow Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Konfigurieren Sie Genehmigungsprozesse und Workflow-Automatisierung
              </p>
            </div>
            <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Neue Regel
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Neue Genehmigungsregel erstellen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ruleName">Regelname</Label>
                      <Input
                        id="ruleName"
                        value={newRule.name}
                        onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                        placeholder="z.B. Marketing Ausgaben"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template">Workflow-Template</Label>
                      <Select
                        value={newRule.templateId}
                        onValueChange={(value) => setNewRule({ ...newRule, templateId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Template auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {workflowTemplates.map(template => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ruleDescription">Beschreibung</Label>
                    <Textarea
                      id="ruleDescription"
                      value={newRule.description}
                      onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                      placeholder="Beschreibung der Regel..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amountThreshold">Betragsgrenze (€)</Label>
                    <Input
                      id="amountThreshold"
                      type="number"
                      value={newRule.amountThreshold}
                      onChange={(e) => setNewRule({ ...newRule, amountThreshold: parseFloat(e.target.value) || 0 })}
                      placeholder="Mindestbetrag für diese Regel"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requiresReceipt"
                      checked={newRule.requiresReceipt}
                      onCheckedChange={(checked) => setNewRule({ ...newRule, requiresReceipt: checked })}
                    />
                    <Label htmlFor="requiresReceipt">Beleg erforderlich</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsRuleDialogOpen(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleCreateRule}>
                    Regel erstellen
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList>
              <TabsTrigger value="rules">Genehmigungsregeln</TabsTrigger>
              <TabsTrigger value="templates">Workflow-Templates</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            </TabsList>

            <TabsContent value="rules" className="space-y-4">
              <div className="space-y-4">
                {approvalRules.map((rule) => (
                  <Card key={rule.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{rule.name}</h4>
                            <Badge variant={rule.isActive ? "success" : "secondary"}>
                              {rule.isActive ? "Aktiv" : "Inaktiv"}
                            </Badge>
                            <Badge variant="outline">Priorität {rule.priority}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{rule.description}</p>
                          
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {rule.conditions.amountThreshold && (
                              <Badge variant="outline">≥ {rule.conditions.amountThreshold}€</Badge>
                            )}
                            {rule.conditions.categories && (
                              <Badge variant="outline">Kategorien: {rule.conditions.categories.join(', ')}</Badge>
                            )}
                            {rule.conditions.requiresReceipt && (
                              <Badge variant="outline">Beleg erforderlich</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleRuleStatus(rule.id)}
                          >
                            {rule.isActive ? "Deaktivieren" : "Aktivieren"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRule(rule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h5 className="font-medium mb-3">Workflow-Schritte</h5>
                        <div className="flex items-center gap-2 overflow-x-auto">
                          {rule.workflow.map((step, index) => (
                            <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
                              <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
                                {getStepIcon(step.type)}
                                <div className="text-sm">
                                  <div className="font-medium">{step.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {getStepTypeLabel(step.type)}
                                  </div>
                                </div>
                              </div>
                              {index < rule.workflow.length - 1 && (
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {workflowTemplates.map((template) => (
                  <Card key={template.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                          <Badge variant="outline" className="mt-2">
                            {template.type === 'simple' ? 'Einfach' :
                             template.type === 'department' ? 'Abteilungs-basiert' :
                             template.type === 'amount_based' ? 'Betrags-basiert' : 'Multi-Level'}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {template.steps.map((step, index) => (
                          <div key={step.id} className="flex items-center gap-2 text-sm">
                            <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs">
                              {step.order}
                            </div>
                            {getStepIcon(step.type)}
                            <span>{step.name}</span>
                            {step.timeoutDays && (
                              <Badge variant="secondary" className="text-xs">
                                {step.timeoutDays}d
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Workflow-Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Regel</TableHead>
                        <TableHead>Ausstehend</TableHead>
                        <TableHead>Genehmigt</TableHead>
                        <TableHead>Abgelehnt</TableHead>
                        <TableHead>Ø Bearbeitungszeit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockWorkflowStatus.map((status, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{status.rule}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{status.pending}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="success">{status.approved}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">{status.rejected}</Badge>
                          </TableCell>
                          <TableCell>{status.avgDays} Tage</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}