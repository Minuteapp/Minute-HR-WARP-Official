
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface ReportEmptyStateProps {
  canEdit: boolean;
  onCreateReport: () => void;
}

const ReportEmptyState = ({ canEdit, onCreateReport }: ReportEmptyStateProps) => {
  return (
    <div className="text-center py-8">
      <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <h4 className="text-lg font-medium text-gray-900 mb-2">Kein Reisebericht vorhanden</h4>
      <p className="text-gray-500 mb-4">
        {canEdit 
          ? "Erstellen Sie einen Reisebericht für diese abgeschlossene Geschäftsreise."
          : "Für diese Geschäftsreise wurde noch kein Reisebericht erstellt."
        }
      </p>
      {canEdit && (
        <Button onClick={onCreateReport}>
          Reisebericht erstellen
        </Button>
      )}
    </div>
  );
};

export default ReportEmptyState;
