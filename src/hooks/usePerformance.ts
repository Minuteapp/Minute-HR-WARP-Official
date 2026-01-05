
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { performanceService } from '@/services/performanceService';
import { useToast } from '@/hooks/use-toast';
import type {
  PerformanceTemplate,
  PerformanceReview,
  CreatePerformanceReviewRequest,
  CreatePerformanceTemplateRequest
} from '@/types/performance';

export const usePerformanceTemplates = () => {
  return useQuery({
    queryKey: ['performance-templates'],
    queryFn: () => performanceService.getTemplates(),
  });
};

export const usePerformanceTemplate = (id: string) => {
  return useQuery({
    queryKey: ['performance-template', id],
    queryFn: () => performanceService.getTemplate(id),
    enabled: !!id,
  });
};

export const useCreatePerformanceTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (template: CreatePerformanceTemplateRequest) =>
      performanceService.createTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-templates'] });
      toast({
        title: "Template erstellt",
        description: "Das Performance-Template wurde erfolgreich erstellt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Das Template konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });
};

export const usePerformanceReviews = (filters?: { employee_id?: string; reviewer_id?: string; status?: string }) => {
  return useQuery({
    queryKey: ['performance-reviews', filters],
    queryFn: () => performanceService.getReviews(filters),
  });
};

export const usePerformanceReview = (id: string) => {
  return useQuery({
    queryKey: ['performance-review', id],
    queryFn: () => performanceService.getReview(id),
    enabled: !!id,
  });
};

export const useCreatePerformanceReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (review: CreatePerformanceReviewRequest) =>
      performanceService.createReview(review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      toast({
        title: "Review erstellt",
        description: "Das Performance-Review wurde erfolgreich erstellt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Das Review konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdatePerformanceReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PerformanceReview> }) =>
      performanceService.updateReview(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['performance-review', data.id] });
      toast({
        title: "Review aktualisiert",
        description: "Das Review wurde erfolgreich aktualisiert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Das Review konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });
};

export const useSubmitPerformanceReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, scores, feedback }: { id: string; scores: Record<string, any>; feedback: Record<string, any> }) =>
      performanceService.submitReview(id, scores, feedback),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['performance-review', data.id] });
      toast({
        title: "Review eingereicht",
        description: "Das Review wurde erfolgreich eingereicht.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Das Review konnte nicht eingereicht werden.",
        variant: "destructive",
      });
    },
  });
};

export const usePerformanceMetrics = () => {
  return useQuery({
    queryKey: ['performance-metrics'],
    queryFn: () => performanceService.getMetrics(),
  });
};

export const usePerformanceCycles = () => {
  return useQuery({
    queryKey: ['performance-cycles'],
    queryFn: () => performanceService.getCycles(),
  });
};

export const useEmployeeAnalytics = (employeeId: string) => {
  return useQuery({
    queryKey: ['performance-analytics', employeeId],
    queryFn: () => performanceService.getEmployeeAnalytics(employeeId),
    enabled: !!employeeId,
  });
};

export const usePerformanceNotifications = (userId?: string) => {
  return useQuery({
    queryKey: ['performance-notifications', userId],
    queryFn: () => performanceService.getNotifications(userId),
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => performanceService.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-notifications'] });
    },
  });
};
