import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, FolderOpen, Calendar, User, CheckCircle2, Clock, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TaskDetailViewDialog } from './TaskDetailViewDialog';
import { TaskFilterDropdown, TaskFilters } from './TaskFilterDropdown';
import { TaskSortDropdown, SortOption } from './TaskSortDropdown';
import { CreateTaskDialog } from './CreateTaskDialog';
import { TaskBulkActions } from './TaskBulkActions';
import { Task } from '@/types/tasks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, isToday, isThisWeek, parseISO, isBefore } from 'date-fns';
import { de } from 'date-fns/locale';

export const OverviewView = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  
  // Filter State
  const [filters, setFilters] = useState<TaskFilters>({
    status: ['all'],
    priority: ['all'],
    project: ['all']
  });
  
  // Sort State
  const [sortBy, setSortBy] = useState<SortOption>('dueDate-asc');

  // Echte Daten aus Datenbank laden - nur eigene Aufgaben
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks-overview'],
    queryFn: async () => {
      // Hole aktuelle Session für User-ID
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      // Hole Mitarbeiter-ID des aktuellen Benutzers
      let employeeId: string | null = null;
      if (userId) {
        const { data: employee } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
        
        employeeId = employee?.id || null;
      }

      // Query mit Filter: Nur eigene Aufgaben
      let query = supabase
        .from('tasks')
        .select('*')
        .not('status', 'eq', 'deleted')
        .order('created_at', { ascending: false });

      // Filter auf eigene Aufgaben (assigned_to enthält die User-ID oder Employee-ID)
      if (userId && employeeId) {
        query = query.or(`assigned_to.cs.{${userId}},assigned_to.cs.{${employeeId}},created_by.eq.${userId}`);
      } else if (userId) {
        query = query.or(`assigned_to.cs.{${userId}},created_by.eq.${userId}`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
  });

  // Mutation zum Aktualisieren des Status
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', taskId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-overview'] });
      toast({
        title: "Erfolg",
        description: "Aufgabe als erledigt markiert.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Status konnte nicht geändert werden.",
        variant: "destructive"
      });
    }
  });

  // Mutation zum Löschen
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'deleted' })
        .eq('id', taskId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-overview'] });
      toast({
        title: "Erfolg",
        description: "Aufgabe gelöscht.",
      });
    }
  });

  // Statistiken berechnen
  const statistics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const openTasks = tasks.filter(t => t.status !== 'done' && t.status !== 'archived' && t.status !== 'deleted');
    const dueTodayTasks = tasks.filter(t => {
      if (!t.due_date || t.status === 'done') return false;
      return isToday(parseISO(t.due_date));
    });
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const thisWeekTasks = tasks.filter(t => {
      if (!t.due_date || t.status === 'done') return false;
      return isThisWeek(parseISO(t.due_date), { weekStartsOn: 1 });
    });
    const completedThisWeek = tasks.filter(t => {
      if (t.status !== 'done' || !t.updated_at) return false;
      return isThisWeek(parseISO(t.updated_at), { weekStartsOn: 1 });
    });

    const avgProgress = inProgressTasks.length > 0
      ? Math.round(inProgressTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / inProgressTasks.length)
      : 0;

    return {
      totalOpen: openTasks.length,
      dueToday: dueTodayTasks.length,
      inProgress: inProgressTasks.length,
      thisWeek: thisWeekTasks.length,
      completedThisWeek: completedThisWeek.length,
      avgProgress
    };
  }, [tasks]);

  // Filter und Sortierung anwenden
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];
    
    // Filter anwenden
    if (!filters.status.includes('all')) {
      result = result.filter(t => {
        const statusMap: Record<string, string[]> = {
          'todo': ['todo', 'open'],
          'in-progress': ['in_progress', 'in-progress'],
          'done': ['done', 'completed']
        };
        return filters.status.some(s => statusMap[s]?.includes(t.status) || t.status === s);
      });
    }
    
    if (!filters.priority.includes('all')) {
      result = result.filter(t => filters.priority.includes(t.priority));
    }
    
    // Sortierung anwenden
    result.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate-asc':
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'dueDate-desc':
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
        case 'priority-desc':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                 (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'progress-desc':
          return (b.progress || 0) - (a.progress || 0);
        case 'progress-asc':
          return (a.progress || 0) - (b.progress || 0);
        default:
          return 0;
      }
    });
    
    return result;
  }, [tasks, filters, sortBy]);

  // Multi-Select Handler
  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(filteredAndSortedTasks.map(t => t.id));
    } else {
      setSelectedTasks([]);
    }
  };

  // Task zu Task-Type mappen
  const mapToTask = (dbTask: any): Task => ({
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description,
    status: dbTask.status === 'in_progress' ? 'in-progress' : dbTask.status,
    priority: dbTask.priority || 'medium',
    dueDate: dbTask.due_date,
    assignedTo: dbTask.assigned_to ? [dbTask.assigned_to] : [],
    projectId: dbTask.project_id,
    tags: dbTask.tags || [],
    progress: dbTask.progress || 0,
    completed: dbTask.status === 'done',
    createdAt: dbTask.created_at,
    updatedAt: dbTask.updated_at,
  });

  // Status Badge berechnen
  const getStatusInfo = (task: any) => {
    if (task.status === 'done') return { label: 'Erledigt', variant: 'default' as const };
    if (task.due_date) {
      const dueDate = parseISO(task.due_date);
      if (isBefore(dueDate, new Date()) && task.status !== 'done') {
        return { label: 'Überfällig', variant: 'destructive' as const };
      }
      if (isToday(dueDate)) {
        return { label: 'Heute', variant: 'secondary' as const };
      }
    }
    return null;
  };

  // Priorität Label
  const getPriorityLabel = (priority: string) => {
    const map: Record<string, string> = {
      high: 'Hoch',
      medium: 'Mittel',
      low: 'Niedrig'
    };
    return map[priority] || priority;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KI-Zusammenfassung */}
      <Card className="p-4 bg-white border">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-2">KI-Zusammenfassung für heute</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {statistics.totalOpen === 0 ? (
                "Keine offenen Aufgaben. Erstellen Sie eine neue Aufgabe, um loszulegen."
              ) : (
                <>
                  Sie haben <span className="font-semibold text-foreground">{statistics.dueToday} Aufgaben</span>, die heute fällig sind. 
                  {statistics.inProgress > 0 && (
                    <> Es sind <span className="font-semibold text-foreground">{statistics.inProgress} Aufgaben</span> in Bearbeitung mit durchschnittlich {statistics.avgProgress}% Fortschritt.</>
                  )}
                </>
              )}
            </p>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs">{statistics.dueToday} heute fällig</Badge>
              <Badge variant="destructive" className="text-xs">{tasks.filter(t => t.due_date && isBefore(parseISO(t.due_date), new Date()) && t.status !== 'done').length} überfällig</Badge>
              <Badge variant="default" className="text-xs">{statistics.inProgress} in Bearbeitung</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Statistik-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Gesamt offen</span>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold mb-1">{statistics.totalOpen}</div>
          <div className="text-xs text-muted-foreground">Offene Aufgaben</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Heute fällig</span>
            <Clock className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-3xl font-bold mb-1">{statistics.dueToday}</div>
          <div className="text-xs text-orange-500 font-medium">
            {statistics.dueToday > 0 ? 'Dringend' : 'Keine'}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">In Bearbeitung</span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-3xl font-bold mb-1">{statistics.inProgress}</div>
          <div className="text-xs text-muted-foreground">⌀ {statistics.avgProgress}% Fortschritt</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Diese Woche</span>
            <Calendar className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-3xl font-bold mb-1">{statistics.thisWeek}</div>
          <div className="text-xs text-green-500 font-medium">{statistics.completedThisWeek} abgeschlossen</div>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedTasks.length > 0 && (
        <TaskBulkActions
          selectedTasks={selectedTasks}
          onSelectionClear={() => setSelectedTasks([])}
        />
      )}

      {/* Filter und Aktionen */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <TaskFilterDropdown filters={filters} onFiltersChange={setFilters} />
          <TaskSortDropdown sortBy={sortBy} onSortChange={setSortBy} />
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          Aufgabe erstellen
        </Button>
      </div>

      {/* Alle auswählen */}
      {filteredAndSortedTasks.length > 0 && (
        <div className="flex items-center gap-2 px-4">
          <Checkbox 
            checked={selectedTasks.length === filteredAndSortedTasks.length && filteredAndSortedTasks.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            {selectedTasks.length > 0 
              ? `${selectedTasks.length} von ${filteredAndSortedTasks.length} ausgewählt`
              : 'Alle auswählen'}
          </span>
        </div>
      )}

      {/* Aufgaben-Liste */}
      <div className="space-y-3">
        {filteredAndSortedTasks.length === 0 ? (
          <Card className="p-8 text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Keine Aufgaben gefunden</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {tasks.length === 0 
                ? 'Erstellen Sie Ihre erste Aufgabe, um loszulegen.'
                : 'Keine Aufgaben entsprechen Ihren Filterkriterien.'}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              Aufgabe erstellen
            </Button>
          </Card>
        ) : (
          filteredAndSortedTasks.map((task) => {
            const statusInfo = getStatusInfo(task);
            
            return (
              <Card 
                key={task.id} 
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <Checkbox 
                    className="mt-1" 
                    checked={selectedTasks.includes(task.id)}
                    onCheckedChange={(checked) => handleSelectTask(task.id, checked as boolean)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  <div 
                    className="flex-1 min-w-0"
                    onClick={() => {
                      setSelectedTask(mapToTask(task));
                      setIsDetailOpen(true);
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{task.title}</h3>
                      {statusInfo && (
                        <Badge variant={statusInfo.variant} className="text-xs">
                          {statusInfo.label}
                        </Badge>
                      )}
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      {task.project_id && (
                        <div className="flex items-center gap-1">
                          <FolderOpen className="h-3 w-3" />
                          {task.project_id}
                        </div>
                      )}
                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(parseISO(task.due_date), 'dd.MM.yyyy', { locale: de })}
                        </div>
                      )}
                      {task.assigned_to && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.assigned_to}
                        </div>
                      )}
                    </div>
                    
                    {(task.progress !== undefined && task.progress > 0) && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Fortschritt</span>
                          <span className="font-medium">{task.progress}%</span>
                        </div>
                        <Progress value={task.progress} className="h-2" />
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {getPriorityLabel(task.priority)}
                      </Badge>
                      {task.tags?.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => updateTaskMutation.mutate({ taskId: task.id, status: 'done' })}
                      disabled={task.status === 'done'}
                    >
                      <CheckCircle2 className={`h-4 w-4 ${task.status === 'done' ? 'text-green-600' : 'text-muted-foreground hover:text-green-600'}`} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => deleteTaskMutation.mutate(task.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-600" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedTask(mapToTask(task));
                          setIsDetailOpen(true);
                        }}>
                          Details anzeigen
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateTaskMutation.mutate({ taskId: task.id, status: 'in_progress' })}>
                          In Bearbeitung setzen
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateTaskMutation.mutate({ taskId: task.id, status: 'archived' })}>
                          Archivieren
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => deleteTaskMutation.mutate(task.id)}
                        >
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Task Detail Dialog */}
      <TaskDetailViewDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        task={selectedTask}
      />

      {/* Create Task Dialog */}
      <CreateTaskDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};
