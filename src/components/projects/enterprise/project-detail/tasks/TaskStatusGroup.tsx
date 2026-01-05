
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "./TaskCard";

interface TaskStatusGroupProps {
  title: string;
  count: number;
  tasks: any[];
}

export const TaskStatusGroup = ({ title, count, tasks }: TaskStatusGroupProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="font-medium text-gray-700">{title}</h3>
        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
          {count}
        </Badge>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};
