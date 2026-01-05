import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentSignatureService } from '@/services/documents/documentSignatureService';
import { toast } from 'sonner';

export const useDocumentSignatures = (documentId?: string) => {
  const queryClient = useQueryClient();

  const {
    data: signatures = [],
    isLoading: signaturesLoading
  } = useQuery({
    queryKey: ['document-signatures', documentId],
    queryFn: () => documentSignatureService.getDocumentSignatures(documentId!),
    enabled: !!documentId,
  });

  const signMutation = useMutation({
    mutationFn: ({ 
      documentId, 
      signatureData, 
      signatureType 
    }: { 
      documentId: string; 
      signatureData: any; 
      signatureType?: 'digital' | 'electronic' | 'biometric';
    }) => documentSignatureService.createSignature(documentId, signatureData, signatureType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-signatures'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Dokument erfolgreich signiert');
    },
    onError: (error) => {
      console.error('Error signing document:', error);
      toast.error('Fehler beim Signieren des Dokuments');
    },
  });

  return {
    signatures,
    isLoading: signaturesLoading,
    signDocument: signMutation.mutateAsync,
    isSigning: signMutation.isPending,
  };
};