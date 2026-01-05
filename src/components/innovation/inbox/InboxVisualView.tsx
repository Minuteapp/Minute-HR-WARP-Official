import React, { useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Inbox, Sparkles, ArrowRight, Eye, X, Package, Target } from 'lucide-react';
import { IdeaToProjectDialog } from '../dialogs/IdeaToProjectDialog';
import { EnhancedIdeaEditDialog } from '../dialogs/EnhancedIdeaEditDialog';
import { useToast } from '@/hooks/use-toast';
import { DragItem, DropZone, useDragAndDrop } from '@/hooks/useDragAndDrop';
import { DragAndDropContainer, DraggableItem, DropZoneContainer } from '@/components/time-settings/DragAndDropContainer';
import { IdeaRatingView } from '../rating/IdeaRatingView';

interface InboxIdea {
  id: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  submitter_id: string;
  submitted_at: string;
  status: 'pending' | 'analyzed' | 'rejected' | 'moved_to_main';
  ai_analysis_triggered: boolean;
  ai_analysis_completed: boolean;
  priority_score: number;
}

interface Container {
  id: string;
  title: string;
  description: string;
  ideaCount: number;
}

// Theme Containers/Topics for organizing ideas
const THEME_CONTAINERS = [
  { 
    id: 'digital-transformation', 
    title: 'Digitale Transformation', 
    description: 'KI, Automation & Digitale Prozesse',
    color: '#3B82F6',
    ideas: [] as InboxIdea[]
  },
  { 
    id: 'process-optimization', 
    title: 'Prozessoptimierung', 
    description: 'Effizienz & Workflow-Verbesserungen',
    color: '#10B981',
    ideas: [] as InboxIdea[]
  },
  { 
    id: 'customer-experience', 
    title: 'Kundenerfahrung', 
    description: 'UX/UI & Kundenservice-Innovation',
    color: '#F59E0B',
    ideas: [] as InboxIdea[]
  },
  { 
    id: 'sustainability', 
    title: 'Nachhaltigkeit', 
    description: 'Umwelt & nachhaltige Lösungen',
    color: '#8B5CF6',
    ideas: [] as InboxIdea[]
  },
  { 
    id: 'technology', 
    title: 'Technologie', 
    description: 'Hardware, Software & IT-Innovation',
    color: '#06B6D4',
    ideas: [] as InboxIdea[]
  },
  { 
    id: 'business-model', 
    title: 'Geschäftsmodell', 
    description: 'Neue Geschäftskonzepte & Strategien',
    color: '#EF4444',
    ideas: [] as InboxIdea[]
  }
];

interface InboxVisualViewProps {
  ideas: InboxIdea[];
  onAnalyze: (idea: InboxIdea) => void;
  onMoveToMain: (idea: InboxIdea) => void;
  onEditIdea: (idea: InboxIdea, updates: Partial<InboxIdea>) => void;
  onVote?: (ideaId: string, voteType: 'upvote' | 'downvote') => Promise<void>;
  onComment?: (ideaId: string, comment: string) => Promise<void>;
}

interface ThemeContainer {
  id: string;
  title: string;
  description: string;
  color: string;
  ideas: InboxIdea[];
}

