
import { Button } from "@/components/ui/button";

interface TaskFormPriorityProps {
  priority: "low" | "medium" | "high";
  onPriorityChange: (value: "low" | "medium" | "high") => void;
}

export const TaskFormPriority = ({
  priority,
  onPriorityChange,
}: TaskFormPriorityProps) => {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={priority === "low" ? "default" : "outline"}
          onClick={() => onPriorityChange("low")}
          className={priority === "low" ? "bg-green-500 hover:bg-green-600" : ""}
        >
          Niedrig
        </Button>
        <Button
          type="button"
          variant={priority === "medium" ? "default" : "outline"}
          onClick={() => onPriorityChange("medium")}
          className={priority === "medium" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
        >
          Mittel
        </Button>
        <Button
          type="button"
          variant={priority === "high" ? "default" : "outline"}
          onClick={() => onPriorityChange("high")}
          className={priority === "high" ? "bg-red-500 hover:bg-red-600" : ""}
        >
          Hoch
        </Button>
      </div>
    </div>
  );
};
