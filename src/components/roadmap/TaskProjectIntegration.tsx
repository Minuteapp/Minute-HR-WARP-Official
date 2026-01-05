import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Target, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { useTasksStore } from '@/stores/useTasksStore';
import { useProjects } from '@/hooks/projects/useProjects';
import { useRoadmapPlanning, RoadmapContainer } from '@/hooks/roadmap/useRoadmapPlanning';
import { Task } from '@/types/tasks';
import { Project } from '@/types/project.types';

interface TaskProjectIntegrationProps {
  roadmapId: string;
}

const PriorityIcon = ({ priority }: { priority?: string }) => {
  switch (priority) {
    case 'high':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'medium':
      return <Circle className="h-4 w-4 text-yellow-500" />;
    case 'low':
      return <Circle className="h-4 w-4 text-green-500" />;
    default:
      return <Circle className="h-4 w-4 text-gray-400" />;
  }
};

const StatusBadge = ({ status, type }: { status?: string; type: 'task' | 'project' }) => {
  const getStatusColor = (status?: string, type?: string) => {
    if (type === 'task') {
      switch (status) {
        case 'done':
          return 'bg-green-100 text-green-800';
        case 'in_progress':
          return 'bg-blue-100 text-blue-800';
        case 'todo':
          return 'bg-gray-100 text-gray-800';
        case 'blocked':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    } else {
      switch (status) {
        case 'completed':
          return 'bg-green-100 text-green-800';
        case 'active':
          return 'bg-blue-100 text-blue-800';
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'cancelled':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
  };

  const getStatusLabel = (status?: string, type?: string) => {
    if (type === 'task') {
      switch (status) {
        case 'done':
          return 'Fertig';
        case 'in_progress':
          return 'In Bearbeitung';
        case 'todo':
          return 'Zu erledigen';
        case 'blocked':
          return 'Blockiert';
        default:
          return 'Unbekannt';
      }
    } else {
      switch (status) {
        case 'completed':
          return 'Abgeschlossen';
        case 'active':
          return 'Aktiv';
        case 'pending':
          return 'Ausstehend';
        case 'cancelled':
          return 'Abgebrochen';
        default:
          return 'Unbekannt';
      }
    }
  };

  return (
    <Badge className={getStatusColor(status, type)}>
      {getStatusLabel(status, type)}
    </Badge>
  );
};

const IntegratedContainer = ({ 
  item, 
  type, 
  onAddToRoadmap 
}: { 
  item: Task | Project; 
  type: 'task' | 'project';
  onAddToRoadmap: (item: Task | Project, type: 'task' | 'project') => void;
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {type === 'task' ? (
              <Target className="h-4 w-4 text-blue-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            <CardTitle className="text-sm">
              {type === 'task' ? (item as Task).title : (item as Project).name}
            </CardTitle>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onAddToRoadmap(item, type)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Zur Roadmap
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {type === 'task' ? (item as Task).description : (item as Project).description}
          </p>
          
          <div className="flex items-center gap-2">
            <PriorityIcon priority={item.priority} />
            <StatusBadge status={item.status} type={type} />
          </div>
          
          {type === 'project' && (item as Project).progress && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Fortschritt</span>
                <span>{(item as Project).progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(item as Project).progress}%` }}
                />
              </div>
            </div>
          )}
          
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {(item.tags as string[]).slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {(item.tags as string[]).length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{(item.tags as string[]).length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const AddItemDialog = ({ 
  roadmapId, 
  onItemAdded 
}: { 
  roadmapId: string; 
  onItemAdded: () => void; 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const { tasks, fetchTasks } = useTasksStore();
  const { projects } = useProjects();
  const { boards, createContainer } = useRoadmapPlanning(roadmapId);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (boards.length > 0 && !selectedBoard) {
      setSelectedBoard(boards[0].id);
    }
  }, [boards, selectedBoard]);

  const handleAddToRoadmap = async (item: Task | Project, type: 'task' | 'project') => {
    if (!selectedBoard) return;

    try {
      const containerData = {
        board_id: selectedBoard,
        title: type === 'task' ? (item as Task).title : (item as Project).name,
        description: type === 'task' ? (item as Task).description : (item as Project).description,
        position: 0,
        color: type === 'task' ? '#3B82F6' : '#10B981',
        status: item.status,
        priority: item.priority,
        tags: item.tags as string[] || [],
        metadata: {
          source_type: type,
          source_id: item.id,
          original_item: item
        }
      };

      await createContainer(containerData);
      onItemAdded();
      setIsOpen(false);
    } catch (error) {
      console.error('Fehler beim Hinzufügen zur Roadmap:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Aufgaben & Projekte hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aufgaben und Projekte zur Roadmap hinzufügen</DialogTitle>
          <div className="mt-4">
            <Select value={selectedBoard} onValueChange={setSelectedBoard}>
              <SelectTrigger>
                <SelectValue placeholder="Board auswählen" />
              </SelectTrigger>
              <SelectContent>
                {boards.map((board) => (
                  <SelectItem key={board.id} value={board.id}>
                    {board.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          {/* Aufgaben Sektion */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Verfügbare Aufgaben
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks
                .filter(task => task.status !== 'archived' && task.status !== 'deleted')
                .slice(0, 10)
                .map((task) => (
                  <IntegratedContainer
                    key={task.id}
                    item={task}
                    type="task"
                    onAddToRoadmap={handleAddToRoadmap}
                  />
                ))}
            </div>
          </div>

          {/* Projekte Sektion */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Verfügbare Projekte
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects
                .filter(project => project.status !== 'archived')
                .slice(0, 10)
                .map((project) => (
                  <IntegratedContainer
                    key={project.id}
                    item={project}
                    type="project"
                    onAddToRoadmap={handleAddToRoadmap}
                  />
                ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const TaskProjectIntegration = ({ roadmapId }: TaskProjectIntegrationProps) => {
  const { refetch } = useRoadmapPlanning(roadmapId);

  const handleItemAdded = () => {
    refetch();
  };

  return (
    <div className="mb-4">
      <AddItemDialog roadmapId={roadmapId} onItemAdded={handleItemAdded} />
    </div>
  );
};