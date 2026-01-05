
import { useQuery } from '@tanstack/react-query';
import { taskNotificationService, EmployeeTaskActivity } from '@/services/taskNotificationService';

export const useEmployeeTaskActivities = (employeeId: string) => {
  const { data: activities = [], isLoading, error } = useQuery({
    queryKey: ['employeeTaskActivities', employeeId],
    queryFn: () => taskNotificationService.getEmployeeTaskActivities(employeeId),
    enabled: !!employeeId,
  });

  // Aktivitäten nach Typ gruppieren
  const getActivitiesByType = (type: EmployeeTaskActivity['activity_type']) => {
    return activities.filter(activity => activity.activity_type === type);
  };

  // Abgeschlossene Tasks
  const completedTasks = getActivitiesByType('completed');

  // Zugewiesene Tasks
  const assignedTasks = getActivitiesByType('assigned');

  // Statistiken
  const stats = {
    totalActivities: activities.length,
    completedTasksCount: completedTasks.length,
    assignedTasksCount: assignedTasks.length,
    recentActivities: activities.slice(0, 5), // Letzte 5 Aktivitäten
  };

  return {
    activities,
    completedTasks,
    assignedTasks,
    stats,
    isLoading,
    error,
    getActivitiesByType
  };
};
