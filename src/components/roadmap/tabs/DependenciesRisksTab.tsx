import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  GitBranch, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Filter,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useCompanyId } from '@/hooks/useCompanyId';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface Dependency {
  id: string;
  sourceTitle: string;
  sourceType: 'task' | 'project';
  sourceAvatar: string;
  sourceColor: string;
  targetTitle: string;
  targetType: 'task' | 'project';
  targetAvatar: string;
  targetColor: string;
  connectionType: string;
  status: 'ok' | 'risk' | 'blocked';
}

const DependenciesRisksTab: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const companyId = useCompanyId();

  // Aufgaben laden für Abhängigkeitsanalyse
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks-dependencies', companyId],
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

  // Projekte laden
  const { data: projects = [] } = useQuery({
    queryKey: ['projects-dependencies', companyId],
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

  // Dynamische Statistiken berechnen
  const blockedTasks = tasks.filter(t => t.status === 'blocked');
  const now = new Date();
  const overdueTasks = tasks.filter(t => {
    if (!t.due_date) return false;
    return new Date(t.due_date) < now && t.status !== 'done' && t.status !== 'completed';
  });

  // KPIs berechnen (echte Abhängigkeiten würden aus einer dependencies-Tabelle kommen)
  const kpis = {
    total: tasks.length + projects.length,
    ok: tasks.filter(t => t.status === 'done' || t.status === 'completed' || t.status === 'in_progress').length,
    risk: overdueTasks.length,
    blocked: blockedTasks.length
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">ok</Badge>;
      case 'risk':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">risiko</Badge>;
      case 'blocked':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">blockiert</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'risk':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'blocked':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const handleRunAIAnalysis = async () => {
    if (!companyId) return;
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('roadmap-ai-analysis', {
        body: { companyId, type: 'dependencies' }
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
      {/* Filter Sektion */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtern:</span>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Alle Typen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Typen</SelectItem>
                <SelectItem value="project-project">Projekt ↔ Projekt</SelectItem>
                <SelectItem value="project-task">Projekt ↔ Aufgabe</SelectItem>
                <SelectItem value="task-task">Aufgabe ↔ Aufgabe</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Alle Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="ok">OK</SelectItem>
                <SelectItem value="risk">Risiko</SelectItem>
                <SelectItem value="blocked">Blockiert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KPI Karten */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt</p>
                <p className="text-2xl font-bold">{kpis.total} Elemente</p>
              </div>
              <GitBranch className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">OK</p>
                <p className="text-2xl font-bold text-green-600">
                  {kpis.ok} ({kpis.total > 0 ? Math.round(kpis.ok / kpis.total * 100) : 0}%)
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Risiko</p>
                <p className={`text-2xl font-bold ${kpis.risk > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                  {kpis.risk} ({kpis.total > 0 ? Math.round(kpis.risk / kpis.total * 100) : 0}%)
                </p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${kpis.risk > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Blockiert</p>
                <p className={`text-2xl font-bold ${kpis.blocked > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {kpis.blocked} ({kpis.total > 0 ? Math.round(kpis.blocked / kpis.total * 100) : 0}%)
                </p>
              </div>
              <XCircle className={`h-8 w-8 ${kpis.blocked > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Elemente mit Problemen */}
      {(blockedTasks.length > 0 || overdueTasks.length > 0) && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-base text-red-700">Kritische Elemente</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-700 mb-4">
              {kpis.risk + kpis.blocked} Elemente benötigen Aufmerksamkeit.
            </p>
            <div className="space-y-3">
              {blockedTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {task.title?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground">Aufgabe</p>
                    </div>
                  </div>
                  {getStatusBadge('blocked')}
                </div>
              ))}
              {overdueTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {task.title?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground">Überfällig</p>
                    </div>
                  </div>
                  {getStatusBadge('risk')}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alle Projekte */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Projekte & Aufgaben</CardTitle>
              <Badge variant="secondary">{projects.length + tasks.length}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {projects.length === 0 && tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Keine Projekte oder Aufgaben vorhanden.</p>
          ) : (
            <div className="space-y-2">
              {projects.slice(0, 5).map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {project.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{project.name}</p>
                      <p className="text-xs text-muted-foreground">Projekt</p>
                    </div>
                  </div>
                  {getStatusIcon(project.status === 'completed' ? 'ok' : project.status === 'blocked' ? 'blocked' : 'ok')}
                </div>
              ))}
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {task.title?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground">Aufgabe</p>
                    </div>
                  </div>
                  {getStatusIcon(
                    task.status === 'done' || task.status === 'completed' ? 'ok' : 
                    task.status === 'blocked' ? 'blocked' : 
                    overdueTasks.some(t => t.id === task.id) ? 'risk' : 'ok'
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* KI-Risikoanalyse */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base text-blue-700">KI-Risikoanalyse</CardTitle>
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
                'KI-Risikoanalyse starten'
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {aiAnalysis ? (
            <p className="text-sm text-blue-700 whitespace-pre-wrap">{aiAnalysis}</p>
          ) : tasks.length === 0 && projects.length === 0 ? (
            <p className="text-sm text-blue-600 italic">
              Keine Daten vorhanden. Erstellen Sie Projekte oder Aufgaben, um eine Risikoanalyse zu ermöglichen.
            </p>
          ) : (
            <p className="text-sm text-blue-600 italic">
              Klicken Sie auf "KI-Risikoanalyse starten" für eine intelligente Auswertung von Abhängigkeiten und Risiken.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DependenciesRisksTab;
