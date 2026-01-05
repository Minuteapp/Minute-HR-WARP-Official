import KanbanColumn from './KanbanColumn';

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

interface KanbanBoardProps {
  tasks: KanbanTask[];
}

const KanbanBoard = ({ tasks }: KanbanBoardProps) => {
  const columns = [
    { id: 'todo', label: 'Zu erledigen', tasks: tasks.filter(t => t.status === 'todo') },
    { id: 'in_progress', label: 'In Arbeit', tasks: tasks.filter(t => t.status === 'in_progress') },
    { id: 'blocked', label: 'Blockiert', tasks: tasks.filter(t => t.status === 'blocked') },
    { id: 'completed', label: 'Abgeschlossen', tasks: tasks.filter(t => t.status === 'completed') }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          status={column.id as KanbanTask['status']}
          label={column.label}
          tasks={column.tasks}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;
