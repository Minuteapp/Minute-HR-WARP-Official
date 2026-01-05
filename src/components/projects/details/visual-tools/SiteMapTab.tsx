import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download, Share2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const initialNodes: Node[] = [
  {
    id: 'home',
    type: 'default',
    position: { x: 400, y: 50 },
    data: { label: 'Homepage' },
    style: { backgroundColor: 'hsl(var(--primary))', color: 'white' },
  },
  {
    id: 'about',
    type: 'default',
    position: { x: 200, y: 150 },
    data: { label: 'Über uns' },
  },
  {
    id: 'products',
    type: 'default',
    position: { x: 400, y: 150 },
    data: { label: 'Produkte' },
  },
  {
    id: 'contact',
    type: 'default',
    position: { x: 600, y: 150 },
    data: { label: 'Kontakt' },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: 'home',
    target: 'about',
    type: 'smoothstep',
  },
  {
    id: 'e1-3',
    source: 'home',
    target: 'products',
    type: 'smoothstep',
  },
  {
    id: 'e1-4',
    source: 'home',
    target: 'contact',
    type: 'smoothstep',
  },
];

interface SiteMapTabProps {
  project: any;
}

export const SiteMapTab: React.FC<SiteMapTabProps> = ({ project }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const addPage = () => {
    const newNode: Node = {
      id: `page-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 400 + 200, y: Math.random() * 200 + 250 },
      data: { label: 'Neue Seite' },
    };
    setNodes((nds) => [...nds, newNode]);
    toast("Neue Seite hinzugefügt");
  };

  const exportSiteMap = () => {
    toast("Site Map Export wird vorbereitet...");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Site Map - {project.name}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={addPage}>
                <Plus className="h-4 w-4 mr-2" />
                Seite hinzufügen
              </Button>
              <Button variant="outline" size="sm" onClick={exportSiteMap}>
                <Download className="h-4 w-4 mr-2" />
                Exportieren
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Teilen
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Kommentare
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 border rounded-lg">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              style={{ backgroundColor: "hsl(var(--muted))" }}
            >
              <MiniMap />
              <Controls />
              <Background />
            </ReactFlow>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Ziehen Sie Seiten per Drag & Drop, um die Struktur zu ändern. Verbinden Sie Seiten durch Ziehen von den Rändern.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};