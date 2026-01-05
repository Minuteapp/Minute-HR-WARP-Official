import React, { useState, useCallback } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Target, 
  Users, 
  User, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlignmentTreeNode } from '@/types/goals-enhanced';
import { cn } from '@/lib/utils';

interface AlignmentTreeViewProps {
  nodes: AlignmentTreeNode[];
  selectedNode?: string | null;
  onNodeSelect?: (nodeId: string) => void;
  onAlign?: (goalId: string, parentGoalId: string) => void;
}

interface TreeNodeProps {
  node: AlignmentTreeNode;
  depth: number;
  selectedNode?: string | null;
  onNodeSelect?: (nodeId: string) => void;
  onAlign?: (goalId: string, parentGoalId: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ 
  node, 
  depth, 
  selectedNode, 
  onNodeSelect,
  onAlign 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  // Simplified drag and drop handling - could be enhanced with useDragAndDrop hook
  const [isOver, setIsOver] = useState(false);

  const getNodeIcon = (level: string) => {
    switch (level) {
      case 'company':
        return <Target className="h-4 w-4" />;
      case 'team':
        return <Users className="h-4 w-4" />;
      case 'individual':
        return <User className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (progress: number, isAtRisk: boolean, confidenceLevel: number) => {
    if (progress >= 100) {
      return <CheckCircle className="h-4 w-4 text-success" />;
    }
    if (isAtRisk || confidenceLevel < 0.3) {
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
    if (progress >= 70) {
      return <TrendingUp className="h-4 w-4 text-success" />;
    }
    return <TrendingUp className="h-4 w-4 text-warning" />;
  };

  const getProgressColor = (progress: number, isAtRisk: boolean) => {
    if (isAtRisk) return 'bg-destructive';
    if (progress >= 70) return 'bg-success';
    if (progress >= 40) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className={cn("relative", depth > 0 && "ml-6")}>
      {/* Connecting Lines */}
      {depth > 0 && (
        <>
          <div className="absolute -left-3 top-0 bottom-0 w-px bg-border" />
          <div className="absolute -left-3 top-6 w-3 h-px bg-border" />
        </>
      )}

      {/* Node Card */}
      <Card 
        className={cn(
          "mb-3 transition-all duration-200 cursor-pointer",
          selectedNode === node.id && "ring-2 ring-primary",
          isOver && "bg-primary/5 border-primary",
          node.is_at_risk && "border-destructive/50"
        )}
        onClick={() => onNodeSelect?.(node.id)}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {/* Expand/Collapse Button */}
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="p-1 h-6 w-6"
                >
                  {isExpanded ? 
                    <ChevronDown className="h-3 w-3" /> : 
                    <ChevronRight className="h-3 w-3" />
                  }
                </Button>
              )}

              {/* Node Icon and Title */}
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  node.goal_level === 'company' && "bg-primary/10 text-primary",
                  node.goal_level === 'team' && "bg-secondary/10 text-secondary-foreground",
                  node.goal_level === 'individual' && "bg-muted text-muted-foreground"
                )}>
                  {getNodeIcon(node.goal_level)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{node.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {node.goal_level === 'company' ? 'Unternehmen' :
                       node.goal_level === 'team' ? 'Team' : 'Individuell'}
                    </Badge>
                    {hasChildren && (
                      <span className="text-xs text-muted-foreground">
                        {node.children.length} Unterziele
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress and Status */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-1">
                  {getStatusIcon(node.progress, node.is_at_risk, node.confidence_level)}
                  <span className="text-sm font-medium">{node.progress}%</span>
                </div>
                <div className="w-24 mt-1">
                  <Progress 
                    value={node.progress} 
                    className="h-2"
                  />
                </div>
              </div>
              
              <div className="text-right text-xs text-muted-foreground">
                <div>Vertrauen:</div>
                <div className="font-medium">
                  {Math.round(node.confidence_level * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* Risk Warning */}
          {node.is_at_risk && (
            <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span>Dieses Ziel ist gefährdet</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="relative">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedNode={selectedNode}
              onNodeSelect={onNodeSelect}
              onAlign={onAlign}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const AlignmentTreeView: React.FC<AlignmentTreeViewProps> = ({
  nodes,
  selectedNode,
  onNodeSelect,
  onAlign
}) => {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-center">
        <div>
          <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Keine Ziele in der Hierarchie gefunden
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          depth={0}
          selectedNode={selectedNode}
          onNodeSelect={onNodeSelect}
          onAlign={onAlign}
        />
      ))}
    </div>
  );
};