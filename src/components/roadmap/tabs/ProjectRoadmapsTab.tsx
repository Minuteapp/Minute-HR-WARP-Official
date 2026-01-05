import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Filter, 
  Search, 
  Grid3X3, 
  List, 
  Flag, 
  CheckSquare, 
  Calendar, 
  ChevronDown, 
  ChevronRight,
  CheckCircle,
  Circle,
  Edit,
  Trash2,
  AlertTriangle,
  Plus,
  ArrowLeft
} from 'lucide-react';

// Hook für echte Projektdaten aus der Datenbank
const useProjectRoadmapData = () => {
  return useQuery({
    queryKey: ['project-roadmap-data'],
    queryFn: async () => {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading projects:', error);
        return { projects: [], milestones: [], tasks: [] };
      }
      
      // Lade Meilensteine und Aufgaben wenn Projekte vorhanden
      const projectsWithDetails = projects?.map(p => ({
        id: p.id,
        name: p.name || 'Unbenannt',
        team: p.department || 'Kein Team',
        status: p.status || 'geplant',
        priority: p.priority || 'mittel',
        progress: p.progress || 0,
        start: p.start_date || '',
        end: p.end_date || '',
        responsible: p.manager_name || 'Nicht zugewiesen',
        avatar: (p.name || 'P')[0].toUpperCase(),
        color: 'bg-violet-600'
      })) || [];
      
      return { 
        projects: projectsWithDetails,
        milestones: [],
        tasks: []
      };
    }
  });
};

// Leere Daten als Fallback - echte Daten kommen aus dem Hook
const demoProjects: any[] = [];
const demoMilestones: any[] = [];
const demoTasks: any[] = [];

