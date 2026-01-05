
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '@/services/documentService';
import type { DocumentCategory, DocumentStatus } from '@/types/documents';

interface UseDocumentsOptions {
  category?: DocumentCategory;
  status?: DocumentStatus;
  search?: string;
  employee_id?: string;
}

export const useDocuments = (options?: UseDocumentsOptions) => {
  return useQuery({
    queryKey: ['documents', options],
    queryFn: () => documentService.getDocuments(options),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useDocument = (id: string) => {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => documentService.getDocumentById(id),
    enabled: !!id,
  });
};

export const useDocumentStats = () => {
  return useQuery({
    queryKey: ['document-stats'],
    queryFn: () => documentService.getDocumentStats(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useCreateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentService.createDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-stats'] });
    },
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      documentService.updateDocument(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', data.id] });
      queryClient.invalidateQueries({ queryKey: ['document-stats'] });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentService.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-stats'] });
    },
  });
};

export const useSearchDocuments = (query: string) => {
  return useQuery({
    queryKey: ['documents-search', query],
    queryFn: () => documentService.searchDocuments(query),
    enabled: query.length > 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
