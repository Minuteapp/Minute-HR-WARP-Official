import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  ChevronRight,
  Check,
  AlertTriangle,
  User,
  Clock,
  DollarSign,
  Leaf,
  Calendar,
  Zap,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { WBSItem } from '@/utils/wbsUtils';
import { format } from 'date-fns';

interface WBSTreeItemProps {
  item: WBSItem;
  type: 'epic' | 'task' | 'subtask';
  level: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: (item: WBSItem) => void;
  onDelete: (itemId: string) => void;
}

export const WBSTreeItem = ({
  item,
  type,
  level,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete
}: WBSTreeItemProps) => {
  const getBorderColor = () => {
    return type === 'epic' ? 'border-purple-500' : 'border-blue-500';
  };

  const getStatusColor = () => {
    switch (item.status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'in_progress':
        return 'bg-blue-500 text-white';
      case 'not_started':
        return 'bg-gray-300 text-gray-600';
      case 'blocked':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-300 text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (item.status) {
      case 'completed':
        return <Check className="h-3 w-3" />;
      case 'blocked':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getTypeBadge = () => {
    switch (type) {
      case 'epic':
        return 'Epic';
      case 'task':
        return 'Task';
      case 'subtask':
        return 'Subtask';
    }
  };

  const indentClass = level === 1 ? 'ml-12' : level === 2 ? 'ml-24' : '';

  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors
        border-l-4 ${getBorderColor()} ${indentClass}
      `}
    >
      {/* Left Section - Expand/Status/Title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Expand/Collapse Button */}
        {item.hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={onToggleExpand}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="w-6 h-6 flex-shrink-0" />
        )}

        {/* Status Icon */}
        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${getStatusColor()}`}>
          {getStatusIcon()}
        </div>

        {/* Title and Badges */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="font-medium truncate">{item.title}</span>
          <Badge variant="outline" className="text-xs flex-shrink-0">
            {getTypeBadge()}
          </Badge>
          {item.assignedTo && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
              <User className="h-3 w-3" />
              <span className="truncate">{item.assignedTo}</span>
            </div>
          )}
        </div>
      </div>

      {/* Middle Section - Meta Data */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-shrink-0">
        {/* Time */}
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{item.hoursSpent}h / {item.hoursPlanned}h</span>
        </div>

        {/* Cost */}
        <div className="flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          <span>€{item.costSpent}k / €{item.costPlanned}k</span>
        </div>

        {/* CO2 */}
        <div className="flex items-center gap-1">
          <Leaf className="h-3 w-3" />
          <span>{item.co2Impact}t CO₂</span>
        </div>

        {/* Due Date */}
        {item.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Fällig: {format(new Date(item.dueDate), 'yyyy-MM-dd')}</span>
          </div>
        )}
      </div>

      {/* Right Section - Progress & Actions */}
      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Progress Bar */}
        <div className="w-32">
          <Progress value={item.progress} className="h-2" />
        </div>

        {/* Progress Percentage */}
        <span className="text-sm font-medium w-12 text-right">
          {item.progress}%
        </span>

        {/* RACI Link */}
        <Button variant="outline" size="sm" className="gap-1">
          <Zap className="h-3 w-3" />
          RACI ({item.raciCount})
        </Button>

        {/* Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Edit className="h-4 w-4 mr-2" />
              Bearbeiten
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(item.id)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Löschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
