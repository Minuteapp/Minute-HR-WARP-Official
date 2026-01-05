import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Clock, XCircle, AlertCircle, FileText, User, Calendar, MessageSquare } from "lucide-react";

interface ApprovalStep {
  id: string;
  step: number;
  title: string;
  approver: string;
  approverInitials: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  date?: string;
  comment?: string;
}

interface BudgetApprovalRequest {
  id: string;
  projectName: string;
  requestType: 'initial' | 'change' | 'additional';
  amount: number;
  requestedBy: string;
  requestDate: string;
  currentStep: number;
  totalSteps: number;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress';
  steps: ApprovalStep[];
  description: string;
  documents?: string[];
}

const approvalRequests: BudgetApprovalRequest[] = [
  {
    id: 'BA-2025-001',
    projectName: 'ERP Migration',
    requestType: 'change',
    amount: 50000,
    requestedBy: 'Anna Schmidt',
    requestDate: '15.10.2025',
    currentStep: 2,
    totalSteps: 3,
    status: 'in_progress',
    description: 'Zusätzliche Ressourcen für Performance-Optimierung benötigt',
    documents: ['Budget_Change_Request.pdf', 'Kostenaufstellung.xlsx'],
    steps: [
      {
        id: '1',
        step: 1,
        title: 'Projektleiter Genehmigung',
        approver: 'Max Müller',
        approverInitials: 'MM',
        status: 'approved',
        date: '15.10.2025',
        comment: 'Genehmigt - Performance-Optimierung ist kritisch'
      },
      {
        id: '2',
        step: 2,
        title: 'Abteilungsleiter Prüfung',
        approver: 'Sarah Weber',
        approverInitials: 'SW',
        status: 'in_review',
        date: '16.10.2025'
      },
      {
        id: '3',
        step: 3,
        title: 'CFO Freigabe',
        approver: 'Tom Fischer',
        approverInitials: 'TF',
        status: 'pending'
      }
    ]
  },
  {
    id: 'BA-2025-002',
    projectName: 'Cloud Infrastructure',
    requestType: 'initial',
    amount: 1200000,
    requestedBy: 'Sarah Weber',
    requestDate: '10.10.2025',
    currentStep: 3,
    totalSteps: 3,
    status: 'approved',
    description: 'Initiales Projektbudget für Cloud Migration',
    documents: ['Projekt_Budget_Plan.pdf'],
    steps: [
      {
        id: '1',
        step: 1,
        title: 'Projektleiter Genehmigung',
        approver: 'Max Müller',
        approverInitials: 'MM',
        status: 'approved',
        date: '10.10.2025',
        comment: 'Genehmigt'
      },
      {
        id: '2',
        step: 2,
        title: 'Abteilungsleiter Prüfung',
        approver: 'Anna Schmidt',
        approverInitials: 'AS',
        status: 'approved',
        date: '11.10.2025',
        comment: 'Budget ist angemessen'
      },
      {
        id: '3',
        step: 3,
        title: 'CFO Freigabe',
        approver: 'Tom Fischer',
        approverInitials: 'TF',
        status: 'approved',
        date: '12.10.2025',
        comment: 'Final freigegeben'
      }
    ]
  },
  {
    id: 'BA-2025-003',
    projectName: 'Mobile App Redesign',
    requestType: 'additional',
    amount: 80000,
    requestedBy: 'Lisa Hoffmann',
    requestDate: '18.10.2025',
    currentStep: 1,
    totalSteps: 3,
    status: 'pending',
    description: 'Zusatzbudget für erweiterte Features und A/B Testing',
    documents: ['Feature_Specification.pdf', 'ROI_Analysis.xlsx'],
    steps: [
      {
        id: '1',
        step: 1,
        title: 'Projektleiter Genehmigung',
        approver: 'Max Müller',
        approverInitials: 'MM',
        status: 'pending'
      },
      {
        id: '2',
        step: 2,
        title: 'Abteilungsleiter Prüfung',
        approver: 'Sarah Weber',
        approverInitials: 'SW',
        status: 'pending'
      },
      {
        id: '3',
        step: 3,
        title: 'CFO Freigabe',
        approver: 'Tom Fischer',
        approverInitials: 'TF',
        status: 'pending'
      }
    ]
  }
];

const invoiceTracking = [
  {
    id: 'INV-001',
    vendor: 'AWS Cloud Services',
    project: 'Cloud Infrastructure',
    amount: 45000,
    invoiceDate: '01.10.2025',
    dueDate: '15.10.2025',
    status: 'paid',
    paidDate: '12.10.2025'
  },
  {
    id: 'INV-002',
    vendor: 'Freelancer - UI Design',
    project: 'Mobile App Redesign',
    amount: 12000,
    invoiceDate: '05.10.2025',
    dueDate: '20.10.2025',
    status: 'pending'
  },
  {
    id: 'INV-003',
    vendor: 'SAP Consulting',
    project: 'ERP Migration',
    amount: 95000,
    invoiceDate: '08.10.2025',
    dueDate: '22.10.2025',
    status: 'approved'
  }
];

const formatCurrency = (value: number) => `€${(value / 1000).toFixed(0)}K`;

const getStatusIcon = (status: ApprovalStep['status']) => {
  switch (status) {
    case 'approved':
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case 'in_review':
      return <Clock className="h-5 w-5 text-orange-600" />;
    case 'rejected':
      return <XCircle className="h-5 w-5 text-red-600" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-400" />;
  }
};

