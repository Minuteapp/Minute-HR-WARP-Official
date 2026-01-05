import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Sparkles, 
  Inbox, 
  Clock, 
  TrendingUp, 
  CalendarCheck,
  CheckCircle2,
  Trash2,
  MoreVertical,
  Calendar,
  User,
  Briefcase,
  Info
} from 'lucide-react';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { KanbanBoardTab } from '@/components/tasks/tabs/KanbanBoardTab';
import { GanttTimelineTab } from '@/components/tasks/tabs/GanttTimelineTab';
import { ArchiveTab } from '@/components/tasks/tabs/ArchiveTab';
import { TaskStatistics } from '@/components/tasks/TaskStatistics';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';
import { TaskFilterDropdown, TaskFilters } from '@/components/tasks/TaskFilterDropdown';
import { TaskSortDropdown, SortOption } from '@/components/tasks/TaskSortDropdown';
import { TaskDetailViewDialog } from '@/components/tasks/TaskDetailViewDialog';
import { ProjectRoadmapView } from '@/components/tasks/ProjectRoadmapView';
import { useTasksStore } from '@/stores/useTasksStore';
import { Task } from '@/types/tasks';
import { useEffectiveSettings } from '@/hooks/useEffectiveSettings';
import { useRolePreview } from '@/hooks/useRolePreview';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const Tasks = () => {
  // Settings-Driven Architecture: Lade Aufgaben-Einstellungen
  const { isAllowed, loading: settingsLoading, getRestrictionReason } = useEffectiveSettings('tasks');
  
  // Role Preview für rollenbasierte Ansicht
  const { previewRole } = useRolePreview();
  const isEmployee = previewRole === 'employee';
  
  // Prüfe ob Aufgaben erstellen erlaubt ist
  const canCreateTask = isAllowed('create_task_allowed');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({
    status: ['all'],
    priority: ['all'],
    project: ['all'],
  });
  const [sortBy, setSortBy] = useState<SortOption>('dueDate-asc');
  
  const { tasks, isLoading, fetchTasks, updateTask, deleteTask } = useTasksStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    await updateTask(taskId, { 
      status: completed ? 'done' : 'todo',
      completed,
      progress: completed ? 100 : 0
    });
  };

  const handleTaskDelete = async (taskId: string): Promise<boolean> => {
    return await deleteTask(taskId);
  };

  // Statistiken berechnen
  const totalOpen = tasks.filter(t => t.status !== 'done').length;
  const dueToday = tasks.filter(t => {
    if (!t.dueDate) return false;
    const today = new Date().toDateString();
    return new Date(t.dueDate).toDateString() === today;
  }).length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const thisWeek = tasks.filter(t => {
    if (!t.dueDate) return false;
    const now = new Date();
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const dueDate = new Date(t.dueDate);
    return dueDate >= now && dueDate <= weekEnd;
  }).length;
  const completedThisWeek = tasks.filter(t => {
    if (!t.updatedAt || t.status !== 'done') return false;
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const completedDate = new Date(t.updatedAt);
    return completedDate >= weekStart;
  }).length;

  // Gefilterte und sortierte Aufgaben
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];
    
    // Filter anwenden
    if (!filters.status.includes('all')) {
      result = result.filter(t => {
        const statusMap: Record<string, string[]> = {
          'Offen': ['todo', 'pending'],
          'In Bearbeitung': ['in-progress'],
          'Abgeschlossen': ['done', 'completed']
        };
        return filters.status.some(s => statusMap[s]?.includes(t.status) || t.status === s.toLowerCase());
      });
    }
    
    if (!filters.priority.includes('all')) {
      result = result.filter(t => {
        const priorityMap: Record<string, string[]> = {
          'Hoch': ['high'],
          'Mittel': ['medium'],
          'Niedrig': ['low']
        };
        return filters.priority.some(p => priorityMap[p]?.includes(t.priority) || t.priority === p.toLowerCase());
      });
    }
    
    // Sortierung anwenden
    result.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate-asc':
          return new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime();
        case 'dueDate-desc':
          return new Date(b.dueDate || 0).getTime() - new Date(a.dueDate || 0).getTime();
        case 'priority-desc': {
          const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
          return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
        }
        case 'title-asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'title-desc':
          return (b.title || '').localeCompare(a.title || '');
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
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

  const getPriorityColor = (badge: string) => {
    if (badge === 'Hoch') return 'bg-red-100 text-red-700';
    if (badge === 'Mittel') return 'bg-yellow-100 text-yellow-700';
    if (badge === 'Niedrig') return 'bg-blue-100 text-blue-700';
    if (badge === 'In Bearbeitung') return 'bg-blue-100 text-blue-700';
    if (badge === 'Offen') return 'bg-gray-100 text-gray-700';
    return 'bg-gray-100 text-gray-600';
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes('Recruiting')) return <Briefcase className="h-4 w-4" />;
    if (category.includes('Performance')) return <TrendingUp className="h-4 w-4" />;
    if (category.includes('Onboarding')) return <User className="h-4 w-4" />;
    return <Briefcase className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Aufgaben</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Verwalten Sie Ihre Aufgaben, Projekte und Workflows
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="kanban">Kanban-Board</TabsTrigger>
            {!isEmployee && (
              <>
                <TabsTrigger value="team">Teamaufgaben</TabsTrigger>
                <TabsTrigger value="projects">Projekt & Roadmap</TabsTrigger>
                <TabsTrigger value="timeline">Gantt & Timeline</TabsTrigger>
                <TabsTrigger value="archive">Archiv</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* KI-Zusammenfassung - nur für höhere Rollen */}
            {!isEmployee && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 mb-2">KI-Zusammenfassung für heute</h3>
                      <p className="text-sm text-blue-800 mb-3">
                        Guten Morgen! Sie haben <span className="font-semibold">2 Aufgaben mit hoher Priorität</span>, die heute fällig sind. 
                        Die Gehaltsabrechnung ist zu <span className="font-semibold">75% fertig</span> und könnte heute abgeschlossen werden. 
                        Achtung: Der Vertragsprüfung fehlt noch die Freigabe vom Vorgesetzten.
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="bg-white">
                          2 heute fällig
                        </Badge>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                          1 überfällig
                        </Badge>
                        <Badge variant="secondary" className="bg-white">
                          3 in Bearbeitung
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Statistikkarten - 2 Karten für Mitarbeiter, 4 für andere Rollen */}
            {isEmployee ? (
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Meine Aufgaben</span>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{totalOpen}</div>
                    <div className="text-xs text-muted-foreground">Aktuell zugewiesen</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">In Bearbeitung</span>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{inProgress}</div>
                    <div className="text-xs text-muted-foreground">Aktive Tasks</div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Gesamt offen</span>
                      <Inbox className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{totalOpen}</div>
                    <div className="text-xs text-muted-foreground">+1 seit gestern</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Heute fällig</span>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{dueToday}</div>
                    <div className="text-xs text-orange-600 font-medium">Hohe Priorität</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">In Bearbeitung</span>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{inProgress}</div>
                    <div className="text-xs text-muted-foreground">Ø 65% Fortschritt</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Diese Woche</span>
                      <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{thisWeek}</div>
                    <div className="text-xs text-green-600 font-medium">{completedThisWeek} abgeschlossen</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Filter und Aktionen */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <TaskFilterDropdown filters={filters} onFiltersChange={setFilters} />
                <TaskSortDropdown sortBy={sortBy} onSortChange={setSortBy} />
              </div>
              {canCreateTask ? (
                <Button onClick={() => setShowCreateTask(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Aufgabe erstellen
                </Button>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <Button disabled className="gap-2 opacity-50 cursor-not-allowed">
                          <Plus className="h-4 w-4" />
                          Aufgabe erstellen
                        </Button>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{getRestrictionReason('create_task_allowed') || 'Aufgabenerstellung nicht erlaubt'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Aufgabenliste */}
            <div className="space-y-3">
              {filteredAndSortedTasks.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Keine Aufgaben gefunden</p>
                    <Button onClick={() => setShowCreateTask(true)} className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      Erste Aufgabe erstellen
                    </Button>
                  </CardContent>
                </Card>
              ) : filteredAndSortedTasks.map((task) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
                const isToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();
                const priorityLabel = task.priority === 'high' ? 'Hoch' : task.priority === 'medium' ? 'Mittel' : 'Niedrig';
                const statusLabel = task.status === 'todo' ? 'Offen' : task.status === 'in-progress' ? 'In Bearbeitung' : 'Abgeschlossen';
                
                return (
                  <Card 
                    key={task.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleTaskClick(task)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Checkbox 
                          className="mt-1" 
                          checked={task.completed}
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={(checked) => handleTaskComplete(task.id, !!checked)}
                        />
                        
                        <div className="flex-1 space-y-3">
                          {/* Titel und Status */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{task.title}</h3>
                                {isOverdue && (
                                  <Badge variant="destructive" className="text-xs">Überfällig</Badge>
                                )}
                                {isToday && !isOverdue && (
                                  <Badge className="text-xs bg-orange-100 text-orange-700">Heute</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{task.description || ''}</p>
                            </div>
                            
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-green-600"
                                onClick={() => handleTaskComplete(task.id, true)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-600"
                                onClick={() => handleTaskDelete(task.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Meta-Informationen */}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {task.projectId && (
                              <div className="flex items-center gap-1">
                                <Briefcase className="h-4 w-4" />
                                <span>Projekt</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{task.dueDate || 'Kein Datum'}</span>
                            </div>
                            {task.assignedTo && task.assignedTo.length > 0 && (
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{task.assignedTo[0]}</span>
                              </div>
                            )}
                          </div>

                          {/* Fortschrittsbalken */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Fortschritt</span>
                              <span className="font-medium">{task.progress || 0}%</span>
                            </div>
                            <Progress value={task.progress || 0} className="h-2" />
                          </div>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getPriorityColor(priorityLabel)}`}
                            >
                              {priorityLabel}
                            </Badge>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getPriorityColor(statusLabel)}`}
                            >
                              {statusLabel}
                            </Badge>
                            {task.tags?.map((tag, index) => (
                              <Badge 
                                key={index} 
                                variant="secondary" 
                                className="text-xs bg-gray-100 text-gray-600"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Tabs nur für Nicht-Mitarbeiter */}
          {!isEmployee && (
            <>
              <TabsContent value="team" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground">Teamaufgaben werden hier angezeigt</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects" className="space-y-6">
                <ProjectRoadmapView />
              </TabsContent>

              <TabsContent value="timeline" className="space-y-6">
                <GanttTimelineTab />
              </TabsContent>

              <TabsContent value="archive" className="space-y-6">
                <ArchiveTab />
              </TabsContent>
            </>
          )}

          <TabsContent value="kanban" className="space-y-6">
            <KanbanBoardTab />
          </TabsContent>
        </Tabs>

        {/* Create Task Dialog */}
        <CreateTaskDialog 
          open={showCreateTask}
          onOpenChange={setShowCreateTask}
        />

        {/* Task Detail Dialog */}
        <TaskDetailViewDialog
          open={showTaskDetail}
          onOpenChange={setShowTaskDetail}
          task={selectedTask}
        />
      </div>
    </div>
  );
};

export default Tasks;
