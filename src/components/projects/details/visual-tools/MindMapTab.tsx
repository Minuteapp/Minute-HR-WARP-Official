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
import { Brain, Plus, Tag, Link, Focus, Bot } from "lucide-react";
import { toast } from "sonner";

const initialNodes: Node[] = [
  {
    id: 'central',
    type: 'default',
    position: { x: 300, y: 200 },
    data: { label: 'Hauptthema' },
    style: { 
      backgroundColor: 'hsl(var(--primary))', 
      color: 'white', 
      fontSize: '16px',
      borderRadius: '50px',
      padding: '20px'
    },
  },
  {
    id: 'idea1',
    type: 'default',
    position: { x: 150, y: 100 },
    data: { label: '💡 Kernfunktionen' },
    style: { borderRadius: '25px' },
  },
  {
    id: 'idea2',
    type: 'default',
    position: { x: 450, y: 100 },
    data: { label: '🎯 Zielgruppe' },
    style: { borderRadius: '25px' },
  },
  {
    id: 'idea3',
    type: 'default',
    position: { x: 150, y: 300 },
    data: { label: '🚀 Marketing' },
    style: { borderRadius: '25px' },
  },
  {
    id: 'idea4',
    type: 'default',
    position: { x: 450, y: 300 },
    data: { label: '💰 Budget' },
    style: { borderRadius: '25px' },
  },
  {
    id: 'sub1',
    type: 'default',
    position: { x: 50, y: 50 },
    data: { label: 'Login System' },
    style: { backgroundColor: 'hsl(var(--muted))', fontSize: '12px' },
  },
  {
    id: 'sub2',
    type: 'default',
    position: { x: 50, y: 130 },
    data: { label: 'Dashboard' },
    style: { backgroundColor: 'hsl(var(--muted))', fontSize: '12px' },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e-central-1',
    source: 'central',
    target: 'idea1',
    style: { stroke: 'hsl(var(--primary))' },
  },
  {
    id: 'e-central-2',
    source: 'central',
    target: 'idea2',
    style: { stroke: 'hsl(var(--primary))' },
  },
  {
    id: 'e-central-3',
    source: 'central',
    target: 'idea3',
    style: { stroke: 'hsl(var(--primary))' },
  },
  {
    id: 'e-central-4',
    source: 'central',
    target: 'idea4',
    style: { stroke: 'hsl(var(--primary))' },
  },
  {
    id: 'e-idea1-sub1',
    source: 'idea1',
    target: 'sub1',
    style: { stroke: 'hsl(var(--muted-foreground))' },
  },
  {
    id: 'e-idea1-sub2',
    source: 'idea1',
    target: 'sub2',
    style: { stroke: 'hsl(var(--muted-foreground))' },
  },
];

interface MindMapTabProps {
  project: any;
}

export const MindMapTab: React.FC<MindMapTabProps> = ({ project }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [focusMode, setFocusMode] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const addMainIdea = () => {
    const newNode: Node = {
      id: `main-${Date.now()}`,
      type: 'default',
      position: { 
        x: 300 + (Math.random() - 0.5) * 400, 
        y: 200 + (Math.random() - 0.5) * 300 
      },
      data: { label: '💡 Neue Idee' },
      style: { borderRadius: '25px' },
    };
    setNodes((nds) => [...nds, newNode]);
    toast("Hauptidee hinzugefügt");
  };

  const addSubIdea = () => {
    const newNode: Node = {
      id: `sub-${Date.now()}`,
      type: 'default',
      position: { 
        x: Math.random() * 600 + 50, 
        y: Math.random() * 400 + 50 
      },
      data: { label: 'Unter-Idee' },
      style: { backgroundColor: 'hsl(var(--muted))', fontSize: '12px' },
    };
    setNodes((nds) => [...nds, newNode]);
    toast("Unter-Idee hinzugefügt");
  };

  const addTag = () => {
    toast("Tag-System wird implementiert...");
  };

  const linkToTask = () => {
    toast("Verknüpfung zu Aufgaben wird erstellt...");
  };

  const toggleFocus = () => {
    setFocusMode(!focusMode);
    toast(focusMode ? "Fokus-Modus deaktiviert" : "Fokus-Modus aktiviert");
  };

  const aiSuggestions = () => {
    toast("KI analysiert Mind Map und erstellt Vorschläge...");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Mind Map - {project.name}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={addMainIdea}>
                <Plus className="h-4 w-4 mr-2" />
                Hauptidee
              </Button>
              <Button variant="outline" size="sm" onClick={addSubIdea}>
                <Plus className="h-4 w-4 mr-2" />
                Unter-Idee
              </Button>
              <Button variant="outline" size="sm" onClick={addTag}>
                <Tag className="h-4 w-4 mr-2" />
                Tag
              </Button>
              <Button variant="outline" size="sm" onClick={linkToTask}>
                <Link className="h-4 w-4 mr-2" />
                Mit Aufgabe verknüpfen
              </Button>
              <Button 
                variant={focusMode ? "default" : "outline"} 
                size="sm" 
                onClick={toggleFocus}
              >
                <Focus className="h-4 w-4 mr-2" />
                Fokus
              </Button>
              <Button variant="outline" size="sm" onClick={aiSuggestions}>
                <Bot className="h-4 w-4 mr-2" />
                KI Vorschläge
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
            Erstellen Sie freie Ideenstrukturen durch Verbinden von Konzepten. 
            Nutzen Sie Tags für die Kategorisierung und den Fokus-Modus für detaillierte Bearbeitung.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};