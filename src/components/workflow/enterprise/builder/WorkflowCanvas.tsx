import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowDown } from 'lucide-react';
import { CanvasNode } from './CanvasNode';
import type { WorkflowNode } from '../tabs/BuilderTab';

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onAddNode: (node: Omit<WorkflowNode, 'id'>) => void;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  onAddNode,
}) => {
  const handleAddEmptyNode = () => {
    onAddNode({
      type: 'action',
      label: 'Neue Aktion',
      icon: 'action',
      config: {},
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Canvas</CardTitle>
        <CardDescription className="text-xs">Visueller Workflow-Designer</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="min-h-[500px] border-2 border-dashed rounded-lg p-6 bg-muted/20">
          {nodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-2">Keine Bausteine vorhanden</p>
              <p className="text-sm text-muted-foreground mb-4">
                Fügen Sie Bausteine aus der linken Palette hinzu
              </p>
              <Button variant="outline" onClick={handleAddEmptyNode}>
                <Plus className="h-4 w-4 mr-2" />
                Baustein hinzufügen
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {nodes.map((node, index) => (
                <React.Fragment key={node.id}>
                  <CanvasNode
                    node={node}
                    isSelected={selectedNodeId === node.id}
                    onClick={() => onSelectNode(node.id)}
                  />
                  {index < nodes.length - 1 && (
                    <div className="flex flex-col items-center">
                      <div className="h-6 w-px bg-border" />
                      <ArrowDown className="h-4 w-4 text-muted-foreground" />
                      <div className="h-6 w-px bg-border" />
                    </div>
                  )}
                </React.Fragment>
              ))}
              
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddEmptyNode}
                  className="border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Baustein hinzufügen
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
