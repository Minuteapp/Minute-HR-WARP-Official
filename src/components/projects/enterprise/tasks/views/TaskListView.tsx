import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TaskListRow from './TaskListRow';

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

interface TaskListViewProps {
  tasks: TaskListItem[];
}

const TaskListView = ({ tasks }: TaskListViewProps) => {
  if (tasks.length === 0) {
    return (
      <div className="border border-border rounded-lg p-8 text-center text-muted-foreground">
        <p>Keine Aufgaben vorhanden</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Aufgabe</TableHead>
            <TableHead>Projekt</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priorität</TableHead>
            <TableHead>Zugewiesen</TableHead>
            <TableHead>Fällig</TableHead>
            <TableHead className="text-right">SP</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TaskListRow key={task.id} task={task} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TaskListView;
