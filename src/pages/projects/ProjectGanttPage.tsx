
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Filter, 
  Download, 
  MoreHorizontal,
  Users,
  Clock,
  ArrowLeft,
  FileText,
  Plus
} from 'lucide-react';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/projects/useProjects';

const ProjectGanttPage = () => {
  const navigate = useNavigate();
  const { projects, isLoading } = useProjects();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'pending': return 'Geplant';
      case 'completed': return 'Abgeschlossen';
      default: return status;
    }
  };

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
        title="Gantt-Ansicht"
        subtitle="Timeline und Projektplanung"
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
        title="Gantt-Ansicht"
        subtitle="Timeline und Projektplanung"
        actions={actions}
      >
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Projekte vorhanden</h3>
            <p className="text-muted-foreground mb-4">Erstellen Sie Ihr erstes Projekt, um die Gantt-Ansicht zu nutzen.</p>
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
      title="Gantt-Ansicht"
      subtitle="Timeline und Projektplanung"
      actions={actions}
    >
      <div className="space-y-6">
        {/* Toolbar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">Projekt-Timeline</h2>
                <Badge variant="outline">
                  {projects.length} Projekte
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Heute
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gantt-Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Projekt-Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {projects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      <Badge className={getStatusColor(project.status)}>
                        {getStatusLabel(project.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        {project.team_members?.length || 0}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="w-48 text-sm">
                        <p className="font-medium">Projekt: {project.name}</p>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>
                            {project.start_date && project.end_date 
                              ? `${new Date(project.start_date).toLocaleDateString('de-DE')} - ${new Date(project.end_date).toLocaleDateString('de-DE')}`
                              : 'Keine Daten'
                            }
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                        <div 
                          className="bg-blue-600 h-4 rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${project.progress || 0}%` }}
                        >
                          <span className="text-xs text-white font-medium">
                            {project.progress || 0}%
                          </span>
                        </div>
                      </div>
                      <div className="w-24 text-xs text-gray-600">
                        Budget: €{(project.budget || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {project.description && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600">{project.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hinweis für erweiterte Gantt-Funktionalität */}
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Erweiterte Gantt-Ansicht</h3>
            <p className="text-gray-600 mb-4">
              Die vollständige interaktive Gantt-Chart mit Drag & Drop wird in Kürze verfügbar sein.
            </p>
            <Button onClick={() => navigate('/projects/reports')}>
              Mehr erfahren
            </Button>
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
};

export default ProjectGanttPage;
