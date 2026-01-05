import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface WorkflowInstance {
  id: string;
  reference_id: string;
  reference_type: string;
  status: string;
  current_step: number;
  workflow_data: any;
  created_at: string;
  due_date?: string;
  initiated_by: string;
  current_approver: string;
  workflow_templates: {
    name: string;
    workflow_type: string;
  };
  workflow_steps: Array<{
    id: string;
    step_number: number;
    step_type: string;
    status: string;
    approver_role: string;
    comments?: string;
    decision_date?: string;
  }>;
}

interface ApprovalQueueProps {
  onStatsUpdate: () => void;
}

export const ApprovalQueue = ({ onStatsUpdate }: ApprovalQueueProps) => {
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowInstance | null>(null);
  const [comments, setComments] = useState('');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchApprovalQueue();
  }, []);

  const fetchApprovalQueue = async () => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return;

      const { data, error } = await supabase
        .from('workflow_instances')
        .select(`
          *,
          workflow_templates(name, workflow_type),
          workflow_steps(*)
        `)
        .eq('current_approver', currentUser.user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler beim Laden der Genehmigungsqueue",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (workflowId: string, stepNumber: number, decision: 'approved' | 'rejected') => {
    setProcessing(true);
    try {
      const { error } = await supabase.rpc('approve_workflow_step', {
        p_workflow_instance_id: workflowId,
        p_step_number: stepNumber,
        p_decision: decision,
        p_comments: comments || null
      });

      if (error) throw error;

      toast({
        title: decision === 'approved' ? "Genehmigt" : "Abgelehnt",
        description: `Der Workflow wurde erfolgreich ${decision === 'approved' ? 'genehmigt' : 'abgelehnt'}.`
      });

      setSelectedWorkflow(null);
      setComments('');
      fetchApprovalQueue();
      onStatsUpdate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler bei der Genehmigung",
        description: error.message
      });
    } finally {
      setProcessing(false);
    }
  };

  const getWorkflowTypeDisplay = (type: string) => {
    switch (type) {
      case 'absence_approval': return 'Urlaubsantrag';
      case 'overtime_approval': return 'Überstunden';
      case 'expense_approval': return 'Ausgaben';
      default: return type;
    }
  };

  const getPriorityColor = (dueDate?: string) => {
    if (!dueDate) return 'bg-gray-100 text-gray-800';
    
    const due = new Date(dueDate);
    const now = new Date();
    const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilDue < 4) return 'bg-red-100 text-red-800';
    if (hoursUntilDue < 24) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Lade Genehmigungsqueue...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Ihre Genehmigungsqueue ({workflows.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {workflows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine ausstehenden Genehmigungen</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workflows.map((workflow) => {
                const currentStep = workflow.workflow_steps?.find(s => s.step_number === workflow.current_step);
                
                return (
                  <Card key={workflow.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getPriorityColor(workflow.due_date)}>
                              {getWorkflowTypeDisplay(workflow.workflow_templates.workflow_type)}
                            </Badge>
                            <span className="font-medium">{workflow.workflow_templates.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {formatDistanceToNow(new Date(workflow.created_at), { 
                                  addSuffix: true, 
                                  locale: de 
                                })}
                              </span>
                            </div>
                            {workflow.due_date && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  Fällig: {formatDistanceToNow(new Date(workflow.due_date), { 
                                    addSuffix: true, 
                                    locale: de 
                                  })}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="text-sm">
                            <span className="font-medium">Schritt {workflow.current_step}:</span>
                            <span className="ml-1">{currentStep?.approver_role || 'Unbekannt'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedWorkflow(workflow)}
                              >
                                Details ansehen
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Workflow Genehmigung</DialogTitle>
                              </DialogHeader>
                              
                              {selectedWorkflow && (
                                <div className="space-y-6">
                                  {/* Workflow Info */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Workflow Details</h4>
                                      <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">Typ:</span> {getWorkflowTypeDisplay(selectedWorkflow.workflow_templates.workflow_type)}</p>
                                        <p><span className="font-medium">Template:</span> {selectedWorkflow.workflow_templates.name}</p>
                                        <p><span className="font-medium">Status:</span> {selectedWorkflow.status}</p>
                                        <p><span className="font-medium">Schritt:</span> {selectedWorkflow.current_step}</p>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-medium mb-2">Zeitplan</h4>
                                      <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">Erstellt:</span> {new Date(selectedWorkflow.created_at).toLocaleString('de-DE')}</p>
                                        {selectedWorkflow.due_date && (
                                          <p><span className="font-medium">Fällig:</span> {new Date(selectedWorkflow.due_date).toLocaleString('de-DE')}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Workflow Data */}
                                  {selectedWorkflow.workflow_data && Object.keys(selectedWorkflow.workflow_data).length > 0 && (
                                    <div>
                                      <h4 className="font-medium mb-2">Antragsdetails</h4>
                                      <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                        <pre className="whitespace-pre-wrap">
                                          {JSON.stringify(selectedWorkflow.workflow_data, null, 2)}
                                        </pre>
                                      </div>
                                    </div>
                                  )}

                                  {/* Workflow Steps */}
                                  <div>
                                    <h4 className="font-medium mb-2">Workflow Schritte</h4>
                                    <div className="space-y-2">
                                      {selectedWorkflow.workflow_steps?.map((step, index) => (
                                        <div key={step.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                            step.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            step.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            step.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                            'bg-gray-100 text-gray-800'
                                          }`}>
                                            {index + 1}
                                          </div>
                                          <div className="flex-1">
                                            <div className="font-medium text-sm">{step.approver_role}</div>
                                            {step.comments && (
                                              <div className="text-xs text-muted-foreground">{step.comments}</div>
                                            )}
                                          </div>
                                          <Badge variant={
                                            step.status === 'approved' ? 'default' :
                                            step.status === 'rejected' ? 'destructive' :
                                            step.status === 'pending' ? 'secondary' : 'outline'
                                          }>
                                            {step.status}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Action Area */}
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium mb-2">
                                        Kommentar (optional)
                                      </label>
                                      <Textarea
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        placeholder="Fügen Sie einen Kommentar zu Ihrer Entscheidung hinzu..."
                                        rows={3}
                                      />
                                    </div>

                                    <div className="flex gap-3">
                                      <Button
                                        onClick={() => handleApproval(selectedWorkflow.id, selectedWorkflow.current_step, 'approved')}
                                        disabled={processing}
                                        className="flex-1"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Genehmigen
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={() => handleApproval(selectedWorkflow.id, selectedWorkflow.current_step, 'rejected')}
                                        disabled={processing}
                                        className="flex-1"
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Ablehnen
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};