import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  MarkerType,
} from '@xyflow/react';

interface CustomEdgeData {
  connectionType?: 'dependency' | 'related' | 'blocks' | 'custom';
  label?: string;
}

export const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const getEdgeStyle = () => {
    const connectionType = (data as CustomEdgeData)?.connectionType || 'dependency';
    
    switch (connectionType) {
      case 'dependency':
        return {
          ...style,
          stroke: '#3b82f6',
          strokeWidth: 2,
        };
      case 'related':
        return {
          ...style,
          stroke: '#10b981',
          strokeWidth: 2,
          strokeDasharray: '5,5',
        };
      case 'blocks':
        return {
          ...style,
          stroke: '#ef4444',
          strokeWidth: 2,
        };
      default:
        return {
          ...style,
          stroke: '#6b7280',
          strokeWidth: 1,
        };
    }
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd || MarkerType.ArrowClosed}
        style={getEdgeStyle()}
      />
      {(data as CustomEdgeData)?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
            }}
            className="nodrag nopan bg-background border border-border rounded px-2 py-1 text-sm"
          >
            {(data as CustomEdgeData).label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};