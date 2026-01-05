
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApprovalService, ProjectApproval } from './services/projectApprovalService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useProjectApprovals = (projectId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    data: projectApprovals = [],
    isLoading: approvalsLoading
  } = useQuery({
    queryKey: ['project-approvals', projectId],
    queryFn: () => projectApprovalService.getProjectApprovals(projectId!),
    enabled: !!projectId,
  });

  const {
    data: approvalRequests = [],
    isLoading: requestsLoading
  } = useQuery({
    queryKey: ['approval-requests', user?.id],
    queryFn: () => projectApprovalService.getApprovalRequests(user!.id),
    enabled: !!user?.id,
  });

  const {
    data: approvalStatus,
    isLoading: statusLoading
  } = useQuery({
    queryKey: ['approval-status', projectId],
    queryFn: () => projectApprovalService.checkApprovalStatus(projectId!),
    enabled: !!projectId,
  });

  const requestApprovalMutation = useMutation({
    mutationFn: ({ 
      approverId, 
      approvalType, 
      comments 
    }: { 
      approverId: string; 
      approvalType: ProjectApproval['approval_type']; 
      comments?: string;
    }) => projectApprovalService.requestApproval(projectId!, approverId, approvalType, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-approvals', projectId] });
      queryClient.invalidateQueries({ queryKey: ['approval-status', projectId] });
      toast.success('Genehmigungsanfrage gesendet');
    },
    onError: (error) => {
      console.error('Error requesting approval:', error);
      toast.error('Fehler beim Senden der Genehmigungsanfrage');
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ approvalId, comments }: { approvalId: string; comments?: string }) =>
      projectApprovalService.approveRequest(approvalId, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
      queryClient.invalidateQueries({ queryKey: ['approval-status'] });
      toast.success('Genehmigung erteilt');
    },
    onError: (error) => {
      console.error('Error approving request:', error);
      toast.error('Fehler beim Erteilen der Genehmigung');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ approvalId, comments }: { approvalId: string; comments?: string }) =>
      projectApprovalService.rejectRequest(approvalId, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
      queryClient.invalidateQueries({ queryKey: ['approval-status'] });
      toast.success('Genehmigung abgelehnt');
    },
    onError: (error) => {
      console.error('Error rejecting request:', error);
      toast.error('Fehler beim Ablehnen der Genehmigung');
    },
  });

  return {
    projectApprovals,
    approvalRequests,
    approvalStatus,
    isLoading: approvalsLoading || requestsLoading || statusLoading,
    requestApproval: requestApprovalMutation.mutateAsync,
    approve: approveMutation.mutateAsync,
    reject: rejectMutation.mutateAsync,
    isRequesting: requestApprovalMutation.isPending,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
};
