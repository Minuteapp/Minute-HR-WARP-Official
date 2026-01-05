import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Circle, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface TaskListItem {
  id: string;
  taskId: string;
  title: string;
  projectName: string;
  status: 'todo' | 'in_progress' | 'blocked' | 'completed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignee: string;
  dueDate: Date;
  storyPoints: number;
}

interface TaskListRowProps {
  task: TaskListItem;
}

const TaskListRow = ({ task }: TaskListRowProps) => {
  const statusConfig = {
    'todo': { 
      icon: Circle, 
      iconColor: 'text-gray-400',
      label: 'Zu erledigen',
      badgeClass: 'bg-gray-100 text-gray-600 border-gray-200'
    },
    'in_progress': { 
      icon: Clock, 
      iconColor: 'text-blue-500',
      label: 'In Arbeit',
      badgeClass: 'bg-blue-100 text-blue-600 border-blue-200'
    },
    'blocked': { 
      icon: AlertCircle, 
      iconColor: 'text-orange-500',
      label: 'Blockiert',
      badgeClass: 'bg-red-100 text-red-600 border-red-200'
    },
    'completed': { 
      icon: CheckCircle, 
      iconColor: 'text-green-500',
      label: 'Abgeschlossen',
      badgeClass: 'bg-green-100 text-green-600 border-green-200'
    }
  };

  const priorityConfig = {
    'critical': { label: 'Kritisch', badgeClass: 'bg-red-500 text-white' },
    'high': { label: 'Hoch', badgeClass: 'bg-orange-100 text-orange-600 border-orange-200' },
    'medium': { label: 'Mittel', badgeClass: 'bg-blue-100 text-blue-600 border-blue-200' },
    'low': { label: 'Niedrig', badgeClass: 'bg-gray-100 text-gray-600 border-gray-200' }
  };

  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];
  const StatusIcon = status.icon;

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <div className="flex items-center gap-3">
          <StatusIcon className={`h-4 w-4 ${status.iconColor}`} />
          <div>
            <p className="font-medium">{task.title}</p>
            <p className="text-xs text-muted-foreground">{task.taskId}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {task.projectName}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={`text-xs rounded-full ${status.badgeClass}`}>
          {status.label}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={`text-xs ${priority.badgeClass}`}>
          {priority.label}
        </Badge>
      </TableCell>
      <TableCell className="text-sm">{task.assignee}</TableCell>
      <TableCell className="text-sm">
        {format(task.dueDate, 'd. MMM yyyy', { locale: de })}
      </TableCell>
      <TableCell className="text-right text-sm">{task.storyPoints}</TableCell>
    </TableRow>
  );
};

export default TaskListRow;
