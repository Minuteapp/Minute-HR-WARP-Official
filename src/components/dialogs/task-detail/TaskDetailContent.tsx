
import { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Task } from "@/types/tasks";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { FileIcon, PlusCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";

interface TaskDetailContentProps {
  task: Task;
  onTaskUpdate?: (field: keyof Task, value: any) => void;
  newSubtask: string;
  setNewSubtask: (value: string) => void;
  handleAddSubtask: () => void;
  handleToggleSubtask: (subtaskId: string) => void;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
}

export const TaskDetailContent: React.FC<TaskDetailContentProps> = ({
  task,
  onTaskUpdate,
  newSubtask,
  setNewSubtask,
  handleAddSubtask,
  handleToggleSubtask,
  handleFileChange,
  readOnly = false
}) => {
  const [commentText, setCommentText] = useState("");
  
  // Sichere Behandlung der subtasks - stelle sicher, dass es immer ein Array ist
  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
  const comments = Array.isArray(task.comments) ? task.comments : [];
  const attachments = Array.isArray(task.attachments) ? task.attachments : [];
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onTaskUpdate) {
      onTaskUpdate('description', e.target.value);
    }
  };
  
  const handleAddComment = () => {
    if (!commentText.trim()) return;
    
    const now = new Date().toISOString();
    
    const newComment = {
      id: crypto.randomUUID(),
      text: commentText,
      author: "Aktueller Benutzer", // Normalerweise aus einem Auth-Kontext
      createdAt: now
    };
    
    if (onTaskUpdate) {
      onTaskUpdate('comments', [...comments, newComment]);
    }
    
    setCommentText("");
  };
  
  const handleSubtaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newSubtask.trim()) {
      e.preventDefault();
      handleAddSubtask();
    }
  };
  
  const truncateFileName = (fileName: string, maxLength = 20) => {
    if (fileName.length <= maxLength) return fileName;
    
    const extension = fileName.split('.').pop() || '';
    const nameWithoutExtension = fileName.slice(0, fileName.lastIndexOf('.'));
    
    const truncatedName = nameWithoutExtension.slice(0, maxLength - extension.length - 3) + '...';
    return truncatedName + '.' + extension;
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleAddComment();
    }
  };
  
  return (
    <div className="flex-1 border-r">
      <ScrollArea className="h-full pb-20">
        <div className="p-6">
          {/* Beschreibung */}
          <div className="mb-8">
            <h3 className="font-medium mb-2">Beschreibung</h3>
            <Textarea
              value={task.description || ''}
              onChange={handleDescriptionChange}
              placeholder="Aufgabenbeschreibung hinzufügen..."
              className="min-h-[100px] resize-none"
              readOnly={readOnly}
            />
          </div>
          
          {/* Unteraufgaben */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Unteraufgaben</h3>
              {subtasks.length > 0 && (
                <span className="text-sm text-gray-500">
                  {subtasks.filter(st => st.completed).length} von {subtasks.length}
                </span>
              )}
            </div>
            
            {subtasks.length > 0 && (
              <div className="mb-3">
                <Progress 
                  value={task.progress || 0} 
                  className="h-2" 
                />
              </div>
            )}
            
            <div className="space-y-2 mb-4">
              {subtasks.map(subtask => (
                <div key={subtask.id} className="flex items-center gap-2">
                  <Checkbox 
                    id={`subtask-${subtask.id}`}
                    checked={subtask.completed}
                    onCheckedChange={() => handleToggleSubtask(subtask.id)}
                    disabled={readOnly}
                  />
                  <label 
                    htmlFor={`subtask-${subtask.id}`}
                    className={`flex-1 text-sm ${subtask.completed ? "line-through text-gray-400" : ""}`}
                  >
                    {subtask.title}
                  </label>
                </div>
              ))}
            </div>
            
            {!readOnly && (
              <div className="flex items-center gap-2">
                <Input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Unteraufgabe hinzufügen"
                  onKeyDown={handleSubtaskKeyDown}
                  className="text-sm"
                />
                <Button 
                  size="sm"
                  type="button"
                  onClick={handleAddSubtask}
                  disabled={!newSubtask.trim()}
                >
                  Hinzufügen
                </Button>
              </div>
            )}
          </div>
          
          {/* Anlagen */}
          <div className="mb-8">
            <h3 className="font-medium mb-2">Anlagen</h3>
            
            {attachments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {attachments.map(attachment => (
                  <div 
                    key={attachment.id} 
                    className="flex items-center p-2 border rounded-md hover:bg-gray-50"
                  >
                    <FileIcon className="h-5 w-5 text-blue-500 mr-2" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" title={attachment.name}>
                        {truncateFileName(attachment.name)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {attachment.uploadedAt && 
                          format(new Date(attachment.uploadedAt), 'dd.MM.yy', { locale: de })
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-4">Keine Anlagen vorhanden</p>
            )}
            
            {!readOnly && (
              <div className="flex items-center">
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex items-center text-primary hover:text-primary/80">
                    <PlusCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Datei hinzufügen</span>
                  </div>
                </Label>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                />
              </div>
            )}
          </div>
          
          {/* Kommentare */}
          <div>
            <h3 className="font-medium mb-3">Kommentare</h3>
            
            {comments.length > 0 ? (
              <div className="space-y-4 mb-4">
                {comments.map(comment => (
                  <div key={comment.id} className="border-b pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{comment.author}</span>
                      <span className="text-xs text-gray-500">
                        {comment.createdAt && 
                          format(new Date(comment.createdAt), 'dd.MM.yy HH:mm', { locale: de })
                        }
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{comment.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-4">Noch keine Kommentare</p>
            )}
            
            {!readOnly && (
              <div className="space-y-2">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Kommentar hinzufügen..."
                  onKeyDown={handleKeyDown}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Drücke Ctrl+Enter zum Senden</span>
                  <Button 
                    size="sm"
                    disabled={!commentText.trim()}
                    onClick={handleAddComment}
                  >
                    Kommentar senden
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
