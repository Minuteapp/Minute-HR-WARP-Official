
import { Task } from "@/types/tasks";
import { Clock, Edit, Check, AlertTriangle, AlertCircle } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityTabContentProps {
  task: Task;
}

export const ActivityTabContent = ({ task }: ActivityTabContentProps) => {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['task-activities', task.id],
    queryFn: async () => {
      // In Zukunft: Echte Aktivitäten aus einer task_activities Tabelle laden
      // Aktuell gibt es keine solche Tabelle, daher leeres Array zurückgeben
      return [];
    },
    enabled: !!task.id
  });

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'status_change':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'priority_change':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'comment_added':
        return <Edit className="h-4 w-4 text-purple-500" />;
      case 'subtask_completed':
        return <Check className="h-4 w-4 text-green-500" />;
      default:
        return <Edit className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium mb-4">Aktivitätsverlauf</h3>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium mb-4">Aktivitätsverlauf</h3>
      
      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity: any) => (
            <div key={activity.id} className="flex gap-3">
              <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">{activity.user}</p>
                  <span className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Keine Aktivitäten gefunden</p>
        </div>
      )}
    </div>
  );
};
