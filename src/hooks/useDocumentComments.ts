import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentCommentService } from '@/services/documents/documentCommentService';
import { toast } from 'sonner';

export const useDocumentComments = (documentId?: string) => {
  const queryClient = useQueryClient();

  const {
    data: comments = [],
    isLoading: commentsLoading
  } = useQuery({
    queryKey: ['document-comments', documentId],
    queryFn: () => documentCommentService.getDocumentComments(documentId!),
    enabled: !!documentId,
  });

  const createMutation = useMutation({
    mutationFn: ({ documentId, commentText }: { documentId: string; commentText: string }) =>
      documentCommentService.createComment(documentId, commentText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-comments'] });
      toast.success('Kommentar hinzugefügt');
    },
    onError: (error) => {
      console.error('Error creating comment:', error);
      toast.error('Fehler beim Hinzufügen des Kommentars');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ commentId, commentText }: { commentId: string; commentText: string }) =>
      documentCommentService.updateComment(commentId, commentText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-comments'] });
      toast.success('Kommentar aktualisiert');
    },
    onError: (error) => {
      console.error('Error updating comment:', error);
      toast.error('Fehler beim Aktualisieren des Kommentars');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) =>
      documentCommentService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-comments'] });
      toast.success('Kommentar gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting comment:', error);
      toast.error('Fehler beim Löschen des Kommentars');
    },
  });

  return {
    comments,
    isLoading: commentsLoading,
    createComment: createMutation.mutateAsync,
    updateComment: updateMutation.mutateAsync,
    deleteComment: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
