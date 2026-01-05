import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface KanbanTaskCardProps {
  task: KanbanTask;
}

const KanbanTaskCard = ({ task }: KanbanTaskCardProps) => {
  const priorityConfig = {
    'critical': 'bg-red-500 text-white',
    'high': 'bg-red-100 text-red-600 border border-red-200',
    'medium': 'bg-blue-100 text-blue-600 border border-blue-200',
    'low': 'bg-gray-100 text-gray-600 border border-gray-200'
  };

  const priorityLabels = {
    'critical': 'Kritisch',
    'high': 'Hoch',
    'medium': 'Mittel',
    'low': 'Niedrig'
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
          <Badge className={`text-xs shrink-0 ${priorityConfig[task.priority]}`}>
            {priorityLabels[task.priority]}
          </Badge>
        </div>
        
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {task.description}
          </p>
        )}
        
        <Badge variant="outline" className="text-xs mb-3">
          {task.projectName}
        </Badge>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{task.assignee}</span>
          <span>{task.storyPoints} SP</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default KanbanTaskCard;
