import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useInnovation } from "@/hooks/useInnovation";
import { useRoadmaps } from "@/hooks/useRoadmaps";
import { LifecycleStage } from "@/types/innovation";
import { 
  Lightbulb, 
  Map, 
  FolderKanban, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  Zap,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";

const stageIcons = {
  submitted: Lightbulb,
  under_review: Clock,
  approved: CheckCircle,
  roadmap_created: Map,
  project_created: FolderKanban,
  in_development: TrendingUp,
  pilot_phase: Zap,
  implemented: CheckCircle,
  rejected: CheckCircle,
  archived: CheckCircle,
};

const stageColors = {
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  under_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  roadmap_created: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  project_created: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  in_development: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  pilot_phase: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  implemented: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  archived: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

const stageLabels = {
  submitted: "Eingereicht",
  under_review: "In Prüfung",
  approved: "Genehmigt",
  roadmap_created: "Roadmap erstellt",
  project_created: "Projekt erstellt",
  in_development: "In Entwicklung",
  pilot_phase: "Pilotphase",
  implemented: "Implementiert",
  rejected: "Abgelehnt",
  archived: "Archiviert",
};

export function InnovationLifecycleDashboard() {
  const { 
    ideas, 
    lifecycleTracking, 
    promoteToRoadmap, 
    createProjectFromRoadmap,
    getIdeaLifecycle,
    isPromoting,
    isCreatingProject
  } = useInnovation();
  const { roadmaps } = useRoadmaps();

  const handlePromoteToRoadmap = async (ideaId: string) => {
    try {
      await promoteToRoadmap({ ideaId });
    } catch (error) {
      console.error('Error promoting idea:', error);
    }
  };

  const handleCreateProject = async (roadmapId: string) => {
    try {
      await createProjectFromRoadmap({ roadmapId });
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const getLifecycleProgress = (stage: LifecycleStage): number => {
    const progressMap = {
      submitted: 10,
      under_review: 25,
      approved: 40,
      roadmap_created: 55,
      project_created: 70,
      in_development: 85,
      pilot_phase: 95,
      implemented: 100,
      rejected: 0,
      archived: 0,
    };
    return progressMap[stage] || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Innovation Lifecycle</h2>
          <p className="text-muted-foreground">
            Verfolgen Sie Ideen von der Einreichung bis zur Implementierung
          </p>
        </div>
      </div>

      {/* Lifecycle Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Ideen</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ideas.filter(idea => ['new', 'under_review', 'approved'].includes(idea.status || '')).length}
            </div>
            <p className="text-xs text-muted-foreground">
              In verschiedenen Phasen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Roadmaps</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roadmaps.filter(r => r.auto_created).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Automatisch erstellt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Umsetzung</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lifecycleTracking.filter(t => ['project_created', 'in_development', 'pilot_phase'].includes(t.current_stage)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Als Projekte aktiv
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Implementiert</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lifecycleTracking.filter(t => t.current_stage === 'implemented').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Erfolgreich umgesetzt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Lifecycle Items */}
      <Card>
        <CardHeader>
          <CardTitle>Aktive Innovation Journeys</CardTitle>
          <CardDescription>
            Ideen, die sich durch den automatisierten Lifecycle bewegen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {ideas
              .filter(idea => idea.status !== 'rejected' && idea.status !== 'archived')
              .slice(0, 10)
              .map((idea) => {
                const lifecycle = getIdeaLifecycle(idea.id!);
                const currentStage = (lifecycle?.current_stage || idea.lifecycle_stage || 'submitted') as LifecycleStage;
                const StageIcon = stageIcons[currentStage];
                const progress = getLifecycleProgress(currentStage);
                const relatedRoadmap = roadmaps.find(r => r.source_idea_id === idea.id);

                return (
                  <div key={idea.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <StageIcon className="h-4 w-4" />
                          <h3 className="font-semibold">{idea.title}</h3>
                          <Badge className={stageColors[currentStage]}>
                            {stageLabels[currentStage]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {idea.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Priorität: {idea.priority}</span>
                          {idea.budget_estimate && (
                            <span>Budget: €{idea.budget_estimate.toLocaleString()}</span>
                          )}
                          {idea.pilot_area && (
                            <span>Pilotbereich: {idea.pilot_area}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {currentStage === 'approved' && !idea.automation_triggered && (
                          <Button
                            size="sm"
                            onClick={() => handlePromoteToRoadmap(idea.id!)}
                            disabled={isPromoting}
                          >
                            <ArrowRight className="h-4 w-4 mr-1" />
                            Zu Roadmap
                          </Button>
                        )}
                        
                        {currentStage === 'roadmap_created' && relatedRoadmap && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCreateProject(relatedRoadmap.id)}
                            disabled={isCreatingProject}
                          >
                            <FolderKanban className="h-4 w-4 mr-1" />
                            Projekt erstellen
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Fortschritt</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Automation Log */}
                    {lifecycle?.automation_log && lifecycle.automation_log.length > 0 && (
                      <div className="pt-2 border-t">
                        <h4 className="text-xs font-medium text-muted-foreground mb-2">
                          Automatisierung
                        </h4>
                        <div className="space-y-1">
                          {lifecycle.automation_log.slice(-3).map((log, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                              <Zap className="h-3 w-3 text-yellow-500" />
                              <span className="text-muted-foreground">
                                {log.action === 'auto_roadmap_creation' ? 'Roadmap automatisch erstellt' : log.action}
                              </span>
                              <span className="text-muted-foreground">
                                {new Date(log.timestamp).toLocaleDateString('de-DE')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}