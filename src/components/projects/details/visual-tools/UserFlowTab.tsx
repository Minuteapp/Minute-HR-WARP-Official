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
import { Play, Square, Diamond, Download, Bot } from "lucide-react";
import { toast } from "sonner";

const initialNodes: Node[] = [
  {
    id: 'start',
    type: 'input',
    position: { x: 100, y: 50 },
    data: { label: '🚀 Start' },
    style: { backgroundColor: 'hsl(var(--primary))', color: 'white' },
  },
  {
    id: 'login',
    type: 'default',
    position: { x: 100, y: 150 },
    data: { label: '🔐 Login' },
  },
  {
    id: 'dashboard',
    type: 'default',
    position: { x: 100, y: 250 },
    data: { label: '📊 Dashboard' },
  },
  {
    id: 'decision',
    type: 'default',
    position: { x: 300, y: 250 },
    data: { label: '❓ Neue Aufgabe?' },
    style: { backgroundColor: 'hsl(var(--warning))', borderRadius: '50%' },
  },
  {
    id: 'create-task',
    type: 'default',
    position: { x: 450, y: 200 },
    data: { label: '➕ Aufgabe erstellen' },
  },
  {
    id: 'view-tasks',
    type: 'default',
    position: { x: 450, y: 300 },
    data: { label: '👁️ Aufgaben anzeigen' },
  },
  {
    id: 'end',
    type: 'output',
    position: { x: 600, y: 250 },
    data: { label: '✅ Ende' },
    style: { backgroundColor: 'hsl(var(--success))', color: 'white' },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: 'start',
    target: 'login',
    animated: true,
  },
  {
    id: 'e2-3',
    source: 'login',
    target: 'dashboard',
  },
  {
    id: 'e3-4',
    source: 'dashboard',
    target: 'decision',
  },
  {
    id: 'e4-5',
    source: 'decision',
    target: 'create-task',
    label: 'Ja',
  },
  {
    id: 'e4-6',
    source: 'decision',
    target: 'view-tasks',
    label: 'Nein',
  },
  {
    id: 'e5-7',
    source: 'create-task',
    target: 'end',
  },
  {
    id: 'e6-7',
    source: 'view-tasks',
    target: 'end',
  },
];

interface UserFlowTabProps {
  project: any;
}

export const UserFlowTab: React.FC<UserFlowTabProps> = ({ project }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const addStartPoint = () => {
    const newNode: Node = {
      id: `start-${Date.now()}`,
      type: 'input',
      position: { x: Math.random() * 200 + 50, y: Math.random() * 100 + 50 },
      data: { label: '🚀 Startpunkt' },
      style: { backgroundColor: 'hsl(var(--primary))', color: 'white' },
    };
    setNodes((nds) => [...nds, newNode]);
    toast("Startpunkt hinzugefügt");
  };

  const addAction = () => {
    const newNode: Node = {
      id: `action-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 300 + 200, y: Math.random() * 200 + 150 },
      data: { label: '⚡ Aktion' },
    };
    setNodes((nds) => [...nds, newNode]);
    toast("Aktion hinzugefügt");
  };

  const addDecision = () => {
    const newNode: Node = {
      id: `decision-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 300 + 200, y: Math.random() * 200 + 150 },
      data: { label: '❓ Entscheidung' },
      style: { backgroundColor: 'hsl(var(--warning))', borderRadius: '50%' },
    };
    setNodes((nds) => [...nds, newNode]);
    toast("Entscheidungspunkt hinzugefügt");
  };

  const addEndPoint = () => {
    const newNode: Node = {
      id: `end-${Date.now()}`,
      type: 'output',
      position: { x: Math.random() * 200 + 500, y: Math.random() * 200 + 200 },
      data: { label: '✅ Endpunkt' },
      style: { backgroundColor: 'hsl(var(--success))', color: 'white' },
    };
    setNodes((nds) => [...nds, newNode]);
    toast("Endpunkt hinzugefügt");
  };

  const analyzeUX = () => {
    toast("KI analysiert den User Flow auf UX-Probleme...");
  };

  const exportFlow = () => {
    toast("User Flow Export wird vorbereitet...");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            User Flow - {project.name}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={addStartPoint}>
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
              <Button variant="outline" size="sm" onClick={addAction}>
                <Square className="h-4 w-4 mr-2" />
                Aktion
              </Button>
              <Button variant="outline" size="sm" onClick={addDecision}>
                <Diamond className="h-4 w-4 mr-2" />
                Entscheidung
              </Button>
              <Button variant="outline" size="sm" onClick={addEndPoint}>
                <Square className="h-4 w-4 mr-2" />
                Ende
              </Button>
              <Button variant="outline" size="sm" onClick={analyzeUX}>
                <Bot className="h-4 w-4 mr-2" />
                UX Analyse
              </Button>
              <Button variant="outline" size="sm" onClick={exportFlow}>
                <Download className="h-4 w-4 mr-2" />
                Export
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
            Erstellen Sie User Flows durch Verbinden von Start-, Aktions-, Entscheidungs- und Endpunkten. 
            Verwenden Sie die KI-Analyse für UX-Feedback.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};