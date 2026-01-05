import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, Target, Pencil, Trash2, CheckCircle2, Circle, Clock, FolderOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";

interface Project {
  id: string;
  title: string;
  status: string;
  progress: number;
  startDate: string;
  endDate: string;
  team: number;
  milestones: number;
  description?: string;
}

interface ProjectDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
}

export const ProjectDetailModal = ({ open, onOpenChange, project }: ProjectDetailModalProps) => {
  if (!project) return null;

  // Lade Meilensteine aus der Datenbank
  const { data: milestones = [] } = useQuery({
    queryKey: ['project-milestones', project.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('project_id', project.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: open && !!project.id
  });

  // Lade Tasks aus der Datenbank
  const { data: tasks = [] } = useQuery({
    queryKey: ['project-tasks-modal', project.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: open && !!project.id
  });

  // Lade Team-Mitglieder aus der Datenbank
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['project-team', project.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          *,
          profile:profiles(id, display_name, avatar_url)
        `)
        .eq('project_id', project.id);

      if (error) throw error;
      return data || [];
    },
    enabled: open && !!project.id
  });

  // Lade Aktivitäten (Audit Log)
  const { data: activities = [] } = useQuery({
    queryKey: ['project-activities', project.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('entity_type', 'project')
        .eq('entity_id', project.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: open && !!project.id
  });

  const daysRemaining = project.endDate 
    ? Math.max(0, differenceInDays(new Date(project.endDate), new Date()))
    : 0;

  const getMilestoneStatus = (milestone: any) => {
    if (milestone.status === 'completed') return 'completed';
    if (milestone.status === 'in_progress') return 'in-progress';
    return 'planned';
  };

  const getTaskStatus = (task: any) => {
    if (task.status === 'completed' || task.status === 'done') return 'completed';
    if (task.status === 'in_progress') return 'in-progress';
    return 'open';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('de-DE');
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'gerade eben';
    if (diffHours < 24) return `vor ${diffHours} Stunden`;
    if (diffDays === 1) return 'vor 1 Tag';
    return `vor ${diffDays} Tagen`;
  };

  const hasNoData = milestones.length === 0 && tasks.length === 0 && teamMembers.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">{project.title}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {project.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {daysRemaining} Tage verbleibend
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Bearbeiten
              </Button>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="milestones">Meilensteine</TabsTrigger>
            <TabsTrigger value="tasks">Aufgaben</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="activity">Aktivität</TabsTrigger>
          </TabsList>

          {/* Übersicht Tab */}
          <TabsContent value="overview" className="space-y-6 mt-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{project.progress}%</div>
                <div className="text-xs text-muted-foreground mt-1">Fortschritt</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{milestones.filter((m: any) => m.status === 'completed').length}/{milestones.length}</div>
                <div className="text-xs text-muted-foreground mt-1">Meilensteine<br/>abgeschlossen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{teamMembers.length}</div>
                <div className="text-xs text-muted-foreground mt-1">Mitarbeiter</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{daysRemaining}</div>
                <div className="text-xs text-muted-foreground mt-1">Tage<br/>verbleibend</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Projektzeitraum</h4>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Start: {project.startDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Ende: {project.endDate}</span>
                </div>
              </div>
              <Progress value={project.progress} className="h-2 mt-3" />
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Aktuelle Meilensteine</h4>
              {milestones.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 text-center border rounded-lg">
                  Keine Meilensteine definiert
                </div>
              ) : (
                milestones.slice(0, 3).map((milestone: any) => {
                  const status = getMilestoneStatus(milestone);
                  return (
                    <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : status === 'in-progress' ? (
                          <Clock className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <div className="font-medium">{milestone.title || milestone.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Fällig: {formatDate(milestone.due_date)}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={status === 'completed' ? 'default' : status === 'in-progress' ? 'secondary' : 'outline'}
                      >
                        {status === 'completed' ? 'Abgeschlossen' : status === 'in-progress' ? 'In Arbeit' : 'Geplant'}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Meilensteine Tab */}
          <TabsContent value="milestones" className="space-y-3 mt-4">
            {milestones.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg">
                <FolderOpen className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Keine Meilensteine vorhanden</p>
                <Button variant="outline" className="mt-3">Meilenstein hinzufügen</Button>
              </div>
            ) : (
              milestones.map((milestone: any) => {
                const status = getMilestoneStatus(milestone);
                return (
                  <div key={milestone.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : status === 'in-progress' ? (
                        <Clock className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <div className="font-medium">{milestone.title || milestone.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3" />
                          Fällig: {formatDate(milestone.due_date)}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={status === 'completed' ? 'default' : status === 'in-progress' ? 'secondary' : 'outline'}
                    >
                      {status === 'completed' ? 'Abgeschlossen' : status === 'in-progress' ? 'In Arbeit' : 'Geplant'}
                    </Badge>
                  </div>
                );
              })
            )}
          </TabsContent>

          {/* Aufgaben Tab */}
          <TabsContent value="tasks" className="space-y-3 mt-4">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg">
                <FolderOpen className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Keine Aufgaben vorhanden</p>
                <Button variant="outline" className="mt-3">Aufgabe hinzufügen</Button>
              </div>
            ) : (
              <>
                {tasks.map((task: any) => {
                  const status = getTaskStatus(task);
                  return (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Circle className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{task.title || task.name}</div>
                          {task.due_date && (
                            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                              <Calendar className="h-3 w-3" />
                              Fällig: {formatDate(task.due_date)}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant={status === 'in-progress' ? 'secondary' : 'outline'}>
                        {status === 'completed' ? 'Erledigt' : status === 'in-progress' ? 'In Arbeit' : 'Offen'}
                      </Badge>
                    </div>
                  );
                })}
                <Button variant="outline" className="w-full mt-4">
                  Aufgabe hinzufügen
                </Button>
              </>
            )}
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-3 mt-4">
            {teamMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg">
                <Users className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Keine Teammitglieder zugewiesen</p>
                <Button variant="outline" className="mt-3">
                  <Users className="h-4 w-4 mr-2" />
                  Mitarbeiter hinzufügen
                </Button>
              </div>
            ) : (
              <>
                {teamMembers.map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {(member.profile?.display_name || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{member.profile?.display_name || 'Unbekannt'}</div>
                        <div className="text-sm text-muted-foreground">{member.role || 'Mitglied'}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4">
                  <Users className="h-4 w-4 mr-2" />
                  Mitarbeiter hinzufügen
                </Button>
              </>
            )}
          </TabsContent>

          {/* Aktivität Tab */}
          <TabsContent value="activity" className="space-y-3 mt-4">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg">
                <Clock className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Keine Aktivitäten vorhanden</p>
              </div>
            ) : (
              activities.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border-l-2 border-primary/20 pl-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1">
                    <div className="text-sm">
                      <span className="font-medium">{activity.user_name || 'System'}</span> {activity.action || activity.description}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(activity.created_at)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
