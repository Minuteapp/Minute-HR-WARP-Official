import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Pencil, 
  MoreVertical, 
  TrendingUp, 
  Flag, 
  Users, 
  CheckCircle,
  Calendar,
  Target,
  Plus,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock project data
// Project data will be loaded from database
const mockProject = {
  id: '',
  title: '',
  status: '',
  daysRemaining: 0,
  startDate: '',
  endDate: '',
  progress: 0,
  milestones: [] as any[],
  tasks: [] as any[],
  team: [] as any[],
  teamCount: 0,
  milestoneCount: 0,
  taskCount: 0
};

export default function TasksProjectDetailPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const project = mockProject;

  const tabs = [
    { id: 'overview', label: 'Übersicht' },
    { id: 'milestones', label: 'Meilensteine' },
    { id: 'tasks', label: 'Aufgaben' },
    { id: 'team', label: 'Team' },
    { id: 'activity', label: 'Aktivität' }
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'Abgeschlossen': 'bg-green-100 text-green-700',
      'In Arbeit': 'bg-blue-100 text-blue-700',
      'Geplant': 'bg-gray-100 text-gray-700',
      'Offen': 'bg-orange-100 text-orange-700'
    };
    return variants[status] || 'bg-gray-100 text-gray-700';
  };

  const getProgressColor = (progress: number, status: string) => {
    if (status === 'Abgeschlossen') return 'bg-green-500';
    if (status === 'In Arbeit') return 'bg-blue-500';
    return 'bg-gray-300';
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-teal-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/tasks')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Übersicht
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Archivieren</DropdownMenuItem>
                <DropdownMenuItem>Exportieren</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Löschen</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Project Title */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">{project.title}</h1>
              <Badge className={getStatusBadge(project.status)}>{project.status}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span className="text-orange-600 font-medium">{project.daysRemaining} Tage verbleibend</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {project.startDate} - {project.endDate}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards - Redesigned with white background and grey border */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-white border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Fortschritt</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{project.progress}%</div>
            <div className="mt-2">
              <Progress value={project.progress} className="h-1.5" />
            </div>
          </Card>

          <Card className="p-4 bg-white border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Meilensteine</span>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{project.milestoneCount}</div>
            <div className="text-xs text-muted-foreground mt-1">1 abgeschlossen</div>
          </Card>

          <Card className="p-4 bg-white border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Team</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{project.teamCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Mitarbeiter</div>
          </Card>

          <Card className="p-4 bg-white border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Aufgaben</span>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{project.taskCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Gesamt</div>
          </Card>
        </div>

        {/* Pill Tab Navigation */}
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Two cards side by side */}
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Projektzeitraum</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span className="text-muted-foreground">Startdatum</span>
                    </div>
                    <span className="font-medium">{project.startDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span className="text-muted-foreground">Enddatum</span>
                    </div>
                    <span className="font-medium">{project.endDate}</span>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Fortschritt</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Status-Übersicht</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Abgeschlossene Meilensteine</span>
                    <span className="text-blue-600 font-medium">1 von 3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Aktive Meilensteine</span>
                    <span className="text-blue-600 font-medium">1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Geplante Meilensteine</span>
                    <span className="text-gray-600 font-medium">1</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Milestones Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Meilensteine</h3>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Meilenstein hinzufügen
                </Button>
              </div>
              <div className="space-y-3">
                {project.milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center ${
                      milestone.status === 'Abgeschlossen' 
                        ? 'bg-green-500 text-white' 
                        : 'border-2 border-gray-300'
                    }`}>
                      {milestone.status === 'Abgeschlossen' && <CheckCircle className="h-3 w-3" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{milestone.title}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-3">
                        <span>{milestone.dueDate}</span>
                        <span>•</span>
                        <span>{milestone.taskCount} Aufgaben</span>
                      </div>
                    </div>
                    <Badge className={getStatusBadge(milestone.status)}>{milestone.status}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'milestones' && (
          <div className="space-y-4">
            {project.milestones.map((milestone) => (
              <Card key={milestone.id} className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center mt-1 ${
                    milestone.status === 'Abgeschlossen' 
                      ? 'bg-green-500 text-white' 
                      : 'border-2 border-gray-300'
                  }`}>
                    {milestone.status === 'Abgeschlossen' && <CheckCircle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{milestone.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusBadge(milestone.status)}>{milestone.status}</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Löschen</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {milestone.dueDate}
                      </span>
                      <span>{milestone.taskCount} Aufgaben</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                      <div 
                        className={`h-full rounded-full ${getProgressColor(milestone.progress, milestone.status)}`}
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Meilenstein hinzufügen
            </Button>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-3">
            {project.tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4 p-4 bg-white rounded-lg border hover:border-primary/50 cursor-pointer">
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                <span className="flex-1 font-medium">{task.title}</span>
                <Badge className={getStatusBadge(task.status)}>{task.status}</Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Aufgabe hinzufügen
            </Button>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {project.team.map((member) => (
                <Card key={member.id} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`h-10 w-10 rounded-full ${getAvatarColor(member.name)} flex items-center justify-center text-white font-medium`}>
                      {getInitials(member.name)}
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">{member.role}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Auslastung</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gray-800"
                          style={{ width: `${member.workload}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${member.workload >= 80 ? 'text-red-600' : 'text-foreground'}`}>
                        {member.workload}%
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Mitarbeiter hinzufügen
            </Button>
          </div>
        )}

        {activeTab === 'activity' && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Aktivitäten</h3>
            <div className="space-y-4">
              {/* Timeline-style activity with blue dots */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <div className="w-0.5 h-8 bg-gray-200" />
                </div>
                <div className="pt-0">
                  <div className="text-sm">
                    <span className="font-semibold">Lisa Schmidt</span>{' '}
                    <span className="text-muted-foreground">hat den Meilenstein "Stellenausschreibungen veröffentlichen" als</span>{' '}
                    <span className="font-medium">"In Arbeit"</span>{' '}
                    <span className="text-muted-foreground">markiert</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">vor 2 Stunden</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <div className="w-0.5 h-8 bg-gray-200" />
                </div>
                <div className="pt-0">
                  <div className="text-sm">
                    <span className="font-semibold">Anna Becker</span>{' '}
                    <span className="text-muted-foreground">hat eine Aufgabe abgeschlossen</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">vor 4 Stunden</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <div className="w-0.5 h-8 bg-gray-200" />
                </div>
                <div className="pt-0">
                  <div className="text-sm">
                    <span className="font-semibold">Thomas Müller</span>{' '}
                    <span className="text-muted-foreground">wurde zum Projekt hinzugefügt</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">gestern</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                </div>
                <div className="pt-0">
                  <div className="text-sm">
                    <span className="font-semibold">Meilenstein</span>{' '}
                    <span className="text-muted-foreground">"Stellenausschreibungen veröffentlichen" wurde</span>{' '}
                    <span className="font-medium text-green-600">abgeschlossen</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">vor 3 Tagen</div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
