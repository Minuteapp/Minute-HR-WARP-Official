import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Filter, 
  Search, 
  Calendar, 
  Clock, 
  AlertTriangle,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useCompanyId } from '@/hooks/useCompanyId';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const TaskRoadmapsTab: React.FC = () => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const companyId = useCompanyId();

  // Aufgaben aus der Datenbank laden
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks-roadmaps', companyId],
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
  const totalTasks = tasks.length;
  const openTasks = tasks.filter(t => t.status === 'open' || t.status === 'todo' || t.status === 'planned').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
  const completedTasks = tasks.filter(t => t.status === 'done' || t.status === 'completed').length;
  const overdueTasks = tasks.filter(t => {
    if (!t.due_date) return false;
    return new Date(t.due_date) < now && t.status !== 'done' && t.status !== 'completed';
  }).length;

  const statusDistribution = [
    { label: 'Offen', count: openTasks, percentage: totalTasks > 0 ? Math.round((openTasks / totalTasks) * 100) : 0, color: 'bg-green-500' },
    { label: 'In-Bearbeitung', count: inProgressTasks, percentage: totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0, color: 'bg-blue-500' },
    { label: 'Blockiert', count: blockedTasks, percentage: totalTasks > 0 ? Math.round((blockedTasks / totalTasks) * 100) : 0, color: 'bg-red-500' },
    { label: 'Erledigt', count: completedTasks, percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0, color: 'bg-green-600' },
  ];

  // Filter anwenden
  const filteredTasks = tasks.filter(t => 
    t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.assignee?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRunAIAnalysis = async () => {
    if (!companyId) return;
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('roadmap-ai-analysis', {
        body: { companyId, type: 'tasks' }
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
      {/* Filter Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filter & Suche</span>
            </div>
            <button 
              className="text-primary text-sm hover:underline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? 'Weniger Filter' : 'Mehr Filter'}
            </button>
          </div>

          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Aufgabe suchen (Titel oder Person)..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Alle Aufgaben" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Aufgaben</SelectItem>
                <SelectItem value="open">Offene Aufgaben</SelectItem>
                <SelectItem value="in-progress">In Bearbeitung</SelectItem>
                <SelectItem value="blocked">Blockiert</SelectItem>
                <SelectItem value="completed">Erledigt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-muted-foreground">{filteredTasks.length} von {totalTasks} Aufgaben</p>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTasks}</p>
                <p className="text-sm text-muted-foreground">Gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${openTasks > 0 ? 'text-orange-600' : ''}`}>{openTasks}</p>
                <p className="text-sm text-muted-foreground">Offen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${overdueTasks > 0 ? 'bg-orange-100' : 'bg-gray-100'} flex items-center justify-center`}>
                <AlertTriangle className={`h-5 w-5 ${overdueTasks > 0 ? 'text-orange-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${overdueTasks > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}>{overdueTasks}</p>
                <p className="text-sm text-muted-foreground">Überfällig</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${blockedTasks > 0 ? 'bg-red-100' : 'bg-gray-100'} flex items-center justify-center`}>
                <AlertTriangle className={`h-5 w-5 ${blockedTasks > 0 ? 'text-red-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${blockedTasks > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>{blockedTasks}</p>
                <p className="text-sm text-muted-foreground">Blockiert</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aufgabenverteilung nach Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {statusDistribution.map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <span className="w-32 text-sm">{item.label}</span>
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color} rounded-full`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="text-sm font-medium w-20 text-right">{item.count} ({item.percentage}%)</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Task Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aufgaben-Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Keine Aufgaben vorhanden.</p>
          ) : (
            <div className="space-y-2">
              {filteredTasks.slice(0, 10).map((task) => (
                <div key={task.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                  <div className={`h-3 w-3 rounded-full ${
                    task.status === 'done' || task.status === 'completed' ? 'bg-green-500' :
                    task.status === 'in_progress' ? 'bg-blue-500' :
                    task.status === 'blocked' ? 'bg-red-500' : 'bg-gray-400'
                  }`} />
                  <span className="flex-1 text-sm truncate">{task.title}</span>
                  <span className="text-xs text-muted-foreground">{task.assignee || 'Nicht zugewiesen'}</span>
                  <span className="text-xs text-muted-foreground">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString('de-DE') : 'Kein Datum'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* KI-Analyse Box */}
      <Card className="bg-violet-50 border-violet-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-600" />
              <CardTitle className="text-base text-violet-700">KI-Aufgabenanalyse</CardTitle>
            </div>
            <Button
              onClick={handleRunAIAnalysis}
              disabled={isAnalyzing || !companyId || tasks.length === 0}
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
          ) : tasks.length === 0 ? (
            <p className="text-sm text-violet-600 italic">
              Keine Aufgaben vorhanden. Erstellen Sie Aufgaben, um eine KI-Analyse zu ermöglichen.
            </p>
          ) : (
            <p className="text-sm text-violet-600 italic">
              Klicken Sie auf "KI-Analyse starten" für eine intelligente Auswertung Ihrer Aufgaben.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskRoadmapsTab;
