import { Badge } from '@/components/ui/badge';
import { Circle, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import KanbanTaskCard from './KanbanTaskCard';

interface KanbanTask {
  id: string;
  taskId: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'blocked' | 'completed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  projectName: string;
  assignee: string;
  dueDate: Date;
  storyPoints: number;
}

interface KanbanColumnProps {
  status: KanbanTask['status'];
  label: string;
  tasks: KanbanTask[];
}

const KanbanColumn = ({ status, label, tasks }: KanbanColumnProps) => {
  const statusConfig = {
    'todo': { icon: Circle, iconColor: 'text-gray-400' },
    'in_progress': { icon: Clock, iconColor: 'text-blue-500' },
    'blocked': { icon: AlertCircle, iconColor: 'text-orange-500' },
    'completed': { icon: CheckCircle, iconColor: 'text-green-500' }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-3">
        <StatusIcon className={`h-4 w-4 ${config.iconColor}`} />
        <span className="font-medium text-sm">{label}</span>
        <Badge variant="secondary" className="rounded-full text-xs">
          {tasks.length}
        </Badge>
      </div>
      
      <div className="space-y-3 min-h-[200px]">
        {tasks.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            Keine Aufgaben
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanTaskCard key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
