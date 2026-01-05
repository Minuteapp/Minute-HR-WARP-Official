
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TaskStatusGroup } from "./TaskStatusGroup";

interface ProjectTasksDetailTabProps {
  projectId: string;
}

export const ProjectTasksDetailTab = ({ projectId }: ProjectTasksDetailTabProps) => {
  const [sortBy, setSortBy] = useState('status');

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['project-tasks-detail', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const totalTasks = tasks.length;

  // Group tasks by status
  const groupedTasks = {
    'in-progress': tasks.filter((t: any) => t.status === 'in-progress' || t.status === 'in_progress'),
    'blocked': tasks.filter((t: any) => t.status === 'blocked'),
    'todo': tasks.filter((t: any) => t.status === 'todo' || t.status === 'pending'),
    'completed': tasks.filter((t: any) => t.status === 'completed' || t.status === 'done'),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Aufgaben</h2>
          <span className="text-sm text-muted-foreground">{totalTasks} Aufgaben gesamt</span>
        </div>
        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Nach Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="status">Nach Status</SelectItem>
              <SelectItem value="priority">Nach Priorität</SelectItem>
              <SelectItem value="date">Nach Datum</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-gray-900 text-white hover:bg-gray-800">
            <Plus className="h-4 w-4 mr-2" />
            Aufgabe erstellen
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : totalTasks === 0 ? (
        <Card className="bg-white border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Keine Aufgaben vorhanden.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedTasks['in-progress'].length > 0 && (
            <TaskStatusGroup 
              title="In Bearbeitung" 
              count={groupedTasks['in-progress'].length} 
              tasks={groupedTasks['in-progress']} 
            />
          )}
          {groupedTasks['blocked'].length > 0 && (
            <TaskStatusGroup 
              title="Blockiert" 
              count={groupedTasks['blocked'].length} 
              tasks={groupedTasks['blocked']} 
            />
          )}
          {groupedTasks['todo'].length > 0 && (
            <TaskStatusGroup 
              title="Zu erledigen" 
              count={groupedTasks['todo'].length} 
              tasks={groupedTasks['todo']} 
            />
          )}
          {groupedTasks['completed'].length > 0 && (
            <TaskStatusGroup 
              title="Abgeschlossen" 
              count={groupedTasks['completed'].length} 
              tasks={groupedTasks['completed']} 
            />
          )}
        </div>
      )}
    </div>
  );
};
