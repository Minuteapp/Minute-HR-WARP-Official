import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Folder, 
  Calendar, 
  CheckSquare, 
  Target,
  TrendingUp,
  AlertTriangle,
  Plus,
  Filter,
  BarChart3,
  Grid,
  List,
  Clock,
  Map
} from 'lucide-react';
import { useProjects } from '@/hooks/projects/useProjects';
import { useTasksByAssignee } from '@/hooks/projects/useTasks';
import { ProjectView } from '@/types/projects';

interface ProjectDashboardProps {
  userId?: string;
  role?: string;
}

export const ProjectDashboard = ({ userId, role }: ProjectDashboardProps) => {
  const [activeView, setActiveView] = useState<ProjectView>('spreadsheet');
  const { projects, isLoading: projectsLoading } = useProjects();
  const { tasks: myTasks, isLoading: tasksLoading } = useTasksByAssignee(userId || '');

  const views = [
    { id: 'spreadsheet' as ProjectView, label: 'Spreadsheet', icon: Grid },
    { id: 'timeline' as ProjectView, label: 'Timeline', icon: Clock },
    { id: 'calendar' as ProjectView, label: 'Kalender', icon: Calendar },
    { id: 'board' as ProjectView, label: 'Board', icon: List },
    { id: 'roadmap' as ProjectView, label: 'Roadmap', icon: Map },
    { id: 'reports' as ProjectView, label: 'Berichte', icon: BarChart3 },
  ];

  // Calculate stats
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    myTasks: myTasks.length,
    overdueTasks: myTasks.filter(t => 
      t.due_date && new Date(t.due_date) < new Date()
    ).length,
  };

  if (projectsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Folder className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Projekte</h1>
              <p className="text-sm text-muted-foreground">Verwalten Sie Ihre Projekte und Aufgaben</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Neues Projekt
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projekte gesamt</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktive Projekte</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProjects}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abgeschlossen</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedProjects}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meine Aufgaben</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.myTasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Überfällig</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdueTasks}</div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-muted rounded-lg overflow-x-auto">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <Button
                key={view.id}
                variant={activeView === view.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView(view.id)}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Icon className="h-4 w-4" />
                {view.label}
              </Button>
            );
          })}
        </div>

        {/* Content */}
        <div className="min-h-[600px]">
          {activeView === 'spreadsheet' && (
            <ProjectSpreadsheetView projects={projects} />
          )}
          {activeView === 'timeline' && (
            <ProjectTimelineView projects={projects} />
          )}
          {activeView === 'calendar' && (
            <ProjectCalendarView projects={projects} />
          )}
          {activeView === 'board' && (
            <ProjectBoardView projects={projects} />
          )}
          {activeView === 'roadmap' && (
            <ProjectRoadmapView projects={projects} />
          )}
          {activeView === 'reports' && (
            <ProjectReportsView projects={projects} />
          )}
        </div>
      </div>
    </div>
  );
};

// Placeholder components for different views
const ProjectSpreadsheetView = ({ projects }: { projects: any[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Projekt-Spreadsheet</CardTitle>
      <CardDescription>Tabellarische Übersicht aller Projekte</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="font-semibold">{project.name}</h3>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                {project.status}
              </Badge>
              <div className="w-24">
                <Progress value={project.progress || 0} />
              </div>
              <div className="flex gap-1">
                {project.health && Object.entries(project.health).map(([key, value]) => (
                  <div
                    key={key}
                    className={`w-3 h-3 rounded-full ${
                      value === 'green' ? 'bg-green-500' :
                      value === 'amber' ? 'bg-yellow-500' :
                      value === 'red' ? 'bg-red-500' : 'bg-gray-400'
                    }`}
                    title={key}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const ProjectTimelineView = ({ projects }: { projects: any[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Timeline / Gantt</CardTitle>
      <CardDescription>Zeitliche Übersicht der Projekte</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-20 text-muted-foreground">
        <Clock className="h-16 w-16 mx-auto mb-4" />
        <p>Timeline-Ansicht wird geladen...</p>
      </div>
    </CardContent>
  </Card>
);

const ProjectCalendarView = ({ projects }: { projects: any[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Kalender</CardTitle>
      <CardDescription>Projekt-Meilensteine im Kalender</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-20 text-muted-foreground">
        <Calendar className="h-16 w-16 mx-auto mb-4" />
        <p>Kalender-Ansicht wird geladen...</p>
      </div>
    </CardContent>
  </Card>
);

const ProjectBoardView = ({ projects }: { projects: any[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Kanban Board</CardTitle>
      <CardDescription>Projekte als Kanban-Board</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-20 text-muted-foreground">
        <List className="h-16 w-16 mx-auto mb-4" />
        <p>Board-Ansicht wird geladen...</p>
      </div>
    </CardContent>
  </Card>
);

const ProjectRoadmapView = ({ projects }: { projects: any[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Roadmap Canvas</CardTitle>
      <CardDescription>Strategische Projekt-Roadmap</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-20 text-muted-foreground">
        <Map className="h-16 w-16 mx-auto mb-4" />
        <p>Roadmap-Ansicht wird geladen...</p>
      </div>
    </CardContent>
  </Card>
);

const ProjectReportsView = ({ projects }: { projects: any[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Berichte & KPIs</CardTitle>
      <CardDescription>Portfolio-Übersicht und Berichte</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-20 text-muted-foreground">
        <BarChart3 className="h-16 w-16 mx-auto mb-4" />
        <p>Berichte werden geladen...</p>
      </div>
    </CardContent>
  </Card>
);