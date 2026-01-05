import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sparkles, Calendar, Users, Target, MoreVertical, Plus, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NewTaskDialog } from './NewTaskDialog';
import { TimelineView } from './TimelineView';
import { HierarchyView } from './HierarchyView';
import { useProjects } from '@/hooks/projects/useProjects';

export const ProjectRoadmapView = () => {
  const navigate = useNavigate();
  const [viewType, setViewType] = useState('list');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const { projects: dbProjects, loading } = useProjects();

  // Map database projects to view format
  const mappedProjects = dbProjects.map(p => ({
    id: p.id,
    title: p.name,
    status: p.status === 'active' ? 'In Arbeit' : p.status === 'completed' ? 'Abgeschlossen' : 'Geplant',
    startDate: p.start_date || 'N/A',
    endDate: p.end_date || 'N/A',
    teamMembers: p.team_members?.length || 0,
    milestones: p.milestone_data?.length || 0,
    progress: p.progress || 0,
    tasks: (p.milestone_data || []).map((m: any, idx: number) => ({
      id: `milestone-${idx}`,
      title: m.title || m.name || `Meilenstein ${idx + 1}`,
      dueDate: m.date || m.due_date || 'N/A',
      taskCount: m.taskCount || 0,
      status: m.status || 'Geplant'
    })),
    assignedTasks: []
  }));

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      'Abgeschlossen': { variant: 'default', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
      'In Arbeit': { variant: 'default', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
      'Geplant': { variant: 'default', className: 'bg-gray-100 text-gray-700 hover:bg-gray-100' },
      'Planung': { variant: 'default', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' }
    };
    const config = variants[status] || variants['Geplant'];
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const handleProjectClick = (project: any) => {
    navigate(`/tasks/projects/${project.id}`);
  };

  return (
    <div className="space-y-6">
      {/* KI Recommendation Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-500 text-white p-2 rounded-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">KI-Projektempfehlung</h3>
            <p className="text-sm text-gray-700 mb-3">
              Das Projekt "Performance Management 2025" ist zu 40% fertig, aber 60% der Zeit ist bereits verstrichen. Empfehlung: 3 zusätzliche Ressourcen zuweisen und nicht-kritische Aufgaben verschieben.
            </p>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Ressourcen anpassen
            </Button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && mappedProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center h-32 text-center border rounded-lg bg-muted/20">
          <p className="text-muted-foreground mb-2">Keine Projekte vorhanden</p>
          <p className="text-sm text-muted-foreground">Erstellen Sie ein neues Projekt, um die Roadmap zu sehen.</p>
        </div>
      )}

      {/* View Type Tabs */}
      {!loading && mappedProjects.length > 0 && (
      <Tabs value={viewType} onValueChange={setViewType}>
        <TabsList className="bg-white">
          <TabsTrigger value="list">Listen-Ansicht</TabsTrigger>
          <TabsTrigger value="timeline">Timeline-Ansicht</TabsTrigger>
          <TabsTrigger value="hierarchy">Hierarchie-Ansicht</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6 mt-6">
          {mappedProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg border p-6 space-y-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleProjectClick(project)}>
              {/* Project Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      {getStatusBadge(project.status)}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {project.startDate} - {project.endDate}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {project.teamMembers} Mitarbeiter
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {project.milestones} Meilensteine
                      </div>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleProjectClick(project)}>
                      Projekt anzeigen
                    </DropdownMenuItem>
                    <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Löschen</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Gesamtfortschritt</span>
                  <span className="text-sm font-semibold text-gray-900">{project.progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-900 transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-2">
                {project.tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        task.status === 'Abgeschlossen' 
                          ? 'bg-green-500 border-green-500' 
                          : task.status === 'In Arbeit'
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300'
                      }`} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        <div className="text-xs text-gray-500">
                          Fällig: {task.dueDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">{task.taskCount} Aufgaben</span>
                      {getStatusBadge(task.status)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Assigned Tasks */}
              {project.assignedTasks.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Zugeordnete Aufgaben ({project.assignedTasks.length})
                  </h4>
                  <div className="space-y-1">
                    {project.assignedTasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                        {task.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <TimelineView projects={mappedProjects} />
        </TabsContent>

        <TabsContent value="hierarchy" className="mt-6">
          <HierarchyView 
            projects={mappedProjects.map(p => ({
              id: p.id,
              name: p.title,
              status: p.status,
              startDate: p.startDate,
              endDate: p.endDate,
              teamCount: p.teamMembers,
              milestoneCount: p.milestones,
              progress: p.progress,
              milestones: p.tasks.map(t => ({
                id: t.id,
                title: t.title,
                date: t.dueDate,
                taskCount: t.taskCount,
                status: t.status as 'Abgeschlossen' | 'In Arbeit' | 'Geplant'
              }))
            }))}
            onProjectClick={handleProjectClick}
          />
        </TabsContent>
      </Tabs>
      )}

      {/* Floating Action Button */}
      <Button 
        className="fixed bottom-6 right-6 h-14 px-6 rounded-full shadow-lg"
        onClick={() => setIsNewTaskOpen(true)}
      >
        <Plus className="h-5 w-5 mr-2" />
        Projekt erstellen
      </Button>

      <NewTaskDialog 
        open={isNewTaskOpen}
        onOpenChange={setIsNewTaskOpen}
      />
    </div>
  );
};