export const InboxVisualView: React.FC<InboxVisualViewProps> = ({ 
  ideas, 
  onAnalyze, 
  onMoveToMain, 
  onEditIdea,
  onVote,
  onComment
}) => {
  const { toast } = useToast();
  const [themeContainers, setThemeContainers] = useState<ThemeContainer[]>(THEME_CONTAINERS);
  const [selectedContainer, setSelectedContainer] = useState<ThemeContainer | null>(null);
  const [showIdeaDetails, setShowIdeaDetails] = useState<InboxIdea | null>(null);
  const [newContainerName, setNewContainerName] = useState('');
  const [newContainerDesc, setNewContainerDesc] = useState('');
  const [showNewContainerDialog, setShowNewContainerDialog] = useState(false);
  const [editingIdea, setEditingIdea] = useState<InboxIdea | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '' });
  const [ideaToProject, setIdeaToProject] = useState<InboxIdea | null>(null);
  const [enhancedEditIdea, setEnhancedEditIdea] = useState<InboxIdea | null>(null);

  // Distribute ideas into containers based on category
  useEffect(() => {
    const containersWithIdeas = themeContainers.map(container => ({
      ...container,
      ideas: ideas.filter(idea => 
        idea.category === container.title || 
        (idea.category && idea.category.toLowerCase().includes(container.title.toLowerCase()))
      )
    }));
    setThemeContainers(containersWithIdeas);
  }, [ideas]);

  const handleDragStart = (item: DragItem) => {
    // Visual feedback when drag starts
  };

  const handleDrop = (dragItem: DragItem, dropZone: DropZone) => {
    if (dragItem.type === 'idea' && dropZone.type === 'theme-container') {
      const idea = dragItem.data as InboxIdea;
      const containerId = dropZone.id;
      const container = themeContainers.find(c => c.id === containerId);
      
      if (container && idea) {
        onEditIdea(idea, { 
          category: container.title,
          status: 'analyzed'
        });
        
        toast({
          title: "Idee zugewiesen",
          description: `"${idea.title}" wurde zu "${container.title}" hinzugefügt.`
        });
      }
    }
  };

  const handleContainerClick = (container: ThemeContainer) => {
    setSelectedContainer(container);
  };

  const handleIdeaClick = (idea: InboxIdea) => {
    setEditingIdea(idea);
    setEditForm({
      title: idea.title,
      description: idea.description || '',
      category: idea.category || ''
    });
  };

  const handleSaveEdit = () => {
    if (editingIdea) {
      onEditIdea(editingIdea, editForm);
      setEditingIdea(null);
      toast({
        title: "Idee aktualisiert",
        description: "Die Änderungen wurden gespeichert."
      });
    }
  };

  const removeIdeaFromContainer = (idea: InboxIdea, containerId: string) => {
    onEditIdea(idea, { 
      category: undefined,
      status: 'pending' 
    });
    
    toast({
      title: "Idee entfernt",
      description: `"${idea.title}" wurde aus dem Container entfernt.`
    });
  };

  const createNewContainer = () => {
    if (!newContainerName.trim()) return;

    const newContainer: ThemeContainer = {
      id: `container-${Date.now()}`,
      title: newContainerName,
      description: newContainerDesc || 'Neuer Themen-Container',
      color: '#6B7280',
      ideas: []
    };

    setThemeContainers(prev => [...prev, newContainer]);
    setNewContainerName('');
    setNewContainerDesc('');
    setShowNewContainerDialog(false);
    
    toast({
      title: "Container erstellt",
      description: `"${newContainerName}" wurde erfolgreich erstellt.`
    });
  };

  const pendingIdeas = ideas.filter(idea => idea.status === 'pending');

  return (
    <DragAndDropContainer className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">Visuelle Ideen-Organisation</h3>
          <p className="text-sm text-white/70">
            Ziehen Sie Ideen per Drag & Drop aus dem Posteingang in Themen-Container
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowNewContainerDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Container
        </Button>
      </div>

      {/* Posteingang Container */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Inbox className="h-5 w-5" />
            Posteingang
            <Badge variant="secondary" className="ml-auto">
              {pendingIdeas.length} Ideen
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {pendingIdeas.map((idea) => (
              <DraggableItem
                key={idea.id}
                item={{
                  id: idea.id,
                  type: 'idea',
                  data: idea
                }}
                onDragStart={handleDragStart}
                className="transform transition-all duration-200 hover:scale-105"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/90 backdrop-blur-sm rounded-lg p-3 cursor-move border hover:border-primary/50 hover:shadow-lg"
                  onClick={() => handleIdeaClick(idea)}
                >
                  <div className="text-sm font-medium text-gray-900 mb-1 truncate">
                    {idea.title}
                  </div>
                  <div className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {idea.description || 'Keine Beschreibung'}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {idea.status === 'pending' ? 'Neu' : idea.status}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowIdeaDetails(idea);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </DraggableItem>
            ))}
            {pendingIdeas.length === 0 && (
              <div className="col-span-full text-center py-8 text-white/60">
                <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Keine neuen Ideen im Posteingang</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Theme Containers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themeContainers.map((container) => (
          <DropZoneContainer
            key={container.id}
            zone={{
              id: container.id,
              type: 'theme-container',
              accepts: ['idea'],
              data: container
            }}
            onDrop={handleDrop}
            className="h-full"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full"
            >
              <Card 
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:border-white/40 transition-all cursor-pointer h-full"
                onClick={() => handleContainerClick(container)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: container.color }}
                      />
                      {container.title}
                    </div>
                    <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                      {container.ideas.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/70 mb-4">
                    {container.description}
                  </p>
                  <div className="space-y-2">
                    {container.ideas.slice(0, 3).map((idea) => (
                      <div
                        key={idea.id}
                        className="text-xs bg-white/20 rounded p-2 truncate text-white"
                      >
                        {idea.title}
                      </div>
                    ))}
                    {container.ideas.length > 3 && (
                      <div className="text-xs text-white/60 text-center">
                        +{container.ideas.length - 3} weitere
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </DropZoneContainer>
        ))}
      </div>

      {/* Container Details Dialog */}
      <Dialog open={!!selectedContainer} onOpenChange={() => setSelectedContainer(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: selectedContainer?.color }}
              />
              {selectedContainer?.title}
              <Badge variant="outline" className="ml-auto">
                {selectedContainer?.ideas.length} Ideen
              </Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedContainer && (
            <div className="space-y-4">
              <p className="text-muted-foreground">{selectedContainer.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedContainer.ideas.map((idea) => (
                  <DraggableItem
                    key={idea.id}
                    item={{
                      id: idea.id,
                      type: 'idea',
                      data: idea
                    }}
                    className="transform transition-all duration-200 hover:scale-105"
                  >
                    <Card className="cursor-move hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{idea.title}</h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => removeIdeaFromContainer(idea, selectedContainer.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {idea.description || 'Keine Beschreibung'}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            {idea.category || 'Unklassifiziert'}
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEnhancedEditIdea(idea)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Bearbeiten
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setIdeaToProject(idea)}
                            >
                              <Target className="h-3 w-3 mr-1" />
                              Zu Projekt
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </DraggableItem>
                ))}
                {selectedContainer.ideas.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Keine Ideen in diesem Container</p>
                    <p className="text-sm">Ziehen Sie Ideen hierher, um sie zu organisieren</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Container Dialog */}
      <Dialog open={showNewContainerDialog} onOpenChange={setShowNewContainerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neuen Themen-Container erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Container-Name eingeben..."
              value={newContainerName}
              onChange={(e) => setNewContainerName(e.target.value)}
            />
            <Textarea
              placeholder="Beschreibung (optional)..."
              value={newContainerDesc}
              onChange={(e) => setNewContainerDesc(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewContainerDialog(false)}>
                Abbrechen
              </Button>
              <Button onClick={createNewContainer} disabled={!newContainerName.trim()}>
                Erstellen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Idea Dialog */}
      <Dialog open={!!editingIdea} onOpenChange={() => setEditingIdea(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Idee bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Titel</label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Beschreibung</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Kategorie</label>
              <Input
                value={editForm.category}
                onChange={(e) => setEditForm({...editForm, category: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingIdea(null)}>Abbrechen</Button>
              <Button onClick={handleSaveEdit}>Speichern</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Idea Details/Rating Dialog */}
      {showIdeaDetails && onVote && onComment && (
        <IdeaRatingView
          idea={{
            id: showIdeaDetails.id,
            title: showIdeaDetails.title,
            description: showIdeaDetails.description,
            category: showIdeaDetails.category,
            status: showIdeaDetails.status
          }}
          onVote={onVote}
          onComment={onComment}
          onClose={() => setShowIdeaDetails(null)}
        />
      )}

      {/* Enhanced Edit Dialog */}
      {enhancedEditIdea && (
        <EnhancedIdeaEditDialog
          open={!!enhancedEditIdea}
          onOpenChange={(open) => !open && setEnhancedEditIdea(null)}
          idea={enhancedEditIdea}
          onSave={(updates) => {
            onEditIdea(enhancedEditIdea, updates);
            setEnhancedEditIdea(null);
          }}
        />
      )}

      {/* Idea to Project Dialog */}
      {ideaToProject && (
        <IdeaToProjectDialog
          open={!!ideaToProject}
          onOpenChange={(open) => !open && setIdeaToProject(null)}
          idea={ideaToProject}
          onSuccess={() => setIdeaToProject(null)}
        />
      )}
    </DragAndDropContainer>
  );
};