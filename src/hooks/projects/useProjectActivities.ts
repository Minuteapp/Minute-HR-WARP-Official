
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectActivityService, ProjectActivity } from './services/projectActivityService';
import { useAuth } from '@/contexts/AuthContext';

export const useProjectActivities = (projectId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    data: activities = [],
    isLoading
  } = useQuery({
    queryKey: ['project-activities', projectId],
    queryFn: () => projectActivityService.getProjectActivities(projectId!),
    enabled: !!projectId,
  });

  const {
    data: userActivities = [],
    isLoading: userActivitiesLoading
  } = useQuery({
    queryKey: ['user-activities', user?.id],
    queryFn: () => projectActivityService.getUserActivities(user!.id),
    enabled: !!user?.id,
  });

  const {
    data: recentActivities = [],
    isLoading: recentActivitiesLoading
  } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: () => projectActivityService.getRecentActivities(10),
  });

  const logActivityMutation = useMutation({
    mutationFn: ({ 
      activityType, 
      description, 
      metadata = {} 
    }: { 
      activityType: string; 
      description: string; 
      metadata?: Record<string, any>;
    }) => projectActivityService.logActivity(projectId!, activityType, description, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-activities', projectId] });
      queryClient.invalidateQueries({ queryKey: ['user-activities', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['recent-activities'] });
    },
    onError: (error) => {
      console.error('Error logging activity:', error);
    },
  });

  return {
    activities,
    userActivities,
    recentActivities,
    isLoading: isLoading || userActivitiesLoading || recentActivitiesLoading,
    logActivity: logActivityMutation.mutateAsync,
    isLogging: logActivityMutation.isPending,
  };
};
