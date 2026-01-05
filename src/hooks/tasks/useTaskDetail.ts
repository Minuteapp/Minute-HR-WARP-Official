
import { useState } from 'react';
import { Task } from '@/types/tasks';
import { toast } from 'sonner';
import { useTasksStore } from '@/stores/useTasksStore';

export const useTaskDetail = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  
  const { updateTask } = useTasksStore();
  
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };
  
  const handleTaskStatusChange = async (taskId: string, newStatus: Task['status']): Promise<boolean> => {
    try {
      console.log(`Ändere Status der Aufgabe ${taskId} zu ${newStatus}`);
      const result = await updateTask(taskId, { status: newStatus });
      
      if (result) {
        // Falls die aktuell ausgewählte Aufgabe geändert wurde, auch dort Status aktualisieren
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask({
            ...selectedTask,
            status: newStatus
          });
        }
        toast.success(`Aufgabe wurde zu "${newStatus}" verschoben`);
        return true;
      }
      
      toast.error('Status konnte nicht geändert werden');
      return false;
    } catch (error) {
      console.error('Error changing task status:', error);
      toast.error('Status konnte nicht geändert werden');
      return false;
    }
  };
  
  const handleTaskComplete = async (taskId: string, completed: boolean): Promise<boolean> => {
    try {
      // Status auch entsprechend anpassen, damit Kanban konsistent bleibt
      const newStatus = completed ? 'done' as Task['status'] : 'todo' as Task['status'];
      
      const result = await updateTask(taskId, { 
        completed, 
        status: newStatus 
      });
      
      if (result) {
        // Falls die aktuell ausgewählte Aufgabe geändert wurde, auch dort Status aktualisieren
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask({
            ...selectedTask,
            completed,
            status: newStatus
          });
        }
        
        toast.success(completed ? 'Aufgabe als erledigt markiert' : 'Aufgabe wieder als offen markiert');
        return true;
      }
      
      toast.error('Status konnte nicht geändert werden');
      return false;
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Status konnte nicht geändert werden');
      return false;
    }
  };
  
  return {
    selectedTask,
    setSelectedTask,
    isDetailOpen,
    setIsDetailOpen,
    isAddTaskOpen,
    setIsAddTaskOpen,
    handleTaskClick,
    handleTaskStatusChange,
    handleTaskComplete,
  };
};
