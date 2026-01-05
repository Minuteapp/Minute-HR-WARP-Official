
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Calendar, MoreVertical, Clock, Target } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskCardProps {
  task: any;
}

export const TaskCard = ({ task }: TaskCardProps) => {
  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-progress':
      case 'in_progress':
        return <Badge variant="outline" className="border-gray-300">In Bearbeitung</Badge>;
      case 'blocked':
        return <Badge className="bg-red-500 text-white hover:bg-red-500">Blockiert</Badge>;
      case 'todo':
      case 'pending':
        return <Badge variant="outline" className="border-gray-300">Zu erledigen</Badge>;
      case 'completed':
      case 'done':
        return <Badge className="bg-green-100 text-green-600 border border-green-200 hover:bg-green-100">Abgeschlossen</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="outline" className="border-red-300 text-red-600">Kritisch</Badge>;
      case 'high':
        return <Badge variant="outline" className="border-orange-300 text-orange-600">Hoch</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-yellow-300 text-yellow-600">Mittel</Badge>;
      case 'low':
        return <Badge variant="outline" className="border-green-300 text-green-600">Niedrig</Badge>;
      default:
        return null;
    }
  };

  // Calculate days overdue
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const now = new Date();
  const daysOverdue = dueDate && dueDate < now 
    ? Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const estimatedHours = task.estimated_hours || 0;
  const actualHours = task.actual_hours || 0;
  const hoursDiff = estimatedHours - actualHours;
  const storyPoints = task.story_points || 0;

  const dependencies = task.dependencies || [];

  return (
    <Card className="bg-white border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold">{task.title || task.name}</h4>
            </div>
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(task.status)}
            {getPriorityBadge(task.priority)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Löschen</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{task.assignee || '-'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(task.due_date)}</span>
          </div>
          {daysOverdue > 0 && (
            <Badge className="bg-red-500 text-white text-xs hover:bg-red-500">
              {daysOverdue} Tage überfällig
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-muted-foreground">Geschätzte Zeit</p>
            <p className="font-medium">{estimatedHours}h</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tatsächliche Zeit</p>
            <p className={`font-medium ${hoursDiff > 0 ? 'text-green-500' : hoursDiff < 0 ? 'text-red-500' : ''}`}>
              {actualHours}h
              {hoursDiff !== 0 && ` (${hoursDiff > 0 ? '-' : '+'}${Math.abs(hoursDiff)}h)`}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Story Points</p>
            <p className="font-medium">{storyPoints} SP</p>
          </div>
        </div>

        {dependencies.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-muted-foreground mb-2">Abhängigkeiten</p>
            <div className="flex flex-wrap gap-2">
              {dependencies.map((dep: string, index: number) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="bg-gray-100 border-gray-200 text-gray-700"
                >
                  {dep}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
