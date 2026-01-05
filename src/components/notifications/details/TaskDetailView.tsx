import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ClipboardCheck, 
  AlertCircle, 
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle,
  Square,
  Paperclip,
  Users
} from "lucide-react";

interface TaskDetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: any;
  onAssign?: () => void;
  onAttach?: () => void;
  onMove?: () => void;
  onMarkComplete?: () => void;
}

export function TaskDetailView({ 
  open, 
  onOpenChange, 
  notification,
  onAssign,
  onAttach,
  onMove,
  onMarkComplete
}: TaskDetailViewProps) {
  // Daten aus notification extrahieren (keine Mock-Daten mehr)
  const metadata = notification?.metadata || {};
  const taskData = {
    id: notification?.id || metadata.task_id || "",
    title: notification?.title || metadata.title || "Aufgabe",
    priority: metadata.priority || notification?.priority || "",
    status: metadata.status || "",
    category: metadata.category || notification?.category || "",
    deadline: metadata.deadline ? new Date(metadata.deadline).toLocaleDateString('de-DE') : "",
    deadlineWarning: metadata.deadline_warning || (metadata.is_overdue ? "Diese Aufgabe ist überfällig!" : ""),
    description: notification?.message || metadata.description || "",
    assignedBy: {
      name: metadata.assigned_by?.name || metadata.assigned_by_name || "",
      role: metadata.assigned_by?.role || metadata.assigned_by_role || "",
      avatar: metadata.assigned_by?.avatar || ""
    },
    timeSpent: metadata.time_spent || 0,
    timeEstimated: metadata.time_estimated || 0,
    progress: metadata.progress || 0,
    dependentTasks: metadata.dependent_tasks || [],
    attachments: metadata.attachments || [],
    comments: metadata.comments || []
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Square className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" className="text-[11px]">Abgeschlossen</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-700 text-[11px]">In Arbeit</Badge>;
      default:
        return <Badge variant="outline" className="text-[11px]">Ausstehend</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <ScrollArea className="max-h-[85vh] pr-4">
          <div className="space-y-6">
            {/* Header */}
            <DialogHeader>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ClipboardCheck size={24} className="text-orange-600" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-[20px] font-semibold mb-1">
                    {taskData.title || notification?.title || 'Aufgabe'}
                  </DialogTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="destructive" className="text-[11px]">Hohe Priorität</Badge>
                    <Badge className="bg-blue-100 text-blue-700 text-[11px]">In Bearbeitung</Badge>
                    <span className="text-[13px] text-muted-foreground">•</span>
                    <span className="text-[13px] text-muted-foreground">
                      Aufgaben{taskData.category ? ` - ${taskData.category}` : ''}
                    </span>
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Deadline Warning */}
            {taskData.deadlineWarning && (
            <Alert variant="destructive" className="bg-orange-50 border-orange-200">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <AlertDescription className="text-[13px] text-orange-900 ml-2">
                <span className="font-semibold">{taskData.deadlineWarning}</span>
                {taskData.dependentTasks.length > 0 && (
                  <>
                    <br />
                    {taskData.dependentTasks.length} abhängige Aufgaben warten auf Abschluss dieser Aufgabe
                  </>
                )}
              </AlertDescription>
            </Alert>
            )}

            {/* Beschreibung */}
            <div className="space-y-2">
              <h3 className="text-[15px] font-medium">Beschreibung</h3>
              <p className="text-[13px] text-muted-foreground">
                {taskData.description || notification?.message || 'Keine Beschreibung verfügbar.'}
              </p>
            </div>

            {/* Metadaten */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                {taskData.assignedBy.name && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={taskData.assignedBy.avatar} />
                    <AvatarFallback>{taskData.assignedBy.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium">Zugewiesen von</p>
                    <p className="text-[13px] text-muted-foreground">{taskData.assignedBy.name}</p>
                    {taskData.assignedBy.role && <p className="text-[12px] text-muted-foreground">{taskData.assignedBy.role}</p>}
                  </div>
                </div>
                )}

                {taskData.deadline && (
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-[13px] font-medium">Fälligkeitsdatum</p>
                    <p className="text-[13px] text-red-600 font-semibold">{taskData.deadline}</p>
                  </div>
                </div>
                )}
                </div>

              <div className="space-y-3">
                {(taskData.timeSpent > 0 || taskData.timeEstimated > 0) && (
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-[13px] font-medium">Zeitaufwand</p>
                    <p className="text-[13px] text-muted-foreground">
                      {taskData.timeSpent} Stunden / {taskData.timeEstimated} Stunden
                    </p>
                  </div>
                </div>
                )}

                {taskData.progress > 0 && (
                <div className="flex items-start gap-3">
                  <TrendingUp size={18} className="text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-[13px] font-medium mb-2">Fortschritt</p>
                    <div className="space-y-1">
                      <Progress value={taskData.progress} className="h-2" />
                      <p className="text-[12px] text-muted-foreground">{taskData.progress}%</p>
                    </div>
                  </div>
                </div>
                )}
              </div>
            </div>

            {/* Abhängige Aufgaben */}
            {taskData.dependentTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[15px] font-medium">
                Abhängige Aufgaben ({taskData.dependentTasks.length})
              </h3>
              
              <div className="space-y-2">
                {taskData.dependentTasks.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(task.status)}
                      <span className="text-[13px]">{task.title}</span>
                    </div>
                    {getStatusBadge(task.status)}
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Anhänge */}
            {taskData.attachments.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[15px] font-medium">
                Anhänge ({taskData.attachments.length})
              </h3>
              
              <div className="space-y-2">
                {taskData.attachments.map((attachment: any) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Paperclip className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-[13px] font-medium">{attachment.name}</p>
                        <p className="text-[12px] text-muted-foreground">{attachment.size}</p>
                      </div>
                    </div>
                    <Button variant="link" size="sm" className="text-[13px]">
                      Öffnen
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Kommentare */}
            {taskData.comments.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[15px] font-medium">
                Kommentare ({taskData.comments.length})
              </h3>
              
              <div className="space-y-3">
                {taskData.comments.map((comment: any) => (
                  <div key={comment.id} className="flex gap-3 p-3 bg-muted rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.avatar} />
                      <AvatarFallback>{comment.author?.substring(0, 2) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[13px] font-medium">{comment.author}</p>
                        <span className="text-[12px] text-muted-foreground">{comment.timestamp}</span>
                      </div>
                      <p className="text-[13px] text-muted-foreground">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Footer Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={onAssign}>
                <Users className="h-4 w-4 mr-2" />
                Zuweisen
              </Button>
              <Button variant="outline" size="sm" onClick={onAttach}>
                <Paperclip className="h-4 w-4 mr-2" />
                Anhang
              </Button>
              <Button variant="outline" size="sm" onClick={onMove}>
                Verschieben
              </Button>
              <Button 
                size="sm" 
                className="bg-purple-600 hover:bg-purple-700 ml-auto"
                onClick={onMarkComplete}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Als erledigt markieren
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
