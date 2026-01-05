import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  Sparkles,
  ArrowRight,
  Plus,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { useCompanyId } from '@/hooks/useCompanyId';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface ProjectProgress {
  id: string;
  title: string;
  team: string;
  avatar: string;
  avatarColor: string;
  actualProgress: number;
  expectedProgress: number;
  startDate: string;
  endDate: string;
  status: 'ahead' | 'on-track' | 'delayed';
}

const CapacityProgressTab: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const companyId = useCompanyId();

  // Projekte laden
  const { data: projects = [] } = useQuery({
    queryKey: ['projects-capacity', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('company_id', companyId);
      return data || [];
    },
    enabled: !!companyId
  });

  // Aufgaben laden
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks-capacity', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('company_id', companyId);
      return data || [];
    },
    enabled: !!companyId
  });

  // Dynamische Statistiken berechnen
  const now = new Date();
  const completedTasks = tasks.filter(t => t.status === 'done' || t.status === 'completed');
  const totalProgress = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const delayedProjects = projects.filter(p => {
    if (!p.end_date) return false;
    return new Date(p.end_date) < now && p.status !== 'completed';
  });
  const onTrackProjects = projects.filter(p => {
    if (!p.end_date) return true;
    return new Date(p.end_date) >= now || p.status === 'completed';
  });

  const kpis = {
    totalProgress,
    onTrack: onTrackProjects.length,
    ahead: 0, // Würde aus echten Projekt-Fortschrittsdaten berechnet
    behind: delayedProjects.length
  };

  // Projekte für die Fortschrittsanzeige aufbereiten
  const projectsWithProgress: ProjectProgress[] = projects.slice(0, 5).map(p => {
    const projectTasks = tasks.filter(t => t.project_id === p.id);
    const completedProjectTasks = projectTasks.filter(t => t.status === 'done' || t.status === 'completed');
    const actualProgress = projectTasks.length > 0 ? Math.round((completedProjectTasks.length / projectTasks.length) * 100) : 0;
    
    // Erwarteten Fortschritt basierend auf Zeitlinie berechnen
    let expectedProgress = 50; // Default
    if (p.start_date && p.end_date) {
      const start = new Date(p.start_date).getTime();
      const end = new Date(p.end_date).getTime();
      const current = now.getTime();
      expectedProgress = Math.min(100, Math.max(0, Math.round(((current - start) / (end - start)) * 100)));
    }

    const isDelayed = p.end_date && new Date(p.end_date) < now && p.status !== 'completed';
    const isAhead = actualProgress > expectedProgress + 10;

    return {
      id: p.id,
      title: p.name || 'Unbenanntes Projekt',
      team: 'Team',
      avatar: p.name?.charAt(0) || 'P',
      avatarColor: isDelayed ? 'bg-orange-500' : isAhead ? 'bg-green-500' : 'bg-violet-500',
      actualProgress,
      expectedProgress,
      startDate: p.start_date ? new Date(p.start_date).toLocaleDateString('de-DE') : 'N/A',
      endDate: p.end_date ? new Date(p.end_date).toLocaleDateString('de-DE') : 'N/A',
      status: isDelayed ? 'delayed' : isAhead ? 'ahead' : 'on-track'
    };
  });

  const getStatusButton = (status: string) => {
    switch (status) {
      case 'ahead':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 flex items-center gap-1">
            <ArrowRight className="h-3 w-3" /> Vor Plan
          </Badge>
        );
      case 'on-track':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 flex items-center gap-1">
            <Plus className="h-3 w-3" /> Im Plan
          </Badge>
        );
      case 'delayed':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 flex items-center gap-1">
            <ArrowDownRight className="h-3 w-3" /> Verzögert
          </Badge>
        );
      default:
        return null;
    }
  };

  const getDeviation = (actual: number, expected: number) => {
    const diff = actual - expected;
    if (diff > 0) {
      return <span className="text-green-600">+{diff}%</span>;
    } else if (diff < 0) {
      return <span className="text-red-600">{diff}%</span>;
    }
    return <span className="text-muted-foreground">0%</span>;
  };

  const handleRunAIAnalysis = async () => {
    if (!companyId) return;
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('roadmap-ai-analysis', {
        body: { companyId, type: 'capacity' }
      });
      if (error) throw error;
      setAiAnalysis(data?.analysis || 'Keine Analyse verfügbar.');
    } catch (error) {
      console.error('KI-Analyse Fehler:', error);
      setAiAnalysis('Fehler bei der KI-Analyse. Bitte versuchen Sie es erneut.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Karten */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamtfortschritt</p>
                <p className="text-2xl font-bold">{kpis.totalProgress}%</p>
                <Progress value={kpis.totalProgress} className="mt-2 h-2" />
              </div>
              <Settings className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Projekte im Plan</p>
                <p className={`text-2xl font-bold ${kpis.onTrack > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {kpis.onTrack}
                </p>
                <p className="text-xs text-muted-foreground">
                  {projects.length > 0 ? Math.round((kpis.onTrack / projects.length) * 100) : 0}% aller Projekte
                </p>
              </div>
              <TrendingUp className={`h-8 w-8 ${kpis.onTrack > 0 ? 'text-green-500' : 'text-muted-foreground'}`} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vor dem Plan</p>
                <p className="text-2xl font-bold text-muted-foreground">{kpis.ahead}</p>
                <p className="text-xs text-muted-foreground">Schneller als geplant</p>
              </div>
              <Sparkles className="h-8 w-8 text-violet-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hinter dem Plan</p>
                <p className={`text-2xl font-bold ${kpis.behind > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {kpis.behind}
                </p>
                <p className="text-xs text-muted-foreground">
                  {kpis.behind > 0 ? 'Benötigen Aufmerksamkeit' : 'Keine verzögerten Projekte'}
                </p>
              </div>
              <TrendingDown className={`h-8 w-8 ${kpis.behind > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projekt-Fortschritt im Detail */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Projekt-Fortschritt im Detail</CardTitle>
        </CardHeader>
        <CardContent>
          {projectsWithProgress.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Keine Projekte vorhanden.</p>
          ) : (
            <div className="space-y-4">
              {projectsWithProgress.map((project) => (
                <div key={project.id} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${project.avatarColor} rounded-full flex items-center justify-center text-white font-medium`}>
                        {project.avatar}
                      </div>
                      <div>
                        <p className="font-medium">{project.title}</p>
                        <p className="text-sm text-muted-foreground">{project.team}</p>
                      </div>
                    </div>
                    {getStatusButton(project.status)}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tatsächlicher Fortschritt</p>
                      <p className="font-medium">{project.actualProgress}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Erwarteter Fortschritt</p>
                      <p className="font-medium">{project.expectedProgress}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Abweichung</p>
                      <p className="font-medium">{getDeviation(project.actualProgress, project.expectedProgress)}</p>
                    </div>
                  </div>

                  {/* Timeline Bar */}
                  <div className="relative">
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${project.status === 'delayed' ? 'bg-orange-500' : 'bg-green-500'}`}
                        style={{ width: `${project.actualProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{project.startDate}</span>
                      <span>{project.endDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Aufgaben-Übersicht */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aufgaben-Kapazität</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Keine Aufgaben vorhanden.</p>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-xs text-blue-600">In Bearbeitung</p>
                <p className="text-2xl font-bold text-blue-700">
                  {tasks.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
              <div className="p-4 bg-gray-100 rounded-lg text-center">
                <p className="text-xs text-gray-600">Offen</p>
                <p className="text-2xl font-bold text-gray-700">
                  {tasks.filter(t => t.status === 'open' || t.status === 'todo' || t.status === 'planned').length}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <p className="text-xs text-red-600">Blockiert</p>
                <p className="text-2xl font-bold text-red-700">
                  {tasks.filter(t => t.status === 'blocked').length}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-xs text-green-600">Erledigt</p>
                <p className="text-2xl font-bold text-green-700">
                  {completedTasks.length}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* KI-Optimierungsvorschläge */}
      <Card className="bg-violet-50 border-violet-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-600" />
              <CardTitle className="text-base text-violet-700">KI-Optimierungsvorschläge</CardTitle>
            </div>
            <Button
              onClick={handleRunAIAnalysis}
              disabled={isAnalyzing || !companyId || (tasks.length === 0 && projects.length === 0)}
              size="sm"
              variant="outline"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analysiere...
                </>
              ) : (
                'KI-Analyse starten'
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {aiAnalysis ? (
            <p className="text-sm text-violet-700 whitespace-pre-wrap">{aiAnalysis}</p>
          ) : tasks.length === 0 && projects.length === 0 ? (
            <p className="text-sm text-violet-600 italic">
              Keine Daten vorhanden. Erstellen Sie Projekte oder Aufgaben, um Optimierungsvorschläge zu erhalten.
            </p>
          ) : (
            <p className="text-sm text-violet-600 italic">
              Klicken Sie auf "KI-Analyse starten" für intelligente Optimierungsvorschläge zur Kapazität und Ressourcenverteilung.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CapacityProgressTab;
