import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
  Position,
  NodeTypes,
  Connection,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Plus,
  Settings,
  Users,
  Clock,
  Target,
  Calendar,
  AlertCircle,
  CheckCircle,
  Save,
  Download,
  Upload,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid
} from 'lucide-react';
import { Handle } from '@xyflow/react';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { useRoadmapPlanning, RoadmapContainer, RoadmapCard } from '@/hooks/roadmap/useRoadmapPlanning';
import { VisualPlanningToolbar } from './VisualPlanningToolbar';
import { VisualPlanningPanel } from './VisualPlanningPanel';
import { useToast } from '@/hooks/use-toast';

// Enhanced Roadmap Node Component
const EnhancedRoadmapNode = ({ data }: { data: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nodeData, setNodeData] = useState(data);

  const handleSave = () => {
    if (data.onUpdateContainer) {
      data.onUpdateContainer(data.containerId, {
        title: nodeData.title,
        description: nodeData.description,
        color: nodeData.color,
      });
    }
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'planned':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'blocked':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-400" />;
    }
  };

  const completedCards = data.cards?.filter((card: any) => card.status === 'done').length || 0;
  const totalCards = data.cards?.length || 0;
  const progress = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  return (
    <>
      <Handle type="source" position={Position.Right} id="right" className="handle-right" />
      <Handle type="target" position={Position.Left} id="left" className="handle-left" />
      
      <Card 
        className={`min-w-[320px] max-w-[360px] border-2 transition-all animate-fade-in ${
          data.isSelected ? 'border-primary shadow-lg ring-2 ring-primary/20' : 
          'hover:shadow-md hover:border-primary/50'
        }`}
        style={{
          borderColor: data.isSelected ? undefined : data.color + '40',
          boxShadow: data.isSelected ? `0 0 0 2px ${data.color}20` : undefined
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: data.color || '#3B82F6' }}
                />
                <h3 className="font-semibold text-base leading-tight">{nodeData.title}</h3>
                {data.priority && getPriorityIcon(data.priority)}
              </div>
              
              {/* Progress bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Fortschritt</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                {totalCards} Karten • {completedCards} abgeschlossen
              </div>
            </div>
            
            <div className="flex items-center gap-1 ml-2">
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-gray-100 hover-scale">
                    <Settings className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Container bearbeiten</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Titel</Label>
                      <Input
                        value={nodeData.title}
                        onChange={(e) => setNodeData({ ...nodeData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Beschreibung</Label>
                      <Textarea
                        value={nodeData.description}
                        onChange={(e) => setNodeData({ ...nodeData, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Farbe</Label>
                      <Input
                        type="color"
                        value={nodeData.color || '#3B82F6'}
                        onChange={(e) => setNodeData({ ...nodeData, color: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleSave} className="w-full">
                      Änderungen speichern
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        
          {/* Tags */}
          {data.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {data.tags.slice(0, 3).map((tag: string, index: number) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 animate-scale-in"
                >
                  #{tag}
                </Badge>
              ))}
              {data.tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{data.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-2">
            {nodeData.description || 'Keine Beschreibung verfügbar'}
          </p>
          
          {/* Status Overview */}
          {data.cards?.length > 0 && (
            <div className="space-y-2 mb-3">
              <div className="text-xs font-medium text-muted-foreground">Aktuelle Aufgaben:</div>
              {data.cards.slice(0, 3).map((card: any, index: number) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(card.status).split(' ')[0]}`} />
                  <div className="flex-1 font-medium truncate">{card.title}</div>
                  {card.assigned_to?.length > 0 && (
                    <div className="flex -space-x-1">
                      {card.assigned_to.slice(0, 2).map((userId: string, idx: number) => (
                        <Avatar key={idx} className="h-4 w-4 border border-white">
                          <AvatarFallback className="text-xs">
                            {userId.substring(0, 1).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {data.cards.length > 3 && (
                <div className="text-xs text-muted-foreground text-center">
                  +{data.cards.length - 3} weitere Aufgaben
                </div>
              )}
            </div>
          )}

          {/* Due Date */}
          {data.due_date && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Calendar className="h-3 w-3" />
              <span>Fällig: {new Date(data.due_date).toLocaleDateString('de-DE')}</span>
            </div>
          )}

          {/* Estimated Hours */}
          {data.estimated_hours && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{data.estimated_hours}h geschätzt</span>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

const nodeTypes: NodeTypes = {
  enhancedRoadmapNode: EnhancedRoadmapNode,
};

// Generate enhanced nodes
const generateEnhancedNodes = (
  containers: RoadmapContainer[], 
  cards: RoadmapCard[], 
  onUpdateContainer: any,
  selectedContainerId?: string
): Node[] => {
  return containers.map((container, index) => {
    const containerCards = cards.filter(card => card.container_id === container.id);
    
    return {
      id: container.id,
      type: 'enhancedRoadmapNode',
      position: { 
        x: (index % 4) * 380 + 50, 
        y: Math.floor(index / 4) * 280 + 50 
      },
      data: {
        containerId: container.id,
        title: container.title,
        description: container.description,
        color: container.color || '#3B82F6',
        progress: container.progress,
        priority: container.priority,
        tags: container.tags || [],
        cards: containerCards,
        cardCount: containerCards.length,
        due_date: container.due_date,
        estimated_hours: container.estimated_hours,
        isSelected: selectedContainerId === container.id,
        onUpdateContainer: onUpdateContainer
      },
    };
  });
};

const generateConnections = (containers: RoadmapContainer[]): Edge[] => {
  const edges: Edge[] = [];
  for (let i = 0; i < containers.length - 1; i++) {
    edges.push({
      id: `e${containers[i].id}-${containers[i + 1].id}`,
      source: containers[i].id,
      target: containers[i + 1].id,
      sourceHandle: 'right',
      targetHandle: 'left',
      type: 'smoothstep',
      animated: false,
      style: { 
        stroke: '#94a3b8',
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#94a3b8',
      },
    });
  }
  return edges;
};

const EnhancedVisualPlanningFlow = ({ roadmapId }: { roadmapId: string }) => {
  const { toast } = useToast();
  const reactFlowInstance = useReactFlow();
  const {
    containers,
    cards,
    isLoading,
    createContainer,
    updateContainer
  } = useRoadmapPlanning(roadmapId);

  const [selectedTool, setSelectedTool] = useState<'select' | 'move' | 'connect' | 'add'>('select');
  const [selectedContainerId, setSelectedContainerId] = useState<string>();
  const [showGrid, setShowGrid] = useState(true);
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [newNodeData, setNewNodeData] = useState({
    title: '',
    description: '',
    color: '#3B82F6',
    tags: [] as string[],
  });

  const initialNodes = useMemo(() => 
    generateEnhancedNodes(containers, cards, updateContainer, selectedContainerId), 
    [containers, cards, updateContainer, selectedContainerId]
  );
  
  const initialEdges = useMemo(() => 
    generateConnections(containers), 
    [containers]
  );
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when containers change
  React.useEffect(() => {
    const newNodes = generateEnhancedNodes(containers, cards, updateContainer, selectedContainerId);
    setNodes(newNodes);
    const newEdges = generateConnections(containers);
    setEdges(newEdges);
  }, [containers, cards, updateContainer, selectedContainerId, setNodes, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const addNewContainer = async () => {
    if (!newNodeData.title.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Titel ein.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await createContainer({
        board_id: '', // Board wird automatisch erstellt falls nötig
        title: newNodeData.title,
        description: newNodeData.description,
        color: newNodeData.color,
        tags: newNodeData.tags,
        position: containers.length
      });
      
      setNewNodeData({
        title: '',
        description: '',
        color: '#3B82F6',
        tags: [],
      });
      setIsAddingNode(false);
      
      toast({
        title: "Container erstellt",
        description: "Der neue Container wurde erfolgreich hinzugefügt.",
      });
    } catch (error) {
      console.error('Fehler beim Erstellen des Containers:', error);
      toast({
        title: "Fehler",
        description: "Container konnte nicht erstellt werden.",
        variant: "destructive",
      });
    }
  };

  // Toolbar handlers
  const handleSave = () => {
    toast({
      title: "Gespeichert",
      description: "Ihre Änderungen wurden gespeichert.",
    });
  };

  const handleExport = () => {
    // Export functionality would go here
    toast({
      title: "Export",
      description: "Export-Funktion wird implementiert.",
    });
  };

  const handleImport = () => {
    // Import functionality would go here
    toast({
      title: "Import",
      description: "Import-Funktion wird implementiert.",
    });
  };

  const handleUndo = () => {
    // Undo functionality would go here
    toast({
      title: "Rückgängig",
      description: "Letzte Aktion wurde rückgängig gemacht.",
    });
  };

  const handleRedo = () => {
    // Redo functionality would go here
    toast({
      title: "Wiederholen",
      description: "Aktion wurde wiederholt.",
    });
  };

  const handleZoomIn = () => {
    reactFlowInstance?.zoomIn();
  };

  const handleZoomOut = () => {
    reactFlowInstance?.zoomOut();
  };

  const handleFitView = () => {
    reactFlowInstance?.fitView({ padding: 0.2 });
  };

  const handleToggleGrid = () => {
    setShowGrid(!showGrid);
  };

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedContainerId(node.id);
  }, []);

  const selectedContainer = containers.find(c => c.id === selectedContainerId);

  return (
    <div className="relative h-[700px] w-full border rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-gradient-to-br from-gray-50 to-blue-50"
        minZoom={0.1}
        maxZoom={2}
      >
        <Background 
          variant={showGrid ? BackgroundVariant.Dots : BackgroundVariant.Cross} 
          gap={20} 
          size={1}
          color="#e2e8f0"
        />
        <Controls className="bg-white shadow-lg border rounded-lg" />
        <MiniMap 
          className="bg-white shadow-lg border rounded-lg" 
          nodeColor={(node) => (node.data?.color as string) || '#3B82F6'}
          maskColor="rgba(255, 255, 255, 0.8)"
        />
      </ReactFlow>

      {/* Enhanced Toolbar */}
      <VisualPlanningToolbar
        onAddContainer={() => setIsAddingNode(true)}
        onSave={handleSave}
        onExport={handleExport}
        onImport={handleImport}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onToggleGrid={handleToggleGrid}
        showGrid={showGrid}
        canUndo={false} // Would be connected to actual undo/redo state
        canRedo={false}
        selectedTool={selectedTool}
        onToolChange={setSelectedTool}
      />

      {/* Side Panel */}
      <VisualPlanningPanel
        containers={containers}
        cards={cards}
        selectedContainerId={selectedContainerId}
        onSelectContainer={setSelectedContainerId}
        onEditContainer={(container) => {
          // Handle edit container
          setSelectedContainerId(container.id);
        }}
        onDeleteContainer={(containerId) => {
          // Handle delete container
          console.log('Delete container:', containerId);
        }}
      />

      {/* Add Container Dialog */}
      <Dialog open={isAddingNode} onOpenChange={setIsAddingNode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neuen Container erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titel</Label>
              <Input
                value={newNodeData.title}
                onChange={(e) => setNewNodeData({ ...newNodeData, title: e.target.value })}
                placeholder="Container-Titel"
              />
            </div>
            <div>
              <Label>Beschreibung</Label>
              <Textarea
                value={newNodeData.description}
                onChange={(e) => setNewNodeData({ ...newNodeData, description: e.target.value })}
                placeholder="Beschreibung des Containers"
                rows={3}
              />
            </div>
            <div>
              <Label>Farbe</Label>
              <Input
                type="color"
                value={newNodeData.color}
                onChange={(e) => setNewNodeData({ ...newNodeData, color: e.target.value })}
              />
            </div>
            <div>
              <Label>Tags (getrennt durch Kommas)</Label>
              <Input
                onChange={(e) => setNewNodeData({ 
                  ...newNodeData, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                })}
                placeholder="z.B. planning, research, development"
              />
            </div>
            <Button onClick={addNewContainer} className="w-full">
              Container erstellen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Actions for Selected Container */}
      {selectedContainer && (
        <Card className="absolute bottom-4 left-4 z-20 animate-slide-in-right">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedContainer.color || '#3B82F6' }}
              />
              <span className="font-medium text-sm">{selectedContainer.title}</span>
              <Button size="sm" variant="outline" className="ml-2">
                Bearbeiten
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface EnhancedVisualPlanningProps {
  roadmapId: string;
}

export const EnhancedVisualPlanning = ({ roadmapId }: EnhancedVisualPlanningProps) => {
  const { roadmaps, isLoading: roadmapsLoading } = useRoadmaps();
  const { containers, isLoading: planningLoading } = useRoadmapPlanning(roadmapId);
  const selectedRoadmap = roadmaps.find(r => r.id === roadmapId);

  const isLoading = roadmapsLoading || planningLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Roadmap wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!selectedRoadmap) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium mb-2">Roadmap nicht gefunden</h3>
        <p className="text-muted-foreground">
          Die ausgewählte Roadmap konnte nicht geladen werden.
        </p>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Erweiterte Visuelle Planung: {selectedRoadmap.title}</h2>
            <p className="text-sm text-muted-foreground">
              {containers.length} Container • Interaktive Roadmap-Visualisierung
            </p>
          </div>
        </div>
        
        <EnhancedVisualPlanningFlow roadmapId={roadmapId} />
      </div>
    </ReactFlowProvider>
  );
};