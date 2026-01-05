import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface FeedbackFilterBarProps {
  statusFilter: string;
  onStatusChange: (value: string) => void;
  onCreateReview: () => void;
}

export const FeedbackFilterBar = ({
  statusFilter,
  onStatusChange,
  onCreateReview
}: FeedbackFilterBarProps) => {
  return (
    <div className="flex items-center justify-between">
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Alle Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Status</SelectItem>
          <SelectItem value="pending">Offen</SelectItem>
          <SelectItem value="in_progress">In Bearbeitung</SelectItem>
          <SelectItem value="overdue">Überfällig</SelectItem>
          <SelectItem value="completed">Abgeschlossen</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={onCreateReview} className="gap-2">
        <Plus className="h-4 w-4" />
        Review erstellen
      </Button>
    </div>
  );
};