export const BudgetApprovalWorkflow = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="approvals" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="approvals">Freigaben</TabsTrigger>
          <TabsTrigger value="invoices">Rechnungen</TabsTrigger>
          <TabsTrigger value="history">Historie</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-orange-100">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ausstehend</p>
                    <p className="text-2xl font-bold">2</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <AlertCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">In Prüfung</p>
                    <p className="text-2xl font-bold">1</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-green-100">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Genehmigt</p>
                    <p className="text-2xl font-bold">1</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-red-100">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Abgelehnt</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Approval Requests */}
          <div className="space-y-4">
            {approvalRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{request.projectName}</CardTitle>
                        <Badge variant="outline">{request.id}</Badge>
                        <Badge 
                          className={
                            request.requestType === 'initial' ? 'bg-blue-500' :
                            request.requestType === 'change' ? 'bg-orange-500' :
                            'bg-purple-500'
                          }
                        >
                          {request.requestType === 'initial' ? 'Initial' :
                           request.requestType === 'change' ? 'Änderung' :
                           'Zusätzlich'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{request.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatCurrency(request.amount)}</p>
                      <Badge 
                        className={
                          request.status === 'approved' ? 'bg-green-500' :
                          request.status === 'in_progress' ? 'bg-blue-500' :
                          request.status === 'rejected' ? 'bg-red-500' :
                          'bg-gray-500'
                        }
                      >
                        {request.status === 'approved' ? 'Genehmigt' :
                         request.status === 'in_progress' ? 'In Bearbeitung' :
                         request.status === 'rejected' ? 'Abgelehnt' :
                         'Ausstehend'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{request.requestedBy}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{request.requestDate}</span>
                    </div>
                    {request.documents && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{request.documents.length} Dokumente</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium">Fortschritt</span>
                      <span className="text-muted-foreground">
                        Schritt {request.currentStep} von {request.totalSteps}
                      </span>
                    </div>
                    <Progress value={(request.currentStep / request.totalSteps) * 100} className="h-2" />
                  </div>

                  {/* Approval Steps */}
                  <div className="space-y-3">
                    {request.steps.map((step) => (
                      <div 
                        key={step.id} 
                        className={`flex items-start gap-4 p-4 border rounded-lg ${
                          step.status === 'approved' ? 'bg-green-50 border-green-200' :
                          step.status === 'in_review' ? 'bg-orange-50 border-orange-200' :
                          step.status === 'rejected' ? 'bg-red-50 border-red-200' :
                          'bg-muted/50'
                        }`}
                      >
                        <div className="mt-1">
                          {getStatusIcon(step.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">Schritt {step.step}:</span>
                            <span className="font-medium">{step.title}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                                {step.approverInitials}
                              </div>
                              <span className="text-sm">{step.approver}</span>
                            </div>
                            {step.date && (
                              <span className="text-sm text-muted-foreground">{step.date}</span>
                            )}
                          </div>
                          {step.comment && (
                            <div className="flex items-start gap-2 mt-2 p-2 bg-white/50 rounded">
                              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <p className="text-sm text-muted-foreground">{step.comment}</p>
                            </div>
                          )}
                        </div>
                        {step.status === 'in_review' && (
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-green-600">Genehmigen</Button>
                            <Button size="sm" variant="outline" className="text-red-600">Ablehnen</Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rechnungsverfolgung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Rechnungs-Nr.</th>
                      <th className="text-left py-3 px-4 font-medium">Lieferant</th>
                      <th className="text-left py-3 px-4 font-medium">Projekt</th>
                      <th className="text-left py-3 px-4 font-medium">Betrag</th>
                      <th className="text-left py-3 px-4 font-medium">Rechnungsdatum</th>
                      <th className="text-left py-3 px-4 font-medium">Fälligkeitsdatum</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceTracking.map((invoice) => (
                      <tr key={invoice.id} className="border-b">
                        <td className="py-3 px-4 font-medium">{invoice.id}</td>
                        <td className="py-3 px-4">{invoice.vendor}</td>
                        <td className="py-3 px-4 text-muted-foreground">{invoice.project}</td>
                        <td className="py-3 px-4 font-semibold">{formatCurrency(invoice.amount)}</td>
                        <td className="py-3 px-4 text-sm">{invoice.invoiceDate}</td>
                        <td className="py-3 px-4 text-sm">{invoice.dueDate}</td>
                        <td className="py-3 px-4">
                          <Badge 
                            className={
                              invoice.status === 'paid' ? 'bg-green-500' :
                              invoice.status === 'approved' ? 'bg-blue-500' :
                              'bg-orange-500'
                            }
                          >
                            {invoice.status === 'paid' ? 'Bezahlt' :
                             invoice.status === 'approved' ? 'Genehmigt' :
                             'Ausstehend'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget-Revision-Historie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">Budget-Anpassung ERP Migration</p>
                      <p className="text-sm text-muted-foreground mt-1">Version 2.1 → 2.2</p>
                      <p className="text-sm text-muted-foreground">15.10.2025 von Anna Schmidt</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">+€50K</p>
                      <Badge className="bg-green-500 mt-2">Genehmigt</Badge>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">Initiales Budget Cloud Infrastructure</p>
                      <p className="text-sm text-muted-foreground mt-1">Version 1.0</p>
                      <p className="text-sm text-muted-foreground">10.10.2025 von Sarah Weber</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">€1.200K</p>
                      <Badge className="bg-green-500 mt-2">Genehmigt</Badge>
                    </div>
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
