import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus,
  Users,
  MessageCircle,
  CheckSquare,
  Settings,
  Palette,
  Type,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  Tag,
  Trash2,
  Edit
} from 'lucide-react';
import { RoadmapContainer } from '@/hooks/roadmap/useRoadmapPlanning';
import { useRoadmapPlanningExtended } from '@/hooks/roadmap/useRoadmapPlanningExtended';

interface ContainerDetailDialogProps {
  container: RoadmapContainer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateContainer: (updates: Partial<RoadmapContainer>) => void;
}

export const ContainerDetailDialog = ({ 
  container, 
  open, 
  onOpenChange, 
  onUpdateContainer 
}: ContainerDetailDialogProps) => {
  const {
    subContainers,
    tasks,
    teamMembers,
    comments,
    isLoading,
    createSubContainer,
    createTask,
    inviteTeamMember,
    createComment,
    updateSubContainer,
    updateTask,
    deleteSubContainer,
    deleteTask
  } = useRoadmapPlanningExtended(container?.id);

  const [activeTab, setActiveTab] = useState('overview');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newSubContainerTitle, setNewSubContainerTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newTeamMemberEmail, setNewTeamMemberEmail] = useState('');
  const [fontSize, setFontSize] = useState(container?.font_size || 14);

  if (!container) return null;

  const handleCreateTask = async () => {
    if (newTaskTitle.trim()) {
      await createTask({
        container_id: container.id,
        title: newTaskTitle,
        position: tasks.filter(t => t.container_id === container.id).length,
        status: 'todo'
      });
      setNewTaskTitle('');
    }
  };

  const handleCreateSubContainer = async () => {
    if (newSubContainerTitle.trim()) {
      await createSubContainer({
        container_id: container.id,
        title: newSubContainerTitle,
        position: subContainers.length,
        status: 'planned'
      });
      setNewSubContainerTitle('');
      onUpdateContainer({ has_sub_containers: true });
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      await createComment({
        container_id: container.id,
        content: newComment,
        author_id: '' // Wird im Hook automatisch gesetzt
      });
      setNewComment('');
    }
  };

  const handleFontSizeChange = (newSize: number) => {
    setFontSize(newSize);
    onUpdateContainer({ font_size: newSize });
  };

  const toggleSubContainersVisibility = () => {
    const newVisibility = !container.sub_containers_visible;
    onUpdateContainer({ sub_containers_visible: newVisibility });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'done': return 'Fertig';
      case 'in_progress': return 'In Bearbeitung';
      case 'planned': return 'Geplant';
      case 'blocked': return 'Blockiert';
      default: return 'Unbekannt';
    }
  };

  const containerTasks = tasks.filter(t => t.container_id === container.id);
  const completedTasks = containerTasks.filter(t => t.status === 'done').length;
  const completedSubContainers = subContainers.filter(sc => sc.status === 'done').length;
  const totalProgress = subContainers.length > 0 
    ? Math.round((completedSubContainers / subContainers.length) * 100)
    : containerTasks.length > 0 
      ? Math.round((completedTasks / containerTasks.length) * 100)
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded" 
              style={{ backgroundColor: container.color || '#3B82F6' }}
            />
            {container.title}
            <Badge className={getStatusColor(container.status)}>
              {getStatusLabel(container.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="tasks">Aufgaben</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="comments">Kommentare</TabsTrigger>
            <TabsTrigger value="settings">Einstellungen</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label>Beschreibung</Label>
                <Textarea 
                  value={container.description || ''} 
                  onChange={(e) => onUpdateContainer({ description: e.target.value })}
                  placeholder="Container-Beschreibung..."
                />
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Fortschritt</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${totalProgress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{totalProgress}%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Aufgaben:</span>
                    <span className="ml-2">{completedTasks}/{containerTasks.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sub-Container:</span>
                    <span className="ml-2">{completedSubContainers}/{subContainers.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {subContainers.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Sub-Container</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSubContainersVisibility}
                    className="gap-2"
                  >
                    {container.sub_containers_visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {container.sub_containers_visible ? 'Ausblenden' : 'Einblenden'}
                  </Button>
                </div>
                {container.sub_containers_visible && (
                  <div className="space-y-2">
                    {subContainers.map((subContainer) => (
                      <div key={subContainer.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(subContainer.status)}>
                            {getStatusLabel(subContainer.status)}
                          </Badge>
                          <span>{subContainer.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateSubContainer(subContainer.id, { 
                              status: subContainer.status === 'done' ? 'planned' : 'done' 
                            })}
                          >
                            <CheckSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSubContainer(subContainer.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Input
                placeholder="Neuer Sub-Container..."
                value={newSubContainerTitle}
                onChange={(e) => setNewSubContainerTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateSubContainer()}
              />
              <Button onClick={handleCreateSubContainer}>
                <Plus className="h-4 w-4 mr-2" />
                Sub-Container
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="Neue Aufgabe..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
              />
              <Button onClick={handleCreateTask}>
                <Plus className="h-4 w-4 mr-2" />
                Aufgabe
              </Button>
            </div>
            
            <div className="space-y-2">
              {containerTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateTask(task.id, { 
                        status: task.status === 'done' ? 'todo' : 'done' 
                      })}
                    >
                      <CheckSquare className={`h-4 w-4 ${task.status === 'done' ? 'text-green-600' : 'text-gray-400'}`} />
                    </Button>
                    <span className={task.status === 'done' ? 'line-through text-muted-foreground' : ''}>
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.due_date && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(task.due_date).toLocaleDateString('de-DE')}
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="E-Mail-Adresse..."
                value={newTeamMemberEmail}
                onChange={(e) => setNewTeamMemberEmail(e.target.value)}
              />
              <Button onClick={() => {
                if (newTeamMemberEmail.trim()) {
                  // TODO: Hier würde die User-ID basierend auf der E-Mail gesucht
                  setNewTeamMemberEmail('');
                }
              }}>
                <Users className="h-4 w-4 mr-2" />
                Einladen
              </Button>
            </div>
            
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 border rounded">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {member.user_id.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{member.user_id}</div>
                    <div className="text-sm text-muted-foreground">{member.role}</div>
                  </div>
                  <Badge variant={member.status === 'accepted' ? 'default' : 'secondary'}>
                    {member.status}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <div className="flex gap-3">
              <Textarea
                placeholder="Kommentar hinzufügen..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
              />
              <Button onClick={handleAddComment}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Hinzufügen
              </Button>
            </div>
            
            <div className="space-y-3">
              {comments.filter(c => c.container_id === container.id).map((comment) => (
                <div key={comment.id} className="p-3 border rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {comment.author_id.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {comment.created_at && new Date(comment.created_at).toLocaleString('de-DE')}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label>Status</Label>
                <Select 
                  value={container.status || 'planned'} 
                  onValueChange={(value) => onUpdateContainer({ status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Geplant</SelectItem>
                    <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                    <SelectItem value="done">Fertig</SelectItem>
                    <SelectItem value="blocked">Blockiert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Priorität</Label>
                <Select 
                  value={container.priority || 'medium'} 
                  onValueChange={(value) => onUpdateContainer({ priority: value })}
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
              
              <div>
                <Label className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Schriftgröße: {fontSize}px
                </Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFontSizeChange(Math.max(8, fontSize - 2))}
                  >
                    -
                  </Button>
                  <Input
                    type="range"
                    min="8"
                    max="72"
                    value={fontSize}
                    onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFontSizeChange(Math.min(72, fontSize + 2))}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div>
                <Label>Farbe</Label>
                <div className="flex gap-2">
                  {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded border-2"
                      style={{ 
                        backgroundColor: color,
                        borderColor: container.color === color ? '#000' : 'transparent'
                      }}
                      onClick={() => onUpdateContainer({ color })}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label>Deadline</Label>
                <Input
                  type="date"
                  value={container.due_date || ''}
                  onChange={(e) => onUpdateContainer({ due_date: e.target.value })}
                />
              </div>

              <div>
                <Label>Geschätzte Stunden</Label>
                <Input
                  type="number"
                  value={container.estimated_hours || ''}
                  onChange={(e) => onUpdateContainer({ estimated_hours: Number(e.target.value) })}
                  placeholder="Stunden..."
                />
              </div>
            </div>
            
            <div>
              <Label>Tags</Label>
              <Input
                value={container.tags?.join(', ') || ''}
                onChange={(e) => onUpdateContainer({ tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="Tag1, Tag2, Tag3..."
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};