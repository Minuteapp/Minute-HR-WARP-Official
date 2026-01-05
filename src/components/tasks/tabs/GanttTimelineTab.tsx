import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  ZoomIn, 
  ZoomOut,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Calendar,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTasksStore } from '@/stores/useTasksStore';
import { useCompanyId } from '@/hooks/useCompanyId';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TimelineTask {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  progress: number;
  projectId: string;
}

interface TimelineProject {
  id: string;
  name: string;
  color: string;
  dotColor: string;
  tasks: TimelineTask[];
}

type TimeRange = 'day' | 'workweek' | 'week' | 'month' | 'year';

const timeRangeLabels: Record<TimeRange, string> = {
  'day': 'Tag',
  'workweek': 'Arbeitswoche',
  'week': 'Woche',
  'month': 'Monat',
  'year': 'Jahr'
};

export function GanttTimelineTab() {
  const { tasks: storeTasks } = useTasksStore();
  const companyId = useCompanyId();
  const [showWeekends, setShowWeekends] = useState(true);
  const [showToday, setShowToday] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set(['1', '2', '3']));
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  // Berechne echte Statistiken aus dem Store
  const now = new Date();
  const activeTasks = storeTasks.filter(t => t.status !== 'done' && t.status !== 'archived');
  const onScheduleTasks = storeTasks.filter(t => {
    if (!t.dueDate || t.status === 'done') return false;
    return new Date(t.dueDate) >= now;
  });
  const dueSoonTasks = storeTasks.filter(t => {
    if (!t.dueDate || t.status === 'done') return false;
    const due = new Date(t.dueDate);
    const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 3;
  });
  const overdueTasks = storeTasks.filter(t => {
    if (!t.dueDate || t.status === 'done') return false;
    return new Date(t.dueDate) < now;
  });

  // Leeres Array für neue Firmen - wird später mit echten Projektdaten gefüllt
  const timelineProjects: TimelineProject[] = [];

  const handleRunAIAnalysis = async () => {
    if (!companyId) {
      toast.error('Keine Firma ausgewählt');
      return;
    }

    if (storeTasks.length === 0) {
      toast.info('Keine Aufgaben vorhanden für die Analyse');
      return;
    }

    setIsAnalyzing(true);
    setAiAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('gantt-ai-analysis', {
        body: { companyId }
      });

      if (error) throw error;

      setAiAnalysis(data?.analysis || 'Keine Analyse verfügbar');
      toast.success('KI-Analyse abgeschlossen');
    } catch (error) {
      console.error('AI Analysis error:', error);
      toast.error('Fehler bei der KI-Analyse');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  // Generate date headers based on timeRange
  const dates = useMemo(() => {
    const today = new Date();
    let dateCount = 8;
    let startDate = new Date(today);
    
    switch (timeRange) {
      case 'day':
        dateCount = 24; // 24 hours
        startDate.setHours(0, 0, 0, 0);
        return Array.from({ length: dateCount }, (_, i) => ({
          day: `${i}:00`,
          weekday: '',
          isToday: false,
          isWeekend: false,
          date: new Date(startDate.getTime() + i * 60 * 60 * 1000)
        }));
      case 'workweek':
        dateCount = 5;
        // Find Monday of current week
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startDate.setDate(diff);
        break;
      case 'week':
        dateCount = 7;
        startDate.setDate(today.getDate() - today.getDay() + 1); // Start from Monday
        break;
      case 'month':
        dateCount = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'year':
        dateCount = 12;
        startDate = new Date(today.getFullYear(), 0, 1);
        return Array.from({ length: dateCount }, (_, i) => {
          const date = new Date(today.getFullYear(), i, 1);
          const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
          return {
            day: monthNames[i],
            weekday: '',
            isToday: today.getMonth() === i,
            isWeekend: false,
            date
          };
        });
    }
    
    return Array.from({ length: dateCount }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return {
        day: date.getDate(),
        weekday: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][date.getDay()],
        isToday: date.toDateString() === today.toDateString(),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        date
      };
    });
  }, [timeRange]);

  const getTaskPosition = (startDate: string, endDate: string) => {
    const baseDate = new Date(2025, 9, 15);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startDay = Math.floor((start.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return {
      left: `${(startDay / 8) * 100}%`,
      width: `${(duration / 8) * 100}%`,
    };
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.getDate()}.${start.getMonth() + 1} → ${end.getDate()}.${end.getMonth() + 1}`;
  };

  return (
    <div className="space-y-6">
      {/* Statistik-Karten */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-background">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{activeTasks.length}</div>
              <div className="text-sm text-muted-foreground">Aktive</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-background">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{onScheduleTasks.length}</div>
              <div className="text-sm text-muted-foreground">Im Zeitplan</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-background">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{dueSoonTasks.length}</div>
              <div className="text-sm text-muted-foreground">Bald fällig</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-background">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{overdueTasks.length}</div>
              <div className="text-sm text-muted-foreground">Überfällig</div>
            </div>
          </div>
        </Card>
      </div>

      {/* KI-Zeitplanung Analyse Box */}
      <Card className="bg-violet-50 border-violet-200">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1 text-violet-700">KI-Zeitplanung Analyse</h3>
              {isAnalyzing ? (
                <div className="flex items-center gap-2 text-sm text-violet-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyse wird durchgeführt...
                </div>
              ) : aiAnalysis ? (
                <p className="text-sm text-violet-600">{aiAnalysis}</p>
              ) : storeTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Keine Aufgaben vorhanden. Erstellen Sie Aufgaben, um eine KI-Analyse durchzuführen.
                </p>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    {storeTasks.length} Aufgabe(n) verfügbar für Zeitplan-Analyse.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRunAIAnalysis}
                    className="text-violet-600 border-violet-300 hover:bg-violet-50"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    KI-Analyse starten
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Zeitraum: {timeRangeLabels[timeRange]}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setTimeRange('day')}>
                Tag
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('workweek')}>
                Arbeitswoche
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('week')}>
                Woche
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('month')}>
                Monat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('year')}>
                Jahr
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <ZoomOut className="h-4 w-4 mr-1" />
            Verkleinern
          </Button>
          <Button variant="outline" size="sm">
            <ZoomIn className="h-4 w-4 mr-1" />
            Vergrößern
          </Button>
        </div>
        <Button size="sm" className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Aufgabe hinzufügen
        </Button>
      </div>

      {/* Timeline */}
      <Card className="overflow-hidden">
        <div className="flex">
          {/* Left column: Task names */}
          <div className="w-72 border-r bg-muted/30 flex-shrink-0">
            <div className="h-12 border-b flex items-center px-4 bg-background font-semibold text-sm">
              Aufgaben & Projekte
            </div>
            {timelineProjects.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                Keine Projekte vorhanden
              </div>
            ) : (
              timelineProjects.map((project) => {
                const isExpanded = expandedProjects.has(project.id);
                return (
                  <div key={project.id}>
                    <div
                      className="h-11 border-b flex items-center px-4 hover:bg-accent cursor-pointer bg-background"
                      onClick={() => toggleProject(project.id)}
                    >
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 mr-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div className={`h-2.5 w-2.5 rounded-full ${project.dotColor} mr-2`} />
                      <span className="font-medium text-sm">{project.name}</span>
                    </div>
                    {isExpanded && project.tasks.map((task) => (
                      <div key={task.id} className="h-11 border-b flex items-center px-4 pl-12 hover:bg-accent text-sm">
                        <div className="flex-1 truncate">{task.title}</div>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatDateRange(task.startDate, task.endDate)}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>

          {/* Right side: Timeline grid */}
          <div className="flex-1 overflow-x-auto">
            {/* Date headers */}
            <div className="h-12 border-b flex bg-background">
              {dates.map((date, i) => (
                <div
                  key={i}
                  className={`flex-1 min-w-[80px] border-l flex flex-col items-center justify-center ${
                    date.isToday && showToday ? 'bg-blue-50' : ''
                  } ${date.isWeekend && showWeekends ? 'bg-muted/50' : ''}`}
                >
                  <div className="text-xs text-muted-foreground">{date.weekday}</div>
                  <div className={`text-sm font-medium ${date.isToday ? 'text-blue-600' : ''}`}>
                    {date.day}
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline bars */}
            {timelineProjects.map((project) => {
              const isExpanded = expandedProjects.has(project.id);
              return (
                <div key={project.id}>
                  {/* Project row */}
                  <div className="h-11 border-b relative flex">
                    {dates.map((date, i) => (
                      <div
                        key={i}
                        className={`flex-1 min-w-[80px] border-l ${
                          date.isToday && showToday ? 'bg-blue-50' : ''
                        } ${date.isWeekend && showWeekends ? 'bg-muted/50' : ''}`}
                      />
                    ))}
                  </div>
                  {/* Task rows */}
                  {isExpanded && project.tasks.map((task) => {
                    const position = getTaskPosition(task.startDate, task.endDate);
                    return (
                      <div key={task.id} className="h-11 border-b relative flex">
                        {dates.map((date, i) => (
                          <div
                            key={i}
                            className={`flex-1 min-w-[80px] border-l ${
                              date.isToday && showToday ? 'bg-blue-50' : ''
                            } ${date.isWeekend && showWeekends ? 'bg-muted/50' : ''}`}
                          />
                        ))}
                        {/* Task bar */}
                        <div
                          className={`absolute top-2 h-7 rounded-md flex items-center px-2 ${project.color}`}
                          style={{
                            left: position.left,
                            width: position.width,
                          }}
                        >
                          <span className="text-xs text-white font-medium truncate flex-1">
                            {task.title.substring(0, 15)}...
                          </span>
                          <span className="text-xs text-white/80 ml-2">{task.progress}%</span>
                        </div>
                        {/* Progress overlay */}
                        <div
                          className={`absolute top-2 h-7 rounded-md ${project.color} opacity-30`}
                          style={{
                            left: position.left,
                            width: `calc(${position.width} * ${task.progress / 100})`,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Legende */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {timelineProjects.length === 0 ? (
              <span className="text-sm text-muted-foreground">Keine Projekte zum Anzeigen</span>
            ) : (
              timelineProjects.map((project) => (
                <div key={project.id} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${project.dotColor}`} />
                  <span className="text-sm">{project.name}</span>
                </div>
              ))
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-blue-50 border border-blue-200 rounded" />
              <span className="text-sm text-muted-foreground">Heutiger Tag</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-muted/50 border rounded" />
              <span className="text-sm text-muted-foreground">Wochenende</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
