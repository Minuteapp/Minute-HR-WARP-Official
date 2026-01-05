import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, Users, Target, MoreVertical, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ProjectDetailModal } from "./ProjectDetailModal";

export const ProjectRoadmapTab = () => {
  const [selectedView, setSelectedView] = useState<'list' | 'timeline' | 'hierarchy'>('list');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const projects = [
    {
      id: '1',
      title: 'Recruiting Q4 2025',
      status: 'In Arbeit',
      progress: 65,
      startDate: '1.10.2025',
      endDate: '31.12.2025',
      dates: '1.10.2025 - 31.12.2025',
      duration: '74 Tage verbleibend',
      team: 4,
      milestones: 3,
      assignedTasks: 2,
      currentTasks: [
        { id: '1', title: 'Stellenausschreibungen veröffentlichen', subtasks: 8, status: 'Abgeschlossen' },
        { id: '2', title: 'Bewerbungsgespräche durchführen', subtasks: 12, status: 'In Arbeit' },
        { id: '3', title: 'Einstellungen abschließen', subtasks: 6, status: 'Geplant' },
      ]
    },
    {
      id: '2',
      title: 'Performance Management 2025',
      status: 'In Arbeit',
      progress: 40,
      startDate: '1.9.2025',
      endDate: '30.11.2025',
      dates: '1.9.2025 - 30.11.2025',
      duration: '45 Tage verbleibend',
      team: 6,
      milestones: 3,
      assignedTasks: 1,
      currentTasks: [
        { id: '1', title: 'Bewertungsbögen erstellen', subtasks: 5, status: 'Abgeschlossen' },
        { id: '2', title: 'Q4 Reviews durchführen', subtasks: 15, status: 'In Arbeit' },
        { id: '3', title: 'Entwicklungspläne finalisieren', subtasks: 8, status: 'Geplant' },
      ]
    },
    {
      id: '3',
      title: 'Digitalisierung HR-Prozesse',
      status: 'Planung',
      progress: 15,
      startDate: '15.10.2025',
      endDate: '31.3.2026',
      dates: '15.10.2025 - 31.3.2026',
      duration: '168 Tage verbleibend',
      team: 8,
      milestones: 2,
      assignedTasks: 0,
      currentTasks: [
        { id: '1', title: 'Requirements Analysis', subtasks: 10, status: 'In Arbeit' },
        { id: '2', title: 'Tool-Auswahl', subtasks: 7, status: 'Geplant' },
      ]
    }
  ];

  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* AI-Empfehlung */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium mb-1">KI-Projektempfehlung</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Das Projekt "Performance Management 2025" ist zu 40% fertig, aber 60% der Zeit ist bereits verstrichen. Empfehlung: 3 zusätzliche Ressourcen zuweisen und nicht-kritische Aufgaben verschieben.
            </p>
            <Button size="sm">
              Ressourcen anpassen
            </Button>
          </div>
        </div>
      </Card>

      {/* View Tabs */}
      <div className="flex gap-2 border-b">
        <Button 
          variant="ghost" 
          className={selectedView === 'list' ? "border-b-2 border-primary rounded-none" : "rounded-none"}
          onClick={() => setSelectedView('list')}
        >
          Listen-Ansicht
        </Button>
        <Button 
          variant="ghost" 
          className={selectedView === 'timeline' ? "border-b-2 border-primary rounded-none" : "rounded-none"}
          onClick={() => setSelectedView('timeline')}
        >
          Timeline-Ansicht
        </Button>
        <Button 
          variant="ghost" 
          className={selectedView === 'hierarchy' ? "border-b-2 border-primary rounded-none" : "rounded-none"}
          onClick={() => setSelectedView('hierarchy')}
        >
          Hierarchie-Ansicht
        </Button>
      </div>

      {/* Listen-Ansicht */}
      {selectedView === 'list' && (
        <div className="space-y-4">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleProjectClick(project)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{project.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {project.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{project.duration}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); }}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{project.dates}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{project.team} Mitarbeiter</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span>{project.milestones} Meilensteine</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Gesamtfortschritt</span>
                  <span className="font-semibold">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              <div className="mt-4 space-y-2">
                {project.currentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-2 bg-accent/50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm">{task.title}</span>
                      <span className="text-xs text-muted-foreground">• {task.subtasks} Aufgaben</span>
                    </div>
                    <Badge 
                      variant={task.status === 'Abgeschlossen' ? 'default' : task.status === 'In Arbeit' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>

              {project.assignedTasks > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">Zugeordnete Aufgaben ({project.assignedTasks})</div>
                </div>
              )}
            </Card>
          ))}

          <Button className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Projekt erstellen
          </Button>
        </div>
      )}

      {/* Timeline-Ansicht */}
      {selectedView === 'timeline' && (
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Timeline-Ansicht 2025-2026</h3>
            <p className="text-sm text-muted-foreground">Visualisierung aller Projekte und Meilensteine auf einer Zeitachse</p>
          </div>

          <div className="space-y-6">
            {/* Zeitachse Header */}
            <div className="grid grid-cols-6 gap-4 text-sm text-muted-foreground font-medium pb-2 border-b">
              <div>Okt 2025</div>
              <div>Nov 2025</div>
              <div>Dez 2025</div>
              <div>Jan 2026</div>
              <div>Feb 2026</div>
              <div>Mrz 2026</div>
            </div>

            {/* Projekt: Recruiting Q4 2025 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium min-w-[200px]">Recruiting Q4 2025</span>
                <div className="text-xs text-muted-foreground">65%</div>
              </div>
              <div className="relative h-8 bg-accent/20 rounded">
                <div className="absolute top-0 left-0 h-full bg-primary rounded" style={{ width: '65%' }}>
                  <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
                  <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Projekt: Performance Management 2025 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium min-w-[200px]">Performance Management 2025</span>
                <div className="text-xs text-muted-foreground">40%</div>
              </div>
              <div className="relative h-8 bg-accent/20 rounded">
                <div className="absolute top-0 left-0 h-full bg-primary rounded" style={{ width: '40%' }}>
                  <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-amber-400 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Projekt: Digitalisierung HR-Prozesse */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium min-w-[200px]">Digitalisierung HR-Prozesse</span>
                <div className="text-xs text-muted-foreground">15%</div>
              </div>
              <div className="relative h-8 bg-accent/20 rounded">
                <div className="absolute top-0 left-[25%] h-full bg-blue-400 rounded" style={{ width: '75%' }}>
                  <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
                  <div className="absolute right-1/3 top-1/2 -translate-y-1/2 w-2 h-2 bg-amber-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Legende */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span>In Arbeit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded"></div>
              <span>Planung</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white border-2 border-primary rounded-full"></div>
              <span>Abgeschlossener Meilenstein</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <span>Aktueller Meilenstein</span>
            </div>
          </div>
        </Card>
      )}

      {/* Hierarchie-Ansicht */}
      {selectedView === 'hierarchy' && (
        <Card className="p-6">
          <p className="text-muted-foreground text-center py-8">Hierarchie-Ansicht wird noch implementiert...</p>
        </Card>
      )}

      {/* Project Detail Modal */}
      <ProjectDetailModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        project={selectedProject}
      />
    </div>
  );
};
