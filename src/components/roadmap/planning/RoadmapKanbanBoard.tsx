import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  MoreVertical,
  Calendar,
  Clock,
  Users,
  Edit,
  Trash2,
  CheckCircle,
  Circle,
  AlertCircle
} from 'lucide-react';
import { useRoadmapPlanning, RoadmapBoard, RoadmapContainer, RoadmapCard } from '@/hooks/roadmap/useRoadmapPlanning';
import { ContainerDetailDialog } from './ContainerDetailDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TaskProjectIntegration } from '../TaskProjectIntegration';

interface RoadmapKanbanBoardProps {
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

const StatusBadge = ({ status }: { status?: string }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'planned':
        return 'bg-gray-100 text-gray-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'done':
        return 'Fertig';
      case 'in_progress':
        return 'In Bearbeitung';
      case 'planned':
        return 'Geplant';
      case 'blocked':
        return 'Blockiert';
      default:
        return 'Unbekannt';
    }
  };

  return (
    <Badge className={getStatusColor(status)}>
      {getStatusLabel(status)}
    </Badge>
  );
};

const CardComponent = ({ 
  card, 
  onUpdate, 
  onDelete 
}: { 
  card: RoadmapCard; 
  onUpdate: (updates: Partial<RoadmapCard>) => void;
  onDelete: () => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [status, setStatus] = useState(card.status || 'planned');
  const [priority, setPriority] = useState(card.priority || 'medium');

  const handleSave = () => {
    onUpdate({
      title,
      description,
      status,
      priority
    });
    setIsEditing(false);
  };

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow cursor-grab">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-sm">{card.title}</h4>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Edit className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Karte bearbeiten</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Titel</Label>
                  <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Beschreibung</Label>
                  <Textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
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
                  <Select value={priority} onValueChange={setPriority}>
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
                <div className="flex gap-2">
                  <Button onClick={handleSave}>Speichern</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Abbrechen
                  </Button>
                  <Button variant="destructive" onClick={onDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Löschen
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {card.description && (
          <p className="text-xs text-muted-foreground mb-2">{card.description}</p>
        )}
        
        <div className="flex items-center gap-2 mb-2">
          <PriorityIcon priority={card.priority} />
          <StatusBadge status={card.status} />
        </div>
        
        {card.assigned_to && card.assigned_to.length > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Users className="h-3 w-3 text-muted-foreground" />
            <div className="flex -space-x-1">
              {card.assigned_to.slice(0, 3).map((userId, index) => (
                <Avatar key={index} className="h-5 w-5 border border-white">
                  <AvatarFallback className="text-xs">
                    {userId.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {card.assigned_to.length > 3 && (
                <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                  +{card.assigned_to.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
        
        {card.due_date && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(card.due_date).toLocaleDateString('de-DE')}
          </div>
        )}
        
        {card.estimated_hours && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Clock className="h-3 w-3" />
            {card.estimated_hours}h geschätzt
          </div>
        )}
        
        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {card.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ContainerColumn = ({ 
  container, 
  cards, 
  onUpdateCard, 
  onDeleteCard, 
  onCreateCard, 
  onUpdateContainer, 
  onDeleteContainer 
}: {
  container: RoadmapContainer;
  cards: RoadmapCard[];
  onUpdateCard: (cardId: string, updates: Partial<RoadmapCard>) => void;
  onDeleteCard: (cardId: string) => void;
  onCreateCard: (containerData: Omit<RoadmapCard, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdateContainer: (updates: Partial<RoadmapContainer>) => void;
  onDeleteContainer: () => void;
}) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isEditingContainer, setIsEditingContainer] = useState(false);
  const [containerTitle, setContainerTitle] = useState(container.title);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onCreateCard({
        container_id: container.id,
        title: newCardTitle,
        position: cards.length,
        status: 'planned',
        priority: 'medium'
      });
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  const handleUpdateContainer = () => {
    onUpdateContainer({
      title: containerTitle
    });
    setIsEditingContainer(false);
  };

  return (
    <>
      <Card 
        className="min-w-[300px] max-w-[350px] cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setShowDetailDialog(true)}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            {isEditingContainer ? (
              <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                <Input 
                  value={containerTitle}
                  onChange={(e) => setContainerTitle(e.target.value)}
                  className="h-8"
                />
                <Button size="sm" onClick={handleUpdateContainer}>
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: container.color || '#3B82F6' }}
                />
                <CardTitle 
                  className="text-base"
                  style={{ fontSize: `${container.font_size || 14}px` }}
                >
                  {container.title}
                </CardTitle>
              </div>
            )}
            
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Badge variant="secondary" className="text-xs">
                {cards.length}
              </Badge>
              {container.progress !== undefined && (
                <Badge variant="outline" className="text-xs">
                  {container.progress}%
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingContainer(true);
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteContainer();
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {container.description && (
            <p className="text-xs text-muted-foreground">{container.description}</p>
          )}
          
          {container.tags && container.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {container.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {container.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{container.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {cards.map((card) => (
            <CardComponent
              key={card.id}
              card={card}
              onUpdate={(updates) => onUpdateCard(card.id, updates)}
              onDelete={() => onDeleteCard(card.id)}
            />
          ))}
          
          {isAddingCard ? (
            <div className="space-y-2">
              <Input
                placeholder="Kartentitel eingeben..."
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCard()}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddCard}>
                  Hinzufügen
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsAddingCard(false)}>
                  Abbrechen
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setIsAddingCard(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Neue Karte
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
    
    <ContainerDetailDialog
      container={container}
      open={showDetailDialog}
      onOpenChange={setShowDetailDialog}
      onUpdateContainer={onUpdateContainer}
    />
    </>
  );
};

export const RoadmapKanbanBoard = ({ roadmapId }: RoadmapKanbanBoardProps) => {
  const { toast } = useToast();
  const {
    boards,
    containers,
    cards,
    isLoading,
    createBoard,
    createContainer,
    createCard,
    updateCard,
    updateContainer,
    deleteContainer,
    deleteCard
  } = useRoadmapPlanning(roadmapId);

  const [isCreatingContainer, setIsCreatingContainer] = useState(false);
  const [newContainerTitle, setNewContainerTitle] = useState('');
  const [selectedBoard, setSelectedBoard] = useState<RoadmapBoard | null>(null);

  // Default Board erstellen falls keines existiert
  React.useEffect(() => {
    if (!isLoading && boards.length === 0 && roadmapId) {
      // Prüfe zuerst ob die Roadmap existiert
      supabase
        .from('roadmaps')
        .select('id')
        .eq('id', roadmapId)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            console.error('Roadmap nicht gefunden:', roadmapId);
            toast({
              title: "Fehler",
              description: "Die ausgewählte Roadmap wurde nicht gefunden.",
              variant: "destructive",
            });
            return;
          }
          
          // Roadmap existiert, erstelle Board
          createBoard({
            roadmap_id: roadmapId,
            title: 'Hauptboard',
            description: 'Standard Planungsboard für diese Roadmap'
          }).then((board) => {
            setSelectedBoard(board);
          }).catch((error) => {
            console.error('Fehler beim Erstellen des Boards:', error);
          });
        });
    } else if (boards.length > 0 && !selectedBoard) {
      setSelectedBoard(boards[0]);
    }
  }, [boards, isLoading, roadmapId, createBoard]);

  const handleCreateContainer = () => {
    if (newContainerTitle.trim() && selectedBoard) {
      const position = containers.filter(c => c.board_id === selectedBoard.id).length;
      createContainer({
        board_id: selectedBoard.id,
        title: newContainerTitle,
        position
      });
      setNewContainerTitle('');
      setIsCreatingContainer(false);
    }
  };

  const boardContainers = selectedBoard 
    ? containers.filter(c => c.board_id === selectedBoard.id)
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Board wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selectedBoard && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{selectedBoard.title}</h3>
            {selectedBoard.description && (
              <p className="text-sm text-muted-foreground">{selectedBoard.description}</p>
            )}
          </div>
        </div>
      )}

      {/* Task & Project Integration */}
      <TaskProjectIntegration roadmapId={roadmapId} />

      <div className="flex gap-6 overflow-x-auto pb-4">
        {boardContainers.map((container) => {
          const containerCards = cards.filter(c => c.container_id === container.id);
          return (
            <ContainerColumn
              key={container.id}
              container={container}
              cards={containerCards}
              onUpdateCard={updateCard}
              onDeleteCard={deleteCard}
              onCreateCard={createCard}
              onUpdateContainer={(updates) => updateContainer(container.id, updates)}
              onDeleteContainer={() => deleteContainer(container.id)}
            />
          );
        })}
        
        {/* Container hinzufügen */}
        <Card className="min-w-[300px] max-w-[350px] border-dashed">
          <CardContent className="p-6">
            {isCreatingContainer ? (
              <div className="space-y-3">
                <Input
                  placeholder="Container-Name eingeben..."
                  value={newContainerTitle}
                  onChange={(e) => setNewContainerTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateContainer()}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCreateContainer}>
                    Erstellen
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsCreatingContainer(false)}>
                    Abbrechen
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="w-full h-full min-h-[100px]"
                onClick={() => setIsCreatingContainer(true)}
              >
                <Plus className="h-6 w-6 mr-2" />
                Neuer Container
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};