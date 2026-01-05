
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentLinkingService } from '@/services/documentLinkingService';

export const useLinkedProjects = (documentId: string) => {
  return useQuery({
    queryKey: ['document-linked-projects', documentId],
    queryFn: () => documentLinkingService.getLinkedProjects(documentId),
    enabled: !!documentId,
  });
};

export const useLinkedTasks = (documentId: string) => {
  return useQuery({
    queryKey: ['document-linked-tasks', documentId],
    queryFn: () => documentLinkingService.getLinkedTasks(documentId),
    enabled: !!documentId,
  });
};

export const useCreateDocumentProjectLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, projectId, relevanceScore = 1.0 }: { 
      documentId: string; 
      projectId: string; 
      relevanceScore?: number; 
    }) => documentLinkingService.createDocumentProjectLink(documentId, projectId, relevanceScore),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-linked-projects'] });
    },
  });
};

export const useCreateDocumentTaskLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, taskId, relevanceScore = 1.0 }: { 
      documentId: string; 
      taskId: string; 
      relevanceScore?: number; 
    }) => documentLinkingService.createDocumentTaskLink(documentId, taskId, relevanceScore),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-linked-tasks'] });
    },
  });
};

export const useRemoveDocumentProjectLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (linkId: string) => documentLinkingService.removeDocumentProjectLink(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-linked-projects'] });
    },
  });
};

export const useRemoveDocumentTaskLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (linkId: string) => documentLinkingService.removeDocumentTaskLink(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-linked-tasks'] });
    },
  });
};

export const useSimilarDocuments = (documentId: string) => {
  return useQuery({
    queryKey: ['similar-documents', documentId],
    queryFn: () => documentLinkingService.getSimilarDocuments(documentId),
    enabled: !!documentId,
  });
};

export const useLinkingRules = () => {
  return useQuery({
    queryKey: ['document-linking-rules'],
    queryFn: () => documentLinkingService.getLinkingRules(),
  });
};

export const useTriggerAutoLinking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => documentLinkingService.triggerAutoLinking(documentId),
    onSuccess: (_, documentId) => {
      queryClient.invalidateQueries({ queryKey: ['document-linked-projects', documentId] });
      queryClient.invalidateQueries({ queryKey: ['document-linked-tasks', documentId] });
    },
  });
};
