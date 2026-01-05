
import { Button } from "@/components/ui/button";
import { FileText, Edit } from "lucide-react";
import { BusinessTripReport } from "@/types/business-travel";

interface ReportHeaderProps {
  report: BusinessTripReport | null;
  canEdit: boolean;
  onEdit: () => void;
}

const ReportHeader = ({ report, canEdit, onEdit }: ReportHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold">Reisebericht</h3>
      </div>
      {canEdit && report && (
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Bearbeiten
        </Button>
      )}
    </div>
  );
};

export default ReportHeader;
