
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { useApprovalWorkflows, useApproveWorkflowStep } from '@/hooks/useBudgetEnterprise';

export const BudgetApprovalCenter = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  
  const { data: workflows = [], isLoading } = useApprovalWorkflows();
  const approveStep = useApproveWorkflowStep();

  const handleApprove = (workflowId: string, stepId: string) => {
    approveStep.mutate({ workflowId, stepId });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-orange-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget-Genehmigungen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4">Lade Genehmigungen...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget-Genehmigungen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workflows.length === 0 ? (
            <p className="text-center py-4 text-gray-500">
              Keine ausstehenden Genehmigungen
            </p>
          ) : (
            workflows.map((workflow) => (
              <div key={workflow.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{workflow.workflow_name}</h3>
                    <Badge variant={workflow.status === 'pending' ? 'default' : 'secondary'}>
                      {workflow.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    Ebene {workflow.current_level} von {workflow.approval_levels.length}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {workflow.approvals.map((approval) => (
                    <div key={approval.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(approval.status)}
                        <span className="font-medium">{approval.approver_name}</span>
                        <Badge variant="outline">{approval.approval_level}</Badge>
                      </div>
                      
                      {approval.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleApprove(workflow.id, approval.id)}
                            disabled={approveStep.isPending}
                          >
                            Genehmigen
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            disabled={approveStep.isPending}
                          >
                            Ablehnen
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
