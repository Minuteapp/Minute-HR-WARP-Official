import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useInnovationData } from '@/hooks/useInnovationData';
import { Plus, Eye, Save, RefreshCw, Inbox } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Custom Node Types
const IdeaNode = ({ data }: { data: any }) => (
  <div className="bg-card border rounded-lg p-3 shadow-sm min-w-[120px]">
    <div className="text-sm font-medium mb-1">{data.title}</div>
    <Badge variant="secondary" className="text-xs">
      {data.status || 'new'}
    </Badge>
  </div>
);

const ContainerNode = ({ data }: { data: any }) => (
  <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-4 min-w-[200px] min-h-[150px]">
    <div className="text-lg font-semibold text-primary mb-2">{data.title}</div>
    <div className="text-sm text-muted-foreground">{data.description}</div>
    <div className="mt-2">
      <Badge variant="outline">{data.ideaCount || 0} Ideen</Badge>
    </div>
  </div>
);

const InboxNode = ({ data }: { data: any }) => (
  <div className="bg-muted border rounded-lg p-4 min-w-[180px]">
    <div className="flex items-center gap-2 mb-2">
      <Inbox className="h-4 w-4" />
      <span className="font-medium">Posteingang</span>
    </div>
    <div className="text-sm text-muted-foreground">
      {data.ideaCount || 0} neue Ideen
    </div>
  </div>
);

const nodeTypes: NodeTypes = {
  idea: IdeaNode,
  container: ContainerNode,
  inbox: InboxNode,
};

interface IdeaOrganizerProps {
  ideas: any[];
}

export const IdeaOrganizer: React.FC<IdeaOrganizerProps> = ({ ideas }) => {
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [newContainerName, setNewContainerName] = useState('');
  const [showNewContainerDialog, setShowNewContainerDialog] = useState(false);

  // Initialize nodes
  useEffect(() => {
    const initialNodes: Node[] = [
      // Posteingang
      {
        id: 'inbox',
        type: 'inbox',
        position: { x: 50, y: 50 },
        data: { 
          title: 'Posteingang',
          ideaCount: ideas.filter(idea => !idea.container_id).length 
        },
        draggable: false
      },
      // Beispiel Container
      {
        id: 'container-1',
        type: 'container',
        position: { x: 300, y: 50 },
        data: { 
          title: 'KI & Technologie',
          description: 'Ideen zu künstlicher Intelligenz und neuen Technologien',
          ideaCount: 0
        }
      },
      {
        id: 'container-2',
        type: 'container',
        position: { x: 600, y: 50 },
        data: { 
          title: 'Prozessoptimierung',
          description: 'Verbesserungen bestehender Arbeitsabläufe',
          ideaCount: 0
        }
      }
    ];

    // Füge Ideen als Nodes hinzu (im Posteingang startend)
    ideas.forEach((idea, index) => {
      initialNodes.push({
        id: `idea-${idea.id}`,
        type: 'idea',
        position: { 
          x: 50 + (index % 3) * 60, 
          y: 150 + Math.floor(index / 3) * 80 
        },
        data: {
          title: idea.title,
          status: idea.status,
          originalId: idea.id
        },
        draggable: true,
        parentId: 'inbox'
      });
    });

    setNodes(initialNodes);
  }, [ideas, setNodes]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const createNewContainer = () => {
    if (!newContainerName.trim()) return;

    const newNode: Node = {
      id: `container-${Date.now()}`,
      type: 'container',
      position: { x: 300 + Math.random() * 200, y: 250 },
      data: {
        title: newContainerName,
        description: 'Neuer Themen-Container',
        ideaCount: 0
      }
    };

    setNodes((nds) => [...nds, newNode]);
    setNewContainerName('');
    setShowNewContainerDialog(false);
    
    toast({
      title: "Container erstellt",
      description: `"${newContainerName}" wurde erfolgreich erstellt.`
    });
  };

  const onNodeDragStop = useCallback((event: any, node: Node) => {
    // Hier könnte die Logik für das Zuweisen von Ideen zu Containern implementiert werden
    if (node.type === 'idea') {
      // Prüfe ob die Idee über einem Container ist
      const containerNodes = nodes.filter(n => n.type === 'container');
      const droppedOnContainer = containerNodes.find(container => {
        const containerBounds = {
          left: container.position.x,
          right: container.position.x + 200,
          top: container.position.y,
          bottom: container.position.y + 150
        };
        
        return node.position.x >= containerBounds.left &&
               node.position.x <= containerBounds.right &&
               node.position.y >= containerBounds.top &&
               node.position.y <= containerBounds.bottom;
      });

      if (droppedOnContainer) {
        toast({
          title: "Idee zugewiesen",
          description: `"${node.data.title}" wurde zu "${droppedOnContainer.data.title}" hinzugefügt.`
        });
      }
    }
  }, [nodes, toast]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Ideen-Organisation</h3>
          <p className="text-sm text-muted-foreground">
            Ziehen Sie Ideen per Drag & Drop in passende Themen-Container
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showNewContainerDialog} onOpenChange={setShowNewContainerDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Neuer Container
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neuen Themen-Container erstellen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Container-Name eingeben..."
                  value={newContainerName}
                  onChange={(e) => setNewContainerName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createNewContainer()}
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
        </div>
      </div>

      {/* React Flow Board */}
      <Card>
        <CardContent className="p-0">
          <div style={{ width: '100%', height: '600px' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeDragStop={onNodeDragStop}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
              className="bg-muted/30"
            >
              <Controls />
              <MiniMap />
              <Background />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>

      {/* Anweisungen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Anweisungen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">1</div>
              <div>
                <p className="font-medium">Ideen aus Posteingang</p>
                <p className="text-muted-foreground">Neue Ideen sammeln sich automatisch im Posteingang</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">2</div>
              <div>
                <p className="font-medium">Drag & Drop</p>
                <p className="text-muted-foreground">Ziehen Sie Ideen in passende Themen-Container</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">3</div>
              <div>
                <p className="font-medium">Organisation</p>
                <p className="text-muted-foreground">Erstellen Sie neue Container für verschiedene Themen</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};