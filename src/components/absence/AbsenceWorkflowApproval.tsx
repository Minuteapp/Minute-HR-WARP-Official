import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, User, ArrowRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface WorkflowApprover {
  id: string;
  user_id: string;
  role: string;
  step_order: number;
  status: 'pending' | 'approved' | 'rejected';
  approved_at?: string;
  rejection_reason?: string;
  approver_name?: string;
}

interface AbsenceWorkflowApprovalProps {
  absenceRequestId: string;
  currentStatus: string;
}

export const AbsenceWorkflowApproval: React.FC<AbsenceWorkflowApprovalProps> = ({
  absenceRequestId,
  currentStatus
}) => {
  const queryClient = useQueryClient();
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Workflow-Daten laden
  const { data: workflow } = useQuery({
    queryKey: ['absence-workflow', absenceRequestId],
    queryFn: async () => {
      const { data: request } = await supabase
        .from('absence_requests')
        .select('approvers, workflow_step')
        .eq('id', absenceRequestId)
        .single();

      if (!request) return null;

      return {
        approvers: (request.approvers || []) as WorkflowApprover[],
        currentStep: request.workflow_step || 'submitted'
      };
    }
  });

  // Genehmigen
  const approveMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht authentifiziert');

      // Aktualisiere Approvers Array
      const updatedApprovers = (workflow?.approvers || []).map(approver => {
        if (approver.user_id === user.id && approver.status === 'pending') {
          return {
            ...approver,
            status: 'approved' as const,
            approved_at: new Date().toISOString()
          };
        }
        return approver;
      });

      // Prüfe ob alle genehmigt haben
      const allApproved = updatedApprovers.every(a => a.status === 'approved');
      const currentApproverIndex = updatedApprovers.findIndex(a => a.user_id === user.id);
      const nextStep = currentApproverIndex < updatedApprovers.length - 1 
        ? `step_${currentApproverIndex + 2}` 
        : 'completed';

      const { error } = await supabase
        .from('absence_requests')
        .update({
          approvers: updatedApprovers,
          workflow_step: allApproved ? 'completed' : nextStep,
          status: allApproved ? 'approved' : 'pending',
          ...(allApproved && {
            approved_by: user.id,
            approved_at: new Date().toISOString()
          })
        })
        .eq('id', absenceRequestId);

      if (error) throw error;

      return allApproved;
    },
    onSuccess: (allApproved) => {
      toast.success(allApproved ? 'Antrag genehmigt' : 'Genehmigung erfolgreich - Weitergeleitet an nächsten Genehmiger');
      queryClient.invalidateQueries({ queryKey: ['absence-workflow'] });
      queryClient.invalidateQueries({ queryKey: ['absenceRequests'] });
    },
    onError: (error) => {
      console.error('Genehmigungsfehler:', error);
      toast.error('Fehler bei der Genehmigung');
    }
  });

  // Ablehnen
  const rejectMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht authentifiziert');

      const updatedApprovers = (workflow?.approvers || []).map(approver => {
        if (approver.user_id === user.id) {
          return {
            ...approver,
            status: 'rejected' as const,
            rejection_reason: rejectionReason
          };
        }
        return approver;
      });

      const { error } = await supabase
        .from('absence_requests')
        .update({
          approvers: updatedApprovers,
          workflow_step: 'rejected',
          status: 'rejected',
          rejected_by: user.id,
          rejected_at: new Date().toISOString(),
          rejection_reason: rejectionReason
        })
        .eq('id', absenceRequestId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Antrag abgelehnt');
      setShowRejectDialog(false);
      setRejectionReason('');
      queryClient.invalidateQueries({ queryKey: ['absence-workflow'] });
      queryClient.invalidateQueries({ queryKey: ['absenceRequests'] });
    },
    onError: (error) => {
      console.error('Ablehnungsfehler:', error);
      toast.error('Fehler bei der Ablehnung');
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  if (!workflow || workflow.approvers.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Genehmigungs-Workflow
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Workflow-Schritte */}
        <div className="space-y-3">
          {workflow.approvers.map((approver, index) => (
            <div key={approver.id}>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  {getStatusIcon(approver.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      Schritt {approver.step_order}: {approver.role}
                    </span>
                    <Badge variant="outline" className={getStatusColor(approver.status)}>
                      {approver.status === 'approved' ? 'Genehmigt' : 
                       approver.status === 'rejected' ? 'Abgelehnt' : 'Ausstehend'}
                    </Badge>
                  </div>
                  {approver.approver_name && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {approver.approver_name}
                    </p>
                  )}
                  {approver.approved_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Genehmigt am {format(new Date(approver.approved_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                    </p>
                  )}
                  {approver.rejection_reason && (
                    <p className="text-xs text-red-600 mt-1">
                      Grund: {approver.rejection_reason}
                    </p>
                  )}
                </div>
              </div>
              {index < workflow.approvers.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Aktionen für aktuellen Genehmiger */}
        {currentStatus === 'pending' && (
          <div className="pt-4 border-t space-y-2">
            {!showRejectDialog ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Genehmigen
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Ablehnen
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Textarea
                  placeholder="Ablehnungsgrund (optional)"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectDialog(false);
                      setRejectionReason('');
                    }}
                    className="flex-1"
                  >
                    Abbrechen
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => rejectMutation.mutate()}
                    disabled={rejectMutation.isPending}
                    className="flex-1"
                  >
                    Ablehnung bestätigen
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
