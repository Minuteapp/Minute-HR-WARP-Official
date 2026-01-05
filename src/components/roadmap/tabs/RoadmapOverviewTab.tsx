import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Users,
  Loader2
} from 'lucide-react';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { useAuth } from '@/hooks/useAuth';
import { useCompanyId } from '@/hooks/useCompanyId';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const RoadmapOverviewTab = () => {
  const { user } = useAuth();
  const companyId = useCompanyId();
  const { roadmaps = [] } = useRoadmaps();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  // Projekte laden
  const { data: projects = [] } = useQuery({
    queryKey: ['projects', companyId],
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
    queryKey: ['tasks-overview', companyId],
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
  const activeRoadmaps = roadmaps.filter(r => r.status === 'active');
  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'in_progress');
  const openTasks = tasks.filter(t => t.status !== 'done' && t.status !== 'completed');
  const criticalTasks = tasks.filter(t => t.priority === 'critical' || t.priority === 'high');
  const overdueTasks = tasks.filter(t => {
    if (!t.due_date) return false;
    return new Date(t.due_date) < now && t.status !== 'done' && t.status !== 'completed';
  });
  const delayedProjects = projects.filter(p => {
    if (!p.end_date) return false;
    return new Date(p.end_date) < now && p.status !== 'completed';
  });

  const delayedPercentage = projects.length > 0 ? Math.round((delayedProjects.length / projects.length) * 100) : 0;

  const kpiData = [
    { label: 'Aktive Roadmaps', value: activeRoadmaps.length.toString(), subtext: `${roadmaps.length} gesamt`, icon: TrendingUp, iconColor: 'text-primary' },
    { label: 'Aktive Projekte', value: activeProjects.length.toString(), subtext: `${projects.length} gesamt`, icon: TrendingUp, iconColor: 'text-primary' },
    { label: 'Offene Aufgaben', value: openTasks.length.toString(), subtext: `${criticalTasks.length} kritisch`, icon: TrendingUp, iconColor: criticalTasks.length > 0 ? 'text-orange-500' : 'text-primary' },
    { label: 'Überfällig', value: overdueTasks.length.toString(), subtext: `${overdueTasks.length} Aufgaben`, icon: Clock, iconColor: overdueTasks.length > 0 ? 'text-red-500' : 'text-muted-foreground' },
  ];

  const handleRunAIAnalysis = async () => {
    if (!companyId) return;
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('roadmap-ai-analysis', {
        body: { companyId, type: 'overview' }
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
      {/* Admin Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Angemeldet als: {user?.email || 'Benutzer'}</span>
          <span className="ml-2">– Roadmap-Übersicht für Ihr Unternehmen.</span>
        </p>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.subtext}</p>
                </div>
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 2 Status Cards - Dynamisch berechnet */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verzögerte Projekte</p>
                <p className={`text-3xl font-bold mt-1 ${delayedProjects.length > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                  {delayedPercentage}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {delayedProjects.length} von {projects.length} Projekten
                </p>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-5 w-5 ${delayedProjects.length > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Überfällige Aufgaben</p>
                <p className={`text-3xl font-bold mt-1 ${overdueTasks.length > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {overdueTasks.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {overdueTasks.length > 0 ? 'Benötigen sofortige Aufmerksamkeit' : 'Keine überfälligen Aufgaben'}
                </p>
              </div>
              <TrendingDown className={`h-5 w-5 ${overdueTasks.length > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - KI Insights */}
        <div className="col-span-2 space-y-6">
          {/* KI-Insights Box */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  KI-Insights
                </CardTitle>
                <Button
                  onClick={handleRunAIAnalysis}
                  disabled={isAnalyzing || !companyId}
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
            <CardContent className="space-y-3">
              {aiAnalysis ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 whitespace-pre-wrap">{aiAnalysis}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Klicken Sie auf "KI-Analyse starten" für eine intelligente Auswertung Ihrer Roadmap-Daten.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Aufgaben-Stau nach Teams */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5" />
                Aufgaben-Übersicht
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Keine Aufgaben vorhanden.</p>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <Card className="border">
                    <CardContent className="p-4">
                      <p className="font-medium text-sm">Offen</p>
                      <p className="text-2xl font-bold text-orange-600">{openTasks.length}</p>
                    </CardContent>
                  </Card>
                  <Card className="border">
                    <CardContent className="p-4">
                      <p className="font-medium text-sm">Kritisch</p>
                      <p className="text-2xl font-bold text-red-600">{criticalTasks.length}</p>
                    </CardContent>
                  </Card>
                  <Card className="border">
                    <CardContent className="p-4">
                      <p className="font-medium text-sm">Abgeschlossen</p>
                      <p className="text-2xl font-bold text-green-600">
                        {tasks.filter(t => t.status === 'done' || t.status === 'completed').length}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nächste 90 Tage */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-5 w-5" />
                Aktive Roadmaps
              </CardTitle>
            </CardHeader>
            <CardContent>
              {roadmaps.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Keine Roadmaps vorhanden.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {roadmaps.slice(0, 5).map((roadmap) => (
                    <div key={roadmap.id} className="flex flex-col items-center">
                      <Badge className={`${roadmap.status === 'active' ? 'bg-primary' : 'bg-muted'} text-white px-3 py-1`}>
                        {roadmap.title}
                      </Badge>
                      <span className="text-xs text-muted-foreground mt-1">{roadmap.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Kritische Projekte */}
        <div>
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Kritische Projekte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {delayedProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Keine kritischen Projekte.</p>
              ) : (
                delayedProjects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {project.name?.charAt(0) || 'P'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{project.name}</span>
                        <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                          verzögert
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {project.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
