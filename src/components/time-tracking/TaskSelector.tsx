import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListTodo } from 'lucide-react';

interface TaskSelectorProps {
  value: string;
  projectName?: string;
  onChange: (value: string) => void;
}

const TaskSelector = ({ value, projectName, onChange }: TaskSelectorProps) => {
  // Hole zuerst die Projekt-ID basierend auf dem Projektnamen
  const { data: project } = useQuery({
    queryKey: ['projectByName', projectName],
    queryFn: async () => {
      if (!projectName || projectName === 'none') return null;
      
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('name', projectName)
        .maybeSingle();
      
      if (error) {
        console.error('Error loading project:', error);
        return null;
      }
      return data;
    },
    enabled: !!projectName && projectName !== 'none'
  });

  // Lade Aufgaben für das gewählte Projekt
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['projectTasks', project?.id],
    queryFn: async () => {
      if (!project?.id) return [];
      
      const { data, error } = await supabase
        .from('project_tasks')
        .select('id, name, status')
        .eq('project_id', project.id)
        .in('status', ['open', 'in_progress'])
        .order('name');
      
      if (error) {
        console.error('Error loading tasks:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!project?.id
  });

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium flex items-center gap-2">
        <ListTodo className="h-4 w-4" />
        Aufgabe
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="border-[#3B44F6] rounded-lg">
          <SelectValue placeholder={
            isLoading ? "Laden..." : 
            !projectName || projectName === 'none' ? "Erst Projekt wählen" : 
            "Aufgabe wählen"
          } />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Keine Aufgabe</SelectItem>
          {tasks.map((task) => (
            <SelectItem key={task.id} value={task.name}>
              {task.name}
            </SelectItem>
          ))}
          {tasks.length === 0 && project?.id && (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              Keine Aufgaben für dieses Projekt
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TaskSelector;
