
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskBasicForm } from "./TaskBasicForm";
import { TaskDetailsForm } from "./TaskDetailsForm";
import { TaskSubtasksForm } from "./TaskSubtasksForm";
import { TaskAttachmentsForm } from "./TaskAttachmentsForm";
import { TaskDialogActions } from "./TaskDialogActions";
import { TaskDialogHeader } from "./TaskDialogHeader";
import { TaskTeamMembers } from "../../tasks/sidebar/TaskTeamMembers";
import useTaskForm from "./useTaskForm";

interface AdvancedTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (taskData: any) => void;
  projectId?: string;
  editingTask?: any; // Für das Bearbeiten existierender Aufgaben
}

export const AdvancedTaskDialog = ({ 
  open, 
  onOpenChange, 
  onSubmit,
  projectId,
  editingTask 
}: AdvancedTaskDialogProps) => {
  const {
    title,
    setTitle,
    description,
    setDescription,
    dueDate,
    setDueDate,
    priority,
    setPriority,
    reminder,
    setReminder,
    notes,
    setNotes,
    newSubtask,
    setNewSubtask,
    subtasks,
    handleAddSubtask,
    handleRemoveSubtask,
    handleEditSubtask,
    handleToggleSubtask,
    project,
    setProject,
    tags,
    newTag,
    setNewTag,
    assignedTo,
    setAssignedTo,
    attachments,
    handleFileChange,
    handleAddTag,
    handleRemoveTag,
    autoTimeTracking,
    setAutoTimeTracking,
    handleSubmit,
    isSubmitting,
  } = useTaskForm(onOpenChange, onSubmit, projectId, editingTask);

  // Generiere eine temporäre ID für neue Aufgaben oder verwende die bestehende ID
  const taskId = editingTask?.id || `temp-${Date.now()}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <TaskDialogHeader />
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Grundlagen</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="subtasks">Unteraufgaben</TabsTrigger>
            <TabsTrigger value="attachments">Anhänge</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-6">
            <TaskBasicForm
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              priority={priority}
              setPriority={setPriority}
              dueDate={dueDate}
              setDueDate={setDueDate}
            />
            
            <div className="mt-6">
              <TaskTeamMembers
                members={assignedTo}
                onMembersChange={setAssignedTo}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            <TaskDetailsForm
              reminder={reminder}
              setReminder={setReminder}
              notes={notes}
              setNotes={setNotes}
              project={project}
              setProject={setProject}
              tags={tags}
              newTag={newTag}
              setNewTag={setNewTag}
              handleAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
              autoTimeTracking={autoTimeTracking}
              setAutoTimeTracking={setAutoTimeTracking}
              taskId={taskId}
              taskTitle={title || 'Neue Aufgabe'}
            />
          </TabsContent>
          
          <TabsContent value="subtasks" className="space-y-4">
            <TaskSubtasksForm
              subtasks={subtasks}
              newSubtask={newSubtask}
              setNewSubtask={setNewSubtask}
              handleAddSubtask={handleAddSubtask}
              handleRemoveSubtask={handleRemoveSubtask}
              handleEditSubtask={handleEditSubtask}
              handleToggleSubtask={handleToggleSubtask}
            />
          </TabsContent>
          
          <TabsContent value="attachments" className="space-y-4">
            <TaskAttachmentsForm
              attachments={attachments}
              handleFileChange={handleFileChange}
            />
          </TabsContent>
        </Tabs>
        
        <TaskDialogActions
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};
