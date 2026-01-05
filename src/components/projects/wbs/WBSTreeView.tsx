import { WBSEpic, WBSItem } from '@/utils/wbsUtils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, MoreHorizontal } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface WBSTreeViewProps {
  epics: WBSEpic[];
  expandedItems: Set<string>;
  onToggleExpand: (itemId: string) => void;
  onEdit: (item: WBSItem) => void;
  onDelete: (itemId: string) => void;
}

const getBadgeForType = (type: 'epic' | 'task' | 'subtask') => {
  switch (type) {
    case 'epic':
      return <Badge className="bg-purple-100 text-purple-700 text-xs hover:bg-purple-100">Epic</Badge>;
    case 'task':
      return <Badge className="bg-blue-100 text-blue-700 text-xs hover:bg-blue-100">Task</Badge>;
    case 'subtask':
      return <Badge variant="secondary" className="text-xs">Sub</Badge>;
  }
};

const getProgressColor = (progress: number) => {
  if (progress >= 100) return '[&>div]:bg-green-500';
  if (progress >= 50) return '[&>div]:bg-blue-500';
  if (progress >= 25) return '[&>div]:bg-yellow-500';
  return '[&>div]:bg-orange-500';
};

export const WBSTreeView = ({
  epics,
  expandedItems,
  onToggleExpand,
  onEdit,
  onDelete
}: WBSTreeViewProps) => {
  const renderItem = (
    item: WBSItem, 
    type: 'epic' | 'task' | 'subtask', 
    level: number,
    hasChildren: boolean
  ) => {
    const isExpanded = expandedItems.has(item.id);
    const paddingLeft = level * 24;

    return (
      <div 
        key={item.id}
        className="flex items-center gap-3 py-2 px-3 hover:bg-muted/50 rounded-md transition-colors border-b last:border-0"
        style={{ paddingLeft: `${paddingLeft + 12}px` }}
      >
        {/* Expand/Collapse or Spacer */}
        {hasChildren ? (
          <button
            onClick={() => onToggleExpand(item.id)}
            className="p-0.5 hover:bg-muted rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}

        {/* Checkbox */}
        <Checkbox className="h-4 w-4" />

        {/* Type Badge */}
        {getBadgeForType(type)}

        {/* Name */}
        <span className="font-medium text-sm flex-1 truncate">{item.title}</span>

        {/* Hours */}
        <div className="text-xs text-muted-foreground w-24 text-right">
          <span className="font-medium text-foreground">{item.hoursSpent}</span>
          <span className="text-muted-foreground">/{item.hoursPlanned}h</span>
        </div>

        {/* Budget */}
        <div className="text-xs text-muted-foreground w-28 text-right">
          <span className="font-medium text-foreground">€{(item.costSpent / 1000).toFixed(1)}K</span>
          <span className="text-muted-foreground">/€{(item.costPlanned / 1000).toFixed(1)}K</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 w-32">
          <Progress value={item.progress} className={`h-2 flex-1 ${getProgressColor(item.progress)}`} />
          <span className="text-xs font-medium w-8">{item.progress}%</span>
        </div>

        {/* Actions */}
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center gap-3 py-2 px-3 bg-muted/50 rounded-t-md text-xs font-medium text-muted-foreground border-b">
        <div className="w-5" />
        <div className="w-4" />
        <div className="w-14">Typ</div>
        <div className="flex-1">Name</div>
        <div className="w-24 text-right">Stunden</div>
        <div className="w-28 text-right">Budget</div>
        <div className="w-32">Fortschritt</div>
        <div className="w-7" />
      </div>

      {epics.map(epic => (
        <div key={epic.id}>
          {/* Epic Item */}
          {renderItem(epic, 'epic', 0, !!(epic.tasks && epic.tasks.length > 0))}
          
          {/* Tasks (wenn Epic erweitert) */}
          {expandedItems.has(epic.id) && epic.tasks?.map(task => (
            <div key={task.id}>
              {renderItem(task, 'task', 1, !!(task.subtasks && task.subtasks.length > 0))}
              
              {/* Subtasks (wenn Task erweitert) */}
              {expandedItems.has(task.id) && task.subtasks?.map(subtask => (
                renderItem(subtask, 'subtask', 2, false)
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};