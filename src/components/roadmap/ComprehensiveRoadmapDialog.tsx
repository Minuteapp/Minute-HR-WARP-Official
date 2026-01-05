import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Route, Target, Calendar, FileText, CheckSquare, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { ComprehensiveRoadmapData, CreateMilestoneData, CreateRoadmapGoalData, CreateRoadmapProjectData, CreateRoadmapTaskData } from '@/types/roadmap';

interface ComprehensiveRoadmapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const ComprehensiveRoadmapDialog = ({ open, onOpenChange, onSuccess }: ComprehensiveRoadmapDialogProps) => {
  const [activeTab, setActiveTab] = useState('roadmap');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [roadmapData, setRoadmapData] = useState({
    title: '',
    description: '',
    vision: '',
    mission: '',
    status: 'draft' as const,
    priority: 'medium' as const,
    start_date: '',
    end_date: ''
  });

  const [milestones, setMilestones] = useState<Omit<CreateMilestoneData, 'roadmap_id'>[]>([]);
  const [goals, setGoals] = useState<Omit<CreateRoadmapGoalData, 'roadmap_id'>[]>([]);
  const [projects, setProjects] = useState<Omit<CreateRoadmapProjectData, 'roadmap_id'>[]>([]);
  const [tasks, setTasks] = useState<Omit<CreateRoadmapTaskData, 'roadmap_id'>[]>([]);

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: '',
        description: '',
        status: 'planned',
        priority: 'medium',
        target_date: '',
        position_x: Math.random() * 500,
        position_y: Math.random() * 300
      }
    ]);
  };

  const addGoal = () => {
    setGoals([
      ...goals,
      {
        title: '',
        description: '',
        status: 'active',
        priority: 'medium',
        target_date: '',
        success_criteria: '',
        position_x: Math.random() * 500,
        position_y: Math.random() * 300
      }
    ]);
  };

  const addProject = () => {
    setProjects([
      ...projects,
      {
        name: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: ''
      }
    ]);
  };

  const addTask = () => {
    setTasks([
      ...tasks,
      {
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: ''
      }
    ]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: string, value: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const updateGoal = (index: number, field: string, value: any) => {
    const updated = [...goals];
    updated[index] = { ...updated[index], [field]: value };
    setGoals(updated);
  };

  const updateProject = (index: number, field: string, value: any) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const updateTask = (index: number, field: string, value: any) => {
    const updated = [...tasks];
    updated[index] = { ...updated[index], [field]: value };
    setTasks(updated);
  };

  const handleSubmit = async () => {
    if (!roadmapData.title.trim()) {
      toast.error('Bitte geben Sie einen Roadmap-Titel ein');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht authentifiziert');

      // 1. Erstelle die Roadmap
      const { data: roadmap, error: roadmapError } = await supabase
        .from('roadmaps')
        .insert({
          ...roadmapData,
          created_by: user.id,
          progress: 0
        })
        .select()
        .single();

      if (roadmapError) throw roadmapError;

      // 2. Erstelle Milestones
      const milestonePromises = milestones.map(async (milestone) => {
        if (!milestone.title.trim()) return null;
        
        const { data, error } = await supabase
          .from('roadmap_milestones')
          .insert({
            ...milestone,
            roadmap_id: roadmap.id,
            progress: 0,
            dependencies: []
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      });

      const createdMilestones = (await Promise.all(milestonePromises)).filter(Boolean);

      // 3. Erstelle Goals
      const goalPromises = goals.map(async (goal) => {
        if (!goal.title.trim()) return null;
        
        const { data, error } = await supabase
          .from('roadmap_goals')
          .insert({
            ...goal,
            roadmap_id: roadmap.id,
            created_by: user.id,
            progress: 0,
            team_members: [],
            kpi_metrics: {},
            dependencies: []
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      });

      const createdGoals = (await Promise.all(goalPromises)).filter(Boolean);

      // 4. Erstelle Projects
      const projectPromises = projects.map(async (project) => {
        if (!project.name.trim()) return null;
        
        const { data, error } = await supabase
          .from('projects')
          .insert({
            ...project,
            roadmap_id: roadmap.id,
            createdBy: user.id,
            progress: 0,
            createdAt: new Date().toISOString(),
            roadmap_context: {
              roadmap_title: roadmap.title,
              created_in_roadmap: true
            }
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      });

      const createdProjects = (await Promise.all(projectPromises)).filter(Boolean);

      // 5. Erstelle Tasks
      const taskPromises = tasks.map(async (task) => {
        if (!task.title.trim()) return null;
        
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            ...task,
            roadmap_id: roadmap.id,
            created_by: user.id,
            assigned_to: user.id,
            completed: false,
            roadmap_context: {
              roadmap_title: roadmap.title,
              created_in_roadmap: true
            }
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      });

      await Promise.all(taskPromises);

      toast.success(`Roadmap "${roadmap.title}" erfolgreich erstellt mit ${createdMilestones.length} Meilensteinen, ${createdGoals.length} Zielen, ${createdProjects.length} Projekten und ${tasks.filter(t => t.title.trim()).length} Aufgaben`);
      
      // Reset form
      setRoadmapData({
        title: '',
        description: '',
        vision: '',
        mission: '',
        status: 'draft',
        priority: 'medium',
        start_date: '',
        end_date: ''
      });
      setMilestones([]);
      setGoals([]);
      setProjects([]);
      setTasks([]);
      setActiveTab('roadmap');
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Fehler beim Erstellen der Roadmap:', error);
      toast.error('Fehler beim Erstellen der Roadmap');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Route className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Umfassende Roadmap erstellen</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Erstellen Sie eine vollständige Roadmap mit Meilensteinen, Zielen, Projekten und Aufgaben
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="px-6 flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5 mb-4">
              <TabsTrigger value="roadmap" className="gap-2">
                <Route className="h-4 w-4" />
                Roadmap
              </TabsTrigger>
              <TabsTrigger value="milestones" className="gap-2">
                <MapPin className="h-4 w-4" />
                Meilensteine
              </TabsTrigger>
              <TabsTrigger value="goals" className="gap-2">
                <Target className="h-4 w-4" />
                Ziele
              </TabsTrigger>
              <TabsTrigger value="projects" className="gap-2">
                <FileText className="h-4 w-4" />
                Projekte
              </TabsTrigger>
              <TabsTrigger value="tasks" className="gap-2">
                <CheckSquare className="h-4 w-4" />
                Aufgaben
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto max-h-[500px]">
              <TabsContent value="roadmap" className="space-y-4 mt-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titel *</Label>
                    <Input
                      id="title"
                      value={roadmapData.title}
                      onChange={(e) => setRoadmapData({ ...roadmapData, title: e.target.value })}
                      placeholder="z.B. Produkt Roadmap 2024"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Beschreibung</Label>
                    <Textarea
                      id="description"
                      value={roadmapData.description}
                      onChange={(e) => setRoadmapData({ ...roadmapData, description: e.target.value })}
                      placeholder="Beschreibung der Roadmap"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vision">Vision</Label>
                      <Textarea
                        id="vision"
                        value={roadmapData.vision}
                        onChange={(e) => setRoadmapData({ ...roadmapData, vision: e.target.value })}
                        placeholder="Langfristige Vision"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mission">Mission</Label>
                      <Textarea
                        id="mission"
                        value={roadmapData.mission}
                        onChange={(e) => setRoadmapData({ ...roadmapData, mission: e.target.value })}
                        placeholder="Mission und Zweck"
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={roadmapData.status}
                        onValueChange={(value: any) => setRoadmapData({ ...roadmapData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Entwurf</SelectItem>
                          <SelectItem value="active">Aktiv</SelectItem>
                          <SelectItem value="completed">Abgeschlossen</SelectItem>
                          <SelectItem value="on_hold">Pausiert</SelectItem>
                          <SelectItem value="cancelled">Abgebrochen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priorität</Label>
                      <Select
                        value={roadmapData.priority}
                        onValueChange={(value: any) => setRoadmapData({ ...roadmapData, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Niedrig</SelectItem>
                          <SelectItem value="medium">Mittel</SelectItem>
                          <SelectItem value="high">Hoch</SelectItem>
                          <SelectItem value="critical">Kritisch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Startdatum</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={roadmapData.start_date}
                        onChange={(e) => setRoadmapData({ ...roadmapData, start_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date">Enddatum</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={roadmapData.end_date}
                        onChange={(e) => setRoadmapData({ ...roadmapData, end_date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="milestones" className="space-y-4 mt-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Meilensteine definieren</h3>
                  <Button onClick={addMilestone} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Meilenstein hinzufügen
                  </Button>
                </div>

                {milestones.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Noch keine Meilensteine definiert</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {milestones.map((milestone, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-sm">Meilenstein {index + 1}</CardTitle>
                            <Button onClick={() => removeMilestone(index)} variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <Label>Titel</Label>
                            <Input
                              value={milestone.title}
                              onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                              placeholder="Meilenstein-Titel"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Beschreibung</Label>
                            <Textarea
                              value={milestone.description}
                              onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                              placeholder="Beschreibung des Meilensteins"
                              rows={2}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-2">
                              <Label>Status</Label>
                              <Select
                                value={milestone.status}
                                onValueChange={(value) => updateMilestone(index, 'status', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="planned">Geplant</SelectItem>
                                  <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                                  <SelectItem value="completed">Abgeschlossen</SelectItem>
                                  <SelectItem value="delayed">Verzögert</SelectItem>
                                  <SelectItem value="cancelled">Abgebrochen</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Priorität</Label>
                              <Select
                                value={milestone.priority}
                                onValueChange={(value) => updateMilestone(index, 'priority', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Niedrig</SelectItem>
                                  <SelectItem value="medium">Mittel</SelectItem>
                                  <SelectItem value="high">Hoch</SelectItem>
                                  <SelectItem value="critical">Kritisch</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Zieldatum</Label>
                              <Input
                                type="date"
                                value={milestone.target_date}
                                onChange={(e) => updateMilestone(index, 'target_date', e.target.value)}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="goals" className="space-y-4 mt-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Strategische Ziele definieren</h3>
                  <Button onClick={addGoal} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Ziel hinzufügen
                  </Button>
                </div>

                {goals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Noch keine Ziele definiert</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {goals.map((goal, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-sm">Ziel {index + 1}</CardTitle>
                            <Button onClick={() => removeGoal(index)} variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <Label>Titel</Label>
                            <Input
                              value={goal.title}
                              onChange={(e) => updateGoal(index, 'title', e.target.value)}
                              placeholder="Ziel-Titel"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Beschreibung</Label>
                            <Textarea
                              value={goal.description}
                              onChange={(e) => updateGoal(index, 'description', e.target.value)}
                              placeholder="Beschreibung des Ziels"
                              rows={2}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Erfolgskriterien</Label>
                            <Textarea
                              value={goal.success_criteria}
                              onChange={(e) => updateGoal(index, 'success_criteria', e.target.value)}
                              placeholder="Wann ist dieses Ziel erreicht?"
                              rows={2}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-2">
                              <Label>Status</Label>
                              <Select
                                value={goal.status}
                                onValueChange={(value) => updateGoal(index, 'status', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Aktiv</SelectItem>
                                  <SelectItem value="completed">Abgeschlossen</SelectItem>
                                  <SelectItem value="archived">Archiviert</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Priorität</Label>
                              <Select
                                value={goal.priority}
                                onValueChange={(value) => updateGoal(index, 'priority', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Niedrig</SelectItem>
                                  <SelectItem value="medium">Mittel</SelectItem>
                                  <SelectItem value="high">Hoch</SelectItem>
                                  <SelectItem value="critical">Kritisch</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Zieldatum</Label>
                              <Input
                                type="date"
                                value={goal.target_date}
                                onChange={(e) => updateGoal(index, 'target_date', e.target.value)}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="projects" className="space-y-4 mt-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Projekte definieren</h3>
                  <Button onClick={addProject} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Projekt hinzufügen
                  </Button>
                </div>

                {projects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Noch keine Projekte definiert</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-sm">Projekt {index + 1}</CardTitle>
                            <Button onClick={() => removeProject(index)} variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                              value={project.name}
                              onChange={(e) => updateProject(index, 'name', e.target.value)}
                              placeholder="Projekt-Name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Beschreibung</Label>
                            <Textarea
                              value={project.description}
                              onChange={(e) => updateProject(index, 'description', e.target.value)}
                              placeholder="Beschreibung des Projekts"
                              rows={2}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-2">
                              <Label>Status</Label>
                              <Select
                                value={project.status}
                                onValueChange={(value) => updateProject(index, 'status', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Ausstehend</SelectItem>
                                  <SelectItem value="active">Aktiv</SelectItem>
                                  <SelectItem value="completed">Abgeschlossen</SelectItem>
                                  <SelectItem value="archived">Archiviert</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Priorität</Label>
                              <Select
                                value={project.priority}
                                onValueChange={(value) => updateProject(index, 'priority', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Niedrig</SelectItem>
                                  <SelectItem value="medium">Mittel</SelectItem>
                                  <SelectItem value="high">Hoch</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Fälligkeitsdatum</Label>
                              <Input
                                type="date"
                                value={project.dueDate}
                                onChange={(e) => updateProject(index, 'dueDate', e.target.value)}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4 mt-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Aufgaben definieren</h3>
                  <Button onClick={addTask} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Aufgabe hinzufügen
                  </Button>
                </div>

                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Noch keine Aufgaben definiert</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-sm">Aufgabe {index + 1}</CardTitle>
                            <Button onClick={() => removeTask(index)} variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <Label>Titel</Label>
                            <Input
                              value={task.title}
                              onChange={(e) => updateTask(index, 'title', e.target.value)}
                              placeholder="Aufgaben-Titel"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Beschreibung</Label>
                            <Textarea
                              value={task.description}
                              onChange={(e) => updateTask(index, 'description', e.target.value)}
                              placeholder="Beschreibung der Aufgabe"
                              rows={2}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-2">
                              <Label>Status</Label>
                              <Select
                                value={task.status}
                                onValueChange={(value) => updateTask(index, 'status', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="todo">Zu erledigen</SelectItem>
                                  <SelectItem value="in-progress">In Bearbeitung</SelectItem>
                                  <SelectItem value="review">Überprüfung</SelectItem>
                                  <SelectItem value="done">Erledigt</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Priorität</Label>
                              <Select
                                value={task.priority}
                                onValueChange={(value) => updateTask(index, 'priority', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Niedrig</SelectItem>
                                  <SelectItem value="medium">Mittel</SelectItem>
                                  <SelectItem value="high">Hoch</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Fälligkeitsdatum</Label>
                              <Input
                                type="date"
                                value={task.dueDate}
                                onChange={(e) => updateTask(index, 'dueDate', e.target.value)}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className="p-6 pt-0">
          <div className="flex justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {milestones.length} Meilensteine, {goals.length} Ziele, {projects.length} Projekte, {tasks.length} Aufgaben
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Abbrechen
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || !roadmapData.title.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? 'Wird erstellt...' : 'Roadmap erstellen'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};