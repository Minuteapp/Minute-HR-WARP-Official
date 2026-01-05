import { Button } from "@/components/ui/button";

interface GoalDetailFooterProps {
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export const GoalDetailFooter = ({ onEdit, onArchive, onDelete }: GoalDetailFooterProps) => {
  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <div className="flex gap-2">
        <Button onClick={onEdit}>
          Bearbeiten
        </Button>
        <Button variant="outline" onClick={onArchive}>
          Archivieren
        </Button>
      </div>
      <Button variant="destructive" onClick={onDelete}>
        Löschen
      </Button>
    </div>
  );
};
