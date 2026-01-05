import { useState, useEffect } from "react";
import { useTasksStore } from "@/stores/useTasksStore";
import { useToast } from "@/hooks/use-toast";

export const useTaskForm = (
  onOpenChange: (open: boolean) => void,
  onSubmit?: (task: any) => void,
  projectId?: string,
  editingTask?: any
) => {
  const { toast } = useToast();
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [reminder, setReminder] = useState("");
  const [notes, setNotes] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [subtasks, setSubtasks] = useState<
    Array<{ id: string; title: string; completed: boolean }>
  >([]);
  const [status, setStatus] = useState<
    "todo" | "in-progress" | "review" | "blocked" | "done" | "archived" | "deleted"
  >("todo");
  const [project, setProject] = useState(projectId || "");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [autoTimeTracking, setAutoTimeTracking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addTask, updateTask, fetchTasks } = useTasksStore();

  // Lade existierende Aufgabe wenn editingTask übergeben wird
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || "");
      setDescription(editingTask.description || "");
      setDueDate(editingTask.dueDate || "");
      setPriority(editingTask.priority || "medium");
      setReminder(editingTask.reminderDate || "");
      setNotes(editingTask.notes || "");
      setSubtasks(editingTask.subtasks || []);
      setStatus(editingTask.status || "todo");
      setProject(editingTask.projectId || projectId || "");
      setTags(editingTask.tags || []);
      setAssignedTo(editingTask.assignedTo || []);
      setAttachments(editingTask.attachments || []);
      setAutoTimeTracking(editingTask.autoTimeTracking || false);
    }
  }, [editingTask, projectId]);

  // Handler für Datei-Uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    console.log("Dateien erkannt:", files.length, "Dateien");
    
    const newAttachments = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
    }));

    console.log("Neue Anhänge erstellt:", newAttachments);
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  // Handler für das Hinzufügen von Tags
  const handleAddTag = () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) {
      setNewTag("");
      return;
    }
    setTags([...tags, newTag.trim()]);
    setNewTag("");
  };

  // Handler für das Entfernen von Tags
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handler für Unteraufgaben
  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    const newSubtaskItem = {
      id: crypto.randomUUID(),
      title: newSubtask,
      completed: false,
    };
    setSubtasks([...subtasks, newSubtaskItem]);
    setNewSubtask("");
  };

  const handleRemoveSubtask = (index: number) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks.splice(index, 1);
    setSubtasks(updatedSubtasks);
  };

  const handleEditSubtask = (index: number, title: string) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index].title = title;
    setSubtasks(updatedSubtasks);
  };

  const handleToggleSubtask = (index: number) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index].completed = !updatedSubtasks[index].completed;
    setSubtasks(updatedSubtasks);
  };

  // Formular-Absenden
  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Titel ein.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Erstelle oder aktualisiere das Aufgabenobjekt
      const taskData = {
        id: editingTask?.id,
        title: title.trim(),
        description: description || undefined,
        status: editingTask ? editingTask.status : "todo" as const,
        priority,
        dueDate: dueDate || undefined,
        reminderDate: reminder || undefined,
        completed: editingTask ? editingTask.completed : false,
        projectId: project || projectId || undefined,
        assignedTo: assignedTo.length > 0 ? assignedTo : [],
        tags: tags.length > 0 ? tags : [],
        subtasks: subtasks.length > 0 ? subtasks : [],
        attachments: attachments.length > 0 ? attachments : [],
        comments: editingTask ? editingTask.comments : [],
        progress: editingTask ? editingTask.progress : 0,
        timeLogged: editingTask ? editingTask.timeLogged : undefined,
        dependencies: editingTask ? editingTask.dependencies : [],
        history: editingTask ? editingTask.history : [],
        autoTimeTracking,
        notes
      };

      console.log("TaskForm: Verarbeite Aufgabe:", taskData);

      let success;
      if (editingTask) {
        success = await updateTask(editingTask.id, taskData);
        if (success) {
          toast({
            title: "Erfolg",
            description: "Aufgabe wurde erfolgreich aktualisiert.",
          });
        }
      } else {
        success = await addTask(taskData);
        if (success) {
          toast({
            title: "Erfolg",
            description: "Aufgabe wurde erfolgreich erstellt.",
          });
        }
      }

      if (success) {
        console.log("TaskForm: Aufgabe erfolgreich verarbeitet");
        
        if (onSubmit) {
          onSubmit(taskData);
        }

        // Store lädt bereits Tasks neu nach addTask/updateTask - kein zusätzlicher Aufruf nötig
        resetForm();
        onOpenChange(false);
      } else {
        throw new Error('Aufgabe konnte nicht verarbeitet werden');
      }
    } catch (error) {
      console.error("TaskForm: Fehler beim Verarbeiten der Aufgabe:", error);
      toast({
        title: "Fehler",
        description: editingTask 
          ? "Die Aufgabe konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut."
          : "Die Aufgabe konnte nicht erstellt werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formular zurücksetzen
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("medium");
    setReminder("");
    setNotes("");
    setNewSubtask("");
    setSubtasks([]);
    setStatus("todo");
    setProject(projectId || "");
    setTags([]);
    setNewTag("");
    setAssignedTo([]);
    setAttachments([]);
    setAutoTimeTracking(false);
  };

  return {
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
    status,
    setStatus,
    project,
    setProject,
    tags,
    setTags,
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
  };
};

export default useTaskForm;
