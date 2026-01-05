
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Task } from '@/types/tasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TaskListProps {
  projectId: string;
}

interface ProjectTaskDB {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  due_date: string;
  project_id: string;
  assigned_to: string;
  category: 'team' | 'personal' | 'project' | 'goal' | 'office';
  created_at: string;
  updated_at: string;
}

const TaskList = ({ projectId }: TaskListProps) => {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['projectTasks', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match the Task interface
      return (data as ProjectTaskDB[]).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority as 'high' | 'medium' | 'low',
        status: task.status as 'todo' | 'in-progress' | 'done',
        completed: task.status === 'done',
        dueDate: task.due_date,
        progress: 0,
      })) as Task[];
    },
  });

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aufgaben</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks?.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              Keine Aufgaben gefunden
            </div>
          ) : (
            tasks?.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-gray-500">{task.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    task.status === 'done' ? 'bg-green-100 text-green-800' :
                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskList;
