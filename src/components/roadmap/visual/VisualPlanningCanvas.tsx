import React, { useCallback, useState, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  NodeTypes,
  EdgeTypes,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { VisualPlanningToolbar } from './VisualPlanningToolbar';
import { ContainerDetailsDialog } from './ContainerDetailsDialog';
import { TeamManagementDialog } from './TeamManagementDialog';
import { CommentDialog } from './CommentDialog';
import { AIAssistDialog } from './AIAssistDialog';
import { CustomNode } from './nodes/CustomNode';
import { CustomEdge } from './edges/CustomEdge';

// Node Types
const nodeTypes: NodeTypes = {
  custom: CustomNode as any,
  rectangle: CustomNode as any,
  circle: CustomNode as any,
  triangle: CustomNode as any,
  diamond: CustomNode as any,
};

// Edge Types
const edgeTypes: EdgeTypes = {
  custom: CustomEdge as any,
};

interface VisualPlanningCanvasProps {
  roadmapId: string;
}

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 250, y: 50 },
    data: { 
      label: 'Projekt Start',
      shape: 'rectangle',
      color: '#3b82f6',
      textColor: '#ffffff',
      fontSize: 14,
      fontFamily: 'Arial',
      roadmapId: '',
    },
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 100, y: 200 },
    data: { 
      label: 'Meilenstein 1',
      shape: 'circle',
      color: '#10b981',
      textColor: '#ffffff',
      fontSize: 14,
      fontFamily: 'Arial',
      roadmapId: '',
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'custom',
    data: { connectionType: 'dependency' },
  },
];

const VisualPlanningCanvasContent: React.FC<VisualPlanningCanvasProps> = ({ roadmapId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [activeTool, setActiveTool] = useState('select');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showContainerDetails, setShowContainerDetails] = useState(false);
  const [showTeamManagement, setShowTeamManagement] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [history, setHistory] = useState<{ nodes: Node[], edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedFontSize, setSelectedFontSize] = useState('16');
  const [selectedFontFamily, setSelectedFontFamily] = useState('Arial');

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { getViewport, setViewport, screenToFlowPosition } = useReactFlow();

  // History Management
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes, edges });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [nodes, edges, history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Zoom Controls
  const handleZoomIn = useCallback(() => {
    const viewport = getViewport();
    setViewport({ ...viewport, zoom: viewport.zoom * 1.2 });
  }, [getViewport, setViewport]);

  const handleZoomOut = useCallback(() => {
    const viewport = getViewport();
    setViewport({ ...viewport, zoom: viewport.zoom / 1.2 });
  }, [getViewport, setViewport]);

  // Tool Selection
  const handleToolSelect = useCallback((tool: string) => {
    setActiveTool(tool);

    switch (tool) {
      case 'team':
        setShowTeamManagement(true);
        break;
      case 'comment':
        setShowCommentDialog(true);
        break;
      case 'ai-assist':
        setShowAIAssist(true);
        break;
      case 'rectangle':
      case 'circle':
      case 'triangle':
      case 'diamond':
        addNewNode(tool);
        break;
    }
  }, []);

  // Add New Node
  const addNewNode = useCallback((shape: string) => {
    const id = `${nodes.length + 1}`;
    const position = screenToFlowPosition({ x: 300, y: 300 });
    
    const newNode: Node = {
      id,
      type: 'custom',
      position,
      data: {
        label: `Neuer ${shape}`,
        shape,
        color: getShapeColor(shape),
        textColor: '#ffffff',
        fontSize: parseInt(selectedFontSize),
        fontFamily: selectedFontFamily,
        roadmapId,
      },
    };

    saveToHistory();
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, roadmapId, selectedFontSize, selectedFontFamily, saveToHistory, setNodes, screenToFlowPosition]);

  const getShapeColor = (shape: string): string => {
    switch (shape) {
      case 'rectangle': return '#3b82f6';
      case 'circle': return '#10b981';
      case 'triangle': return '#f59e0b';
      case 'diamond': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  // Connection Handler
  const onConnect = useCallback(
    (params: Connection) => {
      saveToHistory();
      setEdges((eds) => addEdge({ ...params, type: 'custom' }, eds));
    },
    [saveToHistory, setEdges]
  );

  // Node Click Handler
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if (activeTool === 'select') {
      setSelectedNode(node);
      setShowContainerDetails(true);
    }
  }, [activeTool]);

  // Canvas Click Handler
  const onPaneClick = useCallback((event: React.MouseEvent) => {
    if (activeTool === 'text') {
      const position = screenToFlowPosition({ 
        x: event.clientX - (reactFlowWrapper.current?.getBoundingClientRect().left || 0), 
        y: event.clientY - (reactFlowWrapper.current?.getBoundingClientRect().top || 0) 
      });
      
      const newNode: Node = {
        id: `text-${Date.now()}`,
        type: 'custom',
        position,
        data: {
          label: 'Text eingeben',
          shape: 'text',
          color: 'transparent',
          textColor: '#000000',
          fontSize: parseInt(selectedFontSize),
          fontFamily: selectedFontFamily,
          roadmapId,
        },
      };

      saveToHistory();
      setNodes((nds) => nds.concat(newNode));
    }
  }, [activeTool, roadmapId, selectedFontSize, selectedFontFamily, saveToHistory, setNodes, screenToFlowPosition]);

  const viewport = getViewport();

  return (
    <div className="h-full flex flex-col">
      <VisualPlanningToolbar
        activeTool={activeTool}
        onToolSelect={handleToolSelect}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        zoomLevel={viewport.zoom}
        onUndo={undo}
        onRedo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onFontSizeChange={setSelectedFontSize}
        onFontFamilyChange={setSelectedFontFamily}
        selectedFontSize={selectedFontSize}
        selectedFontFamily={selectedFontFamily}
      />

      <div className="flex-1" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="bg-background"
        >
          <Background />
          <Controls />
          <MiniMap className="bg-background" />
        </ReactFlow>
      </div>

      {/* Dialogs */}
      <ContainerDetailsDialog
        open={showContainerDetails}
        onOpenChange={setShowContainerDetails}
        node={selectedNode}
        onUpdateNode={(updatedNode) => {
          setNodes((nds) => nds.map((n) => n.id === updatedNode.id ? updatedNode : n));
        }}
      />

      <TeamManagementDialog
        open={showTeamManagement}
        onOpenChange={setShowTeamManagement}
        roadmapId={roadmapId}
      />

      <CommentDialog
        open={showCommentDialog}
        onOpenChange={setShowCommentDialog}
        elementId={selectedNode?.id || ''}
        elementType="node"
      />

      <AIAssistDialog
        open={showAIAssist}
        onOpenChange={setShowAIAssist}
        context={{ nodes, edges, roadmapId }}
      />
    </div>
  );
};

export const VisualPlanningCanvas: React.FC<VisualPlanningCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <VisualPlanningCanvasContent {...props} />
    </ReactFlowProvider>
  );
};