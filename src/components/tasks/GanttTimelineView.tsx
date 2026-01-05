import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Plus, 
  ZoomIn, 
  ZoomOut,
  Calendar,
  ChevronDown,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useTasksStore } from '@/stores/useTasksStore';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  color: string;
  tasks: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    progress: number;
  }[];
}

interface AIAnalysisResult {
  analysis: string;
  conflicts: { tasks: string[]; assignee: string }[];
  recommendations: string[];
  stats?: {
    total: number;
    overdue: number;
    dueSoon: number;
    conflictsCount: number;
  };
}

export const GanttTimelineView = () => {
  const { tasks } = useTasksStore();
  const companyId = useCompanyId();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);

  // Transformiere echte Aufgaben in Projekt-Struktur
  const projects = useMemo(() => {
    const projectMap = new Map<string, Project>();
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'];
    let colorIndex = 0;

    tasks.forEach(task => {
      if (!task.dueDate) return;

      const projectId = task.projectId || 'unassigned';
      const projectName = task.projectId ? `Projekt ${task.projectId.slice(0, 8)}` : 'Ohne Projekt';

      if (!projectMap.has(projectId)) {
        projectMap.set(projectId, {
          id: projectId,
          name: projectName,
          color: colors[colorIndex % colors.length],
          tasks: []
        });
        colorIndex++;
      }

      const project = projectMap.get(projectId)!;
      project.tasks.push({
        id: task.id,
        name: task.title,
        startDate: new Date(task.createdAt || new Date()),
        endDate: new Date(task.dueDate),
        progress: task.progress || 0
      });
    });

    return Array.from(projectMap.values());
  }, [tasks]);

  const [expandedProjects, setExpandedProjects] = useState<string[]>(projects.map(p => p.id));

  // Calculate stats from real data
  const now = new Date();
  const activeCount = tasks.filter(t => t.status === 'in-progress').length;
  const onScheduleCount = tasks.filter(t => {
    if (!t.dueDate || t.status === 'done') return false;
    return new Date(t.dueDate) >= now;
  }).length;
  const dueSoonCount = tasks.filter(t => {
    if (!t.dueDate || t.status === 'done') return false;
    const dueDate = new Date(t.dueDate);
    const daysDiff = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff >= 0 && daysDiff <= 3;
  }).length;
  const overdueCount = tasks.filter(t => {
    if (!t.dueDate || t.status === 'done') return false;
    return new Date(t.dueDate) < now;
  }).length;

  // Generate days for the calendar header
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - startDate.getDay() + 1);
  
  const days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date;
  });

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const getDayName = (date: Date) => {
    const names = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    return names[date.getDay()];
  };

  const isWeekend = (date: Date) => {
    return date.getDay() === 0 || date.getDay() === 6;
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const getTaskPosition = (task: Project['tasks'][0], days: Date[]) => {
    const startDay = days.findIndex(d => d.toDateString() === task.startDate.toDateString());
    const endDay = days.findIndex(d => d.toDateString() === task.endDate.toDateString());
    
    if (startDay === -1 && endDay === -1) return null;
    
    const left = Math.max(0, startDay) * (100 / days.length);
    const width = (Math.min(days.length - 1, endDay) - Math.max(0, startDay) + 1) * (100 / days.length);
    
    return { left: `${left}%`, width: `${width}%` };
  };

  const handleRunAIAnalysis = async () => {
    if (!companyId) {
      toast.error('Keine Firma ausgewählt');
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('gantt-ai-analysis', {
        body: { companyId }
      });

      if (error) throw error;

      setAiAnalysis(data);
      toast.success('Zeitplan-Analyse abgeschlossen');
    } catch (error) {
      console.error('AI Analysis error:', error);
      toast.error('Zeitplan-Analyse fehlgeschlagen');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Statistik-Karten */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Aktive Aufgaben</span>
              <Calendar className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Im Zeitplan</span>
              <Calendar className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">{onScheduleCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Bald fällig</span>
              <Calendar className="h-4 w-4 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">{dueSoonCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Überfällig</span>
              <Calendar className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* KI-Zeitplanung Analyse */}
      <Card className="bg-violet-50 border-violet-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-violet-600 rounded-lg">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-violet-900 text-sm">KI-Zeitplanung Analyse</h3>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleRunAIAnalysis}
                  disabled={isAnalyzing}
                  className="bg-white"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analysiere...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      KI-Analyse starten
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-violet-800 mt-2">
                {aiAnalysis ? (
                  aiAnalysis.analysis
                ) : tasks.length === 0 ? (
                  'Keine Aufgaben vorhanden. Erstellen Sie Aufgaben mit Fälligkeitsdaten für eine Zeitplan-Analyse.'
                ) : (
                  `${tasks.length} Aufgaben gefunden. Klicken Sie auf "KI-Analyse starten" für Zeitplan-Optimierungen.`
                )}
              </p>
              {aiAnalysis?.recommendations && aiAnalysis.recommendations.length > 0 && (
                <ul className="mt-2 text-sm text-violet-700 list-disc list-inside">
                  {aiAnalysis.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2))}
          >
            <ZoomIn className="h-4 w-4 mr-1" />
            Vergrößern
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.5))}
          >
            <ZoomOut className="h-4 w-4 mr-1" />
            Verkleinern
          </Button>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Aufgabe hinzufügen
        </Button>
      </div>

      {/* Gantt Chart */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[900px]" style={{ transform: `scaleX(${zoomLevel})`, transformOrigin: 'left' }}>
            {/* Header */}
            <div className="flex border-b">
              <div className="w-64 flex-shrink-0 p-3 bg-gray-50 font-medium text-sm border-r">
                Aufgaben & Projekte
              </div>
              <div className="flex-1 flex">
                {days.map((day, i) => (
                  <div 
                    key={i}
                    className={`flex-1 text-center p-2 text-xs border-r last:border-r-0 ${
                      isToday(day) ? 'bg-blue-100' : isWeekend(day) ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="font-medium">{getDayName(day)}</div>
                    <div className="text-muted-foreground">{day.getDate()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects & Tasks */}
            {projects.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Keine Aufgaben mit Fälligkeitsdaten vorhanden.
              </div>
            ) : (
              projects.map((project) => (
                <div key={project.id}>
                  {/* Project Row */}
                  <div 
                    className="flex border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleProject(project.id)}
                  >
                    <div className="w-64 flex-shrink-0 p-3 flex items-center gap-2 border-r">
                      {expandedProjects.includes(project.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <div className={`w-3 h-3 rounded-full ${project.color}`} />
                      <span className="font-medium text-sm truncate">{project.name}</span>
                      <span className="text-xs text-muted-foreground">({project.tasks.length})</span>
                    </div>
                    <div className="flex-1 relative h-10">
                      {days.map((day, i) => (
                        <div 
                          key={i}
                          className={`absolute top-0 bottom-0 border-r ${
                            isToday(day) ? 'bg-blue-50' : isWeekend(day) ? 'bg-gray-50' : ''
                          }`}
                          style={{ left: `${(i / days.length) * 100}%`, width: `${100 / days.length}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Task Rows */}
                  {expandedProjects.includes(project.id) && project.tasks.map((task) => {
                    const position = getTaskPosition(task, days);
                    
                    return (
                      <div key={task.id} className="flex border-b hover:bg-gray-50">
                        <div className="w-64 flex-shrink-0 p-3 pl-10 flex items-center gap-2 border-r">
                          <span className="text-sm text-muted-foreground truncate">{task.name}</span>
                        </div>
                        <div className="flex-1 relative h-10">
                          {days.map((day, i) => (
                            <div 
                              key={i}
                              className={`absolute top-0 bottom-0 border-r ${
                                isToday(day) ? 'bg-blue-50' : isWeekend(day) ? 'bg-gray-50' : ''
                              }`}
                              style={{ left: `${(i / days.length) * 100}%`, width: `${100 / days.length}%` }}
                            />
                          ))}
                          
                          {position && (
                            <div 
                              className={`absolute top-2 h-6 ${project.color} rounded flex items-center px-2`}
                              style={{ left: position.left, width: position.width }}
                            >
                              <div 
                                className="absolute left-0 top-0 bottom-0 bg-white/30 rounded-l"
                                style={{ width: `${task.progress}%` }}
                              />
                              <span className="relative text-white text-xs font-medium truncate">
                                {task.name} ({task.progress}%)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legende */}
      <div className="flex items-center gap-6 text-sm flex-wrap">
        {projects.slice(0, 3).map(project => (
          <div key={project.id} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${project.color}`} />
            <span className="truncate max-w-[150px]">{project.name}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-100" />
          <span>Heutiger Tag</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-200" />
          <span>Wochenende</span>
        </div>
      </div>
    </div>
  );
};