export const ProjectRoadmapsTab: React.FC = () => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [milestonesOpen, setMilestonesOpen] = useState(true);
  const [tasksOpen, setTasksOpen] = useState(true);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ name: '', date: '', completed: false });
  
  // Echte Daten aus der Datenbank
  const { data: roadmapData } = useProjectRoadmapData();
  const projects = roadmapData?.projects || [];
  const milestones = roadmapData?.milestones || [];
  const tasks = roadmapData?.tasks || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aktiv':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">aktiv</Badge>;
      case 'geplant':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">geplant</Badge>;
      case 'blockiert':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">blockiert</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'kritisch':
        return <Badge className="bg-red-500 text-white">kritisch</Badge>;
      case 'hoch':
        return <Badge className="bg-orange-500 text-white">hoch</Badge>;
      case 'mittel':
        return <Badge className="bg-yellow-500 text-white">mittel</Badge>;
      case 'niedrig':
        return <Badge className="bg-gray-400 text-white">niedrig</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'in-bearbeitung':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">in Bearbeitung</Badge>;
      case 'blockiert':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">blockiert</Badge>;
      case 'offen':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">offen</Badge>;
      case 'erledigt':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">erledigt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'kritisch':
        return 'bg-red-500';
      case 'hoch':
        return 'bg-orange-500';
      case 'mittel':
        return 'bg-yellow-500';
      case 'niedrig':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'aktiv':
        return 'bg-violet-500';
      case 'geplant':
        return 'bg-yellow-500';
      case 'blockiert':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  if (selectedProject) {
    const completedMilestones = milestones.filter(m => m.completed).length;
    const completedTasks = tasks.filter(t => t.status === 'erledigt').length;

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button 
          onClick={() => setSelectedProject(null)}
          className="flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Projektauswahl
        </button>

        {/* Project Header */}
        <div className="bg-violet-600 text-white rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-semibold">{selectedProject.name}</h2>
                <Badge className="bg-white/20 text-white">Vorschau</Badge>
              </div>
              <p className="text-violet-200">{selectedProject.team} • {selectedProject.responsible}</p>
            </div>
            {getStatusBadge(selectedProject.status)}
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-violet-200 text-sm">Start</p>
              <p className="font-medium">{selectedProject.start}</p>
            </div>
            <div>
              <p className="text-violet-200 text-sm">Ende</p>
              <p className="font-medium">{selectedProject.end}</p>
            </div>
            <div>
              <p className="text-violet-200 text-sm">Fortschritt</p>
              <p className="font-medium">{selectedProject.progress}%</p>
            </div>
            <div>
              <p className="text-violet-200 text-sm">Priorität</p>
              <p className="font-medium capitalize">{selectedProject.priority}</p>
            </div>
          </div>

          <div>
            <Progress value={selectedProject.progress} className="h-2 bg-violet-400" />
            <p className="text-sm text-violet-200 mt-1">{selectedProject.progress}% abgeschlossen</p>
          </div>
        </div>

        {/* Warning Box */}
        {selectedProject.status === 'blockiert' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800">Projekt-Verzögerung erkannt</h4>
                <p className="text-sm text-red-600 mt-1">
                  Das Projekt liegt aktuell 15 Tage hinter dem Plan.
                </p>
                <ul className="list-disc list-inside text-sm text-red-600 mt-2">
                  <li>Abhängigkeit von externem API-Service nicht erfüllt</li>
                  <li>Ressourcenkonflikt mit Digital Transformation Projekt</li>
                </ul>
                <p className="text-sm text-red-700 mt-2">
                  <strong>Empfehlung:</strong> Überprüfen Sie die Ressourcenzuweisung und klären Sie die externe Abhängigkeit.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Milestones Section */}
        <Card>
          <Collapsible open={milestonesOpen} onOpenChange={setMilestonesOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {milestonesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <Flag className="h-4 w-4 text-violet-600" />
                    <CardTitle className="text-lg">Meilensteine</CardTitle>
                    <Badge variant="secondary">{completedMilestones}/{milestones.length}</Badge>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-green-500 hover:bg-green-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddMilestone(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Meilenstein hinzufügen
                  </Button>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3">
                {showAddMilestone && (
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="text-sm font-medium">Name *</label>
                      <Input 
                        placeholder="Meilenstein-Name"
                        value={newMilestone.name}
                        onChange={(e) => setNewMilestone({...newMilestone, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Datum *</label>
                      <Input 
                        type="date"
                        value={newMilestone.date}
                        onChange={(e) => setNewMilestone({...newMilestone, date: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        checked={newMilestone.completed}
                        onCheckedChange={(checked) => setNewMilestone({...newMilestone, completed: checked as boolean})}
                      />
                      <label className="text-sm">Abgeschlossen</label>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-500 hover:bg-green-600">Speichern</Button>
                      <Button size="sm" variant="outline" onClick={() => setShowAddMilestone(false)}>Abbrechen</Button>
                    </div>
                  </div>
                )}

                {milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      {milestone.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300" />
                      )}
                      <Flag className={`h-4 w-4 ${milestone.completed ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className={milestone.completed ? 'text-green-600' : ''}>{milestone.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {milestone.date}
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Tasks Section */}
        <Card>
          <Collapsible open={tasksOpen} onOpenChange={setTasksOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  {tasksOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <CheckSquare className="h-4 w-4 text-blue-600" />
                  <CardTitle className="text-lg">Aufgaben</CardTitle>
                  <Badge variant="secondary">{completedTasks}/{tasks.length}</Badge>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${getPriorityDot(task.priority)}`} />
                      <div>
                        <p className="font-medium">{task.name}</p>
                        <p className="text-sm text-muted-foreground">{task.person} • {task.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(task.priority)}
                      {getTaskStatusBadge(task.status)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filter & Suche</span>
            </div>
            <button 
              className="text-primary text-sm hover:underline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? 'Weniger Filter' : 'Mehr Filter'}
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Projekt suchen (Name oder Team)..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {showAdvancedFilters && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Teams</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="mobile">Mobile Team</SelectItem>
                  <SelectItem value="ux">UX & Frontend</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="aktiv">Aktiv</SelectItem>
                  <SelectItem value="geplant">Geplant</SelectItem>
                  <SelectItem value="blockiert">Blockiert</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Prioritäten" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Prioritäten</SelectItem>
                  <SelectItem value="kritisch">Kritisch</SelectItem>
                  <SelectItem value="hoch">Hoch</SelectItem>
                  <SelectItem value="mittel">Mittel</SelectItem>
                  <SelectItem value="niedrig">Niedrig</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <p className="text-sm text-muted-foreground">{projects.length} von {projects.length} Projekten</p>
        </CardContent>
      </Card>

      {/* Project Selection Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Projekt auswählen</h2>
        <div className="flex items-center gap-1 border rounded-lg p-1">
          <Button 
            size="sm" 
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            className="h-8 px-3"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            className="h-8 px-3"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-4'}>
        {projects.map((project) => (
          <Card 
            key={project.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedProject(project)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className={`h-10 w-10 rounded-lg ${project.color} flex items-center justify-center text-white font-bold`}>
                  {project.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{project.name}</h3>
                  <p className="text-sm text-muted-foreground">{project.team}</p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Fortschritt</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getProgressColor(project.status)} rounded-full`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                {getStatusBadge(project.status)}
                <span className="text-xs text-muted-foreground">
                  {milestones.length} Meilensteine • {tasks.length} Aufgaben
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProjectRoadmapsTab;
