
import type { Task } from '@/types/tasks';

// Formatiert eine Aufgabe aus dem Backend-Format in das Frontend-Format
export const formatTaskFromApi = (apiTask: any): Task => {
  return {
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description || '',
    status: apiTask.status,
    priority: apiTask.priority,
    completed: apiTask.completed || false,
    dueDate: apiTask.due_date,
    progress: apiTask.progress || 0,
    assignedTo: apiTask.assigned_to ? [apiTask.assigned_to] : [],
    subtasks: typeof apiTask.subtasks === 'string' && apiTask.subtasks
      ? JSON.parse(apiTask.subtasks)
      : (Array.isArray(apiTask.subtasks) ? apiTask.subtasks : []),
    tags: apiTask.tags || [],
    createdAt: apiTask.created_at,
    updatedAt: apiTask.updated_at,
    createdBy: apiTask.created_by,
    comments: typeof apiTask.comments === 'string' && apiTask.comments
      ? JSON.parse(apiTask.comments)
      : (Array.isArray(apiTask.comments) ? apiTask.comments : []),
    attachments: typeof apiTask.attachments === 'string' && apiTask.attachments
      ? JSON.parse(apiTask.attachments)
      : (Array.isArray(apiTask.attachments) ? apiTask.attachments : [])
  };
};

// Formatiert eine Aufgabe aus dem Frontend-Format in das Backend-Format
export const formatTaskForApi = (task: Partial<Task>): any => {
  const apiTask: Record<string, any> = {};
  
  if (task.title !== undefined) apiTask.title = task.title;
  if (task.description !== undefined) apiTask.description = task.description;
  if (task.status !== undefined) apiTask.status = task.status;
  if (task.priority !== undefined) apiTask.priority = task.priority;
  if (task.completed !== undefined) apiTask.completed = task.completed;
  if (task.dueDate !== undefined) apiTask.due_date = task.dueDate;
  if (task.progress !== undefined) apiTask.progress = task.progress;
  if (task.assignedTo !== undefined) apiTask.assigned_to = task.assignedTo && task.assignedTo.length > 0 ? task.assignedTo[0] : null;
  
  // Stelle sicher, dass subtasks immer als JSON-String gespeichert werden
  if (task.subtasks !== undefined) {
    const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
    apiTask.subtasks = JSON.stringify(subtasks);
  }
  
  if (task.tags !== undefined) apiTask.tags = task.tags;
  
  // Stelle sicher, dass attachments und comments auch als JSON-Strings gespeichert werden
  if (task.comments !== undefined) {
    const comments = Array.isArray(task.comments) ? task.comments : [];
    apiTask.comments = JSON.stringify(comments);
  }
  
  if (task.attachments !== undefined) {
    const attachments = Array.isArray(task.attachments) ? task.attachments : [];
    apiTask.attachments = JSON.stringify(attachments);
  }
  
  return apiTask;
};
