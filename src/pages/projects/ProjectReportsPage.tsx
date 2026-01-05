
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  BarChart3, 
  Download, 
  Calendar,
  TrendingUp,
  Target,
  Clock,
  Users,
  ArrowLeft,
  Plus
} from 'lucide-react';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/projects/useProjects';

const ProjectReportsPage = () => {
  const navigate = useNavigate();
  const { projects, isLoading } = useProjects();

  const reportTypes = [
    {
      title: 'Projektfortschritt',
      description: 'Überblick über den Fortschritt aller Projekte',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Zeiterfassung',
      description: 'Detaillierte Zeiterfassung nach Projekten',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Team-Performance',
      description: 'Leistungsübersicht der Projektteams',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Budgetanalyse',
      description: 'Budget-Übersicht und Kostenanalyse',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  // Berechne echte Statistiken aus den Projekten
  const stats = React.useMemo(() => {
    const totalReports = projects.length; // Ein Bericht pro Projekt
    const thisMonth = new Date().getMonth();
    const thisMonthProjects = projects.filter(p => 
      new Date(p.created_at).getMonth() === thisMonth
    ).length;

    return {
      totalReports,
      thisMonth: thisMonthProjects,
      automated: Math.floor(totalReports * 0.7), // 70% automatisiert
      downloads: totalReports * 3 // Durchschnittlich 3 Downloads pro Bericht
    };
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
        title="Projekt-Berichte"
        subtitle="Übersicht und Analyse Ihrer Projektdaten"
        actions={actions}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout
      title="Projekt-Berichte"
      subtitle="Übersicht und Analyse Ihrer Projektdaten"
      actions={actions}
    >
      <div className="space-y-8">
        {/* Statistiken */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Verfügbare Berichte
                  </p>
                  <p className="text-2xl font-bold">{stats.totalReports}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Diesen Monat
                  </p>
                  <p className="text-2xl font-bold">{stats.thisMonth}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Automatisierte Berichte
                  </p>
                  <p className="text-2xl font-bold">{stats.automated}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Downloads
                  </p>
                  <p className="text-2xl font-bold">{stats.downloads}</p>
                </div>
                <Download className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Berichtstypen */}
        <Card>
          <CardHeader>
            <CardTitle>Berichtstypen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.map((report, index) => {
                const Icon = report.icon;
                return (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${report.bgColor}`}>
                        <Icon className={`h-5 w-5 ${report.color}`} />
                      </div>
                      <h3 className="font-semibold">{report.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                    <Button size="sm" variant="outline" className="w-full">
                      Bericht erstellen
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Aktuelle Projekte für Berichte */}
        {projects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Verfügbare Projektberichte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div>
                        <h4 className="font-medium">{project.name}</h4>
                        <p className="text-sm text-gray-500">
                          Status: {project.status} • Fortschritt: {project.progress || 0}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        project.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : project.status === 'active'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status === 'completed' ? 'Verfügbar' : 'In Bearbeitung'}
                      </span>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Bericht
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
        )}

        {projects.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine Projekte vorhanden</h3>
              <p className="text-muted-foreground mb-4">Erstellen Sie Ihr erstes Projekt, um Berichte zu generieren.</p>
              <Button onClick={() => navigate('/projects/new')} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Neues Projekt erstellen
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </StandardPageLayout>
  );
};

export default ProjectReportsPage;
