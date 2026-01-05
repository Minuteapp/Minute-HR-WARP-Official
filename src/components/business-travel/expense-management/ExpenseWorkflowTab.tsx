import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Workflow, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowRight,
  User,
  Building,
  CreditCard,
  FileText,
  TrendingUp,
  AlertTriangle,
  Timer
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface WorkflowStep {
  id: string;
  name: string;
  role: string;
  approver?: {
    name: string;
    email: string;
    avatar?: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  slaHours: number;
  completedAt?: string;
  comments?: string;
}

interface ExpenseWorkflow {
  id: string;
  expenseId: string;
  expenseName: string;
  submittedBy: string;
  submittedAt: string;
  currentStep: number;
  totalSteps: number;
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'paid';
  totalAmount: number;
  currency: string;
  steps: WorkflowStep[];
  slaStatus: 'on_time' | 'warning' | 'overdue';
  escalationLevel: number;
}

const ExpenseWorkflowTab = () => {
  const [activeTab, setActiveTab] = useState("active");
  
  // Mock workflow data
  const [workflows] = useState<ExpenseWorkflow[]>([
    {
      id: "wf_1",
      expenseId: "exp_1",
      expenseName: "Geschäftsreise München - Spesen",
      submittedBy: "Max Mustermann",
      submittedAt: "2024-08-21T09:00:00Z",
      currentStep: 2,
      totalSteps: 3,
      status: "in_review",
      totalAmount: 456.80,
      currency: "EUR",
      slaStatus: "warning",
      escalationLevel: 0,
      steps: [
        {
          id: "step_1",
          name: "Mitarbeiter Einreichung",
          role: "employee",
          status: "approved",
          slaHours: 0,
          completedAt: "2024-08-21T09:00:00Z",
          approver: {
            name: "Max Mustermann",
            email: "max.mustermann@company.com"
          }
        },
        {
          id: "step_2", 
          name: "Vorgesetzten-Genehmigung",
          role: "supervisor",
          status: "pending",
          slaHours: 24,
          approver: {
            name: "Sarah Schmidt",
            email: "sarah.schmidt@company.com"
          }
        },
        {
          id: "step_3",
          name: "Finance Prüfung",
          role: "finance",
          status: "pending",
          slaHours: 48,
          approver: {
            name: "Thomas Weber",
            email: "thomas.weber@company.com"
          }
        }
      ]
    },
    {
      id: "wf_2",
      expenseId: "exp_2", 
      expenseName: "Kundenbesuch Hamburg - Bewirtung",
      submittedBy: "Anna Müller",
      submittedAt: "2024-08-20T14:30:00Z",
      currentStep: 3,
      totalSteps: 3,
      status: "approved",
      totalAmount: 89.50,
      currency: "EUR",
      slaStatus: "on_time",
      escalationLevel: 0,
      steps: [
        {
          id: "step_1",
          name: "Mitarbeiter Einreichung", 
          role: "employee",
          status: "approved",
          slaHours: 0,
          completedAt: "2024-08-20T14:30:00Z"
        },
        {
          id: "step_2",
          name: "Vorgesetzten-Genehmigung",
          role: "supervisor", 
          status: "approved",
          slaHours: 24,
          completedAt: "2024-08-20T16:15:00Z"
        },
        {
          id: "step_3",
          name: "Finance Prüfung",
          role: "finance",
          status: "approved", 
          slaHours: 48,
          completedAt: "2024-08-21T10:30:00Z"
        }
      ]
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-100 text-green-800">Genehmigt</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800">Abgelehnt</Badge>;
      case 'in_review': return <Badge className="bg-blue-100 text-blue-800">In Prüfung</Badge>;
      case 'submitted': return <Badge className="bg-yellow-100 text-yellow-800">Eingereicht</Badge>;
      case 'paid': return <Badge className="bg-green-100 text-green-800">Ausgezahlt</Badge>;
      default: return <Badge variant="outline">Entwurf</Badge>;
    }
  };

  const getSLABadge = (slaStatus: string) => {
    switch (slaStatus) {
      case 'on_time': return <Badge variant="outline" className="text-green-600">Pünktlich</Badge>;
      case 'warning': return <Badge variant="destructive" className="bg-orange-100 text-orange-800">Warnung</Badge>;
      case 'overdue': return <Badge variant="destructive">Überfällig</Badge>;
      default: return <Badge variant="outline">-</Badge>;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'employee': return <User className="h-4 w-4" />;
      case 'supervisor': return <Building className="h-4 w-4" />;
      case 'finance': return <CreditCard className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const calculateProgress = (currentStep: number, totalSteps: number) => {
    return Math.round((currentStep / totalSteps) * 100);
  };

  const activeWorkflows = workflows.filter(w => ['submitted', 'in_review'].includes(w.status));
  const completedWorkflows = workflows.filter(w => ['approved', 'paid'].includes(w.status));
  const rejectedWorkflows = workflows.filter(w => w.status === 'rejected');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Workflow & Genehmigung</h3>
          <p className="text-muted-foreground">
            Mehrstufige Genehmigungsworkflows mit SLA-Tracking und Eskalation
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">
            Aktive ({activeWorkflows.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Abgeschlossen ({completedWorkflows.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Abgelehnt ({rejectedWorkflows.length})
          </TabsTrigger>
          <TabsTrigger value="settings">
            Einstellungen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">In Bearbeitung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeWorkflows.length}</div>
                <div className="text-xs text-muted-foreground">
                  Workflows aktiv
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ø Bearbeitungszeit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18h</div>
                <div className="text-xs text-muted-foreground">
                  Durchschnittliche Dauer
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">SLA Einhaltung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">92%</div>
                <div className="text-xs text-muted-foreground">
                  Pünktliche Bearbeitung
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {activeWorkflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{workflow.expenseName}</CardTitle>
                      <CardDescription>
                        Eingereicht von {workflow.submittedBy} • €{workflow.totalAmount.toFixed(2)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSLABadge(workflow.slaStatus)}
                      {getStatusBadge(workflow.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Fortschrittsbalken */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Fortschritt</span>
                        <span>{workflow.currentStep}/{workflow.totalSteps} Schritte</span>
                      </div>
                      <Progress value={calculateProgress(workflow.currentStep, workflow.totalSteps)} />
                    </div>

                    {/* Workflow Schritte */}
                    <div className="space-y-3">
                      {workflow.steps.map((step, index) => (
                        <div key={step.id} className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white">
                            {step.status === 'approved' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : step.status === 'rejected' ? (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            ) : index < workflow.currentStep ? (
                              <Clock className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <div className="w-3 h-3 bg-gray-300 rounded-full" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getRoleIcon(step.role)}
                                <span className="font-medium">{step.name}</span>
                                {step.status === 'pending' && index === workflow.currentStep - 1 && (
                                  <Badge variant="outline" className="text-xs">
                                    Aktueller Schritt
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {step.slaHours > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Timer className="h-3 w-3" />
                                    {step.slaHours}h SLA
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {step.approver && (
                              <div className="flex items-center gap-2 mt-1">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={step.approver.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {step.approver.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">
                                  {step.approver.name}
                                </span>
                                {step.completedAt && (
                                  <span className="text-xs text-muted-foreground">
                                    • {new Date(step.completedAt).toLocaleString('de-DE')}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {step.comments && (
                              <div className="text-sm text-muted-foreground mt-1 bg-gray-50 p-2 rounded">
                                {step.comments}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Aktionen */}
                    <div className="flex justify-between items-center pt-3 border-t">
                      <div className="text-sm text-muted-foreground">
                        Eingereicht: {new Date(workflow.submittedAt).toLocaleDateString('de-DE')}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Details
                        </Button>
                        {workflow.slaStatus === 'overdue' && (
                          <Button size="sm" variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Eskalieren
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="space-y-4">
            {completedWorkflows.map((workflow) => (
              <Card key={workflow.id} className="opacity-90">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{workflow.expenseName}</CardTitle>
                      <CardDescription>
                        {workflow.submittedBy} • €{workflow.totalAmount.toFixed(2)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      {getStatusBadge(workflow.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>
                      Abgeschlossen: {workflow.steps[workflow.steps.length - 1]?.completedAt && 
                        new Date(workflow.steps[workflow.steps.length - 1].completedAt!).toLocaleDateString('de-DE')
                      }
                    </span>
                    <Button size="sm" variant="outline">
                      Details anzeigen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rejected">
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Keine abgelehnten Workflows vorhanden</p>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Workflow-Konfiguration
              </CardTitle>
              <CardDescription>
                Genehmigungsstufen, SLA-Zeiten und Eskalationsregeln verwalten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Standard Genehmigungsworkflow</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4" />
                      <div>
                        <div className="font-medium">1. Mitarbeiter Einreichung</div>
                        <div className="text-sm text-muted-foreground">Automatisch bei Übermittlung</div>
                      </div>
                    </div>
                    <Badge variant="default">Aktiv</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Building className="h-4 w-4" />
                      <div>
                        <div className="font-medium">2. Vorgesetzten-Genehmigung</div>
                        <div className="text-sm text-muted-foreground">SLA: 24 Stunden</div>
                      </div>
                    </div>
                    <Badge variant="default">Aktiv</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4" />
                      <div>
                        <div className="font-medium">3. Finance Prüfung</div>
                        <div className="text-sm text-muted-foreground">SLA: 48 Stunden</div>
                      </div>
                    </div>
                    <Badge variant="default">Aktiv</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4">Eskalationsregeln</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium mb-2">SLA-Überschreitung</div>
                    <div className="text-sm text-muted-foreground">
                      Automatische Benachrichtigung an nächsthöhere Instanz nach 150% der SLA-Zeit
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium mb-2">Abwesenheits-Vertretung</div>
                    <div className="text-sm text-muted-foreground">
                      Automatische Weiterleitung an Stellvertreter bei Abwesenheit {'>'}2 Tage
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4">Sonderregeln</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Schnellgenehmigung bei Beträgen {'<'}€50</div>
                      <div className="text-sm text-muted-foreground">Überspringt Vorgesetzten-Genehmigung</div>
                    </div>
                    <Badge variant="outline">Konfigurierbar</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Zusätzliche Prüfung bei Beträgen {'>'}€1.000</div>
                      <div className="text-sm text-muted-foreground">Geschäftsführer-Genehmigung erforderlich</div>
                    </div>
                    <Badge variant="outline">Konfigurierbar</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpenseWorkflowTab;