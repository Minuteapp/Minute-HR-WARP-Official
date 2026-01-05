
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTasksStore } from '@/stores/useTasksStore';
import { useToast } from "@/components/ui/use-toast";
import { AdvancedTaskDialog } from "./tasks/AdvancedTaskDialog";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (taskData: any) => void;
  projectId?: string;
}

const AddTaskDialog = ({ 
  open, 
  onOpenChange, 
  onSubmit,
  projectId 
}: AddTaskDialogProps) => {
  const { addTask } = useTasksStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTaskSubmit = async (taskData: any) => {
    if (!taskData.title?.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Titel für die Aufgabe ein.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Stelle sicher, dass alle erforderlichen Felder gesetzt sind
      const completeTaskData = {
        title: taskData.title,
        description: taskData.description || '',
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate,
        reminderDate: taskData.reminderDate,
        completed: false,
        assignedTo: taskData.assignedTo || [],
        subtasks: taskData.subtasks || [],
        tags: taskData.tags || [],
        attachments: taskData.attachments || [],
        comments: taskData.comments || [],
        progress: taskData.progress || 0,
        timeLogged: taskData.timeLogged || 0,
        dependencies: taskData.dependencies || [],
        projectId: taskData.projectId || projectId,
        autoTimeTracking: taskData.autoTimeTracking || false,
        notes: taskData.notes || ''
      };

      const success = await addTask(completeTaskData);
      
      if (success) {
        toast({
          title: "Aufgabe erstellt",
          description: `Die Aufgabe "${taskData.title}" wurde erfolgreich erstellt.`,
        });
        
        onOpenChange(false);
        
        if (onSubmit) {
          onSubmit(taskData);
        }
      } else {
        throw new Error('Fehler beim Erstellen der Aufgabe');
      }
    } catch (error) {
      console.error('Fehler beim Erstellen der Aufgabe:', error);
      toast({
        title: "Fehler",
        description: "Die Aufgabe konnte nicht erstellt werden.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdvancedTaskDialog 
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleTaskSubmit}
      projectId={projectId}
    />
  );
};

export default AddTaskDialog;
