
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  DollarSign,
  FileText,
  Plus
} from 'lucide-react';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/projects/useProjects';

const ProjectPortfolioPage = () => {
  const navigate = useNavigate();
  const { projects, isLoading } = useProjects();

  // Berechne echte Portfolio-Statistiken aus den Projekten
  const portfolioStats = React.useMemo(() => {
    const totalBudget = projects.reduce((sum, project) => sum + (project.budget || 0), 0);
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const riskProjects = projects.filter(p => p.priority === 'high' && p.status !== 'completed').length;
    
    return [
      {
        title: 'Gesamtbudget',
        value: `€${totalBudget.toLocaleString()}`,
        change: `${projects.length} Projekte`,
        icon: DollarSign,
        color: 'text-green-600'
      },
      {
        title: 'Aktive Projekte',
        value: activeProjects.toString(),
        change: `von ${projects.length} gesamt`,
        icon: TrendingUp,
        color: 'text-blue-600'
      },
      {
        title: 'Risiko-Projekte',
        value: riskProjects.toString(),
        change: 'Hohe Priorität',
        icon: AlertCircle,
        color: 'text-red-600'
      },
      {
        title: 'Abgeschlossen',
        value: completedProjects.toString(),
        change: 'Erfolgreich',
        icon: CheckCircle,
        color: 'text-green-600'
      }
    ];
  }, [projects]);

  const actions = (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        onClick={() => navigate('/projects')}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu Projekten
      </Button>
      <Button 
        onClick={() => navigate('/projects/new')}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Neues Projekt
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <StandardPageLayout
        title="Portfolio-Dashboard"
        subtitle="Strategische Übersicht und Analysen"
        actions={actions}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </StandardPageLayout>
    );
  }

  if (projects.length === 0) {
    return (
      <StandardPageLayout
        title="Portfolio-Dashboard"
        subtitle="Strategische Übersicht und Analysen"
        actions={actions}
      >
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Projekte vorhanden</h3>
            <p className="text-muted-foreground mb-4">Erstellen Sie Ihr erstes Projekt, um das Portfolio-Dashboard zu nutzen.</p>
            <Button onClick={() => navigate('/projects/new')} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Neues Projekt erstellen
            </Button>
          </CardContent>
        </Card>
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout
      title="Portfolio-Dashboard"
      subtitle="Strategische Übersicht und Analysen"
      actions={actions}
    >
      <div className="space-y-8">
        {/* Portfolio-Statistiken */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portfolioStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.change}
                      </p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Aktuelle Projekte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Aktuelle Projekte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.slice(0, 5).map((project) => (
                <div key={project.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      <p className="text-gray-600 text-sm">{project.description || 'Keine Beschreibung'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        project.priority === 'high' ? 'destructive' : 
                        project.priority === 'medium' ? 'secondary' : 'outline'
                      }>
                        {project.priority === 'high' ? 'Hoch' : 
                         project.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Fortschritt</p>
                      <p className="font-semibold">{project.progress || 0}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Budget</p>
                      <p className="font-semibold">€{(project.budget || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Team</p>
                      <p className="font-semibold">{project.team_members?.length || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Status</p>
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm capitalize">{project.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/projects/${project.id}`)}>
                      Details anzeigen
                    </Button>
                    <Button size="sm" variant="outline">
                      Bearbeiten
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {projects.length > 5 && (
              <div className="mt-4 text-center">
                <Button variant="outline" onClick={() => navigate('/projects')}>
                  Alle {projects.length} Projekte anzeigen
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schnellaktionen */}
        <Card>
          <CardHeader>
            <CardTitle>Schnellaktionen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="p-6 h-auto flex flex-col items-center gap-2"
                onClick={() => navigate('/projects/reports')}
              >
                <BarChart3 className="h-6 w-6" />
                <span>Portfolio-Analyse</span>
              </Button>
              <Button 
                variant="outline" 
                className="p-6 h-auto flex flex-col items-center gap-2"
                onClick={() => navigate('/projects/reports')}
              >
                <TrendingUp className="h-6 w-6" />
                <span>Risikoanalyse</span>
              </Button>
              <Button 
                variant="outline" 
                className="p-6 h-auto flex flex-col items-center gap-2"
                onClick={() => navigate('/projects/reports')}
              >
                <CheckCircle className="h-6 w-6" />
                <span>Berichte erstellen</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
};

export default ProjectPortfolioPage;
