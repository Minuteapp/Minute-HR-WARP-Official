import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

interface CustomNodeData {
  label: string;
  shape: 'rectangle' | 'circle' | 'triangle' | 'diamond' | 'text';
  color: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  roadmapId: string;
}

export const CustomNode = memo<NodeProps>(({ data, selected }) => {
  const { label, shape, color, textColor, fontSize, fontFamily } = (data as unknown) as CustomNodeData;

  const getShapeStyles = () => {
    const baseStyle: React.CSSProperties = {
      minWidth: '120px',
      minHeight: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: selected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
      color: textColor,
      fontSize: `${fontSize}px`,
      fontFamily,
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    };

    switch (shape) {
      case 'circle':
        return {
          ...baseStyle,
          backgroundColor: color,
          borderRadius: '50%',
          width: '80px',
          height: '80px',
          minWidth: '80px',
          minHeight: '80px',
        };
      case 'triangle':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          border: 'none',
          position: 'relative' as const,
        };
      case 'diamond':
        return {
          ...baseStyle,
          backgroundColor: color,
          transform: 'rotate(45deg)',
          width: '80px',
          height: '80px',
          minWidth: '80px',
          minHeight: '80px',
        };
      case 'text':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          border: selected ? '1px dashed #3b82f6' : 'none',
          minWidth: 'auto',
          minHeight: 'auto',
          padding: '4px',
        };
      default: // rectangle
        return {
          ...baseStyle,
          backgroundColor: color,
          borderRadius: '8px',
          padding: '12px',
        };
    }
  };

  const renderTriangle = () => (
    <div style={{ position: 'relative', width: '80px', height: '80px' }}>
      <div
        style={{
          width: '0',
          height: '0',
          borderLeft: '40px solid transparent',
          borderRight: '40px solid transparent',
          borderBottom: `70px solid ${color}`,
          position: 'absolute',
          top: '5px',
          left: '0',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -30%)',
          color: textColor,
          fontSize: `${fontSize}px`,
          fontFamily,
          fontWeight: 500,
          textAlign: 'center',
          width: '60px',
          lineHeight: '1.2',
        }}
      >
        {label}
      </div>
    </div>
  );

  const renderDiamondContent = () => (
    <div
      style={{
        transform: 'rotate(-45deg)',
        textAlign: 'center',
        width: '100px',
        lineHeight: '1.2',
      }}
    >
      {label}
    </div>
  );

  return (
    <div className="custom-node">
      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555' }}
      />

      {/* Node Content */}
      <div style={getShapeStyles()}>
        {shape === 'triangle' ? renderTriangle() : 
         shape === 'diamond' ? renderDiamondContent() : 
         label}
      </div>
    </div>
  );
});