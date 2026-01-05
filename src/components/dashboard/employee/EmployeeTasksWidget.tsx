import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Circle, CheckCircle2, AlertCircle, Inbox } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';

type TaskPriority = 'high' | 'medium' | 'low';

export const EmployeeTasksWidget: React.FC = () => {
  const { companyId } = useCompanyId();

  const { data: taskData, isLoading } = useQuery({
    queryKey: ['employee-tasks', companyId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !companyId) return { tasks: [], completedCount: 0, activeCount: 0, overdueCount: 0 };

      // Aufgaben für den aktuellen User abrufen
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, priority, status, due_date, created_by')
        .eq('company_id', companyId)
        .or(`created_by.eq.${user.id},assigned_to.cs.{${user.id}}`)
        .order('due_date', { ascending: true, nullsFirst: false })
        .limit(10);

      const allTasks = tasks || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const completedCount = allTasks.filter(t => t.status === 'completed' || t.status === 'done').length;
      const activeCount = allTasks.filter(t => t.status !== 'completed' && t.status !== 'done').length;
      const overdueCount = allTasks.filter(t => {
        if (!t.due_date || t.status === 'completed' || t.status === 'done') return false;
        return new Date(t.due_date) < today;
      }).length;

      return {
        tasks: allTasks.slice(0, 5),
        completedCount,
        activeCount,
        overdueCount
      };
    },
    enabled: !!companyId
  });

  const tasks = taskData?.tasks || [];
  const completedCount = taskData?.completedCount || 0;
  const activeCount = taskData?.activeCount || 0;
  const overdueCount = taskData?.overdueCount || 0;
  const totalCount = completedCount + activeCount;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const getPriorityBadge = (priority: string | null) => {
    const p = priority?.toLowerCase() as TaskPriority;
    switch (p) {
      case 'high':
        return <Badge variant="outline" className="text-[9px] bg-red-100 text-red-700 border-red-300 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800">Hoch</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-[9px] bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800">Mittel</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-[9px] bg-green-100 text-green-700 border-green-300 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800">Niedrig</Badge>;
      default:
        return null;
    }
  };

  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date < today) return 'Überfällig';
    if (date.toDateString() === today.toDateString()) return 'Heute';
    if (date.toDateString() === tomorrow.toDateString()) return 'Morgen';
    return date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
  };

  const isCompleted = (status: string | null) => status === 'completed' || status === 'done';

  return (
    <Card className="h-full bg-background border-primary/40 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-teal-600" />
          Aufgaben
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <Inbox className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-xs">Keine Aufgaben vorhanden</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Fortschritt</span>
                <span className="font-medium">{completedCount}/{totalCount}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="flex gap-2">
              <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="h-2.5 w-2.5" /> {completedCount} Fertig
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Circle className="h-2.5 w-2.5" /> {activeCount} Aktiv
              </span>
              {overdueCount > 0 && (
                <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertCircle className="h-2.5 w-2.5" /> {overdueCount} Überfällig
                </span>
              )}
            </div>

            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className={`flex items-center gap-2 p-2 rounded-lg ${isCompleted(task.status) ? 'bg-muted/30 opacity-60' : 'hover:bg-muted/50'}`}>
                  {isCompleted(task.status) ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs truncate ${isCompleted(task.status) ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                      {task.title}
                    </p>
                  </div>
                  {!isCompleted(task.status) && getPriorityBadge(task.priority)}
                  <span className="text-[10px] text-muted-foreground">{formatDueDate(task.due_date)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
