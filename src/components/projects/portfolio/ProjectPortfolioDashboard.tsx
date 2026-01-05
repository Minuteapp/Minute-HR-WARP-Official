
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PortfolioMetrics } from './components/PortfolioMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProjectPortfolioDashboard = () => {
  const navigate = useNavigate();
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['portfolio-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Portfolio-Daten werden geladen...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600">
            Fehler beim Laden der Portfolio-Daten: {error instanceof Error ? error.message : 'Unbekannter Fehler'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Portfolio-Metriken berechnen
  const metrics = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    delayedProjects: projects.filter(p => p.status === 'active' && p.progress < 50).length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    budgetSpent: projects.reduce((sum, p) => sum + (p.budget_spent || 0), 0),
    averageProgress: projects.length > 0 
      ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length 
      : 0,
    teamMembers: new Set(projects.flatMap(p => p.team_members || [])).size
  };

  return (
    <div className="space-y-6">
      {/* Header mit Zurück-Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio-Dashboard</h1>
          <p className="text-muted-foreground">Übersicht über alle Projekte und deren Status</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zu Projekten
        </Button>
      </div>

      {/* Portfolio-Metriken */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Portfolio-Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PortfolioMetrics metrics={metrics} />
        </CardContent>
      </Card>

      {/* Vereinfachte Projekt-Übersicht */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Projekt-Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <h3 className="text-lg font-semibold text-green-600">{metrics.activeProjects}</h3>
              <p className="text-sm text-muted-foreground">Aktive Projekte</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="text-lg font-semibold text-blue-600">{metrics.completedProjects}</h3>
              <p className="text-sm text-muted-foreground">Abgeschlossene Projekte</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="text-lg font-semibold text-orange-600">{metrics.delayedProjects}</h3>
              <p className="text-sm text-muted-foreground">Verzögerte Projekte</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schnellaktionen */}
      <Card>
        <CardHeader>
          <CardTitle>Schnellaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/projects')}
            >
              <BarChart3 className="h-6 w-6" />
              <span>Alle Projekte</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/projects/new')}
            >
              <TrendingUp className="h-6 w-6" />
              <span>Neues Projekt</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/projects/gantt')}
            >
              <BarChart3 className="h-6 w-6" />
              <span>Gantt-Ansicht</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/projects/reports')}
            >
              <TrendingUp className="h-6 w-6" />
              <span>Berichte</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectPortfolioDashboard;
