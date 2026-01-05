import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApprovalService } from '@/services/documents/documentApprovalService';
import { toast } from 'sonner';

export const useDocumentApprovals = (documentId?: string) => {
  const queryClient = useQueryClient();

  const {
    data: approvals = [],
    isLoading: approvalsLoading
  } = useQuery({
    queryKey: ['document-approvals', documentId],
    queryFn: () => documentApprovalService.getDocumentApprovals(documentId!),
    enabled: !!documentId,
  });

  const approveMutation = useMutation({
    mutationFn: async ({ approvalId, documentId, comments }: { approvalId: string; documentId: string; comments?: string }) => {
      // Erst den Approval-Status aktualisieren
      const result = await documentApprovalService.approveDocument(approvalId, comments);
      
      // Dann die E-Mail-Benachrichtigung senden
      const { documentService } = await import('@/services/documentService');
      await documentService.approveDocument(documentId);
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Dokument genehmigt - Benachrichtigung gesendet');
    },
    onError: (error) => {
      console.error('Error approving document:', error);
      toast.error('Fehler beim Genehmigen des Dokuments');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ approvalId, documentId, reason }: { approvalId: string; documentId: string; reason: string }) => {
      // Erst den Approval-Status aktualisieren
      const result = await documentApprovalService.rejectDocument(approvalId, reason);
      
      // Dann die E-Mail-Benachrichtigung senden
      const { documentService } = await import('@/services/documentService');
      await documentService.rejectDocument(documentId, reason);
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Dokument abgelehnt - Benachrichtigung gesendet');
    },
    onError: (error) => {
      console.error('Error rejecting document:', error);
      toast.error('Fehler beim Ablehnen des Dokuments');
    },
  });

  return {
    approvals,
    isLoading: approvalsLoading,
    approveDocument: approveMutation.mutateAsync,
    rejectDocument: rejectMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
};

export const usePendingApprovals = (userId?: string) => {
  return useQuery({
    queryKey: ['pending-approvals', userId],
    queryFn: () => documentApprovalService.getPendingApprovals(userId!),
    enabled: !!userId,
  });
};