
import { useState, useEffect, useRef } from 'react';
import { Task } from '@/types/tasks';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

export const useTaskDetailState = (
  initialTask: Task | undefined, 
  onClose: (open: boolean) => void
) => {
  const [localTask, setLocalTask] = useState<Task | null>(initialTask || null);
  const [newSubtask, setNewSubtask] = useState('');
  const [newTag, setNewTag] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Teammitglieder werden aus der Datenbank geladen
  const dummyTeamMembers: TeamMember[] = [];
  
  // Aktualisiere den lokalen Task-State, wenn sich der initialTask ändert
  useEffect(() => {
    if (initialTask) {
      setLocalTask(initialTask);
    }
  }, [initialTask]);
  
  // Hilfsfunktion zum Aktualisieren des lokalen Tasks
  const handleTaskUpdate = (key: keyof Task, value: any) => {
    if (!localTask) return;
    
    setLocalTask(prev => {
      if (!prev) return null;
      return { ...prev, [key]: value };
    });
    
    // Hier könnten wir z.B. eine API-Anfrage zum Speichern der Änderung senden
    // oder eine Callback-Funktion aufrufen
  };
  
  // Verhindert, dass Klicks innerhalb des Dialogs 
  // zum Schließen des Dialogs führen
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  // Hinzufügen einer Unteraufgabe
  const handleAddSubtask = () => {
    if (!localTask || !newSubtask.trim()) return;
    
    const newSubtasks = [...(localTask.subtasks || []), {
      id: uuidv4(),
      title: newSubtask,
      completed: false
    }];
    
    setLocalTask({
      ...localTask,
      subtasks: newSubtasks
    });
    
    setNewSubtask('');
  };
  
  // Umschalten des Status einer Unteraufgabe
  const handleToggleSubtask = (subtaskId: string) => {
    if (!localTask || !localTask.subtasks) return;
    
    const updatedSubtasks = localTask.subtasks.map(subtask => 
      subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
    );
    
    // Berechne den neuen Fortschritt
    const totalSubtasks = updatedSubtasks.length;
    const completedSubtasks = updatedSubtasks.filter(s => s.completed).length;
    const progress = Math.round((completedSubtasks / totalSubtasks) * 100);
    
    setLocalTask({
      ...localTask,
      subtasks: updatedSubtasks,
      progress
    });
  };
  
  // Hinzufügen eines Tags
  const handleAddTag = () => {
    if (!localTask || !newTag.trim()) return;
    
    const existingTags = localTask.tags || [];
    if (existingTags.includes(newTag)) {
      toast.error('Dieser Tag existiert bereits');
      return;
    }
    
    const newTags = [...existingTags, newTag];
    
    setLocalTask({
      ...localTask,
      tags: newTags
    });
    
    setNewTag('');
  };
  
  // Entfernen eines Tags
  const handleRemoveTag = (tag: string) => {
    if (!localTask || !localTask.tags) return;
    
    const newTags = localTask.tags.filter(t => t !== tag);
    
    setLocalTask({
      ...localTask,
      tags: newTags
    });
  };
  
  // Dateiupload (Mock)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length || !localTask) return;
    
    const files = Array.from(e.target.files);
    
    const newAttachments = files.map(file => ({
      id: uuidv4(),
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString()
    }));
    
    const existingAttachments = localTask.attachments || [];
    
    setLocalTask({
      ...localTask,
      attachments: [...existingAttachments, ...newAttachments]
    });
    
    // Im echten Szenario würden wir hier die Dateien hochladen
    toast.success(`${files.length} Datei(en) hinzugefügt`);
  };
  
  // Teammitglied hinzufügen
  const handleAddTeamMember = (memberId: string) => {
    if (!localTask) return;
    
    const existingAssignees = localTask.assignedTo || [];
    if (existingAssignees.includes(memberId)) {
      return;
    }
    
    const newAssignees = [...existingAssignees, memberId];
    
    setLocalTask({
      ...localTask,
      assignedTo: newAssignees
    });
  };
  
  // Teammitglied entfernen
  const handleRemoveTeamMember = (memberId: string) => {
    if (!localTask || !localTask.assignedTo) return;
    
    const newAssignees = localTask.assignedTo.filter(id => id !== memberId);
    
    setLocalTask({
      ...localTask,
      assignedTo: newAssignees
    });
  };
  
  // Teammitglied anhand der ID abrufen
  const getTeamMemberById = (id: string) => {
    return dummyTeamMembers.find(member => member.id === id) || null;
  };
  
  return {
    localTask,
    newSubtask,
    setNewSubtask,
    newTag,
    setNewTag,
    contentRef,
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
  };
};
