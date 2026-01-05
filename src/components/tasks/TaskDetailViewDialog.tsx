import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import {
  Pencil,
  CalendarIcon,
  FolderOpen,
  User,
  MessageSquare,
  Paperclip,
  Trash2,
  Archive,
  CheckCircle2,
  X,
  Plus,
  Upload,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Task } from '@/types/tasks';
import { useTasksStore } from '@/stores/useTasksStore';
import { useToast } from '@/components/ui/use-toast';

interface TaskDetailViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

export const TaskDetailViewDialog = ({ open, onOpenChange, task }: TaskDetailViewDialogProps) => {
  const { updateTask, deleteTask } = useTasksStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  // Editable fields
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || 'todo');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [progress, setProgress] = useState(task?.progress || 0);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task?.dueDate ? new Date(task.dueDate) : undefined
  );
  const [tags, setTags] = useState<string[]>(task?.tags || []);
  const [newTag, setNewTag] = useState('');

  // ZERO-DATA: Keine Mockup-Kommentare - leeres Array
  const [comments, setComments] = useState<{
    id: string;
    author: string;
    avatar: string;
    text: string;
    timestamp: string;
  }[]>([]);

  if (!task) return null;

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'high':
        return <Badge variant="destructive">Hoch</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Mittel</Badge>;
      case 'low':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Niedrig</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'todo':
        return <Badge variant="secondary">Offen</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Bearbeitung</Badge>;
      case 'review':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Review</Badge>;
      case 'blocked':
        return <Badge variant="destructive">Blockiert</Badge>;
      case 'done':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Abgeschlossen</Badge>;
      default:
        return null;
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments([
      ...comments,
      {
        id: Date.now().toString(),
        author: 'Du',
        avatar: '',
        text: newComment,
        timestamp: 'Gerade eben',
      },
    ]);
    setNewComment('');
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updateTask(task.id, {
        title,
        description,
        status: status as Task['status'],
        priority: priority as Task['priority'],
        progress,
        dueDate: dueDate?.toISOString(),
        tags,
      });
      toast({
        title: "Änderungen gespeichert",
        description: "Die Aufgabe wurde erfolgreich aktualisiert.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Änderungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
      toast({
        title: "Aufgabe gelöscht",
        description: "Die Aufgabe wurde erfolgreich gelöscht.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Aufgabe konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  const handleArchive = async () => {
    try {
      await updateTask(task.id, { status: 'archived' as Task['status'] });
      toast({
        title: "Aufgabe archiviert",
        description: "Die Aufgabe wurde ins Archiv verschoben.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Aufgabe konnte nicht archiviert werden.",
        variant: "destructive",
      });
    }
  };

  const handleMarkComplete = async () => {
    try {
      await updateTask(task.id, { status: 'done', completed: true, progress: 100 });
      toast({
        title: "Aufgabe erledigt",
        description: "Die Aufgabe wurde als erledigt markiert.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Aufgabe konnte nicht als erledigt markiert werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="flex-row items-start justify-between space-y-0 pr-8">
          <div className="flex-1">
            {isEditing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-semibold"
              />
            ) : (
              <DialogTitle className="text-xl font-semibold">{task.title}</DialogTitle>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="ml-2"
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-1" />
                Abbrechen
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4 mr-1" />
                Bearbeiten
              </>
            )}
          </Button>
        </DialogHeader>

        {/* Status & Priority Badges */}
        <div className="flex gap-2 mt-1">
          {getPriorityBadge(isEditing ? priority : task.priority)}
          {getStatusBadge(isEditing ? status : task.status)}
        </div>

        {/* Meta Information - 3 Spalten */}
        <div className="grid grid-cols-3 gap-4 py-4 border-b">
          {/* Projekt */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <FolderOpen className="h-3 w-3" />
              Projekt
            </Label>
            {isEditing ? (
              <Select defaultValue={task.projectId || ''}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Projekt wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recruiting">Recruiting</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="lohn">Lohn & Gehalt</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm font-medium">{task.projectId || 'Kein Projekt'}</p>
            )}
          </div>

          {/* Fälligkeitsdatum */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              Fälligkeitsdatum
            </Label>
            {isEditing ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start h-8 text-sm">
                    {dueDate ? format(dueDate, "dd.MM.yyyy", { locale: de }) : "Datum wählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[200]" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <p className="text-sm font-medium">
                {task.dueDate && !isNaN(new Date(task.dueDate).getTime()) 
                  ? format(new Date(task.dueDate), "dd.MM.yyyy", { locale: de }) 
                  : 'Kein Datum'}
              </p>
            )}
          </div>

          {/* Verantwortlicher */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              Verantwortlicher
            </Label>
            {isEditing ? (
              <Select defaultValue={task.assignedTo?.[0] || ''}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Person wählen" />
                </SelectTrigger>
                <SelectContent>
                  {/* ZERO-DATA: Personen aus DB laden */}
                  <SelectItem value="placeholder" disabled>Person aus Datenbank laden</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">LS</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{task.assignedTo?.[0] || 'Nicht zugewiesen'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Beschreibung */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Beschreibung</Label>
          {isEditing ? (
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-muted/50"
            />
          ) : (
            <div className="bg-muted/50 rounded-md p-3">
              <p className="text-sm text-muted-foreground">
                {task.description || 'Keine Beschreibung'}
              </p>
            </div>
          )}
        </div>

        {/* Fortschritt */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Fortschritt</Label>
            <span className="text-sm font-medium text-green-600">{isEditing ? progress : task.progress || 0}%</span>
          </div>
          {isEditing ? (
            <Slider
              value={[progress]}
              onValueChange={([v]) => setProgress(v)}
              max={100}
              step={5}
              className="[&_[role=slider]]:bg-green-600"
            />
          ) : (
            <Progress value={task.progress || 0} className="h-2 [&>div]:bg-green-600" />
          )}
        </div>

        {/* Status & Priorität Dropdowns (nur im Bearbeitungsmodus) */}
        {isEditing && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Task['status'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Offen</SelectItem>
                  <SelectItem value="in-progress">In Bearbeitung</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="blocked">Blockiert</SelectItem>
                  <SelectItem value="done">Abgeschlossen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Priorität</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as 'high' | 'medium' | 'low')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Hoch</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="low">Niedrig</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tags</Label>
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Tag hinzufügen..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1"
                />
                <Button variant="outline" onClick={handleAddTag}>
                  Hinzufügen
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {task.tags?.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              )) || <span className="text-sm text-muted-foreground">Keine Tags</span>}
            </div>
          )}
        </div>

        <Separator />

        {/* Aktivität & Kommentare */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <h3 className="font-medium">Aktivität & Kommentare</h3>
          </div>
          
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-muted">
                    {comment.author.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Kommentar hinzufügen..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              className="flex-1"
            />
            <Button onClick={handleAddComment} className="bg-green-600 hover:bg-green-700">
              Kommentieren
            </Button>
          </div>
        </div>

        <Separator />

        {/* Anhänge */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Paperclip className="h-4 w-4" />
            <h3 className="font-medium">Anhänge</h3>
          </div>
          <Button variant="outline" className="w-full gap-2">
            <Upload className="h-4 w-4" />
            Datei hochladen
          </Button>
          {task.attachments && task.attachments.length > 0 && (
            <div className="space-y-2">
              {task.attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center gap-2 p-2 border rounded">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{attachment.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive" 
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Löschen
            </Button>
            <Button variant="outline" onClick={handleArchive}>
              <Archive className="h-4 w-4 mr-1" />
              Archivieren
            </Button>
          </div>
          {isEditing ? (
            <Button onClick={handleSave} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Speichern...
                </>
              ) : (
                'Änderungen speichern'
              )}
            </Button>
          ) : (
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleMarkComplete}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Als erledigt markieren
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
