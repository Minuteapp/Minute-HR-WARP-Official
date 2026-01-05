import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Task } from "@/types/tasks";
import { useTaskDetailState } from "./task-detail/useTaskDetailState";
import { TaskDetailHeader } from "./task-detail/TaskDetailHeader";
import { DetailsTabContent } from "./task-detail/tabs/DetailsTabContent";
import { TaskDetailsTab } from "./task-detail/tabs/TaskDetailsTab";
import { TaskSubtasksTab } from "./task-detail/tabs/TaskSubtasksTab";
import { TaskAttachmentsTab } from "./task-detail/tabs/TaskAttachmentsTab";

interface TaskDetailDialogProps {
  task?: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteTask?: (taskId: string) => Promise<boolean>;
  onArchiveTask?: (taskId: string) => Promise<boolean>;
  readOnly?: boolean;
}

export default function TaskDetailDialog({ 
  task, 
  open, 
  onOpenChange, 
  onDeleteTask,
  onArchiveTask,
  readOnly = false
}: TaskDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("basics");
  
  const {
    localTask,
    newSubtask,
    setNewSubtask,
    newTag,
    setNewTag,
    dummyTeamMembers,
    handleTaskUpdate,
    handleContentClick,
    handleAddSubtask,
    handleToggleSubtask,
    handleAddTag,
    handleRemoveTag,
    handleFileChange,
    handleAddTeamMember,
    handleRemoveTeamMember,
    getTeamMemberById
  } = useTaskDetailState(task, onOpenChange);

  const handleDeleteTask = async () => {
    if (!localTask || !onDeleteTask) return;
    
    if (confirm("Möchten Sie diese Aufgabe wirklich löschen?")) {
      const success = await onDeleteTask(localTask.id);
      if (success) {
        onOpenChange(false);
      }
    }
  };

  if (!localTask) return null;

  const isArchived = localTask.status === 'archived';
  const isDeleted = localTask.status === 'deleted';
  const isReadOnly = readOnly || isArchived || isDeleted;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-5xl h-[90vh] overflow-hidden bg-white p-0 flex flex-col"
        onClick={handleContentClick}
      >
        <DialogTitle className="sr-only">Aufgabendetails</DialogTitle>
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-semibold">{localTask.title}</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-6 w-6 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Projekt:</span>
              <span className="text-sm text-primary">proj-1</span>
              
              <div className="flex gap-2 ml-4">
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  localTask.priority === 'high' ? 'bg-red-100 text-red-800' :
                  localTask.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {localTask.priority === 'high' ? 'Hoch' : 
                   localTask.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                </div>
                
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  localTask.status === 'todo' ? 'bg-gray-100 text-gray-800' :
                  localTask.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  localTask.status === 'done' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {localTask.status === 'todo' ? 'Zu erledigen' :
                   localTask.status === 'in-progress' ? 'In Bearbeitung' :
                   localTask.status === 'done' ? 'Erledigt' :
                   'Zu erledigen'}
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 mt-1">Preview</div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 mx-6 mt-4">
            <TabsTrigger value="basics">Grundlagen</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="subtasks">Unteraufgaben</TabsTrigger>
            <TabsTrigger value="attachments">Anhänge</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto">
            <TabsContent value="basics" className="mt-0 h-full">
              <DetailsTabContent 
                task={localTask}
                onTaskUpdate={(updates) => {
                  Object.entries(updates).forEach(([key, value]) => {
                    handleTaskUpdate(key as keyof Task, value);
                  });
                }}
                readOnly={isReadOnly}
              />
            </TabsContent>

            <TabsContent value="details" className="mt-0 h-full">
              <TaskDetailsTab 
                task={localTask}
                onTaskUpdate={(updates) => {
                  Object.entries(updates).forEach(([key, value]) => {
                    handleTaskUpdate(key as keyof Task, value);
                  });
                }}
                readOnly={isReadOnly}
              />
            </TabsContent>

            <TabsContent value="subtasks" className="mt-0 h-full">
              <TaskSubtasksTab
                task={localTask}
                newSubtask={newSubtask}
                setNewSubtask={setNewSubtask}
                handleAddSubtask={handleAddSubtask}
                handleToggleSubtask={handleToggleSubtask}
                readOnly={isReadOnly}
              />
            </TabsContent>

            <TabsContent value="attachments" className="mt-0 h-full">
              <TaskAttachmentsTab
                task={localTask}
                handleFileChange={handleFileChange}
                readOnly={isReadOnly}
              />
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              ✓ Als erledigt markieren
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="text-red-600 border-red-600 hover:bg-red-50"
              onClick={handleDeleteTask}
            >
              Löschen
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Zugewiesen: Tom Weber</span>
            <span>Fällig: 1.3.2025</span>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button className="bg-black text-white hover:bg-gray-800">
              Änderungen speichern
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}