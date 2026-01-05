import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { X, Edit, Trash2, Target, Users as UsersIcon, Calendar, Plus, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ProjectDetailDialogProps {
  project: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProjectDetailDialog = ({ project, open, onOpenChange }: ProjectDetailDialogProps) => {
  if (!project) return null;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      'Abgeschlossen': { variant: 'default', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
      'In Arbeit': { variant: 'default', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
      'Geplant': { variant: 'default', className: 'bg-gray-100 text-gray-700 hover:bg-gray-100' },
      'open': { variant: 'default', className: 'bg-gray-100 text-gray-700 hover:bg-gray-100' }
    };
    const config = variants[status] || variants['Geplant'];
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const mockTeamMembers: { id: string; name: string; role: string; avatar: string }[] = [];

  const mockActivities: { id: string; type: string; user: string; action: string; time: string }[] = [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{project.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(project.status)}
                  <span className="text-sm text-gray-600">
                    74 Tage verbleibend
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Bearbeiten
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Löschen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b px-6">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="milestones">Meilensteine</TabsTrigger>
            <TabsTrigger value="tasks">Aufgaben</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="activity">Aktivität</TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto flex-1">
            {/* Overview Tab */}
            <TabsContent value="overview" className="p-6 space-y-6 m-0">
              {/* KPIs */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{project.progress}%</div>
                  <div className="text-sm text-gray-600 mt-1">Fortschritt</div>
                  <div className="text-xs text-gray-500 mt-1">1 abgeschlossen</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{project.milestones}</div>
                  <div className="text-sm text-gray-600 mt-1">Meilensteine</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{project.teamMembers}</div>
                  <div className="text-sm text-gray-600 mt-1">Team</div>
                  <div className="text-sm text-gray-600 mt-1">Mitarbeiter</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">74</div>
                  <div className="text-sm text-gray-600 mt-1">Zeitraum</div>
                  <div className="text-sm text-gray-600 mt-1">Tage verbleibend</div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Projektzeitraum</h3>
                <div className="flex items-center gap-4 text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Start: {project.startDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Ende: {project.endDate}</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Current Milestones */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Aktuelle Meilensteine</h3>
                <div className="space-y-2">
                  {project.tasks.map((task: any) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${
                          task.status === 'Abgeschlossen' 
                            ? 'bg-green-500' 
                            : task.status === 'In Arbeit'
                            ? 'bg-blue-500'
                            : 'bg-gray-300'
                        }`} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{task.title}</div>
                          <div className="text-xs text-gray-500">
                            Fällig: {task.dueDate} • {task.taskCount} Aufgaben
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(task.status)}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Milestones Tab */}
            <TabsContent value="milestones" className="p-6 space-y-4 m-0">
              <RadioGroup defaultValue="">
                {project.tasks.map((milestone: any) => (
                  <div key={milestone.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 flex-1">
                      <RadioGroupItem value={milestone.id} id={milestone.id} />
                      <label htmlFor={milestone.id} className="flex-1 cursor-pointer">
                        <div className="text-sm font-medium text-gray-900">{milestone.title}</div>
                        <div className="text-xs text-gray-500">Fällig: {milestone.dueDate} • {milestone.taskCount} Aufgaben</div>
                      </label>
                    </div>
                    {getStatusBadge(milestone.status)}
                  </div>
                ))}
              </RadioGroup>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="p-6 space-y-4 m-0">
              <RadioGroup defaultValue="">
                {project.tasks.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 flex-1">
                      <RadioGroupItem value={task.id} id={task.id} />
                      <label htmlFor={task.id} className="flex-1 cursor-pointer">
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        <div className="text-xs text-gray-500">Fällig: {task.dueDate} • {task.taskCount} Aufgaben</div>
                      </label>
                    </div>
                    {getStatusBadge(task.status)}
                  </div>
                ))}
              </RadioGroup>
              
              <div className="pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Aufgabe hinzufügen
                </Button>
              </div>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="p-6 space-y-4 m-0">
              <div className="grid grid-cols-2 gap-4">
                {mockTeamMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {member.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-600">{member.role}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <UsersIcon className="h-4 w-4 mr-2" />
                Mitarbeiter hinzufügen
              </Button>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="p-6 space-y-4 m-0">
              {mockActivities.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
