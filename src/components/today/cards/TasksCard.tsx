
import React, { useMemo } from 'react';
import { CalendarClock, CheckCircle2, Circle, AlertTriangle, MoreHorizontal } from 'lucide-react';
import { useTasksStore } from '@/stores/useTasksStore';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TasksCardProps {
  onSeeAll: () => void;
  darkMode?: boolean;
  onToggleVisibility?: () => void;
}

export const TasksCard: React.FC<TasksCardProps> = ({ 
  onSeeAll,
  darkMode = false,
  onToggleVisibility
}) => {
  const { tasks } = useTasksStore();

  // Filtere die Aufgaben, um nur die Aufgaben für heute anzuzeigen
  const todayTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDueDate = new Date(task.dueDate);
      const today = new Date();
      return (
        taskDueDate.getDate() === today.getDate() &&
        taskDueDate.getMonth() === today.getMonth() &&
        taskDueDate.getFullYear() === today.getFullYear()
      );
    });
  }, [tasks]);

  // Aufgaben nach Datum und Priorität sortieren
  const sortedTasks = useMemo(() => {
    return [...todayTasks].sort((a, b) => {
      // Nach Status (nicht erledigt vor erledigt)
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;

      // Nach Fälligkeit (überfällig vor bald fällig)
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } 
      
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      
      // Nach Update-Zeit (neuere vor älteren)
      if (a.updatedAt && b.updatedAt) {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      
      return 0;
    }).slice(0, 5); // Begrenzen auf 5 Aufgaben
  }, [todayTasks]);
  
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <Card className="today-card h-full flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <CalendarClock className="h-5 w-5 text-primary" />
          Heutige Aufgaben
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onSeeAll}>
              Alle anzeigen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleVisibility}>
              Card ausblenden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto">
        {sortedTasks.length > 0 ? (
          <ul className="space-y-3">
            {sortedTasks.map(task => {
              const getPriorityBadge = () => {
                if (task.priority === 'high') return { text: 'Hoch', class: 'bg-red-100 text-red-800' };
                if (task.priority === 'medium') return { text: 'Mittel', class: 'bg-yellow-100 text-yellow-800' };
                return { text: 'Niedrig', class: 'bg-green-100 text-green-800' };
              };
              
              const badge = getPriorityBadge();
              const category = task.projectId ? 'Projekt' : 'Allgemein';
              
              return (
                <li key={task.id} className="flex items-start gap-3 p-2 rounded-md bg-muted/50">
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5 mt-0.5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 mt-0.5 text-gray-400" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium line-clamp-1">
                        {task.title}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(task.dueDate), 'HH:mm', { locale: de })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${badge.class}`}>
                        {badge.text}
                      </span>
                      <span className="text-xs text-muted-foreground">{category}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-6">
            <CalendarClock className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Keine Aufgaben für heute</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 flex-shrink-0">
        <Button
          variant="default"
          className="w-full"
          onClick={onSeeAll}
        >
          + Neue Aufgabe
        </Button>
      </CardFooter>
    </Card>
  );
};
