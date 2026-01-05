import React, { useState, memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, MoreHorizontal } from 'lucide-react';
import { ContainerToolbar } from './ContainerToolbar';
import { ContainerDetailDialog } from './ContainerDetailDialog';
import { RoadmapContainer } from '@/hooks/roadmap/useRoadmapPlanning';

interface ContainerNodeData {
  container: RoadmapContainer;
  onUpdate: (updates: Partial<RoadmapContainer>) => void;
  subContainers?: any[];
}

export const EnhancedVisualContainer = memo(({ 
  data, 
  selected 
}: NodeProps) => {
  const { container, onUpdate, subContainers = [] } = (data as unknown) as ContainerNodeData;
  const [showToolbar, setShowToolbar] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const handleToolbarAction = (action: string, value?: any) => {
    switch (action) {
      case 'fontSize':
        onUpdate({ font_size: value });
        break;
      case 'color':
        // Color picker would open here
        break;
      case 'toggleSubContainers':
        onUpdate({ sub_containers_visible: !container.sub_containers_visible });
        break;
      case 'addSubContainer':
        onUpdate({ has_sub_containers: true });
        setShowDetailDialog(true);
        break;
      case 'settings':
        setShowDetailDialog(true);
        break;
      case 'addTask':
      case 'addTeamMember':
      case 'addComment':
      case 'setDeadline':
      case 'setEstimate':
      case 'addTags':
        setShowDetailDialog(true);
        break;
      default:
        break;
    }
  };

  const visibleSubContainers = container.sub_containers_visible 
    ? subContainers 
    : [];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'done': return 'border-green-500 bg-green-50';
      case 'in_progress': return 'border-blue-500 bg-blue-50';
      case 'blocked': return 'border-red-500 bg-red-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  return (
    <>
      <div
        className="relative group"
        onMouseEnter={() => setShowToolbar(true)}
        onMouseLeave={() => setShowToolbar(false)}
      >
        {/* Toolbar */}
        {(showToolbar || selected) && (
          <div className="absolute -top-14 left-0 right-0 z-10">
            <ContainerToolbar
              onAction={handleToolbarAction}
              fontSize={container.font_size}
              isSubContainersVisible={container.sub_containers_visible}
            />
          </div>
        )}

        {/* Main Container */}
        <Card 
          className={`min-w-[280px] cursor-pointer transition-all duration-200 ${
            selected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
          } ${getStatusColor(container.status)}`}
          style={{ 
            borderColor: container.color || '#3B82F6',
            borderWidth: '2px'
          }}
          onClick={() => setShowDetailDialog(true)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: container.color || '#3B82F6' }}
                />
                <h3 
                  className="font-semibold"
                  style={{ 
                    fontSize: `${container.font_size || 14}px`,
                    color: container.color || '#3B82F6'
                  }}
                >
                  {container.title}
                </h3>
              </div>
              
              <div className="flex items-center gap-1">
                {container.status && (
                  <Badge variant="outline" className="text-xs">
                    {container.status === 'done' ? 'Fertig' : 
                     container.status === 'in_progress' ? 'In Arbeit' :
                     container.status === 'blocked' ? 'Blockiert' : 'Geplant'}
                  </Badge>
                )}
                
                {container.progress !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    {container.progress}%
                  </Badge>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetailDialog(true);
                  }}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {container.description && (
              <p className="text-sm text-muted-foreground mt-2">
                {container.description}
              </p>
            )}
          </CardHeader>

          <CardContent className="pt-0">
            {/* Progress Bar */}
            {container.progress !== undefined && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Fortschritt</span>
                  <span>{container.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${container.progress}%`,
                      backgroundColor: container.color || '#3B82F6'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Tags */}
            {container.tags && container.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {container.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {container.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{container.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Sub-Containers */}
            {container.has_sub_containers && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Sub-Container ({subContainers.length})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToolbarAction('toggleSubContainers');
                    }}
                    className="h-4 w-4 p-0"
                  >
                    {container.sub_containers_visible ? 
                      <EyeOff className="h-3 w-3" /> : 
                      <Eye className="h-3 w-3" />
                    }
                  </Button>
                </div>
                
                {visibleSubContainers.map((subContainer, index) => (
                  <div 
                    key={index}
                    className="p-2 bg-muted rounded text-xs border-l-2"
                    style={{ borderLeftColor: container.color || '#3B82F6' }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{subContainer.title}</span>
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ 
                          borderColor: subContainer.status === 'done' ? '#10B981' : '#6B7280' 
                        }}
                      >
                        {subContainer.status === 'done' ? '✓' : '○'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Deadline */}
            {container.due_date && (
              <div className="mt-3 text-xs text-muted-foreground">
                Deadline: {new Date(container.due_date).toLocaleDateString('de-DE')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connection Handles */}
        <Handle
          type="target"
          position={Position.Left}
          style={{ 
            background: container.color || '#3B82F6',
            width: 8,
            height: 8
          }}
        />
        <Handle
          type="source"
          position={Position.Right}
          style={{ 
            background: container.color || '#3B82F6',
            width: 8,
            height: 8
          }}
        />
        <Handle
          type="target"
          position={Position.Top}
          style={{ 
            background: container.color || '#3B82F6',
            width: 8,
            height: 8
          }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ 
            background: container.color || '#3B82F6',
            width: 8,
            height: 8
          }}
        />
      </div>

      <ContainerDetailDialog
        container={container}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        onUpdateContainer={onUpdate}
      />
    </>
  );
});

EnhancedVisualContainer.displayName = 'EnhancedVisualContainer';