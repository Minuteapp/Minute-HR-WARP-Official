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
  EdgeTypes,
  Connection,
  useNodesState,
  useEdgesState,
  NodeChange,
  EdgeChange,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Plus,
  Users,
  Settings,
  Tag,
  Save,
  Download
} from 'lucide-react';
import { Handle } from '@xyflow/react';
import { useRoadmaps, Roadmap } from '@/hooks/useRoadmaps';
import { useRoadmapPlanning, RoadmapContainer, RoadmapCard } from '@/hooks/roadmap/useRoadmapPlanning';
import { TaskProjectIntegration } from './TaskProjectIntegration';

// Custom Node Component mit echten Container-Daten
const RoadmapNode = ({ data }: { data: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nodeData, setNodeData] = useState(data);

  const handleSave = () => {
    // Container-Update über die onUpdateContainer Funktion aus den Props
    if (data.onUpdateContainer) {
      data.onUpdateContainer(data.containerId, {
        title: nodeData.title,
        description: nodeData.description,
      });
    }
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN WORK':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PLANNED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="target" position={Position.Left} id="left" />
      <Card 
        className={`min-w-[280px] max-w-[320px] border-2 ${
          nodeData.status === 'IN WORK' ? 'border-yellow-400 shadow-lg' : 'hover:shadow-md'
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-sm leading-tight">{nodeData.title}</h3>
              <div className="text-xs text-muted-foreground mt-1">
                {data.cardCount || 0} Karten
              </div>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-100">
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
                      Speichern
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {data.tags?.map((tag: string, index: number) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="text-xs px-2 py-0 bg-blue-50 text-blue-700"
            >
              #{tag}
            </Badge>
          ))}
        </div>
        
        {/* Container Color Indicator */}
        <div className="flex items-center gap-2 mt-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data.color || '#3B82F6' }}
          />
          <span className="text-xs text-muted-foreground">
            {data.progress !== undefined ? `${data.progress}% abgeschlossen` : 'Fortschritt unbekannt'}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
          {nodeData.description || 'Keine Beschreibung verfügbar'}
        </p>
        
        <div className="space-y-2">
          {/* Container Cards Preview */}
          {data.cards?.slice(0, 3).map((card: any, index: number) => (
            <div key={index} className="p-2 bg-gray-50 rounded text-xs">
              <div className="font-medium">{card.title}</div>
              <div className="text-muted-foreground">{card.status}</div>
            </div>
          ))}
          {data.cards?.length > 3 && (
            <div className="text-xs text-muted-foreground text-center">
              +{data.cards.length - 3} weitere Karten
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </>
  );
};

// Node types
const nodeTypes: NodeTypes = {
  roadmapNode: RoadmapNode,
};

// Generate nodes from actual container data
const generateNodesFromContainers = (containers: RoadmapContainer[], cards: RoadmapCard[], onUpdateContainer: any): Node[] => {
  return containers.map((container, index) => {
    const containerCards = cards.filter(card => card.container_id === container.id);
    
    return {
      id: container.id,
      type: 'roadmapNode',
      position: { 
        x: (index % 3) * 350 + 50, 
        y: Math.floor(index / 3) * 250 + 50 
      },
      data: {
        containerId: container.id,
        title: container.title,
        description: container.description || `${containerCards.length} Karten`,
        color: container.color,
        progress: container.progress,
        tags: container.tags || [],
        cards: containerCards,
        cardCount: containerCards.length,
        onUpdateContainer: onUpdateContainer
      },
    };
  });
};

const generateEdgesFromContainers = (containers: RoadmapContainer[]): Edge[] => {
  const edges: Edge[] = [];
  for (let i = 0; i < containers.length - 1; i++) {
    edges.push({
      id: `e${containers[i].id}-${containers[i + 1].id}`,
      source: containers[i].id,
      target: containers[i + 1].id,
      sourceHandle: 'right',
      targetHandle: 'left',
      type: 'smoothstep',
    });
  }
  return edges;
};

const VisualRoadmapPlanningFlow = ({ roadmapId }: { roadmapId: string }) => {
  const {
    containers,
    cards,
    isLoading,
    createContainer,
    updateContainer
  } = useRoadmapPlanning(roadmapId);

  const initialNodes = useMemo(() => 
    generateNodesFromContainers(containers, cards, updateContainer), 
    [containers, cards, updateContainer]
  );
  const initialEdges = useMemo(() => 
    generateEdgesFromContainers(containers), 
    [containers]
  );
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [newNodeData, setNewNodeData] = useState({
    title: '',
    description: '',
    color: '#3B82F6',
    tags: [] as string[],
  });

  // Update nodes when containers change
  React.useEffect(() => {
    const newNodes = generateNodesFromContainers(containers, cards, updateContainer);
    setNodes(newNodes);
    const newEdges = generateEdgesFromContainers(containers);
    setEdges(newEdges);
  }, [containers, cards, updateContainer, setNodes, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const addNewContainer = async () => {
    if (!newNodeData.title.trim()) return;
    
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
    } catch (error) {
      console.error('Fehler beim Erstellen des Containers:', error);
    }
  };

  return (
    <div className="h-[700px] w-full relative border rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>

      {/* Floating Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Dialog open={isAddingNode} onOpenChange={setIsAddingNode}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 hover-scale">
              <Plus className="h-4 w-4" />
              Neuer Container
            </Button>
          </DialogTrigger>
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
              <Button onClick={addNewContainer} className="w-full">Container erstellen</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button size="sm" variant="outline" className="gap-2 hover-scale">
          <Save className="h-4 w-4" />
          Speichern
        </Button>

        <Button size="sm" variant="outline" className="gap-2 hover-scale">
          <Download className="h-4 w-4" />
          Exportieren
        </Button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-xs text-muted-foreground max-w-xs">
        <p className="font-medium mb-1">Anweisungen:</p>
        <ul className="space-y-1">
          <li>• Container verschieben: Drag & Drop</li>
          <li>• Verbinden: Von einem Container zum anderen ziehen</li>
          <li>• Bearbeiten: Settings-Icon im Container</li>
          <li>• Mitarbeiter hinzufügen: Plus-Icon im Container</li>
        </ul>
      </div>
    </div>
  );
};

interface VisualRoadmapPlanningProps {
  roadmapId: string;
}

export const VisualRoadmapPlanning = ({ roadmapId }: VisualRoadmapPlanningProps) => {
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
            <h2 className="text-xl font-semibold">Visuelle Planung: {selectedRoadmap.title}</h2>
            <p className="text-sm text-muted-foreground">
              {containers.length} Container aus dem Kanban Board werden hier visualisiert
            </p>
            {selectedRoadmap.vision && (
              <div className="mt-2 p-3 bg-purple-50 rounded-lg">
                <h4 className="text-sm font-medium text-purple-900 mb-1">Vision</h4>
                <p className="text-sm text-purple-700">{selectedRoadmap.vision}</p>
              </div>
            )}
            {selectedRoadmap.mission && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-1">Mission</h4>
                <p className="text-sm text-blue-700">{selectedRoadmap.mission}</p>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Status:</div>
            <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
              selectedRoadmap.status === 'active' ? 'bg-green-100 text-green-800' :
              selectedRoadmap.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {selectedRoadmap.status === 'active' ? 'Aktiv' :
               selectedRoadmap.status === 'draft' ? 'Entwurf' :
               selectedRoadmap.status === 'completed' ? 'Abgeschlossen' : selectedRoadmap.status}
            </div>
          </div>
        </div>
        
        {/* Task & Project Integration */}
        <TaskProjectIntegration roadmapId={roadmapId} />
        
        <VisualRoadmapPlanningFlow roadmapId={roadmapId} />
      </div>
    </ReactFlowProvider>
  );
};