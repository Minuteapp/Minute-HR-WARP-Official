import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Route, X, Plus, Folder, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { useProjects } from '@/hooks/projects/useProjects';
import { useTasksStore } from '@/stores/tasks/useTasksStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RoadmapCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoadmapCreationDialog = ({ isOpen, onClose }: RoadmapCreationDialogProps) => {
  const { createRoadmap } = useRoadmaps();
  const { projects } = useProjects();
  const { tasks, fetchTasks } = useTasksStore();

  // Lade Aufgaben beim Öffnen des Dialogs
  React.useEffect(() => {
    if (isOpen) {
      fetchTasks();
    }
  }, [isOpen, fetchTasks]);
  const [activeTab, setActiveTab] = useState('basic');
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    vision: '',
    mission: '',
    status: 'draft' as const,
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
    selectedProjects: [] as string[],
    selectedTasks: [] as string[],
    newProject: {
      name: '',
      description: '',
      priority: 'medium' as const,
    },
    newTask: {
      title: '',
      description: '',
      priority: 'medium' as const,
      dueDate: undefined as Date | undefined,
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      // Erstelle zuerst die Roadmap
      const roadmapResult = await createRoadmap.mutateAsync({
        title: formData.title,
        description: formData.description || undefined,
        vision: formData.vision || undefined,
        mission: formData.mission || undefined,
        status: formData.status,
        priority: 'medium',
        start_date: formData.start_date?.toISOString().split('T')[0] || '',
        end_date: formData.end_date?.toISOString().split('T')[0] || '',
      });

      const roadmapId = roadmapResult.id;

      // Erstelle neue Projekte falls angegeben
      if (formData.newProject.name.trim()) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error: projectError } = await supabase
            .from('projects')
            .insert({
              name: formData.newProject.name,
              description: formData.newProject.description || '',
              priority: formData.newProject.priority,
              status: 'planning',
              owner_id: user.id,
              metadata: { created_from_roadmap: roadmapId }
            });
          
          if (projectError) {
            console.error('Fehler beim Erstellen des Projekts:', projectError);
            toast.error('Projekt konnte nicht erstellt werden');
          } else {
            toast.success('Neues Projekt erfolgreich erstellt');
          }
        }
      }

      // Erstelle neue Aufgaben falls angegeben
      if (formData.newTask.title.trim()) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error: taskError } = await supabase
            .from('tasks')
            .insert({
              title: formData.newTask.title,
              description: formData.newTask.description || '',
              priority: formData.newTask.priority,
              status: 'todo',
              assigned_to: user.id,
              due_date: formData.newTask.dueDate?.toISOString().split('T')[0],
              metadata: { created_from_roadmap: roadmapId }
            });
          
          if (taskError) {
            console.error('Fehler beim Erstellen der Aufgabe:', taskError);
            toast.error('Aufgabe konnte nicht erstellt werden');
          } else {
            toast.success('Neue Aufgabe erfolgreich erstellt');
          }
        }
      }

      // Verknüpfe ausgewählte bestehende Projekte und Aufgaben mit der Roadmap
      if (formData.selectedProjects.length > 0 || formData.selectedTasks.length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const links = [];
          
          // Projektverknüpfungen
          for (const projectId of formData.selectedProjects) {
            links.push({
              roadmap_id: roadmapId,
              linked_type: 'project',
              linked_id: projectId,
              created_by: user.id
            });
          }
          
          // Aufgabenverknüpfungen
          for (const taskId of formData.selectedTasks) {
            links.push({
              roadmap_id: roadmapId,
              linked_type: 'task',
              linked_id: taskId,
              created_by: user.id
            });
          }

          if (links.length > 0) {
            const { error: linkError } = await supabase
              .from('roadmap_links')
              .insert(links);
            
            if (linkError) {
              console.error('Fehler beim Verknüpfen:', linkError);
              toast.error('Verknüpfungen konnten nicht erstellt werden');
            } else {
              toast.success(`${links.length} Verknüpfungen erfolgreich erstellt`);
            }
          }
        }
      }
      
      // Reset form and close dialog
      setFormData({
        title: '',
        description: '',
        vision: '',
        mission: '',
        status: 'draft',
        start_date: undefined,
        end_date: undefined,
        selectedProjects: [],
        selectedTasks: [],
        newProject: { name: '', description: '', priority: 'medium' },
        newTask: { title: '', description: '', priority: 'medium', dueDate: undefined }
      });
      setActiveTab('basic');
      onClose();
    } catch (error) {
      console.error('Error creating roadmap:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Route className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle>Neue Roadmap erstellen</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Grunddaten</TabsTrigger>
                <TabsTrigger value="projects">Projekte</TabsTrigger>
                <TabsTrigger value="tasks">Aufgaben</TabsTrigger>
              </TabsList>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titel *</Label>
                    <Input
                      id="title"
                      placeholder="Roadmap-Titel eingeben"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Entwurf</SelectItem>
                        <SelectItem value="active">Aktiv</SelectItem>
                        <SelectItem value="archived">Archiviert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea
                    id="description"
                    placeholder="Entwicklung neuer Features für das Jahr 2025"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vision">Vision</Label>
                  <Textarea
                    id="vision"
                    placeholder="Führende Position im Markt erreichen"
                    value={formData.vision}
                    onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mission">Mission</Label>
                  <Textarea
                    id="mission"
                    placeholder="Innovative Lösungen für unsere Kunden entwickeln"
                    value={formData.mission}
                    onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Startdatum</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.start_date ? format(formData.start_date, 'dd.MM.yyyy', { locale: de }) : 'Datum auswählen'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.start_date}
                          onSelect={(date) => setFormData({ ...formData, start_date: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Enddatum</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.end_date ? format(formData.end_date, 'dd.MM.yyyy', { locale: de }) : 'Datum auswählen'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.end_date}
                          onSelect={(date) => setFormData({ ...formData, end_date: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="projects" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Projekte verknüpfen</h3>
                    <p className="text-sm text-muted-foreground">Wählen Sie bestehende Projekte aus oder erstellen Sie neue</p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowNewProjectForm(!showNewProjectForm)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Neues Projekt
                  </Button>
                </div>

                {showNewProjectForm && (
                  <Card className="border-dashed">
                    <CardHeader>
                      <CardTitle className="text-base">Neues Projekt erstellen</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Projektname</Label>
                        <Input
                          placeholder="Name des neuen Projekts"
                          value={formData.newProject.name}
                          onChange={(e) => setFormData({
                            ...formData,
                            newProject: { ...formData.newProject, name: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Beschreibung</Label>
                        <Textarea
                          placeholder="Projektbeschreibung"
                          value={formData.newProject.description}
                          onChange={(e) => setFormData({
                            ...formData,
                            newProject: { ...formData.newProject, description: e.target.value }
                          })}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Priorität</Label>
                        <Select 
                          value={formData.newProject.priority} 
                          onValueChange={(value: any) => setFormData({
                            ...formData,
                            newProject: { ...formData.newProject, priority: value }
                          })}
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
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Folder className="h-4 w-4" />
                      Bestehende Projekte ({projects.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {projects.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Keine Projekte verfügbar. Erstellen Sie zunächst ein neues Projekt.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {projects.map((project) => (
                          <div key={project.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`project-${project.id}`}
                              checked={formData.selectedProjects.includes(project.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({
                                    ...formData,
                                    selectedProjects: [...formData.selectedProjects, project.id]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    selectedProjects: formData.selectedProjects.filter(id => id !== project.id)
                                  });
                                }
                              }}
                            />
                            <div className="flex-1">
                              <label htmlFor={`project-${project.id}`} className="text-sm font-medium cursor-pointer">
                                {project.name}
                              </label>
                              <p className="text-xs text-muted-foreground">{project.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {project.status}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {project.priority}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Aufgaben zuweisen</h3>
                    <p className="text-sm text-muted-foreground">Bestehende Aufgaben verknüpfen oder neue erstellen</p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowNewTaskForm(!showNewTaskForm)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Neue Aufgabe
                  </Button>
                </div>

                {showNewTaskForm && (
                  <Card className="border-dashed">
                    <CardHeader>
                      <CardTitle className="text-base">Neue Aufgabe erstellen</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Aufgabentitel</Label>
                        <Input
                          placeholder="Titel der neuen Aufgabe"
                          value={formData.newTask.title}
                          onChange={(e) => setFormData({
                            ...formData,
                            newTask: { ...formData.newTask, title: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Beschreibung</Label>
                        <Textarea
                          placeholder="Aufgabenbeschreibung"
                          value={formData.newTask.description}
                          onChange={(e) => setFormData({
                            ...formData,
                            newTask: { ...formData.newTask, description: e.target.value }
                          })}
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Priorität</Label>
                          <Select 
                            value={formData.newTask.priority} 
                            onValueChange={(value: any) => setFormData({
                              ...formData,
                              newTask: { ...formData.newTask, priority: value }
                            })}
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
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.newTask.dueDate ? format(formData.newTask.dueDate, 'dd.MM.yyyy', { locale: de }) : 'Datum auswählen'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={formData.newTask.dueDate}
                                onSelect={(date) => setFormData({
                                  ...formData,
                                  newTask: { ...formData.newTask, dueDate: date }
                                })}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckSquare className="h-4 w-4" />
                      Bestehende Aufgaben ({tasks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Keine Aufgaben verfügbar. Erstellen Sie zunächst eine neue Aufgabe.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {tasks.filter(task => task.status !== 'deleted' && task.status !== 'archived').map((task) => (
                          <div key={task.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`task-${task.id}`}
                              checked={formData.selectedTasks.includes(task.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({
                                    ...formData,
                                    selectedTasks: [...formData.selectedTasks, task.id]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    selectedTasks: formData.selectedTasks.filter(id => id !== task.id)
                                  });
                                }
                              }}
                            />
                            <div className="flex-1">
                              <label htmlFor={`task-${task.id}`} className="text-sm font-medium cursor-pointer">
                                {task.title}
                              </label>
                              <p className="text-xs text-muted-foreground">{task.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {task.status}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {task.priority}
                                </Badge>
                                {task.dueDate && (
                                  <Badge variant="outline" className="text-xs">
                                    {format(new Date(task.dueDate), 'dd.MM.yyyy')}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Abbrechen
                </Button>
                <Button type="submit" disabled={!formData.title.trim() || isSubmitting} className="bg-primary hover:bg-primary/90">
                  {isSubmitting ? 'Wird erstellt...' : 'Roadmap erstellen'}
                </Button>
              </div>
            </form>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};