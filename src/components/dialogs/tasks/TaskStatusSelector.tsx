
import { Button } from "@/components/ui/button";
import { TASK_STATUSES } from "@/types/project";

interface TaskStatusSelectorProps {
  status: "todo" | "in-progress" | "review" | "blocked" | "done" | "archived";
  onStatusChange: (status: "todo" | "in-progress" | "review" | "blocked" | "done" | "archived") => void;
}

export const TaskStatusSelector = ({ status, onStatusChange }: TaskStatusSelectorProps) => {
  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">Status</label>
      <div className="flex flex-col gap-2">
        {TASK_STATUSES.map((statusOption) => (
          <Button
            key={statusOption.id}
            type="button"
            variant={status === statusOption.name ? "default" : "outline"}
            onClick={() => onStatusChange(statusOption.name as any)}
            className="border-[#9b87f5] w-full"
          >
            {statusOption.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
