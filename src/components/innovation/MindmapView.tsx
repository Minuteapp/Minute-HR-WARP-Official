import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { IdeaData } from './IdeaVisualization';

interface IdeaNodeData {
  idea: IdeaData;
  onSelect: (idea: IdeaData) => void;
}

const IdeaNode = ({ data }: { data: IdeaNodeData }) => {
  const { idea } = data;
  
  const getColorByPriority = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-emerald-500 bg-emerald-50';
      case 'medium': return 'border-amber-500 bg-amber-50';
      case 'low': return 'border-red-500 bg-red-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getSizeByROI = (roi: number) => {
    if (roi > 40000) return 'w-32 h-24';
    if (roi > 25000) return 'w-28 h-20';
    return 'w-24 h-16';
  };

  return (
    <div className={`${getSizeByROI(idea.roiPotential)} ${getColorByPriority(idea.priority)} border-2 rounded-lg p-2 cursor-pointer hover:shadow-lg transition-all`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
      <Handle type="source" position={Position.Left} className="w-2 h-2" />
      <Handle type="source" position={Position.Right} className="w-2 h-2" />
      
      <div className="text-xs font-semibold truncate mb-1">{idea.title}</div>
      <div className="text-xs text-gray-600 mb-1">€{idea.roiPotential.toLocaleString()}</div>
      <div className="flex flex-wrap gap-1">
        {idea.tags.slice(0, 2).map(tag => (
          <span key={tag} className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs">
            {tag}
          </span>
        ))}
      </div>
      <div className="text-xs mt-1 text-gray-500">{idea.votes} 👍</div>
    </div>
  );
};

const SubIdeaNode = ({ data }: { data: IdeaNodeData }) => {
  const { idea } = data;
  
  return (
    <div className="w-20 h-12 border border-gray-300 bg-gray-100 rounded p-1 cursor-pointer hover:shadow-md transition-all">
      <Handle type="target" position={Position.Top} className="w-1 h-1" />
      <div className="text-xs font-medium truncate">{idea.title}</div>
      <div className="text-xs text-gray-500">{idea.votes} 👍</div>
    </div>
  );
};

const CenterNode = () => {
  return (
    <div className="w-40 h-32 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white shadow-xl">
      <Handle type="source" position={Position.Top} className="w-3 h-3" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
      <Handle type="source" position={Position.Left} className="w-3 h-3" />
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
      
      <div className="text-center">
        <div className="font-bold text-sm">Innovation</div>
        <div className="font-bold text-sm">Hub</div>
      </div>
    </div>
  );
};

const nodeTypes = {
  ideaNode: IdeaNode,
  subIdeaNode: SubIdeaNode,
  centerNode: CenterNode,
};

interface MindmapViewProps {
  ideas: IdeaData[];
}

const MindmapView: React.FC<MindmapViewProps> = ({ ideas }) => {
  const [selectedIdea, setSelectedIdea] = useState<IdeaData | null>(null);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Center node
    nodes.push({
      id: 'center',
      type: 'centerNode',
      position: { x: 400, y: 300 },
      data: {},
      draggable: false,
    });

    // Calculate positions in a circle around the center
    const centerX = 400;
    const centerY = 300;
    const radius = 250;

    ideas.forEach((idea, index) => {
      const angle = (index / ideas.length) * 2 * Math.PI;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      // Main idea node
      nodes.push({
        id: idea.id,
        type: 'ideaNode',
        position: { x: x - 50, y: y - 40 },
        data: { idea, onSelect: setSelectedIdea },
      });

      // Edge from center to idea
      edges.push({
        id: `center-${idea.id}`,
        source: 'center',
        target: idea.id,
        type: 'smoothstep',
        style: { stroke: '#06B6D4', strokeWidth: 2 },
      });

      // Sub-ideas
      if (idea.subIdeas) {
        idea.subIdeas.forEach((subIdea, subIndex) => {
          const subAngle = angle + (subIndex - 0.5) * 0.3;
          const subRadius = radius + 120;
          const subX = centerX + Math.cos(subAngle) * subRadius;
          const subY = centerY + Math.sin(subAngle) * subRadius;

          nodes.push({
            id: subIdea.id,
            type: 'subIdeaNode',
            position: { x: subX - 40, y: subY - 24 },
            data: { idea: subIdea, onSelect: setSelectedIdea },
          });

          edges.push({
            id: `${idea.id}-${subIdea.id}`,
            source: idea.id,
            target: subIdea.id,
            type: 'smoothstep',
            style: { stroke: '#D1D5DB', strokeWidth: 1 },
          });
        });
      }
    });

    return { nodes, edges };
  }, [ideas]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        style={{ background: 'linear-gradient(to bottom right, #0f172a, #1e3a8a, #000000)' }}
      >
        <Controls />
        <MiniMap 
          style={{ background: '#1e293b' }}
          nodeColor={(node) => {
            if (node.type === 'centerNode') return '#06B6D4';
            if (node.type === 'ideaNode') return '#10B981';
            return '#D1D5DB';
          }}
        />
        <Background color="#333" gap={16} />
      </ReactFlow>

      {/* Selected idea details */}
      {selectedIdea && (
        <div className="absolute top-4 right-4 bg-black/90 text-white p-4 rounded-lg max-w-64 border border-cyan-500">
          <h3 className="font-bold text-cyan-400 mb-2">{selectedIdea.title}</h3>
          <p className="text-sm mb-2">{selectedIdea.description}</p>
          <div className="flex flex-wrap gap-1 mb-2">
            {selectedIdea.tags.map(tag => (
              <span key={tag} className="bg-cyan-600 px-2 py-1 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
          <div className="text-xs space-y-1">
            <div>Priorität: <span className="font-semibold">{selectedIdea.priority}</span></div>
            <div>Status: <span className="font-semibold">{selectedIdea.status}</span></div>
            <div>ROI: <span className="font-semibold">€{selectedIdea.roiPotential.toLocaleString()}</span></div>
            <div>Stimmen: <span className="font-semibold">{selectedIdea.votes}</span></div>
          </div>
          <button 
            onClick={() => setSelectedIdea(null)}
            className="mt-2 bg-cyan-600 hover:bg-cyan-700 px-3 py-1 rounded text-xs"
          >
            Schließen
          </button>
        </div>
      )}
    </div>
  );
};

export default MindmapView;